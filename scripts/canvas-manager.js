import { validateNumber, validateColorArray } from "./validation.js";

/*
 * Responsible for managing the canvas element inside its container
 * @class
 */
class CanvasManager {
    #containerElement;
    #canvasElement;
    #canvasContext;

    #initScale = 1; // the inital scale applied on the canvas to fit in the containerElement
    #scale = 1; // the scale applied by the user on the canvas
     
    //#isDragging = false;
    #startX = 0;
    #startY = 0;
    #offsetX = 0;
    #offsetY = 0;


    /*
     * Creates a canvas elements inside the given container and manages its functionalities
     * @constructor
     * @param {HTMLElement} containerElement - The DOM Element that will contain the canvas
     * @throws {TypeError} if containerElement is not an instance of HTMLElement
     */
    constructor(containerElement) {
        if ((!containerElement) instanceof HTMLElement)
            throw new TypeError(
                "containerElement must be an instance of HTMLElement",
            );

        // Setup canvas element
        this.#canvasElement = document.createElement("canvas");
        this.#containerElement = containerElement;
        this.#canvasElement.id = "canvas-image";

        this.#containerElement.appendChild(this.#canvasElement);

        // Setup canvas context
        this.#canvasContext = this.#canvasElement.getContext("2d", { alpha: false });
        this.#canvasContext.imageSmoothingEnabled = false;
    }

    /*
     * Creates a blank canvas with given width and height, and scale it to the container size
     * @method
     * @param {number} width - Integer represents the number of pixel columns in the canvas, range is [0, 1024] inclusive
     * @param {number} height - Integer represents the number of pixel rows in the canvas, range is [0, 1024] inclusive
     * @returns {Object} An object containing the converted (x, y) position in the form of {x: xPos, y: yPos}
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    createBlankCanvas(width, height) {
        validateNumber(width, "Width", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        validateNumber(height, "Height", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });

        const containerRect = this.#containerElement.getBoundingClientRect();

        this.#initScale = Math.min(
            containerRect.width / width,
            containerRect.height / height,
        );

        this.#canvasElement.width = width;
        this.#canvasElement.height = height;
        this.#canvasElement.style.width = `${this.#initScale * this.#scale * width}px`;
        this.#canvasElement.style.height = `${this.#initScale * this.#scale * height}px`;
    }

    /*
     * Refreshes canvas initial scale according to the modification done on the container element size, or on the canvas size itself
     * @method
     * @param {boolean} [dimensionsChanged=false] - Boolean value stating if the initial scale needs to be updated too
     */
    refresh(dimensionsChanged = false) {
        if (dimensionsChanged) {
            const containerRect =
                this.#containerElement.getBoundingClientRect();

            this.#initScale = Math.min(
                containerRect.width /
                this.#canvasElement.width,
                containerRect.height /
                this.#canvasElement.height,
            );
        }

        this.#canvasElement.style.width = `${this.#initScale * this.#scale * this.#canvasElement.width}px`;
        this.#canvasElement.style.height = `${this.#initScale * this.#scale * this.#canvasElement.height}px`;
    }

    render(imageData, x = 0, y = 0) {
        if (!(imageData instanceof ImageData)) throw new TypeError();
        validateNumber(x, "x");
        validateNumber(y, "y");

        this.#canvasContext.putImageData(imageData, x, y);
    }

    /*
     * Sets dimensions of the canvas element
     * @method
     * @param {number} width - Integer represents the number of pixel columns in the canvas, range is [0, 1024] inclusive
     * @param {number} height - Integer represents the number of pixel rows in the canvas, range is [0, 1024] inclusive
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    setDimensions(width, height) {
        validateNumber(width, "Width", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        validateNumber(height, "Height", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        this.#canvasElement.width = width;
        this.#canvasElement.height = height;
    }

    addOffset(offsetX, offsetY) {

    }

    /*
     * Applies scale to the canvas
     * @method
     * @param {number} scale - Scale applied by the user
     * @throws {TypeError} if the scale is not valid number
     */
    setScale(scale) {
        validateNumber(scale, "Scale");

        const minScale = 0.5;
        const maxScale =
            Math.min(
                parseInt(getComputedStyle(this.#containerElement).width),
                parseInt(getComputedStyle(this.#containerElement).height),
            ) / this.#initScale;

        this.#scale = Math.max(Math.min(scale, maxScale), minScale);
    }

    getPixelPosition(clientX, clientY) {
        const rect = this.#canvasElement.getBoundingClientRect();
        return {
            x: Math.floor((clientX - rect.left) / (this.#initScale * this.#scale)),
            y: Math.floor((clientY - rect.top) / (this.#initScale * this.#scale)),
        }
    }

    get getContainer() {
        return this.#containerElement;
    }
    get getCanvas() {
        return this.#canvasElement;
    }
    get getCanvasContext() {
        return this.#canvasContext;
    }
    get getContainerWidth() {
        return this.#containerElement.style.width;
    }
    get getContainerHeight() {
        return this.#containerElement.style.height;
    }
    get getWidth() {
        return this.#canvasElement.width;
    }
    get getHeight() {
        return this.#canvasElement.height;
    }
    get getInitialScale() {
        return this.#initScale;
    }

    get getScale() {
        return this.#scale;
    }
}

export default CanvasManager;
