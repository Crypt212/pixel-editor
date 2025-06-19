import { validateNumber } from "@src/utils/validation.js";
import PixelLayer from "../layers/concrete/pixel-layer.js";
import { PixelCoord, PixelRectangleBounds } from "@src/types/pixel-types.js";
import Color from "@src/services/color.js";

export type LayerData = {
    id: number,
    name: string,
    pixelLayer: PixelLayer
}

/**
 * Represents a system for managing layers of canvas grids
 * @class
 */
export default class LayerManager {

    /**
     * A map containing layers accessed by their IDs
     */
    private layers: Map<number, LayerData> = new Map();

    /**
     * A Layer for previewing actions
     */
    previewLayer: PixelLayer;

    /**
     * The currently active layer
     */
    activeLayer: PixelLayer | null = null;

    /**
     * A set of IDs of the currently selected layers
     */
    private selections: Set<number> = new Set();

    /**
     * An array for maintaining order, holds IDs of the layers
     */
    private layerOrder: number[] = [];

    /**
     * Dimensions of canvases that the layer system holds
     */
    private canvasWidth: number;
    private canvasHeight: number;

    /**
     * Internal counter to enumerate increamental IDs for the created layers
     */
    private layerIDCounter: number = -1;

    /**
     * Cache of the rendered image
     */
    private renderCache: Map<PixelCoord, Color> = new Map();

    /**
     * Colors of the checkerboard background of transparent canvas
     */
    private darkBG: Color = Color.get({ rgb: [160, 160, 160], alpha: 1 });
    private lightBG: Color = Color.get({ rgb: [217, 217, 217], alpha: 1 });

    /**
     * Represents a system for managing layers of canvas
     * @constructor
     * @param [width=1] - The width of the canvas grid for the layers
     * @param [height=1] height - The height of the canvas grid for the layers
     * @param events - The event bus for subscribing to events
     * @throws {TypeError} if width or height are not integers
     * @throws {RangeError} if width or height are not between 1 and 1024 inclusive
     */
    constructor(width: number = 1, height: number = 1) {
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
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.previewLayer = new PixelLayer(this.canvasWidth, this.canvasHeight);
    }

    /**
     * validates IDs in the layers list
     * @method
     * @param ids - The IDs of the layers
     * @throws {RangeError} If the layer list is empty or the IDs are not in the list
     * @throws {TypeError} If the IDs is not integers
     */
    private validate(...ids: number[]) {
        if (this.layers.size === 0)
            throw new RangeError("No layers to get");

        for (let id of ids) {
            validateNumber(id, "ID", { integerOnly: true, });

            if (!this.layerOrder.includes(id))
                throw new RangeError(`Layer with ${id} ID is not found`);
        }
    }

    /**
     * Adds a new layer object into the layers list, if only layer in list, is set as the active layer
     * @method
     * @param name - The name of the layer to be added
     * @returns the ID of the newly created layer
     * @throws {TypeError} If the name is not string
     */
    add(name: string): number {
        let id = ++this.layerIDCounter;

        let newLayer = {
            id: id,
            name: name,
            pixelLayer: new PixelLayer(this.canvasWidth, this.canvasHeight),
        };

        this.layers.set(id, newLayer);
        this.layerOrder.push(id);
        this.activeLayer = this.activeLayer ?? newLayer.pixelLayer;
        return id;
    }

    /**
     * Delete layers with given IDs from layers list and set active layer to null if got deleted. If no ID given, delete selected layers
     * @param ids - The IDs of the layers to be removed
     * @method
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty or the index is out of valid range
     */
    remove(...ids: number[]) {
        if (ids.length === 0) ids = Array.from(this.selections);
        this.validate(...ids);

        // reverse order to avoid much index shifting
        ids.sort((a, b) => this.layerOrder.indexOf(b) - this.layerOrder.indexOf(a))
            .forEach(id => {
                if (this.layers.get(id).pixelLayer === this.activeLayer) this.activeLayer = null;
                this.selections.delete(id);
                this.layers.delete(id);
                this.layerOrder.splice(this.layerOrder.indexOf(id), 1);
            });
    }

    /**
     * Sets the active layer
     * @method
     * @param id - The ID of the layer to be activated
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty or the ID is not in the list
     */
    activate(id: number) {
        if (this.layers.size === 0)
            throw new RangeError("No layers to select");

        this.validate(id);
        this.activeLayer = this.layers.get(id).pixelLayer;
    }

    /**
     * Selects layers in the layers list
     * @method
     * @param ids - The IDs to select, if an ID is for an already selected layer, ignore it
     * @throws {TypeError} If the IDs are not integers
     * @throws {RangeError} If the layer list is empty or the IDs are not in the list
     */
    select(...ids: number[]) {
        if (this.layers.size === 0)
            throw new RangeError("No layers to select");

        this.validate(...ids);

        // selection
        for (let id of ids) {
            this.selections.add(id);
        }
    }

    /**
     * Deselects layers in the layers list
     * @method
     * @param ids - The IDs to deselect, if an ID is for an already unselected layer, ignores it
     * @throws {TypeError} If the IDs are not integers
     * @throws {RangeError} If the layer list is empty or the IDs are not in the list
     */
    deselect(...ids: number[]) {
        if (this.layers.size === 0)
            throw new RangeError("No layers to select");

        // validation
        for (let id of ids) {
            this.validate(id);
        }

        // deselection
        for (let id of ids) {
            if (this.selections.has(id))  // if 
                this.selections.delete(id);
        }
    }

    /**
     * Deselects all layers
     */
    clearSelection() {
        this.selections.clear();
    }

    /**
     * Changes the position of a single layer in the layer list
     * @method
     * @param offset - The offset by which to move the layer
     * @param id - The ID of the layer to move
     * @throws {TypeError} If the offset or ID are not a valid integers
     * @throws {RangeError} If the layer list is empty or the ID is not in the layer list
     */
    move(offset: number, id: number) {
        if (this.layers.size === 0) {
            throw new RangeError("No layers to move");
        }

        validateNumber(offset, "Offset", { integerOnly: true });
        this.validate(id);

        const currentIndex = this.layerOrder.indexOf(id);
        let newIndex = currentIndex + offset;

        // clamp the new index to valid range
        newIndex = Math.max(0, Math.min(newIndex, this.layerOrder.length - 1));

        if (newIndex !== currentIndex) {
            this.layerOrder.splice(currentIndex, 1);
            this.layerOrder.splice(newIndex, 0, id);
        }
    }

    /**
     * Retrieves the image at the specified bounded rectangle in the canvas, the whole canvas if no changes given
     * @method
     * @param bounds - The bounds of the changed pixels, if null, update everything
     * @returns The resulting image data of the compsited layers and the starting position
     */
    renderImage(bounds: PixelRectangleBounds = {
        x0: 0,
        y0: 0,
        x1: this.canvasWidth - 1,
        y1: this.canvasHeight - 1,
    }): { image: ImageData, x0: number, y0: number } {

        let image: ImageData;

        const normalizeBounds = (bounds: PixelRectangleBounds): PixelRectangleBounds => {
            const { x0, y0, x1, y1 } = bounds;
            return {
                x0: Math.min(x0, this.canvasWidth - 1),
                y0: Math.min(y0, this.canvasHeight - 1),
                x1: Math.max(x1, 0),
                y1: Math.max(y1, 0),
            }
        }

        const fillImage = (x: number, y: number, x0: number, y0: number) => {
            const index = ((y - y0) * this.canvasWidth + (x - x0)) * 4;

            const color = this.getColor(x, y);

            image.data[index + 0] = color.rgb[0];
            image.data[index + 1] = color.rgb[1];
            image.data[index + 2] = color.rgb[2];
            image.data[index + 3] = Math.round(color.alpha * 255);
        }

        bounds = normalizeBounds(bounds);

        image = new ImageData(bounds.x1 - bounds.x0 + 1, bounds.y1 - bounds.y0 + 1);
        for (let y = bounds.y0; y <= bounds.y1; y++)
            for (let x = bounds.x0; x <= bounds.x1; x++)
                fillImage(x, y, bounds.x0, bounds.y0);

        return { image, x0: bounds.x0, y0: bounds.y0 };
    }

    /**
     * Sets the two colors of the checkerboard background covor of the canvas
     * @method
     * @param lightBG - The first color
     * @param darkBG - The second color
     */
    setBackgroundColors(lightBG: Color, darkBG: Color) {
        this.lightBG = lightBG;
        this.darkBG = darkBG;
    }

    /**
     * Sets a new name to a layer in the layer list for given ID
     * @param id - The ID of the layer
     * @param name - The index to change to in the layer list
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty or the ID is not in the list
     */
    setName(id: number, name: string) {
        this.validate(id);
        this.layers.get(id).name = name;
    }

    /**
     * Retrieves the layer in the layer list for given ID
     * @param id - The ID of the layer
     * @returns the layer object
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty or the ID is not in the list
     */
    getLayer(id: number): PixelLayer {
        this.validate(id);
        return this.layers.get(id).pixelLayer;
    }

    /**
     * Retrieves the resulting color of all layers in the list at a pixel position
     * @method
     * @param x - The X-Coordinate
     * @param y - The Y-Coordinate
     * @returns The resulting color object of all layers at the specified pixel position
     * @throws {TypeError} If X-Coordinate or Y-Coordinate are not valid integers
     * @throws {RangeError} If X-Coordinate or Y-Coordinate are not in valid range
     */
    getColor(x: number, y: number): Color {
        validateNumber(x, "x", { start: 0, end: this.canvasWidth, integerOnly: true });
        validateNumber(y, "y", { start: 0, end: this.canvasHeight, integerOnly: true });

        if (this.renderCache.has({ x, y })) return this.renderCache.get({ x, y });

        let finalColor = (x + y) % 2 ? this.lightBG : this.darkBG;

        for (let i = this.layerOrder.length - 1; i >= 0; i--) {
            const layer = this.layers.get(this.layerOrder[i]).pixelLayer;
            const layerColor = layer.getColor(x, y);

            if (layerColor.alpha <= 0) continue;

            finalColor = Color.compositeOver(layerColor, finalColor);
        }

        return finalColor;
    };

    /**
     * Retrieves name of a layer in the layer list for given ID
     * @param id - The ID of the layer
     * @returns the name of the layer
     * @throws {TypeError} If the ID is not integer
     * @throws {RangeError} If the layer list is empty or the ID is not in the list
     */
    getName(id: number): string {
        this.validate(id);
        return this.layers.get(id).name;
    }


    /**
     * Retrieves width of canvas grid for which the layer system is applied
     * @method
     * @returns The width of the canvas grid for the layers
     */
    get width(): number {
        return this.canvasWidth;
    }

    /**
     * Retrieves height of canvas grid for which the layer system is applied
     * @method
     * @returns The height of the canvas grid for the layers
     */
    get height(): number {
        return this.canvasHeight;
    }

    /**
     * Retrieves number of layers in the layer list
     * @method
     * @returns the number of layers
     */
    get size(): number {
        return this.layers.size;
    }

    /**
     * Retrieves list of IDs, names and Layer objects of all layers in the list (or just selected ones if specified)
     * @method
     * @param [selectedOnly=false] - if true, retrieves only selected layers
     * @returns Array of objects containing IDs, names and Layer objects of the layers
     */
    *list(selectedOnly: boolean = false): IterableIterator<LayerData> {
        if (selectedOnly)
            for (let id of this.layerOrder) {
                if (this.selections.has(id))
                    yield this.layers.get(id);
            }
        else
            for (let id of this.layerOrder) {
                yield this.layers.get(id);
            }
    }
}
