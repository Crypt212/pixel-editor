import { validateNumber } from "./validation.js";

/**
 * A comprehensive color class supporting Hex, RGB(A), and HSL(A) formats
 * with conversion, mixing, and comparison capabilities.
 * @class
 */
class Color {

    /**
     * RGB color array (0-255 values).
     * @type {Array<number>}
     * @property {number} 0 - Red (0-255)
     * @property {number} 1 - Green (0-255)
     * @property {number} 2 - Blue (0-255)
     */
    #rgb = [0, 0, 0];

    /**
     * Hexadecimal color string in `#RRGGBB` or `#RRGGBBAA` format.
     * @type {string}
     * @example '#ff0000' // Red
     * @example '#00ff0080' // Green with 50% alpha
     */
    #hex = '#000000';

    /**
     * Alpha transparency value (0.0 = fully transparent, 1.0 = fully opaque).
     * @type {number}
     * @min 0.0
     * @max 1.0
     */
    #alpha = 1;

    /**
     * Dirty flag indicating whether the color was modified since last render.
     * @type {boolean}
     * @readonly
     */
    #updated = false;

    /**
     * Creates a Color instance from various formats
     * @constructor
     * @param {string|Array<number>|Color} color - Input color (Hex, RGB/A, HSL/A, or Color instance)
     * @param {string} [mode=null] - Interpretation mode for the color parameter ("rgb", "hsl", "hex" or "copy"), if null, it's auto-detected, if possible (if given color is an array, its ambiguous, "rgb" or "hsl"?)
     * @throws {TypeError} If mode is not a valid mode string  ("rgb", "hsl", "hex" or "copy")
     * @throws {TypeError} If color is not of valid format (Hex, RGB/A, HSL/A, or Color instance)
     * @example
     * new Color("#FF0000", "hex") // Hex
     * new Color([255, 0, 0], "rgb") // RGB
     * new Color([360, 100, 50], "hsl") // HSL
     * new Color(new Color([255, 0, 0]), "copy") // Copy other color
     */
    constructor(color = Color.RED, mode = null) {
        // Auto-detect mode if not specified
        if (mode === null) {
            mode = this.#detectInputType(color);
        }

        switch (mode) {
            case "rgb":
                if (!Array.isArray(color)) throw new TypeError('RGB color must be an array');
                const rgb = [...color];
                this.alpha = rgb.length > 3 ? rgb[3] : 1;
                this.rgb = rgb.slice(0, 3);
                break;

            case "hsl":
                if (!Array.isArray(color)) throw new TypeError('HSL color must be an array');
                const hsl = [...color];
                this.alpha = hsl.length > 3 ? hsl[3] : 1;
                this.hsl = hsl.slice(0, 3);
                break;

            case "hex":
                if (typeof color !== 'string') throw new TypeError('Hex color must be a string');
                this.hex = color;
                break;

            case "copy":
            case "cpy":
                if (!(color instanceof Color)) throw new TypeError('Copy source must be a Color instance');
                this.#copyFrom(color);
                break;

            default:
                throw new TypeError(`Invalid mode: ${mode}. Valid modes are "rgb", "hsl", "hex", or "copy"`);
        }
    }

    /**
     * Mixes two colors with optional weighting and color space
     * @method
     * @param {Color} color - The second color to mix with
     * @param {number} [weight=0.5] - The mixing ratio (0-1)
     * @param {string} [mode='rgb'] - The blending mode ('rgb' or 'hsl')
     * @returns {Color} The resulting new mixed color
     * @throws {TypeError} If mode is not a valid mode string ("rgb" or "hsl")
     * @throws {TypeError} If color is an not instance of Color class
     */
    mix(color, weight = 0.5, mode = 'rgb') {
        weight = Math.min(1, Math.max(0, weight)); // Clamp 0-1
        const color1 = this;
        const color2 = color;
        if (!(color2 instanceof Color))
            throw new TypeError("color must be instance of Color class");

        const [a1, a2] = [color1.alpha, color2.alpha];

        switch (mode) {
            case 'hsl': // HSL mixing (circular interpolation for hue)
                const [h1, s1, l1] = color1.hsl;
                const [h2, s2, l2] = color2.hsl;

                // Handle hue wrapping (e.g., 350° + 20° → 10°)
                let hueDiff = h2 - h1;
                if (Math.abs(hueDiff) > 180) {
                    hueDiff += hueDiff > 0 ? -360 : 360;
                }

                return new Color([
                    (h1 + hueDiff * weight + 360) % 360, // Wrap around 360°
                    s1 + (s2 - s1) * weight,
                    l1 + (l2 - l1) * weight,
                    a1 + (a2 - a1) * weight,
                ], "hsl");
            case 'rgb': // RGB mixing (linear interpolation)
                const [r1, g1, b1] = color1.rgb;
                const [r2, g2, b2] = color2.rgb;

                return new Color([
                    r1 + (r2 - r1) * weight,
                    g1 + (g2 - g1) * weight,
                    b1 + (b2 - b1) * weight,
                    a1 + (a2 - a1) * weight
                ], 'rgb');
            default:
                throw new TypeError(`Invalid mode for mixing: ${mode}`);
        }
    }

    /**
     * Checks if colors are visually similar within tolerance
     * @method
     * @param {Color} color - The color to compare the first with
     * @param {number} [tolerance=5] - The allowed maximum perceptual distance (0-442)
     * @param {boolean} [includeAlpha=true] - Whether to compare the alpha channel
     * @returns {boolean} Whether the two colors are visually similar within the given tolerance
     * @throws {TypeError} If color is an not instance of Color class
     */
    isSimilarTo(color, tolerance = 5, includeAlpha = true) {
        const color1 = this;
        const color2 = color;
        if (!(color2 instanceof Color))
            throw new TypeError("color must be instance of Color class");

        const [r1, g1, b1] = color1.rgb;
        const [r2, g2, b2] = color2.rgb;
        const [a1, a2] = [color1.alpha, color2.alpha];

        // Calculate RGB Euclidean distance (0-442 scale)
        const rDiff = Math.abs(r1 - r2);
        const gDiff = Math.abs(g1 - g2);
        const bDiff = Math.abs(b1 - b2);

        const rgbDistance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

        // Calculate alpha difference (0-255 scale)
        const alphaDifference = Math.abs(a1 - a2) * 255;

        return rgbDistance <= tolerance && (!includeAlpha || alphaDifference <= tolerance);
    }

    /**
     * Checks exact color equality (with optional alpha)
     * @method
     * @param {Color} color - the color to compare with
     * @param {boolean} [includeAlpha=true] - Whether to compare the alpha channel
     * @returns {boolean} Whether the two colors are equal
     * @throws {TypeError} If color is an not instance of Color class
     */
    isEqualTo(color, includeAlpha = true) {
        const color1 = this;
        const color2 = color;
        if (!(color2 instanceof Color))
            throw new TypeError("color must be instance of Color class");

        const [r1, g1, b1] = color1.rgb;
        const [r2, g2, b2] = color2.rgb;
        const [a1, a2] = [color1.alpha, color2.alpha];

        const rgbEqual = (
            r1 === r2 &&
            g1 === g2 &&
            b1 === b2
        );

        const alphaEqual = !includeAlpha || (
            Math.round(a1 * 255) === Math.round(a2 * 255)
        );

        return rgbEqual && alphaEqual;
    }

    /**
     * Set color from RGB values
     * @method
     * @param {Array<number>} rgba - A 3-D array containing the color values [r, g, b] (0-255)
     * @returns {this} The current color object
     * @throws {TypeError} If color is not a valid array of 3 number values
     * @throws {RangeError} If r, g or b values are out of range
     */
    set rgb(color) {
        if (!(Array.isArray(color) && color.length === 3))
            throw new TypeError(`Invalid rgb color format: ${color}`);

        validateNumber(color[0], "Red component", { start: 0, end: 255 });
        validateNumber(color[1], "Green component", { start: 0, end: 255 });
        validateNumber(color[2], "Blue component", { start: 0, end: 255 });

        this.#rgb = [
            Math.round(color[0]),
            Math.round(color[1]),
            Math.round(color[2]),
        ];
        this.#updated = false;
        return this;
    }

    /**
     * Sets color from HSL values
     * @method
     * @param {Array<number>} hsl - A 3-D array containing the hue values of the color [hue(any number will wrap down to 0-360), saturation(0-100), lightness(0-100)]
     * @returns {this} The current color object
     * @throws {TypeError} If color is not a valid array of 3 number values
     * @throws {RangeError} If saturation or lightness are out of bounds (0-100)
     */
    set hsl(color) {
        if (!(Array.isArray(color) && color.length === 3))
            throw new TypeError(`Invalid hsl color format: ${color}`);

        validateNumber(color[0], "Hue");
        validateNumber(color[1], "Saturation", { start: 0, end: 100 });
        validateNumber(color[2], "Lightness", { start: 0, end: 100 });

        this.#rgb = [...hslToRgb(color[0], color[1], color[2])].map(v => Math.round(v));
        this.#updated = false;
        return this;
    }

    /**
     * Set color from hex string
     * @method
     * @param {string} color - Hex string, Supported formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
     * @returns {this} The current color object
     * @throws {TypeError} If color is not a supported hex format
     */
    set hex(color) {
        if (!/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) {
            throw new TypeError(`Invalid hex color format: ${color}`);
        }

        let hexDigits = color.slice(1);
        const isShorthand = hexDigits.length <= 4;

        if (isShorthand) {
            hexDigits = Array.from(hexDigits).map(c => c + c).join('');
        }

        this.rgb = [
            parseInt(hexDigits.substring(0, 2), 16),
            parseInt(hexDigits.substring(2, 4), 16),
            parseInt(hexDigits.substring(4, 6), 16),
        ];
        this.alpha = hexDigits.length > 6 ? parseInt(hexDigits.substring(6, 8), 16) / 255 : 1;

        this.#updated = false;
        return this;
    }

    /**
     * Sets the alpha value of the color
     * @method
     * @param {number} alpha - the alpha value (0.0-1.0)
     * @returns {Color} The current color object
     * @throws {TypeError} If alpha is not a number
     * @throws {RangeError} If alpha is not in range (0.0-1.0)
     */
    set alpha(alpha) {
        validateNumber(alpha, "Alpha", { start: 0, end: 1 });
        this.#alpha = alpha;
        this.#updated = false;
        return this;
    }

    /**
     * Retrieves RGB values into an array
     * @method
     * @returns {Array<number>} A 3-D array containing the rgb values of the color [r, g, b] (r/g/b: 0-255);
     */
    get rgb() {
        this.#updateHex();
        return [...this.#rgb];
    }

    /**
     * Retrieves Hex values into a string, ex. "#ff0000"
     * @method
     * @returns {string} A hex string representing the color [6 digits if no transparency, 8 digits otherwise]
     */
    get hex() {
        this.#updateHex();
        return this.#hex;
    }

    /**
     * Retrieves HSL values into an array
     * @method
     * @returns {Array<number>} A 3-D array containing the hsl values of the color [h, s, l] (h: 0-360, s/l: 0-100)
     */
    get hsl() {
        this.#updateHex();
        const [h, s, l] = rgbToHsl(...this.#rgb);
        return [h, s, l];
    }

    /**
     * Retrieves alpha channel value
     * @method
     * @returns {number} A 3-D array containing the hsl values of the color [h, s, l] (h: 0-360, s/l: 0-100)
     */
    get alpha() {
        this.#updateHex();
        return this.#alpha;
    }

    toString() {
        return this.hex;
    }

    // Named Colors (static)
    static get RED() { return new Color('#FF0000', 'hex'); }
    static get TRANSPARENT() { return new Color([0, 0, 0, 0], 'rgb'); }

    // Private methods ---------------------------------------------------

    #updateHex() {
        if (this.#updated) { return }
        this.#updated = true;
        const [r, g, b] = this.#rgb, a = this.#alpha;
        const components = [
            Math.round(r),
            Math.round(g),
            Math.round(b)
        ];

        this.#hex = `#${components.map(c =>
            c.toString(16).padStart(2, '0')
        ).join('')}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : ''
            }`;
    }

    #detectInputType(color) {
        if (color instanceof Color) return "copy";
        if (typeof color === 'string') return "hex";
        if (Array.isArray(color)) {
            throw new TypeError(
                'Array input requires explicit mode ("rgb" or "hsl").'
            );
        }
        throw new TypeError('Unable to detect color format. Please specify mode.');
    }

    #copyFrom(color) {
        this.#rgb = [...color.#rgb];
        this.#hex = color.#hex;
        this.#alpha = color.#alpha;
        this.#updated = color.#updated;
    }
}

function rgbToHsl(r, g, b) {
    [r, g, b] = [r / 255, g / 255, b / 255];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return [Math.round(h * 100) / 100, Math.round(s * 10000) / 100, Math.round(l * 10000) / 100];
}

function hslToRgb(h, s, l) {
    h = h % 360 / 360;
    s = Math.min(100, Math.max(0, s)) / 100;
    l = Math.min(100, Math.max(0, l)) / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l * 255;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            let res;
            if (t < 1 / 6) res = p + (q - p) * 6 * t;
            else if (t < 1 / 2) res = q;
            else if (t < 2 / 3) res = p + (q - p) * (2 / 3 - t) * 6;
            else res = p;
            return Math.round(res * 255);
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r, g, b];
}

export default Color;
