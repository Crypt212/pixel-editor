import Graphics from "../scripts/graphics.js";
import CanvasData from "../scripts/canvas-data.js";
import { validateNumber, validateColorArray } from "../scripts/validation.js";

describe("Graphics", () => {
    test ("should throw a type error if not given CanvasData object upon instantiation", () => {
        expect(() => new Graphics()).toThrow(TypeError);
        expect(() => new Graphics("Ahmed")).toThrow(TypeError);
        expect(() => new Graphics(2)).toThrow(TypeError);
        expect(() => new Graphics([])).toThrow(TypeError);
        expect(() => new Graphics({})).toThrow(TypeError);
        expect(() => new Graphics(new CanvasData(3, 2))).not.toThrow();
    });

    describe("Draw Pixel", () => {
        let canvas;
        let graphics;
        beforeEach(() => {
            canvas = new CanvasData(32, 32);
            graphics = new Graphics(canvas);
        });
        test("should throw a type or range error if parameters are invalid", () => {
            expect(() => graphics.drawPixel('a', -2, [224, 2, 5, 1], 2)).toThrow(TypeError);
            expect(() => graphics.drawPixel(3, 3.5, [224, 2, 5, 1], 2)).toThrow(TypeError);
            expect(() => graphics.drawPixel(3, -2, [224, 444, 5, 1], 2)).toThrow(RangeError);
            expect(() => graphics.drawPixel(3, -2, {arr: [224, 444, 5, 1]}, 2)).toThrow(TypeError);
            expect(() => graphics.drawPixel(3, -2, [224, 2, 5, 1], -12)).toThrow(RangeError);
            expect(() => graphics.drawPixel(3, -2, [224, 2, 5, 1], 12, 'ara')).toThrow(TypeError);
            expect(() => graphics.drawPixel(3, -2, [224, 2, 5, 1], 12)).not.toThrow();
            expect(() => graphics.drawPixel(3, -2, [224, 2, 5, 1], 12, true)).not.toThrow();
        });
        test("should draw only in-bound pixels on the canvas", () => {
            graphics.drawPixel(2, 0, [224, 2, 5, 1], 1);
            expect(canvas.getLastActions).toEqual([
                { x: 2, y: 0, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(3, 0, [224, 2, 5, 1], 1.7); // floors 1.7 to 1
            expect(canvas.getLastActions).toEqual([
                { x: 3, y: 0, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(3, -1, [224, 2, 5, 1], 4);
            expect(canvas.getLastActions).toEqual([
                { x: 1, y: 0, color: [224, 2, 5, 1] },
                { x: 2, y: 0, color: [224, 2, 5, 1] },
                { x: 3, y: 0, color: [224, 2, 5, 1] },
                { x: 4, y: 0, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(3, -1, [224, 2, 5, 1], 6, true); // square -- default
            expect(canvas.getLastActions).toEqual([
                { x: 0, y: 0, color: [224, 2, 5, 1] },
                { x: 1, y: 0, color: [224, 2, 5, 1] },
                { x: 2, y: 0, color: [224, 2, 5, 1] },
                { x: 3, y: 0, color: [224, 2, 5, 1] },
                { x: 4, y: 0, color: [224, 2, 5, 1] },
                { x: 5, y: 0, color: [224, 2, 5, 1] },
                { x: 0, y: 1, color: [224, 2, 5, 1] },
                { x: 1, y: 1, color: [224, 2, 5, 1] },
                { x: 2, y: 1, color: [224, 2, 5, 1] },
                { x: 3, y: 1, color: [224, 2, 5, 1] },
                { x: 4, y: 1, color: [224, 2, 5, 1] },
                { x: 5, y: 1, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(3, -1, [224, 2, 5, 1], 6, false); // circular
            expect(canvas.getLastActions).toEqual([
                { x: 0, y: 0, color: [224, 2, 5, 1] },
                { x: 1, y: 0, color: [224, 2, 5, 1] },
                { x: 2, y: 0, color: [224, 2, 5, 1] },
                { x: 3, y: 0, color: [224, 2, 5, 1] },
                { x: 4, y: 0, color: [224, 2, 5, 1] },
                { x: 5, y: 0, color: [224, 2, 5, 1] },
                { x: 1, y: 1, color: [224, 2, 5, 1] },
                { x: 2, y: 1, color: [224, 2, 5, 1] },
                { x: 3, y: 1, color: [224, 2, 5, 1] },
                { x: 4, y: 1, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(10, 11, [224, 2, 5, 1], 8); // square
            expect(canvas.getLastActions).toEqual([
                { x: 6, y: 7, color: [224, 2, 5, 1] },
                { x: 7, y: 7, color: [224, 2, 5, 1] },
                { x: 8, y: 7, color: [224, 2, 5, 1] },
                { x: 9, y: 7, color: [224, 2, 5, 1] },
                { x: 10, y: 7, color: [224, 2, 5, 1] },
                { x: 11, y: 7, color: [224, 2, 5, 1] },
                { x: 12, y: 7, color: [224, 2, 5, 1] },
                { x: 13, y: 7, color: [224, 2, 5, 1] },
                { x: 6, y: 8, color: [224, 2, 5, 1] },
                { x: 7, y: 8, color: [224, 2, 5, 1] },
                { x: 8, y: 8, color: [224, 2, 5, 1] },
                { x: 9, y: 8, color: [224, 2, 5, 1] },
                { x: 10, y: 8, color: [224, 2, 5, 1] },
                { x: 11, y: 8, color: [224, 2, 5, 1] },
                { x: 12, y: 8, color: [224, 2, 5, 1] },
                { x: 13, y: 8, color: [224, 2, 5, 1] },
                { x: 6, y: 9, color: [224, 2, 5, 1] },
                { x: 7, y: 9, color: [224, 2, 5, 1] },
                { x: 8, y: 9, color: [224, 2, 5, 1] },
                { x: 9, y: 9, color: [224, 2, 5, 1] },
                { x: 10, y: 9, color: [224, 2, 5, 1] },
                { x: 11, y: 9, color: [224, 2, 5, 1] },
                { x: 12, y: 9, color: [224, 2, 5, 1] },
                { x: 13, y: 9, color: [224, 2, 5, 1] },
                { x: 6, y: 10, color: [224, 2, 5, 1] },
                { x: 7, y: 10, color: [224, 2, 5, 1] },
                { x: 8, y: 10, color: [224, 2, 5, 1] },
                { x: 9, y: 10, color: [224, 2, 5, 1] },
                { x: 10, y: 10, color: [224, 2, 5, 1] },
                { x: 11, y: 10, color: [224, 2, 5, 1] },
                { x: 12, y: 10, color: [224, 2, 5, 1] },
                { x: 13, y: 10, color: [224, 2, 5, 1] },
                { x: 6, y: 11, color: [224, 2, 5, 1] },
                { x: 7, y: 11, color: [224, 2, 5, 1] },
                { x: 8, y: 11, color: [224, 2, 5, 1] },
                { x: 9, y: 11, color: [224, 2, 5, 1] },
                { x: 10, y: 11, color: [224, 2, 5, 1] },
                { x: 11, y: 11, color: [224, 2, 5, 1] },
                { x: 12, y: 11, color: [224, 2, 5, 1] },
                { x: 13, y: 11, color: [224, 2, 5, 1] },
                { x: 6, y: 12, color: [224, 2, 5, 1] },
                { x: 7, y: 12, color: [224, 2, 5, 1] },
                { x: 8, y: 12, color: [224, 2, 5, 1] },
                { x: 9, y: 12, color: [224, 2, 5, 1] },
                { x: 10, y: 12, color: [224, 2, 5, 1] },
                { x: 11, y: 12, color: [224, 2, 5, 1] },
                { x: 12, y: 12, color: [224, 2, 5, 1] },
                { x: 13, y: 12, color: [224, 2, 5, 1] },
                { x: 6, y: 13, color: [224, 2, 5, 1] },
                { x: 7, y: 13, color: [224, 2, 5, 1] },
                { x: 8, y: 13, color: [224, 2, 5, 1] },
                { x: 9, y: 13, color: [224, 2, 5, 1] },
                { x: 10, y: 13, color: [224, 2, 5, 1] },
                { x: 11, y: 13, color: [224, 2, 5, 1] },
                { x: 12, y: 13, color: [224, 2, 5, 1] },
                { x: 13, y: 13, color: [224, 2, 5, 1] },
                { x: 6, y: 14, color: [224, 2, 5, 1] },
                { x: 7, y: 14, color: [224, 2, 5, 1] },
                { x: 8, y: 14, color: [224, 2, 5, 1] },
                { x: 9, y: 14, color: [224, 2, 5, 1] },
                { x: 10, y: 14, color: [224, 2, 5, 1] },
                { x: 11, y: 14, color: [224, 2, 5, 1] },
                { x: 12, y: 14, color: [224, 2, 5, 1] },
                { x: 13, y: 14, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
            graphics.drawPixel(10, 11, [224, 2, 5, 1], 8, false); // circular
            expect(canvas.getLastActions).toEqual([
                { x: 8, y: 7, color: [224, 2, 5, 1] },
                { x: 9, y: 7, color: [224, 2, 5, 1] },
                { x: 10, y: 7, color: [224, 2, 5, 1] },
                { x: 11, y: 7, color: [224, 2, 5, 1] },
                { x: 7, y: 8, color: [224, 2, 5, 1] },
                { x: 8, y: 8, color: [224, 2, 5, 1] },
                { x: 9, y: 8, color: [224, 2, 5, 1] },
                { x: 10, y: 8, color: [224, 2, 5, 1] },
                { x: 11, y: 8, color: [224, 2, 5, 1] },
                { x: 12, y: 8, color: [224, 2, 5, 1] },
                { x: 6, y: 9, color: [224, 2, 5, 1] },
                { x: 7, y: 9, color: [224, 2, 5, 1] },
                { x: 8, y: 9, color: [224, 2, 5, 1] },
                { x: 9, y: 9, color: [224, 2, 5, 1] },
                { x: 10, y: 9, color: [224, 2, 5, 1] },
                { x: 11, y: 9, color: [224, 2, 5, 1] },
                { x: 12, y: 9, color: [224, 2, 5, 1] },
                { x: 13, y: 9, color: [224, 2, 5, 1] },
                { x: 6, y: 10, color: [224, 2, 5, 1] },
                { x: 7, y: 10, color: [224, 2, 5, 1] },
                { x: 8, y: 10, color: [224, 2, 5, 1] },
                { x: 9, y: 10, color: [224, 2, 5, 1] },
                { x: 10, y: 10, color: [224, 2, 5, 1] },
                { x: 11, y: 10, color: [224, 2, 5, 1] },
                { x: 12, y: 10, color: [224, 2, 5, 1] },
                { x: 13, y: 10, color: [224, 2, 5, 1] },
                { x: 6, y: 11, color: [224, 2, 5, 1] },
                { x: 7, y: 11, color: [224, 2, 5, 1] },
                { x: 8, y: 11, color: [224, 2, 5, 1] },
                { x: 9, y: 11, color: [224, 2, 5, 1] },
                { x: 10, y: 11, color: [224, 2, 5, 1] },
                { x: 11, y: 11, color: [224, 2, 5, 1] },
                { x: 12, y: 11, color: [224, 2, 5, 1] },
                { x: 13, y: 11, color: [224, 2, 5, 1] },
                { x: 6, y: 12, color: [224, 2, 5, 1] },
                { x: 7, y: 12, color: [224, 2, 5, 1] },
                { x: 8, y: 12, color: [224, 2, 5, 1] },
                { x: 9, y: 12, color: [224, 2, 5, 1] },
                { x: 10, y: 12, color: [224, 2, 5, 1] },
                { x: 11, y: 12, color: [224, 2, 5, 1] },
                { x: 12, y: 12, color: [224, 2, 5, 1] },
                { x: 13, y: 12, color: [224, 2, 5, 1] },
                { x: 7, y: 13, color: [224, 2, 5, 1] },
                { x: 8, y: 13, color: [224, 2, 5, 1] },
                { x: 9, y: 13, color: [224, 2, 5, 1] },
                { x: 10, y: 13, color: [224, 2, 5, 1] },
                { x: 11, y: 13, color: [224, 2, 5, 1] },
                { x: 12, y: 13, color: [224, 2, 5, 1] },
                { x: 8, y: 14, color: [224, 2, 5, 1] },
                { x: 9, y: 14, color: [224, 2, 5, 1] },
                { x: 10, y: 14, color: [224, 2, 5, 1] },
                { x: 11, y: 14, color: [224, 2, 5, 1] },
            ]);
            canvas.resetLastActions();
        });

    });
});
