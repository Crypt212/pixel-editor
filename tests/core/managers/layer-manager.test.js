global.ImageData = class MockImageData {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
    }
};

import LayerManager from "#core/managers/layer-manager.js";
import PixelLayer from "#core/layers/pixel-layer.js";
import ChangeRegion from "#services/change-region.js";
import Color from "#services/color.js";

describe("LayerManager", () => {
    let layerManager;

    beforeEach(() => {
        layerManager = new LayerManager(10, 10);
    });

    describe("Creation", () => {
        test("should initialize with default [1, 1] values if no width or height given", () => {
            const defaultLayerManager = new LayerManager();
            expect(defaultLayerManager.width).toBe(1);
            expect(defaultLayerManager.height).toBe(1);
        });

        test.each`
            width        | height       | description
            ${1}         | ${1}         | ${"initialize with width 1 and height 1 (min)"}
            ${3}         | ${5}         | ${"initialize with width 3 and height 5"}
            ${1024}      | ${1024}      | ${"initialize with width 1024 and height 1024 (max)"}
        `("should $description", ({ width, height }) => {
            const defaultLayerManager = new LayerManager(width, height);
            expect(defaultLayerManager.width).toBe(width);
            expect(defaultLayerManager.height).toBe(height);
            expect(defaultLayerManager.size).toBe(0);
            expect(layerManager.list()).toEqual([]);
        });

        test.each`
            width     | height  | errorType     | description
            ${-1}     | ${0}    | ${RangeError} | ${"throw RangeError when initialized with numbers less than 1"}
            ${1024}   | ${1324} | ${RangeError} | ${"throw RangeError when initialized with numbers higher than 1024"}
            ${3}      | ${5.5}  | ${TypeError}  | ${"throw TypeError when initialized with non-integer numbers"}
            ${"ahem"} | ${5}    | ${TypeError}  | ${"throw TypeError when initialized with non-number values"}
        `("should $description", ({ width, height, errorType }) => {
            expect(() => new LayerManager(width, height)).toThrow(errorType);
        });
    });

    describe("Layer Manipulation", () => {
        let layerIds = [];

        beforeEach(() => {
            layerManager.add("Layer 1");
            layerManager.add("Layer 2");
            layerManager.add("Layer 3");
            layerManager.add("Layer 4");
            layerIds = Array.from(layerManager.list()).map(layer => layer.id);
        });

        describe("Adding Layers", () => {
            test("should add a new layer", () => {
                expect(layerManager.size).toBe(4);
            });

            test("should add layers with correct IDs", () => {
                const layers = layerManager.list();
                expect(layers[0].id).toBe(0);
                expect(layers[1].id).toBe(1);
                expect(layers[2].id).toBe(2);
                expect(layers[3].id).toBe(3);
            });

            test("should throw error when adding a layer with invalid name", () => {
                expect(() => layerManager.add(123)).toThrow(TypeError);
                expect(() => layerManager.add(null)).toThrow(TypeError);
            });
        });

        describe("Removing Layers", () => {
            test("should remove a layer by ID", () => {
                layerManager.remove(layerIds[1]);
                expect(layerManager.size).toBe(3);
                expect(layerManager.list().map(l => l.name)).toEqual(["Layer 1", "Layer 3", "Layer 4"]);
            });

            test("should remove selected layers when no IDs provided", () => {
                layerManager.select(layerIds[0], layerIds[2]);
                layerManager.remove();
                expect(layerManager.size).toBe(2);
                expect(layerManager.list().map(l => l.name)).toEqual(["Layer 2", "Layer 4"]);
            });

            test("should throw error when removing a layer from empty list", () => {
                const emptyManager = new LayerManager();
                expect(() => emptyManager.remove(0)).toThrow(RangeError);
            });

            test("should deselect removed layers", () => {
                layerManager.select(layerIds[1]);
                layerManager.remove(layerIds[1]);
                expect(layerManager.list(true)).toEqual([]);
            });
        });

        describe("Selection", () => {
            test("should select layers by ID", () => {
                layerManager.select(layerIds[0], layerIds[2]);
                const selected = layerManager.list(true);
                expect(selected.length).toBe(2);
                expect(selected[0].id).toBe(layerIds[0]);
                expect(selected[1].id).toBe(layerIds[2]);
            });

            test("should throw error when selecting a layer from empty list", () => {
                const emptyManager = new LayerManager();
                expect(() => emptyManager.select(0)).toThrow(RangeError);
            });

            test("should deselect layers by ID", () => {
                layerManager.select(layerIds[0], layerIds[1], layerIds[2]);
                layerManager.deselect(layerIds[1]);
                const selected = layerManager.list(true);
                expect(selected.length).toBe(2);
                expect(selected.map(l => l.id)).toEqual([layerIds[0], layerIds[2]]);
            });

            test("should clear all selections", () => {
                layerManager.select(layerIds[0], layerIds[1]);
                layerManager.clearSelection();
                expect(layerManager.list(true)).toEqual([]);
            });
        });

        describe("Moving Layers", () => {
            test("should move layer to new position", () => {
                layerManager.move(2, layerIds[0]); // Move first layer down 2 positions
                expect(layerManager.list().map(l => l.name)).toEqual([
                    "Layer 2",
                    "Layer 3",
                    "Layer 1",
                    "Layer 4",
                ]);
            });

            test("should not move beyond boundaries", () => {
                layerManager.move(-10, layerIds[3]); // Try to move layer number 4 up beyond start
                expect(layerManager.list().map(l => l.name)).toEqual([
                    "Layer 4",
                    "Layer 1",
                    "Layer 2",
                    "Layer 3",
                ]);

                layerManager.move(10, layerIds[0]); // Try to move  layer number 1 down beyond end
                expect(layerManager.list().map(l => l.name)).toEqual([
                    "Layer 4",
                    "Layer 2",
                    "Layer 3",
                    "Layer 1",
                ]);
            });

            test("should throw error when moving layers in empty list", () => {
                const emptyManager = new LayerManager();
                expect(() => emptyManager.move(0, 1)).toThrow(RangeError);
            });
        });

        describe("Layer Properties", () => {
            test("should set layer name", () => {
                layerManager.setName(layerIds[0], "New Layer 1");
                expect(layerManager.getName(layerIds[0])).toBe("New Layer 1");
            });

            test("should throw error when setting layer name with invalid ID", () => {
                expect(() => layerManager.setName(999, "New Layer")).toThrow(RangeError);
            });

            test("should get layer name", () => {
                expect(layerManager.getName(layerIds[0])).toBe("Layer 1");
            });

            test("should get layer pixel data", () => {
                expect(layerManager.getLayer(layerIds[0])).toBeInstanceOf(PixelLayer);
            });

            test("should throw a range error if tried to get anything from the layer list while it is empty", () => {
                const emptyManager = new LayerManager(2, 2);
                expect(() => emptyManager.getName(0)).toThrow(RangeError);
                expect(() => emptyManager.getLayer(0)).toThrow(RangeError);
            });
        });

        describe("List Operations", () => {
            test("should get the number of layers", () => {
                expect(layerManager.size).toBe(4);
            });

            test("should get the list of all layer names", () => {
                expect(layerManager.list().map(l => l.name)).toEqual([
                    "Layer 1",
                    "Layer 2",
                    "Layer 3",
                    "Layer 4",
                ]);
            });

            test("should get the list of selected layer names", () => {
                layerManager.select(layerIds[1], layerIds[3]);
                expect(layerManager.list(true).map(l => l.name)).toEqual([
                    "Layer 2",
                    "Layer 4",
                ]);
            });
        });

        describe("Edge Cases", () => {
            test("should handle moving layers at boundaries", () => {
                layerManager.add("Layer 5");
                const id = layerManager.list()[4].id;

                // Try to move single layer beyond top
                layerManager.move(-100, id);
                expect(layerManager.list().map(l => l.name)).toEqual([
                    "Layer 5",
                    "Layer 1",
                    "Layer 2",
                    "Layer 3",
                    "Layer 4",
                ]);
            });

            test("should maintain order after complex operations", () => {
                const initialIds = [...layerIds];

                // Move first layer to middle
                layerManager.move(2, initialIds[0]);
                expect(layerManager.list().map(l => l.id)).toEqual([
                    initialIds[1],
                    initialIds[2],
                    initialIds[0],
                    initialIds[3],
                ]);

                // Add new layer and move to top
                layerManager.add("Layer 5");
                const newId = layerManager.list()[4].id;
                layerManager.move(-4, newId);
                expect(layerManager.list().map(l => l.id)).toEqual([
                    newId,
                    initialIds[1],
                    initialIds[2],
                    initialIds[0],
                    initialIds[3],
                ]);
            });
        });

        describe("Rendering", () => {
            test("getRenderImage should create valid ImageData with all full view if not given any changes", () => {
                layerManager.add("Layer 5");
                const imageData = layerManager.getRenderImage(new ChangeRegion());
                expect(imageData).toBeInstanceOf(ImageData);
                expect(imageData.width).toBe(10);
                expect(imageData.height).toBe(10);
            });

            test("getRenderImage should create valid mininum ImageData containing given changes postions", () => {
                layerManager.add("Layer 5");
                const region = new ChangeRegion();
                region.setChange(0, 0, "after", "before");
                region.setChange(1, 0, "after", "before");
                region.setChange(0, 1, "after", "before");
                region.setChange(1, 1, "after", "before");
                const imageData = layerManager.getRenderImage(region);
                expect(imageData).toBeInstanceOf(ImageData);
                expect(imageData.width).toBe(2);
                expect(imageData.height).toBe(2);
            });

            test("getColor should composite colors of stacked layers correctly", () => {
                const [redLayerId, blueLayerId] = [layerIds[0], layerIds[1]];

                layerManager.remove(layerIds[2], layerIds[3]);

                const red = Color.create({ rgb: [255, 0, 0], alpha: 0.5 });
                const blue = Color.create({ rgb: [0, 0, 255], alpha: 0.5 });

                // |-bottom-> Dark BG is [160,160,160,1] -then-> transparent -then-> transparent
                let result = layerManager.getColor(0, 0);
                expect(result.rgb).toEqual([160, 160, 160]);
                expect(result.alpha).toBeCloseTo(1);

                layerManager.getLayer(redLayerId).startAction("red");
                layerManager.getLayer(redLayerId).setColor(0, 0, red);
                layerManager.getLayer(blueLayerId).startAction("blue");
                layerManager.getLayer(blueLayerId).setColor(0, 0, blue);

                result = layerManager.getColor(0, 0);

                // |-bottom-> Dark BG is [160,160,160,1] -then-> red [255,0,0,0.5] -then-> blue [0,0,255,0.5]
                expect(result.rgb).toEqual([168, 40, 104]);
                expect(result.alpha).toBe(1);
            });
        });

        describe("Background Management", () => {
            test("should update background colors", () => {
                layerManager.setBackgroundColors(
                    Color.create({ rgb: [0, 0, 0] }),
                    Color.create({ rgb: [255, 255, 255] })
                );

                // Check even coordinate
                const evenColor = layerManager.getColor(0, 0);
                expect(evenColor.rgb).toEqual([255, 255, 255]);

                // Check odd coordinate
                const oddColor = layerManager.getColor(1, 0);
                expect(oddColor.rgb).toEqual([0, 0, 0]);
            });
        });
    });
});
