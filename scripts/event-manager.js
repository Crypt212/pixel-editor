class EventManager {
    #canvasManager;
    #layerSystem;
    #toolManager;

    #isMouseDown = false;

    constructor(canvasManager, toolManager, layerSystem) {
        this.#canvasManager = canvasManager;
        this.#layerSystem = layerSystem;
        this.#toolManager = toolManager;
        let canvasElement = this.#canvasManager.getCanvas;
        let containerElement = this.#canvasManager.getContainer;

        ["ontouchstart", "mousedown"]
            .forEach((eventName) => {
                containerElement.addEventListener(eventName, (event) => {
                    event.preventDefault();
                    this.#isMouseDown = true;
                    this.#toolManager.use(
                        "mousedown",
                        event.clientX,
                        event.clientY,
                    );
                });
            });

        ["ontouchcancel", "mouseup"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                event.preventDefault();
                this.#isMouseDown = false;
                this.#toolManager.use(
                    "mouseup",
                    event.clientX,
                    event.clientY,
                );
            });
        });

        canvasElement.addEventListener("mouseleave", (event) => { });

        ["mousemove", "ontouchmove"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                event.preventDefault();
                if (this.#isMouseDown)
                    this.#toolManager.use(
                        "mousedraw",
                        event.clientX,
                        event.clientY,
                    );
                else
                    this.#toolManager.use(
                        "mousehover",
                        event.clientX,
                        event.clientY,
                    );
            });
        });

        // scroll effect
        containerElement.addEventListener("wheel", (event) => {
            event.preventDefault();

            const delta = event.deltaY > 0 ? 1.1 : 0.9;

            this.#canvasManager.setScale(this.#canvasManager.getScale * delta);
            this.#canvasManager.refresh();
        });

        window.addEventListener("resize", () => {
            this.#canvasManager.refresh(true);
        });

        document.addEventListener("keydown", (event) => {
            if (event.ctrlKey === true) {
                if (event.key === "z") {
                    console.log("undo");
                    this.#layerSystem.undo();
                } else if (event.key === "y") {
                    console.log("redo");
                    this.#layerSystem.redo();
                }
                this.#canvasManager.render(
                    this.#layerSystem.getRenderImage(
                        this.#canvasManager.getCanvasContext,
                    ),
                );
            }
        });
    }
}

export default EventManager;
