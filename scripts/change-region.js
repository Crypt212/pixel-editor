/**
 * @class
 * Tracks modified pixel regions with ordered history support.
 * Maintains both a Map for order and a Set for duplicate checking.
 */
class ChangeRegion {

    /**
     * Map from pixel positions `${x},${y}` to a change record containing the position and before/after states
     * @type {Map<string, {x: number, y: number, before: any, after: any}>}
     */
    #changes = new Map();

    /**
     * Bounds of the region containing all the changes
     * @type {{x0: number, y0: number, x1: number, y1: number}}
     */
    #bounds = {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity
        };

    /**
     * Creates a ChangeRegion instance.
     * @constructor
     */
    constructor() { }

    /**
     * Merges another ChangeRegion into a copy of this one, and returns it.
     * @method
     * @param {ChangeRegion} source - Source rectangle to merge.
     * @returns {ChangeRegion} The result of merging
     */
    merge(source) {
        if (!source || source.isEmpty) return this.clone();

        const result = this.clone();

        source.#changes.forEach((change) => {
            result.setChange(
                change.x,
                change.y,
                change.after,
                change.before,
            );
        });
        return result;
    }

    /**
     * Creates a shallow copy (states are not deep-cloned).
     * @method
     * @returns {ChangeRegion} The clone
     */
    clone() {
        const copy = new ChangeRegion({ });

        this.#changes.forEach(value => {
            copy.setChange(value.x, value.y, value.after, value.before);
        });

        return copy;
    }

    /**
     * Adds or updates a pixel modification. Coordinates are floored to integers.
     * @method
     * @param {number} x - X-coordinate (floored).
     * @param {number} y - Y-coordinate (floored).
     * @param {any} after - New state.
     * @param {any} [before=after] - Original state (used only on first add).
     */
    setChange(x, y, after, before = after) {
        x = Math.floor(x);
        y = Math.floor(y);
        const key = `${x},${y}`;

        const existing = this.#changes.get(key);

        if (existing) {
            existing.after = after;
        } else {
            this.#changes.set(key, {
                x,
                y,
                after: after,
                before: before,
            });

            // Update bounds
            this.#bounds.x0 = Math.min(this.#bounds.x0, x);
            this.#bounds.y0 = Math.min(this.#bounds.y0, y);
            this.#bounds.x1 = Math.max(this.#bounds.x1, x);
            this.#bounds.y1 = Math.max(this.#bounds.y1, y);
        }
    }

    /**
      * Checks if a pixel has been modified.
     * @method
      * @param {number} x - X-coordinate.
      * @param {number} y - Y-coordinate.
      * @returns {boolean}
      */
    hasChange(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        return this.#changes.has(`${x},${y}`);
    }

    /**
      * Returns whether the rectangle is empty.
     * @method
      * @returns {boolean}
      */
    get isEmpty() {
        return this.#changes.size === 0;
    }

    /**
     * Width of the bounding rectangle.
     * @method
     * @returns {number}
     */
    get width() {
        return this.isEmpty ? 0 : this.#bounds.x1 - this.#bounds.x0 + 1;
    }

    /**
     * Height of the bounding rectangle.
     * @method
     * @returns {number}
     */
    get height() {
        return this.isEmpty ? 0 : this.#bounds.y1 - this.#bounds.y0 + 1;
    }

    /**
     * Gets current modified states.
     * @method
     * @returns {Array<{x: number, y: number, state: any}>}
     */
    get afterStates() {
        return Array.from(this.#changes.values()).map(({ x, y, after }) => ({
            x, y, state: after
        }));
    }

    /**
     * Gets original states before modification.
     * @method
     * @returns {Array<{x: number, y: number, state: any}>}
     */
    get beforeStates() {
        return Array.from(this.#changes.values()).map(({ x, y, before }) => ({
            x, y, state: before
        }));
    }

    /**
     * Map for all changes (in insertion order). ['x,y' -> change]
     * @method
     * @returns {Map<string, {x: number, y: number, before: any, after: any}>}
     */
    get changesMap() {
        return new Map(this.#changes);
    }

    /**
     * Bounding rectangle of all changes.
     * @method
     * @returns {{x0: number, y0: number, x1: number, y1: number}}
     */
    get bounds() {
        return { ...this.#bounds };
    }
}

export default ChangeRegion;
