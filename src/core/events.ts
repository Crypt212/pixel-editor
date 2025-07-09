import Color from "@src/services/color.js";
import EventEmitter from "@src/services/event-emitter.js";
import { EditorEvents } from "@src/types/ui-events.js";
import { ToolName } from "./managers/tool-manager.js";

export interface AppEvents {
    'canvas:interacted': {
        event: EditorEvents.UIEvent;
    },
    'canvas:modified': {
        modifiedRegion: DOMRectReadOnly;
    },
    'canvas:zoomed': {
        delta: number,
        centerX: number,
        centerY: number
    },
    'canvas:undone': {
        key: string,
    },
    'canvas:redone': {
        key: string,
    },

    "palette:color-added": {
        color: Color,
    },
    "palette:color-chose": {
        color: Color,
    },

    "dual-selector:colors-switched": {
    },
    "dual-selector:colors-swapped": {
    },
    "dual-selector:colors-reset": {
    },

    "tool-bar:tool-selected": {
        toolName: ToolName,
    },
}

export type AppEventEmitter = EventEmitter<AppEvents>;
