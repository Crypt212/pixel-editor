<a name="HistorySystem"></a>

## HistorySystem
Represents a circular buffer-based history system for undo/redo operations.
Tracks action groups containing arbitrary action data with shallow copying.

Key Features:
- Fixed-capacity circular buffer (1-64 actions)
- Atomic action grouping
- Shallow copy data storage
- Undo/redo functionality
- Action metadata (names/IDs)

**Kind**: global class  

* [HistorySystem](#HistorySystem)
    * [new HistorySystem(capacity)](#new_HistorySystem_new)
    * [.getBufferSize](#HistorySystem+getBufferSize) : <code>number</code>
    * [.getBufferCapacity](#HistorySystem+getBufferCapacity) : <code>number</code>
    * [.addActionGroup([actionGroupName])](#HistorySystem+addActionGroup)
    * [.addActionData(actionDataObject)](#HistorySystem+addActionData)
    * [.getActionGroupID([offset])](#HistorySystem+getActionGroupID) ⇒ <code>number</code>
    * [.getActionGroupName([offset])](#HistorySystem+getActionGroupName) ⇒ <code>string</code> \| <code>number</code>
    * [.getActionData([offset])](#HistorySystem+getActionData) ⇒ <code>Array</code> \| <code>number</code>
    * [.undo()](#HistorySystem+undo) ⇒ <code>number</code>
    * [.redo()](#HistorySystem+redo) ⇒ <code>number</code>

<a name="new_HistorySystem_new"></a>

### new HistorySystem(capacity)
Creates a new HistorySystem with specified capacity

**Throws**:

- <code>TypeError</code> If capacity is not an integer
- <code>RangeError</code> If capacity is outside 1-64 range


| Param | Type | Description |
| --- | --- | --- |
| capacity | <code>number</code> | Maximum stored action groups (1-64) |

**Example**  
```js
const history = new HistorySystem(10);
history.addActionGroup("Paint");
history.addActionData({x: 1, y: 2, color: "#FF0000"});
history.undo(); // Reverts to previous state
```
<a name="HistorySystem+getBufferSize"></a>

### historySystem.getBufferSize : <code>number</code>
Current number of stored action groups

**Kind**: instance property of [<code>HistorySystem</code>](#HistorySystem)  
**Read only**: true  
<a name="HistorySystem+getBufferCapacity"></a>

### historySystem.getBufferCapacity : <code>number</code>
Maximum number of storable action groups

**Kind**: instance property of [<code>HistorySystem</code>](#HistorySystem)  
**Read only**: true  
<a name="HistorySystem+addActionGroup"></a>

### historySystem.addActionGroup([actionGroupName])
Adds a new named action group to the history

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Throws**:

- <code>TypeError</code> If name is not a string


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [actionGroupName] | <code>string</code> | <code>&quot;\&quot;\&quot;&quot;</code> | Descriptive name for the action group |

<a name="HistorySystem+addActionData"></a>

### historySystem.addActionData(actionDataObject)
Adds data to the current action group (with shallow copying)

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Throws**:

- <code>Error</code> If no active action group exists


| Param | Type | Description |
| --- | --- | --- |
| actionDataObject | <code>any</code> | Data to store (objects/arrays are shallow copied) |

**Example**  
```js
Stores a copy of the object
history.addActionData({x: 1, y: 2});
```
<a name="HistorySystem+getActionGroupID"></a>

### historySystem.getActionGroupID([offset]) ⇒ <code>number</code>
Retrieves action group ID at an offset from current selected group

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Returns**: <code>number</code> - The action group ID, or -1 if not in range.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [offset] | <code>number</code> | <code>0</code> | The the offset from the current group for which ID gets returned |

<a name="HistorySystem+getActionGroupName"></a>

### historySystem.getActionGroupName([offset]) ⇒ <code>string</code> \| <code>number</code>
Retrieves action group name at an offset from current selected group

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Returns**: <code>string</code> \| <code>number</code> - The action group name, or -1 if not in range.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [offset] | <code>number</code> | <code>0</code> | The the offset from the current group for which name gets returned |

<a name="HistorySystem+getActionData"></a>

### historySystem.getActionData([offset]) ⇒ <code>Array</code> \| <code>number</code>
Retrieves action group data at an offset from current selected group

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Returns**: <code>Array</code> \| <code>number</code> - An array containing the action group data, or -1 if not in range  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [offset] | <code>number</code> | <code>0</code> | The the offset from the current group for which data gets returned |

<a name="HistorySystem+undo"></a>

### historySystem.undo() ⇒ <code>number</code>
Moves backward in history (undo)

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Returns**: <code>number</code> - ID of the restored action group (-1 at start)  
<a name="HistorySystem+redo"></a>

### historySystem.redo() ⇒ <code>number</code>
Moves forward in history (redo)

**Kind**: instance method of [<code>HistorySystem</code>](#HistorySystem)  
**Returns**: <code>number</code> - ID of the restored action group (-1 at end)  
