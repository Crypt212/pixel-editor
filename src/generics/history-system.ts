import { validateNumber } from "@src/utils/validation.js";

type HistoryRecord<DataType> = {
    id: number,
    data: DataType,
    timestamp?: number,
}

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
 * const history = new History<{x:number,y:number,color:string}>(10);
 * history.addRecord("Paint", {x:1, y:2, color:"#000000"});
 * history.addRecordData({x: 1, y: 2, color: "#FF0000"});
 * history.undo(); // Reverts to previous state
 * 
 * @class
 */
export default abstract class HistorySystem<DataType extends Object> {

    /**
     * Internal circular buffer storing records
     */
    private buffer: HistoryRecord<DataType>[];

    /**
     * The index of the current selected record
     */
    private currentIndex: number = 0;

    /**
     * The index of the oldest saved record in the history system
     */
    private startIndex: number = 0;

    /**
     * The index of the last saved record in the history system
     */
    private endIndex: number = 0;

    /**
     * Internal counter to enumerate increamental IDs for the created records
     */
    private recordIDCounter: number = 0;

    /**
     * Creates a new History with specified capacity
     * @constructor
     * @param capacity - Maximum stored records (1-64)
     * @param initialData - The data for the initial record in the history
     * @throws {TypeError} If capacity is not an integer
     * @throws {RangeError} If capacity is outside 1-64 range
     */
    constructor(capacity: number, initialData: DataType) {
        validateNumber(capacity, "Capacity", { start: 1, end: 64, integerOnly: true });

        capacity = Math.floor(capacity);
        this.buffer = new Array(capacity);
        this.buffer[this.startIndex] = {
            id: 0,
            data: initialData,
            timestamp: Date.now()
        };
    }

    /**
     * Adds a new record if at the end of history or replaces the current record while removing future of replaced record
     * @method
     * @param data - Data to store
     * @param keepFuture - Determines if future records should be kept
     */
    setRecord(data: DataType, keepFuture = false) {
        let atEnd = this.currentIndex === this.endIndex;

        if (this.count === this.capacity)
            this.startIndex = this.normalizedIndex(this.startIndex + 1);

        this.currentIndex = this.normalizedIndex(this.currentIndex + 1);

        if (!keepFuture || atEnd)
            this.endIndex = this.currentIndex;

        this.buffer[this.currentIndex] = {
            id: ++this.recordIDCounter,
            data: data,
        };
    }

    /**
     * Sets data to the current record its reference (no copy is made)
     * @method
     * @param data - Data to store
     * @throws {Error} If no active record exists
     * @example
     * Stores a copy of the object
     * history.addRecordData({x: 1, y: 2});
     */
    setRecordData(data: DataType) {
        if (this.currentIndex === -1) {
            throw new Error("No record to add to.");
        }

        this.buffer[this.currentIndex].data = data;
    }

    private normalizedIndex(index: number): number {
        return (index + this.capacity) % this.capacity;
    }


    /**
     * Gets the record at an offset from current position
     * @private
     * @param [offset=0] - Offset from current position
     * @returns Record at specified offset, if offset crossed the boundaries, returns boundary records
     */
    private getRecord(offset: number = 0): HistoryRecord<DataType> {

        validateNumber(offset, "Offset", { integerOnly: true });

        if (offset > 0) { // go right -> end
            let boundary = this.normalizedIndex(this.endIndex - this.currentIndex);
            offset = Math.min(boundary, offset);
            return this.buffer[this.normalizedIndex(this.currentIndex + offset)];
        } else if (offset < 0) { // go left -> start
            offset *= -1;
            let boundary = this.normalizedIndex(this.currentIndex - this.startIndex);
            offset = Math.min(boundary, offset);
            return this.buffer[this.normalizedIndex(this.currentIndex - offset)];
        } else {
            return this.buffer[this.currentIndex];
        }
    }

    /**
     * Retrieves record ID at an offset from current selected record
     * @method
     * @param [offset=0] - The the offset from the current record for which ID gets returned
     * @returns The record ID at the offset, retreives it for boundary records if offset is out of bounds
     */
    getRecordID(offset: number = 0): number {
        return this.getRecord(offset).id;
    }

    /**
     * Retrieves record data at an offset from current selected record
     * @method
     * @param [offset=0] - The the offset from the current record for which data gets returned
     * @returns The record data at the offset, retreives it for boundary records if offset is out of bounds
     */
    getRecordData(offset: number = 0): DataType {
        return this.getRecord(offset).data;
    }

    /**
     * Retrieves the current offset of the record from start of the history
     * @method
     * @returns The record offset from start to end
     */
    getRecordOffset(): number {
        return this.currentIndex - this.endIndex;
    }

    /**
     * Moves backward in history (undo), does nothing if already at start
     * @method
     * @returns The record data at the new ID and its offset from start
     * @returns The record data at the offset, retreives it for boundary records if offset is out of bounds
     */
    undo(): { data: DataType, index: number } {
        if (this.currentIndex !== this.startIndex)
            this.currentIndex = this.normalizedIndex(this.currentIndex - 1);

        return {
            data: this.buffer[this.currentIndex].data,
            index: this.normalizedIndex(this.currentIndex - this.startIndex)
        };
    }

    /**
     * Moves forward in history (redo), does nothing if already at end or history is empty
     * @method
     * @returns The record data at the new ID and its offset from start
     */
    redo(): { data: DataType, index: number } {
        if (this.currentIndex !== this.startIndex) {
            this.currentIndex = this.normalizedIndex(this.currentIndex + 1);
        }

        return {
            data: this.buffer[this.currentIndex].data,
            index: this.normalizedIndex(this.currentIndex - this.startIndex)
        };
    }

    /**
     * Moves to a record with a specific ID
     * @method
     * @returns Whether the record was found
     */
    jumpToRecord(id: number): boolean {
        const index = this.buffer.findIndex(r => r.id === id);
        if (index >= 0) this.currentIndex = index;
        return index >= 0;
    }

    /**
     * Resets the history with data for the initial record
     * @method
     * @param initialData - Data of the initial record
     */
    reset(initialData: DataType) {
        this.buffer = new Array(this.capacity);
        this.currentIndex = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.recordIDCounter = 0;
        this.buffer[this.startIndex] = {
            id: 0,
            data: initialData,
            timestamp: Date.now()
        }
    }

    /**
     * Returns an iterator to the history
     * @method
     * @yeilds the stored history records 
     * @returns Iterator to the history
     */
    *[Symbol.iterator](): IterableIterator<HistoryRecord<DataType>> {
        let index = this.startIndex;
        while (index !== this.endIndex) {
            yield this.buffer[index];
            index = this.normalizedIndex(index + 1);
        }
        yield this.buffer[index];
    }

    /**
     * Current number of stored records
     * @method
     * @returns Number of stored records
     */
    get count(): number {
        return this.normalizedIndex(this.endIndex - this.startIndex) + 1;
    }

    /**
     * Maximum number of storable records
     * @method
     * @returns Maximum number of storable records
     */
    get capacity(): number {
        return this.buffer.length;
    }

    /**
     * Returns true if current index is at the end
     * @method
     * @returns Whether index is at end
     */
    get atEnd(): boolean {
        return this.currentIndex === this.endIndex;
    }

    /**
     * Returns true if current index is at the start
     * @method
     * @returns Whether current index is at start
     */
    get atStart(): boolean {
        return this.currentIndex === this.startIndex;
    }
}
