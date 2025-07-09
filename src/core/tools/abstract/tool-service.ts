import { IServiceConfig } from "../intefaces/config.js";

export default abstract class ToolService<IConfigType extends IServiceConfig> {
    constructor(protected config: IConfigType) {}
    attachConfig(config: IConfigType) {
        this.config = config;
    }
}
