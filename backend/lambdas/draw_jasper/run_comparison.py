import math

import cv2
import os
import numpy as np

def resize_with_aspect_ratio(image, width=None, height=None, inter=cv2.INTER_AREA):
    dim = None
    (h, w) = image.shape[:2]

    if width is None and height is None:
        return image
    if width is None:
        r = height / float(h)
        dim = (int(w * r), height)
    else:
        r = width / float(w)
        dim = (width, int(h * r))

    return cv2.resize(image, dim, interpolation=inter)

def crop_to_content(img, invert=True):
    """
    Crops image to fit content
    """
    inverted_image = cv2.bitwise_not(img) if invert else img  # invert image -- black background (zeroes)
    coords = cv2.findNonZero(inverted_image)  # find coordinates of all non-zero values
    x, y, w, h = cv2.boundingRect(coords)  # find bounding box of non-zero coordinates
    return img[y:y+h, x:x+w]  # return image, cropped

def resize_to_match(image_to_resize, image_to_match, inter=cv2.INTER_AREA):
    (h, w) = image_to_match.shape[:2]
    return cv2.resize(image_to_resize, (w, h), interpolation=inter)

def convert_to_black_and_white(img):
    """
    """
    inverted = cv2.bitwise_not(img)  # invert image
    return_val, thresholded = cv2.threshold(
        inverted, 1, 255, cv2.THRESH_BINARY_INV)  # apply threshold
    return cv2.bitwise_not(thresholded)

def fillOutline(img):
    x,y,w,h = cv2.boundingRect(img)
    cv2.floodFill(img, None, (int(x + w / 2), int(y + h / 2)), 255)
    return img

def getShapesForComparison(theirs, ours):
    # Crop both to content
    cropped_their_drawing = crop_to_content(theirs)
    cropped_our_outline = crop_to_content(ours, invert=False)
    # Match their drawing size to ours
    # (this has to be before converting to black and white, I think there are interpolation issues)
    height = cropped_their_drawing.shape[:2][0]
    sized_our_drawing = resize_with_aspect_ratio(cropped_our_outline, height)
    # sized_our_drawing = resize_to_match(cropped_our_outline, cropped_their_drawing)
    sized_their_drawing = cropped_their_drawing

    # Make their drawing black and white
    # their_drawing_bw = convert_to_black_and_white(sized_their_drawing)
    # their_filled = fillOutline(their_drawing_bw)

    return (sized_their_drawing, sized_our_drawing)

def compare_outlines(their_file, our_file):
    their_drawing = cv2.imread(their_file, cv2.IMREAD_GRAYSCALE)
    our_outline = cv2.imread(our_file, cv2.IMREAD_GRAYSCALE)
    theirs_cropped = crop_to_content(their_drawing)
    ours_cropped = crop_to_content(our_outline, invert=False)

    # Match their drawing size to ours
    # (this has to be before converting to black and white, I think there are interpolation issues)
    (theirs_height, theirs_width) = theirs_cropped.shape[:2]

    # Make ours the height of theirs, maintaining aspect ratio
    ours_sized = resize_with_aspect_ratio(ours_cropped, height=theirs_height)
    theirs_sized = theirs_cropped

    # Make their drawing black and white
    their_drawing_bw = convert_to_black_and_white(theirs_sized)
    theirs_sized = fillOutline(their_drawing_bw)

    (ours_height, ours_width) = ours_sized.shape[:2]

    # Find the larger
    larger_width = max(theirs_width, ours_width)
    smaller_width = min(theirs_width, ours_width)
    padding_left = math.floor((larger_width - smaller_width) / 2)
    padding_right = math.ceil((larger_width - smaller_width) / 2)
    if larger_width == theirs_width:
        ours_padded = cv2.copyMakeBorder(ours_sized, 0, 0, padding_left, padding_right, cv2.BORDER_CONSTANT, value=[0,0,0])
        theirs_padded = theirs_sized
    else:
        theirs_padded = cv2.copyMakeBorder(theirs_sized, 0, 0, padding_left, padding_right, cv2.BORDER_CONSTANT, value=[0,0,0])
        ours_padded = ours_sized
    difference = cv2.subtract(ours_padded, theirs_padded)
    difference_2 = cv2.subtract(theirs_padded, ours_padded)
    both_differences = cv2.add(difference, difference_2)
    non_zero_count = cv2.countNonZero(both_differences)

    return both_differences, non_zero_count

# name = "input_drawing"
# input_file_format = './inputs/{}.png'
# mask_file_format = './masks/{}.png'

# input_file = input_file_format.format(name)
# counts = []
# for i in range(16, 17):
#     mask_file = mask_file_format.format(i)
#     print(mask_file)
#     diff, count = compare_outlines(input_file, mask_file)
#     print('{} - {}'.format(i, count))
#     counts.append((count, i))
# cv2.imshow("diff{}".format(i), diff)
# cv2.waitKey(0)
# cv2.destroyAllWindows()



# print(min(counts))


# # cv2.imshow("theirs", theirs)
# # cv2.imshow("ours", ours)
# # cv2.imshow("difference", difference)
# # cv2.imshow("difference_2", difference_2)
# # cv2.imshow("a", a)
# cv2.destroyAllWindows()
