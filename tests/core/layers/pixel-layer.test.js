import PixelLayer from "#core/layers/pixel-layer.js";
import Color from "#services/color.js";

describe("PixelLayer", () => {
    let layer;
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
            layer = new PixelLayer();
            expect(layer.width).toBe(1);
            expect(layer.height).toBe(1);
            expect(layer.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test.each([[16, 16], [1024, 1024], [5, 10]
        ])("should create %ix%i canvas", (width, height) => {
            layer = new PixelLayer(width, height);
            expect(layer.width).toBe(width);
            expect(layer.height).toBe(height);
        });

        test.each([
            [0, 1], [1.5, 1], [1025, 1], [1, "invalid"]
        ])("should reject invalid dimensions %p", (width, height) => {
            expect(() => new PixelLayer(width, height)).toThrow();
        });
    });

    describe("Pixel Operations", () => {
        beforeEach(() => {
            layer = new PixelLayer(16, 16);
            layer.startAction("Test Action");
        });

        test("should set and get pixel colors", () => {
            layer.setColor(5, 5, testColor);
            expect(layer.getColor(5, 5)).toEqual(testColor);
        });

        test("should validate coordinates", () => {
            expect(() => layer.getColor(-1, 0)).toThrow("x");
            expect(() => layer.getColor(16, 0)).toThrow("x");
            expect(() => layer.getColor(0, -1)).toThrow("y");
            expect(() => layer.getColor(0, 16)).toThrow("y");
        });

        test("should handle quiet updates", () => {
            layer.setColor(5, 5, testColor, { quietly: true });
            expect(layer.changeBuffer.isEmpty).toBe(true);
        });

        test("should reuse color instances", () => {
            const color1 = Color.create({ hex: "#ff0000" });
            const color2 = Color.create({ rgb: [255, 0, 0] });

            layer.setColor(0, 0, color1);
            layer.setColor(1, 1, color2);
            expect(layer.getColor(0, 0)).toBe(layer.getColor(1, 1));
        });

        test.only("should clear pixels", () => {
            layer.setColor(0, 0, testColor);
            expect(layer.changeBuffer.afterStates).toHaveLength(1);
            expect(layer.getColor(0, 0)).toEqual(testColor);
            layer.clear();
            expect(layer.changeBuffer.afterStates).toHaveLength(2);
            expect(layer.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });
    });

    describe("Change Tracking", () => {
        beforeEach(() => {
            layer = new PixelLayer(16, 16);
            layer.startAction("Test Action");
        });

        test("should track color changes", () => {
            layer.setColor(0, 0, testColor);
            layer.setColor(1, 1, testColor);

            const changes = layer.changeBuffer.afterStates;
            expect(changes).toHaveLength(2);
            expect(changes).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ x: 0, y: 0 }),
                    expect.objectContaining({ x: 1, y: 1 })
                ])
            );
        });

        test("should reset change buffer", () => {
            layer.setColor(0, 0, testColor);
            const oldBuffer = layer.resetChangeBuffer();

            expect(oldBuffer.afterStates).toHaveLength(1);
            expect(layer.changeBuffer.isEmpty).toBe(true);
        });

        test("should track multiple changes to same pixel", () => {
            layer.setColor(0, 0, testColor);
            layer.setColor(0, 0, Color.TRANSPARENT);

            const changes = layer.changeBuffer.beforeStates;
            expect(changes).toHaveLength(1);
            expect(changes[0].state).toEqual(Color.TRANSPARENT);
        });
    });

    describe("History", () => {
        let canvas;
        const testActionName = "Paint Stroke";

        beforeEach(() => {
            canvas = new PixelLayer(16, 16);
            canvas.startAction(testActionName);
        });

        test("should start named action", () => {
            canvas.addActionStep();
            // Verify through undo/redo behavior
            canvas.setColor(0, 0, testColor);
            canvas.setColor(0, 1, testColor);
            canvas.setColor(1, 0, testColor);
            canvas.startAction("New Action");
            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should add segmented named action", () => {
            canvas.addActionStep();
            // Verify through undo/redo behavior
            canvas.setColor(0, 0, testColor);
            canvas.startAction("New Action");
            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should undo/redo pixel states", () => {
            canvas.setColor(0, 0, testColor);
            canvas.addActionStep();

            canvas.startAction("Modification");
            canvas.setColor(0, 0, Color.TRANSPARENT);
            canvas.addActionStep();

            canvas.undo();
            expect(canvas.getColor(0, 0)).toEqual(testColor);

            canvas.redo();
            expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should handle history capacity", () => {
            // Test through action persistence
            for (let i = 0; i < 10; i++) {
                canvas.startAction(`Action ${i}`);
                canvas.setColor(i, 0, testColor);
                canvas.addActionStep();
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
            layer.loadImage(imageData, 0, 0);

            expect(layer.getColor(0, 0)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(layer.getColor(3, 3)).toEqual(Color.create({ hex: '#ff0000' }));
        });

        test("should handle partial out-of-bounds images", () => {
            const imageData = createTestImage([0, 255, 0, 128], 4);
            layer.loadImage(imageData, 14, 14);

            expect(layer.getColor(14, 14)).toEqual(Color.create({ rgb: [0, 255, 0], alpha: 0.5 }));
            expect(layer.getColor(15, 15)).toEqual(Color.create({ rgb: [0, 255, 0], alpha: 0.5 }));
            expect(layer.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("should handle negative positions", () => {
            const imageData = createTestImage([255, 0, 0, 255], 4);
            layer.loadImage(imageData, -2, -2);

            expect(layer.getColor(0, 0)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(layer.getColor(1, 1)).toEqual(Color.create({ hex: '#ff0000' }));
            expect(layer.getColor(2, 2)).toEqual(Color.TRANSPARENT);
        });
    });

    describe("Action Lifecycle", () => {
        let layer;

        beforeEach(() => {
            layer = new PixelLayer(16, 16);

        });

        test("should track active action state", () => {
            expect(layer.isInAction).toBe(false);
            layer.startAction("test");
            expect(layer.isInAction).toBe(true);
            layer.endAction();
            expect(layer.isInAction).toBe(false);
        });

        test("cancelAction() should revert changes", () => {
            layer.startAction("test");
            layer.setColor(0, 0, testColor);
            layer.cancelAction();
            expect(layer.getColor(0, 0)).toEqual(Color.TRANSPARENT);
            expect(layer.isInAction).toBe(false);
        });

        test("should prevent pixel edits outside actions", () => {
            expect(() => layer.setColor(0, 0, testColor)).toThrow("Cannot set color outside of an action");
        });
    });

    describe("Action Cancellation", () => {
        test("should fully revert multi-step actions", () => {
            const layer = new PixelLayer(16, 16);
            layer.startAction("multi_step");

            // Add 5 steps
            for (let i = 0; i < 5; i++) {
                layer.setColor(i, i, testColor);
                layer.addActionStep();
            }

            layer.cancelAction();

            // Verify all pixels reverted
            for (let i = 0; i < 5; i++) {
                expect(layer.getColor(i, i)).toEqual(Color.TRANSPARENT);
            }
        });

        test("should handle cancellation during merge", () => {
            const layer = new PixelLayer(100, 100);
            layer.startAction("massive");

            // Add 15 steps to trigger auto-merge
            for (let i = 0; i < 15; i++) {
                layer.setColor(i, i, testColor);
                layer.addActionStep();
            }

            console.time("Cancel with merge");
            layer.cancelAction();
            console.timeEnd("Cancel with merge"); // Should be <50ms

            expect(layer.isInAction).toBe(false);
        });
    });

    describe("Stress Test", () => {
        test("1000-step action merging", () => {
            const layer = new PixelLayer(1000, 1000);
            layer.startAction("massive");

            for (let i = 0; i < 1000; i++) {
                layer.setColor(i % 100, i % 100, testColor);
                layer.addActionStep();
            }

            console.time("Undo 1000 steps");
            layer.undo();
            console.timeEnd("Undo 1000 steps");

            expect(layer.getColor(0, 0)).toEqual(Color.TRANSPARENT);
        });

        test("simultaneous undo/redo", () => {
            const layer = new PixelLayer(10, 10);
            layer.startAction("test");
            layer.setColor(0, 0, testColor);
            layer.addActionStep();

            // Simulate rapid user input
            layer.undo();
            layer.redo();
            layer.undo();
            layer.redo();

            expect(layer.getColor(0, 0)).toEqual(testColor);
        });
    });

    describe("Edge Cases", () => {
        test("should handle minimum canvas size", () => {
            layer = new PixelLayer(1, 1);
            layer.startAction("Test Action");
            layer.setColor(0, 0, testColor);
            expect(layer.getColor(0, 0)).toEqual(testColor);
        });

        test("should handle maximum canvas size", () => {
            layer = new PixelLayer(1024, 1024);
            layer.startAction("Test Action");
            layer.setColor(1023, 1023, testColor);
            expect(layer.getColor(1023, 1023)).toEqual(testColor);
        });

        test("should reject invalid color types", () => {
            layer = new PixelLayer(16, 16);
            layer.startAction("Test Action");
            expect(() => layer.setColor(0, 0, [255, 0, 0, 1])).toThrow("Color class");
        });

        test("should handle rapid updates", () => {
            layer = new PixelLayer(64, 64);
            layer.startAction("Test Action");
            for (let i = 0; i < 1000; i++) {
                layer.setColor(i % 64, i % 64, testColor, { quietly: true });
            }
            expect(layer.getColor(63, 63)).toEqual(testColor);
        });
        test("undo empty action", () => {
            const layer = new PixelLayer(16, 16);
            layer.startAction("empty");
            expect(() => layer.undo()).not.toThrow();
        });

        test("redo without undo", () => {
            const layer = new PixelLayer(16, 16);
            expect(() => layer.redo()).not.toThrow();
        });

        test("cancelAction with no changes", () => {
            const layer = new PixelLayer(16, 16);
            layer.startAction("noop");
            expect(() => layer.cancelAction()).not.toThrow();
        });
    });
});
