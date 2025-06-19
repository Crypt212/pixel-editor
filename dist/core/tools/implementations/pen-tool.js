import { ContinousTool } from "../base/tool-base.js";
import Color from "../../../services/color.js";
import PixelChanges from "../../../services/pixel-change.js";
import { drawLine, drawPixel } from "../../../core/algorithms/graphic-algorithms.js";
export default class PenTool extends ContinousTool {
    context;
    startState = null;
    recentState = null;
    redraw = false;
    toolEventState = "idle";
    selectedColor = Color.get({ hex: '#0f0' });
    preview = false;
    changes = new PixelChanges();
    constructor(context) {
        super();
        this.context = context;
        this.setPixel = this.setPixel.bind(this);
    }
    setPixel(x, y) {
        if (x < 0 ||
            y < 0 ||
            x >= this.context.width ||
            y >= this.context.height)
            return;
        this.context.setColor(x, y, this.selectedColor);
    }
    ;
    mouseDown(coord) {
        console.log("down!");
        if (this.toolEventState !== "idle")
            return null;
        this.toolEventState = "start";
        this.context.startAction("Pen Tool");
        this.startState = this.recentState = coord;
        drawPixel({
            x: this.startState.x,
            y: this.startState.y,
            setPixel: this.setPixel
        });
        this.toolEventState = "draw";
        return this.context.commitStep().bounds;
    }
    mouseMove(coord) {
        if (this.toolEventState == "draw" || this.toolEventState == "start")
            this.toolEventState = "draw";
        else
            return null;
        drawLine({
            x0: this.recentState.x,
            y0: this.recentState.y,
            x1: coord.x,
            y1: coord.y,
            setPixel: (x, y) => drawPixel({ x, y, setPixel: this.setPixel }),
        });
        this.recentState = coord;
        return this.context.commitStep().bounds;
    }
    mouseUp(coord) {
        if (this.toolEventState == "draw" || this.toolEventState == "start")
            this.toolEventState = "idle";
        else
            return null;
        drawLine({
            x0: this.recentState.x,
            y0: this.recentState.y,
            x1: coord.x,
            y1: coord.y,
            setPixel: (x, y) => drawPixel({ x, y, setPixel: this.setPixel }),
        });
        this.recentState = this.startState = null;
        const bounds = this.context.commitStep().bounds;
        this.context.endAction();
        return bounds;
    }
}
