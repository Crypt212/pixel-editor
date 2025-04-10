/**
 * @class
 * Tracks modified pixel regions with ordered history support.
 * Maintains both a Map for order and a Set for duplicate checking.
 */
class DirtyRectangle {

    /**
     * Creates a DirtyRectangle instance.
     * @constructor
     * @param {Object} [options] - Configuration options.
     * @param {Function} [options.stateType=Object] - The constructor for state objects. Relevant only if strictTypes is true.
     * @param {boolean} [options.strictTypes=false] - Enforce that state objects are instances of stateType.
     */
    constructor({
        stateType = Object,
        strictTypes = false,
    } = {}) {
        this._stateType = stateType;
        this._strictTypes = strictTypes;

        /**
         * @type {Map<string, {
         *   x: number,
         *   y: number,
         *   before: any,
         *   after: any,
         * }>}
         */
        this._changes = new Map();

        this._bounds = {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity
        };
    }

    /**
     * Adds or updates a pixel modification. Coordinates are floored to integers.
     * @method
     * @param {number} x - X-coordinate (floored).
     * @param {number} y - Y-coordinate (floored).
     * @param {any} after - New state.
     * @param {any} [before=after] - Original state (used only on first add).
     * @throws {TypeError} If strictTypes is enabled and states are invalid.
     */
    addChange(x, y, after, before = after) {
        if (this._strictTypes &&
            (!(before instanceof this._stateType) ||
                !(after instanceof this._stateType))) {
            throw new TypeError("Invalid state type");
        }

        x = Math.floor(x);
        y = Math.floor(y);
        const key = `${x},${y}`;

        const existing = this._changes.get(key);

        if (existing) {
            existing.after = after;
        } else {
            this._changes.set(key, {
                x,
                y,
                after: after,
                before: before,
            });

            // Update bounds
            this._bounds.x0 = Math.min(this._bounds.x0, x);
            this._bounds.y0 = Math.min(this._bounds.y0, y);
            this._bounds.x1 = Math.max(this._bounds.x1, x);
            this._bounds.y1 = Math.max(this._bounds.y1, y);
        }
    }

    /**
     * Merges another DirtyRectangle into this one.
     * @method
     * @param {DirtyRectangle} source - Source rectangle to merge.
     */
    merge(source) {
        if (!source || source.isEmpty) return;

        source._changes.forEach((change) => {
            this.addChange(
                change.x,
                change.y,
                change.after,
                change.before,
            );
        });
    }

    /**
     * Creates a shallow copy (states are not deep-cloned).
     * @method
     * @returns {DirtyRectangle}
     */
    clone() {
        const copy = new DirtyRectangle({
            stateType: this._stateType,
            strictTypes: this._strictTypes,
        });

        copy._changes = new Map(this._changes);
        copy._bounds = { ...this._bounds };
        return copy;
    }

    /**
     * Resets the rectangle to initial state.
     * @method
     */
    reset() {
        this._changes.clear();
        this._bounds = {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity
        };
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
        return this._changes.has(`${x},${y}`);
    }

    /**
      * Returns whether the rectangle is empty.
     * @method
      * @returns {boolean}
      */
    get isEmpty() {
        return this._changes.size === 0;
    }

    /**
     * Width of the bounding rectangle.
     * @method
     * @returns {number}
     */
    get width() {
        return this.isEmpty ? 0 : this._bounds.x1 - this._bounds.x0 + 1;
    }

    /**
     * Height of the bounding rectangle.
     * @method
     * @returns {number}
     */
    get height() {
        return this.isEmpty ? 0 : this._bounds.y1 - this._bounds.y0 + 1;
    }

    /**
     * Type used for state validation.
     * @method
     * @returns {Function}
     */
    get stateType() {
        return this._stateType;
    }

    /**
     * Gets current modified states.
     * @method
     * @returns {Array<{x: number, y: number, state: any}>}
     */
    get afterStates() {
        return Array.from(this._changes.values()).map(({ x, y, after }) => ({
            x, y, state: after
        }));
    }

    /**
     * Gets original states before modification.
     * @method
     * @returns {Array<{x: number, y: number, state: any}>}
     */
    get beforeStates() {
        return Array.from(this._changes.values()).map(({ x, y, before }) => ({
            x, y, state: before
        }));
    }

    /**
     * Iterator for all changes (in insertion order).
     * @method
     * @returns {Iterable<{x: number, y: number, before: any, after: any}>}
     */
    get changes() {
        return this._changes.values();
    }

    /**
     * Bounding rectangle of all changes.
     * @method
     * @returns {{x0: number, y0: number, x1: number, y1: number}}
     */
    get bounds() {
        return { ...this._bounds };
    }
}

export default DirtyRectangle;
