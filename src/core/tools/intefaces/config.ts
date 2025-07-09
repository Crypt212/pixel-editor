import { IBucketConfig } from "../implementations/bucket-tool.js";
import { IEraserConfig } from "../implementations/eraser-tool.js";
import { ILineConfig } from "../implementations/line-tool.js";
import { IPencilConfig } from "../implementations/pencil-tool.js";
import { IDrawingConfig } from "../services/drawing-service.js";

export interface IServiceConfigurations {
    drawing: IDrawingConfig,
}

export interface IToolConfigurations {
    line: ILineConfig,
    pencil: IPencilConfig,
    eraser: IEraserConfig,
    bucket: IBucketConfig,
}

export interface IServiceConfig { }
export interface IToolConfig { }
