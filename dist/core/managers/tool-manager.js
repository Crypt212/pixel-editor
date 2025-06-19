import Color from "../../services/color.js";
import PenTool from "../tools/implementations/pen-tool.js";
import { validateNumber } from "../../utils/validation.js";
/**
 * Class for managing the canvas tools and their functionalities
 * @class
 */
export default class ToolManager {
    drawColor;
    eraseColor;
    drawSize;
    eraseSize;
    selectedTool;
    tools;
    drawingColor = Color.get({ hex: "#0f0" });
    eraserColor = Color.get({ hex: "#0000" });
    /**
     * Creates a ToolManager class that manages tools for the canvas, and applies their functionalities to the layerSystem and drawingManager, and renders the result to canvasManager
     * @constructor
     * @param events - the event bus that will be used to subscribe to events
     * @param image - the image data that will be used to draw on
     */
    constructor(context) {
        this.tools = new Map([
            ["pen", new PenTool(context)],
        ]);
        this.selectedTool = this.tools.get("pen");
    }
    setDrawingColor(color) {
        this.drawColor = color;
    }
    setErasingColor(color) {
        this.eraseColor = color;
    }
    setDrawingSize(size) {
        validateNumber(size, "Size", { start: 1, integerOnly: true });
        this.drawSize = size;
    }
    setErasingSize(size) {
        validateNumber(size, "Size", { start: 1, integerOnly: true });
        this.eraseSize = size;
    }
}
// private tolerance: number;
// private intensity: number;
// private image: ImageData;
// setTolerance(tolerance: number) {
//     validateNumber(tolerance, "Tolerance", { start: 1, integerOnly: true });
//     this.tolerance = tolerance;
// }
//
// setIntensity(intensity: number) {
//     validateNumber(intensity, "Intensity", { start: 1, integerOnly: true });
//     this.intensity = intensity;
// }
//
// use(event: string, pixelPosition: {x: number, y: number}) {
//     let metaData;
//     let command;
//     switch (this.toolName) {
//         case "pen":
//             metaData = {
//                 size: this.drawSize,
//                 color: this.drawColor,
//             };
//             break;
//         case "eraser":
//             metaData = {
//                 size: this.eraseSize,
//                 color: this.eraseColor,
//             };
//             break;
//         case "line":
//             metaData = {
//                 thicknessTimeFunction: () => this.drawSize,
//                 color: this.drawColor,
//             };
//             break;
//         case "bucket":
//             metaData = {
//                 tolerance: this.tolerance,
//                 color: this.drawColor,
//             };
//             break;
//     }
//
//     switch (event) {
//         case "start-action":
//             this.drawingTool.startAction(this.toolName, metaData);
//             // this.#events.emit("layer:preview", {
//             //     this.#drawingTool.action(pixelPosition)
//             // });
//             this.render(this.drawingTool.action(pixelPosition));
//             break;
//         case "move-action":
//             // this.#events.emit("layer:repreview", {
//             //     this.#drawingTool.action(pixelPosition)
//             // });
//             this.render(this.drawingTool.action(pixelPosition));
//             break;
//         case "mousehover":
//             //this.render(this.#drawingManager.preview(pixelPosition));
//             break;
//         case "end-action":
//             // this.#events.emit("layer:perform", {
//             //     this.#drawingTool.action(pixelPosition)
//             // });
//             //this.render(this.#drawingManager.action(pixelPosition));
//             // ended action
//             this.drawingTool.endAction();
//             break;
//         case "eye-dropper":
//             // !!!
//             break;
//     }
// }
