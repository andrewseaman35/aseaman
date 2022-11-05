import cv2


from util import (
    rectangle_shares_vertical_with_any,
)

VERTICAL_ASPECT_RATIOS = [0.177, 0.15]
VERTICAL_THRESHOLD = 0.10

HORIZONTAL_ASPECT_RATIOS = [2.3, 2.65, 3.35]
HORIZONTAL_THRESHOLD = 0.10

SQUARE_ASPECT_RATIO = 1
SQUARE_THRESHOLD = 0.05  # within 5% of one another to be considered square


def _find_segment_bounding_boxes(image):
    """
    Return the bounding boxes for all the identified segments on the display.
    """
    edges = cv2.Canny(image, 30, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    return [cv2.boundingRect(contour) for contour in contours]


def _find_vertically_overlapping_groups(segments):
    """
    Given a list of segments, return a list of lists of segments, where all
    segments in each inner list share x values.
    """
    vertical_segment_groups = []

    # organize them starting with the widest, to capture all segments in that
    # vertical space
    sorted_segments = sorted(segments, key=lambda seg: seg[2], reverse=True)
    for segment in sorted_segments:
        group_found = False
        for segment_group in vertical_segment_groups:
            if rectangle_shares_vertical_with_any(segment, segment_group):
                segment_group.append(segment)
                group_found = True
                break
        if not group_found:
            vertical_segment_groups.append([segment])

    sorted_segments_groups = sorted(
        vertical_segment_groups,
        key=lambda list_of_rects: min(rect[0] for rect in list_of_rects),
    )
    return sorted_segments_groups


def _find_segment_groups(image):
    """
    Return a list of groups of segments. Segments are put in the same group
    if they overlay on the x axis.

    Response is sorted by minimum x value.
    """
    segment_bounding_boxes = _find_segment_bounding_boxes(image)

    # Separate out square segments, because they sometimes overlap with
    # the numbers they're close to.
    non_square_segment_groups = _find_vertically_overlapping_groups(
        [s for s in segment_bounding_boxes if not _is_square(s)]
    )
    square_segment_groups = _find_vertically_overlapping_groups(
        [s for s in segment_bounding_boxes if _is_square(s)]
    )
    return sorted(
        non_square_segment_groups + square_segment_groups,
        key=lambda list_of_rects: min(rect[0] for rect in list_of_rects),
    )


def _is_close_enough_to_aspect_ratio(aspect_ratio, desired_aspect_ratio, threshold):
    return aspect_ratio >= desired_aspect_ratio * (
        1 - threshold
    ) and aspect_ratio <= desired_aspect_ratio * (1 + threshold)


def _is_square(segment):
    _, _, w, h = segment
    w_lower = h * (1 - SQUARE_THRESHOLD)
    w_higher = h * (1 + SQUARE_THRESHOLD)
    return w > w_lower and w < w_higher


def _is_vertical(segment):
    _, _, w, h = segment
    if h <= w:
        return False

    aspect_ratio = w / h

    for desired_aspect_ratio in VERTICAL_ASPECT_RATIOS:
        if _is_close_enough_to_aspect_ratio(
            aspect_ratio, desired_aspect_ratio, VERTICAL_THRESHOLD
        ):

            return True

    return False


def _is_horizontal(segment):
    _, _, w, h = segment
    if h >= w:
        return False

    aspect_ratio = w / h
    for desired_aspect_ratio in HORIZONTAL_ASPECT_RATIOS:
        if _is_close_enough_to_aspect_ratio(
            aspect_ratio, desired_aspect_ratio, HORIZONTAL_THRESHOLD
        ):
            return True

    return False


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
        elif _is_horizontal(segment):
            segments_by_shape["horizontal"].append(segment)
        else:
            pass
    return segments_by_shape


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


def _handle_three_segments(segments_by_shape):
    """
    Handles 7
    """
    return "7"


def _handle_four_segments(segments_by_shape):
    """
    Handles 4
    """
    return "4"


def _handle_five_segments(segments_by_shape):
    """
    Handles 2, 3, 5
    """
    vertical_groups = _find_vertically_overlapping_groups(segments_by_shape["vertical"])
    if len(vertical_groups) == 1:
        return "3"

    left_segments = vertical_groups[0]
    right_segments = vertical_groups[1]

    # If the left segment is below the right segment
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
    3: _handle_three_segments,
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
        segments_in_group = [
            s for segments in segments_by_shape.values() for s in segments
        ]
        if not segments_in_group:
            continue

        if len(segments_in_group) in segment_handlers_by_segment_count:
            handler = segment_handlers_by_segment_count[len(segments_in_group)]
            output.append(handler(segments_by_shape))
        else:
            output.append("?")
    return "".join(output)
