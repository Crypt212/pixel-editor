import { EditorEvents } from "@src/types/ui-events.js";

export interface IToolParamList { }

export abstract class ITool {
    abstract handle(event: EditorEvents.UIEvent): void;
}
