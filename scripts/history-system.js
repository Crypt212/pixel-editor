import {validateNumber} from "./validation.js";

/**
 * Represents a history system to store, undo, redo action data.
 * @class
 */
class HistorySystem {
    #buffer;
    #currentIndex = -1;
    #startIndex = 0;
    #endIndex = -1;
    #actionGroupIDCounter = -1;

    /**
     * Creates a history system with specified capacity
     * @constructor
     * @param {number} capacity - The max size of the history buffer (range from 1 to 64)
     * @throws {Error} Throws an error if capacity is not an integer between 1 and 64
     */
    constructor(capacity) {
        validateNumber(capacity, "Capacity", {start: 1, end: 64, integerOnly: true});

        capacity = Math.floor(capacity);
        this.#buffer = new Array(capacity);
    }

    /**
     * Creates a copy of a history system object
     * @method
     */
    //copy() {
    //    const copyHistory = new HistorySystem();
    //    copyHistory.#currentIndex = this.#currentIndex;
    //    copyHistory.#startIndex = this.#startIndex;
    //    copyHistory.#endIndex = this.#endIndex;
    //    copyHistory.#actionGroupIDCounter = this.#actionGroupIDCounter;
    //    this.#buffer.forEach(elm => {
    //        if (typeof elm === "object" && elm !== null) {
    //            if (Array.isArray(elm))
    //                copyHistory.#buffer.push([...elm]);
    //            else copyHistory.#buffer.push({...elm});
    //        } else copyHistory.#buffer.push(elm);
    //    });
    //    return copyHistory;
    //}


    /**
     * Addes action group with given name and incremental ID to the action buffer
     * @method
     * @param {string} actionGroupName - Name of the action group to be added
     * @throws {Error} Throws an error if given action group name is not of type string
     */
    addActionGroup(actionGroupName = "") {
        if (typeof actionGroupName !== "string")
            throw new TypeError("Action group name must be string");

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
     * Adds a shallow copy of action data to the current selected action group
     * @method
     * @param {any} actionDataObject - The action data to be stored in the current action group
     * @throws {Error} Throws an error if no action group selected currently (eg. when at the absolute start)
     */
    addActionData(actionDataObject) {
        if (this.#currentIndex === -1) {
            throw new Error("No action group to add to.");
        }

        let newObject;
        if (typeof actionDataObject === "object" && actionDataObject !== null) {
            if (Array.isArray(actionDataObject))
                newObject = [...actionDataObject];
            else newObject = { ...actionDataObject };
        } else newObject = actionDataObject;

        this.#buffer[this.#currentIndex].actionData.push(newObject);
    }

    /**
     * Retrieves action group at an offset from current selected group
     * @method
     * @param {number} offset - The the offset from the current group for which ID gets returned
     * @returns {Object{groupID, groupName, actionArray} | number} The selected action group, -1 if out of range
     * @throws {Error} Throws an error if offset is not an integer number
     */
    #getActionGroup(offset = 0) {
        validateNumber(offset, "Offset", {integerOnly: true});

        let check;
        let index = this.#currentIndex;

        if (offset > 0) {
            if (index === -1) {
                index = this.#startIndex;
                offset--;
            }

            check = this.#endIndex - index;
            check = check < 0 ? check + this.getBufferCapacity : check;

            if (check - offset < 0) return -1;

            return this.#buffer[(index + offset) % this.getBufferCapacity];
        } else if (offset < 0) {
            offset *= -1;

            if (index === -1) return -1;

            check = index - this.#startIndex;
            check = check < 0 ? check + this.getBufferCapacity : check;

            // if (check - offset) is -1 => result index at -1 which is start => return -1
            if (check - offset < 0) return -1;

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
     * @param {number} offset - The the offset from the current group for which ID gets returned
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
     * @param {number} offset - The the offset from the current group for which name gets returned
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
     * @param {number} offset - The the offset from the current group for which data gets returned
     * @returns {Array | number} An array containing the action group data, or -1 if not in range
     */
    getActionData(offset = 0) {
        let group = this.#getActionGroup(offset);
        if (group === -1) return -1;
        return group.actionData;
    }

    /**
     * Reverts to the previous action group
     * @method
     * @returns {number} The ID of the previous action group
     */
    undo() {
        if (this.#currentIndex === this.#startIndex) this.#currentIndex = -1;

        if (this.#currentIndex === -1) return this.#currentIndex;

        this.#currentIndex =
            (this.#currentIndex - 1 + this.getBufferCapacity) %
            this.getBufferCapacity;
        return this.#buffer[this.#currentIndex].groupID;
    }

    /**
     * Advances to the next action group
     * @method
     * @returns {number} The ID of next action group
     */
    redo() {
        if (this.#currentIndex !== this.#endIndex)
            if (this.#currentIndex === -1) {
                this.#currentIndex = this.#startIndex;
            } else {
                this.#currentIndex =
                    (this.#currentIndex + 1) % this.getBufferCapacity;
            }

        return this.#buffer[this.#currentIndex].groupID;
    }

    /**
     * Retrieves number of action groups stored currently in the action buffer
     * @method
     * @returns {number} The size
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
     * Retrieves action buffer capacity (maximum number of action groups to add to the system)
     * @method
     * @returns {number} The capacity
     */
    get getBufferCapacity() {
        return this.#buffer.length;
    }
}

export default HistorySystem;
