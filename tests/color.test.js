import Color from '../scripts/color.js';

describe('Color Class', () => {
    describe('Color Creation', () => {

        describe('Constructor Restriction', () => {
            test('should throw when using new Color() directly', () => {
                expect(() => new Color()).toThrow('Use Color.create() instead');
            });
        });

        describe('Valid Formats', () => {
            test.each`
                config                                     | hex            | rgb                                      | alpha          | description                       
                ${{ hex: '#ff0000' }}                      | ${'#ff0000'}   | ${[255, 0, 0]}                           | ${1}           | ${'hex'}                     
                ${{ hex: '#ff0000aa' }}                    | ${'#ff0000aa'} | ${[255, 0, 0]}                           | ${170 / 255}   | ${'hex with alpha'}        
                ${{ rgb: [255, 0, 0] }}                    | ${'#ff0000'}   | ${[255, 0, 0]}                           | ${1}           | ${'rgb'}                     
                ${{ rgb: [255, 0, 0], alpha: 170 / 255 }}  | ${'#ff0000aa'} | ${[255, 0, 0]}                           | ${170 / 255}   | ${'rgb with alpha'}        
                ${{ hsl: [0, 100, 50] }}                   | ${'#ff0000'}   | ${[255, 0, 0]}                           | ${1}           | ${'hsl'}                     
                ${{ hsl: [0, 100, 50], alpha: 170 / 255 }} | ${'#ff0000aa'} | ${[255, 0, 0]}                           | ${170 / 255}   | ${'hsl with alpha'}        
                ${{ hex: '#123' }}                         | ${'#112233'}   | ${[17, 34, 51]}                          | ${1}           | ${'shorthand hex'}
                ${{ hex: '#f0ab' }}                        | ${'#ff00aabb'} | ${[255, 0, 170]}                         | ${0.733}       | ${'shorthand with alpha'}
                ${{ hex: '#f0ab', alpha: 1.1 }}            | ${'#ff00aabb'} | ${[255, 0, 170]}                         | ${0.733}       | ${'alpha option discarded when hex is provided'}
            `('should create color object using $description', ({ config, hex, rgb, alpha }) => {
                const color = Color.create(config);
                expect(color.hex).toBe(hex);
                expect(color.rgb).toEqual(rgb);
                expect(color.alpha).toBeCloseTo(alpha, 3);
            });

            test('should return same instance for identical colors', () => {
                const color1 = Color.create({ rgb: [255, 0, 0] });
                const color2 = Color.create({ hex: '#ff0000' });
                expect(color1).toBe(color2); // Same instance
            });
        });

        describe('Invalid Formats', () => {
            test.each`
                config                            | errorType    | description                                  
                ${{ hex: 'non-color' }}           | ${TypeError} | ${'invalid hex'} 
                ${{ rgb: 'non-array' }}           | ${TypeError} | ${'invalid rgb'} 
                ${{ hsl: 'non-array' }}           | ${TypeError} | ${'invalid hsl'} 
                ${{ rgb: [256, 0, 0] }}           | ${RangeError}| ${'rgb out of bounds'}
                ${{ hsl: [0, 101, 50] }}          | ${RangeError}| ${'hsl out of bounds'}
                ${{ rgb: [0, 0, 0], alpha: 1.1 }} | ${RangeError}| ${'alpha out of bounds'}
                ${{}}                             | ${TypeError} | ${'no config'}
            `('throws $errorType.name when $description', ({ config, errorType }) => {
                expect(() => Color.create(config)).toThrow(errorType);
            });
        });
    });

    describe('Immutable Operations', () => {
        let color;

        beforeEach(() => {
            color = Color.create({ hex: '#ff0000' });
        });

        describe('withRGB()', () => {
            test('should return new instance with modified RGB', () => {
                const newColor = color.withRGB({ g: 255 });
                expect(newColor.hex).toBe('#ffff00');
                expect(color.hex).toBe('#ff0000'); // Original unchanged
            });

            test('should maintain alpha', () => {
                const transparentRed = Color.create({ hex: '#ff000080' });
                const newColor = transparentRed.withRGB({ g: 255 });
                expect(newColor.hex).toBe('#ffff0080');
            });
        });

        describe('withHSL()', () => {
            test('should return new instance with modified HSL', () => {
                const newColor = color.withHSL({ h: 120 });
                expect(newColor.hex).toBe('#00ff00');
            });
        });

        describe('withAlpha()', () => {
            test('should return new instance with modified alpha', () => {
                const newColor = color.withAlpha(0.5);
                expect(newColor.hex).toBe('#ff000080');
                expect(color.alpha).toBe(1);
            });
        });
    });

    describe('Color Analysis', () => {
        describe('isSimilarTo()', () => {
            test.each`
                color1          | color2          | tolerance | includeAlpha | expected | description
                ${'#ff8844cc'} | ${'#ff8845cd'}  | ${2}      | ${true}      | ${true}  | ${'under tolerance'}
                ${'#ff8844cc'} | ${'#ff8846ce'}  | ${2}      | ${true}      | ${true}  | ${'within tolerance'}
                ${'#ff8844cc'} | ${'#ff8847cf'}  | ${2}      | ${true}      | ${false} | ${'over tolerance'}
                ${'#ff8844cc'} | ${'#fe8843cf'}  | ${2}      | ${false}     | ${true}  | ${'ignore alpha'}
                ${'#ff8844cc'} | ${'#fe8644cc'}  | ${1}      | ${false}     | ${false} | ${'rgb over tolerance'}
            `('$expected when $description', ({ color1, color2, tolerance, includeAlpha, expected }) => {
                const c1 = Color.create({ hex: color1 });
                const c2 = Color.create({ hex: color2 });
                expect(c1.isSimilarTo(c2, tolerance, includeAlpha)).toBe(expected);
            });
        });

        describe('isEqualTo()', () => {
            test.each`
                color1          | color2          | includeAlpha | expected | description
                ${'#aabbccdd'}  | ${'#aabbccdd'}  | ${true}      | ${true}  | ${'exact match'}
                ${'#aabbccdd'}  | ${'#aabbcc'}    | ${true}      | ${false} | ${'alpha difference'}
                ${'#aabbccdd'}  | ${'#aabbccdd'}  | ${false}     | ${true}  | ${'ignore alpha'}
                ${'#aabbccdd'}  | ${'#aabbccde'}  | ${false}     | ${true}  | ${'alpha ignored'}
                ${'#aabbccdd'}  | ${'#aabdccdd'}  | ${true}      | ${false} | ${'rgb difference'}
            `('$expected when $description', ({ color1, color2, includeAlpha, expected }) => {
                const c1 = Color.create({ hex: color1 });
                const c2 = Color.create({ hex: color2 });
                expect(c1.isEqualTo(c2, includeAlpha)).toBe(expected);
            });
        });
    });

    describe('Color Operations', () => {
        describe('mix()', () => {
            const red = Color.create({ hex: '#ff0000' });
            const blue = Color.create({ hex: '#0000ff' });

            test('should mix colors in RGB space', () => {
                const purple = red.mix(blue, 0.5, 'rgb');
                expect(purple.hex).toBe('#800080');
                expect(purple.alpha).toBe(1);
            });

            test('should mix colors in HSL space', () => {
                const magenta = red.mix(blue, 0.5, 'hsl');
                expect(magenta.hex).toBe('#ff00ff');
            });

            test('should mix alpha channels', () => {
                const semiRed = Color.create({ hex: '#ff000080' });
                const mixed = semiRed.mix(blue, 0.5);
                expect(mixed.alpha).toBeCloseTo(0.5 * (0.5 + 1));
            });
        });
        describe('compositeOver()', () => {
            test('should composite colors correctly', () => {
                const red = Color.create({ rgb: [255, 0, 0], alpha: 0.5 });
                const blue = Color.create({ rgb: [0, 0, 255], alpha: 0.5 });

                const composite1 = red.compositeOver(blue);
                expect(composite1.rgb.map(Math.round)).toEqual([170, 0, 85]);

                const composite2 = blue.compositeOver(red);
                expect(composite2.rgb.map(Math.round)).toEqual([85, 0, 170]);
            });
        });
    });

    describe('Static Colors', () => {
        test('TRANSPARENT should have alpha 0', () => {
            expect(Color.TRANSPARENT.alpha).toBe(0);
        });

        test('static colors should use cache', () => {
            const fromCache = Color.create({ hex: '#0000' });
            expect(fromCache.hex).toBe('#00000000');
            expect(Color.TRANSPARENT.hex).toBe('#00000000');
            expect(Color.TRANSPARENT).toBe(fromCache); // Same instance
        });

        test('static colors should be recreated after cache clear', () => {
            const originalColor = Color.TRANSPARENT;
            Color.clearCache();
            expect(Color.TRANSPARENT).not.toBe(originalColor); // New instance
            expect(Color.TRANSPARENT.hex).toBe('#00000000'); // But same value
        });
    });

    describe('Color Cache', () => {
        beforeEach(() => {
            Color.clearCache(); // Ensure clean state for each test
        });

        test('should reuse instances for same color', () => {
            const color1 = Color.create({ rgb: [255, 0, 0] });
            const color2 = Color.create({ hex: '#ff0000' });
            expect(color1).toBe(color2); // Same instance
            expect(Color.cacheSize).toBe(2); // one for the created color and one for cached transparent
        });

        test('clearCache() should force new instances', () => {
            const color1 = Color.create({ rgb: [255, 0, 0] });
            expect(Color.cacheSize).toBe(2);

            Color.clearCache();
            expect(Color.cacheSize).toBe(1);

            const color2 = Color.create({ rgb: [255, 0, 0] });
            expect(color1).not.toBe(color2); // Different instances
            expect(Color.cacheSize).toBe(2);
        });

        test('cache should handle different color spaces', () => {
            const color1 = Color.create({ rgb: [255, 0, 0] });
            const color2 = Color.create({ hsl: [0, 100, 50] });
            const color3 = Color.create({ hex: '#ff0000' });

            expect(color1).toBe(color2);
            expect(color2).toBe(color3);
            expect(Color.cacheSize).toBe(2);
        });

        test('cache should distinguish different alphas', () => {
            const color1 = Color.create({ rgb: [255, 0, 0], alpha: 0.5 });
            const color2 = Color.create({ rgb: [255, 0, 0], alpha: 1 });

            expect(color1).not.toBe(color2);
            expect(Color.cacheSize).toBe(3);
        });
    });
});
