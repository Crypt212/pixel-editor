import { validateNumber } from "./validation.js";

/**
 * Represents a circular buffer-based history system for undo/redo operations.
 * Tracks action groups containing arbitrary action data.
 * 
 * Key Features:
 * - Fixed-capacity circular buffer (1-64 actions)
 * - Atomic action grouping
 * - Shallow copy data storage
 * - Undo/redo functionality
 * - Action metadata (names/IDs)
 * 
 * @example
 * const history = new ActionHistory(10);
 * history.addActionGroup("Paint");
 * history.addActionData({x: 1, y: 2, color: "#FF0000"});
 * history.undo(); // Reverts to previous state
 * 
 * @class
 */
class ActionHistory {

    /**
     * Internal circular buffer storing action groups
     * @type {Array<{groupName: string, groupID: number, actionData: Array<any>}>}
     * @private
     */
    #buffer;

    /**
     * The index of the current selected action group
     * @type {number}
     * @private
     */
    #currentIndex = -1;

    /**
     * The index of the oldest saved action group in the history system
     * @type {number}
     * @private
     */
    #startIndex = 0;

    /**
     * The index of the last saved action group in the history system
     * @type {number}
     * @private
     */
    #endIndex = -1;

    /**
     * Internal counter to enumerate increamental IDs for the created groups
     * @type {number}
     * @private
     */
    #actionGroupIDCounter = -1;

    /**
     * Creates a new ActionHistory with specified capacity
     * @constructor
     * @param {number} capacity - Maximum stored action groups (1-64)
     * @throws {TypeError} If capacity is not an integer
     * @throws {RangeError} If capacity is outside 1-64 range
     */
    constructor(capacity) {
        validateNumber(capacity, "Capacity", { start: 1, end: 64, integerOnly: true });

        capacity = Math.floor(capacity);
        this.#buffer = new Array(capacity);
    }

    /**
     * Adds a new named action group to the history
     * @method
     * @param {string} [actionGroupName=""] - Descriptive name for the action group
     * @throws {TypeError} If name is not a string
     */
    addActionGroup(actionGroupName = "") {
        if (typeof actionGroupName !== "string")
            throw new TypeError("Action group name must be string");

        if (this.#currentIndex !== this.#endIndex && this.#endIndex !== -1)
            this.#endIndex = this.#currentIndex;

        if (this.getBufferSize === this.getBufferCapacity) {
            this.#startIndex = (this.#startIndex + 1) % this.getBufferCapacity;
        }

        if (this.#currentIndex === -1) this.#currentIndex = this.#startIndex;
        else
            this.#currentIndex =
                (this.#currentIndex + 1) % this.getBufferCapacity;

        this.#endIndex = this.#currentIndex;

        this.#buffer[this.#currentIndex] = {
            groupName: actionGroupName,
            groupID: ++this.#actionGroupIDCounter,
            actionData: [],
        };
    }

    /**
     * Adds data to the current action group its reference (no copy is made)
     * @method
     * @param {any} actionDataObject - Data to store
     * @throws {Error} If no active action group exists
     * @example
     * Stores a copy of the object
     * history.addActionData({x: 1, y: 2});
     */
    addActionData(actionDataObject) {
        if (this.#currentIndex === -1) {
            throw new Error("No action group to add to.");
        }

        this.#buffer[this.#currentIndex].actionData.push(actionDataObject);
    }

    /**
     * Gets action group metadata by offset from current position
     * @private
     * @param {number} [offset=0] - Offset from current position
     * @returns {(Object|number)} Action group or -1 if invalid offset
     */
    #getActionGroup(offset = 0) {
        validateNumber(offset, "Offset", { integerOnly: true });

        let distance;
        let index = this.#currentIndex;

        if (offset > 0) { // go right -> end
            if (index === -1) {         // absolute start 
                index = this.#startIndex;
                offset--;
            }

            distance = this.#endIndex - index;

            // negate the wrap effect
            distance = distance < 0 ? distance + this.getBufferCapacity : distance;

            if (distance - offset < 0) return -1;

            return this.#buffer[(index + offset) % this.getBufferCapacity];
        } else if (offset < 0) { // go left -> start
            offset *= -1;

            if (index === -1) return -1; // absolute start

            distance = index - this.#startIndex;

            // negate the wrap effect
            distance = distance < 0 ? distance + this.getBufferCapacity : distance;

            if (distance - offset < 0) return -1;

            return this.#buffer[
                (index - offset + this.getBufferCapacity) %
                this.getBufferCapacity
            ];
        } else {
            if (this.#currentIndex === -1) return -1;
            return this.#buffer[this.#currentIndex];
        }
    }

    /**
     * Retrieves action group ID at an offset from current selected group
     * @method
     * @param {number} [offset=0] - The the offset from the current group for which ID gets returned
     * @returns {number} The action group ID, or -1 if not in range.
     */
    getActionGroupID(offset = 0) {
        let group = this.#getActionGroup(offset);
        if (group === -1) return -1;
        return group.groupID;
    }

    /**
     * Retrieves action group name at an offset from current selected group
     * @method
     * @param {number} [offset=0] - The the offset from the current group for which name gets returned
     * @returns {string | number} The action group name, or -1 if not in range.
     */
    getActionGroupName(offset = 0) {
        let group = this.#getActionGroup(offset);
        if (group === -1) return -1;
        return group.groupName;
    }

    /**
     * Retrieves action group data at an offset from current selected group
     * @method
     * @param {number} [offset=0] - The the offset from the current group for which data gets returned
     * @returns {Array | number} An array containing the action group data, or -1 if not in range
     */
    getActionData(offset = 0) {
        let group = this.#getActionGroup(offset);
        if (group === -1) return -1;
        return group.actionData;
    }

    /**
     * Moves backward in history (undo)
     * @method
     * @returns {number} ID of the restored action group (-1 at start)
     */
    undo() {
        if (this.#currentIndex === this.#startIndex) this.#currentIndex = -1; // absolute start

        if (this.#currentIndex === -1) return this.#currentIndex;

        this.#currentIndex =
            (this.#currentIndex - 1 + this.getBufferCapacity) %
            this.getBufferCapacity;
        return this.#buffer[this.#currentIndex].groupID;
    }

    /**
     * Moves forward in history (redo)
     * @method
     * @returns {number} ID of the restored action group (-1 at end)
     */
    redo() {
        if (this.#currentIndex !== this.#endIndex) {
            if (this.#currentIndex === -1) {
                this.#currentIndex = this.#startIndex;
            } else {
                this.#currentIndex =
                    (this.#currentIndex + 1) % this.getBufferCapacity;
            }
        } else if (this.#endIndex === -1) return this.#currentIndex;

        return this.#buffer[this.#currentIndex].groupID;
    }

    /**
     * Current number of stored action groups
     * @member {number}
     * @readonly
     */
    get getBufferSize() {
        if (this.#endIndex == -1) return 0;
        return (
            ((this.#endIndex - this.#startIndex + this.getBufferCapacity) %
                this.getBufferCapacity) +
            1
        );
    }

    /**
     * Maximum number of storable action groups
     * @member {number}
     * @readonly
     */
    get getBufferCapacity() {
        return this.#buffer.length;
    }
}

export default ActionHistory;
