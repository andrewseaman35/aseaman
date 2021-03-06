import cv2
import os
import h5py
import numpy as np


def imread_resize(file, width=None, height=None):
    return resize_with_aspect_ratio(cv2.imread(file), width=width, height=height)


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

def get_outine(image_file):
    original = imread_resize(image_file, width=1000)
    original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    ret, original_thresh = cv2.threshold(original_gray, 127, 255, cv2.THRESH_BINARY)
    kernel = np.ones((3,3),np.uint8) #square image kernel used for erosion
    erosion = cv2.erode(original_thresh, kernel, iterations = 1) #refines all edges in the binary image
    opening = cv2.morphologyEx(erosion, cv2.MORPH_OPEN, kernel)
    closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel)
    return closing

def convert_to_mask(image_file):
    original = imread_resize(image_file, width=1000)
    lower =(0, 0, 255) # lower bound for each channel
    upper = (0, 0, 255) # upper bound for each channel

    kernel = np.ones((10, 10),np.uint8) #square image kernel used for erosion
    erosion = cv2.erode(original, kernel, iterations = 1) #refines all edges in the binary image
    opening = cv2.morphologyEx(erosion, cv2.MORPH_OPEN, kernel)
    closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel)

    # create the mask and use it to change the colors
    mask = cv2.inRange(original, lower, upper)
    closing[mask != 0] = lower

    # cv2.imshow('mask', mask)
    original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(original_gray,50,250)
    ret, original_thresh = cv2.threshold(original_gray, 127, 255, cv2.THRESH_BINARY)

    return mask

numbered_file_format = './jas_outlined/{}.png'
mask_file_format = './masks/{}.png'
mask_dataset_file = './mask_data/dataset.hdf5'

data = {}
with h5py.File(mask_dataset_file, "w") as f:
    for i in range(1,25):
        print(numbered_file_format.format(i))
        mask = convert_to_mask(numbered_file_format.format(i))
        cropped = crop_to_content(mask, invert=False)
        dset = f.create_dataset(str(i), data=cropped)

h5f = h5py.File(mask_dataset_file, 'r')
    # b = h5f['mask'][:]
    # h5f.close()
import pdb; pdb.set_trace()
    # cv2.imshow('image', mask)
    # cv2.imwrite(mask_file_format.format(i), mask)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()



# cv2.imshow("original_thresh", original_thresh)
# cv2.imshow("theirs", theirs)
# cv2.imshow("ours", ours)
# cv2.imshow("difference", difference)
# cv2.imshow("difference_2", difference_2)
# cv2.imshow("a", a)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
