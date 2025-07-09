import { validateNumber } from "@src/utils/validation.js";
import LayerManager from "@src/core/managers/layer-manager.js";
import ToolManager from "@src/core/managers/tool-manager.js";
import Canvas from "@src/core/ui-components/canvas.js";
import { PixelRectangleBounds } from "@src/types/pixel-types.js";
import DualColorSelector from "./ui-components/dual-selector.js";
import ColorPalette from "./ui-components/color-palette.js";
import { AppEventEmitter, AppEvents } from "@src/core/events.js";
import EventEmitter from "@src/services/event-emitter.js";
import ToolBar from "./ui-components/tool-bar.js";

/**
 * Responsible for managing events and functionalities of the canvas element inside its container
 * @class
 */
class PixelEditor {
    private layerManager: LayerManager;
    private toolManager: ToolManager;
    private width: number;
    private height: number;
    private canvas: Canvas;

    private dualSelector: DualColorSelector;
    private colorPalette: ColorPalette;
    private toolBar: ToolBar;

    private events: AppEventEmitter = new EventEmitter<AppEvents>();

    /**
     * Creates a canvas elements inside the given container and initializes it with width and height
     * @constructor
     * @param htmlComponents - Group of all UI controlling components
     * @param htmlComponents.canvasContainer - The DOM Element that will contain the canvas
     * @param htmlComponents.paletteContainer - The DOM Element that will contain the color palette
     * @param htmlComponents.dualSelector - The DOM Element that will contain the color index
     * @param width - Integer represents the width of the canvas, range is [0, 1024] inclusive
     * @param height - Integer represents the height of the canvas, range is [0, 1024] inclusive
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    constructor({
        canvasContainer,
        paletteContainer,
        dualSelector,
        toolContainer,
    }: {
        canvasContainer: HTMLElement,
        paletteContainer: HTMLElement,
        dualSelector: HTMLElement,
        toolContainer: HTMLElement,
    }, width: number, height: number) {
        this.canvas = new Canvas(canvasContainer, this.events);
        this.colorPalette = new ColorPalette(paletteContainer, this.events);
        this.dualSelector = new DualColorSelector(dualSelector, this.events);
        this.toolBar = new ToolBar(toolContainer, this.events);

        this.toolManager = new ToolManager({
            drawing: {
                activeLayer: null,
                previewLayer: null,
                color: this.dualSelector.color,
                size: 1,
            }
        }, {
            line: {},
            pencil: { drawShape: "round" },
            eraser: { eraseShape: "round" },
            bucket: { tolerance: 1 }
        });
        this.toolManager.getToolNames().forEach(val => {
            this.toolBar.addTool(val);
        });

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
    createBlankBoard(width: number, height: number) {
        validateNumber(width, "Width", { integerOnly: true, start: 1, end: 1024 });
        validateNumber(height, "Height", { integerOnly: true, start: 1, end: 1024 });

        this.width = width;
        this.height = height;

        this.canvas.createBlankCanvas(width, height);

        this.layerManager = new LayerManager(width, height);
        this.layerManager.add("Background");

        this.toolManager.serviceConfigs.drawing.activeLayer = this.layerManager.activeLayer;
        this.toolManager.serviceConfigs.drawing.previewLayer = this.layerManager.previewLayer;
    }

    /**
     * Loads image into the current layer
     * @method
     * @param clientX - The x position on the scaled canvas element to put the image
     * @param clientY - The y position on the scaled canvas element to put the image
     * @throws {TypeError} if the imageURL is not a valid image url
     */
    async loadImage(clientX: number, clientY: number, imageURL: string) {
        let pixel = this.canvas.getPixelPosition(clientX, clientY);

        const image: ImageData = await new Promise((resolve, reject) => {

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
            }
            img.onerror = () => reject(new Error("Image failed to load"));
        });

        this.layerManager.activeLayer.loadImage(image, pixel.x, pixel.y);
    }

    render(bounds: PixelRectangleBounds = { x0: 0, y0: 0, x1: this.width - 1, y1: this.height - 1 }) {
        const { image, x0, y0 } = this.layerManager.renderImage(bounds);
        this.canvas.render(image, x0, y0);
    }

    setupEvents() {
        this.events.on("dual-selector:colors-switched", () => {
            this.toolManager.serviceConfigs.drawing.color = this.dualSelector.switchColors();
        });

        this.events.on("dual-selector:colors-swapped", () => {
            this.toolManager.serviceConfigs.drawing.color = this.dualSelector.swapColors();
        });

        this.events.on("dual-selector:colors-reset", () => {
            this.toolManager.serviceConfigs.drawing.color = this.dualSelector.resetColors();
        });

        this.events.on("palette:color-chose", ({ color }) => {
            this.dualSelector.setColor(color);
            this.toolManager.serviceConfigs.drawing.color = color;
        });

        this.events.on("palette:color-added", ({ color }) => {
            this.colorPalette.addColor(color);
        });

        this.events.on("tool-bar:tool-selected", ({ toolName }) => {
            this.toolManager.setTool(toolName);
        });

        this.events.on("canvas:interacted", ({ event }) => {
            this.toolManager.useTool(event);
            this.render();
        });

        this.events.on("canvas:undone", ({ }) => {
            this.layerManager.activeLayer.undo();
            this.render();
        });
        this.events.on("canvas:redone", ({ }) => {
            this.layerManager.activeLayer.redo();
            this.render();
        });
    }
}

export default PixelEditor;
