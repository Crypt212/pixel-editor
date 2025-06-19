import { PixelCoord, PixelRectangleBounds } from "@src/types/pixel-types.js"

// Simplified Tool Base Class
export default abstract class Tool {
    protected preview: boolean;

    abstract mouseDown?(coord: PixelCoord): PixelRectangleBounds | null;
    abstract mouseMove?(coord: PixelCoord): PixelRectangleBounds | null;
    abstract mouseUp?(coord: PixelCoord): PixelRectangleBounds | null;
}

export abstract class ContinousTool extends Tool {
    protected abstract startState: any;
    protected abstract recentState: any;
    protected abstract readonly redraw: any;
    protected abstract toolEventState: any;
}
