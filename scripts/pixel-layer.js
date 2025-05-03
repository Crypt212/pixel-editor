import { validateNumber } from "./validation.js";
import ActionHistory from "./action-history.js";
import ChangeRegion from "./change-region.js";
import Color from "./color.js";

/**
 * Represents a canvas grid system
 * @class
 */
class PixelLayer {

    /**
     * The width of the canvas
     * @type {number}
     */
    #width;

    /**
     * The height of the canvas
     * @type {number}
     */
    #height;

    /**
     * The action history system to store main changes
     * @type {ActionHistory}
     */
    #actionHistory = new ActionHistory(64);

    /**
     * @typedef Pixel
     * @property {number} x - X-coordinate
     * @property {number} y - Y-coordinate
     * @property {Color} color - Color of the pixel
     */

    /**
     * The 2-D grid containing the Pixel data of the canvas
     * @type {Pixel[][]}
     */
    #pixelMatrix;

    /**
     * Buffer logs changes performed on pixels (Ex. color change)
     * @type {ChangeRegion}
     */
    #changeBuffer = new ChangeRegion();

    /**
     * Creates a blank canvas with specified width and height
     * @constructor
     * @param {number} [width=1] - The width of the grid
     * @param {number} [height=1] - The height of the grid
     * @throws {TypeError} If width or height are not integers
     * @throws {RangeError} If width or height are not between 1 and 1024 inclusive
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
        this.#changeBuffer = new ChangeRegion();
        this.initializeBlankCanvas(width, height);
    }

    /**
     * Initializes the canvas with a blank grid of transparent pixel data
     * @method
     * @param {number} width - The width of the grid
     * @param {number} height - The height of the grid
     * @throws {TypeError} If width or height are not integers
     * @throws {RangeError} If width or height are not between 1 and 1024 inclusive
     */
    initializeBlankCanvas(width, height) {
        validateNumber(width, "Width", { start: 1, end: 1024, integerOnly: true });
        validateNumber(height, "Height", { start: 1, end: 1024, integerOnly: true });

        this.#width = width;
        this.#height = height;
        this.#pixelMatrix = new Array(height);
        for (let i = 0; i < this.#height; i++) {
            this.#pixelMatrix[i] = new Array(width);
            for (let j = 0; j < this.#width; j++) {
                this.#pixelMatrix[i][j] = {
                    x: j,
                    y: i,
                    color: Color.TRANSPARENT,
                };
            }
        }
    }

    /**
     * Loads an image data at (x, y) position
     * @method
     * @param {ImageData} imageData - The image to be loaded
     * @param {number} [x=0] - X-coordinate
     * @param {number} [y=0] - Y-coordinate
     * @throws {TypeError} If x or y are not integers
     * @throws {TypeError} If imageData is not instance of class ImageData
     */
    loadImage(imageData, x = 0, y = 0) {
        validateNumber(x, "x", { integerOnly: true });
        validateNumber(y, "y", { integerOnly: true });

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

                let red = imageData.data[dist + 0];
                let green = imageData.data[dist + 1];
                let blue = imageData.data[dist + 2];
                let alpha = imageData.data[dist + 3];

                this.setColor(j, i, Color.create({ rgb: [red, green, blue], alpha: alpha / 255 }));
            }
        }
    }

    /**
     * Resets changes buffer to be empty
     * @method
     * @returns {ChangeRegion} Change buffer before emptying
     */
    resetChangeBuffer() {
        let changeBuffer = this.#changeBuffer;
        this.#changeBuffer = new ChangeRegion();
        return changeBuffer;
    }

    /**
     * Creates a new action to the history with given name
     * @param {string} actionName - The name of the the new action
     * @method
     * @throws {TypeError} If actionName is not a string
     */
    createAction(actionName) {
        if (typeof actionName !== "string")
            throw new TypeError("Action name must be a string");

        this.#actionHistory.addActionGroup(actionName);
    }

    /**
     * Commits current buffer to current action in history then resets change buffer
     * @method
     */
    commitChange() {
        this.#actionHistory.addActionData(this.changeBuffer);
        this.resetChangeBuffer();
    }

    /**
     * Undos an action
     * @method
     */
    undo() {
        let changeBuffers = this.#actionHistory.getActionData();
        for (let i = changeBuffers.length - 1; i >= 0; i++) {
            for (let change of changeBuffer[i].beforeStates) {
                this.setColor(change.x, change.y, change.state, { quietly: true, });
            }
        }
        this.#actionHistory.undo();
    }

    /**
     * Redos an action
     * @method
     */
    redo() {
        this.#actionHistory.redo();
        let changeBuffers = this.#actionHistory.getActionData();
        for (let i = 0; i < changeBuffers.length; i++) {
            for (let change of changeBuffer[i].afterStates) {
                this.setColor(change.x, change.y, change.state, { quietly: true, });
            }
        }
    }

    /**
     * Sets color to pixel at position (x, y).
     * @method
     * @param {number} x - X-coordinate.
     * @param {number} y - X-coordinate.
     * @param {Color} color - The Color object to be set
     * @param {Object} options - An object containing additional options.
     * @param {boolean} [options.quietly=false] - If set to true, the pixel data at which color changed will not be pushed to the changeBuffers array.
     * @param {boolean} [options.validate=true] - If set to true, the x, y, and color types are validated.
     * @throws {TypeError} If validate is true and if color is not a valid Color object
     * @throws {TypeError} If validate is true and if x and y are not valid integers in valid range.
     * @throws {RangeError} If validate is true and if x and y are not in valid range.
     */
    setColor(x, y, color, { quietly = false, validate = true } = {}) {
        if (validate) {
            validateNumber(x, "x", { start: 0, end: this.#width - 1, integerOnly: true });
            validateNumber(y, "y", { start: 0, end: this.#height - 1, integerOnly: true });
            if (!(color instanceof Color)) {
                throw new Error("color must be object of Color class");
            }
        }

        if (!quietly) {
            this.#changeBuffer.setChange(x, y,
                color,
                this.#pixelMatrix[y][x].color,
            );
        }
        this.#pixelMatrix[y][x].color = color;
    }

    /**
     * Returns pixel data at position (x, y)
     * @method
     * @param {number} x - X-coordinate
     * @param {number} y - Y-coordinate
     * @returns {Pixel} Pixel data at position (x, y)
     */
    get(x, y) {
        validateNumber(x, "x", { start: 0, end: this.#width - 1, integerOnly: true });
        validateNumber(y, "y", { start: 0, end: this.#height - 1, integerOnly: true });

        return this.#pixelMatrix[y][x];
    }

    /**
     * Returns pixel color at position (x, y)
     * @method
     * @param {number} x - X-coordinate
     * @param {number} y - Y-coordinate
     * @returns {Color} Color object of pixel at position (x, y)
     */
    getColor(x, y) {
        return this.get(x, y).color;
    }

    /**
     * Returns copy of change buffer
     * @method
     * @returns {ChangeRegion} Copy of change buffer
     */
    get changeBuffer() {
        return this.#changeBuffer.clone();
    }

    /**
     * Returns the width of the canvas
     * @method
     * @returns {number} The width of the canvas
     */
    get width() {
        return this.#width;
    }

    /**
     * Returns the height of the canvas
     * @method
     * @returns {number} The height of the canvas
     */
    get height() {
        return this.#height;
    }
}

export default PixelLayer;
