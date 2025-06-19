import Color from "@src/services/color.js";

export default interface Drawable {
    getColor(x: number, y: number): Color;
    setColor(x: number, y: number, color: Color): void;
    get width(): number;
    get height(): number;
}
