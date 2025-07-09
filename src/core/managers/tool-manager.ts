import { EditorEvents } from "@src/types/ui-events.js";
import { ITool } from "../tools/intefaces/tool.js";
import EraserTool from "../tools/implementations/eraser-tool.js";
import BucketTool from "../tools/implementations/bucket-tool.js";
import { IServiceConfigurations, IToolConfigurations } from "../tools/intefaces/config.js";
import LineTool from "../tools/implementations/line-tool.js";
import PencilTool from "../tools/implementations/pencil-tool.js";

export type ToolName = keyof IToolConfigurations;
export type ConfigName = keyof (IServiceConfigurations & IToolConfigurations);

/**
 * Class for managing the canvas tools and their functionalities
 * @class
 */
export default class ToolManager {
    private tool: ITool | null = null;
    private toolName: ToolName | null = null;

    /**
     * Creates a ToolManager class that manages tools for the canvas, and applies their functionalities to the layerSystem and drawingManager, and renders the result to canvasManager
     * @constructor
     */
    constructor(
        public serviceConfigs: IServiceConfigurations,
        public toolConfigs: IToolConfigurations,
    ) {
        this.setTool('pencil');
    }

    /**
     * Activates a tool by name
     */
    setTool(toolName: ToolName) {
        this.tool = this.createTool(toolName);
        this.toolName = toolName;
    }

    useTool(event: EditorEvents.UIEvent) {
        this.tool.handle(event);
    }

    getToolNames(): ToolName[] {
        return Object.keys(this.toolConfigs) as ToolName[];
    }

    /**
     * Gets the name of the current tool
     */
    get currentToolName(): ToolName | null {
        return this.toolName;
    }

    private createTool(name: ToolName): ITool {
        switch (name) {
            case 'line':
                return new LineTool({
                    drawingConfig: this.serviceConfigs.drawing,
                    lineConfig: this.toolConfigs.line
                });
            case 'pencil':
                return new PencilTool({
                    drawingConfig: this.serviceConfigs.drawing,
                    pencilConfig: this.toolConfigs.pencil
                });
            case 'eraser':
                return new EraserTool({
                    drawingConfig: this.serviceConfigs.drawing,
                    eraserConfig: this.toolConfigs.eraser
                });
            case 'bucket':
                return new BucketTool({
                    drawingConfig: this.serviceConfigs.drawing,
                    bucketConfig: this.toolConfigs.bucket
                });
            default:
                throw new Error(`Tool ${name} does not exist`);
        }
    }
}
