type ChangeComparator<T> = (a: T, b: T) => boolean;

export type ChangeState<StateType> = {
    before: StateType;
    after: StateType;
}

export type ChangeRecord<KeyType, StateType> = {
    key: KeyType,
    states: ChangeState<StateType>;
}

/**
 * @class
 * Tracks modified data with before/after for history support.
 * Maintains both a Map for order and a Set for duplicate checking.
 */
export default class ChangeSystem<KeyType extends Object, StateType extends Object> {

    /**
     * A table of all changed data and its before and after states to a change record containing the position and before/after states
     * @private
     */
    private changes = new Map<KeyType, ChangeRecord<KeyType, StateType>>();

    /**
     * Function for comparing two states. If undefined, uses === comparison.
     * @private
     */
    private stateComparator: ChangeComparator<StateType>;

    /**
     * Creates a ChangeSystem instance.
     * @constructor
     * @param stateComparator - Function for comparing two states
     */
    constructor(stateComparator?: ChangeComparator<StateType>) {
        this.stateComparator = stateComparator ?? ((a, b) => a === b);
    }

    /**
     * Merges another ChangeSystem into this one (mutates this object).
     * @method
     * @param source - Source ChangeSystem to merge.
     * @returns This instance (for chaining)
     */
    mergeMutable(source: ChangeSystem<KeyType, StateType>): this {
        if (!source || source.isEmpty) return this;

        source.changes.forEach((change) => {
            this.setChange(
                change.key,
                change.states.after,
                change.states.before,
            );
        });
        return this;
    }

    /**
     * Merges another ChangeSystem into a copy of this one, and returns it.
     * @method
     * @param source - Source change system to merge.
     * @returns The result of merging
     */
    merge(source: ChangeSystem<KeyType, StateType>): this {
        const result = this.clone();
        result.mergeMutable(source);
        return result;
    }

    /**
     * Creates a shallow copy (states are not deep-cloned).
     * @method
     * @returns {ChangeSystem<StateType>} The clone
     */
    clone(): this {
        const copy = new (this.constructor as any)();

        this.changes.forEach(value => {
            copy.setChange(value.key, value.states.after, value.states.before);
        });

        copy.stateComparator = this.stateComparator;

        return copy;
    }

    /**
     * Clears the change system
     * @method
     */
    clear() {
        this.changes.clear();
    }

    /**
     * Adds or updates data modification. Coordinates are floored to integers.
     * 
     * @method
     * @param key - key of data to set change for
     * @param after - The state
     * @param before - Original state (used only on first add).
     * @returns States of change for the specfied data if still exists, null otherwise
     */
    setChange(key: KeyType, after: StateType, before: StateType): ChangeState<StateType> | null {
        let existing = this.changes.get(key);

        if (!existing) {
            if (!this.stateComparator(before, after)) {
                this.changes.set(key, {
                    key: key,
                    states: {
                        after,
                        before,
                    }
                });
            }
            return this.getChange(key);
        } else {
            existing.states.after = after;
            if (this.stateComparator(existing.states.before, existing.states.after)) this.changes.delete(key);
            return this.getChange(key);
        }
    }

    /**
     * returns an object containing the before and after states if data has been modified, null otherwise.
     * @method
     * @param key - key of the data to get change for
     * @returns ChangeState if data has been modified, null otherwise
     */
    getChange(key: KeyType): ChangeState<StateType> | null {
        const change = this.changes.get(key);
        if (!change) return null;
        return { before: change.states.before, after: change.states.after };
    }

    /**
     * Returns whether the change system is empty.
     * @method
     * @returns {boolean}
     */
    get isEmpty(): boolean {
        return this.changes.size === 0;
    }

    /**
     * Gets keys of the changes.
     * @method
     * @returns An array containing keys for all changed data
     */
    get keys(): KeyType[] {
        return Array.from(this.changes.values())
            .map((cd: ChangeRecord<KeyType, StateType>) => cd.key);
    }

    /**
     * Gets before and after states of the changes.
     * @method
     * @returns An array containing states for all changed data
     */
    get states(): ChangeState<StateType>[] {
        return Array.from(this.changes.values())
            .map((cd: ChangeRecord<KeyType, StateType>) => cd.states);
    }

    /**
     * Gets an iterator of changes before and after states.
     * @method
     * @returns An iterator containing changed data and its states for all changed data
     */
    [Symbol.iterator](): IterableIterator<ChangeRecord<KeyType, StateType>> {
        return this.changes.values();
    }

    /**
     * Returns number of changes
     * @method
     * @returns The number of changes
     */
    get count(): number {
        return this.changes.size;
    }
}
