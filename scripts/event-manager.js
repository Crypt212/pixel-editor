const doubleTapThreshold = 300; // Time in milliseconds to consider as double tap
const tripleTapThreshold = 600; // Time in milliseconds to consider as triple tap

class EventManager {
    #canvasManager;
    #layerSystem;
    #toolManager;

    #isMouseDown = false;
    #lastTouchTime = 0;
    #touchCount = 0;

    constructor(canvasManager, toolManager, layerSystem) {
        this.#canvasManager = canvasManager;
        this.#layerSystem = layerSystem;
        this.#toolManager = toolManager;
        let canvasElement = this.#canvasManager.getCanvas;
        let containerElement = this.#canvasManager.getContainer;

        ["mousedown", "touchstart"].forEach((eventName) => {
            containerElement.addEventListener(eventName, (event) => {
                event.preventDefault();

                const currentTime = new Date().getTime();

                if (currentTime - this.#lastTouchTime <= doubleTapThreshold) {
                    touchCount++;
                } else if (
                    currentTime - this.#lastTouchTime <=
                    tripleTapThreshold
                )
                    touchCount = 2;
                else touchCount = 1;

                lastTouchTime = currentTime;
                if (touchCount === 1) {
                    this.#isMouseDown = true;

                    const clientX = event.clientX || event.touches[0].clientX;
                    const clientY = event.clientY || event.touches[0].clientY;

                    this.#toolManager.use("mousedown", clientX, clientY);
                }

                if (touchCount === 2) {
                    undo();
                    touchCount = 0;
                }

                if (touchCount === 3) {
                    redo();
                    touchCount = 0;
                }
                console.log(eventName);
            });
        });

        ["mouseup", "touchend", "touchcancel"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                //event.preventDefault();
                this.#isMouseDown = false;

                const clientX =
                    event.clientX || event.changedTouches[0].clientX;
                const clientY =
                    event.clientY || event.changedTouches[0].clientX;
                console.log(eventName);

                this.#toolManager.use("mouseup", clientX, clientY);
            });
        });

        ["mousemove", "touchmove"].forEach((eventName) => {
            document.addEventListener(eventName, (event) => {
                //event.preventDefault();

                const clientX =
                    event.clientX || event.changedTouches[0].clientX;
                const clientY =
                    event.clientY || event.changedTouches[0].clientY;
                console.log(eventName);

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

    handleTouchStart(event, fun) { }
}

export default EventManager;
