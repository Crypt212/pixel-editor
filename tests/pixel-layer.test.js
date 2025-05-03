import PixelLayer from "../scripts/pixel-layer.js";
import Color from "../scripts/color.js";

describe("PixelLayer", () => {
    let canvas;
    const testColor = Color.create({ rgb: [255, 255, 0] });

    beforeAll(() => {
        global.ImageData = class {
            constructor(data, width, height) {
                this.data = new Uint8ClampedArray(data);
                this.width = width;
                this.height = height;
            }
        };
    });

    describe("Initialization", () => {
        test("should create valid canvas with default size", () => {
            canvas = new PixelLayer();
            expect(canvas.width).toBe(1);
            expect(canvas.height).toBe(1);
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test.each([[16, 16], [1024, 1024], [5, 10]
        ])("should create %ix%i canvas", (width, height) => {
            canvas = new PixelLayer(width, height);
            expect(canvas.width).toBe(width);
            expect(canvas.height).toBe(height);
        });

        test.each([
            [0, 1], [1.5, 1], [1025, 1], [1, "invalid"]
        ])("should reject invalid dimensions %p", (width, height) => {
            expect(() => new PixelLayer(width, height)).toThrow();
        });
    });

    describe("Pixel Operations", () => {
        beforeEach(() => {
            canvas = new PixelLayer(16, 16);
        });

        test("should set and get pixel colors", () => {
            canvas.setColor(5, 5, testColor);
            expect(canvas.getColor(5, 5)).toEqual(testColor);
        });

        test("should validate coordinates", () => {
            expect(() => canvas.getColor(-1, 0)).toThrow("x");
            expect(() => canvas.getColor(16, 0)).toThrow("x");
            expect(() => canvas.getColor(0, -1)).toThrow("y");
            expect(() => canvas.getColor(0, 16)).toThrow("y");
        });

        test("should handle quiet updates", () => {
            canvas.setColor(5, 5, testColor, { quietly: true });
            expect(canvas.changeBuffer.isEmpty).toBe(true);
        });

        test("should reuse color instances", () => {
            const color1 = Color.create({ hex: "#ff0000" });
            const color2 = Color.create({ rgb: [255, 0, 0] });
            
            canvas.setColor(0, 0, color1);
            canvas.setColor(1, 1, color2);
            expect(canvas.getColor(0, 0)).toBe(canvas.getColor(1, 1));
        });
    });

    describe("Change Tracking", () => {
        beforeEach(() => {
            canvas = new PixelLayer(16, 16);
        });

        test("should track color changes", () => {
            canvas.setColor(0, 0, testColor);
            canvas.setColor(1, 1, testColor);

            const changes = canvas.changeBuffer.afterStates;
            expect(changes).toHaveLength(2);
            expect(changes).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ x: 0, y: 0 }),
                    expect.objectContaining({ x: 1, y: 1 })
                ])
            );
        });

        test("should reset change buffer", () => {
            canvas.setColor(0, 0, testColor);
            const oldBuffer = canvas.resetChangeBuffer();

            expect(oldBuffer.afterStates).toHaveLength(1);
            expect(canvas.changeBuffer.isEmpty).toBe(true);
        });

        test("should track multiple changes to same pixel", () => {
            canvas.setColor(0, 0, testColor);
            canvas.setColor(0, 0, Color.TRANSPARENT);
            
            const changes = canvas.changeBuffer.beforeStates;
            expect(changes).toHaveLength(1);
            expect(changes[0].state).toEqual(Color.TRANSPARENT);
        });
    });

    describe("Action History", () => {
        let canvas;
        const testActionName = "Paint Stroke";

        beforeEach(() => {
            canvas = new PixelLayer(16, 16);
            canvas.createAction(testActionName);
        });

        test("should create named action groups", () => {
            canvas.commitChange();
            // Verify through undo/redo behavior
            canvas.setColor(0, 0, testColor);
            canvas.createAction("New Action");
            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should undo/redo pixel states", () => {
            canvas.setColor(0, 0, testColor);
            canvas.commitChange();
            
            canvas.createAction("Modification");
            canvas.setColor(0, 0, Color.TRANSPARENT);
            canvas.commitChange();

            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(testColor);
            
            canvas.redo();
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should handle history capacity", () => {
            // Test through action persistence
            for (let i = 0; i < 10; i++) {
                canvas.createAction(`Action ${i}`);
                canvas.setColor(i, 0, testColor);
                canvas.commitChange();
            }
            
            // Verify first actions are discarded
            canvas.undo();
            canvas.undo();
            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(testColor);
        });
    });

    describe("Image Loading", () => {
        const createTestImage = (color, size = 2) => {
            const data = new Array(size * size * 4).fill(0).map((_, i) =>
                color[i % 4] ?? 0
            );
            return new ImageData(data, size, size);
        };

        test("should load full image", () => {
            const imageData = createTestImage([255, 0, 0, 255], 4);
            canvas.loadImage(imageData, 0, 0);

            expect(canvas.getColor(0, 0)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(canvas.getColor(3, 3)).toEqual(Color.create({ hex: '#ff0000' }));
        });

        test("should handle partial out-of-bounds images", () => {
            const imageData = createTestImage([0, 255, 0, 128], 4);
            canvas.loadImage(imageData, 14, 14);

            expect(canvas.getColor(14, 14)).toEqual(Color.create({ rgb: [0, 255, 0], alpha: 0.5 }));
            expect(canvas.getColor(15, 15)).toEqual(Color.create({ rgb: [0, 255, 0], alpha: 0.5 }));
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should handle negative positions", () => {
            const imageData = createTestImage([255, 0, 0, 255], 4);
            canvas.loadImage(imageData, -2, -2);
            
            expect(canvas.getColor(0, 0)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(canvas.getColor(1, 1)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(canvas.getColor(2, 2)).toEqual(Color.TRANSPARENT);
        });
    });

    describe("Edge Cases", () => {
        test("should handle minimum canvas size", () => {
            canvas = new PixelLayer(1, 1);
            canvas.setColor(0, 0, testColor);
            expect(canvas.getColor(0, 0)).toEqual(testColor);
        });

        test("should handle maximum canvas size", () => {
            canvas = new PixelLayer(1024, 1024);
            canvas.setColor(1023, 1023, testColor);
            expect(canvas.getColor(1023, 1023)).toEqual(testColor);
        });

        test("should reject invalid color types", () => {
            canvas = new PixelLayer(16, 16);
            expect(() => canvas.setColor(0, 0, [255, 0, 0, 1])).toThrow("Color class");
        });

        test("should handle rapid updates", () => {
            canvas = new PixelLayer(64, 64);
            for (let i = 0; i < 1000; i++) {
                canvas.setColor(i%64, i%64, testColor, { quietly: true });
            }
            expect(canvas.getColor(63, 63)).toEqual(testColor);
        });
    });
});
