import { validateColorArray, validateNumber } from "#utils/validation.ts";

describe("validateNumber", () => {
  describe("Happy Paths", () => {
    test.each`
      value   | options                              | description
      ${2}    | ${{}}                                | ${"no constraints"}
      ${2.4}  | ${{}}                                | ${"decimal without constraints"}
      ${5}    | ${{ integerOnly: true }}             | ${"integer with integerOnly"}
      ${2}    | ${{ start: 1 }}                      | ${"minimum bound only"}
      ${3}    | ${{ end: 4.1 }}                      | ${"maximum bound only"}
      ${-3.3} | ${{ start: -5, end: 4.1 }}           | ${"both bounds with decimal"}
      ${0}    | ${{ start: 0, end: 0, integerOnly: true }} | ${"exact match with bounds"}
    `("accepts valid number: $description", ({ value, options }) => {
      expect(() => validateNumber(value, "testVar", options)).not.toThrow();
    });
  });

  describe("Type Validation", () => {
    test("rejects non-number input", () => {
      expect(() => validateNumber("2", "testVar")).toThrow(
        "testVar must be defined finite number"
      );
    });

    test("rejects infinite numbers", () => {
      expect(() => validateNumber(Infinity, "testVar")).toThrow(
        "testVar must be defined finite number"
      );
    });

    test.each`
      option         | badValue   | description
      ${"start"}     | ${"1"}     | ${"non-number start"}
      ${"end"}       | ${[]}      | ${"non-number end"}
      ${"integerOnly"} | ${5}     | ${"non-boolean integerOnly"}
    `("rejects invalid $option: $description", ({ option, badValue }) => {
      expect(() => validateNumber(2, "testVar", { [option]: badValue })).toThrow(
        "Variable name or options are of invalid type"
      );
    });

    test("rejects non-string variable name", () => {
      expect(() => validateNumber(2, 123)).toThrow(
        "Variable name or options are of invalid type"
      );
    });
  });

  describe("Integer Validation", () => {
    test("rejects decimals when integerOnly=true", () => {
      expect(() => validateNumber(23.4, "testVar", { integerOnly: true }))
        .toThrow("testVar must be integer");
    });
  });

  describe("Range Validation", () => {
    test("rejects when start > end", () => {
      expect(() => validateNumber(12, "testVar", { start: 5, end: 0 }))
        .toThrow("minimum can't be higher than maximum");
    });

    test.each`
      value | options               | expectedError
      ${-1} | ${{ start: 1.5 }}    | ${"Minimum of: 1.5"}
      ${50} | ${{ start: 55, end: 61 }} | ${"Minimum of: 55\nMaximum of: 61"}
      ${2.2}| ${{ end: 1 }}        | ${"Maximum of: 1"}
    `("rejects out-of-range values: $value with $options", ({ value, options, expectedError }) => {
      expect(() => validateNumber(value, "testVar", options))
        .toThrow(`testVar must have:\n${expectedError}`);
    });
  });
});

describe("validateColorArray", () => {
    let originalWarn;

    beforeAll(() => {
      originalWarn = console.warn;
      console.warn = jest.fn();
    });

    afterAll(() => {
      console.warn = originalWarn;
    });

  describe("Happy Paths", () => {
    test.each`
      color                     | description
      ${[255, 0, 0, 1]}        | ${"max RGB, max alpha"}
      ${[0, 0, 0, 0]}          | ${"min values"}
      ${[66.6, 55, 0.4, 0.5]}  | ${"decimal values"}
      ${[127, 127, 127, 0.5]}  | ${"mid-range values"}
    `("accepts valid color: $description", ({ color }) => {
      expect(() => validateColorArray(color)).not.toThrow();
    });
  });

  describe("Type Validation", () => {
    test.each`
      input           | description
      ${"variable"}   | ${"string"}
      ${true}         | ${"boolean"}
      ${2}            | ${"number"}
      ${[]}           | ${"empty array"}
      ${[2, 54, "a"]} | ${"array with non-number"}
      ${[2, {}, [], 54]} | ${"array with objects"}
    `("rejects non-color-array: $description", ({ input }) => {
      expect(() => validateColorArray(input))
        .toThrow("Color must be in array containing 4 finite numbers");
    });
  });

  describe("Range Validation", () => {
    test.each`
      color               | expectedError
      ${[256, 0, 0, 0.5]} | ${"Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive"}
      ${[0, -1, 0, 0.5]}  | ${"Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive"}
      ${[0, 0, 256, 0.5]} | ${"Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive"}
      ${[0, 0, 0, 1.1]}   | ${"Color alpha value (at index 3) must be between 0 and 1 inclusive"}
      ${[0, 0, 0, -0.1]}  | ${"Color alpha value (at index 3) must be between 0 and 1 inclusive"}
    `("rejects out-of-range values: $color", ({ color, expectedError }) => {
      expect(() => validateColorArray(color)).toThrow(expectedError);
    });
  });

  describe("Deprecation Warning", () => {
    test("shows deprecation warning", () => {
      validateColorArray([0, 0, 0, 0]);
      expect(console.warn).toHaveBeenCalledWith("Deprecated - use new Color() instead");
    });
  });
});
