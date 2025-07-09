import { AppEventEmitter } from "@src/core/events.js";
import { ToolName } from "../managers/tool-manager.js";

export default class ToolBar {
    private toolContainer: HTMLElement;
    private toolMap: {
        nameToTool: Map<ToolName, HTMLElement>,
        toolToName: Map<HTMLElement, ToolName>,
    } = { toolToName: new Map(), nameToTool: new Map() };

    constructor(toolContainer: HTMLElement, events: AppEventEmitter) {
        this.toolContainer = toolContainer;
        this.setupEvents(events);
    }

    addTool(name: ToolName) {
        const iconPath = `assets/icons/${name}-tool.png`;
        let element: HTMLElement = document.createElement("div");
        element.classList.add("tool");
        element.classList.add("btn");

        const innerIcon = document.createElement("img");
        innerIcon.setAttribute("src", iconPath);

        element.appendChild(innerIcon);
        this.toolContainer.appendChild(element);

        this.toolMap.nameToTool.set(name, element);
        this.toolMap.toolToName.set(element, name);
    }

    setupEvents(events: AppEventEmitter) {
        this.toolContainer.addEventListener("click", (event: MouseEvent) => {
            const toolElement = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('tool')) as HTMLElement;

            if (toolElement === undefined) return;

            console.log("TOOL CHANGE");
            events.emit("tool-bar:tool-selected", { toolName: this.toolMap.toolToName.get(toolElement) })
        });
    }
}

