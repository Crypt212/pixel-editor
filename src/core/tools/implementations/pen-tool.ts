import Drawable from "@src/interfaces/drawable.js";
import { ContinousTool } from "../base/tool-base.js";
import Historyable from "@src/interfaces/historyable.js";
import { PixelCoord, PixelRectangleBounds } from "@src/types/pixel-types.js";
import Color from "@src/services/color.js";
import PixelChanges from "@src/services/pixel-change.js";
import { drawLine, drawPixel } from "@src/core/algorithms/graphic-algorithms.js";

export default class PenTool extends ContinousTool {
    private context: Drawable & Historyable;
    protected startState: PixelCoord | null = null;
    protected recentState: PixelCoord | null = null;
    protected readonly redraw: boolean = false;
    protected toolEventState: "start" | "draw" | "idle" = "idle";
    protected selectedColor: Color = Color.get({ hex: '#0f0' });
    protected preview: boolean = false;
    protected changes: PixelChanges = new PixelChanges();

    constructor(context: Drawable & Historyable) {
        super();
        this.context = context;
        this.setPixel = this.setPixel.bind(this);
    }

    private setPixel(x: number, y: number) {
        if (
            x < 0 ||
            y < 0 ||
            x >= this.context.width ||
            y >= this.context.height
        )
            return;

        this.context.setColor(x, y, this.selectedColor);
    };

    mouseDown(coord: PixelCoord): PixelRectangleBounds | null {
        console.log("down!");
        if (this.toolEventState !== "idle") return null;

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

    mouseMove(coord: PixelCoord): PixelRectangleBounds | null {
        if (this.toolEventState == "draw" || this.toolEventState == "start")
            this.toolEventState = "draw";
        else return null;

        drawLine({
            x0: this.recentState.x,
            y0: this.recentState.y,
            x1: coord.x,
            y1: coord.y,
            setPixel: (x: number, y: number) => drawPixel({ x, y, setPixel: this.setPixel }),
        });

        this.recentState = coord;

        return this.context.commitStep().bounds;
    }

    mouseUp(coord: PixelCoord): PixelRectangleBounds | null {
        if (this.toolEventState == "draw" || this.toolEventState == "start")
            this.toolEventState = "idle";
        else return null;

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
