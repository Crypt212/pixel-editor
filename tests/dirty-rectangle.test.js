import DirtyRectangle from './../scripts/dirty-rectangle.js';

describe('DirtyRectangle', () => {

    let dr;

    const createRectWithChanges = (changes) => {
        const dr = new DirtyRectangle();
        changes.forEach(([x, y, after, before]) =>
            dr.setChange(x, y, after, before));
        return dr;
    };

    beforeEach(() => {
        dr = new DirtyRectangle();
    });

    describe('DirtyRectangle Creation', () => {
        test('should create an empty dirty rectangle', () => {
            dr = new DirtyRectangle();
            expect(dr.width).toBe(0);
            expect(dr.height).toBe(0);
            expect(dr.isEmpty).toBe(true);
            expect(dr.stateType).toBe(Object);
            expect(dr.isStrictType).toBe(false);
        });
    });

    describe('Setting Changes', () => {
        describe('Coordinate Handling', () => {
            test.each`
                input          | expected
                ${[1.2, 2.7]}  | ${[1, 2]}
                ${[-1.5, 3.9]} | ${[-2, 3]}
                ${[5, 5]}      | ${[5, 5]}
            `('should floor input change $input to $expected', ({ input, expected }) => {
                const [x, y] = input;
                dr.setChange(x, y, 'state');
                expect(dr.hasChange(...expected)).toBe(true);
            });
        });

        describe('Error Handling', () => {
            test.each`
                options                                    | values         | errorType    | description     
                ${{ stateType: Number, strictType: true }} | ${['text', 5]} | ${TypeError} | ${'wrong type for after state'} 
                ${{ stateType: Number, strictType: true }} | ${[5, 'text']} | ${TypeError} | ${'wrong type for before state'} 
                ${{ stateType: Object, strictType: true }} | ${[null, 5]}   | ${TypeError} | ${'null value'} 
            `('should throws $errorType when $description', ({ options, values, errorType }) => {
                const strictTypeDR = new DirtyRectangle(options);
                expect(() => strictTypeDR.setChange(0, 0, values[0], values[1])).toThrow(errorType);
            });
        });


        describe('State Management', () => {
            test('should preserve initial before state', () => {
                dr.setChange(0, 0, 'after', 'before');
                dr.setChange(0, 0, 'updated');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before' }]);
                dr.setChange(0, 2, 'newpoint');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before' }, { x: 0, y: 2, state: 'newpoint' }]);
            });

            test('should update after state on subsequent calls', () => {
                dr.setChange(1, 1, 'v1');
                expect(dr.afterStates).toEqual([{ x: 1, y: 1, state: 'v1' }]);

                dr.setChange(1, 1, 'v2');
                expect(dr.afterStates).toEqual([{ x: 1, y: 1, state: 'v2' }]);

                dr.setChange(1, 1, 'v3');
                expect(dr.afterStates).toEqual([{ x: 1, y: 1, state: 'v3' }]);
            });

            test('should order all changes old to new in before states and after states, changes map should access any change', () => {
                dr.setChange(0, 0, 'v1');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }]);
                expect(dr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }]);
                expect(dr.changes.get(`0,0`)) .toEqual({ x: 0, y: 0, after: 'v1', before: 'v1' });
                dr.setChange(0, 2, 'v2');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }]);
                expect(dr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }]);
                expect(dr.changes.get(`0,2`)) .toEqual({ x: 0, y: 2, after: 'v2', before: 'v2' });
                dr.setChange(1, 0, 'v3');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(dr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(dr.changes.get(`1,0`)) .toEqual({ x: 1, y: 0, after: 'v3', before: 'v3' });
                dr.setChange(0, 0, 'v4');
                expect(dr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(dr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v4' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(dr.changes.get(`0,0`)) .toEqual({ x: 0, y: 0, after: 'v4', before: 'v1' });
                expect(dr.changes.get(`0,2`)) .toEqual({ x: 0, y: 2, after: 'v2', before: 'v2' });
            });
        });

        describe('Bounds Calculation', () => {
            test.each`
                changes                       | expectedBounds
                ${'[0, 0]'}                   | ${{ x0: 0, y0: 0, x1: 0, y1: 0 }}
                ${'[1, 2], [3, 4]'}           | ${{ x0: 1, y0: 2, x1: 3, y1: 4 }}
                ${'[-1, -2], [-3, -4]'}       | ${{ x0: -3, y0: -4, x1: -1, y1: -2 }}
                ${'[1, 2], [-3, -4]'}         | ${{ x0: -3, y0: -4, x1: 1, y1: 2 }}
                ${'[-1, -2], [3, 4]'}         | ${{ x0: -1, y0: -2, x1: 3, y1: 4 }}
                ${'[-1, -2], [3, 4], [0, 0]'} | ${{ x0: -1, y0: -2, x1: 3, y1: 4 }}
                ${'[-1, -2], [0, 0], [3, 4]'} | ${{ x0: -1, y0: -2, x1: 3, y1: 4 }}
                ${'[0, 0], [-1, -2], [3, 4]'} | ${{ x0: -1, y0: -2, x1: 3, y1: 4 }}
            `('should calculate bounds correctly for given $changes', ({ changes, expectedBounds }) => {

                // magic for turning the '[0, 0], [-1, -2], [3, 4]' string into [[0, 0], [-1, -2], [3, 4]] array :P
                changes = changes
                    .replace(/[\[\]\,]/g, ' ')
                    .trim()
                    .split(/\s./)
                    .filter(s => s != '')
                    .map(x => Number(x))
                    .reduce((c, n) => {
                        if (c[c.length - 1].length >= 2)
                            c.push([]);
                        c[c.length - 1].push(n);
                        return c;
                    }, [[]]);

                console.log(changes);

                dr = createRectWithChanges(changes);
                expect(dr.bounds).toEqual(expectedBounds);
            });
        });
    });

    describe('DirtyRectangle Manipulation', () => {

        describe('Cloning', () => {
            test('should produce independent copy', () => {
                dr.setChange(0, 0, 'original');
                const clone = dr.clone();

                // Test independence
                clone.setChange(1, 1, 'new');
                dr.setChange(2, 2, 'different');

                expect(clone.hasChange(2, 2)).toBe(false);
                expect(dr.hasChange(1, 1)).toBe(false);
            });

            test('should preserve all properties', () => {
                dr.setChange(1, 2, 'state');
                const clone = dr.clone();

                expect(clone.afterStates).toEqual(dr.afterStates);
                expect(clone.bounds).toEqual(dr.bounds);
            });
        });

        describe('Merging', () => {
            test('should merge overlapping pixels correctly', () => {
                const dr1 = new DirtyRectangle();
                dr1.setChange(0, 0, 'dr1-after', 'dr1-before');

                const dr2 = new DirtyRectangle();
                dr2.setChange(0, 0, 'dr2-after', 'dr2-before');

                let merge = dr1.merge(dr2);

                expect(merge.afterStates).toEqual([{ x: 0, y: 0, state: 'dr2-after' }]);
                expect(merge.beforeStates).toEqual([{ x: 0, y: 0, state: 'dr1-before' }]);
            });

            test('should expand bounds to include both rects', () => {
                const dr1 = new DirtyRectangle();
                dr1.setChange(0, 0, 'state');

                const dr2 = new DirtyRectangle();
                dr2.setChange(5, 5, 'state');

                let merge = dr1.merge(dr2);
                expect(merge.bounds).toEqual({ x0: 0, y0: 0, x1: 5, y1: 5 });
            });
        });
    });
});
