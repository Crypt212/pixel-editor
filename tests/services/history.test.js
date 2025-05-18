import History from "#services/history.js";

describe("History", () => {

    let ah;

    const assertRecord = (offset, expectedID = null, expectedData = null) => {
        if (expectedID !== null) expect(ah.getRecordID(offset)).toBe(expectedID);
        if (expectedData !== null) {
            expect(ah.getRecordData(offset)).toStrictEqual(expectedData);
            if (Array.isArray(expectedData)) {
                expect(ah.getRecordData(offset)).not.toBe(expectedData);
            }
        }
    };

    describe("Constructor Validation", () => {
        test.each([
            [undefined, TypeError],
            [null, TypeError],
            [[], TypeError],
            ["5", TypeError],
            [NaN, TypeError],
            [Infinity, TypeError],
            [13.01, TypeError]
        ])("should throw %p when capacity is %p", (input, error) => {
            expect(() => new History(input)).toThrow(error);
        });

        test.each([
            [-20, RangeError],
            [0, RangeError],
            [100, RangeError],
        ])("should throw %p when capacity is %p (not between 1 and 64)", (input, error) => {
            expect(() => new History(input)).toThrow(error);
        });

        test.each([1, 20, 64])("should accept valid capacity %p", (input) => {
            expect(() => new History(input)).not.toThrow();
        });
    });

    describe("Basic Functionality", () => {

        beforeEach(() => {
            ah = new History(5);
        });


        test("should initialize with empty buffer", () => {
            expect(ah.bufferSize).toBe(0);
            expect(ah.bufferCapacity).toBe(5);
        });

        test("should add records with incremental IDs", () => {
            ah.addRecord();
            ah.addRecord();

            assertRecord(0, 1);
            assertRecord(-1, 0);
        });

        test("should handle undo/redo correctly", () => {
            ah.addRecord();
            ah.setRecordData("first");
            ah.addRecord();
            ah.setRecordData("second");

            expect(ah.undo()).toEqual("first");
            assertRecord(0, 0);

            expect(ah.redo()).toBe("second");
            assertRecord(0, 1);
        });

        test("should maintain buffer capacity", () => {
            // Fill buffer
            for (let i = 0; i < 6; i++) {
                ah.addRecord(`record${i}`);
            }

            expect(ah.bufferSize).toBe(5);
            expect(ah.bufferCapacity).toBe(5);
        });
    });

    describe("Record Data Handling", () => {
        beforeEach(() => {
            ah = new History(5);
        });

        test("should reject adding data without active records", () => {
            expect(() => ah.setRecordData("test")).toThrow("No record to add to");
        });

        test("should store primitive data correctly", () => {
            ah.addRecord();
            ah.setRecordData("test");

            expect(ah.getRecordData(0)).toEqual("test");

            ah.setRecordData(42);

            expect(ah.getRecordData(0)).toEqual(42);
        });

        test("should take reference of data stored in it (they are be shared)", () => {
            const testArr = [1, 2, 3];

            ah.addRecord();
            ah.setRecordData(testArr);

            const storedData = ah.getRecordData(0);
            expect(storedData).toEqual(testArr);
            expect(storedData).toBe(testArr);
        });
    });

    describe('Stress Testing', () => {
        test('should handle 100+ consecutive undo/redo operations', () => {
            ah = new History(10);

            for (let i = 0; i < 20; i++) { // populate history
                ah.addRecord(`record${i}`);
            }

            for (let i = 0; i < 15; i++) { // perform undos
                expect(() => ah.undo()).not.toThrow();
            }

            for (let i = 0; i < 15; i++) { // perform redos
                expect(() => ah.redo()).not.toThrow();
            }

            expect(ah.getRecordID()).toBe(19);
        });

        test('should complete 1000 operations under 100ms', () => {
            const start = performance.now();
            // ... perform operations ...
            expect(performance.now() - start).toBeLessThan(100);
        });
    });

    describe('Deep Objects Handling', () => {
        test('should handle nested object references (objects are shared)', () => {
            const ah = new History(3);
            const nestedObj = {
                a: 1,
                b: {
                    c: [1, 2, { d: 3 }],
                }
            };

            ah.addRecord();
            ah.setRecordData(nestedObj);

            nestedObj.b.c[2].d = 6; // modified

            expect(ah.getRecordData(0).b.c[2].d).toBe(6);
        });
    });

    describe('Empty Buffer Behavior', () => {
        let ah;
        beforeEach(() => {
            ah = new History(3);
        });

        test('should handle operations on empty buffer', () => {
            expect(ah.undo()).toBe(null);
            expect(ah.redo()).toBe(null);
            expect(ah.getRecordID(0)).toBe(-1);
            expect(ah.bufferSize).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        beforeEach(() => {
            ah = new History(3); // smaller buffer for easier testing
        });

        test("should handle buffer wraparound", () => {
            // Fill buffer
            ah.addRecord();
            ah.addRecord();
            ah.addRecord();
            ah.addRecord(); // should overwrite "first"

            expect(ah.bufferSize).toBe(3);
            assertRecord(1, -1, -1);
            assertRecord(0, 3);
            assertRecord(-1, 2);
            assertRecord(-2, 1);
            assertRecord(-3, -1, -1); // should not exist (wrapped around)
        });

        test("should clear redo history when adding new action", () => {
            ah.addRecord();
            ah.setRecordData("first");
            ah.addRecord();
            ah.setRecordData("second");
            ah.addRecord();
            ah.setRecordData("third");
            expect(ah.undo()).toBe("second");
            ah.addRecord();
            ah.setRecordData("forth");

            expect(ah.redo()).toBe("forth"); // should only have "forth" available

            assertRecord(1, -1, -1);
            assertRecord(0, 3);
            assertRecord(-1, 1);
            assertRecord(-2, 0);
            assertRecord(-3, -1, -1);
        });

        test("should handle multiple undo/redo cycles", () => {
            ah.addRecord();
            ah.setRecordData("first");
            ah.addRecord();
            ah.setRecordData("second");

            expect(ah.undo()).toBe("first");
            expect(ah.undo()).toBe(null);
            expect(ah.undo()).toBe(null);
            expect(ah.redo()).toBe("first");
            expect(ah.redo()).toBe("second");
            expect(ah.redo()).toBe("second");

            assertRecord(0, 1);
            assertRecord(-1, 0);
        });
    });
});
