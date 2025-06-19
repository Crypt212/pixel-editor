import { validateNumber } from "../utils/validation.js";
import LayerManager from "../core/managers/layer-manager.js";
import ToolManager from "../core/managers/tool-manager.js";
import EventBus from "../services/event-bus.js";
import Canvas from "../core/ui-components/canvas.js";
/**
 * Responsible for managing events and functionalities of the canvas element inside its container
 * @class
 */
class PixelEditor {
    layerManager;
    toolManager;
    width;
    height;
    canvas;
    events;
    /**
     * Creates a canvas elements inside the given container and initializes it with width and height
     * @constructor
     * @param width - Integer represents the width of the canvas, range is [0, 1024] inclusive
     * @param height - Integer represents the height of the canvas, range is [0, 1024] inclusive
     * @param {HTMLElement} containerElement - The DOM Element that will contain the canvas
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    constructor(containerElement, width, height) {
        this.events = new EventBus();
        this.canvas = new Canvas(containerElement, this.events);
        this.createBlankBoard(width, height);
        this.setupEvents();
    }
    /**
     * Creates a blank board with given canvas width and height
     * @method
     * @param width - Integer represents the width of the canvas, range is [0, 1024] inclusive
     * @param height - Integer represents the height of the canvas, range is [0, 1024] inclusive
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    createBlankBoard(width, height) {
        validateNumber(width, "Width", { integerOnly: true, start: 1, end: 1024 });
        validateNumber(height, "Height", { integerOnly: true, start: 1, end: 1024 });
        this.width = width;
        this.height = height;
        this.canvas.createBlankCanvas(width, height);
        this.layerManager = new LayerManager(width, height);
        this.layerManager.add("Background");
        this.toolManager = new ToolManager(this.layerManager.activeLayer);
    }
    /**
     * Loads image into the current layer
     * @method
     * @param clientX - The x position on the scaled canvas element to put the image
     * @param clientY - The y position on the scaled canvas element to put the image
     * @throws {TypeError} if the imageURL is not a valid image url
     */
    async loadImage(clientX, clientY, imageURL) {
        let pixel = this.canvas.getPixelPosition(clientX, clientY);
        const image = await new Promise((resolve, reject) => {
            // validating the imageURL and setting the img
            const pattern = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
            if (!pattern.test(imageURL))
                () => reject(TypeError("imgaeURL must be a valid image URL"));
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageURL;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
            };
            img.onerror = () => reject(new Error("Image failed to load"));
        });
        this.layerManager.activeLayer.loadImage(image, pixel.x, pixel.y);
    }
    render(bounds = { x0: 0, y0: 0, x1: this.width - 1, y1: this.height - 1 }) {
        const { image, x0, y0 } = this.layerManager.renderImage(bounds);
        this.canvas.render(image, x0, y0);
    }
    setupEvents() {
        this.events.on("tool:use", () => {
            this.toolManager.selectedTool = this.toolManager.tools.get("pen");
        });
        this.events.on("canvas:mousemove", ({ coordinates }) => {
            const bounds = this.toolManager.selectedTool.mouseMove(coordinates);
            if (bounds)
                this.render();
        });
        this.events.on("canvas:mousedown", ({ coordinates }) => {
            const bounds = this.toolManager.selectedTool.mouseDown(coordinates);
            console.log(coordinates, bounds);
            if (bounds)
                this.render();
        });
        this.events.on("canvas:mouseup", ({ coordinates }) => {
            const bounds = this.toolManager.selectedTool.mouseUp(coordinates);
            if (bounds)
                this.render();
        });
        // events.on("tool:apply-action", (actionName: string, change: PixelChanges, reapply: boolean, preview: boolean) => {
        //     this.selectedTool.applyAction(actionName, change, reapply, preview);
        // });
    }
}
export default PixelEditor;
