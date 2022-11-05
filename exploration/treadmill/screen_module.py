import cv2
from funcy import cached_property
import numpy as np

from segment_parser import parse_segments_from_image, _find_segment_bounding_boxes

from util import (
    crop_image,
    rectangle_shares_vertical_with_any,
)


class ScreenModule:
    name = "unnamed"
    default_color = (0, 0, 255)
    default_thickness = 2

    def __init__(self, name, image, x1, y1, x2, y2):
        self.name = name
        self.image = image
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2

        self.module_image = crop_image(
            self.image, self.x1, self.y1, self.width, self.height
        )

    @property
    def width(self):
        return self.x2 - self.x1

    @property
    def height(self):
        return self.y2 - self.y1

    def draw_bounding_box(self, color=None, thickness=None):
        color = color or self.default_color
        thickness = thickness or self.default_thickness
        cv2.rectangle(
            self.image, (self.x1, self.y1), (self.x2, self.y2), color, thickness
        )
        cv2.putText(
            img=self.image,
            text=f"{self.name} - {self.value}",
            org=(self.x1, self.y1 - 5),
            fontFace=cv2.FONT_HERSHEY_SIMPLEX,
            fontScale=1,
            color=self.default_color,
            thickness=4,
        )

    def draw_segment_bounding_boxes(self, color=None):
        color = color or self.default_color
        bounding_boxes = _find_segment_bounding_boxes(self.binary_image)
        for bb_x, bb_y, bb_w, bb_h in bounding_boxes:
            cv2.rectangle(
                self.image,
                (self.x1 + bb_x, self.y1 + bb_y),
                (self.x1 + bb_x + bb_w, self.y1 + bb_y + bb_h),
                color,
                3,
            )

    @property
    def binary_image(self):
        grayscale = cv2.cvtColor(self.module_image, cv2.COLOR_BGR2GRAY)
        # ret, original_thresh = cv2.threshold(grayscale, 127, 255, cv2.THRESH_BINARY)
        _, inverted_thresholded = cv2.threshold(grayscale, 127, 255, cv2.THRESH_BINARY)
        binary_image = cv2.bitwise_not(inverted_thresholded)
        kernel = np.ones((5, 5), np.uint8)
        binary_image = cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, kernel)

        kernel = np.ones((3, 3), np.uint8)
        binary_image = cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel)

        img_rgb = cv2.cvtColor(binary_image, cv2.COLOR_BGR2RGB)

        return img_rgb

    def save_binary(self, filepath):
        cv2.imwrite(filepath, self.binary_image)

    @property
    def inverted_binary_image(self):
        return cv2.bitwise_not(self.binary_image)

    @cached_property
    def value(self):
        print(f"== {self.name}")
        return parse_segments_from_image(self.binary_image)
        try:
            return parse_segments_from_image(self.binary_image)
        except Exception as e:
            print(e)
            return ""


class SizedScreenModule(ScreenModule):
    def __init__(self, name, image, x1, y1):
        x2 = x1 + self.width
        y2 = y1 + self.height
        return super().__init__(name, image, x1, y1, x2, y2)


class TimeModule(SizedScreenModule):
    width = 840
    height = 705


class CentralModule(SizedScreenModule):
    width = 300
    height = 275


class DistSpeedModule(SizedScreenModule):
    width = 400
    height = 425


class TopRightModule(SizedScreenModule):
    width = 800
    height = 250

    value = ""
