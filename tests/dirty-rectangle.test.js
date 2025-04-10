import DirtyRectangle from './../scripts/dirty-rectangle.js';

describe('DirtyRectangle', () => {
    describe('constructor', () => {
        test('initializes with default options', () => {
            const dr = new DirtyRectangle();
            expect(dr.stateType).toBe(Object);
            expect(dr._strictTypes).toBe(false);
        });

        test('applies custom options', () => {
            class CustomState { }
            const dr = new DirtyRectangle({
                stateType: CustomState,
                strictTypes: true,
            });
            expect(dr.stateType).toBe(CustomState);
            expect(dr._strictTypes).toBe(true);
        });
    });

    describe('addChange', () => {
        let dr;

        beforeEach(() => {
            dr = new DirtyRectangle(); // Reset before each test
        });

        test('floors coordinates', () => {
            dr.addChange(1.2, 2.7, 'red');
            expect(dr.hasChange(1, 2)).toBe(true);
        });

        test('throws error on invalid state types when strict', () => {
            class CustomState { }
            const strictDR = new DirtyRectangle({
                stateType: CustomState,
                strictTypes: true,
            });
            expect(() => strictDR.addChange(0, 0, 'invalid')).toThrow(TypeError);
        });

        test('updates bounds for new changes', () => {
            dr.addChange(1, 1, 'red');
            dr.addChange(3, 3, 'blue');
            dr.addChange(5, 2, 'blue');
            expect(dr.bounds).toEqual({ x0: 1, y0: 1, x1: 5, y1: 3 });
        });

        test('keeps original before state, and the last after state', () => {
            dr.addChange(0, 0, 'after', 'before');
            dr.addChange(0, 0, 'new after');
            const change = dr._changes.get('0,0');
            expect(change.before).toBe('before');
            expect(change.after).toBe('new after');
        });
    });

    describe('getAfterStates and getBeforeStates', () => {
        test('returns current and original states', () => {
            const dr = new DirtyRectangle();
            dr.addChange(0, 0, 'after', 'before');
            dr.addChange(0, 0, 'updated');

            expect(dr.getAfterStates()).toEqual([{ x: 0, y: 0, state: 'updated' }]);
            expect(dr.getBeforeStates()).toEqual([{ x: 0, y: 0, state: 'before' }]);
        });
    });

    describe('merge', () => {
        test('combines changes from another instance', () => {
            const dr1 = new DirtyRectangle();
            dr1.addChange(0, 0, 'red');

            const dr2 = new DirtyRectangle();
            dr2.addChange(1, 1, 'blue');

            dr1.merge(dr2);
            expect(dr1.hasChange(0, 0)).toBe(true);
            expect(dr1.hasChange(1, 1)).toBe(true);
            expect(dr1.bounds).toEqual({ x0: 0, y0: 0, x1: 1, y1: 1 });
        });
    });

    describe('clone', () => {
        test('creates a shallow copy', () => {
            const original = new DirtyRectangle();
            original.addChange(0, 0, 'red');
            const clone = original.clone();

            expect(clone.getAfterStates()).toEqual(original.getAfterStates());
            clone.addChange(1, 1, 'blue');
            expect(original.hasChange(1, 1)).toBe(false);
        });
    });

    describe('reset', () => {
        test('clears all changes and resets bounds', () => {
            const dr = new DirtyRectangle();
            dr.addChange(0, 0, 'red');
            dr.reset();

            expect(dr.isEmpty).toBe(true);
            expect(dr.bounds.x0).toBe(Infinity);
        });
    });

    describe('hasChange', () => {
        test('checks if a coordinate is modified', () => {
            const dr = new DirtyRectangle();
            dr.addChange(5, 5, 'red');
            expect(dr.hasChange(5, 5)).toBe(true);
        });
    });

    describe('isEmpty', () => {
        test('returns true when no changes', () => {
            const dr = new DirtyRectangle();
            expect(dr.isEmpty).toBe(true);
        });
    });

    describe('bounds calculations', () => {
        test('calculates width and height', () => {
            const dr = new DirtyRectangle();
            dr.addChange(1, 2, 'red');
            dr.addChange(4, 6, 'blue');
            expect(dr.width).toBe(4); // (4 - 1 + 1) = 4
            expect(dr.height).toBe(5); // (6 - 2 + 1) = 5
        });
    });
});
