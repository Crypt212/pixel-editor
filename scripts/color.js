import { validateNumber } from "./validation.js";

const COLOR_KEY = Symbol('ColorKey');

/**
 * Represents an immutable color with support for multiple color spaces.
 * All instances are cached and reused when possible.
 * @class
 * @global
 */
class Color {
    /**
     * @typedef {Object} RGBColor
     * @property {number} 0 - Red (0-255)
     * @property {number} 1 - Green (0-255)
     * @property {number} 2 - Blue (0-255)
     */

    /**
     * @typedef {Object} HSLColor
     * @property {number} 0 - Hue (0-360)
     * @property {number} 1 - Saturation (0-100)
     * @property {number} 2 - Lightness (0-100)
     */

    /**
     * @typedef {Object} ParsedHex
     * @property {number[]} rgb - RGB values [r, g, b]
     * @property {number} alpha - Alpha value (0-1)
     */

    /**
     * Internal cache of color instances to prevent duplicates.
     * Keys are long-version hex strings. (ex. '#11223344')
     * @type {Map<string, Color>}
     * @private
     */
    static #colorMemory = new Map();

    /**
     * RGB color values [0-255, 0-255, 0-255].
     * @type {RGBColor}
     * @private
     */
    #rgb = [0, 0, 0];

    /**
     * HSL color values [0-360, 0-100, 0-100].
     * @type {HSLColor}
     * @private
     */
    #hsl = [0, 0, 0];

    /**
     * Hexadecimal color representation.
     * @type {string}
     * @private
     */
    #hex = '#000000';

    /**
     * Alpha transparency value (0-1).
     * @type {number}
     * @private
     */
    #alpha = 1;

    /**
     * Private constructor (use Color.create() instead).
     * @param {RGBColor} rgb - RGB values
     * @param {HSLColor} hsl - HSL values
     * @param {string} hex - Hex representation
     * @param {number} alpha - Alpha value
     * @param {symbol} key - Private key to prevent direct instantiation
     * @private
     * @throws {TypeError} if used directly (use Color.create() instead)
     */
    constructor(rgb, hsl, hex, alpha, key) {
        if (key !== COLOR_KEY) { // Must not be used by the user
            throw new TypeError("Use Color.create() instead of new Color()");
        }
        this.#rgb = rgb;
        this.#hsl = hsl;
        this.#hex = hex;
        this.#alpha = alpha;
        Object.freeze(this);
    }

    // ====================
    // Public API Methods
    // ====================

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

                return Color.create([
                    (h1 + hueDiff * weight + 360) % 360, // Wrap around 360°
                    s1 + (s2 - s1) * weight,
                    l1 + (l2 - l1) * weight,
                    a1 + (a2 - a1) * weight,
                ], "hsl");
            case 'rgb': // RGB mixing (linear interpolation)
                const [r1, g1, b1] = color1.rgb;
                const [r2, g2, b2] = color2.rgb;

                return Color.create([
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
     * Creates a new color with modified RGB values
     * @param {Object} changes - RGB changes
     * @param {number} [changes.r] - Red component (0-255)
     * @param {number} [changes.g] - Green component (0-255)
     * @param {number} [changes.b] - Blue component (0-255)
     * @returns {Color} New color instance
     */
    withRGB({ r = this.#rgb[0], g = this.#rgb[1], b = this.#rgb[2] } = {}) {
        return Color.create({ rgb: [r, g, b], alpha: this.#alpha });
    }

    /**
     * Creates a new color with modified HSL values
     * @param {Object} changes - HSL changes
     * @param {number} [changes.h] - Hue (0-360)
     * @param {number} [changes.s] - Saturation (0-100)
     * @param {number} [changes.l] - Lightness (0-100)
     * @returns {Color} New color instance
     */
    withHSL({ h = this.#hsl[0], s = this.#hsl[1], l = this.#hsl[2] } = {}) {
        return Color.create({ hsl: [h, s, l], alpha: this.#alpha });
    }

    /**
     * Creates a new color with modified alpha
     * @param {number} alpha - Alpha value (0.0-1.0)
     * @returns {Color} New color instance
     * @throws {RangeError} If alpha is out of bounds
     */
    withAlpha(alpha) {
        return Color.create({ rgb: this.#rgb, alpha });
    }

    /**
     * Mixes two colors
     * @param {Color} color - Color to mix with
     * @param {number} [weight=0.5] - Mixing ratio (0-1)
     * @param {'rgb'|'hsl'} [mode='rgb'] - Mixing mode
     * @returns {Color} New mixed color
     * @throws {TypeError} If color is not a Color instance
     */
    mix(color, weight = 0.5, mode = 'rgb') {
        if (!(color instanceof Color)) {
            throw new TypeError("color must be instance of Color class");
        }

        weight = Math.min(1, Math.max(0, weight));
        const [a1, a2] = [this.#alpha, color.#alpha];

        switch (mode) {
            case 'hsl':
                const [h1, s1, l1] = this.#hsl;
                const [h2, s2, l2] = color.#hsl;
                let hueDiff = h2 - h1;
                if (Math.abs(hueDiff) > 180) {
                    hueDiff += hueDiff > 0 ? -360 : 360;
                }
                return Color.create({
                    hsl: [
                        (h1 + hueDiff * weight + 360) % 360,
                        s1 + (s2 - s1) * weight,
                        l1 + (l2 - l1) * weight
                    ],
                    alpha: a1 + (a2 - a1) * weight
                });

            case 'rgb':
                const [r1, g1, b1] = this.#rgb;
                const [r2, g2, b2] = color.#rgb;
                return Color.create({
                    rgb: [
                        r1 + (r2 - r1) * weight,
                        g1 + (g2 - g1) * weight,
                        b1 + (b2 - b1) * weight
                    ],
                    alpha: a1 + (a2 - a1) * weight
                });

            default:
                throw new TypeError(`Invalid mixing mode: ${mode}`);
        }
    }

    // ====================
    // Getters
    // ====================

    /** @returns {Array<number>} RGB values [r, g, b] (0-255) */
    get rgb() { return [...this.#rgb]; }

    /** @returns {Array<number>} HSL values [h, s, l] (h: 0-360, s/l: 0-100) */
    get hsl() { return [...this.#hsl]; }

    /** @returns {string} Hex color string */
    get hex() { return this.#hex; }

    /** @returns {number} Alpha value (0.0-1.0) */
    get alpha() { return this.#alpha; }

    /** @returns {string} Hex representation */
    toString() { return this.#hex; }


    // ====================
    // Static Methods
    // ====================

    /**
     * Creates a Color instance from various formats, or returns cached instance.
     * @method
     * @static
     * @param {Object} config - Configuration object
     * @param {RGBColor} [config.rgb] - RGB values (0-255)
     * @param {HSLColor} [config.hsl] - HSL values (h:0-360, s/l:0-100)
     * @param {string} [config.hex] - Hex string (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
     * @param {number} [config.alpha=1] - Alpha value (0.0-1.0)
     * @returns {Color} Color instance
     * @throws {TypeError} If input format is invalid
     * @throws {RangeError} If values are out of bounds
     */
    static create({ rgb, hsl, hex, alpha = 1 } = {}) {
        if ([rgb, hsl, hex].filter(Boolean).length !== 1) {
            throw new TypeError("Specify exactly one of: rgb, hsl, hex");
        }

        let key, finalRGB, finalHSL, finalHEX, finalAlpha;

        if (rgb !== undefined) {
            validateRGB(rgb);
            validateNumber(alpha, "Alpha", { start: 0, end: 1 });
            finalRGB = rgb.map(v => Math.round(v));

            key = finalHEX = toHex(finalRGB, alpha);

            if (Color.#colorMemory.has(key))
                return Color.#colorMemory.get(key); // Return cached instance

            finalHSL = rgbToHsl(...finalRGB);
            finalAlpha = alpha;
        }
        else if (hsl !== undefined) {
            validateHSL(hsl);
            validateNumber(alpha, "Alpha", { start: 0, end: 1 });
            finalHSL = hsl.map(v => Math.round(v));
            finalRGB = hslToRgb(...finalHSL);

            key = finalHEX = toHex(finalRGB, alpha);

            if (Color.#colorMemory.has(key))
                return Color.#colorMemory.get(key); // Return cached instance

            finalAlpha = alpha;
        }
        else if (hex !== undefined) {
            const parsed = parseHex(hex);
            finalHEX = toHex(parsed.rgb, parsed.alpha);

            key = finalHEX;

            if (Color.#colorMemory.has(key))
                return Color.#colorMemory.get(key); // Return cached instance

            finalRGB = parsed.rgb;
            finalHSL = rgbToHsl(...finalRGB);
            finalAlpha = parsed.alpha;
        } else {
            throw new TypeError('Color must be initialized with rgb, hsl, hex, or another Color instance');
        }

        const color = new Color(finalRGB, finalHSL, finalHEX, finalAlpha, COLOR_KEY);
        Color.#colorMemory.set(key, color);
        return color;
    }


    /**
     * Predefined transparent color instance.
     * @type {Color}
     * @static
     */
    static TRANSPARENT = this.create({ rgb: [0, 0, 0], alpha: 0 });

    /**
     * Clears the color cache, forcing new instances to be created
     * @static
     */
    static clearCache() {
        this.#colorMemory.clear();

        this.TRANSPARENT = this.create({ rgb: [0, 0, 0], alpha: 0 });
    }

    /**
     * Gets the current size of the color cache (for testing/debugging)
     * @static
     * @returns {number} Number of cached colors
     */
    static get cacheSize() {
        return this.#colorMemory.size;
    }
}

/**
 * Converts RGB to HSL color space.
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {HSLColor} HSL values
 * @private
 */
function rgbToHsl(r, g, b) {
    [r, g, b] = [r / 255, g / 255, b / 255];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
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

    return [
        Math.round(h * 100) / 100,
        Math.round(s * 10000) / 100,
        Math.round(l * 10000) / 100
    ];
}

/**
 * Converts HSL to RGB color space.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {RGBColor} RGB values
 * @private
 */
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
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
        g = Math.round(hue2rgb(p, q, h) * 255);
        b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    }

    return [r, g, b];
}

/**
 * Converts RGB+alpha to hex string.
 * @param {RGBColor} rgb - RGB values
 * @param {number} alpha - Alpha value
 * @returns {string} Hex color string
 * @private
 */
function toHex(rgb, alpha) {
    const components = [
        Math.round(rgb[0]),
        Math.round(rgb[1]),
        Math.round(rgb[2]),
        Math.round(alpha * 255)
    ];

    return `#${components
        .map(c => c.toString(16).padStart(2, '0'))
        .join('')
        .replace(/ff$/, '')}`; // Remove alpha if fully opaque
}

/**
 * Validates RGB array.
 * @param {Array} rgb - RGB values to validate
 * @throws {TypeError} If invalid format
 * @throws {RangeError} If values out of bounds
 * @private
 */
function validateRGB(rgb) {
    if (!Array.isArray(rgb) || rgb.length !== 3) {
        throw new TypeError(`RGB must be an array of 3 numbers`);
    }
    validateNumber(rgb[0], "Red component", { start: 0, end: 255 });
    validateNumber(rgb[1], "Green component", { start: 0, end: 255 });
    validateNumber(rgb[2], "Blue component", { start: 0, end: 255 });
}

/**
 * Validates HSL array.
 * @param {Array} hsl - HSL values to validate
 * @throws {TypeError} If invalid format
 * @throws {RangeError} If values out of bounds
 * @private
 */
function validateHSL(hsl) {
    if (!Array.isArray(hsl) || hsl.length !== 3) {
        throw new TypeError(`HSL must be an array of 3 numbers`);
    }
    validateNumber(hsl[0], "Hue");
    validateNumber(hsl[1], "Saturation", { start: 0, end: 100 });
    validateNumber(hsl[2], "Lightness", { start: 0, end: 100 });
}

/**
 * Parses hex color string.
 * @param {string} hex - Hex color string
 * @returns {{rgb: RGBColor, alpha: number}} Parsed values
 * @throws {TypeError} If invalid format
 * @private
 */
function parseHex(hex) {
    if (!/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex)) {
        throw new TypeError(`Invalid hex color format: ${hex}`);
    }

    let hexDigits = hex.slice(1);

    // Expand shorthand (#RGB or #RGBA)
    if (hexDigits.length <= 4) {
        hexDigits = hexDigits.split('').map(c => c + c).join('');
    }

    // Parse RGB components
    const rgb = [
        parseInt(hexDigits.substring(0, 2), 16),
        parseInt(hexDigits.substring(2, 4), 16),
        parseInt(hexDigits.substring(4, 6), 16)
    ];

    // Parse alpha (default to 1 if not present)
    const alpha = hexDigits.length >= 8
        ? parseInt(hexDigits.substring(6, 8), 16) / 255
        : 1;

    return { rgb, alpha };
}

export default Color;
