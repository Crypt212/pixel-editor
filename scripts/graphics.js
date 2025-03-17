import CanvasData from "./canvas-data.js";
import { validateNumber, validateColorArray } from "./validation.js";

/**
 * Contains graphics methods to draw on CanvasData class
 * @class
 */
class Graphics {
    #canvas;
    /**
     * Sets a specific canvas data class to draw on, can be changed later using setCanvasData method
     * @constructor
     */
    constructor(canvasData) {
        if (!(canvasData instanceof CanvasData))
            throw new TypeError(
                "Input type must be of instance of CanvasData class",
            );

        this.#canvas = canvasData;
    }

    /**
     * draws pixel at position (x, y) with a specific diameter
     * @method
     * @param {number} x - x position 
     * @param {number} y - y position 
     * @param {number} [diameter=1] - Diameter for drawing the pixel, minimum = 1
     * @param {boolean} [isSquare=true] - Draws a square pixel with side = radius, draws in a circle shape otherwise
     * @throws {TypeError} - if type of parameters is invalid
     * @throws {RangeError} - if range of parameters is invalid
     */
    drawPixel(x, y, color, diameter = 1, isSquare = true) {

        validateNumber(x, "x", {isInteger: true});
        validateNumber(y, "y", {isInteger: true});
        validateColorArray(color);
        validateNumber(diameter, "Diameter", {start: 1});
        if (typeof isSquare !== "boolean") throw new TypeError("isSquare must be boolean");

        diameter = Math.floor(diameter);
        const radius = Math.floor(0.5 * diameter); // Pre-calculate radius
        const radiusSquared = radius * radius; // Pre-calculate radius squared for performance

        for ( let currentY = y - radius; currentY < Math.max(y + 1, y + radius); currentY++) {
            for ( let currentX = x - radius; currentX < Math.max(x + 1, x + radius); currentX++) {

                if (currentX < 0 || currentX >= this.#canvas.getWidth ||
                    currentY < 0 || currentY >= this.#canvas.getHeight)
                    continue;

                let test = true; // For a square area

                if (!isSquare &&
                    !(x === currentX, y === currentY) // not starting pixel
                ) {
                    // For circular area
                    const dx = x - currentX - 0.5;
                    const dy = y - currentY - 0.5;
                    test = (dx * dx + dy * dy <= radiusSquared);
                }

                if (test) {
                    this.#canvas.setColor(currentX, currentY, color);
                }
            }
        }
    }

    /**
     * applies the fallback on each pixel position in the line from pixel (x0, y0) to pixel (x1, y1)
     * @method
     * @param {number} x0 - x position of the first point
     * @param {number} y0 - y position of the first point
     * @param {number} x1 - x position of the second point
     * @param {number} y1 - y position of the second point
     * @param {Function} fallback - takes an object containing x position and y position
     */
    doLineOf(x0, y0, x1, y1, fallback) {
        let steep = false;

        // Swap x and y if the line is steep
        if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
            steep = true;
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
        }

        // Ensure we draw from left to right
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = Math.abs(y1 - y0);
        const yStep = y0 < y1 ? 1 : -1; // Determine the direction of y

        let error = dx / 2; // Initialize the error term
        let currentY = y0;

        for (let currentX = x0; currentX <= x1; currentX++) {
            let setX = currentX;
            let setY = currentY;

            if (steep) [setX, setY] = [setY, setX];

            fallback({ x: setX, y: setY });

            error -= dy; // Decrease the error by dy
            if (error < 0) {
                currentY += yStep; // Move in the y direction
                error += dx; // Increase the error by dx
            }
        }
    }

    /**
     * Draws a line from pixel (x0, y0) to pixel (x1, y1) with the given color
     * @method
     * @param {number} x0 - x position of the first point
     * @param {number} y0 - y position of the first point
     * @param {number} x1 - x position of the second point
     * @param {number} y1 - y position of the second point
     * @param {number} [thickness=1] - the thickness of the line, minimum is 1
     * @param {[number, number, number, number]} An array containing color data [red, green, blue, alpha]
     */
    drawLine(x0, y0, x1, y1, color, thickness = 1) {
        validateNumber(x0, "x0", { integerOnly: true });
        validateNumber(y0, "y0", { integerOnly: true });
        validateNumber(x1, "x1", { integerOnly: true });
        validateNumber(y1, "y1", { integerOnly: true });
        validateNumber(thickness, "Thickness", { start: 0, integerOnly: false });
        validateColorArray(color);

        this.doLineOf(x0, y0, x1, y1, () => {
            try {
                this.setColor(setX, setY, color);
            } catch (error) {
                if (error instanceof RangeError) {
                    console.warn(
                        `Attempted to draw out of bounds at (${x0 + i * stepX}, ${y0 + i * stepY})`,
                    );
                    // if out of bound, just don't draw
                    return;
                }
            }
        });
    }

    /**
     * Fills an area of semi-uniform color (with some tolerance difference) which contains the position (x, y) with the given color
     * @method
     * @param {number} x
     * @param {number} y
     * @param {[number, number, number, number]} An array containing color data [red, green, blue, alpha]
     * @param {number} [tolerance=0] !!!
     */
    fill(x, y, color, tolerance = 0) {
        const originalPixel = this.get(x, y);
        const originalColor = originalPixel.color;

        // Early exit if the color is the same
        if (colorDistance(originalColor, color) === 0) return;

        const toVisit = [{ x: x, y: y }];
        const toFill = [];
        const visited = new Set();

        while (toVisit.length) {
            const currentPixel = toVisit.pop();
            const { x: currX, y: currY } = currentPixel;

            // Check if already visited
            const pixelKey = `${currX},${currY}`;
            if (visited.has(pixelKey)) continue;
            visited.add(pixelKey);

            const currentColor = this.getColor(currX, currY);

            if (colorDistance(currentColor, originalColor) <= tolerance) {
                toFill.push(currentPixel);

                // Add adjacent pixels to visit
                if (currX > 0) toVisit.push({ x: currX - 1, y: currY }); // Left
                if (currX < this.getWidth - 1)
                    toVisit.push({ x: currX + 1, y: currY }); // Right
                if (currY > 0) toVisit.push({ x: currX, y: currY - 1 }); // Up
                if (currY < this.getHeight - 1)
                    toVisit.push({ x: currX, y: currY + 1 }); // Down
            }
        }
        // Set the color for all pixels to fill
        toFill.forEach((pixel) => {
            this.setColor(pixel.x, pixel.y, color);
        });
    }

    setCavnas (canvas) {
        if (!(canvas instanceof CanvasData))
            throw new TypeError(
                "Input type must be of instance of CanvasData class",
            );

        this.#canvas = canvas;
    }
}

//
//
//
//
//
//
//
//    describe("Color maniqulations", () => {
//        test("Should set the color of a single pixel", () => {
//            const color = [255, 0, 0, 1];
//            cd.setColor(5, 5, color, { radius: 0 });
//
//            expect(cd.getColor(5, 5)).toStrictEqual(color);
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 5, y: 5, color: color },
//            ]);
//        });
//
//        test("Should set the color of a square area", () => {
//            const color = [0, 255, 0, 1];
//
//            cd.setColor(5, 5, color, { radius: 1, isCircular: false });
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 4, y: 4, color: color },
//                { x: 4, y: 5, color: color },
//                { x: 4, y: 6, color: color },
//                { x: 5, y: 4, color: color },
//                { x: 5, y: 5, color: color },
//                { x: 5, y: 6, color: color },
//                { x: 6, y: 4, color: color },
//                { x: 6, y: 5, color: color },
//                { x: 6, y: 6, color: color },
//            ]);
//        });
//
//        test("Should set the color of a circular area", () => {
//            const color = [0, 0, 255, 1];
//            cd.setColor(5, 5, color, { radius: 1, isCircular: true });
//
//            // Check the pixels that should be colored in a circle
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 4, y: 5, color: color }, // Directly above
//                { x: 5, y: 4, color: color }, // Directly left
//                { x: 5, y: 5, color: color }, // Center
//                { x: 5, y: 6, color: color }, // Directly right
//                { x: 6, y: 5, color: color }, // Directly below
//            ]);
//        });
//
//        test("Should handle transparency correctly", () => {
//            const color = [255, 0, 0, 0]; // Fully transparent
//            cd.setColor(5, 5, color, { radius: 0 });
//
//            expect(cd.getColor(5, 5)).toStrictEqual([0, 0, 0, 0]); // Should be transparent black
//        });
//
//        test("Should not change pixels if quietly is true", () => {
//            const color = [255, 0, 0, 1]; // Red color
//            cd.setColor(5, 5, color, { radius: 1, quietly: true });
//
//            expect(cd.getColor(5, 5)).toBe(color); // Color changed
//            expect(cd.getLastActions).toStrictEqual([]); // No actions should be recorded
//        });
//
//        test("Should throw an error for invalid coordinates", () => {
//            const color = [255, 0, 0, 1];
//            expect(() => cd.setColor(-1, 5, color)).toThrow(
//                "x must be defined finite integer, minimum: 0, maximum: 15",
//            );
//        });
//
//        test("Should throw an error for invalid color array", () => {
//            const invalidColor = [256, 0, 0, 1]; // Invalid red value
//            expect(() => cd.setColor(5, 5, invalidColor)).toThrow(
//                "Color must be in array form [red, geen, blue, alpha] where the colors are between 0 and 255 and alpha is between 0.0 and 1.0",
//            );
//        });
//    });
//    describe("drawLine", () => {
//        beforeEach(() => {
//            cd.initializeBlankCanvas(5, 5);
//        });
//
//        test("Should draw a horizontal line", () => {
//            const color = [255, 0, 0, 1];
//            cd.drawLine(1, 2, 3, 2, color); // Draw a line from (1, 2) to (3, 2)
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 1, y: 2, color: color },
//                { x: 2, y: 2, color: color },
//                { x: 3, y: 2, color: color },
//            ]);
//        });
//
//        test("Should draw a vertical line", () => {
//            const color = [0, 255, 0, 1];
//            cd.drawLine(2, 1, 2, 3, color); // Draw a line from (2, 1) to (2, 3)
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 2, y: 1, color: color },
//                { x: 2, y: 2, color: color },
//                { x: 2, y: 3, color: color },
//            ]);
//        });
//
//        test("Should draw a diagonal line", () => {
//            const color = [0, 0, 255, 1];
//            cd.drawLine(0, 0, 4, 4, color); // Draw a diagonal line from (0, 0) to (4, 4)
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 0, y: 0, color: color },
//                { x: 1, y: 1, color: color },
//                { x: 2, y: 2, color: color },
//                { x: 3, y: 3, color: color },
//                { x: 4, y: 4, color: color },
//            ]);
//        });
//
//        test("Should not draw anything if the line is a single pixel out of bound", () => {
//            const color = [255, 255, 0, 1];
//            cd.drawLine(-2, -22, -2, -22, color); // Draw a line from (-2, -22) to (-2, -22)
//            expect(() => cd.drawLine(-2, 3, -2, -22, color)).not.toThrow();
//            expect(cd.getColor(2, 2)).toStrictEqual([0, 0, 0, 0]);
//            expect(cd.getLastActions).toStrictEqual([]);
//        });
//
//        test("Should draw a single pixel", () => {
//            const color = [255, 255, 0, 1];
//            cd.drawLine(2, 2, 2, 2, color); // Draw a line from (2, 2) to (2, 2)
//            expect(cd.getColor(2, 2)).toStrictEqual(color);
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 2, y: 2, color: color },
//            ]);
//        });
//
//        test("Should not draw out of bounds", () => {
//            const color = [255, 0, 255, 1];
//            cd.drawLine(0, 0, 6, 6, color); // Attempt to draw out of bounds
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 0, y: 0, color: color },
//                { x: 1, y: 1, color: color },
//                { x: 2, y: 2, color: color },
//                { x: 3, y: 3, color: color },
//                { x: 4, y: 4, color: color },
//            ]);
//        });
//
//        test("Should handle negative coordinates", () => {
//            const color = [0, 255, 255, 1];
//            cd.drawLine(-1, -1, 2, 2, color); // Attempt to draw with negative coordinates
//            expect(cd.getLastActions).toStrictEqual([
//                { x: 0, y: 0, color: color },
//                { x: 1, y: 1, color: color },
//                { x: 2, y: 2, color: color },
//            ]);
//        });
//    });

export default Graphics;
