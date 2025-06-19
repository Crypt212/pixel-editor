import PixelChanges from '#services/pixel-changes.js';

describe('PixelChanges', () => {

    let cr;

    const createRectWithChanges = (changes) => {
        const cr = new PixelChanges();
        changes.forEach(([x, y, after, before]) =>
            cr.setChange(x, y, after, before));
        return cr;
    };

    beforeEach(() => {
        cr = new PixelChanges();
    });

    describe('PixelChanges Creation', () => {
        test('should create an empty dirty rectangle', () => {
            cr = new PixelChanges();
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
                cr.setChange(x, y, "new" + x, "old" + y);
                expect(cr.getChange(...expected)).toEqual({before: "old" + y, after: "new" + x});
            });
        });

        describe('State Management', () => {
            test('should preserve initial before state', () => {
                cr.setChange(0, 0, 'after1', 'before1');
                cr.setChange(0, 0, 'updated1');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before1' }]);
                cr.setChange(0, 2, 'after2', 'before2');
                expect(cr.beforeStates).toEqual([{ x: 0, y: 0, state: 'before1' }, { x: 0, y: 2, state: 'before2' }]);
            });

            test('should update after state on subsequent calls', () => {
                cr.setChange(1, 1, 'v1', 'v0');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v1' }]);

                cr.setChange(1, 1, 'v2');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v2' }]);

                cr.setChange(1, 1, 'v3');
                expect(cr.afterStates).toEqual([{ x: 1, y: 1, state: 'v3' }]);
            });
        });

    });

    describe('PixelChanges Manipulation', () => {

        describe('Change Negation', () => {
            test('should remove change if after state is the same as before state', () => {
                cr.setChange(0, 0, 'original', 'original');
                expect(cr.getChange(0, 0)).toBe(null);
                cr.setChange(0, 0, 'new', 'original');
                expect(cr.getChange(0, 0)).toEqual({before: "original", after: "new"});
                cr.setChange(0, 0, 'original');
                expect(cr.getChange(0, 0)).toBe(null);
            })
        });

        describe('Cloning', () => {
            test('should produce independent copy', () => {
                let equalTo = (a, b) => {
                    if (a.length !== b.length) return false;
                    for (let i = 0; i < a.length; i++)
                        if (a[i] !== b[i]) return false;
                    return true;
                };

                let cr1 = new PixelChanges(equalTo);
                cr1.setChange(0, 0, [1, 2, 4, 5], [5, 3]);
                const cr2 = cr1.clone();

                cr2.setChange(0, 0, [5, 3]); // should remove change because it's equal to the original
                expect(cr1.getChange(0, 0)).toEqual({ after: [1, 2, 4, 5], before: [5, 3] });
                expect(cr2.getChange(0, 0)).toEqual(null);

                // Test independence
                cr2.setChange(1, 1, [3, 1], []);
                cr1.setChange(2, 2, [5, 4], []);

                expect(cr2.getChange(2, 2)).toEqual({ after: [3, 1], before: [] });
                expect(cr1.getChange(1, 1)).toEqual({ after: [5, 4], before: [] });
            });

            test('should preserve all properties', () => {
                cr.setChange(1, 2, 'state');
                const clone = cr.clone();

                expect(clone.afterStates).toEqual(cr.afterStates);
            });
        });

        describe('Merging', () => {
            test('should merge overlapping pixels correctly', () => {
                const cr1 = new PixelChanges();
                cr1.setChange(0, 0, 'cr1-after', 'cr1-before');

                const cr2 = new PixelChanges();
                cr2.setChange(0, 0, 'cr2-after', 'cr2-before');

                let merge = cr1.merge(cr2);

                expect(merge.afterStates).toEqual([{ x: 0, y: 0, state: 'cr2-after' }]);
                expect(merge.beforeStates).toEqual([{ x: 0, y: 0, state: 'cr1-before' }]);
            });

            test('should merge into the calling object without creating new one if called in-place merge', () => {
                const cr1 = new PixelChanges();
                cr1.setChange(0, 0, 'state1');

                const cr2 = new PixelChanges();
                cr2.setChange(5, 5, 'state2');

                cr1.mergeInPlace(cr2);
                expect(cr1.getChange(0, 0)).toEqual({ before: 'state1', after: 'state1' });
                expect(cr1.getChange(5, 5)).toEqual({ before: 'state2', after: 'state2' });
                expect(cr1.length).toEqual(2);
            });
        });
    });
});
