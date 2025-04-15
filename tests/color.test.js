import Color from '../scripts/color.js';

describe('Color Class', () => {

    describe('Color Creation', () => {
        describe('Hex mode Initialization', () => {
            describe('Valid Formats', () => {
                test.each`
                    input                      | mode      | hex            | rgb            | alpha        | description                       
                    ${'#ff0000'}               | ${'hex'}  | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'hex mode'}                     
                    ${'#ff0000aa'}             | ${'hex'}  | ${'#ff0000aa'} | ${[255, 0, 0]} | ${170 / 255} | ${'hex mode (with alpha)'}        
                    ${[255, 0, 0]}             | ${'rgb'}  | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'rgb mode'}                     
                    ${[255, 0, 0, 170 / 255]}  | ${'rgb'}  | ${'#ff0000aa'} | ${[255, 0, 0]} | ${170 / 255} | ${'rgb mode (with alpha)'}        
                    ${[0, 100, 50]}            | ${'hsl'}  | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'hsl mode'}                     
                    ${[0, 100, 50, 170 / 255]} | ${'hsl'}  | ${'#ff0000aa'} | ${[255, 0, 0]} | ${170 / 255} | ${'hsl mode (with alpha)'}        
                    ${new Color('#f00')}       | ${'copy'} | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'copy mode'}                    
                    ${'#ff0000'}               | ${null}   | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'auto-detected hex strings'}
                    ${new Color('#f00')}       | ${null}   | ${'#ff0000'}   | ${[255, 0, 0]} | ${1}         | ${'auto-detected Color instances'}
                `('should create color object using $description', ({ input, mode, hex, rgb, alpha }) => {
                    const color = new Color(input, mode);
                    expect(color.hex).toBe(hex);
                    expect(color.rgb).toEqual(rgb);
                    expect(color.alpha).toBe(alpha);
                });
            });

            describe('Invalid Formats', () => {
                test.each`
                    input          | mode          | errorType    | description                                  
                    ${'non-color'} | ${'hex'}      | ${TypeError} | ${'not a color (doesn\'t match hex mode)'} 
                    ${'non-color'} | ${'rgb'}      | ${TypeError} | ${'not a color (doesn\'t match rgb mode)'} 
                    ${'non-color'} | ${'hsl'}      | ${TypeError} | ${'not a color (doesn\'t match hsl mode)'} 
                    ${'non-color'} | ${'copy'}     | ${TypeError} | ${'not a color (doesn\'t match copy mode)'}
                    ${'#feafea'}   | ${'chicken'}  | ${TypeError} | ${'invalid mode'}
                    ${[255, 0, 0]} | ${null}       | ${TypeError} | ${'arrays require explicit mode'}          
                `('throws $errorType.name when $description', ({ input, mode, errorType }) => {
                    expect(() => new Color(input, mode)).toThrow(errorType);
                });
            });
        });
    });

    describe('Color Manipulation', () => {
        let color;

        beforeEach(() => {
            color = new Color(); // red [255, 0, 0, 1]
        });

        describe('Set Alpha', () => {
            describe('Valid Formats', () => {
                test.each`
                    input          | alpha          | description          
                    ${1}           | ${1}           | ${'opaque'}          
                    ${0}           | ${0}           | ${'transparent'}     
                    ${0.5}         | ${0.5}         | ${'half'}            
                    ${0.004}       | ${0.004}       | ${'minimum non-zero(1/255))'}
                    ${0.996}       | ${0.996}       | ${'maximum non-one(254/255)'}
                    ${0.123456789} | ${0.123456789} | ${'floating point(precision test)'}
                `('should set color alpha channel to $description opacity', ({ input, alpha }) => {
                    color.alpha = input;
                    expect(color.alpha).toBe(alpha);
                });
            });

            describe('Invalid Formats', () => {
                test.each`
                    input    | errorType     | description       
                    ${[]}    | ${TypeError}  | ${'non-number'}   
                    ${"add"} | ${TypeError}  | ${'non-number'}   
                    ${"0.5"} | ${TypeError}  | ${'non-number'}   
                    ${-0.6}  | ${RangeError} | ${'less than 0'}  
                    ${1.5}   | ${RangeError} | ${'higher than 1'}
                `('throws $errorType.name when $description', ({ input, errorType }) => {
                    expect(() => color.alpha = input).toThrow(errorType);
                });
            });

            describe('Hex Representation', () => {
                test.each`
                    alpha   | expectedSuffix
                    ${0}    | ${'00'}
                    ${0.5}  | ${'80'}
                    ${1}    | ${''}
                  `('alpha $alpha becomes "$expectedSuffix" in hex', ({ alpha, expectedSuffix }) => {
                    color.alpha = alpha;
                    expect(color.hex.slice(7)).toBe(`${expectedSuffix}`);
                });
            });
        });

        describe('Set Hex', () => {
            describe('Valid Formats', () => {
                test.each`
                    input          |  hex           | rgb                | alpha    | description                      
                    ${'#ff00aa'}   | ${'#ff00aa'}   | ${[255, 0, 170]}   | ${1}     | ${'lowercase'}                   
                    ${'#FF00AA'}   | ${'#ff00aa'}   | ${[255, 0, 170]}   | ${1}     | ${'uppercase'}                   
                    ${'#Ff00aA'}   | ${'#ff00aa'}   | ${[255, 0, 170]}   | ${1}     | ${'lowercase and uppercase mix'} 
                    ${'#ff00aa'}   | ${'#ff00aa'}   | ${[255, 0, 170]}   | ${1}     | ${'6-char'}                      
                    ${'#ff00aabb'} | ${'#ff00aabb'} | ${[255, 0, 170]}   | ${0.733} | ${'8-char (with alpha)'}         
                    ${'#f0a'}      | ${'#ff00aa'}   | ${[255, 0, 170]}   | ${1}     | ${'3-char shorthand'}            
                    ${'#f0ab'}     | ${'#ff00aabb'} | ${[255, 0, 170]}   | ${0.733} | ${'4-char shorthand (alpha)'}    
                    ${'#000'}      | ${'#000000'}   | ${[0, 0, 0]}       | ${1}     | ${'black shorthand'}             
                    ${'#ffffff'}   | ${'#ffffff'}   | ${[255, 255, 255]} | ${1}     | ${'white full'}                  
                    ${'#00000000'} | ${'#00000000'} | ${[0, 0, 0]}       | ${0}     | ${'all zeros with alpha'}        
                    ${'#ffffffff'} | ${'#ffffff'}   | ${[255, 255, 255]} | ${1}     | ${'all Fs with alpha'}           
                    ${'#123'}      | ${'#112233'}   | ${[17, 34, 51]}    | ${1}     | ${'numeric shorthand'}           
                `('should set color value using $description hex string', ({ input, hex, rgb, alpha }) => {
                    color.hex = input;
                    expect(color.hex).toBe(hex);
                    expect(color.rgb).toEqual(rgb);
                    expect(color.alpha).toBeCloseTo(alpha, 2);
                });
            });

            describe('Invalid Formats', () => {
                test.each`
                    input              | errorType    | description       
                    ${'ff0000'}        | ${TypeError} | ${'missing #'}    
                    ${'#g00000'}       | ${TypeError} | ${'invalid char'} 
                    ${'#1'}            | ${TypeError} | ${'short invalid'}
                    ${'#123456789'}    | ${TypeError} | ${'long invalid'} 
                `('throws $errorType.name when $description', ({ input, errorType }) => {
                    expect(() => color.hex = input).toThrow(
                        errorType,
                        `Invalid hex color format: ${input}`  // Verify exact message
                    );
                });
            });

            describe('Format Preservation', () => {
                test('should store hex in lowercase', () => {
                    color.hex = '#FF00AA';
                    expect(color.hex).not.toBe('#FF00AA'); // Should be lowercase
                    expect(color.hex).toBe('#ff00aa');
                });
            });

            describe('Alpha Modification', () => {
                test('should reset alpha to 1 when setting hex without alpha', () => {
                    color.hex = '#12345678';  // Has alpha
                    color.hex = '#abcdef';    // No alpha
                    expect(color.alpha).toBe(1);
                });

                test('should handle 00 alpha', () => {
                    color.hex = '#12345600';
                    expect(color.alpha).toBe(0);
                });
            });
        });

        describe('Set RGB', () => {
            describe('Valid Formats', () => {
                test.each`
                    description                     | input              | hex          | rgb                | alpha
                    ${'3-integer'}                  | ${[255, 0, 170]}   | ${'#ff00aa'} | ${[255, 0, 170]}   | ${1}
                    ${'non-integer (gets rounded)'} | ${[255, 0, 170.9]} | ${'#ff00ab'} | ${[255, 0, 171]}   | ${1}
                    ${'lower bound (black)'}        | ${[0, 0, 0]}       | ${'#000000'} | ${[0, 0, 0]}       | ${1}
                    ${'higher bound (white)'}       | ${[255, 255, 255]} | ${'#ffffff'} | ${[255, 255, 255]} | ${1}
                `('should set color value using $description RGB array', ({ _, input, hex, rgb, alpha }) => {
                    color.rgb = input;
                    expect(color.hex).toBe(hex);
                    expect(color.rgb).toEqual(rgb);
                    expect(color.alpha).toBeCloseTo(alpha, 2);
                });
            });

            describe('Invalid Formats', () => {
                test.each`
                    description                     | input               | errorType
                    ${'4-or-more-integers'}         | ${[255, 0, 170, 6]} | ${TypeError}
                    ${'2-or-less-integers'}         | ${[255]}            | ${TypeError}
                    ${'2-or-less-integers'}         | ${[2, 55]}          | ${TypeError}
                    ${'not an array'}               | ${'ahmed'}          | ${TypeError}
                    ${'non-number values'}          | ${[1, 2, 'a']}      | ${TypeError}
                    ${'values are higher than 255'} | ${[255, 256, 144]}  | ${RangeError}
                    ${'values are less than 0'}     | ${[-1, 25, 144]}    | ${RangeError}
                `('throws $errorType.name when $description', ({ _, input, errorType }) => {
                    expect(() => color.rgb = input).toThrow(
                        errorType,
                        `Invalid rgb color format: ${JSON.stringify(input)}`  // Verify exact message
                    );
                });
            });

            describe('Alpha Persistance', () => {
                test('should preserve existing alpha when setting RGB', () => {
                    const color = new Color('#ff000080', 'hex');
                    expect(color.alpha).toBeCloseTo(0.5, 2);

                    color.rgb = [0, 255, 0];

                    expect(color.alpha).toBeCloseTo(0.5, 2);
                    expect(color.hex).toBe('#00ff0080');
                });
            });
        });


        describe('Set HSL', () => {

            describe('Valid Formats', () => {
                test.each`
                    input               | hex          | rgb                | alpha | description                        
                    ${[0, 100, 50]}     | ${'#ff0000'} | ${[255, 0, 0]}     | ${1}  | ${'3-integer'}                    
                    ${[720, 100, 50]}   | ${'#ff0000'} | ${[255, 0, 0]}     | ${1}  | ${'3-integer (wrapping positive)'}
                    ${[-360, 100, 50]}  | ${'#ff0000'} | ${[255, 0, 0]}     | ${1}  | ${'3-integer (wrapping negative)'}
                    ${[120, 100, 25.1]} | ${'#008000'} | ${[0, 128, 0]}     | ${1}  | ${'non-integer'}                  
                    ${[0, 100, 0]}      | ${'#000000'} | ${[0, 0, 0]}       | ${1}  | ${'least lightness (black)'}      
                    ${[55, 100, 100]}   | ${'#ffffff'} | ${[255, 255, 255]} | ${1}  | ${'highest lightness (white)'}    
                    ${[0, 0, 50]}       | ${'#808080'} | ${[128, 128, 128]} | ${1}  | ${'least saturation (gray)'}      
                    ${[55, 100, 50]}    | ${'#ffea00'} | ${[255, 234, 0]}   | ${1}  | ${'highest satuation (red)'}      
                    ${[123, 0, 50]}     | ${'#808080'} | ${[128, 128, 128]} | ${1}  | ${'0 saturation (any hue)'}       
                    ${[180, 100, 1]}    | ${'#000505'} | ${[0, 5, 5]}       | ${1}  | ${'100 saturation edge'}          
                `('should set color value using $description HSL array', ({ input, hex, rgb, alpha, _ }) => {
                    color.hsl = input;
                    expect(color.hex).toBe(hex);
                    expect(color.rgb).toEqual(rgb);
                    expect(color.alpha).toBeCloseTo(alpha, 2);
                });
            });

            describe('Invalid Formats', () => {
                test.each`
                    input              | errorType     | description                             
                    ${[255, 0, 70, 6]} | ${TypeError}  | ${'4-or-more-integers'}                 
                    ${[255]}           | ${TypeError}  | ${'2-or-less-integers'}                 
                    ${[2, 55]}         | ${TypeError}  | ${'2-or-less-integers'}                 
                    ${'ahmed'}         | ${TypeError}  | ${'not an array'}                       
                    ${[1, 2, 'a']}     | ${TypeError}  | ${'non-number values'}                  
                    ${[255, 26, 150]}  | ${RangeError} | ${'lightness value is higher than 100'} 
                    ${[255, 256, 15]}  | ${RangeError} | ${'saturation value is higher than 100'}
                    ${[255, 26, -15]}  | ${RangeError} | ${'lightness value is less than 0'}     
                    ${[255, -25, 15]}  | ${RangeError} | ${'saturation value is less than 0'}    
                `('throws $errorType.name when $description', ({ input, errorType }) => {
                    expect(() => color.hsl = input).toThrow(
                        errorType,
                        `Invalid hsl color format: ${JSON.stringify(input)}`  // Verify exact message
                    );
                });
            });

            describe('Alpha Persistance', () => {
                test('should preserve existing alpha when setting RGB', () => {
                    const color = new Color('#ff000080', 'hex');
                    expect(color.alpha).toBeCloseTo(0.5, 2);

                    color.rgb = [0, 255, 0];

                    expect(color.alpha).toBeCloseTo(0.5, 2);
                    expect(color.hex).toBe('#00ff0080');
                });
            });
        });
    });

    describe('Color Analysis', () => {
        describe('isSimilarTo()', () => {
            test('should match identical colors', () => {
                const baseColor = new Color('#FF8844CC');
                expect(baseColor.isSimilarTo(baseColor)).toBe(true);
            });

            test.each`
                inputColor1    | inputColor2    | inputWeight  | includeAlpha  | result          | description
                ${'#ff8844cc'} | ${'#ff8845cd'} | ${2}         | ${true}       | ${'match'}      | ${'under tolerance'}
                ${'#ff8844cc'} | ${'#ff8846ce'} | ${2}         | ${true}       | ${'match'}      | ${'within tolerance'}
                ${'#ff8844cc'} | ${'#ff8847cf'} | ${2}         | ${true}       | ${'not match'}  | ${'over tolerance'}
                ${'#ff8844cc'} | ${'#fe8843cf'} | ${2}         | ${false}      | ${'match'}      | ${'alpha is over tolerance while ignoring alpha'}
                ${'#ff8844cc'} | ${'#fe8644cc'} | ${1}         | ${false}      | ${'not match'}  | ${'rgb is over tolerance regardless of ignoring alpha'}
            `(`should $result if $description`, ({ inputColor1, inputColor2, inputWeight, includeAlpha, result }) => {
                expect(new Color(inputColor1).isSimilarTo(new Color(inputColor2), inputWeight, includeAlpha)).toBe(result == 'match');
            });
        });

        describe('isEqualTo()', () => {

            const baseColor = new Color('#AABBCCDD');

            test('should match exact colors', () => {
                expect(baseColor.isEqualTo(new Color('#AABBCCDD'))).toBe(true);
                expect(baseColor.isEqualTo(baseColor)).toBe(true);
                expect(baseColor.isEqualTo(new Color([170, 187, 204, 0.8667], 'rgb'))).toBe(true);
            });

            test.each`
                inputColor1    | inputColor2    | includeAlpha | result         | description
                ${'#aabbccdd'} | ${'#aabbcc'}   | ${true}      | ${'not match'} | ${'alpha is not equal while not egnored'}
                ${'#aabbccdd'} | ${'#aabbccde'} | ${true}      | ${'not match'} | ${'alpha is not equal while not egnored'}
                ${'#aabdcc'}   | ${'#aabbcc'}   | ${true}      | ${'not match'} | ${'rgb is not equal'}
                ${'#aabbccdd'} | ${'#aabbccdd'} | ${true}      | ${'match'}     | ${'alpha is equal and rgb is equal'}
                ${'#aabbccfd'} | ${'#aabbccdd'} | ${false}     | ${'match'}     | ${'alpha is not equal while egnored'}
            ` (`should $result if $description`, ({ _, inputColor1, inputColor2, includeAlpha, result }) => {
                expect(new Color(inputColor1).isEqualTo(new Color(inputColor2), includeAlpha)).toBe(result == 'match');
            });
        });

        describe('Color Comparison Methods', () => {
            describe('Comparison Edge Cases', () => {
                test('should handle near-boundary values', () => {
                    const color1 = new Color('#FFFFFF');
                    const color2 = new Color('#FFFFFE');
                    expect(color1.isSimilarTo(color2, 1.8)).toBe(true);
                    expect(color1.isEqualTo(color2)).toBe(false);
                });

                test('should throw on invalid inputs', () => {
                    const color = new Color('#FFF', 'hex');
                    expect(() => color.isSimilarTo('invalid')).toThrow(TypeError);
                    expect(() => color.isEqualTo(null)).toThrow(TypeError);
                });
            });
        });
    });

    describe('Color Operations', () => {

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
                const darkRed = new Color('#ff0000', 'hex'); // hsl(0, 100%, 50%)
                const lightRed = new Color('#ffcccc', 'hex'); // hsl(0, 100%, 90%)
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
                const orange = new Color([20, 100, 50], "hsl");
                const blended = crimson.mix(orange, 0.5, 'hsl');
                expect(blended.hsl).toEqual([4.94, 100, 50]);
            });

            test('mix() should throw on invalid color', () => {
                const color = new Color('#FF0000');
                expect(() => color.mix('invalid')).toThrow();
            });

            test('mix() should throw on invalid mode', () => {
                const color = new Color('#FF0000');
                expect(() => color.mix(new Color('#00FF00'), 0.5, 'lab')).toThrow('Invalid mode');
            });
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
                const fromRgba = new Color([...color.rgb, color.alpha], 'rgb');
                expect(fromRgba.hex).toBe(color.hex);
            });
        });

        test('should convert RGB to HSL', () => {
            const red = new Color('#FF0000', 'hex');
            expect(red.hsl).toEqual([0, 100, 50]);
            expect(red.alpha).toEqual(1);

            const teal = new Color('#008080', 'hex');
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

        test('should handle edge cases (black and white)', () => {
            const black = new Color([0, 0, 0], 'rgb');
            expect(black.hex).toBe('#000000');

            const white = new Color([255, 255, 255, 0], 'rgb');
            expect(white.hex).toBe('#ffffff00');
        });

        test('should handle edge cases (0-saturation and hue wrapping)', () => {
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

    describe('Static Presets', () => {
        test('should have static color presets', () => {
            expect(Color.RED.hex).toBe('#ff0000');
            expect(Color.TRANSPARENT.alpha).toBe(0);
            expect(Color.RED instanceof Color).toBe(true);
        });
    });
});
