import Color from '../scripts/color.js';

describe('Color Class', () => {
    describe('Constructor', () => {
        test('should create from hex shorthand', () => {
            const color = new Color('#f0a', 'hex');
            expect(color.hex).toBe('#ff00aa', 'hex');
            expect(color.rgb).toEqual([255, 0, 170]);
            expect(color.alpha).toBe(1);
        });

        test('should create from hex with alpha', () => {
            const color = new Color('#ff00aa80', 'hex');
            expect(color.hex).toBe('#ff00aa80', 'hex');
            expect(color.rgb[2]).toBe(170);
            expect(color.alpha).toBe(128 / 255);
        });

        test('should create from RGB array', () => {
            const color = new Color([255, 0, 128], 'rgb');
            expect(color.rgb).toEqual([255, 0, 128]);
            expect(color.alpha).toEqual(1);
            expect(color.hex).toBe('#ff0080', 'hex');
        });

        test('should create from RGBA array', () => {
            const color = new Color([255, 0, 128, 0.5], 'rgb');
            expect(color.rgb).toEqual([255, 0, 128]);
            expect(color.alpha).toEqual(0.5);
            expect(color.hex).toBe('#ff008080', 'hex');
        });

        test('should create from HSL array', () => {
            const testCases = [
                [[0, 100, 50], [255, 0, 0], 1, "#ff0000"],
                [[120, 100, 25.1], [0, 128, 0], 1, "#008000"],
                [[0, 100, 50], [255, 0, 0], 1, "#ff0000"],
                [[0, 100, 50], [255, 0, 0], 1, "#ff0000"],
                [[0, 100, 50], [255, 0, 0], 1, "#ff0000"],
            ];

            testCases.forEach(([hsl, rgb, alpha, hex]) => {
                const color = new Color(hsl, 'hsl');
                expect(color.rgb).toEqual(rgb);
                expect(color.alpha).toEqual(alpha);
                expect(color.hex).toBe(hex);
            });
        });

        test('should create from HSLA array', () => {
            const testCases = [
                [[329.88, 100, 50, 0.5], [255, 0, 128], "#ff008080"],
                [[329.88, 100, 50, 1], [255, 0, 128], "#ff0080"],
            ];

            testCases.forEach(([hsla, rgb, hex]) => {
                const color = new Color(hsla, 'hsl');
                expect(color.rgb).toEqual(rgb);
                expect(color.alpha).toEqual(hsla[3]);
                expect(color.hex).toBe(hex);
            });
        });

        test('should throw on invalid hex format', () => {
            expect(() => new Color('#G12', 'rgb')).toThrow();
            expect(() => new Color('#12345', 'rgb')).toThrow();
        });
    });

    describe('Setting hex value', () => {
        let color;

        beforeEach(() => {
            color = new Color('#000', 'hex');
        });

        test('should handle #RGB format', () => {
            color.hex = '#aBc';
            expect(color.hex).toBe('#aabbcc');
            expect(color.rgb).toEqual([170, 187, 204]);
            expect(color.alpha).toEqual(1);
        });

        test('should handle #RGBA format', () => {
            color.hex = '#abcd';
            expect(color.hex).toBe('#aabbccdd');
            expect(color.alpha).toBeCloseTo(0.866, 2);
        });

        test('should handle #RRGGBB format', () => {
            color.hex = '#ff00ff';
            expect(color.rgb).toEqual([255, 0, 255]);
            expect(color.alpha).toEqual(1);
        });

        test('should throw on invalid input', () => {
            expect(() => color.hex = 'ff0000').toThrow(); // Missing #
            expect(() => color.hex = '#ff').toThrow(); // Invalid length
            expect(() => color.hex = '#ffaaa').toThrow(); // Invalid length
        });
    });

    describe('Setting RGBA values', () => {
        let color;

        beforeEach(() => {
            color = new Color('#000', 'hex');
        });

        test('should accept 0-255 range', () => {
            color.rgb = [128, 0, 255];
            expect(color.rgb[0]).toBe(128);
            expect(color.rgb[2]).toBe(255);
        });

        test('should handle alpha channel', () => {
            color.rgb = [255, 255, 255];
            color.alpha = 0.5;
            expect(color.alpha).toBe(0.5);
            expect(color.hex).toBe('#ffffff80');
        });

        test('should throw range error if given out-of-range values', () => {
            expect(() => color.rgb = [300, -50, 128]).toThrow(RangeError);
            expect(() => color.alpha = 2).toThrow(RangeError);
        });
    });

    describe('Color Conversion', () => {
        test('should maintain consistency between hex and rgba', () => {
            const testCases = [
                '#FF0000',
                '#00FF0080',
                '#0000FF',
                '#ABCDEF99'
            ];

            testCases.forEach(hex => {
                const color = new Color(hex, 'hex');
                const fromRgba = new Color([...color.rgb, color.alpha], "rgb");
                expect(fromRgba.hex).toBe(color.hex);
            });
        });

        test('should handle edge cases', () => {
            const black = new Color([0, 0, 0], 'rgb');
            expect(black.hex).toBe('#000000');

            const white = new Color([255, 255, 255, 0], 'rgb');
            expect(white.hex).toBe('#ffffff00');
        });
    });

    // describe('Normalization', () => {
    //     const color = new Color('#000');
    //
    //     test('should normalize components correctly', () => {
    //         expect(color._normalizeComponent(128)).toBeCloseTo(0.501, 2);
    //         expect(color._normalizeComponent(0.5)).toBe(0.5);
    //         expect(color._normalizeComponent(300)).toBe(1);
    //         expect(color._normalizeComponent(-10)).toBe(0);
    //     });
    //
    //     test('should normalize alpha correctly', () => {
    //         expect(color._normalizeAlpha(128)).toBeCloseTo(0.501, 2);
    //         expect(color._normalizeAlpha(null)).toBe(1);
    //         expect(color._normalizeAlpha('invalid')).toBe(1);
    //     });
    // });

    describe('Color Comparison Methods', () => {
        describe('isSimilarTo()', () => {
            const baseColor = new Color('#FF8844CC', 'hex');

            test('should match identical colors', () => {
                expect(baseColor.isSimilarTo(baseColor)).toBe(true);
            });

            test('should match similar colors within tolerance', () => {
                expect(baseColor.isSimilarTo('#FF8845CD', 2)).toBe(true);
                expect(baseColor.isSimilarTo('#FE8943CB', 3)).toBe(true);
            });

            test('should reject dissimilar colors', () => {
                expect(baseColor.isSimilarTo('#000000')).toBe(false);
                expect(baseColor.isSimilarTo('#FF8844', 10)).toBe(false); // Different alpha
            });

            test('should handle different color formats', () => {
                expect(baseColor.isSimilarTo([255, 136, 68, 0.8], 1)).toBe(true);
                expect(baseColor.isSimilarTo('#FF8744CC', 2)).toBe(true);
            });

            test('should respect tolerance parameter', () => {
                const baseColor = new Color('#FF8844CC');
                const similar = new Color('#FF8A44CD'); // Slightly different: 2

                expect(baseColor.isSimilarTo(similar, 1)).toBe(false);
                expect(baseColor.isSimilarTo(similar, 2)).toBe(true);
                expect(baseColor.isSimilarTo(similar, 3)).toBe(true);
            });
        });

        describe('isEqualTo()', () => {
            const baseColor = new Color('#AABBCCDD', 'hex');

            test('should match exact colors', () => {
                expect(baseColor.isEqualTo('#AABBCCDD')).toBe(true);
                expect(baseColor.isEqualTo([170, 187, 204, 0.8667])).toBe(true);
            });

            test('should reject non-equal colors', () => {
                expect(baseColor.isEqualTo('#AABBCC')).toBe(false);
                expect(baseColor.isEqualTo('#AABBCCDE')).toBe(false);
            });

            test('should optionally ignore alpha', () => {
                expect(baseColor.isEqualTo('#AABBCC', false)).toBe(true);
                expect(baseColor.isEqualTo('#AABBCC00', false)).toBe(true);
                expect(baseColor.isEqualTo('#AABBCCDD', false)).toBe(true);
            });

            test('should handle edge cases', () => {
                const black = new Color('#000000');
                expect(black.isEqualTo([0, 0, 0])).toBe(true);
                expect(black.isEqualTo([1, 0, 0])).toBe(false);
            });
        });

        describe('Comparison Edge Cases', () => {
            test('should handle near-boundary values', () => {
                const white = new Color('#FFFFFF');
                expect(white.isSimilarTo('#FFFFFE', 1.8)).toBe(true);
                expect(white.isEqualTo('#FFFFFE')).toBe(false);
            });

            test('should treat different formats as equal', () => {
                const color1 = new Color('#ABC');
                const color2 = new Color('#AABBCC');
                expect(color1.isEqualTo(color2)).toBe(true);
            });

            test('should throw on invalid inputs', () => {
                const color = new Color('#FFF');
                expect(() => color.isSimilarTo('invalid')).toThrow();
                expect(() => color.isEqualTo(null)).toThrow();
            });
        });
    });
    describe('HSL/HSLA Support', () => {
        test('should convert RGB to HSL', () => {
            const red = new Color('#FF0000');
            expect(red.hsl).toEqual([0, 100, 50]);
            expect(red.alpha).toEqual(1);

            const teal = new Color('#008080');
            expect(teal.hsl).toEqual([180, 100, 25.1]);
            expect(red.alpha).toEqual(1);
        });

        test('should convert HSL to RGB', () => {
            const gold = new Color();
            gold.hsl = [45, 100, 50];
            expect(gold.hex).toBe('#ffbf00');

            const semiPurple = new Color();
            semiPurple.hsl = [270, 60, 70];
            semiPurple.alpha = 0.5;
            expect(semiPurple.hex).toBe('#b285e080');
        });

        test('should handle edge cases', () => {
            // Achromatic (gray)
            const gray = new Color();
            gray.hsl = [0, 0, 50];
            expect(gray.hex).toBe('#808080');

            // Hue wrapping
            const wrappedHue = new Color();
            wrappedHue.hsl = [540, 100, 50]; // 540° = 180°
            expect(wrappedHue.hex).toBe('#00ffff');
        });
    });
    describe('mix() Method', () => {
        const red = new Color('#FF0000', 'hex');
        const blue = new Color('#0000FF', 'hex');
        const semiWhite = new Color([255, 255, 255, 0.5], 'rgb');

        test('should mix RGB colors', () => {
            // Equal mix
            const purple = red.mix(blue);
            expect(purple.hex).toBe('#800080');

            // Weighted mix
            const reddishPurple = red.mix(blue, 0.25);
            expect(reddishPurple.hex).toBe('#bf0040');
        });

        test('should mix HSL colors', () => {
            // Hue blending (red + blue in HSL = magenta)
            const magenta = red.mix(blue, 0.5, 'hsl');
            expect(magenta.hex).toBe('#ff00ff');

            // Lightness blending
            const darkRed = new Color('#ff0000'); // hsl(0, 100%, 50%)
            const lightRed = new Color('#ffcccc'); // hsl(0, 100%, 90%)
            const pink = darkRed.mix(lightRed, 0.5, 'hsl');
            expect(pink.hsl[2]).toBeCloseTo(70); // 70% lightness
        });

        test('should handle alpha channels', () => {
            // Mixing transparency
            const mixed = red.mix(semiWhite);
            expect(mixed.alpha).toBeCloseTo(0.75);
            expect(mixed.hex).toBe('#ff8080bf');
        });

        test('should handle edge cases', () => {
            // Extreme weights
            expect(red.mix(blue, 0).hex).toBe('#ff0000');
            expect(red.mix(blue, 1).hex).toBe('#0000ff');

            // Hue wrapping (350° + 20° → 5°)
            const crimson = new Color([350, 100, 50], "hsl");
            const orange = new Color([20,100, 50], "hsl");
            const blended = crimson.mix(orange, 0.5, 'hsl');
            expect(blended.hsl).toEqual([4.94, 100, 50]);
        });
    });
});
