import cv2


from util import (
    crop_image,
    rectangles_overlap,
    rectangles_share_vertical,
    rectangle_shares_vertical_with_any,
    any_rectangles_share_vertical,
    any_rectangles_overlap,
)


SQUARE_THRESHOLD = 0.05  # within 5% of one another to be considered square


def _find_segment_bounding_boxes(image, draw=False):
    """
    Return the bounding boxes for all the identified segments on the display.
    """
    edges = cv2.Canny(image, 30, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if draw:
        for contour in contours:
            bb_x, bb_y, bb_w, bb_h = cv2.boundingRect(contour)
            cv2.rectangle(
                image,
                (self.x1 + bb_x, self.y1 + bb_y),
                (self.x1 + bb_x + bb_w, self.y1 + bb_y + bb_h),
                (0, 255, 255),
                1,
            )

    return [cv2.boundingRect(contour) for contour in contours]


def _find_vertically_overlapping_groups(segments):
    """
    Given a list of segments, return a list of lists of segments, where all
    segments in each inner list share x values.
    """
    vertical_segment_groups = []
    for segment in segments:
        group_found = False
        for segment_group in vertical_segment_groups:
            if rectangle_shares_vertical_with_any(segment, segment_group):
                segment_group.append(segment)
                group_found = True
        if not group_found:
            vertical_segment_groups.append([segment])
    return vertical_segment_groups


def _find_segment_groups(image):
    """
    Return a list of groups of segments. Segments are put in the same group
    if they overlay on the x axis.

    Response is sorted by minimum x value.
    """
    segment_bounding_boxes = _find_segment_bounding_boxes(image)

    return _find_vertically_overlapping_groups(segment_bounding_boxes)


def _is_square(segment):
    x, y, w, h = segment
    w_lower = h * (1 - SQUARE_THRESHOLD)
    w_higher = h * (1 + SQUARE_THRESHOLD)
    return w > w_lower and w < w_higher


def _is_vertical(segment):
    x, y, w, h = segment
    return h > w


def _is_horizontal(segment):
    x, y, w, h = segment
    return h < w


def _group_segments_by_shape(segment_group):
    segments_by_shape = {
        "square": [],
        "vertical": [],
        "horizontal": [],
    }
    for segment in segment_group:
        if _is_square(segment):
            segments_by_shape["square"].append(segment)
        elif _is_vertical(segment):
            segments_by_shape["vertical"].append(segment)
        else:
            segments_by_shape["horizontal"].append(segment)
    return segments_by_shape


def _find_vertically_overlapping_groups(vertical_segments):
    vertical_segment_groups = []
    for segment in vertical_segments:
        group_found = False
        for segment_group in vertical_segment_groups:
            if rectangle_shares_vertical_with_any(segment, segment_group):
                segment_group.append(segment)
                group_found = True
        if not group_found:
            vertical_segment_groups.append([segment])

    sorted_vertical_segments_groups = sorted(
        vertical_segment_groups,
        key=lambda list_of_rects: min(rect[0] for rect in list_of_rects),
    )
    return sorted_vertical_segments_groups


def _handle_one_segment(segments_by_shape):
    """
    Handles .
    """
    return "."


def _handle_two_segments(segments_by_shape):
    """
    Handles 1, :
    """
    if len(segments_by_shape["vertical"]) == 2:
        return "1"
    return ":"


def _handle_four_segments(segments_by_shape):
    """
    Handles 4, 7
    """
    horizontal_segments = segments_by_shape["horizontal"]

    highest_vertical_segment = sorted(
        segments_by_shape["vertical"],
        key=lambda seg: seg[1],
    )[0]
    horizontal_segment = horizontal_segments[0]
    # If the horizontal segment is below the highest vertical segment top,
    # it's a 4!
    if horizontal_segment[1] > highest_vertical_segment[1]:
        return "4"
    return "7"


def _handle_five_segments(segments_by_shape):
    """
    Handles 2, 3, 5
    """
    vertical_groups = _find_vertically_overlapping_groups(segments_by_shape["vertical"])
    if len(vertical_groups) == 1:
        return "3"

    print(vertical_groups)
    print(len(vertical_groups))
    left_segments = vertical_groups[0]
    right_segments = vertical_groups[1]

    # If the left segment is below the right segment
    print("left_segments")
    print(left_segments)
    print(right_segments)
    if left_segments[0][1] > right_segments[0][1]:
        return "2"

    return "5"


def _handle_six_segments(segments_by_shape):
    """
    Handles 0, 6, 9
    """
    if len(segments_by_shape["horizontal"]) == 2:
        return "0"

    vertical_groups = _find_vertically_overlapping_groups(segments_by_shape["vertical"])
    if len(vertical_groups[0]) == 1:
        return "9"

    return "6"


def _handle_seven_segments(segments_by_shape):
    return "8"


segment_handlers_by_segment_count = {
    1: _handle_one_segment,
    2: _handle_two_segments,
    4: _handle_four_segments,
    5: _handle_five_segments,
    6: _handle_six_segments,
    7: _handle_seven_segments,
}


def parse_segments_from_image(image):
    segment_groups = _find_segment_groups(image)
    output = []
    for segment_group in segment_groups:
        segments_by_shape = _group_segments_by_shape(segment_group)
        handler = segment_handlers_by_segment_count[len(segment_group)]
        output.append(handler(segments_by_shape))
    return "".join(output)
