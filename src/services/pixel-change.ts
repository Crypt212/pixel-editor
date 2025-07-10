import ChangeSystem, { ChangeState } from "@src/generics/change-system.js";
import { PixelCoord, PixelRectangleBounds, PixelState } from "@src/types/pixel-types.js";
import Color from "@src/services/color.js";

/**
 * Tracks pixel modifications with boundary detection.
 * Extends ChangeSystem with pixel-specific optimizations:
 * - Automatic bounds calculation for changed areas
 * - Color-specific comparison logic
 * 
 * @property {PixelRectangleBounds|null} bounds - Returns the minimal rectangle containing all changes
 */
export default class PixelChanges extends ChangeSystem<PixelCoord, PixelState> {

    private boundaries: PixelRectangleBounds =
        {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity
        }

    constructor() {
        super((a: PixelState, b: PixelState) => Color.isEqualTo(a.color, b.color));
    }

    mergeMutable(source: PixelChanges): this {
        super.mergeMutable(source);

        this.boundaries = {
            x0: Math.min(this.boundaries.x0, source.boundaries.x0),
            y0: Math.min(this.boundaries.y0, source.boundaries.y0),
            x1: Math.max(this.boundaries.x1, source.boundaries.x1),
            y1: Math.max(this.boundaries.y1, source.boundaries.y1),
        }

        return this;
    }

    clone(): this {
        const copy = super.clone();
        copy.boundaries = { ...this.boundaries };
        return copy;
    }

    clear() {
        super.clear();
        this.boundaries = {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity
        };
    }

    setChange(key: PixelCoord, after: PixelState, before: PixelState): ChangeState<PixelState> | null {
        const p = super.setChange(key, after, before);
        if (p !== null) {
            this.boundaries.x0 = Math.min(this.boundaries.x0, key.x);
            this.boundaries.y0 = Math.min(this.boundaries.y0, key.y);
            this.boundaries.x1 = Math.max(this.boundaries.x1, key.x);
            this.boundaries.y1 = Math.max(this.boundaries.y1, key.y);
        }
        return p;
    }

    get bounds(): PixelRectangleBounds | null {
        if (this.count === 0) return null;
        else return { ...this.boundaries };
    }
}

