import ActionHistory from "../scripts/action-history.js";

describe("ActionHistory", () => {

    let ah;

    const assertGroup = function(offset, expectedID = null, expectedName = null, expectedData = null,) {
        if (expectedID !== null) expect(ah.getActionGroupID(offset)).toBe(expectedID);
        if (expectedName !== null) expect(ah.getActionGroupName(offset)).toBe(expectedName);
        if (expectedData !== null) {
            expect(ah.getActionData(offset)).toStrictEqual(expectedData);
            if (Array.isArray(expectedData)) {
                expect(ah.getActionData(offset)).not.toBe(expectedData);
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
            expect(() => new ActionHistory(input)).toThrow(error);
        });

        test.each([
            [-20, RangeError],
            [0, RangeError],
            [100, RangeError],
        ])("should throw %p when capacity is %p (not between 1 and 64)", (input, error) => {
            expect(() => new ActionHistory(input)).toThrow(error);
        });

        test.each([1, 20, 64])("should accept valid capacity %p", (input) => {
            expect(() => new ActionHistory(input)).not.toThrow();
        });
    });

    describe("Basic Functionality", () => {

        beforeEach(() => {
            ah = new ActionHistory(5);
        });


        test("should initialize with empty buffer", () => {
            expect(ah.getBufferSize).toBe(0);
            expect(ah.getBufferCapacity).toBe(5);
        });

        test("should add action groups with incremental IDs", () => {
            ah.addActionGroup("first");
            ah.addActionGroup("second");

            assertGroup(0, 1, "second");
            assertGroup(-1, 0, "first");
        });

        test("should handle undo/redo correctly", () => {
            ah.addActionGroup("first");
            ah.addActionGroup("second");

            expect(ah.undo()).toBe(0);
            assertGroup(0, 0, "first");

            expect(ah.redo()).toBe(1);
            assertGroup(0, 1, "second");
        });

        test("should maintain buffer capacity", () => {
            // Fill buffer
            for (let i = 0; i < 6; i++) {
                ah.addActionGroup(`group${i}`);
            }

            expect(ah.getBufferSize).toBe(5);
            expect(ah.getBufferCapacity).toBe(5);
        });
    });

    describe("Action Data Handling", () => {
        beforeEach(() => {
            ah = new ActionHistory(5);
        });

        test("should reject adding data without active group", () => {
            expect(() => ah.addActionData("test")).toThrow("No action group to add to");
        });

        test("should store primitive data correctly", () => {
            ah.addActionGroup();
            ah.addActionData("test");
            ah.addActionData(42);

            expect(ah.getActionData(0)).toEqual(["test", 42]);
        });

        test("should take reference of data stored in it (they are be shared)", () => {
            const testObj = { a: 1 };
            const testArr = [1, 2, 3];

            ah.addActionGroup();
            ah.addActionData(testObj);
            ah.addActionData(testArr);

            const storedData = ah.getActionData(0);
            expect(storedData[0]).toEqual(testObj);
            expect(storedData[0]).toBe(testObj);
            expect(storedData[1]).toEqual(testArr);
            expect(storedData[1]).toBe(testArr);
        });
    });

    describe('Stress Testing', () => {
        test('should handle 100+ consecutive undo/redo operations', () => {
            ah = new ActionHistory(10);

            for (let i = 0; i < 20; i++) { // populate history
                ah.addActionGroup(`group${i}`);
            }

            for (let i = 0; i < 15; i++) { // perform undos
                expect(() => ah.undo()).not.toThrow();
            }

            for (let i = 0; i < 15; i++) { // perform redos
                expect(() => ah.redo()).not.toThrow();
            }

            expect(ah.getActionGroupID()).toBe(19);
        });

        test('should complete 1000 operations under 100ms', () => {
            const start = performance.now();
            // ... perform operations ...
            expect(performance.now() - start).toBeLessThan(100);
        });
    });

    describe('Deep Objects Handling', () => {
        test('should handle nested object references (objects are shared)', () => {
            const ah = new ActionHistory(3);
            const nestedObj = {
                a: 1,
                b: {
                    c: [1, 2, { d: 3 }],
                }
            };

            ah.addActionGroup();
            ah.addActionData(nestedObj);

            nestedObj.b.c[2].d = 6; // modified

            expect(ah.getActionData(0)[0].b.c[2].d).toBe(6);
        });
    });

    describe('Identical Action Handling', () => {
        test('should allow consecutive identical actions', () => {
            const ah = new ActionHistory(3);
            const testData = { a: 1 };

            ah.addActionGroup();
            ah.addActionData(testData);
            ah.addActionData(testData); // Identical to previous

            expect(ah.getActionData(0).length).toBe(2);
        });
    });

    describe('Empty Buffer Behavior', () => {
        let ah;
        beforeEach(() => {
            ah = new ActionHistory(3);
        });

        test('should handle operations on empty buffer', () => {
            expect(ah.undo()).toBe(-1);
            expect(ah.redo()).toBe(-1);
            expect(ah.getActionGroupID(0)).toBe(-1);
            expect(ah.getBufferSize).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        beforeEach(() => {
            ah = new ActionHistory(3); // smaller buffer for easier testing
        });

        test("should handle buffer wraparound", () => {
            // Fill buffer
            ah.addActionGroup("first");
            ah.addActionGroup("second");
            ah.addActionGroup("third");
            ah.addActionGroup("fourth"); // should overwrite "first"

            expect(ah.getBufferSize).toBe(3);
            assertGroup(1, -1, -1);
            assertGroup(0, 3, "fourth");
            assertGroup(-1, 2, "third");
            assertGroup(-2, 1, "second");
            assertGroup(-3, -1, -1); // should not exist (wrapped around)
        });

        test("should clear redo history when adding new action", () => {
            ah.addActionGroup("first");
            ah.addActionGroup("second");
            ah.addActionGroup("third");
            expect(ah.undo()).toBe(1);
            ah.addActionGroup("fourth");

            expect(ah.redo()).toBe(3); // should only have "third" available

            assertGroup(1, -1, -1);
            assertGroup(0, 3, "fourth");
            assertGroup(-1, 1, "second");
            assertGroup(-2, 0, "first");
            assertGroup(-3, -1, -1);
        });

        test("should handle multiple undo/redo cycles", () => {
            ah.addActionGroup("first");
            ah.addActionGroup("second");

            ah.undo();
            ah.undo();
            ah.undo();
            ah.redo();
            ah.redo();
            ah.redo();

            assertGroup(0, 1, "second");
            assertGroup(-1, 0, "first");
        });
    });
});
