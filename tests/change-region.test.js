import ChangeRegion from './../scripts/change-region.js';

describe('ChangeRegion', () => {

    let cr;

    const createRectWithChanges = (changes) => {
        const cr = new ChangeRegion();
        changes.forEach(([x, y, after, before]) =>
            cr.setChange(x, y, after, before));
        return cr;
    };

    beforeEach(() => {
        cr = new ChangeRegion();
    });

    describe('ChangeRegion Creation', () => {
        test('should create an empty dirty rectangle', () => {
            cr = new ChangeRegion();
            expect(cr.width).toBe(0);
            expect(cr.height).toBe(0);
            expect(cr.isEmpty).toBe(true);
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
                cr.setChange(x, y, 'state');
                expect(cr.hasChange(...expected)).toBe(true);
            });
        });

        describe('State Management', () => {
            test('should preserve initial before state', () => {
                cr.setChange(0, 0, 'after', 'before');
                cr.setChange(0, 0, 'updated');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before' }]);
                cr.setChange(0, 2, 'newpoint');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before' }, { x: 0, y: 2, state: 'newpoint' }]);
            });

            test('should update after state on subsequent calls', () => {
                cr.setChange(1, 1, 'v1');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v1' }]);

                cr.setChange(1, 1, 'v2');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v2' }]);

                cr.setChange(1, 1, 'v3');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v3' }]);
            });

            test('should order all changes old to new in before states and after states, changes map should access any change', () => {
                cr.setChange(0, 0, 'v1');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }]);
                expect(cr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }]);
                expect(cr.changesMap.get(`0,0`)) .toEqual({ x: 0, y: 0, after: 'v1', before: 'v1' });
                cr.setChange(0, 2, 'v2');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }]);
                expect(cr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }]);
                expect(cr.changesMap.get(`0,2`)) .toEqual({ x: 0, y: 2, after: 'v2', before: 'v2' });
                cr.setChange(1, 0, 'v3');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(cr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(cr.changesMap.get(`1,0`)) .toEqual({ x: 1, y: 0, after: 'v3', before: 'v3' });
                cr.setChange(0, 0, 'v4');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'v1' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(cr.afterStates) .toEqual([{ x: 0, y: 0, state: 'v4' }, { x: 0, y: 2, state: 'v2' }, { x: 1, y: 0, state: 'v3' }]);
                expect(cr.changesMap.get(`0,0`)) .toEqual({ x: 0, y: 0, after: 'v4', before: 'v1' });
                expect(cr.changesMap.get(`0,2`)) .toEqual({ x: 0, y: 2, after: 'v2', before: 'v2' });
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

                cr = createRectWithChanges(changes);
                expect(cr.bounds).toEqual(expectedBounds);
            });
        });
    });

    describe('ChangeRegion Manipulation', () => {

        describe('Cloning', () => {
            test('should produce independent copy', () => {
                cr.setChange(0, 0, 'original');
                const clone = cr.clone();

                // Test independence
                clone.setChange(1, 1, 'new');
                cr.setChange(2, 2, 'different');

                expect(clone.hasChange(2, 2)).toBe(false);
                expect(cr.hasChange(1, 1)).toBe(false);
            });

            test('should preserve all properties', () => {
                cr.setChange(1, 2, 'state');
                const clone = cr.clone();

                expect(clone.afterStates).toEqual(cr.afterStates);
                expect(clone.bounds).toEqual(cr.bounds);
            });
        });

        describe('Merging', () => {
            test('should merge overlapping pixels correctly', () => {
                const cr1 = new ChangeRegion();
                cr1.setChange(0, 0, 'cr1-after', 'cr1-before');

                const cr2 = new ChangeRegion();
                cr2.setChange(0, 0, 'cr2-after', 'cr2-before');

                let merge = cr1.merge(cr2);

                expect(merge.afterStates).toEqual([{ x: 0, y: 0, state: 'cr2-after' }]);
                expect(merge.beforeStates).toEqual([{ x: 0, y: 0, state: 'cr1-before' }]);
            });

            test('should expand bounds to include both rects', () => {
                const cr1 = new ChangeRegion();
                cr1.setChange(0, 0, 'state');

                const cr2 = new ChangeRegion();
                cr2.setChange(5, 5, 'state');

                let merge = cr1.merge(cr2);
                expect(merge.bounds).toEqual({ x0: 0, y0: 0, x1: 5, y1: 5 });
            });
        });
    });
});
