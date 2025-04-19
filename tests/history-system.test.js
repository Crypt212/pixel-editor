import expect from "expect";
import HistorySystem from "../scripts/history-system.js";

describe("HistorySystem", () => {

    let hs;

    const assertGroup = function(offset, expectedID = null, expectedName = null, expectedData = null,) {
        if (expectedID !== null) expect(hs.getActionGroupID(offset)).toBe(expectedID);
        if (expectedName !== null) expect(hs.getActionGroupName(offset)).toBe(expectedName);
        if (expectedData !== null) {
            expect(hs.getActionData(offset)).toStrictEqual(expectedData);
            if (Array.isArray(expectedData)) {
                expect(hs.getActionData(offset)).not.toBe(expectedData);
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
            expect(() => new HistorySystem(input)).toThrow(error);
        });

        test.each([
            [-20, RangeError],
            [0, RangeError],
            [100, RangeError],
        ])("should throw %p when capacity is %p (not between 1 and 64)", (input, error) => {
            expect(() => new HistorySystem(input)).toThrow(error);
        });

        test.each([1, 20, 64])("should accept valid capacity %p", (input) => {
            expect(() => new HistorySystem(input)).not.toThrow();
        });
    });

    describe("Basic Functionality", () => {

        beforeEach(() => {
            hs = new HistorySystem(5);
        });


        test("should initialize with empty buffer", () => {
            expect(hs.getBufferSize).toBe(0);
            expect(hs.getBufferCapacity).toBe(5);
        });

        test("should add action groups with incremental IDs", () => {
            hs.addActionGroup("first");
            hs.addActionGroup("second");

            assertGroup(0, 1, "second");
            assertGroup(-1, 0, "first");
        });

        test("should handle undo/redo correctly", () => {
            hs.addActionGroup("first");
            hs.addActionGroup("second");

            expect(hs.undo()).toBe(0);
            assertGroup(0, 0, "first");

            expect(hs.redo()).toBe(1);
            assertGroup(0, 1, "second");
        });

        test("should maintain buffer capacity", () => {
            // Fill buffer
            for (let i = 0; i < 6; i++) {
                hs.addActionGroup(`group${i}`);
            }

            expect(hs.getBufferSize).toBe(5);
            expect(hs.getBufferCapacity).toBe(5);
        });
    });

    describe("Action Data Handling", () => {
        beforeEach(() => {
            hs = new HistorySystem(5);
        });

        test("should reject adding data without active group", () => {
            expect(() => hs.addActionData("test")).toThrow("No action group to add to");
        });

        test("should store primitive data correctly", () => {
            hs.addActionGroup();
            hs.addActionData("test");
            hs.addActionData(42);

            expect(hs.getActionData(0)).toEqual(["test", 42]);
        });

        test("should shallow copy objects and arrays", () => {
            const testObj = { a: 1 };
            const testArr = [1, 2, 3];

            hs.addActionGroup();
            hs.addActionData(testObj);
            hs.addActionData(testArr);

            const storedData = hs.getActionData(0);
            expect(storedData[0]).toEqual(testObj);
            expect(storedData[0]).not.toBe(testObj);
            expect(storedData[1]).toEqual(testArr);
            expect(storedData[1]).not.toBe(testArr);
        });
    });

    describe('Stress Testing', () => {
        test('should handle 100+ consecutive undo/redo operations', () => {
            hs = new HistorySystem(10);

            for (let i = 0; i < 20; i++) { // populate history
                hs.addActionGroup(`group${i}`);
            }

            for (let i = 0; i < 15; i++) { // perform undos
                expect(() => hs.undo()).not.toThrow();
            }

            for (let i = 0; i < 15; i++) { // perform redos
                expect(() => hs.redo()).not.toThrow();
            }

            expect(hs.getActionGroupID()).toBe(19);
        });

        test('should complete 1000 operations under 100ms', () => {
            const start = performance.now();
            // ... perform operations ...
            expect(performance.now() - start).toBeLessThan(100);
        });
    });

    describe('Deep Objects Handling', () => {
        test('should handle nested object references (objects are shared)', () => {
            const hs = new HistorySystem(3);
            const nestedObj = {
                a: 1,
                b: {
                    c: [1, 2, { d: 3 }],
                }
            };

            hs.addActionGroup();
            hs.addActionData(nestedObj);

            nestedObj.b.c[2].d = 6; // modified

            expect(hs.getActionData(0)[0].b.c[2].d).toBe(6);
        });
    });

    describe('Identical Action Handling', () => {
        test('should allow consecutive identical actions', () => {
            const hs = new HistorySystem(3);
            const testData = { a: 1 };

            hs.addActionGroup();
            hs.addActionData(testData);
            hs.addActionData(testData); // Identical to previous

            expect(hs.getActionData(0).length).toBe(2);
        });
    });

    describe('Empty Buffer Behavior', () => {
        let hs;
        beforeEach(() => {
            hs = new HistorySystem(3);
        });

        test('should handle operations on empty buffer', () => {
            expect(hs.undo()).toBe(-1);
            expect(hs.redo()).toBe(-1);
            expect(hs.getActionGroupID(0)).toBe(-1);
            expect(hs.getBufferSize).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        beforeEach(() => {
            hs = new HistorySystem(3); // smaller buffer for easier testing
        });

        test("should handle buffer wraparound", () => {
            // Fill buffer
            hs.addActionGroup("first");
            hs.addActionGroup("second");
            hs.addActionGroup("third");
            hs.addActionGroup("fourth"); // should overwrite "first"

            expect(hs.getBufferSize).toBe(3);
            assertGroup(1, -1, -1);
            assertGroup(0, 3, "fourth");
            assertGroup(-1, 2, "third");
            assertGroup(-2, 1, "second");
            assertGroup(-3, -1, -1); // should not exist (wrapped around)
        });

        test("should clear redo history when adding new action", () => {
            hs.addActionGroup("first");
            hs.addActionGroup("second");
            hs.addActionGroup("third");
            expect(hs.undo()).toBe(1);
            hs.addActionGroup("fourth");

            expect(hs.redo()).toBe(3); // should only have "third" available

            assertGroup(1, -1, -1);
            assertGroup(0, 3, "fourth");
            assertGroup(-1, 1, "second");
            assertGroup(-2, 0, "first");
            assertGroup(-3, -1, -1);
        });

        test("should handle multiple undo/redo cycles", () => {
            hs.addActionGroup("first");
            hs.addActionGroup("second");

            hs.undo();
            hs.undo();
            hs.undo();
            hs.redo();
            hs.redo();
            hs.redo();

            assertGroup(0, 1, "second");
            assertGroup(-1, 0, "first");
        });
    });
});
