import { validateColorArray, validateNumber } from "../scripts/validation.js";

describe("validateNumber", () => {
    test([
        [2, "variable", undefined, undefined, undefined],
        [2.4, "variable", undefined, undefined, undefined],
        [2.4, "variable", undefined, undefined, false],
        [5, "variable", undefined, undefined, true],
        [2, "variable", 1, undefined, true],
        [3, "variable", undefined, 4.1, undefined],
        [-3.3, "variable", -5, 4.1, undefined],
    ])(
        "Should pass if the condition is true",
        (value, name, start, end, integerOnly) => {
            expect(() =>
                validateNumber(value, name, {
                    start: start,
                    end: end,
                    integerOnly: integerOnly,
                }),
            ).not.toThrow();
        },
    );
    test("Should throw a type error if function parameters are of invalid type", () => {
        expect(() => validateNumber(2, "variable", { end: {} })).toThrow(
            "Variable name or options are of invalid type",
        );
        expect(() => validateNumber(2, "variable", { start: [] })).toThrow(
            "Variable name or options are of invalid type",
        );
        expect(() => validateNumber(2, "variable", { integerOnly: 5 })).toThrow(
            "Variable name or options are of invalid type",
        );
        expect(() => validateNumber(2, 1)).toThrow(
            "Variable name or options are of invalid type",
        );
        expect(() => validateNumber("2", "varName")).toThrow(
            "varName must be defined finite number",
        );
        expect(() => validateNumber("a", "varName")).toThrow(
            "varName must be defined finite number",
        );
    });

    test("Should throw a range error if start and end are specified but start is higher than end", () => {
        expect(() =>
            validateNumber(12, "varName", { start: 5, end: 0 }),
        ).toThrow(`minimum can't be higher than maximum`);
    });

    test("Should throw a type error if integerOnly option is true and given number is not an integer", () => {
        expect(() =>
            validateNumber(23.4, "variable", { integerOnly: true }),
        ).toThrow("variable must be integer");
    });

    test("Should throw a range error when number is not in specified range", () => {
        expect(() => validateNumber(-1, "variable", { start: 1.5 })).toThrow(
            `variable must have:
Minimum of: 1.5
`,
        );
        expect(() =>
            validateNumber(50, "variable", { start: 55, end: 61 }),
        ).toThrow(
            `variable must have:
Minimum of: 55
Maximum of: 61
`,
        );
        expect(() => validateNumber(2.2, "variable", { end: 1 })).toThrow(
            `variable must have:
Maximum of: 1
`,
        );
    });
});

describe("validateColorArray", () => {
    test("Should pass if color is a valid [r, g, b, a] array", () => {
        expect(() => validateColorArray([255, 0, 0, 1])).not.toThrow();
        expect(() => validateColorArray([66, 55, 0, 0])).not.toThrow();
        expect(() => validateColorArray([66.6, 55, 0.4, 0.5])).not.toThrow();
    });

    test("Should throw a type error if color is not an array of size 4", () => {
        expect(() => validateColorArray("variable")).toThrow(
            "Color must be in array",
        );
        expect(() => validateColorArray(true)).toThrow(
            "Color must be in array",
        );
        expect(() => validateColorArray(2)).toThrow("Color must be in array");
        expect(() => validateColorArray([])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray([2, 54, "a"])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray([2, {}, [], 54, "a"])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
    });

    test("Should throw a type error if the entries of the color array are not numbers", () => {
        expect(() => validateColorArray([2, {}, [], 54])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray(["a", 2, 8, 1])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray([2, "a", 8, 1])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray([2, 8, "a", 1])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
        expect(() => validateColorArray([2, 8, 1, "a"])).toThrow(
            "Color must be in array containing 4 finite numbers",
        );
    });

    test("Should throw a range error if first three entries are not between 0 and 255, the the fourth is between 0 and 1", () => {
        expect(() => validateColorArray([2, 8, 1, 4])).toThrow(
            "Color alpha value (at index 3) must be between 0 and 1 inclusive",
        );
        expect(() => validateColorArray([2, 8, 1, -4])).toThrow(
            "Color alpha value (at index 3) must be between 0 and 1 inclusive",
        );
        expect(() => validateColorArray([-2, 8, 1, 0.4])).toThrow(
            "Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive",
        );
        expect(() => validateColorArray([2, 428, 1, 0.4])).toThrow(
            "Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive",
        );
        expect(() => validateColorArray([2, 1, 428, 0.4])).toThrow(
            "Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive",
        );
    });
});
