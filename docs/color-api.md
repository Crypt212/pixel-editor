<a name="Color"></a>

## Color
A comprehensive color class supporting Hex, RGB(A), and HSL(A) formats
with conversion, mixing, and comparison capabilities.

**Kind**: global class  

* [Color](#Color)
    * [new Color(color, [mode])](#new_Color_new)
    * [.mix(color, [weight], [mode])](#Color+mix) ⇒ [<code>Color</code>](#Color)
    * [.isSimilarTo(color, [tolerance], [includeAlpha])](#Color+isSimilarTo) ⇒ <code>boolean</code>
    * [.isEqualTo(color, [includeAlpha])](#Color+isEqualTo) ⇒ <code>boolean</code>
    * [.rgb(rgba)](#Color+rgb) ⇒ <code>this</code>
    * [.hsl(hsl)](#Color+hsl) ⇒ <code>this</code>
    * [.hex(color)](#Color+hex) ⇒ <code>this</code>
    * [.alpha(alpha)](#Color+alpha) ⇒ [<code>Color</code>](#Color)
    * [.rgb()](#Color+rgb) ⇒ <code>Array.&lt;number&gt;</code>
    * [.hex()](#Color+hex) ⇒ <code>string</code>
    * [.hsl()](#Color+hsl) ⇒ <code>Array.&lt;number&gt;</code>
    * [.alpha()](#Color+alpha) ⇒ <code>number</code>

<a name="new_Color_new"></a>

### new Color(color, [mode])
Creates a Color instance from various formats

**Throws**:

- <code>TypeError</code> If mode is not a valid mode string  ("rgb", "hsl", "hex" or "copy")
- <code>TypeError</code> If color is not of valid format (Hex, RGB/A, HSL/A, or Color instance)


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| color | <code>string</code> \| <code>Array.&lt;number&gt;</code> \| [<code>Color</code>](#Color) |  | Input color (Hex, RGB/A, HSL/A, or Color instance) |
| [mode] | <code>string</code> | <code>null</code> | Interpretation mode for the color parameter ("rgb", "hsl", "hex" or "copy"), if null, it's auto-detected, if possible (if given color is an array, its ambiguous, "rgb" or "hsl"?) |

**Example**  
```js
new Color("#FF0000", "hex") // Hex
new Color([255, 0, 0], "rgb") // RGB
new Color([360, 100, 50], "hsl") // HSL
new Color(new Color([255, 0, 0]), "copy") // Copy other color
```
<a name="Color+mix"></a>

### color.mix(color, [weight], [mode]) ⇒ [<code>Color</code>](#Color)
Mixes two colors with optional weighting and color space

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: [<code>Color</code>](#Color) - The resulting new mixed color  
**Throws**:

- <code>TypeError</code> If mode is not a valid mode string ("rgb" or "hsl")
- <code>TypeError</code> If color is an not instance of Color class


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| color | [<code>Color</code>](#Color) |  | The second color to mix with |
| [weight] | <code>number</code> | <code>0.5</code> | The mixing ratio (0-1) |
| [mode] | <code>string</code> | <code>&quot;&#x27;rgb&#x27;&quot;</code> | The blending mode ('rgb' or 'hsl') |

<a name="Color+isSimilarTo"></a>

### color.isSimilarTo(color, [tolerance], [includeAlpha]) ⇒ <code>boolean</code>
Checks if colors are visually similar within tolerance

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>boolean</code> - Whether the two colors are visually similar within the given tolerance  
**Throws**:

- <code>TypeError</code> If color is an not instance of Color class


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| color | [<code>Color</code>](#Color) |  | The color to compare the first with |
| [tolerance] | <code>number</code> | <code>5</code> | The allowed maximum perceptual distance (0-442) |
| [includeAlpha] | <code>boolean</code> | <code>true</code> | Whether to compare the alpha channel |

<a name="Color+isEqualTo"></a>

### color.isEqualTo(color, [includeAlpha]) ⇒ <code>boolean</code>
Checks exact color equality (with optional alpha)

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>boolean</code> - Whether the two colors are equal  
**Throws**:

- <code>TypeError</code> If color is an not instance of Color class


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| color | [<code>Color</code>](#Color) |  | the color to compare with |
| [includeAlpha] | <code>boolean</code> | <code>true</code> | Whether to compare the alpha channel |

<a name="Color+rgb"></a>

### color.rgb(rgba) ⇒ <code>this</code>
Set color from RGB values

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>this</code> - The current color object  
**Throws**:

- <code>TypeError</code> If color is not a valid array of 3 number values
- <code>RangeError</code> If r, g or b values are out of range


| Param | Type | Description |
| --- | --- | --- |
| rgba | <code>Array.&lt;number&gt;</code> | A 3-D array containing the color values [r, g, b] (0-255) |

<a name="Color+hsl"></a>

### color.hsl(hsl) ⇒ <code>this</code>
Sets color from HSL values

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>this</code> - The current color object  
**Throws**:

- <code>TypeError</code> If color is not a valid array of 3 number values
- <code>RangeError</code> If saturation or lightness are out of bounds (0-100)


| Param | Type | Description |
| --- | --- | --- |
| hsl | <code>Array.&lt;number&gt;</code> | A 3-D array containing the hue values of the color [hue(any number will wrap down to 0-360), saturation(0-100), lightness(0-100)] |

<a name="Color+hex"></a>

### color.hex(color) ⇒ <code>this</code>
Set color from hex string

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>this</code> - The current color object  
**Throws**:

- <code>TypeError</code> If color is not a supported hex format


| Param | Type | Description |
| --- | --- | --- |
| color | <code>string</code> | Hex string, Supported formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA |

<a name="Color+alpha"></a>

### color.alpha(alpha) ⇒ [<code>Color</code>](#Color)
Sets the alpha value of the color

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: [<code>Color</code>](#Color) - The current color object  
**Throws**:

- <code>TypeError</code> If alpha is not a number
- <code>RangeError</code> If alpha is not in range (0.0-1.0)


| Param | Type | Description |
| --- | --- | --- |
| alpha | <code>number</code> | the alpha value (0.0-1.0) |

<a name="Color+rgb"></a>

### color.rgb() ⇒ <code>Array.&lt;number&gt;</code>
Retrieves RGB values into an array

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>Array.&lt;number&gt;</code> - A 3-D array containing the rgb values of the color [r, g, b] (r/g/b: 0-255);  
<a name="Color+hex"></a>

### color.hex() ⇒ <code>string</code>
Retrieves Hex values into a string, ex. "#ff0000"

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>string</code> - A hex string representing the color [6 digits if no transparency, 8 digits otherwise]  
<a name="Color+hsl"></a>

### color.hsl() ⇒ <code>Array.&lt;number&gt;</code>
Retrieves HSL values into an array

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>Array.&lt;number&gt;</code> - A 3-D array containing the hsl values of the color [h, s, l] (h: 0-360, s/l: 0-100)  
<a name="Color+alpha"></a>

### color.alpha() ⇒ <code>number</code>
Retrieves alpha channel value

**Kind**: instance method of [<code>Color</code>](#Color)  
**Returns**: <code>number</code> - A 3-D array containing the hsl values of the color [h, s, l] (h: 0-360, s/l: 0-100)  
