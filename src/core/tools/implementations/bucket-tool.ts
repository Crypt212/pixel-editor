import { EditorEvents } from "@src/types/ui-events.js";
import { IToolConfig } from "../intefaces/config.js";
import { ITool, IToolParamList } from "../intefaces/tool.js";
import { DrawingService, IDrawingConfig } from "../services/drawing-service.js";

export interface IBucketConfig extends IToolConfig {
    tolerance: number,
};

export interface IBucketToolParamList extends IToolParamList {
    drawingConfig: IDrawingConfig,
    bucketConfig: IBucketConfig,
}

export default class BucketTool implements ITool {
    private config: IBucketConfig;
    private drawingService: DrawingService;
    constructor(params: IBucketToolParamList) {
        this.drawingService = new DrawingService(params.drawingConfig);
        this.config = params.bucketConfig;
    }

    handle(event: EditorEvents.UIEvent) {

        const clickAction = () => {
            this.drawingService.fill({
                x: this.drawingService.currentPosition.x,
                y: this.drawingService.currentPosition.y,
                color: this.drawingService.drawingColor,
                tolerance: 1,
            });
        };
        const unclickAction = () => { };
        const movePreviewAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.currentPosition.x,
                y: this.drawingService.currentPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: true,
            });
        };
        const moveDrawAction = () => { }
        this.drawingService.handle({
            event, actionName: "Bucket Tool",
            redraw: false,
            clickAction, moveDrawAction, movePreviewAction, unclickAction
        });
    }

    setTolerance(tolerance: number) {
        this.config.tolerance = tolerance;
    }
}
