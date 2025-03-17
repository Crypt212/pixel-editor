import HistorySystem from "./history-system.js";
import CanvasData from "./canvas-data.js";
import LayerSystem from "./layer-system.js";
import Graphics from "./graphics.js";
import Tool from "./tool.js";

class PixelBoard {
    #canvasElement;
    #containerElement;
    #canvasContext;
    #containerWidth = 0;
    #containerHeight = 0;
    #layerSystem;
    #darkBG = "#a0a0a0";
    #lightBG = "#d9d9d9";
    #isMouseMoving = false;
    #isMouseDown = false;
    #minScale = 1;
    #recentPixel = null;
    #startPixel = null;
    #lastTemporaryChanges = [];

    constructor(containerElement) {
        // Setup canvas element
        this.#canvasElement = document.createElement("canvas");
        this.#containerElement = containerElement;
        this.#canvasElement.id = "canvas-image";

        this.#containerElement.appendChild(this.#canvasElement);

        // Setup canvas context
        this.#canvasContext = this.#canvasElement.getContext("2d");
        this.#canvasContext.imageSmoothingEnabled = false;

        this.#containerWidth = this.#containerElement.clientWidth;
        this.#containerHeight = this.#containerElement.clientHeight;

        this.#layerSystem = new LayerSystem(
            this.#canvasElement.width,
            this.#canvasElement.height,
        );
        this.#layerSystem.addLayer("Layer 1");

        this.#layerSystem.selectLayer(0);

        // Setup canvas element events
        this.setupEvents();
    }

    getIntegerPosition(floatX, floatY) {
        return {
            x: Math.floor(floatX / this.#minScale),
            y: Math.floor(floatY / this.#minScale),
        };
    }

    addLayer(name) {
        this.#layerSystem.addLayer(
            name,
            new CanvasData(
                this.#canvasElement.width,
                this.#canvasElement.height,
            ),
            new HistorySystem(64),
        );
    }

    selectLayer(index) {
        this.#layerSystem.selectLayer(index);
    }

    createBlankBoard(width, height) {
        this.#minScale = Math.min(
            this.#containerWidth / width,
            this.#containerHeight / height,
        );
        this.#canvasElement.width = width;
        this.#canvasElement.height = height;
        this.#canvasElement.style.width = `${this.#minScale * width}px`;
        this.#canvasElement.style.height = `${this.#minScale * height}px`;
    }

    loadPNGImage(x, y, imageURL) {
        let pixel = this.getIntegerPosition(x, y);
        const img = new Image();
        img.addEventListener("load", () => {
            this.#layerSystem.getLayerCanvas().loadImage(img, pixel.x, pixel.y);
        });
        img.src = imageURL;
    }

    render(changesArray) {
        if (!Array.isArray(changesArray)) {
            for (let i = 0; i < this.#canvasElement.height; i++)
                for (let j = 0; j < this.#canvasElement.width; j++)
                    this.renderPixel(j, i);
        } else for (let pixel of changesArray) this.renderPixel(pixel.x, pixel.y);
    }

    renderPixel(x, y) {
        let resColor = chroma(
            (x + y) % 2 ? this.#lightBG : this.#darkBG,
        ).rgba();

        for (let i = 0; i < this.#layerSystem.getSize; i++) {
            const canvas = this.#layerSystem.getLayerCanvas(i);
            const color = canvas.getColor(x, y);

            console.log(x);
            console.log(y);
            console.log(this.#layerSystem.getLayerCanvas(i).getColor(x, y));

            // color[0] : red
            // color[1] : green
            // color[2] : blue
            // color[3] : alpha

            for (let k = 0; k < 3; k++)
                resColor[k] =
                    color[k] * color[3] +
                    (resColor[k] * resColor[3] * (1 - color[3])) /
                    (color[3] + resColor[3] * (1 - color[3]));
            
            resColor[3] = color[3] + resColor[3] * (1 - color[3]);
        }

        resColor = chroma(resColor).hex();
        this.#canvasContext.fillStyle = resColor;
        this.#canvasContext.fillRect(x, y, 1, 1);
    }

    //undo() {
    //    let layer = this.#layers[this.#currentLayerIndex];
    //    let breakName = layer.getLastUndoBreak();
    //    let lastChanges = layer.getLastChangePositions(breakName);
    //    layer.undo(breakName);
    //    this.render(lastChanges);
    //}

    //redo(breakName) {
    //
    //}

    actionOnCell(pixelPosition) {
        let color = chroma(Tool.drawColor);
        color.alpha(color.alpha() * Tool.drawIntensity).rgba()
        color = color._rgb;
        const history = this.#layerSystem.getLayerHistory();
        const canvas = this.#layerSystem.getLayerCanvas();
        const graphics = new Graphics(canvas);

        switch (Tool.name) {
            case "pen":
                if (!this.#isMouseMoving) {
                    history.addActionGroup(Tool.name);
                    graphics.drawPixel(pixelPosition.x, pixelPosition.y, color, Tool.size);
                }
                if (this.#isMouseMoving) {
                    graphics.drawLine(
                        this.#recentPixel.x,
                        this.#recentPixel.y,
                        pixelPosition.x,
                        pixelPosition.y,
                        color,
                        Tool.size,
                    );
                    canvas.getLastActions.forEach((action) =>
                        history.addActionData(action),
                    );
                }
                console.log(this.#layerSystem.getLayerCanvas(0));
                this.render(canvas.getLastActions);
                canvas.resetLastActions();
                break;

            case "eraser":
                if (!this.#isMouseMoving) {
                    history.addActionGroup(Tool.name);
                    graphics.drawPixel(pixelPosition.x, pixelPosition.y, Tool.drawColor);
                }
                if (this.#isMouseMoving) {
                    graphics.drawLine(
                        this.#recentPixel.x,
                        this.#recentPixel.y,
                        pixelPosition.x,
                        pixelPosition.y,
                        color,
                    );
                    canvas.getLastActions.forEach((action) =>
                        history.addActionData(action),
                    );
                }
                this.render(canvas.getLastActions);
                break;
            case "bucket":
                if (this.#isMouseDown && !this.#isMouseMoving) {
                    history.addActionGroup(Tool.name);
                    canvas.fill(pixelPosition.x, pixelPosition.y, Tool.drawColor);
                    this.render(canvas.getLastActions);
                    canvas.getLastActions.forEach((action) =>
                        history.addActionData(action),
                    );
                    canvas.resetLastActions();
                }
                break;
            case "eye-dropper":
                // !!!
                break;
            case "line":
                if (this.#isMouseDown) {
                    if (!this.#isMouseMoving);
                    else {
                        // just started
                        //this.#startPixel = pixelPosition;
                        // in middle of action
                        this.render(this.#lastTemporaryChanges);
                        graphics.drawLine(
                            this.#startPixel.x,
                            this.#startPixel.y,
                            pixelPosition.x,
                            pixelPosition.y,
                            color,
                        );

                        this.#lastTemporaryChanges =
                            layer.getLastChangePositions();
                        this.render(this.#lastTemporaryChanges);
                        layer.undo();
                    }
                } else {
                    // ended
                    layer.drawLine(
                        this.#startPixel.x,
                        this.#startPixel.y,
                        pixelPosition.x,
                        pixelPosition.y,
                        color,
                    );
                    this.render(layer.getLastChangePositions());
                    this.#startPixel = null;
                    this.#lastTemporaryChanges = [];
                }
                break;
        }
    }

    setupEvents() {
        this.#canvasElement.addEventListener("mousedown", (event) => {
            event.preventDefault();
            console.log("mousedown");

            this.#isMouseDown = true;

            const rect = this.#canvasElement.getBoundingClientRect();

            const pixelPosition = this.getIntegerPosition(
                event.clientX - rect.left,
                event.clientY - rect.top,
            );
            this.#startPixel = pixelPosition;

            this.actionOnCell(pixelPosition, 0);
            this.#recentPixel = pixelPosition;
        });

        this.#canvasElement.addEventListener("mouseup", (event) => {
            event.preventDefault();
            console.log("mouseup");

            this.#isMouseMoving = false;
            this.#isMouseDown = false;

            this.actionOnCell(this.#recentPixel, 0);
            this.#recentPixel = null;
            this.#startPixel = null;
        });

        this.#canvasElement.addEventListener("mouseleave", (event) => {
            event.preventDefault();
            console.log("mouseleave");

            this.#isMouseMoving = false;
            this.#isMouseDown = false;

            this.#recentPixel = null;
            this.#startPixel = null;
        });

        this.#canvasElement.addEventListener("mousemove", (event) => {
            event.preventDefault();
            console.log("mousemove");

            if (this.#isMouseDown) {
                this.#isMouseMoving = true;

                const rect = this.#canvasElement.getBoundingClientRect();

                const pixelPosition = this.getIntegerPosition(
                    event.clientX - rect.left,
                    event.clientY - rect.top,
                );

                if (
                    pixelPosition.y == this.#recentPixel.y &&
                    pixelPosition.x == this.#recentPixel.x
                )
                    return;
                this.actionOnCell(pixelPosition, 0);
                this.#recentPixel = pixelPosition;
            }
        });

        // scroll effect
        this.#containerElement.addEventListener("wheel", (event) => {
            event.preventDefault();

            const delta = event.deltaY > 0 ? 0.97 : 1.03;
            let scale = 1;
            let transform = getComputedStyle(this.#canvasElement).transform;

            if (transform !== "none") {
                scale = new DOMMatrix(
                    getComputedStyle(this.#canvasElement).transform,
                ).a;

                if ((scale >= 8 && delta > 1) || (scale <= 0.9 && delta < 1))
                    return;
            } else scale = 1;

            //this.backgroundElement.style.transform =
            this.#canvasElement.style.transform = `scale(${scale * delta})`;
        });
    }
}

export default PixelBoard;
