import email.parser

import cv2
from PIL import Image
import numpy as np

parser = email.parser.BytesParser()
with open("pctfdbkhl1rn05n9u8csi1l1m99umfm7of150rg1", "rb") as f:
    parsed = parser.parse(f)

image = None
for part in parsed.walk():
    if part.get_content_type() == "image/jpeg":
        image = part
    print(part.get_content_type())

import base64


def readb64(uri):
    encoded_data = uri
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


with open("test.jpg", "wb") as f:
    f.write(part.__bytes__())


img = readb64(part.get_payload())

# from io import BytesIO
# file_jpgdata = BytesIO(base64.b64decode(part.get_payload()))
# dt = Image.open(file_jpgdata)

import pdb

pdb.set_trace()
cv2.imshow("img", img)
cv2.waitKey()
# print(parsed.iter_attachments())
