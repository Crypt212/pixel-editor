import { validateNumber } from "../../utils/validation.js";
import { LayerHistory } from "../../core/layers/types/history-types.js";
import Color from "../../services/color-service.js";
import { PixelChanges } from "../../core/layers/types/pixel-types.js";
export var HistoryMove;
(function (HistoryMove) {
    HistoryMove[HistoryMove["Forward"] = 0] = "Forward";
    HistoryMove[HistoryMove["Backward"] = 1] = "Backward";
})(HistoryMove || (HistoryMove = {}));
/**
 * Represents a canvas grid system
 * @class
 */
export default class PixelLayer {
    /**
     * The width of the canvas
     */
    layerWidth;
    /**
     * The height of the canvas
     */
    layerHeight;
    /**
     * Current used action
     */
    inAction = false;
    /**
     * The action history system to store main changes
     */
    history = new LayerHistory(64);
    /**
     * The 2-D grid containing the Pixel data of the canvas
     */
    pixelMatrix;
    /**
     * Buffer logs changes performed on pixels (Ex. color change)
     */
    pixelChanges = new PixelChanges();
    /**
     * Creates a blank canvas with specified width and height
     * @constructor
     * @param [width=1] - The width of the grid
     * @param [height=1] - The height of the grid
     * @throws {TypeError} If width or height are not integers
     * @throws {RangeError} If width or height are not between 1 and 1024 inclusive
     */
    constructor(width = 1, height = 1) {
        this.initializeBlankCanvas(width, height);
    }
    /**
     * Initializes the canvas with a blank grid of transparent pixel data
     * @method
     * @param width - The width of the grid
     * @param height - The height of the grid
     * @throws {TypeError} If width or height are not integers
     * @throws {RangeError} If width or height are not between 1 and 1024 inclusive
     */
    initializeBlankCanvas(width, height) {
        validateNumber(width, "Width", { start: 1, end: 1024, integerOnly: true });
        validateNumber(height, "Height", { start: 1, end: 1024, integerOnly: true });
        this.layerWidth = width;
        this.layerHeight = height;
        this.pixelMatrix = new Array(width * height);
        for (let x = 0; x < this.layerWidth; x++) {
            for (let y = 0; y < this.layerHeight; y++) {
                this.pixelMatrix[x + this.layerWidth * y] = { color: Color.TRANSPARENT };
            }
        }
    }
    /**
     * Loads an image data at (x, y) position
     * @method
     * @param imageData - The image to be loaded
     * @param [x0=0] - X-coordinate
     * @param [y0=0] - Y-coordinate
     * @throws {TypeError} If x or y are not integers
     */
    loadImage(imageData, x0 = 0, y0 = 0) {
        validateNumber(x0, "x", { integerOnly: true });
        validateNumber(y0, "y", { integerOnly: true });
        let start_y = Math.max(y0, 0);
        let start_x = Math.max(x0, 0);
        for (let y = start_y; y < imageData.height + y0 && y < this.layerHeight; y++) {
            for (let x = start_x; x < imageData.width + x0 && x < this.layerWidth; x++) {
                let dist = (x - x0 + imageData.width * (y - y0)) * 4;
                let red = imageData.data[dist + 0];
                let green = imageData.data[dist + 1];
                let blue = imageData.data[dist + 2];
                let alpha = imageData.data[dist + 3];
                this.setColor(x, y, Color.get({ rgb: [red, green, blue], alpha: alpha / 255 }), { validate: false });
            }
        }
    }
    /**
     * Gets an image data from certain area
     * @method
     * @param [x0=0] - start X-coordinate
     * @param [y0=0] - start Y-coordinate
     * @param [x1=this.width] - end X-coordinate
     * @param [y1=this.height] - end Y-coordinate
     * @returns An image data object for the specified area of the layer
     * @throws {TypeError} If x or y are not integers
     */
    getImage(x0 = 0, y0 = 0, x1 = this.width, y1 = this.height) {
        validateNumber(x0, "x0", { start: 0, end: this.width - 1, integerOnly: true });
        validateNumber(y0, "y0", { start: 0, end: this.height - 1, integerOnly: true });
        validateNumber(x1, "x1", { start: 0, end: this.width - 1, integerOnly: true });
        validateNumber(y1, "y1", { start: 0, end: this.height - 1, integerOnly: true });
        if (x0 > x1)
            [x0, y0] = [x1, y1];
        if (y0 > y1)
            [y0, y1] = [y1, y0];
        const image = new ImageData(x1 - x0 + 1, y1 - y0 + 1);
        for (let x = x0; x <= x1; x++) {
            for (let y = y0; y <= y1; y++) {
                const dist = (x - x0 + image.width * (y - y0)) * 4;
                const color = this.getColor(x, y);
                image.data[dist + 0] = color.rgb[0];
                image.data[dist + 1] = color.rgb[1];
                image.data[dist + 2] = color.rgb[2];
                image.data[dist + 3] = Math.abs(color.alpha * 255);
            }
        }
        return image;
    }
    /**
     * Clears the layer
     * @method
     */
    clear() {
        for (let i = 0; i < this.layerHeight; i++) {
            for (let j = 0; j < this.layerWidth; j++) {
                this.setColor(j, i, Color.TRANSPARENT, { validate: false });
            }
        }
    }
    /**
     * Resets changes buffer to be empty
     * @method
     * @returns Change buffer before emptying
     */
    resetChangeBuffer() {
        const changeBuffer = this.pixelChanges;
        this.pixelChanges = new PixelChanges();
        return changeBuffer;
    }
    /**
     * Starts a new action into the history with given name
     * @param actionName - The name
     * @method
     */
    startAction(actionName) {
        if (this.inAction)
            this.endAction();
        this.history.setRecord({
            name: actionName,
            timestamp: Date.now(),
            change: new PixelChanges(),
            steps: [],
        });
        this.inAction = true;
    }
    /**
     * Commits current pixel buffer to current action in history then resets change buffer
     * @method
     * @throws {Error} If no active action to add steps to
     */
    commitActionStep() {
        if (!this.history.getRecordData())
            throw new Error("No active action to add step to");
        const record = this.history.getRecordData();
        if (this.pixelChanges.isEmpty)
            return this.pixelChanges.clone();
        if (record.steps.length === 10 || this.pixelChanges.count >= 100)
            compressActionSteps(record);
        this.history.getRecordData().steps.push(this.pixelChanges);
        return this.resetChangeBuffer();
    }
    /**
     * Ends the current action in the history
     * @method
     */
    endAction() {
        if (!this.isInAction)
            return;
        this.inAction = false;
    }
    /**
     * Cancels the current action in the history
     * @method
     */
    cancelAction() {
        if (!this.isInAction)
            return;
        this.endAction();
        this.undo();
    }
    /**
     * Undos an action
     * @method
     */
    undo() {
        this.cancelAction();
        if (this.history.atStart)
            return;
        this.history.undo();
        this.applyRecord(HistoryMove.Backward);
    }
    /**
     * Redos an action
     * @method
     */
    redo() {
        this.cancelAction();
        if (this.history.atEnd)
            return;
        this.history.redo();
        this.applyRecord(HistoryMove.Forward);
    }
    /** helper method */
    applyRecord(direction) {
        const record = this.history.getRecordData();
        let state;
        if (direction === HistoryMove.Forward)
            state = "after";
        else if (direction === HistoryMove.Backward)
            state = "before";
        if (record.steps.length !== 0)
            compressActionSteps(record);
        for (const change of record.change)
            this.setColor(change.key.x, change.key.y, change.states[state].color, { quietly: true, validate: false });
    }
    /**
     * Sets color to pixel at position (x, y).
     * @method
     * @param x - X-coordinate.
     * @param y - X-coordinate.
     * @param color - The Color object to be set
     * @param options - An object containing additional options.
     * @param [options.quietly=false] - If set to true, the pixel data at which color changed will not be pushed to the changeBuffers array.
     * @param [options.validate=true] - If set to true, the x, y, and color types are validated.
     * @throws {TypeError} If validate is true and x and y are not valid integers in valid range.
     * @throws {RangeError} If validate is true and if x and y are not in valid range.
     * @throws {Error} If not quiet when no action is active
     */
    setColor(x, y, color, { quietly = false, validate = true } = {}) {
        if (validate) {
            validateNumber(x, "x", { start: 0, end: this.layerWidth - 1, integerOnly: true });
            validateNumber(y, "y", { start: 0, end: this.layerHeight - 1, integerOnly: true });
        }
        if (!quietly) {
            if (!this.isInAction)
                throw new Error("Cannot set color outside of an action");
            const newColor = color, oldColor = this.pixelMatrix[x + y * this.layerWidth].color;
            if (!Color.isEqualTo(this.pixelMatrix[x + y * this.layerWidth].color, color)) {
                this.pixelChanges.setChange({ x, y }, { color: newColor }, { color: oldColor });
            }
        }
        this.pixelMatrix[x + y * this.layerWidth].color = color;
    }
    /**
     * Returns pixel data at position (x, y)
     * @method
     * @param x - X-coordinate
     * @param y - Y-coordinate
     * @returns Pixel data at position (x, y)
     * @throws {TypeError} If validate is true and x and y are not valid integers in valid range.
     * @throws {RangeError} If validate is true and if x and y are not in valid range.
     */
    get(x, y) {
        validateNumber(x, "x", { start: 0, end: this.layerWidth - 1, integerOnly: true });
        validateNumber(y, "y", { start: 0, end: this.layerHeight - 1, integerOnly: true });
        return this.pixelMatrix[x + y * this.layerWidth];
    }
    /**
     * Returns pixel color at position (x, y)
     * @method
     * @param x - X-coordinate
     * @param y - Y-coordinate
     * @returns Color object of pixel at position (x, y)
     */
    getColor(x, y) {
        return this.get(x, y).color;
    }
    /**
     * Returns copy of change buffer
     * @method
     * @returns Copy of change buffer
     */
    get changeBuffer() {
        return this
            .pixelChanges.clone();
    }
    /**
     * Returns the width of the canvas
     * @method
     * @returns The width of the canvas
     */
    get width() {
        return this.layerWidth;
    }
    /**
     * Returns the height of the canvas
     * @method
     * @returns The height of the canvas
     */
    get height() {
        return this.layerHeight;
    }
    /**
     * Returns whether an action is active
     * @method
     * @returns Whether an action is active
     */
    get isInAction() {
        return this.inAction;
    }
}
function compressActionSteps(record) {
    record.steps.reduce((totalChange, step) => totalChange.mergeMutable(step), record.change);
    record.steps = [];
}
