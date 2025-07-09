import { EditorEvents } from "@src/types/ui-events.js";
import { IToolConfig } from "../intefaces/config.js";
import { ITool, IToolParamList } from "../intefaces/tool.js";
import { DrawingService, IDrawingConfig } from "../services/drawing-service.js";

export interface IPencilConfig extends IToolConfig {
    drawShape: "round" | "square",
};

export interface IPencilToolParamList extends IToolParamList {
    drawingConfig: IDrawingConfig,
    pencilConfig: IPencilConfig,
}

export default class PencilTool implements ITool {
    private config: IPencilConfig;
    private drawingService: DrawingService;
    constructor(params: IPencilToolParamList) {
        this.drawingService = new DrawingService(params.drawingConfig);
        this.config = params.pencilConfig;
    }

    handle(event: EditorEvents.UIEvent) {
        const clickAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.startPosition.x,
                y: this.drawingService.startPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: this.config.drawShape === "square",
            });
        };
        const unclickAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.recentPosition.x,
                y0: this.drawingService.recentPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.drawPoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: this.config.drawShape === "square",
                }),
            });
        };
        const movePreviewAction = () => {
            this.drawingService.drawPoint({
                x: this.drawingService.currentPosition.x,
                y: this.drawingService.currentPosition.y,
                diameter: this.drawingService.drawingSize,
                isSquare: this.config.drawShape === "square",
            })
        };
        const moveDrawAction = () => {
            this.drawingService.drawLine({
                x0: this.drawingService.recentPosition.x,
                y0: this.drawingService.recentPosition.y,
                x1: this.drawingService.currentPosition.x,
                y1: this.drawingService.currentPosition.y,
                setPixel: ({ x, y }) => this.drawingService.drawPoint({
                    x,
                    y,
                    diameter: this.drawingService.drawingSize,
                    isSquare: this.config.drawShape === "square",
                }),
            })
        };

        this.drawingService.handle({
            event, actionName: "Pencil Tool",
            redraw: false,
            clickAction, moveDrawAction, movePreviewAction, unclickAction,
        });
    }

    setType(type: "round" | "square") {
        this.config.drawShape = type;
    }
}
