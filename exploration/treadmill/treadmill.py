from copy import deepcopy
import email.parser
import sys


from screen import Screen
from util import (
    extract_and_normalize_screen,
    read_image_timestamp,
    read_image_file,
    read_image_from_email,
)


class Entry:
    def __init__(
        self, screen, timestamp, time, distance=None, calories=None, speed=None
    ):
        self.screen = screen
        self.time = time
        self.calories = calories
        self.distance = distance
        self.speed = speed
        self.timestamp = timestamp

    @classmethod
    def from_image_filepath(cls, image_fileath):
        image = read_image_file(image_filepath)
        return cls.from_image(image)

    @classmethod
    def from_image(cls, image):
        # timestamp = read_image_timestamp(image_filepath)
        timestamp = None
        screen = Screen(extract_and_normalize_screen(image))
        entry_values = deepcopy(screen.module_values_by_name)
        entry_values["timestamp"] = timestamp
        return Entry(screen, **entry_values)


parser = email.parser.BytesParser()
with open("jaa14js91cj4nfhne8jg7716t04r2p7p06viq4o1", "rb") as f:
    email_message = parser.parse(f)

image = read_image_from_email(email_message)

entry = Entry.from_image(image)
print(entry.__dict__)

# entry.screen.display()
