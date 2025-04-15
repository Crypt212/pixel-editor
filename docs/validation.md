## Functions

<dl>
<dt><del><a href="#validateColorArray">validateColorArray(color)</a> ⇒ <code>boolean</code></del></dt>
<dd><p>Validates the color array.</p>
</dd>
<dt><a href="#validateNumber">validateNumber(number, varName, Contains, start, end, integerOnly)</a></dt>
<dd><p>Validates the number to be valid number between start and end inclusive.</p>
</dd>
</dl>

<a name="validateColorArray"></a>

## ~~validateColorArray(color) ⇒ <code>boolean</code>~~
***use the Color class instead***

Validates the color array.

**Kind**: global function  
**Returns**: <code>boolean</code> - - Returns true if the color array is valid, otherwise false.  
**Throws**:

- <code>TypeError</code> Throws an error if the color is invalid.


| Param | Type | Description |
| --- | --- | --- |
| color | <code>Array.&lt;number&gt;</code> | The color array [red, green, blue, alpha] to validate. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| 0 | <code>number</code> | Red (0-255) |
| 1 | <code>number</code> | Green (0-255) |
| 2 | <code>number</code> | Blue (0-255) |

<a name="validateNumber"></a>

## validateNumber(number, varName, Contains, start, end, integerOnly)
Validates the number to be valid number between start and end inclusive.

**Kind**: global function  
**Throws**:

- <code>TypeError</code> Throws an error if the number type, name type or options types is invalid.
- <code>TypeError</code> Throws an error if start and end are set but start is higher than end.
- <code>RangeError</code> Throws an error if the number is not in the specified range.


| Param | Type | Description |
| --- | --- | --- |
| number | <code>number</code> | The number to validate. |
| varName | <code>string</code> | The variable name to show in the error message which will be thrown. |
| Contains | <code>Object</code> | some optional constraints: max/min limits, and if the number is integer only |
| start | <code>number</code> \| <code>undefined</code> | The minimum of valid range, set to null to omit the constraint. |
| end | <code>number</code> \| <code>undefined</code> | The maximum of valid range, set to null to omit the constraint. |
| integerOnly | <code>boolean</code> | Specifies if the number must be an integer. |

