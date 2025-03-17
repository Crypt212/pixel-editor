import HistorySystem from "../scripts/history-system.js";

describe("HistorySystem", () => {
    let hs;
    describe("Construction", () => {
        test("should throw an error when capacity is not defined finite integer", () => {
            expect(() => new HistorySystem()).toThrow(
                "Capacity must be defined",
            );

            expect(() => new HistorySystem([])).toThrow(
                "Capacity must be defined finite number"
            );
            expect(() => new HistorySystem(false)).toThrow(
                "Capacity must be defined finite number"
            );

            expect(() => new HistorySystem(Infinity)).toThrow(
                "Capacity must be defined finite number"
            );
            expect(() => new HistorySystem(NaN)).toThrow(
                "Capacity must be defined finite number"
            );

            expect(() => new HistorySystem(0.8)).toThrow(
                "Capacity must be integer"
            );
            expect(() => new HistorySystem(13.001)).toThrow(
                "Capacity must be integer"
            );
        });

        test("should throw an error when capacity is not between 1 and 64", () => {
            expect(() => new HistorySystem(-20)).toThrow(
`Capacity must have:
Minimum of: 1
Maximum of: 64
`
            );
            expect(() => new HistorySystem(0)).toThrow(
`Capacity must have:
Minimum of: 1
Maximum of: 64
`
            );
            expect(() => new HistorySystem(100)).toThrow(
`Capacity must have:
Minimum of: 1
Maximum of: 64
`
            );
        });

        test("should return capacity of buffer when calling getBufferCapacity", () => {
            hs = new HistorySystem(1);
            expect(hs.getBufferCapacity).toBe(1);

            hs = new HistorySystem(20);
            expect(hs.getBufferCapacity).toBe(20);

            hs = new HistorySystem(64);
            expect(hs.getBufferCapacity).toBe(64);
        });
    });

    describe("Functionality", () => {
        let hs;
        let assertGroup;
        beforeEach(() => {
            assertGroup = function(
                offset,
                expectedID = null,
                expectedName = null,
                expectedData = null,
            ) {
                if (expectedID !== null)
                    expect(hs.getActionGroupID(offset)).toBe(expectedID);
                if (expectedName !== null)
                    expect(hs.getActionGroupName(offset)).toBe(expectedName);
                if (expectedData !== null) {
                    expect(hs.getActionData(offset)).toStrictEqual(expectedData);
                    expect(hs.getActionData(offset)).not.toBe(expectedData);
                }
            };
            hs = new HistorySystem(5);
        });

        describe("Adding action group - Undoing/Redoing", () => {
            test("should throw an error if given action group name is not a string", () => {
                expect(() => hs.addActionGroup(0)).toThrow(
                    "Action group name must be string",
                );
            });

            test("should add action group with given name or no name given if none given", () => {
                expect(() => hs.addActionGroup("")).not.toThrow();
                expect(() => hs.addActionGroup("ahmed")).not.toThrow();
                expect(() => hs.addActionGroup()).not.toThrow();
                assertGroup(0, 2, "");
                assertGroup(-1, 1, "ahmed");
                assertGroup(-2, 0, "");
            });

            test("should undo and redo and return action group ID, -1 if at start", () => {
                assertGroup(0, -1, -1);

                hs.addActionGroup("AG1");

                assertGroup(0, 0, "AG1");

                hs.addActionGroup("AG2");

                assertGroup(0, 1, "AG2");

                hs.addActionGroup("AG3");

                assertGroup(0, 2, "AG3");

                expect(hs.undo()).toBe(1);

                assertGroup(0, 1, "AG2");

                expect(hs.undo()).toBe(0);

                assertGroup(0, 0, "AG1");

                expect(hs.undo()).toBe(-1);

                assertGroup(0, -1, -1);

                expect(hs.undo()).toBe(-1);

                assertGroup(0, -1, -1);

                expect(hs.redo()).toBe(0);

                assertGroup(0, 0, "AG1");

                expect(hs.redo()).toBe(1);

                assertGroup(0, 1, "AG2");

                expect(hs.redo()).toBe(2);

                assertGroup(0, 2, "AG3");

                expect(hs.redo()).toBe(2);

                assertGroup(0, 2, "AG3");
            });

            test("should truncate the undid part if added new action group before it", () => {
                expect(() => hs.addActionGroup("wash")).not.toThrow();
                expect(() => hs.addActionGroup("do whatever")).not.toThrow();
                expect(() => hs.addActionGroup("sleep")).not.toThrow();
                expect(() => hs.addActionGroup("play")).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                assertGroup(1, 2, "sleep");
                assertGroup(2, 3, "play");
                expect(() => hs.addActionGroup("study")).not.toThrow();
                assertGroup(1, -1, -1);
                assertGroup(2, -1, -1);
            });

            test("should override old groups if added new groups while buffer is full", () => {
                expect(hs.getBufferSize).toBe(0);
                expect(() => hs.addActionGroup("wash")).not.toThrow();
                expect(() => hs.addActionGroup("do whatever")).not.toThrow();
                expect(() => hs.addActionGroup("sleep")).not.toThrow();
                expect(() => hs.addActionGroup("play")).not.toThrow();
                expect(() => hs.addActionGroup("study")).not.toThrow();
                expect(() => hs.addActionGroup("run")).not.toThrow();
                expect(() => hs.addActionGroup("eat")).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(0, 6, "eat");
                assertGroup(-1, 5, "run");
                assertGroup(-2, 4, "study");
                assertGroup(-3, 3, "play");
                assertGroup(-4, 2, "sleep");
                assertGroup(-5, -1, -1);
                assertGroup(1, -1, -1);
            });

            test("should work on correctly edge-cases and query currectly", () => {
                expect(hs.getBufferSize).toBe(0);
                expect(() => hs.addActionGroup("wash")).not.toThrow();
                expect(hs.getBufferSize).toBe(1);
                expect(() => hs.addActionGroup("do whatever")).not.toThrow();
                expect(() => hs.addActionGroup("sleep")).not.toThrow();
                expect(() => hs.addActionGroup("play")).not.toThrow();
                expect(hs.getBufferSize).toBe(4);

                assertGroup(-1, 2, "sleep");
                assertGroup(-2, 1, "do whatever");
                assertGroup(-3, 0, "wash");
                assertGroup(-4, -1, -1);

                expect(() => hs.addActionGroup("study")).not.toThrow();
                expect(() => hs.addActionGroup("run")).not.toThrow();
                expect(() => hs.addActionGroup("eat")).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(0, 6, "eat");
                assertGroup(-1, 5, "run");
                assertGroup(-2, 4, "study");
                assertGroup(-3, 3, "play");
                assertGroup(-4, 2, "sleep");
                assertGroup(-5, -1, -1);
                assertGroup(1, -1, -1);

                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(0, 3, "play");

                expect(() => hs.addActionGroup("action1")).not.toThrow();
                expect(() => hs.addActionGroup("action2")).not.toThrow();
                expect(() => hs.addActionGroup("action3")).not.toThrow();
                expect(() => hs.addActionGroup("action4")).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(-6, -1, -1);
                assertGroup(-5, -1, -1);
                assertGroup(-4, 3, "play");
                assertGroup(-3, 7, "action1");
                assertGroup(-2, 8, "action2");
                assertGroup(-1, 9, "action3");
                assertGroup(0, 10, "action4");
                assertGroup(1, -1, -1);
                assertGroup(2, -1, -1);

                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(-1, -1, -1);
                assertGroup(0, -1, -1);
                assertGroup(1, 3, "play");
                assertGroup(2, 7, "action1");
                assertGroup(3, 8, "action2");
                assertGroup(4, 9, "action3");
                assertGroup(5, 10, "action4");
                assertGroup(6, -1, -1);
                assertGroup(7, -1, -1);

                expect(() => hs.redo()).not.toThrow();
                expect(hs.getBufferSize).toBe(5);

                assertGroup(-2, -1, -1);
                assertGroup(-1, -1, -1);
                assertGroup(0, 3, "play");
                assertGroup(1, 7, "action1");
                assertGroup(2, 8, "action2");
                assertGroup(3, 9, "action3");
                assertGroup(4, 10, "action4");
                assertGroup(5, -1, -1);
                assertGroup(6, -1, -1);

                expect(hs.getBufferSize).toBe(5);
            });
            test("should undo and redo currectly and return id of action group that was redid/undid to, -1 if undid to the start", () => { });
        });
        describe("Adding action data to action groups", () => {
            test("should throw an error if added action data without specifying action group, else adds to the specified group", () => {
                expect(() => hs.addActionData("4")).toThrow(
                    "No action group to add to",
                );
                expect(() => hs.addActionGroup()).not.toThrow();
                expect(() => hs.addActionGroup()).not.toThrow();
                expect(() => hs.addActionData("4")).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.addActionData("4")).not.toThrow();
                expect(() => hs.undo()).not.toThrow();
                expect(() => hs.addActionData("4")).toThrow(
                    "No action group to add to",
                );
            });
            test("should do shallow copy if data is object or array or primitive data", () => {
                let arrExample = [4, [3, 5, 2], 5];
                expect(() => hs.addActionGroup()).not.toThrow();
                expect(() => hs.addActionData("4")).not.toThrow();
                expect(() => hs.addActionData(4)).not.toThrow();
                expect(() => hs.addActionData([4, 3, 5])).not.toThrow();
                expect(() => hs.addActionData(arrExample)).not.toThrow();
                expect(() =>
                    hs.addActionData({ a: 4, b: [3, 5, 2], c: 5 }),
                ).not.toThrow();
                assertGroup(0, 0, "", [
                    "4",
                    4,
                    [4, 3, 5],
                    [4, [3, 5, 2], 5],
                    { a: 4, b: [3, 5, 2], c: 5 },
                ]);
                arrExample[1][1] = [1, 2];
                assertGroup(0, 0, "", [
                    "4",
                    4,
                    [4, 3, 5],
                    [4, [3, [1, 2], 2], 5],
                    { a: 4, b: [3, 5, 2], c: 5 },
                ]);
            });
            test("should throw an error if given action group name is not a string", () => {
                expect(() => hs.addActionGroup(0)).toThrow(
                    "Action group name must be string",
                );
            });
            test("should add action group with given name or no name given if none given", () => {
                expect(() => hs.addActionGroup("")).not.toThrow();
                expect(() => hs.addActionGroup("ahmed")).not.toThrow();
                expect(() => hs.addActionGroup()).not.toThrow();
                assertGroup(0, 2, "");
                assertGroup(-1, 1, "ahmed");
                assertGroup(-2, 0, "");
            });
        });

        describe("Getting size and capacity", () => {
            test("should throw an exception if offset is not a finite integer", () => {
                let toTest = (offset, expectedThrow) => {
                    if (expectedThrow === undefined) {
                        expect(() => hs.getActionGroupID(offset)).not.toThrow();
                        expect(() =>
                            hs.getActionGroupName(offset),
                        ).not.toThrow();
                        expect(() => hs.getActionData(offset)).not.toThrow();
                    } else {
                        expect(() => hs.getActionGroupID(offset)).toThrow(
                            expectedThrow,
                        );
                        expect(() => hs.getActionGroupName(offset)).toThrow(
                            expectedThrow,
                        );
                        expect(() => hs.getActionData(offset)).toThrow(
                            expectedThrow,
                        );
                    }
                };
                toTest(0);
                toTest(-10);
                toTest(100);
                toTest("a", "Offset must be defined finite number");
                toTest("aah", "Offset must be defined finite number");
                toTest(["aah"], "Offset must be defined finite number");
                toTest([3], "Offset must be defined finite number");
                toTest(
                    { a: 3, b: 4 },
                    "Offset must be defined finite number",
                );
            });
        });
    });
});
