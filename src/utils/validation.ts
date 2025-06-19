interface ValidationOptions {
    start?: number,
    end?: number,
    integerOnly?: boolean
}

/**
 * Validates the number to be valid number between start and end inclusive.
 * @param number - The number to validate.
 * @param varName - The variable name to show in the error message which will be thrown.
 * @param options - Contains some optional constraints: max/min limits, and if the number is integer only
 * @throws {TypeError} Throws an error if boundaries are not finite.
 * @throws {TypeError} Throws an error if start and end are set but start is higher than end.
 * @throws {RangeError} Throws an error if the number is not in the specified range.
 */
export function validateNumber(
    number: number,
    varName: string,
    options: ValidationOptions = {
        start: undefined,
        end: undefined,
        integerOnly: false
    }
) {
    const { start, end, integerOnly = false } = options;

    if (
        (start !== undefined && !Number.isFinite(start)) ||
        (end !== undefined && !Number.isFinite(end)))
        throw new TypeError("Variable boundaries are of invalid type");

    if (!Number.isFinite(number))
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
