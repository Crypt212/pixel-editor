import { validateNumber, validateColorArray } from "./validation.js";

/**
 * Represents a canvas grid system
 * @class
 */
class CanvasGrid {
    #width;
    #height;
    #pixelMatrix;
    #lastActions;

    /**
     * Creates a blank canvas with specified width and height
     * @constructor
     * @param {number} [width=1] - The width of the grid
     * @param {number} [height=1] height - The height of the grid
     * @throws {Error} if width or height are not integers between 1 and 1024 inclusive
     */
    constructor(width = 1, height = 1) {
        validateNumber(width, "Width", {
            start: 1,
            end: 1024,
            integerOnly: true
        });
        validateNumber(height, "Height", {
            start: 1,
            end: 1024,
            integerOnly: true
        });
        this.#width = width;
        this.#height = height;
        this.#lastActions = [];
        this.initializeBlankCanvas(width, height);
    }

    /**
     * Initializes the canvas with a blank grid of transparent pixel data
     * @method
     * @param {number} width - The width of the grid
     * @param {number} height - The height of the grid
     * @throws {Error} if width or height are not integers between 1 and 1024 inclusive
     */
    initializeBlankCanvas(width, height) {
        validateNumber(width, "Width", {start: 1, end: 1024, integerOnly: true});
        validateNumber(height, "Height", {start: 1, end: 1024, integerOnly: true});

        this.#width = width;
        this.#height = height;
        this.#pixelMatrix = [];
        for (let i = 0; i < this.#height; i++) {
            this.#pixelMatrix.push([]);
            for (let j = 0; j < this.#width; j++) {
                this.#pixelMatrix[i].push({
                    x: j,
                    y: i,
                    color: [0, 0, 0, 0],
                });
            }
        }
    }

    /**
     * Loads an image data at (x, y) position
     * @method
     * @param {ImageData} imageData
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @throws {Error} if x or y are not integers
     * @throws {Error} if imageData is not instance of class ImageData
     */
    loadImage(imageData, x = 0, y = 0) {
        validateNumber(x, "x", {integerOnly: true});
        validateNumber(y, "y", {integerOnly: true});

        if (imageData === undefined || !(imageData instanceof ImageData))
            throw new TypeError(
                "Image data must be defined instance of ImageData class",
            );

        let start_y = Math.max(y, 0);
        let start_x = Math.max(x, 0);
        for (
            let i = start_y;
            i < imageData.height + y && i < this.#height;
            i++
        ) {
            for (
                let j = start_x;
                j < imageData.width + x && j < this.#width;
                j++
            ) {
                let dist = (j - x + imageData.width * (i - y)) * 4;

                let red = Number(imageData.data[dist + 0]);
                let green = Number(imageData.data[dist + 1]);
                let blue = Number(imageData.data[dist + 2]);
                let alpha = Number(imageData.data[dist + 3]);

                this.setColor(j, i, [red, green, blue, alpha]);
            }
        }
    }

    /**
     * Resets last taken actions array to be empty
     * @method
     * @returns last taken actions
     */
    resetLastActions() {
        let lastActions = this.#lastActions;
        this.#lastActions = [];
        return lastActions;
    }

    /**
     * Sets color to pixel at position (x, y).
     * If the color alpha channel is 0, then set rgba to [0, 0, 0, 0] to represent transparency.
     * @method
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @param {[number, number, number, number]} color - An array containing color data [red, green, blue, alpha].
     * @param {Object} An object containing additional options.
     * @param {boolean} [options.quietly=false] - If set to true, the pixel data at which color changed will not be pushed to the lastActionss array.
     * @param {boolean} [options.validate=true] - If set to true, the x, y, and color types are validated.
     * @throws {Error} if validate is true and if x and y are not valid integers in valid range.
     * @throws {Error} if validate is true and if color is not the valid array form [r, g, b, a] where r, g, b are between 0 and 255, and a is between 0 and 1.
     */
    setColor(x, y, color, { quietly = false, validate = true } = {}) {
        if (validate) {
            validateNumber(x, "x", {start: 0, end: this.#width - 1,  integerOnly: true});
            validateNumber(y, "y", {start: 0, end: this.#height - 1, integerOnly: true});
            validateColorArray(color);
        }

        // consider all colors with alpha 0 as the same color [transparent black]
        color = color[3] === 0 ? [0, 0, 0, 0] : color;

        if (!quietly) {
            this.#lastActions.push({
                x: x,
                y: y,
                colorOld: this.#pixelMatrix[y][x].color,
                colorNew: color,
            });
        }
        this.#pixelMatrix[y][x].color = color;
    }

    /**
     * Returns pixel data at position (x, y)
     * @method
     * @param {number} x
     * @param {number} y
     * @returns {Object}
     */
    get(x, y) {
        validateNumber(x, "x", {start: 0, end: this.#width - 1,  integerOnly: true});
        validateNumber(y, "y", {start: 0, end: this.#height - 1, integerOnly: true});

        return this.#pixelMatrix[y][x];
    }

    /**
     * Returns pixel color at position (x, y)
     * @method
     * @param {number} x
     * @param {number} y
     * @param {[number, number, number, number]} An array containing color data [red, green, blue, alpha]
     */
    getColor(x, y) {
        return this.get(x, y).color;
    }

    /**
     * Returns last edited pixel positions with the new colors in an array 
     * @method
     * @returns {Array} An array containing the x, y and color of each lastly edited pixel [{x: x1, y: y1, color: c1}, {x: x2, y: y2, color: c2} ...]
     */
    get getLastActions() {
        return this.#lastActions;
    }

    /**
     * Returns the width of the canvas
     * @method
     * @returns {number} The width of the canvas
     */
    get getWidth() {
        return this.#width;
    }

    /**
     * Returns the height of the canvas
     * @method
     * @returns {number} The height of the canvas
     */
    get getHeight() {
        return this.#height;
    }
}

export default CanvasGrid;
