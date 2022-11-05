from funcy import cached_property

import cv2

from screen_module import (
    ScreenModule,
    TimeModule,
    CentralModule,
    DistSpeedModule,
    TopRightModule,
)


class Screen:
    name = "Screen"

    def __init__(self, image):
        self.image = image

        self.modules = [
            TimeModule("time", self.image, 35, 110),
            # CentralModule("pace", self.image, 1150, 75),
            # CentralModule("incline", self.image, 1150, 425),
            CentralModule("calories", self.image, 1150, 780),
            # CentralModule("pulse", self.image, 1150, 1135),
            DistSpeedModule("distance", self.image, 30, 1000),
            DistSpeedModule("speed", self.image, 475, 1000),
            # TopRightModule("vert", self.image, 1450, 50),
        ]
        self.module_by_name = {module.name: module for module in self.modules}

    def draw_grid(self):
        for y in range(0, 2000, 50):
            cv2.line(self.image, (0, y), (10000, y), (255, 0, 0), 1)
        for x in range(0, 2500, 50):
            cv2.line(self.image, (x, 0), (x, 10000), (255, 0, 0), 1)

    def display(self):
        for module in self.modules:
            module.draw_bounding_box()
            module.draw_segment_bounding_boxes()
            # cv2.imshow(module.name, module.binary_image)

        cv2.imshow(self.name, self.image)
        cv2.waitKey()

    @cached_property
    def module_values_by_name(self):
        return {module.name: module.value for module in self.modules}
