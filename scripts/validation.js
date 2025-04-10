/**
 * Validates the color array.
 * @param {[number, number, number, number]} color - The color array [red, green, blue, alpha] to validate.
 * @returns {boolean} - Returns true if the color array is valid, otherwise false.
 * @throws {TypeError} Throws an error if the color is invalid.
 */
export function validateColorArray(color) {
    console.warn("Deprecated - use new Color() instead");
    if (!Array.isArray(color) || color.length !== 4) {
        throw new TypeError(
            "Color must be in array containing 4 finite numbers",
        );
    }
    color.forEach((value, index) => {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new TypeError(
                "Color must be in array containing 4 finite numbers",
            );
        }

        if (index < 3) {
            // For r, g, b
            if (value < 0 || value > 255) {
                throw new RangeError(
                    "Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive",
                );
            }
        } else {
            // For a
            if (value < 0 || value > 1) {
                throw new RangeError(
                    "Color alpha value (at index 3) must be between 0 and 1 inclusive",
                );
            }
        }
    });
}

/**
 * Validates the number to be valid number between start and end inclusive.
 * @param {number} number - The number to validate.
 * @param {String} varName - The variable name to show in the error message which will be thrown.
 * @param {Object} Contains some optional constraints: max/min limits, and if the number is integer only
 * @param {number | undefined} start - The minimum of valid range, set to null to omit the constraint.
 * @param {number | undefined} end - The maximum of valid range, set to null to omit the constraint.
 * @param {boolean} integerOnly - Specifies if the number must be an integer.
 * @throws {TypeError} Throws an error if the number type, name type or options types is invalid.
 * @throws {TypeError} Throws an error if start and end are set but start is higher than end.
 * @throws {RangeError} Throws an error if the number is not in the specified range.
 */
export function validateNumber(
    number,
    varName,
    { end = undefined, start = undefined, integerOnly = false } = {},
) {
    if (
        (start !== undefined && !Number.isFinite(start)) ||
        (end !== undefined && !Number.isFinite(end)) ||
        typeof integerOnly !== "boolean" ||
        typeof varName !== "string"
    )
        throw new TypeError("Variable name or options are of invalid type");

    if (typeof number !== "number" || !Number.isFinite(number))
        throw new TypeError(`${varName} must be defined finite number`);

    if (integerOnly && !Number.isInteger(number))
        throw new TypeError(`${varName} must be integer`);

    if (start !== undefined && end !== undefined && end < start)
        throw new TypeError(`minimum can't be higher than maximum`);

    if (
        (start !== undefined && number < start) ||
        (end !== undefined && end < number)
    )
        throw new RangeError(
            `${varName} must have:
${start !== undefined ? "Minimum of: " + start + "\n" : ""
            }${end !== undefined ? "Maximum of: " + end + "\n" : ""}`,
        );
}
