import { PixelCoord } from "@src/types/pixel-types.js";
import Color from "@src/services/color.js";
import { IServiceConfig } from "../intefaces/config.js";
import ToolService from "../abstract/tool-service.js";
import PixelLayer from "@src/core/layers/implementations/pixel-layer.js";
import { EditorEvents } from "@src/types/ui-events.js";

export type DrawingStage = "idle" | "draw";

export interface IDrawingConfig extends IServiceConfig {
    activeLayer: PixelLayer | null,
    previewLayer: PixelLayer | null,
    color: Color,
    size: number,
};

export class DrawingService extends ToolService<IDrawingConfig> {

    protected state: {
        mode: "draw" | "preview",
        stage: DrawingStage,
        currentActionName: string | null,
        startPos: PixelCoord | null,
        recentPos: PixelCoord | null,
        currentPos: PixelCoord | null,
    } = {
            mode: "draw",
            stage: "idle",
            currentActionName: null,
            startPos: null,
            recentPos: null,
            currentPos: null,
        }

    setPosition(coord: PixelCoord) {
        this.state.recentPos = this.state.currentPos;
        this.state.currentPos = coord;
        this.state.startPos = this.state.startPos ?? this.state.currentPos;
    }

    unsetPosition() {
        this.state.recentPos = this.state.currentPos = this.state.startPos = null;
    }

    get activeLayer() {
        return this.config.activeLayer;
    }

    get previewLayer() {
        return this.config.previewLayer;
    }

    get startPosition(): PixelCoord | null {
        return this.state.startPos;
    }

    get recentPosition(): PixelCoord | null {
        return this.state.recentPos;
    }

    get currentPosition(): PixelCoord | null {
        return this.state.currentPos;
    }

    get stage(): DrawingStage {
        return this.state.stage;
    }

    get mode(): "draw" | "preview" {
        return this.state.mode;
    }

    private get context(): PixelLayer | null {
        return this.state.mode === "preview" ? this.config.previewLayer : this.config.activeLayer;
    }

    set stage(stage) {
        this.state.stage = stage;
    }

    set mode(mode: "draw" | "preview") {
        this.state.mode = mode;
    }

    drawOnLayer({ coord }: { coord: PixelCoord; }) {
        const context = this.context;
        if (!context) throw Error("No context set");
        if (this.isOutOfBounds(coord))
            return;
        context.drawColor(coord.x, coord.y, this.config.color);
    };

    eraseFromLayer({ coord }: { coord: PixelCoord; }) {
        const context = this.context;
        if (!context) throw Error("No context set");
        if (this.isOutOfBounds(coord))
            return;
        context.drawColor(coord.x, coord.y, Color.TRANSPARENT);
    };

    startAction(actionName: string) {
        const context = this.context;
        if (!context) throw Error("No context set");
        context.startAction(actionName);
        this.state.currentActionName = actionName;
    }

    restartAction() {
        const context = this.context;
        if (!context) throw Error("No context set");
        context.undo();
        context.startAction(this.state.currentActionName);
    }

    revertAction() {
        const context = this.context;
        if (!context) throw Error("No context set");
        context.undo();
        this.state.currentActionName = null;
    }

    endAction() {
        const context = this.context;
        if (!context) throw Error("No context set");
        context.endAction();
        this.state.currentActionName = null;
    }

    stepAction() {
        const context = this.context;
        if (!context) throw Error("No context set");
        context.commitStep();
    }

    protected isOutOfBounds(coord: PixelCoord): boolean {
        const context = this.context;
        if (!context) throw Error("No context set");
        return (
            coord.x < 0 ||
            coord.y < 0 ||
            coord.x >= context.width ||
            coord.y >= context.height
        );
    }

    get drawingColor(): Color {
        return this.config.color;
    }

    get drawingSize(): number {
        return this.config.size;
    }

    set drawingColor(color: Color) {
        this.config.color = color;
    }

    set drawingSize(size: number) {
        this.config.size = size;
    }

    handle({ event, clickAction, moveDrawAction, movePreviewAction, unclickAction, redraw = false, actionName }: {
        event: EditorEvents.UIEvent,
        clickAction: () => void,
        moveDrawAction: () => void,
        movePreviewAction: () => void,
        unclickAction: () => void,
        actionName: string,
        redraw: boolean,
    }) {
        if (event.type === 'mouse') {
            const mouseEvent = event as EditorEvents.MouseEvent;
            switch (mouseEvent.name) {
                case "mousedown":
                    if (this.stage === "draw") return;
                    this.stage = "draw";

                    if (this.mode === "preview") {
                        this.revertAction();
                        this.unsetPosition();
                    }
                    this.mode = "draw";

                    this.startAction(actionName);
                    this.setPosition(mouseEvent.pos);

                    clickAction()
                    this.mode = "draw";

                    this.stepAction();

                    break;

                case "mousemove":
                    if (this.stage === "idle") {
                        if (this.mode === "preview") {
                            this.restartAction();
                        } else {
                            this.mode = "preview";
                            this.startAction(actionName);
                        }

                        this.setPosition(mouseEvent.pos);

                        movePreviewAction();
                        this.mode = "preview";

                        this.stepAction();

                    } else if (this.stage === "draw") {

                        this.mode = "draw";

                        if (redraw)
                            this.restartAction();

                        this.setPosition(mouseEvent.pos);

                        moveDrawAction();
                        this.mode = "draw";

                        this.stepAction();
                    }

                    break;

                case "mouseup":
                    if (this.stage !== "draw") return;

                    if (redraw)
                        this.restartAction();
                    this.setPosition(mouseEvent.pos);

                    unclickAction();
                    this.mode = "draw";

                    this.unsetPosition();
                    this.endAction();
                    this.stage = "idle";

                    break;
            }
        }
    }

    erasePoint({ x, y, diameter = 5, isSquare = false }: {
        x: number,
        y: number,
        diameter?: number,
        isSquare?: boolean,
    }) {
        diameter = Math.floor(diameter);
        const radius = (0.5 * diameter); // Pre-calculate radius
        const radiusSquared = radius * radius; // Pre-calculate radius squared for performance
        const startX = x - radius;
        const startY = y - radius;
        const endX = Math.max(x + 1, x + radius);
        const endY = Math.max(y + 1, y + radius);

        if (isSquare)
            // For squared area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    this.eraseFromLayer({ coord: { x: Math.floor(currentX), y: Math.floor(currentY) } });
                }
        else
            // For circular area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    const dx = x - currentX - 0.5;
                    const dy = y - currentY - 0.5;

                    if (dx * dx + dy * dy <= radiusSquared) {
                        this.eraseFromLayer({ coord: { x: Math.floor(currentX), y: Math.floor(currentY) } });
                    }
                }
    }

    drawPoint({ x, y, diameter = 5, isSquare = false }: {
        x: number,
        y: number,
        diameter?: number,
        isSquare?: boolean,
    }) {
        diameter = Math.floor(diameter);
        const radius = (0.5 * diameter); // Pre-calculate radius
        const radiusSquared = radius * radius; // Pre-calculate radius squared for performance
        const startX = x - radius;
        const startY = y - radius;
        const endX = Math.max(x + 1, x + radius);
        const endY = Math.max(y + 1, y + radius);

        if (isSquare)
            // For squared area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    this.drawOnLayer({ coord: { x: Math.floor(currentX), y: Math.floor(currentY) } });
                }
        else
            // For circular area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    const dx = x - currentX - 0.5;
                    const dy = y - currentY - 0.5;

                    if (dx * dx + dy * dy <= radiusSquared) {
                        this.drawOnLayer({ coord: { x: Math.floor(currentX), y: Math.floor(currentY) } });
                    }
                }
    }

    drawLine({ x0, y0, x1, y1, setPixel }: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        setPixel: (coord: PixelCoord) => void;
    }){
        // Standard Bresenham's algorithm
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            setPixel({ x: x0, y: y0 });
            if (x0 === x1 && y0 === y1) break;
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

    drawVaryingThicknessLine({ x0, y0, x1, y1, thicknessFunction, setPixel }: {
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        thicknessFunction: (...args: any[]) => number,
        setPixel: (coord: PixelCoord) => void,
    }) {
        const drawPrepLine = (
            x0: number,
            y0: number,
            dx: number,
            dy: number,
            width: number,
            initError: number,
            initWidth: number,
            direction: number,
        ): PixelCoord[] => {
            const coords: PixelCoord[] = [];

            const stepX = dx > 0 ? 1 : -1;
            const stepY = dy > 0 ? 1 : -1;
            dx *= stepX;
            dy *= stepY;

            const threshold = dx - 2 * dy;
            const diagonalError = -2 * dx;
            const stepError = 2 * dy;
            const widthThreshold = 2 * width * Math.sqrt(dx * dx + dy * dy);

            let error = direction * initError;
            let y = y0;
            let x = x0;
            let thickness = dx + dy - direction * initWidth;

            while (thickness <= widthThreshold) {
                setPixel({ x, y });
                if (error > threshold) {
                    x -= stepX * direction;
                    error += diagonalError;
                    thickness += stepError;
                }
                error += stepError;
                thickness -= diagonalError;
                y += stepY * direction;
            }
            return coords;
        };
        const drawLineRightLeftOctents = (
            x0: number,
            y0: number,
            x1: number,
            y1: number,
            thicknessFunction: (...args: any[]) => number,
        ): PixelCoord[] => {

            const coords: PixelCoord[] = [];

            const stepX = x1 - x0 > 0 ? 1 : -1;
            const stepY = y1 - y0 > 0 ? 1 : -1;
            const dx = (x1 - x0) * stepX;
            const dy = (y1 - y0) * stepY;
            const threshold = dx - 2 * dy;
            const diagonalError = -2 * dx;
            const stepError = 2 * dy;

            let error = 0;
            let prepError = 0;
            let y = y0;
            let x = x0;

            for (let i = 0; i < dx; i++) {
                [1, -1].forEach((dir) => {
                    drawPrepLine(
                        x,
                        y,
                        dx * stepX,
                        dy * stepY,
                        thicknessFunction(i) / 2,
                        prepError,
                        error,
                        dir,
                    ).forEach(c => coords.push(c));
                });
                if (error > threshold) {
                    y += stepY;
                    error += diagonalError;
                    if (prepError > threshold) {
                        [1, -1].forEach((dir) => {
                            drawPrepLine(
                                x,
                                y,
                                dx * stepX,
                                dy * stepY,
                                thicknessFunction(i) / 2,
                                prepError + diagonalError + stepError,
                                error,
                                dir,
                            ).forEach(c => coords.push(c));
                        })
                        prepError += diagonalError;
                    }
                    prepError += stepError;
                }
                error += stepError;
                x += stepX;
            }
            return coords;
        };

        if (Math.abs(x1 - x0) < Math.abs(y1 - y0))
            // if line is steep, flip along x = y axis, then do the function then flip the pixels again then draw
            drawLineRightLeftOctents(
                y0,
                x0,
                y1,
                x1,
                thicknessFunction,
            ).forEach(c => this.drawOnLayer({ coord: c }));
        else
            drawLineRightLeftOctents(
                x0,
                y0,
                x1,
                y1,
                thicknessFunction,
            ).forEach(c => this.drawOnLayer({ coord: c }));
    }

    fill({ x, y, color, tolerance = 0 }: {
        x: number,
        y: number,
        color: Color,
        tolerance: number,
    }) {
        const originalColor = this.config.activeLayer.getColor(x, y);

        // early exit if the color is the same
        if (Color.isSimilarTo(originalColor, color, tolerance, true)) return;

        const toVisit = [{ x, y }];
        const toFill = [];
        const visited = new Set();

        while (toVisit.length) {
            const currentPixel = toVisit.pop();
            const { x: currX, y: currY } = currentPixel;

            // check if already visited
            const pixelKey = `${currX},${currY}`;
            if (visited.has(pixelKey)) continue;
            visited.add(pixelKey);

            const currentColor = this.context.getColor(currX, currY);

            if (Color.isSimilarTo(currentColor, originalColor, tolerance, true)) {
                toFill.push(currentPixel);

                // add adjacent pixels to visit
                if (currX > 0) toVisit.push({ x: currX - 1, y: currY }); // left
                if (currX < this.context.width - 1)
                    toVisit.push({ x: currX + 1, y: currY }); // right
                if (currY > 0) toVisit.push({ x: currX, y: currY - 1 }); // up
                if (currY < this.context.height - 1)
                    toVisit.push({ x: currX, y: currY + 1 }); // down
            }
        }

        const coords: PixelCoord[] = [];

        // set the color for all pixels to fill
        toFill.forEach((pixel) => {
            this.drawOnLayer({ coord: { x: pixel.x, y: pixel.y } });
        });

        return coords;
    }
}

