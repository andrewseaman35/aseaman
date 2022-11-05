import os
import sys

import cv2
import pytesseract

from screen import Screen
from util import extract_and_normalize_screen


def read_image_file(filepath):
    if not os.path.exists(filepath):
        raise Exception(f"filepath {filepath} does not exist")

    print(filepath)
    img = cv2.imread(filepath)

    return img


image = read_image_file(sys.argv[1])
screen_image = extract_and_normalize_screen(image)
screen = Screen(screen_image)

screen.display()
print(screen.module_values_by_name)
# import pdb; pdb.set_trace()
