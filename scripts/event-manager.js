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

        ["mousedown", "touchstart"].forEach((eventName) => {
            containerElement.addEventListener(eventName, (event) => {
                event.preventDefault();
                this.#isMouseDown = true;

                const clientX = event.clientX || event.touches[0].clientX;
                const clientY = event.clientY || event.touches[0].clientY;
                console.log(eventName);
                console.log(event.touches);
                console.log(event.changedTouches);

                this.#toolManager.use("mousedown", clientX, clientY);
            });
        });

        ["mouseup", "touchend", "touchcancel"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                event.preventDefault();
                this.#isMouseDown = false;

                const clientX = event.clientX || event.changedTouches[0].clientX;
                const clientY = event.clientY || event.changedTouches[0].clientX;
                console.log(eventName);
                console.log(event.touches);
                console.log(event.changedTouches);

                this.#toolManager.use("mouseup", clientX, clientY);
            });
        });

        ["mousemove", "touchmove"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                event.preventDefault();

                const clientX = event.clientX || event.changedTouches[0].clientX;
                const clientY = event.clientY || event.changedTouches[0].clientY;
                console.log(eventName);
                console.log(event.touches);
                console.log(event.changedTouches);

                if (this.#isMouseDown)
                    this.#toolManager.use("mousedraw", clientX, clientY);
                else this.#toolManager.use("mousehover", clientX, clientY);
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
