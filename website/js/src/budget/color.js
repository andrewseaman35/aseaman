function interpolate(start, end, steps, count) {
    return Math.floor(start + (((end - start) / steps) * count));
}

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toString() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }
}

class ColorCollection {
    static WHITE = new Color(255, 255, 255);

    static BUDGET_GREEN = new Color(28, 140, 28);
    static BUDGET_RED = new Color(158, 33, 19);
    static BUDGET_YELLOW = new Color(239, 247, 188);
}

function findColorInRange(minVal, maxVal, val) {
    const distance = maxVal - minVal;
    if (distance < 0) {
        throw new Error(`invalid min/max: ${minVal} ${maxVal}`);
    }
    if (distance === 0 || distance === 1) {
        return ColorCollection.BUDGET_YELLOW;
    }
    const centerVal = minVal + (distance / 2);

    const start = val > centerVal ? ColorCollection.BUDGET_YELLOW : ColorCollection.BUDGET_GREEN;
    const end = val > centerVal ? ColorCollection.BUDGET_RED: ColorCollection.BUDGET_YELLOW;
    const colorVal = val > centerVal ? val % centerVal + 1 : val;

    const color = new Color(
        interpolate(start.r, end.r, distance, colorVal),
        interpolate(start.g, end.g, distance, colorVal),
        interpolate(start.b, end.b, distance, colorVal),
    );

    return color
}

export {
    findColorInRange,
    ColorCollection,
}