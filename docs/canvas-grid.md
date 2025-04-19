## Classes

<dl>
<dt><a href="#CanvasGrid">CanvasGrid</a></dt>
<dd><p>Represents a canvas grid system</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Pixel">Pixel</a></dt>
<dd></dd>
</dl>

<a name="CanvasGrid"></a>

## CanvasGrid
Represents a canvas grid system

**Kind**: global class  

* [CanvasGrid](#CanvasGrid)
    * [new CanvasGrid([width], [height])](#new_CanvasGrid_new)
    * [.initializeBlankCanvas(width, height)](#CanvasGrid+initializeBlankCanvas)
    * [.loadImage(imageData, [x], [y])](#CanvasGrid+loadImage)
    * [.resetChangeBuffer()](#CanvasGrid+resetChangeBuffer) ⇒ <code>DirtyRectangle</code>
    * [.setColor(x, y, color, options)](#CanvasGrid+setColor)
    * [.get(x, y)](#CanvasGrid+get) ⇒ [<code>Pixel</code>](#Pixel)
    * [.getColor(x, y)](#CanvasGrid+getColor) ⇒ <code>Color</code>
    * [.changeBuffer()](#CanvasGrid+changeBuffer) ⇒ <code>DirtyRectangle</code>
    * [.width()](#CanvasGrid+width) ⇒ <code>number</code>
    * [.height()](#CanvasGrid+height) ⇒ <code>number</code>

<a name="new_CanvasGrid_new"></a>

### new CanvasGrid([width], [height])
Creates a blank canvas with specified width and height

**Throws**:

- <code>TypeError</code> If width or height are not integers
- <code>RangeError</code> If width or height are not between 1 and 1024 inclusive


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [width] | <code>number</code> | <code>1</code> | The width of the grid |
| [height] | <code>number</code> | <code>1</code> | The height of the grid |

<a name="CanvasGrid+initializeBlankCanvas"></a>

### canvasGrid.initializeBlankCanvas(width, height)
Initializes the canvas with a blank grid of transparent pixel data

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Throws**:

- <code>TypeError</code> If width or height are not integers
- <code>RangeError</code> If width or height are not between 1 and 1024 inclusive


| Param | Type | Description |
| --- | --- | --- |
| width | <code>number</code> | The width of the grid |
| height | <code>number</code> | The height of the grid |

<a name="CanvasGrid+loadImage"></a>

### canvasGrid.loadImage(imageData, [x], [y])
Loads an image data at (x, y) position

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Throws**:

- <code>TypeError</code> if x or y are not integers
- <code>TypeError</code> if imageData is not instance of class ImageData


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| imageData | <code>ImageData</code> |  | The image to be loaded |
| [x] | <code>number</code> | <code>0</code> | X-coordinate |
| [y] | <code>number</code> | <code>0</code> | Y-coordinate |

<a name="CanvasGrid+resetChangeBuffer"></a>

### canvasGrid.resetChangeBuffer() ⇒ <code>DirtyRectangle</code>
Resets changes buffer to be empty

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: <code>DirtyRectangle</code> - Change buffer before emptying  
<a name="CanvasGrid+setColor"></a>

### canvasGrid.setColor(x, y, color, options)
Sets color to pixel at position (x, y).

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Throws**:

- <code>TypeError</code> if validate is true and if color is not a valid Color object
- <code>TypeError</code> if validate is true and if x and y are not valid integers in valid range.
- <code>RangeError</code> if validate is true and if x and y are not in valid range.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | X-coordinate. |
| y | <code>number</code> |  | X-coordinate. |
| color | <code>Color</code> |  | The Color object to be set |
| options | <code>Object</code> |  | An object containing additional options. |
| [options.quietly] | <code>boolean</code> | <code>false</code> | If set to true, the pixel data at which color changed will not be pushed to the changeBuffers array. |
| [options.validate] | <code>boolean</code> | <code>true</code> | If set to true, the x, y, and color types are validated. |

<a name="CanvasGrid+get"></a>

### canvasGrid.get(x, y) ⇒ [<code>Pixel</code>](#Pixel)
Returns pixel data at position (x, y)

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: [<code>Pixel</code>](#Pixel) - Pixel data at position (x, y)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate |
| y | <code>number</code> | Y-coordinate |

<a name="CanvasGrid+getColor"></a>

### canvasGrid.getColor(x, y) ⇒ <code>Color</code>
Returns pixel color at position (x, y)

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: <code>Color</code> - Color object of pixel at position (x, y)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate |
| y | <code>number</code> | Y-coordinate |

<a name="CanvasGrid+changeBuffer"></a>

### canvasGrid.changeBuffer() ⇒ <code>DirtyRectangle</code>
Returns copy of change buffer

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: <code>DirtyRectangle</code> - Copy of change buffer  
<a name="CanvasGrid+width"></a>

### canvasGrid.width() ⇒ <code>number</code>
Returns the width of the canvas

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: <code>number</code> - The width of the canvas  
<a name="CanvasGrid+height"></a>

### canvasGrid.height() ⇒ <code>number</code>
Returns the height of the canvas

**Kind**: instance method of [<code>CanvasGrid</code>](#CanvasGrid)  
**Returns**: <code>number</code> - The height of the canvas  
<a name="Pixel"></a>

## Pixel
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate |
| y | <code>number</code> | Y-coordinate |
| color | <code>Color</code> | Color of the pixel |

