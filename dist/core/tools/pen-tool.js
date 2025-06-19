import { ContinousTool } from "../../core/tools/tool-base.js";
import Color from "../../services/color-service.js";
import { PixelChanges } from "../../core/layers/types/pixel-types.js";
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
        return this.context.commitActionStep().bounds;
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
        return this.context.commitActionStep().bounds;
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
        const bounds = this.context.commitActionStep().bounds;
        this.context.endAction();
        return bounds;
    }
}
function drawPixel({ x, y, diameter = 5, isSquare = false, setPixel }) {
    diameter = Math.floor(diameter);
    const radius = Math.floor(0.5 * diameter); // Pre-calculate radius
    const radiusSquared = radius * radius; // Pre-calculate radius squared for performance
    const startX = x - radius;
    const startY = y - radius;
    const endX = Math.max(x + 1, x + radius);
    const endY = Math.max(y + 1, y + radius);
    if (isSquare)
        // For squared area
        for (let currentY = startY; currentY < endY; currentY++)
            for (let currentX = startX; currentX < endX; currentX++) {
                setPixel(currentX, currentY);
            }
    else
        // For circular area
        for (let currentY = startY; currentY < endY; currentY++)
            for (let currentX = startX; currentX < endX; currentX++) {
                const dx = x - currentX - 0.5;
                const dy = y - currentY - 0.5;
                if (dx * dx + dy * dy <= radiusSquared) {
                    setPixel(currentX, currentY);
                }
            }
}
function drawLine({ x0, y0, x1, y1, setPixel }) {
    // Standard Bresenham's algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
        setPixel(x0, y0);
        if (x0 === x1 && y0 === y1)
            break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
