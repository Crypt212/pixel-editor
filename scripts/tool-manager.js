import { validateColorArray, validateNumber } from "./validation.js";

/*
 * Class for managing the canvas tools and their functionalities
 * @class
 */
class ToolManager {
    toolName = "pen";
    #drawColor = [255, 0, 0, 1];
    #eraseColor = [0, 0, 0, 0];
    #drawSize = 4;
    #eraseSize = 3;
    #tolerance = 1;
    #intensity = 1;

    #canvasManager;
    #layerSystem;
    #drawingManager;

    /*
     * Creates a ToolManager class that manages tools for the canvas, and applies their functionalities to the layerSystem and drawingManager, and renders the result to canvasManager
     * @constructor
     * @param {CanvasManager} canvasManager - the canvasManager that will be rendered to
     * @param {LayerSystem} layerSystem - the layerSystem that the tool will be applied to
     * @param {DrawingManager} drawingManager - the drawingManager that tool will be rendered to
     */
    constructor(canvasManager, layerSystem, drawingManager) {
        this.#canvasManager = canvasManager;
        this.#layerSystem = layerSystem;
        this.#drawingManager = drawingManager;
    }

    setDrawingColor(color) {
        color = chroma(color).rgba();
        validateColorArray(color);
        this.#drawColor = color;
    }

    setErasingColor(color) {
        color = chroma(color).rgba();
        validateColorArray(color);
        this.#eraseColor = color;
    }

    setDrawingSize(size) {
        validateNumber(size, "Size", { start: 1, integerOnly: true });
        this.#drawSize = size;
    }

    setErasingSize(size) {
        validateNumber(size, "Size", { start: 1, integerOnly: true });
        this.#eraseSize = size;
    }

    setTolerance(tolerance) {
        validateNumber(tolerance, "Tolerance", { start: 1, integerOnly: true });
        this.#tolerance = tolerance;
    }

    setIntensity(intensity) {
        validateNumber(intensity, "Intensity", { start: 1, integerOnly: true });
        this.#intensity = intensity;
    }

    use(event, clientX, clientY) {
        const pixelPosition = this.#canvasManager.getPixelPosition(
            clientX,
            clientY,
        );
        let metaData;
        switch (this.toolName) {
            case "pen":
                metaData = {
                    size: this.#drawSize,
                    color: this.#drawColor,
                };
                break;
            case "eraser":
                metaData = {
                    size: this.#eraseSize,
                    color: this.#eraseColor,
                };
                break;
            case "line":
                metaData = {
                    thicknessTimeFunction: () => this.#drawSize,
                    color: this.#drawColor,
                };
                break;
            case "bucket":
                metaData = {
                    tolerance: this.#tolerance,
                    color: this.#drawColor,
                };
                break;
        }
        switch (event) {
            case "mousedown":
                this.#drawingManager.startAction(this.toolName, metaData);
                this.render(this.#drawingManager.action(pixelPosition));
                break;
            case "mousedraw":
                this.render(this.#drawingManager.action(pixelPosition));
                break;
            case "mousehover":
                //this.render(this.#drawingManager.preview(pixelPosition));
                break;
            case "mouseup":
                //this.render(this.#drawingManager.action(pixelPosition));
                // ended action
                this.#drawingManager.endAction();
                break;
            case "eye-dropper":
                // !!!
                break;
        }
    }

    render(toRender) {
        if (toRender.pixelPositions.length == 0) return;

        this.#canvasManager.render(
            this.#layerSystem.getRenderImage(
                this.#canvasManager.getCanvasContext,
                toRender.dimensions.x0,
                toRender.dimensions.y0,
                toRender.dimensions.x1,
                toRender.dimensions.y1,
                toRender.pixelPositions,
            ),
            toRender.dimensions.x0,
            toRender.dimensions.y0,
        );
    }
}

export default ToolManager;
