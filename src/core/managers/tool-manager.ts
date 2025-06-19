import Color from "@src/services/color.js";
import Tool from "@src/core/tools/base/tool-base.js";
import PenTool from "../tools/implementations/pen-tool.js";

import Historyable from "@src/interfaces/historyable.js";
import Drawable from "@src/interfaces/drawable.js";
import { validateNumber } from "@src/utils/validation.js";

/**
 * Class for managing the canvas tools and their functionalities
 * @class
 */
export default class ToolManager {
    private drawColor: Color;
    private eraseColor: Color;
    private drawSize: number;
    private eraseSize: number;
    selectedTool: Tool;
    tools: Map<string, Tool>;
    drawingColor: Color = Color.get({ hex: "#0f0" });
    eraserColor: Color = Color.get({ hex: "#0000" });

    /**
     * Creates a ToolManager class that manages tools for the canvas, and applies their functionalities to the layerSystem and drawingManager, and renders the result to canvasManager
     * @constructor
     * @param events - the event bus that will be used to subscribe to events
     * @param image - the image data that will be used to draw on
     */
    constructor(context: Historyable & Drawable) {
        this.tools = new Map([
            ["pen", new PenTool(context)],
        ]);
        this.selectedTool = this.tools.get("pen");
    }

    setDrawingColor(color: Color) {
        this.drawColor = color;
    }

    setErasingColor(color: Color) {
        this.eraseColor = color;
    }

    setDrawingSize(size: number) {
        validateNumber(size, "Size", { start: 1, integerOnly: true });
        this.drawSize = size;
    }

    setErasingSize(size: number) {
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

