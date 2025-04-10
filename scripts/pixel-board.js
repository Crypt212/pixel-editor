import { validateNumber } from "./validation.js";
import LayerSystem from "./layer-system.js";
import DrawingManager from "./drawing-manager.js";
import CanvasManager from "./canvas-manager.js";
import EventManager from "./event-manager.js";
import ToolManager from "./tool-manager.js";
import DirtyRectangle from "./dirty-rectangle.js";
import Color from "./color.js";

/*
 * Responsible for managing events and functionalities of the canvas element inside its container
 * @class
 */
class PixelBoard {
    eventManager;
    layerSystem;
    drawingManager;
    canvasManager;
    toolManager;

    /*
     * Creates a canvas elements inside the given container and manages its functionalities
     * @constructor
     * @param {HTMLElement} containerElement - The DOM Element that will contain the canvas
     * @throws {TypeError} if containerElement is not an instance of HTMLElement
     */
    constructor(containerElement) {
        if ((!containerElement) instanceof HTMLElement) {
            throw new TypeError(
                "containerElement must be an instance of HTMLElement",
            );
        }

        this.canvasManager = new CanvasManager(containerElement);
    }

    /*
     * Creates a blank board with given canvas width and height
     * @method
     * @param {number} width - Integer represents the width of the canvas, range is [0, 1024] inclusive
     * @param {number} height - Integer represents the height of the canvas, range is [0, 1024] inclusive
     * @returns {Object} An object containing the converted (x, y) position in the form of {x: xPos, y: yPos}
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    createBlankBoard(width, height) {
        this.canvasManager.createBlankCanvas(width, height);
        this.layerSystem = new LayerSystem(width, height);
        this.layerSystem.addLayer("Layer 1");
        this.layerSystem.selectLayer(0);
        this.drawingManager = new DrawingManager(this.layerSystem);
        this.toolManager = new ToolManager(this.canvasManager, this.layerSystem, this.drawingManager);
        this.eventManager = new EventManager(this.canvasManager, this.toolManager, this.layerSystem);
    }

    /*
     * Creates a blank board with given canvas width and height
     * @method
     * @param {number} clientX - The x position on the scaled canvas element to put the image
     * @param {number} clientY - The y position on the scaled canvas element to put the image
     * @returns {Object} An object containing the converted (x, y) position in the form of {x: xPos, y: yPos}
     * @throws {TypeError} if the clientX or the clientY are not valid numbers
     * @throws {TypeError} if the imageURL is not a valid image url
     */
    loadImage(clientX, clientY, imageURL) {
        validateNumber(clientX, "clientX");
        validateNumber(clientY, "clientY");
        let pixel = this.getIntegerPosition(clientX, clientY);
        let img;

        new Promise((resolve, reject) => {
            // validating the imageURL and setting the img
            const pattern = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
            if (!pattern.test(imageURL))
                () => reject(TypeError("imgaeURL must be a valid image URL"));

            img = new Image();
            img.src = imageURL;

            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error("Image failed to load"));
        });

        img.addEventListener("load", () => {
            this.layerSystem.getLayerCanvas().loadImage(img, pixel.x, pixel.y);
        });
    }

    render() {
        this.canvasManager.render(this.layerSystem.getRenderImage());
    }
}

export default PixelBoard;
