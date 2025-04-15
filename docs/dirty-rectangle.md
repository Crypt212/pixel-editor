<a name="DirtyRectangle"></a>

## DirtyRectangle
Tracks modified pixel regions with ordered history support.
Maintains both a Map for order and a Set for duplicate checking.

**Kind**: global class  

* [DirtyRectangle](#DirtyRectangle)
    * [new DirtyRectangle()](#new_DirtyRectangle_new)
    * [.merge(source)](#DirtyRectangle+merge) ⇒ [<code>DirtyRectangle</code>](#DirtyRectangle)
    * [.clone()](#DirtyRectangle+clone) ⇒ [<code>DirtyRectangle</code>](#DirtyRectangle)
    * [.setChange(x, y, after, [before])](#DirtyRectangle+setChange)
    * [.hasChange(x, y)](#DirtyRectangle+hasChange) ⇒ <code>boolean</code>
    * [.isEmpty()](#DirtyRectangle+isEmpty) ⇒ <code>boolean</code>
    * [.width()](#DirtyRectangle+width) ⇒ <code>number</code>
    * [.height()](#DirtyRectangle+height) ⇒ <code>number</code>
    * [.afterStates()](#DirtyRectangle+afterStates) ⇒ <code>Array.&lt;{x: number, y: number, state: any}&gt;</code>
    * [.beforeStates()](#DirtyRectangle+beforeStates) ⇒ <code>Array.&lt;{x: number, y: number, state: any}&gt;</code>
    * [.changes()](#DirtyRectangle+changes) ⇒ <code>Map.&lt;string, {x: number, y: number, before: any, after: any}&gt;</code>
    * [.bounds()](#DirtyRectangle+bounds) ⇒ <code>Object</code>

<a name="new_DirtyRectangle_new"></a>

### new DirtyRectangle()
Creates a DirtyRectangle instance.

<a name="DirtyRectangle+merge"></a>

### dirtyRectangle.merge(source) ⇒ [<code>DirtyRectangle</code>](#DirtyRectangle)
Merges another DirtyRectangle into a copy of this one, and returns it.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
**Returns**: [<code>DirtyRectangle</code>](#DirtyRectangle) - The result of merging  

| Param | Type | Description |
| --- | --- | --- |
| source | [<code>DirtyRectangle</code>](#DirtyRectangle) | Source rectangle to merge. |

<a name="DirtyRectangle+clone"></a>

### dirtyRectangle.clone() ⇒ [<code>DirtyRectangle</code>](#DirtyRectangle)
Creates a shallow copy (states are not deep-cloned).

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
**Returns**: [<code>DirtyRectangle</code>](#DirtyRectangle) - The clone  
<a name="DirtyRectangle+setChange"></a>

### dirtyRectangle.setChange(x, y, after, [before])
Adds or updates a pixel modification. Coordinates are floored to integers.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | X-coordinate (floored). |
| y | <code>number</code> |  | Y-coordinate (floored). |
| after | <code>any</code> |  | New state. |
| [before] | <code>any</code> | <code>after</code> | Original state (used only on first add). |

<a name="DirtyRectangle+hasChange"></a>

### dirtyRectangle.hasChange(x, y) ⇒ <code>boolean</code>
Checks if a pixel has been modified.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate. |
| y | <code>number</code> | Y-coordinate. |

<a name="DirtyRectangle+isEmpty"></a>

### dirtyRectangle.isEmpty() ⇒ <code>boolean</code>
Returns whether the rectangle is empty.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+width"></a>

### dirtyRectangle.width() ⇒ <code>number</code>
Width of the bounding rectangle.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+height"></a>

### dirtyRectangle.height() ⇒ <code>number</code>
Height of the bounding rectangle.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+afterStates"></a>

### dirtyRectangle.afterStates() ⇒ <code>Array.&lt;{x: number, y: number, state: any}&gt;</code>
Gets current modified states.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+beforeStates"></a>

### dirtyRectangle.beforeStates() ⇒ <code>Array.&lt;{x: number, y: number, state: any}&gt;</code>
Gets original states before modification.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+changes"></a>

### dirtyRectangle.changes() ⇒ <code>Map.&lt;string, {x: number, y: number, before: any, after: any}&gt;</code>
Map for all changes (in insertion order). ['x,y' -> change]

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
<a name="DirtyRectangle+bounds"></a>

### dirtyRectangle.bounds() ⇒ <code>Object</code>
Bounding rectangle of all changes.

**Kind**: instance method of [<code>DirtyRectangle</code>](#DirtyRectangle)  
