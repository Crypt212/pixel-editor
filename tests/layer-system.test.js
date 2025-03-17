import LayerSystem from "../scripts/layer-system.js";
import CanvasData from "../scripts/canvas-data.js";
import HistorySystem from "../scripts/history-system.js";

describe("LayerSystem", () => {
    let layerSystem;

    beforeEach(() => {
        layerSystem = new LayerSystem(10, 10);
    });

    test("should initialize with default width and height", () => {
        const defaultLayerSystem = new LayerSystem();
        expect(defaultLayerSystem.getSize).toBe(0);
    });

    test("should initialize with given width and height", () => {
        expect(layerSystem.getSize).toBe(0);
    });

    test("should throw error for invalid width or height", () => {
        expect(() => new LayerSystem(0, 10)).toThrow(RangeError);
        expect(() => new LayerSystem(10, 0)).toThrow(RangeError);
        expect(() => new LayerSystem(1025, 10)).toThrow(RangeError);
        expect(() => new LayerSystem(10, 1025)).toThrow(RangeError);
        expect(() => new LayerSystem(10.5, 10)).toThrow(TypeError);
        expect(() => new LayerSystem(10, 10.5)).toThrow(TypeError);
    });

    describe("Layer Manipulation", () => {
        test("should add a new layer", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getSize).toBe(1);
            expect(layerSystem.getNameList).toEqual(["Layer 1"]);
        });

        test("should throw error when adding a layer with invalid name", () => {
            expect(() => layerSystem.addLayer(123)).toThrow(TypeError);
            expect(() => layerSystem.addLayer(null)).toThrow(TypeError);
        });

        test("should remove a layer", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            layerSystem.removeLayer(0);
            expect(layerSystem.getSize).toBe(1);
            expect(layerSystem.getNameList).toEqual(["Layer 2"]);
        });

        test("should throw error when removing a layer from empty list", () => {
            expect(() => layerSystem.removeLayer(0)).toThrow(RangeError);
        });

        test("should select a layer", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            layerSystem.selectLayer(1);
            expect(layerSystem.getSelectedIndex).toBe(1);
        });

        test("should position the selected layer properly when adding or removing layers, and deselect if removed the selected layer", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            layerSystem.addLayer("Layer 3");
            layerSystem.addLayer("Layer 4");
            layerSystem.selectLayer(1);
            expect(layerSystem.getSelectedIndex).toBe(1);
            layerSystem.moveLayer(3, 2); // moves the last layer one layer up
            expect(layerSystem.getNameList).toEqual([
                "Layer 1",
                "Layer 2", // selected
                "Layer 4",
                "Layer 3",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(1);
            layerSystem.moveLayer(3, 0); // moves the last layer to the start 
            expect(layerSystem.getNameList).toEqual([
                "Layer 3",
                "Layer 1",
                "Layer 2", // selected
                "Layer 4",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(2);
            layerSystem.addLayer("Layer 5");
            expect(layerSystem.getNameList).toEqual([
                "Layer 3",
                "Layer 1",
                "Layer 2", // selected
                "Layer 4",
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(2);
            layerSystem.moveLayer(2, 0);
            expect(layerSystem.getNameList).toEqual([
                "Layer 2", // selected
                "Layer 3",
                "Layer 1",
                "Layer 4",
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(0);
            layerSystem.moveLayer(0, 2);
            expect(layerSystem.getNameList).toEqual([
                "Layer 3",
                "Layer 1",
                "Layer 2", // selected
                "Layer 4",
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(2);
            layerSystem.removeLayer(1);
            expect(layerSystem.getNameList).toEqual([
                "Layer 3",
                "Layer 2", // selected
                "Layer 4",
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(1);
            layerSystem.removeLayer(2);
            expect(layerSystem.getNameList).toEqual([
                "Layer 3",
                "Layer 2", // selected
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(1);
            layerSystem.removeLayer(1); // removed the selected layer
            expect(layerSystem.getNameList).toEqual([ 
                "Layer 3",
                "Layer 5",
            ]);
            expect(layerSystem.getSelectedIndex).toBe(-1); // deselected
        });

        test("should throw error when selecting a layer from empty list", () => {
            expect(() => layerSystem.selectLayer(0)).toThrow(RangeError);
        });

        test("should move layer to other position", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            layerSystem.addLayer("Layer 3");
            layerSystem.moveLayer(0, 2);
            expect(layerSystem.getNameList).toEqual([
                "Layer 2",
                "Layer 3",
                "Layer 1",
            ]);
        });

        test("should throw error when changing index of a layer in empty list", () => {
            expect(() => layerSystem.moveLayer(0, 1)).toThrow(RangeError);
        });

        test("should set layer name", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.setLayerName("New Layer 1", 0);
            expect(layerSystem.getLayerName(0)).toBe("New Layer 1");
        });

        test("should throw error when setting layer name with invalid index", () => {
            layerSystem.addLayer("Layer 1");
            expect(() => layerSystem.setLayerName("New Layer 1", 1)).toThrow(
                RangeError,
            );
        });

        test("should get layer name", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerName(0)).toBe("Layer 1");
        });

        test("should throw a range error if tried to get anything from the layer list while it is empty", () => {
            expect(() => layerSystem.getLayerName(0)).toThrow(RangeError);
            expect(() => layerSystem.getLayerHistory(0)).toThrow(RangeError);
            expect(() => layerSystem.getLayerCanvas(0)).toThrow(RangeError);
        });

        test("should return null when getting layer name with no selected layer", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerName()).toBeNull();
        });

        test("should get layer canvas data", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerCanvas(0)).toBeInstanceOf(CanvasData);
        });

        test("should return null when getting layer canvas data with no selected layer", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerCanvas()).toBeNull();
        });

        test("should get layer history system", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerHistory(0)).toBeInstanceOf(
                HistorySystem,
            );
        });

        test("should return null when getting layer history system with no selected layer", () => {
            layerSystem.addLayer("Layer 1");
            expect(layerSystem.getLayerHistory()).toBeNull();
        });

        test("should get the number of layers", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            expect(layerSystem.getSize).toBe(2);
        });

        test("should get the list of layer names", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            expect(layerSystem.getNameList).toEqual(["Layer 1", "Layer 2"]);
        });

        test("should get the selected layer index", () => {
            layerSystem.addLayer("Layer 1");
            layerSystem.addLayer("Layer 2");
            layerSystem.selectLayer(1);
            expect(layerSystem.getSelectedIndex).toBe(1);
        });
    });
});
