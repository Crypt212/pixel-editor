import { EditorEvents } from "@src/types/ui-events.js";
import { DrawingService, IDrawingConfig } from "../services/drawing-service.js";
import { ITool, IToolParamList } from "../intefaces/tool.js";
import { IToolConfig } from "../intefaces/config.js";

export interface ILineConfig extends IToolConfig {

}

export interface ILineToolParamList extends IToolParamList {
    drawingConfig: IDrawingConfig,
    lineConfig: ILineConfig,
}

export default class LineTool implements ITool {
    private config: ILineConfig;
    private drawingService: DrawingService;
    constructor(params: ILineToolParamList) {
        this.drawingService = new DrawingService(params.drawingConfig);
        this.config = params.lineConfig;
    }

    handle(event: EditorEvents.UIEvent) {


        const clickAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.startPosition.x,
                y: this.drawingService.startPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: true,
            });
        }
        const unclickAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.startPosition.x,
                y0: this.drawingService.startPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.drawPoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: true,
                }),
            });
        }
        const movePreviewAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.currentPosition.x,
                y: this.drawingService.currentPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: true,
            });
        }
        const moveDrawAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.startPosition.x,
                y0: this.drawingService.startPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.drawPoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: true,
                }),
            });
        }

        this.drawingService.handle({
            event, actionName: "Line Tool",
            redraw: true,
            clickAction, moveDrawAction, movePreviewAction, unclickAction
        });
    }

}
