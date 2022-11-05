from copy import deepcopy
import sys


from screen import Screen
from util import (
    extract_and_normalize_screen,
    read_image_timestamp,
    read_image_file,
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
    def from_image(cls, image_filepath):
        timestamp = read_image_timestamp(image_filepath)
        image = read_image_file(image_filepath)
        screen = Screen(extract_and_normalize_screen(image))
        entry_values = deepcopy(screen.module_values_by_name)
        entry_values["timestamp"] = timestamp
        return Entry(screen, **entry_values)


entry = Entry.from_image(sys.argv[1])
print(entry.__dict__)
# entry.screen.display()
