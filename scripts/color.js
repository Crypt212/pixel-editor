import { validateNumber } from "./validation.js";

/**
 * A comprehensive color class supporting Hex, RGB(A), and HSL(A) formats
 * with conversion, mixing, and comparison capabilities.
 * @class
 */
class Color {
    /**
     * Creates a Color instance from various formats
     * @constructor
     * @param {string|Array<number>|Color} color - Input color (Hex, RGB/A, HSL/A, or Color instance)
     * @param {string} [mode="rgb"] - Interpretation mode for arrays ("rgb" or "hsl")
     * @throws {TypeError} if mode is not valid
     * @throws {TypeError} if color is not valid
     * @example
     * new Color("#FF0000") // Hex
     * new Color([255, 0, 0]) // RGB
     * new Color([360, 100, 50], "hsl") // HSL
     */
    constructor(color = [0, 0, 0, 1], mode = "rgb") {
        this._rgb = [0, 0, 0]; // (rgb: 0-255, a: 0.0-1.0)
        this._hex = '#000000';
        this._alpha = 1;
        this._updated = false;

        if (typeof color == "string") {
            this.hex = color;
        } else if (Array.isArray(color)) {
            color = [...color];
            if (color.length === 4) {
                this.alpha = color[3];
                color.splice(color.length - 1, 1);
            }
            switch (mode) {
                case "rgb":
                    this.rgb = color;
                    break;
                case "hsl":
                    this.hsl = color;
                    break;
                default:
                    throw new TypeError('Invalid array color mode, only ["rgb", "hsl"] allowed');
            }
        } else if (color instanceof Color) {
            this._rgb = [...color._rgb];
            this._hex = color._hex;
            this._alpha = color._alpha;
            this._updated = color._updated;
        } else {
            throw new TypeError('Invalid color input');
        }
    }

    /**
     * Mixes two colors with optional weighting and color space
     * @method
     * @param {Color|string|Array} color - Color to mix with
     * @param {number} [weight=0.5] - Mix ratio (0-1)
     * @param {string} [mode='rgb'] - Blend mode ('rgb' or 'hsl')
     * @returns {Color} New mixed color
     * @throws {TypeError} if mode is not valid
     */
    mix(color, weight = 0.5, mode = 'rgb') {
        weight = Math.min(1, Math.max(0, weight)); // Clamp 0-1
        const color1 = this;
        const color2 = new Color(color);
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
                ]);
            default:
                throw new Error(`Invalid mode for mixing: ${mode}`);
        }
    }

    /**
     * Checks if colors are visually similar within tolerance
     * @method
     * @param {Color|string|Array} color - Color to compare
     * @param {number} [tolerance=5] - Max allowed perceptual distance (0-442)
     * @returns {boolean}
     */
    isSimilarTo(color, tolerance = 5) {
        const color1 = this;
        const color2 = new Color(color);
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

        return rgbDistance <= tolerance && alphaDifference <= tolerance;
    }

    /**
     * Checks exact color equality (with optional alpha)
     * @method
     * @param {Color|string|Array} color - Color to compare
     * @param {boolean} [includeAlpha=true] - Whether to compare alpha channel
     * @returns {boolean}
     */
    isEqualTo(color, includeAlpha = true) {
        const color1 = this;
        const color2 = new Color(color);
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
     * @param {Array<number>} rgba - [r, g, b] (0-255)
     * @returns {this}
     * @throws {TypeError} if color is not an array of 3 number values
     * @throws {RangeError} if r, g or b values are out of range
     */
    set rgb(color) {
        if (!(Array.isArray(color) && color.length === 3))
            throw new Error(`Invalid rgb color format: ${color}`);

        validateNumber(color[0], "Red component", {start: 0, end: 255});
        validateNumber(color[1], "Green component", {start: 0, end: 255});
        validateNumber(color[2], "Blue component", {start: 0, end: 255});

        this._rgb = [
            color[0],
            color[1],
            color[2],
        ];
        this._updated = false;
        return this;
    }

    /**
     * Sets color from HSL values
     * @method
     * @param {Array<number>} hsl - [hue(any number will wrap down to 0-360), saturation(0-100), lightness(0-100)]
     * @returns {this}
     * @throws {TypeError} if color is not an array of 3 number values
     * @throws {RangeError} if saturation or lightness are out of bounds
     */
    set hsl(color) {
        if (!(Array.isArray(color) && color.length === 3))
            throw new TypeError(`Invalid hsl color format: ${color}`);

        validateNumber(color[0], "Hue");
        validateNumber(color[1], "Saturation", {start: 0, end: 100});
        validateNumber(color[2], "Lightness", {start: 0, end: 100});

        this._rgb = [...hslToRgb(color[0], color[1], color[2])];
        this._updated = false;
        return this;
    }

    /**
     * Set color from hex string
     * @method
     * @param {string} color - Supported formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
     * @returns {this}
     * @throws {TypeError} if color is not a supported hex format
     */
    set hex(color) {
        if (!/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color)) {
            throw new TypeError(`Invalid hex color format: ${hex}`);
        }

        let hexDigits = color.slice(1);
        const isShorthand = hexDigits.length <= 4;

        if (isShorthand) {
            hexDigits = Array.from(hexDigits).map(c => c + c).join('');
        }

        this.rgb = [
            parseInt(hexDigits.substr(0, 2), 16),
            parseInt(hexDigits.substr(2, 2), 16),
            parseInt(hexDigits.substr(4, 2), 16),
        ];
        this.alpha = hexDigits.length > 6 ? parseInt(hexDigits.substr(6, 2), 16) / 255 : 1;

        this._updated = false;
        return this;
    }

    /**
     * Sets the alpha value of the color
     * @method
     * @param {Number} alpha - the alpha value [0.0-1.0]
     * @returns {Color} the current color object
     * @throws {TypeError} if alpha is not a number
     * @throws {RangeError} if alpha is not in range [0.0-1.0]
     */
    set alpha(alpha) {
        validateNumber(alpha, "Alpha", {start: 0, end: 1});
        this._alpha = alpha;
        this._updated = false;
        return this;
    }

    /**
     * Get RGB values in an array
     * @method
     * @returns {Array<number>} [r, g, b] (r/g/b: 0-255);
     */
    get rgb() {
        this._updateHex();
        return [...this._rgb];
    }

    /**
     * Get Hex values in a string, ex. "#ff0000"
     * @method
     * @returns {String} 
     */
    get hex() {
        this._updateHex();
        return this._hex;
    }

    /**
     * Get HSL values in an array
     * @method
     * @returns {Array<number>} [h, s, l] (h: 0-360, s/l: 0-100)
     */
    get hsl() {
        this._updateHex();
        const [h, s, l] = rgbToHsl(...this._rgb);
        return [h, s, l];
    }

    get alpha() {
        this._updateHex();
        return this._alpha;
    }

    // Named Colors (static)
    static get RED() { return new Color('#FF0000'); }
    static get TRANSPARENT() { return new Color([0, 0, 0, 0]); }

    // Private methods
    _updateHex() {
        if (this._updated) { return }
        this._updated = true;
        const [r, g, b] = this._rgb, a = this._alpha;
        const components = [
            Math.round(r),
            Math.round(g),
            Math.round(b)
        ];

        this._hex = `#${components.map(c =>
            c.toString(16).padStart(2, '0')
        ).join('')}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : ''
            }`;
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
