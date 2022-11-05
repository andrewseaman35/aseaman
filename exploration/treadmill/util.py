from datetime import datetime
import math
import os

import cv2
import exifread
import numpy as np
from scipy import ndimage


APPROX_BACKGROUND_COLOR = "#89BDF7"

DEFAULT_COLOR_DISTANCE = 75
COLOR_DOWN_DISTANCE = 70
COLOR_UP_DISTANCE = 20

EXPECTED_ASPECT_RATIO = 1.55
ASPECT_RATIO_ALLOWANCE = 0.05  # +/- 5%

OUTPUT_HEIGHT = 1500
OUTPUT_WIDTH = 2325


def read_image_timestamp(filepath):
    with open(filepath, "rb") as fh:
        tags = exifread.process_file(fh, stop_tag="EXIF DateTimeOriginal")
        dateTaken = tags["EXIF DateTimeOriginal"]
        return datetime.strptime(str(dateTaken), "%Y:%m:%d %H:%M:%S")


def read_image_file(filepath):
    if not os.path.exists(filepath):
        raise Exception(f"filepath {filepath} does not exist")

    img = cv2.imread(filepath)

    return img


def rectangles_overlap(bounding_rect_1, bounding_rect_2):
    x1, y1, w1, h1 = bounding_rect_1
    x2, y2, w2, h2 = bounding_rect_2
    return not (x1 + w1 < x2 or x2 + w2 < x1 or y1 + h1 < y2 or y2 + h2 < y1)


def rectangle_overlaps_with_any(rect, list_of_rects):
    for other_rect in list_of_rects:
        if rectangles_overlap(rect, other_rect):
            return True

    return False


def any_rectangles_overlap(list_of_rects_1, list_of_rects_2):
    for rect in list_of_rects_1:
        if rectangle_overlaps_with_any(rect, list_of_rects_2):
            return True

    return False


def rectangles_share_vertical(bounding_rect_1, bounding_rect_2):
    x1, _, w1, _ = bounding_rect_1
    x2, _, w2, _ = bounding_rect_2
    return not (x1 + w1 < x2 or x2 + w2 < x1)


def rectangle_shares_vertical_with_any(rect, list_of_rects):
    for other_rect in list_of_rects:
        if rectangles_share_vertical(rect, other_rect):
            return True

    return False


def any_rectangles_share_vertical(list_of_rects_1, list_of_rects_2):
    for rect in list_of_rects_1:
        if rectangle_shares_vertical_with_any(rect, list_of_rects_2):
            return True

    return False


def calculate_color_range(
    hex_color, down_distance=DEFAULT_COLOR_DISTANCE, up_distance=DEFAULT_COLOR_DISTANCE
):
    if hex_color[0] == "#":
        hex_color = hex_color[1:]
    dec_r = int(f"0x{hex_color[:2]}", 16)
    dec_g = int(f"0x{hex_color[2:4]}", 16)
    dec_b = int(f"0x{hex_color[4:6]}", 16)
    low_color = np.array(
        [
            max(dec_r - down_distance, 0),
            max(dec_g - down_distance, 0),
            max(dec_b - down_distance, 0),
        ]
    )
    high_color = np.array(
        [
            min(dec_r + up_distance, 255),
            min(dec_g + up_distance, 255),
            min(dec_b + up_distance, 255),
        ]
    )

    return (low_color, high_color)


def generate_mask_for_color_range(image, lower_color, upper_color):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, lower_color, upper_color)
    kernel = np.ones((200, 200), np.uint8)
    closed_mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return closed_mask


def rotate_image_based_on_mask(image, mask, rotate_scheme="max"):
    # Close the mask, find the edges, and identify lines
    closed_edges = cv2.Canny(mask, 100, 200, apertureSize=3)
    closed_lines = cv2.HoughLines(closed_edges, 0.5, np.pi / 180, 200)

    line_length = 10000
    slopes = []
    for line in closed_lines:
        rho, theta = line[0]
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho
        x1 = int(x0 + line_length * (-b))
        y1 = int(y0 + line_length * (a))
        x2 = int(x0 - line_length * (-b))
        y2 = int(y0 - line_length * (a))
        slope_numerator = y2 - y1
        slope_denominator = x2 - x1

        # skip vertical lines
        if slope_denominator == 0:
            continue

        slope = slope_numerator / slope_denominator

        # If the line is more horizontal than vertical and non actuall horizontal
        if abs(slope) <= 1 and slope != 0:
            slopes.append(slope)

    if rotate_scheme == "average":
        active_slope = sum(slopes) / len(slopes)
    elif rotate_scheme == "max":
        active_slope = max(slopes)
    elif rotate_scheme == "min":
        active_slope = min(slopes)

    rotate_radians = math.atan(active_slope)
    rotate_angle = -math.degrees(math.atan(active_slope))
    print(f"Using {rotate_scheme} slope: {active_slope}")
    print(f"Rotate radians: {rotate_radians}")
    print(f"Rotate angle: {rotate_angle}")
    img_rotated = ndimage.rotate(image, -rotate_angle)

    return img_rotated


def crop_image(image, x, y, w, h):
    return image[y : (y + h), x : (x + w)]


def extract_and_normalize_screen(image):
    # Find the lower and upper color bounds
    lower_color, upper_color = calculate_color_range(
        APPROX_BACKGROUND_COLOR, COLOR_DOWN_DISTANCE, COLOR_UP_DISTANCE
    )

    # Make a mask using the color bounds
    pre_rotation_mask = generate_mask_for_color_range(image, lower_color, upper_color)

    # Rotate the image based on the mask
    rotated_image = rotate_image_based_on_mask(image, pre_rotation_mask)

    # Make a new mask for the rotated image
    rotated_mask = generate_mask_for_color_range(
        rotated_image, lower_color, upper_color
    )
    edges = cv2.Canny(rotated_mask, 30, 200)

    # Find bounding box for mask and crop
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bb_x, bb_y, bb_w, bb_h = cv2.boundingRect(contours[0])
    cropped_image = crop_image(rotated_image, bb_x, bb_y, bb_w, bb_h)

    cropped_height, cropped_width, _ = cropped_image.shape
    aspect_ratio = cropped_width / cropped_height
    assert aspect_ratio >= EXPECTED_ASPECT_RATIO * (1 - ASPECT_RATIO_ALLOWANCE)
    assert aspect_ratio <= EXPECTED_ASPECT_RATIO * (1 + ASPECT_RATIO_ALLOWANCE)

    resized_image = cv2.resize(cropped_image, (OUTPUT_WIDTH, OUTPUT_HEIGHT))
    return resized_image
