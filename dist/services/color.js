import { validateNumber } from "../utils/validation.js";
var ColorSpace;
(function (ColorSpace) {
    ColorSpace[ColorSpace["rgb"] = 0] = "rgb";
    ColorSpace[ColorSpace["hsl"] = 1] = "hsl";
})(ColorSpace || (ColorSpace = {}));
const COLOR_KEY = Symbol('ColorKey');
/**
 * Represents an immutable color with support for multiple color spaces.
 * All instances are cached and reused when possible.
 * @class
 * @global
 */
class Color {
    /**
     * Internal cache of color instances to prevent duplicates.
     * Keys are long-version hex strings. (ex. '#11223344')
     * @type {Map<string, Color>}
     * @private
     */
    static cachedColors = new Map();
    /**
     * holds data of the color
     * @type {ColorData}
     * @private
     */
    data = {
        rgb: [0, 0, 0],
        hsl: [0, 0, 0],
        hex: '#000000',
        alpha: 1
    };
    /**
     * Private constructor (use Color.create() instead).
     * @param {ColorData} colorData - holds the rgb, hsl, hex and alpha values of the color
     * @param {symbol} key - Private key to prevent direct instantiation
     * @private
     * @throws {TypeError} if used directly (use Color.create() instead)
     */
    constructor(colorData, key) {
        if (key !== COLOR_KEY) { // Must not be used by the user
            throw new TypeError("Use Color.create() instead of new Color()");
        }
        this.data.rgb = colorData.rgb;
        this.data.hsl = colorData.hsl;
        this.data.hex = colorData.hex;
        this.data.alpha = colorData.alpha;
        Object.freeze(this);
    }
    // ====================
    // Public API Methods
    // ====================
    // ====================
    // Getters
    // ====================
    /** @returns {ColorVector} RGB values [r, g, b] (0-255) */
    get rgb() { return [...this.data.rgb]; }
    /** @returns {ColorVector} HSL values [h, s, l] (h: 0-360, s/l: 0-100) */
    get hsl() { return [...this.data.hsl]; }
    /** @returns {string} Hex color string */
    get hex() { return this.data.hex; }
    /** @returns {number} Alpha value (0.0-1.0) */
    get alpha() { return this.data.alpha; }
    /** @returns {string} Hex representation */
    toString() { return this.data.hex; }
    // ====================
    // Static Methods
    // ====================
    /**
     * Creates a Color instance from various formats, or returns cached instance.
     * @method
     * @static
     * @param {Object} params - Configuration object
     * @param {ColorVector} [params.rgb] - RGB values (0-255)
     * @param {ColorVector} [params.hsl] - HSL values (h:0-360, s/l:0-100)
     * @param {string} [params.hex] - Hex string (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
     * @param {number} [params.alpha=1] - Alpha value (0.0-1.0)
     * @returns {Color} Color instance
     * @throws {RangeError} If values are out of bounds
     */
    static get(params) {
        const alpha = params.alpha ?? 1;
        let key, finalRGB = [0, 0, 0], finalHSL = [0, 0, 0], finalHEX, finalAlpha;
        if ('rgb' in params) {
            validateRGB(params.rgb);
            validateNumber(alpha, "Alpha", { start: 0, end: 1 });
            params.rgb.forEach((v, i) => finalRGB[i] = Math.round(v));
            key = finalHEX = toHex(finalRGB, alpha);
            if (Color.cachedColors.has(key))
                return Color.cachedColors.get(key); // Return cached instance
            finalHSL = rgbToHsl(finalRGB);
            finalAlpha = alpha;
        }
        else if ('hsl' in params) {
            validateHSL(params.hsl);
            validateNumber(alpha, "Alpha", { start: 0, end: 1 });
            params.hsl.forEach((v, i) => finalHSL[i] = Math.round(v));
            finalRGB = hslToRgb(finalHSL);
            key = finalHEX = toHex(finalRGB, alpha);
            if (Color.cachedColors.has(key))
                return Color.cachedColors.get(key); // Return cached instance
            finalAlpha = alpha;
        }
        else {
            const parsed = parseHex(params.hex);
            finalHEX = toHex(parsed.rgb, parsed.alpha);
            key = finalHEX;
            if (Color.cachedColors.has(key))
                return Color.cachedColors.get(key); // Return cached instance
            finalRGB = parsed.rgb;
            finalHSL = rgbToHsl(finalRGB);
            finalAlpha = parsed.alpha;
        }
        const color = new Color({
            rgb: finalRGB,
            hsl: finalHSL,
            hex: finalHEX,
            alpha: finalAlpha
        }, COLOR_KEY);
        Color.cachedColors.set(key, color);
        return color;
    }
    /**
     * Mixes two colors with optional weighting and color space
     * @method
     * @param color1 - The first color to mix with
     * @param color2 - The second color to mix with
     * @param [weight=0.5] - The mixing ratio (0-1)
     * @param [mode=ColorSpace.rgb] - The blending mode
     * @returns The resulting new mixed color
     */
    static mix(color1, color2, weight = 0.5, mode = ColorSpace.rgb) {
        weight = Math.min(1, Math.max(0, weight)); // Clamp 0-1
        const newAlpha = color1.data.alpha + (color2.data.alpha - color1.data.alpha) * weight;
        switch (mode) {
            case ColorSpace.rgb:
                const [h1, s1, l1] = color1.data.hsl;
                const [h2, s2, l2] = color2.data.hsl;
                // Hue wrapping
                let hueDiff = h2 - h1;
                if (Math.abs(hueDiff) > 180) {
                    hueDiff += hueDiff > 0 ? -360 : 360;
                }
                return Color.get({
                    hsl: [
                        (h1 + hueDiff * weight + 360) % 360,
                        s1 + (s2 - s1) * weight,
                        l1 + (l2 - l1) * weight,
                    ],
                    alpha: newAlpha
                });
            case ColorSpace.rgb:
            default:
                const [r1, g1, b1] = color1.data.rgb;
                const [r2, g2, b2] = color2.data.rgb;
                return Color.get({
                    rgb: [
                        r1 + (r2 - r1) * weight,
                        g1 + (g2 - g1) * weight,
                        b1 + (b2 - b1) * weight
                    ],
                    alpha: newAlpha
                });
        }
    }
    /**
     * Composites a color over another
     * @method
     * @param {Color} topColor - The color to composite over
     * @param {Color} bottomColor - The color to be composited over
     * @returns {Color} The resulting new composited color
     */
    static compositeOver(topColor, bottomColor) {
        const [rTop, gTop, bTop, aTop] = [...topColor.data.rgb, topColor.data.alpha];
        const [rBottom, gBottom, bBottom, aBottom] = [...bottomColor.data.rgb, bottomColor.data.alpha];
        const combinedAlpha = aTop + aBottom * (1 - aTop);
        if (combinedAlpha === 0)
            return Color.TRANSPARENT;
        return Color.get({
            rgb: [
                Math.round((rTop * aTop + rBottom * aBottom * (1 - aTop)) / combinedAlpha),
                Math.round((gTop * aTop + gBottom * aBottom * (1 - aTop)) / combinedAlpha),
                Math.round((bTop * aTop + bBottom * aBottom * (1 - aTop)) / combinedAlpha),
            ],
            alpha: combinedAlpha
        });
    }
    /**
     * Checks if colors are visually similar within tolerance
     * @method
     * @param color1 - The first color to compare
     * @param color2 - The second color to compare
     * @param [tolerance=5] - The allowed maximum perceptual distance (0-442)
     * @param [includeAlpha=true] - Whether to compare the alpha channel
     * @returns Whether the two colors are visually similar within the given tolerance
     */
    static isSimilarTo(color1, color2, tolerance = 5, includeAlpha = true) {
        const [r1, g1, b1] = color1.data.rgb;
        const [r2, g2, b2] = color2.data.rgb;
        const [a1, a2] = [color1.data.alpha, color2.data.alpha];
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
     * @param color1 - the first color to compare with
     * @param color2 - the second color to compare with
     * @param [includeAlpha=true] - Whether to compare the alpha channel
     * @returns {boolean} Whether the two colors are equal
     * @throws {TypeError} If color is an not instance of Color class
     */
    static isEqualTo(color1, color2, includeAlpha = true) {
        const [r1, g1, b1] = color1.data.rgb;
        const [r2, g2, b2] = color2.data.rgb;
        const [a1, a2] = [color1.data.alpha, color2.data.alpha];
        const rgbEqual = (r1 === r2 &&
            g1 === g2 &&
            b1 === b2);
        const alphaEqual = !includeAlpha || (Math.round(a1 * 255) === Math.round(a2 * 255));
        return rgbEqual && alphaEqual;
    }
    /**
     * Creates a new color with modified RGB values
     * @param {ColorVector} [rgb=this.data.rgb] - RGB values
     * @returns {Color} New color instance
     */
    withRGB(rgb = [...this.data.rgb]) {
        return Color.get({ rgb: rgb, alpha: this.data.alpha });
    }
    /**
     * Creates a new color with modified HSL values
     * @param {ColorVector} [hsl=this.data.rgb] - HSL values
     * @returns {Color} New color instance
     */
    withHSL(hsl = [...this.data.hsl]) {
        return Color.get({ hsl: hsl, alpha: this.data.alpha });
    }
    /**
     * Creates a new color with modified alpha
     * @param {number} alpha - Alpha value (0.0-1.0)
     * @returns {Color} New color instance
     * @throws {RangeError} If alpha is out of bounds
     */
    withAlpha(alpha) {
        return Color.get({ rgb: this.data.rgb, alpha });
    }
    /**
     * Predefined transparent color instance.
     * @type {Color}
     * @static
     */
    static TRANSPARENT = this.get({ rgb: [0, 0, 0], alpha: 0 });
    /**
     * Clears the color cache, forcing new instances to be created
     * @static
     */
    static clearCache() {
        this.cachedColors.clear();
        this.TRANSPARENT = this.get({ rgb: [0, 0, 0], alpha: 0 });
    }
    /**
     * Gets the current size of the color cache (for testing/debugging)
     * @static
     * @returns {number} Number of cached colors
     */
    static get cacheSize() {
        return this.cachedColors.size;
    }
}
/**
 * Converts RGB to HSL color space.
 * @param {ColorVector} rgb - Red (0-255), Green (0-255), Blue (0-255)
 * @returns {ColorVector} HSL values
 * @private
 */
function rgbToHsl(rgb) {
    let [r, g, b] = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
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
 * @param {ColorVector} hsl - Hue (0-360), Saturation (0-100), Lightness (0-100)
 * @returns {ColorVector} RGB values
 * @private
 */
function hslToRgb(hsl) {
    let [h, s, l] = hsl;
    h = h % 360 / 360;
    s = Math.min(100, Math.max(0, s)) / 100;
    l = Math.min(100, Math.max(0, l)) / 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l * 255;
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
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
 * @param {ColorVector} rgb - RGB values to validate
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
 * @param {ColorVector} hsl - HSL values to validate
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
 * @returns {{rgb: ColorVector, alpha: number}} Parsed values
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
