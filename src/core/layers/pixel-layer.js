import { validateNumber } from "#utils/validation.js";
import History from "#services/history.js";
import Color from "#services/color.js";
import ChangeRegion from "#services/change-region.js";

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
     * Current used action
     * @type {boolean}
     */
    #inAction = false;

    /**
     * The action history system to store main changes
     * @type {History}
     */
    #history = new History(64);

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

                this.setColor(j, i, Color.create({ rgb: [red, green, blue], alpha: alpha / 255 }), { quietly: true });
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
     * Starts a new action into the history with given name and timeout protection
     * @param {string} actionName - The name 
     * @param {number} [timeoutMs=30000] of the the new action
     * @method
     * @throws {TypeError} If actionName is not a string
     */
    startAction(actionName, timeoutMs = 30000) {
        if (typeof actionName !== "string")
            throw new TypeError("Action name must be a string");

        if (this.#inAction) this.endAction();
        this.#history.addRecord();
        this.#history.setRecordData({
            name: actionName,
            start: Date.now(),
            timeout: setTimeout(() => {
                if (this.isInAction) this.cancelAction();
            }, timeoutMs),
            change: new ChangeRegion(),
            steps: [],
        });
        this.#inAction = true;
    }

    /**
     * Commits current pixel buffer to current action in history then resets change buffer
     * @method
     * @throws {Error} If no active action exists
     */
    addActionStep() {
        if (!this.#history.getRecordData())
            throw new Error("No active action to add step to");

        const record = this.#history.getRecordData();

        if (currentBuffer.isEmpty) return;

        if (record.steps.length === 10 || this.changeBuffer.length >= 100) {
            record.steps.reduce((acc, st) => acc.mergeInPlace(st), record.change);
            record.steps = [];
        }

        this.#history.getRecordData().steps.push(this.#changeBuffer);

        this.resetChangeBuffer();
    }

    /**
     * Ends the current action in the history
     * @method
     */
    endAction() {
        if (!this.isInAction) return;
        this.#inAction = false;
    }

    /**
     * Cancels the current action in the history
     * @method
     */
    cancelAction() {
        if (!this.isInAction) return;
        this.endAction();
        this.undo();
    }

    /**
     * Undos an action
     * @method
     */
    undo() {
        this.cancelAction();

        if (this.#history.isStart) return;

        const record = this.#history.getRecordData();

        // If not already merged, merge and cache it
        if (record.steps.length !== 0) {
            record.steps.reduce((acc, st) => acc.mergeInPlace(st), record.change);
            record.steps = [];
        }

        // Apply before states
        for (const change of record.change.beforeStates) {
            this.setColor(change.x, change.y, change.state, { quietly: true });
        }

        this.#history.undo();
    }

    /**
     * Redos an action
     * @method
     */
    redo() {
        this.cancelAction();

        if (this.#history.isEnd) return;

        this.#history.redo();

        const record = this.#history.getRecordData();

        // If not already merged, merge and cache it
        if (record.steps.length !== 0) {
            record.steps.reduce((acc, st) => acc.mergeInPlace(st), record.change);
            record.steps = [];
        }

        for (const change of record.change.afterStates) {
            this.setColor(change.x, change.y, change.state, { quietly: true });
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
     * @throws {TypeError} If validate is true and color is not a valid Color object
     * @throws {TypeError} If validate is true and x and y are not valid integers in valid range.
     * @throws {RangeError} If validate is true and if x and y are not in valid range.
     * @throws {Error} If not quiet when no action is active
     */
    setColor(x, y, color, { quietly = false, validate = true } = {}) {
        if (validate) {
            validateNumber(x, "x", { start: 0, end: this.#width - 1, integerOnly: true });
            validateNumber(y, "y", { start: 0, end: this.#height - 1, integerOnly: true });
            if (!(color instanceof Color)) {
                throw new TypeError("color must be object of Color class");
            }
        }

        if (!quietly) {
            if (!this.isInAction)
                throw new Error("Cannot set color outside of an action");
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

    /**
     * Returns whether an action is active
     * @method
     * @returns {boolean} Whether an action is active
     */
    get isInAction() {
        return this.#inAction;
    }
}

export default PixelLayer;
