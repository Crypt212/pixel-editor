import PixelLayer from "./pixel-layer.js";
import ChangeRegion from "./change-region.js";
import { validateNumber } from "./validation.js";
import Color from "./color.js";

/**
 * Represents a system for managing layers of canvas grids
 * @class
 */
class LayerManager {

    /**
     * @typedef LayerData
     * @property {number} id - ID of the layer
     * @property {string} name - Name of the layer
     * @property {PixelLayer} pixelLayer - The grid class of the layer
     */

    /**
     * A map containing layers accessed by their IDs
     * @type {Map<number, LayerData>}
     */
    #layers = new Map();

    /**
     * A set of IDs of the currently selected layers
     * @type {Set<number>}
     */
    #selections = new Set();

    /**
     * An array for maintaining order, holds IDs of the layers
     * @type {Array<number>}
     */
    #layerOrder = [];

    /**
     * Dimensions of canvases that the layer system holds
     * @type {number}
     */
    #width;
    #height;

    /**
     * Internal counter to enumerate increamental IDs for the created layers
     * @type {number}
     * @private
     */
    #layerIDCounter = -1;

    /**
     * Colors of the checkerboard background of transparent canvas
     * @type {Color}
     */
    #darkBG = Color.create({ rgb: [160, 160, 160], alpha: 1 });
    #lightBG = Color.create({ rgb: [217, 217, 217], alpha: 1 });

    /**
     * Represents a system for managing layers of canvas
     * @constructor
     * @param {number} [width=1] - The width of the canvas grid for the layers
     * @param {number} [height=1] height - The height of the canvas grid for the layers
     * @throws {TypeError} if width or height are not integers
     * @throws {RangeError} if width or height are not between 1 and 1024 inclusive
     */
    constructor(width = 1, height = 1) {
        validateNumber(width, "width", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        validateNumber(height, "height", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        this.#width = width;
        this.#height = height;
    }

    /**
     * validates IDs in the layers list
     * @method
     * @param {...number} ids - The IDs of the layers
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the IDs are not in the list
     * @throws {TypeError} If the IDs is not integers
     */
    #validate(...ids) {
        if (this.#layers.size === 0)
            throw new RangeError("No layers to get");

        for (let id of ids) {
            validateNumber(id, "ID", { integerOnly: true, });

            if (!this.#layerOrder.includes(id))
                throw new RangeError(`Layer with ${id} ID is not found`);
        }
    }

    /**
     * Adds a new layer object into the layers list
     * @method
     * @param {string} name - The name of the layer to be added
     * @returns {number} the ID of the newly created layer
     * @throws {TypeError} If the name is not string
     */
    add(name) {
        if (typeof name !== "string")
            throw new TypeError("Layer name must be defined string");

        let id = ++this.#layerIDCounter;

        let newLayer = {
            id: id,
            name: name,
            pixelLayer: new PixelLayer(this.#width, this.#height),
        };

        this.#layers.set(id, newLayer);
        this.#layerOrder.push(id);
        return id;
    }

    /**
     * Delete layers with given IDs from layers list. If no ID given, delete selected ayers
     * @param {...number} ids - The IDs of the layers to be removed
     * @method
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the index is out of valid range
     */
    remove(...ids) {
        if (ids.length === 0) ids = Array.from(this.#selections);
        this.#validate(...ids);

        // reverse order to avoid much index shifting
        ids.sort((a, b) => this.#layerOrder.indexOf(b) - this.#layerOrder.indexOf(a))
            .forEach(id => {
                this.#selections.delete(id);
                this.#layers.delete(id);
                this.#layerOrder.splice(this.#layerOrder.indexOf(id), 1);
            });
    }

    /**
     * Selects layers in the layers list
     * @method
     * @param {...number} ids - The IDs to select, if an ID is for an already selected layer, ignore it
     * @throws {TypeError} If the IDs are not integers
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the IDs are not in the list
     */
    select(...ids) {
        if (this.#layers.size === 0)
            throw new RangeError("No layers to select");

        this.#validate(...ids);

        // selection
        for (let id of ids) {
            this.#selections.add(id);
        }
    }

    /**
     * Deselects layers in the layers list
     * @method
     * @param {...number} ids - The IDs to deselect, if an ID is for an already unselected layer, ignores it
     * @throws {TypeError} If the IDs are not integers
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the IDs are not in the list
     */
    deselect(...ids) {
        if (this.#layers.size === 0)
            throw new RangeError("No layers to select");

        // validation
        for (let id of ids) {
            this.#validate(id);
        }

        // deselection
        for (let id of ids) {
            if (this.#selections.has(id))  // if 
                this.#selections.delete(id);
        }
    }

    /**
     * Deselects all layers
     */
    clearSelection() {
        this.#selections.clear();
    }

    /**
     * Changes the position of a single layer in the layer list
     * @method
     * @param {number} offset - The offset by which to move the layer
     * @param {number} id - The ID of the layer to move
     * @throws {TypeError} If the offset is not an integer
     * @throws {TypeError} If the ID is not a valid integer
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the ID is not in the layer list
     */
    move(offset, id) {
        if (this.#layers.size === 0) {
            throw new RangeError("No layers to move");
        }

        validateNumber(offset, "Offset", { integerOnly: true });
        this.#validate(id);

        const currentIndex = this.#layerOrder.indexOf(id);
        let newIndex = currentIndex + offset;

        // clamp the new index to valid range
        newIndex = Math.max(0, Math.min(newIndex, this.#layerOrder.length - 1));

        if (newIndex !== currentIndex) {
            this.#layerOrder.splice(currentIndex, 1);
            this.#layerOrder.splice(newIndex, 0, id);
        }
    }


    /**
     * Calculates the resulting image in a specific rectangle of the canvas layer system
     * @method
     * @param {ChangeRegion} changeRegion - The region containing the changed pixels
     * @returns {ImageData} The resulting image as ImageData object
     * throws {TypeError} If changeRegion is not an instance of ChangeRegion class
     */
    getRenderImage(changeRegion = new ChangeRegion()) {
        if (!(changeRegion instanceof ChangeRegion))
            throw new TypeError("changeRegion must be an instance of ChangeRegion");

        const renderImage = (changeRegion.isEmpty ?
            new ImageData(this.width, this.height) :
            new ImageData(
                changeRegion.bounds.x1 - changeRegion.bounds.x0 + 1,
                changeRegion.bounds.y1 - changeRegion.bounds.y0 + 1,
            ));

        if (changeRegion.isEmpty)
            for (let y = 0; y < renderImage.height; y++)
                for (let x = 0; x < renderImage.width; x++) {
                    const index = (y * renderImage.width + x) * 4;
                    const color = this.getColor(x, y);
                    renderImage.data[index + 0] = color.rgb[0];
                    renderImage.data[index + 1] = color.rgb[1];
                    renderImage.data[index + 2] = color.rgb[2];
                    renderImage.data[index + 3] = Math.floor(color.alpha * 255);
                }
        else
            for (const pixel of changeRegion.changesMap.values()) {
                console.log(pixel);
                const index = (pixel.y * renderImage.width + pixel.x) * 4;
                const color = this.getColor(pixel.x, pixel.y);
                renderImage.data[index + 0] = color.rgb[0];
                renderImage.data[index + 1] = color.rgb[1];
                renderImage.data[index + 2] = color.rgb[2];
                renderImage.data[index + 3] = Math.floor(color.alpha[3] * 255);
            }

        return renderImage;
    }

    /**
     * Sets the two colors of the checkerboard background covor of the canvas
     * @method
     * @param {Color} lightBG - The first color
     * @param {Color} darkBG - The second color
     * @throws {TypeError} If lightBG or darkBG are not instances of Color class
     */
    setBackgroundColors(lightBG, darkBG) {
        if (!(lightBG instanceof Color && darkBG instanceof Color))
            throw new TypeError("lightBG and darkBG must be instances of Color class");

        this.#lightBG = lightBG;
        this.#darkBG = darkBG;
    }

    /**
     * Sets a new name to a layer in the layer list for given ID
     * @param {string} name - The index to change to in the layer list
     * @param {number} id - The ID of the layer
     * @throws {TypeError} If the ID is not integer or the name is not string
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the ID is not in the list
     */
    setName(id, name) {
        if (typeof name !== "string")
            throw new TypeError("Layer name must be defined string");

        this.#validate(id);
        this.#layers.get(id).name = name;
    }

    /**
     * Retrieves the layer in the layer list for given ID
     * @param {number} id - The ID of the layer
     * @returns {PixelLayer} - the layer object
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the ID is not in the list
     */
    getLayer(id) {
        this.#validate(id);
        return this.#layers.get(id).pixelLayer;
    }

    /**
     * Retrieves the resulting color of all layers in the list at a pixel position
     * @method
     * @param {number} x - The X-Coordinate
     * @param {number} y - The Y-Coordinate
     * @returns {Color} The resulting color object of all layers at the specified pixel position
     * @throws {TypeError} If X-Coordinate or Y-Coordinate are not valid numbers
     * @throws {RangeError} If X-Coordinate or Y-Coordinate are not in valid range
     */
    getColor(x, y) {
        validateNumber(x, "x", { start: 0, end: this.#width, integerOnly: true });
        validateNumber(y, "y", { start: 0, end: this.#height, integerOnly: true });

        let finalColor = (x + y) % 2 ? this.#lightBG : this.#darkBG;

        for (let i = this.#layerOrder.length - 1; i >= 0; i--) {
            const layerColor = this.#layers.get(this.#layerOrder[i]).pixelLayer.getColor(x, y);

            if (layerColor.alpha <= 0) continue;

            finalColor = layerColor.compositeOver(finalColor);
        }

        return finalColor;
    };

    /**
     * Retrieves name of a layer in the layer list for given ID
     * @param {number} id - The ID of the layer
     * @returns {string} - the name of the layer
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty
     * @throws {RangeError} If the ID is not in the list
     */
    getName(id) {
        this.#validate(id);
        return this.#layers.get(id).name;
    }


    /**
     * Retrieves width of canvas grid for which the layer system is applied
     * @method
     * @returns {number} - The width of the canvas grid for the layers
     */
    get width() {
        return this.#width;
    }

    /**
     * Retrieves height of canvas grid for which the layer system is applied
     * @method
     * @returns {number} - The height of the canvas grid for the layers
     */
    get height() {
        return this.#height;
    }

    /**
     * Retrieves number of layers in the layer list
     * @method
     * @returns {number} - the number of layers
     */
    get size() {
        return this.#layers.size;
    }

    /**
     * Retrieves list of IDs, names and Layer objects of all layers in the list (or just selected ones if specified)
     * @method
     * @param {boolean} [selectedOnly=false] - if true, retrieves only selected layers
     * @returns {Array<LayerData>} - Array of objects containing IDs, names and Layer objects of the layers
     */
    list(selectedOnly = false) {
        let layerList = [];
        if (selectedOnly)
            for (let id of this.#layerOrder) {
                if (this.#selections.has(id))
                    layerList.push({ ... this.#layers.get(id) });
            }
        else
            for (let id of this.#layerOrder) {
                layerList.push({ ... this.#layers.get(id) });
            }

        return layerList;
    }
}


export default LayerManager;
