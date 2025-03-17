import HistorySystem from "./history-system.js";
import CanvasData from "./canvas-data.js";
import { validateNumber } from "./validation.js";

/**
 * Represents a system for managing layers of canvas
 * @class
 */
class LayerSystem {
    #layerList = [];
    #selectedIndex = -1;
    #width = 0;
    #height = 0;

    /**
     * Represents a system for managing layers of canvas
     * @constructor
     * @param {number} [width=1] - The width of the grid of the layers
     * @param {number} [height=1] height - The height of the grid of the layers
     * @throws {Error} if width or height are not integers between 1 and 1024 inclusive
     */
    constructor(width = 1, height = 1) {
        validateNumber(width, "width", {
            start: 1,
            end: 1024,
            integerOnly: true
        });
        validateNumber(height, "height", {
            start: 1,
            end: 1024,
            integerOnly: true
        });
        this.#width = width;
        this.#height = height;
    }

    /**
     * Retrieves a layer object from layers list
     * Retrieves a layer object from layers list at given index, if given -1 then Retrieves the layer at the selected index. Returns null if index is set to -1 and no layer selected
     * @param {number} [index=-1] - The index of the layer in the layer list
     * @returns {Object} - Layer object containing the name, canvas data and history system of the layer, or null
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    #getLayer(index = -1) {
        if (this.#layerList.length === 0)
            throw new RangeError("No layers to get");

        validateNumber(index, "Index", {
            start: -1,
            end: this.getSize - 1,
            integerOnly: true,
        });

        index = (index === -1) ? this.#selectedIndex : index;
        if (index === -1) return null;

        return this.#layerList[index];
    }

    /**
     * Removes a layer objects from layers list at the given index, if index is -1, it removes at the selected index, does nothing if nothing is selected and index is -1
     * @param {number} [index=-1] - The index of the layer in the layer list, will take the selected index if -1 given
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    removeLayer(index = -1) {
        if (this.#layerList.length === 0)
            throw new RangeError("No layers to remove");

        validateNumber(index, "Index", {
            start: -1,
            end: this.getSize - 1,
            integerOnly: true,
        });

        index = (index === -1) ? this.#selectedIndex : index;
        if (index === -1) return;

        this.#layerList.splice(index, 1);
        if (this.#selectedIndex > index)
            this.#selectedIndex--; // shifted up
        else if (this.#selectedIndex == index)
            this.#selectedIndex = -1; // deselects
    }

    /**
     * Addes a new layer object to the layers list
     * @param {string} name - The name of the layer to be added
     * @throws {TypeError} throws an error if the name is not string
     */
    addLayer(name) {
        if (typeof name !== "string")
            throw new TypeError("Layer name must be defined string");

        this.#layerList.push({
            name: name,
            canvasData: new CanvasData(this.#width, this.#height),
            historySystem: new HistorySystem(64),
        });
    }

    /**
     * Selects a layer objects from layers list
     * @param {number} index - The index of the layer in the layer list
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    selectLayer(index) {
        if (this.#layerList.length === 0)
            throw new RangeError("No layers to select");

        validateNumber(index, "Index", {
            start: 0,
            end: this.getSize - 1,
            integerOnly: true,
        });

        this.#selectedIndex = index;
    }

    /**
     * Changes the position of a layer in the layer list
     * @param {number} currentIndex - The index of the layer in the layer list
     * @param {number} newIndex - The index to change to in the layer list
     * @throws {TypeError} throws an error if the currentIndex or newIndex is not integer
     * @throws {RangeError} throws an error if the currentIndex or newIndex is not in valid range
     */
    moveLayer(currentIndex, newIndex) {
        if (this.#layerList.length === 0)
            throw new RangeError("No layers to change index of");

        validateNumber(currentIndex, "Current index", {
            start: 0,
            end: this.getSize - 1,
            integerOnly: true,
        });
        validateNumber(newIndex, "New index", {
            start: 0,
            end: this.getSize - 1,
            integerOnly: true,
        });

        const layer = this.#layerList.splice(currentIndex, 1)[0];
        this.#layerList.splice(newIndex, 0, layer);

        if (this.#selectedIndex !== -1) {
            if (this.#selectedIndex === currentIndex) {
                this.#selectedIndex = newIndex;
            } else if (
                this.#selectedIndex >= newIndex &&
                this.#selectedIndex < currentIndex
            ) {
                this.#selectedIndex++; // shifted up
            } else if (
                this.#selectedIndex <= newIndex &&
                this.#selectedIndex > currentIndex
            ) {
                this.#selectedIndex--; // shifted down
            }
        }
    }

    /**
     * Sets a new name to a layer in the layer list at given index, if given -1 then sets a name at the selected index. Does nothing if index is set to -1 and no layer selected
     * @param {string} name - The index to change to in the layer list
     * @param {number} index - The index of the layer in the layer list, if undefined, will take selected index
     * @throws {TypeError} throws an error if the index is not integer or the name is not string
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    setLayerName(name, index = -1) {
        if (typeof name !== "string")
            throw new TypeError("Layer name must be defined string");

        validateNumber(index, "Index", {
            start: -1,
            end: this.getSize - 1,
            integerOnly: true,
        });
 
        index = (index === -1) ? this.#selectedIndex : index;
        if (index === -1) return;

        this.#getLayer(index).name = name;
    }

    /**
     * Retrieves name of a layer in the layer list at given index, if given -1 then gets name at the selected index. Returns null if index is set to -1 and no layer selected
     * @param {number} index - The index of the layer in the layer list
     * @returns {string} - the name of the layer
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    getLayerName(index = -1) {
        const layer = this.#getLayer(index);
        if (layer === null) return null;
        return layer.name;
    }

    /**
     * Retrieves canvas data of a layer in the layer list at given index, if given -1 then gets canvas data at the selected index. Returns null if index is set to -1 and no layer selected
     * @param {number} [index=-1] - The index of the layer in the layer list
     * @returns {CanvasData} - the canvas data of the layer
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    getLayerCanvas(index = -1) {
        const layer = this.#getLayer(index);
        if (layer === null) return null;
        return layer.canvasData;
    }

    /**
     * Retrieves history system of a layer in the layer list at given index, if given -1 then gets history system at the selected index. Returns null if index is set to -1 and no layer selected
     * @param {number} [index=-1] - The index of the layer in the layer list
     * @returns {HistorySystem} - the history system of the layer
     * @throws {TypeError} throws an error if the index is not integer
     * @throws {RangeError} throws an error if the layer list is empty
     * @throws {RangeError} throws an error if the index is out of valid range
     */
    getLayerHistory(index = -1) {
        const layer = this.#getLayer(index);
        if (layer === null) return null;
        return layer.historySystem;
    }

    /**
     * Retrieves number of layers in the layer list
     * @returns {number} - the number of layers
     */
    get getSize() {
        return this.#layerList.length;
    }

    /**
     * Retrieves a list of layers names
     * @returns {Array} - the returned array is on form [name_1, name_2, ... , name_n]
     */
    get getNameList() {
        return this.#layerList.map(elm => elm.name);
    }

    /**
     * Retrieves the selected layer index in the layer list
     * @returns {number} - the index of the selected layer, -1 if non selected
     */
    get getSelectedIndex() {
        return this.#selectedIndex;
    }
}

export default LayerSystem;
