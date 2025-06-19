import { validateNumber } from "../utils/validation.js";

export default class HistorySystem {
    buffer;
    currentIndex = 0;
    startIndex = 0;
    endIndex = 0;
    recordIDCounter = 0;

    constructor(capacity, initialData) {
        validateNumber(capacity, "Capacity", { start: 1, end: 64, integerOnly: true });
        capacity = Math.floor(capacity);
        this.buffer = new Array(capacity);
        this.buffer[this.startIndex] = {
            id: 0,
            data: initialData,
            timestamp: Date.now()
        };
    }

    setRecord(data, keepFuture = false) {
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

    setRecordData(data) {
        if (this.currentIndex === -1) {
            throw new Error("No record to add to.");
        }
        this.buffer[this.currentIndex].data = data;
    }

    normalizedIndex(index) {
        return (index + this.capacity) % this.capacity;
    }

    getRecord(offset = 0) {
        validateNumber(offset, "Offset", { integerOnly: true });
        if (offset > 0) {
            let boundary = this.normalizedIndex(this.endIndex - this.currentIndex);
            offset = Math.min(boundary, offset);
            return this.buffer[this.normalizedIndex(this.currentIndex + offset)];
        }
        else if (offset < 0) {
            offset *= -1;
            let boundary = this.normalizedIndex(this.currentIndex - this.startIndex);
            offset = Math.min(boundary, offset);
            return this.buffer[this.normalizedIndex(this.currentIndex - offset)];
        }
        else {
            return this.buffer[this.currentIndex];
        }
    }

    getRecordID(offset = 0) {
        return this.getRecord(offset).id;
    }

    getRecordData(offset = 0) {
        return this.getRecord(offset).data;
    }

    getRecordOffset() {
        return this.currentIndex - this.endIndex;
    }

    undo() {
        if (this.currentIndex !== this.startIndex)
            this.currentIndex = this.normalizedIndex(this.currentIndex - 1);
        return {
            data: this.buffer[this.currentIndex].data,
            index: this.normalizedIndex(this.currentIndex - this.startIndex)
        };
    }

    redo() {
        if (this.currentIndex !== this.startIndex) {
            this.currentIndex = this.normalizedIndex(this.currentIndex + 1);
        }
        return {
            data: this.buffer[this.currentIndex].data,
            index: this.normalizedIndex(this.currentIndex - this.startIndex)
        };
    }

    jumpToRecord(id) {
        const index = this.buffer.findIndex(r => r.id === id);
        if (index >= 0)
            this.currentIndex = index;
        return index >= 0;
    }

    reset(initialData) {
        this.buffer = new Array(this.capacity);
        this.currentIndex = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.recordIDCounter = 0;
        this.buffer[this.startIndex] = {
            id: 0,
            data: initialData,
            timestamp: Date.now()
        };
    }

    *[Symbol.iterator]() {
        let index = this.startIndex;
        while (index !== this.endIndex) {
            yield this.buffer[index];
            index = this.normalizedIndex(index + 1);
        }
        yield this.buffer[index];
    }

    get count() {
        return this.normalizedIndex(this.endIndex - this.startIndex) + 1;
    }

    get capacity() {
        return this.buffer.length;
    }

    get atEnd() {
        return this.currentIndex === this.endIndex;
    }

    get atStart() {
        return this.currentIndex === this.startIndex;
    }
}
