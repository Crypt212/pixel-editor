import { validateNumber } from "#utils/validation.js";

/**
 * Represents a circular buffer-based history system for undo/redo operations.
 * Tracks records containing arbitrary data.
 * 
 * Key Features:
 * - Fixed-capacity circular buffer (1-64 records)
 * - Atomic recording
 * - Reference copy data storage
 * - Undo/redo functionality
 * - Record metadata (IDs/data)
 * 
 * @example
 * const history = new History(10);
 * history.addRecord("Paint");
 * history.addRecordData({x: 1, y: 2, color: "#FF0000"});
 * history.undo(); // Reverts to previous state
 * 
 * @class
 */
class History {

    /**
     * Internal circular buffer storing records
     * @type {Array<{id: number, data: Array<any>}>}
     * @private
     */
    #buffer;

    /**
     * The index of the current selected record
     * @type {number}
     * @private
     */
    #currentIndex = -1;

    /**
     * The index of the oldest saved record in the history system
     * @type {number}
     * @private
     */
    #startIndex = 0;

    /**
     * The index of the last saved record in the history system
     * @type {number}
     * @private
     */
    #endIndex = -1;

    /**
     * Internal counter to enumerate increamental IDs for the created records
     * @type {number}
     * @private
     */
    #recordIDCounter = -1;

    /**
     * Creates a new History with specified capacity
     * @constructor
     * @param {number} capacity - Maximum stored records (1-64)
     * @throws {TypeError} If capacity is not an integer
     * @throws {RangeError} If capacity is outside 1-64 range
     */
    constructor(capacity) {
        validateNumber(capacity, "Capacity", { start: 1, end: 64, integerOnly: true });

        capacity = Math.floor(capacity);
        this.#buffer = new Array(capacity);
    }

    /**
     * Adds a new record to the history
     * @method
     */
    addRecord() {
        if (this.#currentIndex !== this.#endIndex && this.#endIndex !== -1)
            this.#endIndex = this.#currentIndex;

        if (this.bufferSize === this.bufferCapacity) {
            this.#startIndex = this.#wrapIndex(this.#startIndex + 1);
        }

        if (this.isStart) this.#currentIndex = this.#startIndex;
        else
            this.#currentIndex = this.#wrapIndex(this.#currentIndex + 1);

        this.#endIndex = this.#currentIndex;

        this.#buffer[this.#currentIndex] = {
            id: ++this.#recordIDCounter,
            data: null,
        };
    }

    /**
     * Sets data to the current record its reference (no copy is made)
     * @method
     * @param {any} data - Data to store
     * @throws {Error} If no active record exists
     * @example
     * Stores a copy of the object
     * history.addRecordData({x: 1, y: 2});
     */
    setRecordData(data) {
        if (this.#currentIndex === -1) {
            throw new Error("No record to add to.");
        }

        this.#buffer[this.#currentIndex].data = data;
    }

    #wrapIndex(index) {
        return (index + this.bufferCapacity) % this.bufferCapacity;
    }


    /**
     * Gets the record at an offset from current position
     * @private
     * @param {number} [offset=0] - Offset from current position
     * @returns {(Object|number)} Record or -1 if invalid offset
     */
    #getRecord(offset = 0) {
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
            distance = distance < 0 ? distance + this.bufferCapacity : distance;

            if (distance - offset < 0) return -1;

            return this.#buffer[this.#wrapIndex(index + offset)];
        } else if (offset < 0) { // go left -> start
            offset *= -1;

            if (index === -1) return -1; // absolute start

            distance = index - this.#startIndex;

            // negate the wrap effect
            distance = distance < 0 ? distance + this.bufferCapacity : distance;

            if (distance - offset < 0) return -1;

            return this.#buffer[
                (index - offset + this.bufferCapacity) %
                this.bufferCapacity
            ];
        } else {
            if (this.#currentIndex === -1) return -1;
            return this.#buffer[this.#currentIndex];
        }
    }

    /**
     * Retrieves record ID at an offset from current selected record
     * @method
     * @param {number} [offset=0] - The the offset from the current record for which ID gets returned
     * @returns {number} The record ID, or -1 if not in range.
     */
    getRecordID(offset = 0) {
        let rec = this.#getRecord(offset);
        if (rec === -1) return -1;
        return rec.id;
    }

    /**
     * Retrieves record data at an offset from current selected record
     * @method
     * @param {number} [offset=0] - The the offset from the current record for which data gets returned
     * @returns {Array | number} An array containing the record data, or -1 if not in range
     */
    getRecordData(offset = 0) {
        let rec = this.#getRecord(offset);
        if (rec === -1) return -1;
        return rec.data;
    }

    /**
     * Moves backward in history (undo)
     * @method
     * @returns {number} ID of the restored record (-1 at start)
     */
    undo() {
        if (this.isStart || this.#currentIndex === this.#startIndex) {
            this.#currentIndex = -1; // absolute start
            return null;
        }

        this.#currentIndex =
            (this.#currentIndex - 1 + this.bufferCapacity) %
            this.bufferCapacity;
        return this.#buffer[this.#currentIndex].data;
    }

    /**
     * Moves forward in history (redo)
     * @method
     * @returns {number} ID of the restored record (-1 at end)
     */
    redo() {
        if (this.#currentIndex !== this.#endIndex) {
            if (this.#currentIndex === -1) {
                this.#currentIndex = this.#startIndex;
            } else {
                this.#currentIndex = this.#wrapIndex(this.#currentIndex + 1);
            }
        } else if (this.#endIndex === -1) return null; // end = current = -1

        return this.#buffer[this.#currentIndex].data;
    }

    /**
     * Current number of stored records
     * @member {number}
     * @readonly
     */
    get bufferSize() {
        if (this.#endIndex == -1) return 0;
        return this.#wrapIndex(this.#endIndex - this.#startIndex) + 1;
    }

    /**
     * Maximum number of storable records
     * @member {number}
     * @readonly
     */
    get bufferCapacity() {
        return this.#buffer.length;
    }

    /**
     * Returns true if current index is at the end
     * @member {boolean}
     * @readonly
     */
    get isEnd() {
        return this.#currentIndex === this.#endIndex;
    }

    /**
     * Returns true if current index is at the start
     * @member {boolean}
     * @readonly
     */
    get isStart() {
        return this.#currentIndex === -1;
    }
}
export default History;
