import { PixelCoord } from "./pixel-types.js";

export namespace EditorEvents {
    type UIEvent = { 
        type: 'mouse' | 'key';
    }

    type MouseEventNames  = "mousemove" | "mouseup" | "mousedown" | "mouseenter" | "mouseleave";
    type KeyEventName  = "keyup" | "keydown";

    type MouseEvent =  UIEvent & {
        type: 'mouse';
        name: MouseEventNames,
        pos: PixelCoord,
    }

    type KeyEvent = UIEvent & {
        type: 'key';
        name: KeyEventName,
        key: string,
    }
}
