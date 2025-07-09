import { EditorEvents } from "@src/types/ui-events.js";
import { IToolConfig } from "../intefaces/config.js";
import { ITool, IToolParamList } from "../intefaces/tool.js";
import { DrawingService, IDrawingConfig } from "../services/drawing-service.js";

export interface IEraserConfig extends IToolConfig {
    eraseShape: "round" | "square",
};

export interface IEraserToolParamList extends IToolParamList {
    drawingConfig: IDrawingConfig,
    eraserConfig: IEraserConfig,
}

export default class EraserTool implements ITool {
    private config: IEraserConfig;
    private drawingService: DrawingService;
    constructor(params: IEraserToolParamList) {
        this.drawingService = new DrawingService(params.drawingConfig);
        this.config = params.eraserConfig;
    }

    handle(event: EditorEvents.UIEvent) {

        const clickAction = () => {
            this.drawingService.erasePoint({
                x: this.drawingService.startPosition.x,
                y: this.drawingService.startPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: this.config.eraseShape === "square",
            });
        }
        const unclickAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.recentPosition.x,
                y0: this.drawingService.recentPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.erasePoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: this.config.eraseShape === "square",
                }),
            });
        }
        const movePreviewAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.currentPosition.x,
                y: this.drawingService.currentPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: this.config.eraseShape === "square",
            });
        }
        const moveDrawAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.recentPosition.x,
                y0: this.drawingService.recentPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.erasePoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: this.config.eraseShape === "square",
                }),
            });
        }


        this.drawingService.handle({
            event, actionName: "Eraser Tool",
            redraw: false,
            clickAction, moveDrawAction, movePreviewAction, unclickAction,
        });
    }

    setType(type: "round" | "square") {
        this.config.eraseShape = type;
    }
}
