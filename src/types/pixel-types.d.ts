import Color from "@src/services/color.js";

export type PixelCoord = {
    x: number,
    y: number,
}

export type PixelState = {
    color: Color
}

export type PixelRectangleBounds = {
    x0: number,
    y0: number,
    x1: number,
    y1: number
}

