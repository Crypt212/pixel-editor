import { validateNumber } from "../utils/validation.js";
/**
 * Responsible for managing the canvas element inside its container
 * @class
 */
export default class Canvas {
    containerElement;
    canvasElement;
    canvasContext;
    normalScale = 1; // the inital scale applied on the canvas to fit in the containerElement
    minScale = 1;
    maxScale = 1;
    scale = 1; // the scale applied by the user on the canvas
    recentPixelPos = { x: -1, y: -1 };
    //#isDragging = false;
    // private doubleTapThreshold: number = 300; // Time in milliseconds to consider as double tap
    // private tripleTapThreshold: number = 600; // Time in milliseconds to consider as triple tap
    //
    // private lastTouchTime: number = 0;
    // private touchCount: number = 0;
    //
    // private startX: number = 0;
    // private startY: number = 0;
    // private offsetX: number = 0;
    // private offsetY: number = 0;
    /**
     * Creates a canvas elements inside the given container and manages its functionalities
     * @constructor
     * @param containerElement - The DOM Element that will contain the canvas
     * @param events - The event bus
     */
    constructor(containerElement, events) {
        // Setup canvas element
        this.canvasElement = document.createElement("canvas");
        this.containerElement = containerElement;
        this.canvasElement.id = "canvas-image";
        this.canvasElement.style.transformOrigin = 'center center';
        this.containerElement.appendChild(this.canvasElement);
        // Setup canvas context
        this.canvasContext = this.canvasElement.getContext("2d", { alpha: false });
        this.canvasContext.imageSmoothingEnabled = false;
        // Setup events
        this.setupEvents(events);
        // Recalculate canvas size if container size changes
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target == this.containerElement) {
                    this.calculateInitialScale();
                }
            }
        });
        observer.observe(this.containerElement);
    }
    /**
    * Reevaluates the initial scale of the canvas and the min and max scale
    * @method
    */
    calculateInitialScale() {
        const containerRect = this.containerElement.getBoundingClientRect();
        this.normalScale = Math.min(containerRect.width /
            this.canvasElement.width, containerRect.height /
            this.canvasElement.height);
        this.minScale = this.normalScale * 0.1;
        this.maxScale = this.normalScale * Math.max(this.canvasElement.width, this.canvasElement.height);
        this.zoom(1);
    }
    /**
     * Creates a blank canvas with given width and height, and scale it to the container size
     * @method
     * @param width - Integer represents the number of pixel columns in the canvas, range is [0, 1024] inclusive
     * @param height - Integer represents the number of pixel rows in the canvas, range is [0, 1024] inclusive
     * @returns An object containing the converted (x, y) position in the form of {x: xPos, y: yPos}
     * @throws {TypeError} if the width or the height are not valid integers
     * @throws {RangeError} if the width or the height are not in valid ranges
     */
    createBlankCanvas(width, height) {
        validateNumber(width, "Width", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        validateNumber(height, "Height", {
            start: 1,
            end: 1024,
            integerOnly: true,
        });
        this.canvasElement.width = width;
        this.canvasElement.height = height;
        this.calculateInitialScale();
        this.resetZoom();
    }
    /**
     * Renders an image at an offset in the canvas
     * @method
     * @param imageData - The image to be rendered
     * @param [dx=0] - The x offset of the image
     * @param [dy=0] - The y offset of the image
     */
    render(imageData, dx = 0, dy = 0) {
        validateNumber(dx, "x");
        validateNumber(dy, "y");
        this.canvasContext.putImageData(imageData, dx, dy);
    }
    // addOffset(offsetX, offsetY) {
    //     // not implemented
    // }
    /**
     * Applies zoom multiplier to the canvas
     * @method
     * @param delta - Multiplier to be applied to the current scale
     * @returns the current zoom level
     */
    zoom(delta) {
        this.scale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);
        this.canvasElement.style.width = `${this.scale * this.canvasElement.width}px`;
        this.canvasElement.style.height = `${this.scale * this.canvasElement.height}px`;
        return this.getScale();
    }
    /**
     * Reset zoom of the canvas
     * @method
     * @returns the current zoom level
     */
    resetZoom() {
        this.scale = this.normalScale;
        this.canvasElement.style.width = `${this.scale * this.canvasElement.width}px`;
        this.canvasElement.style.height = `${this.scale * this.canvasElement.height}px`;
        return this.getScale();
    }
    /**
     * Returns current zoom level
     * @method
     * @returns the current zoom level
     */
    getScale() {
        return this.scale;
    }
    /**
     * Translates event coordinates of the canvas element to pixel position on the canvas
    * @method
    * @param clientX - The x position on the canvas element
    * @param clientY - The y position on the canvas element
    * @returns The resultant position of the pixel on the canvas grid
    */
    getPixelPosition(clientX, clientY) {
        return {
            x: Math.floor(clientX / this.scale),
            y: Math.floor(clientY / this.scale),
        };
    }
    /**
     * @method
     * @returns Container element
     */
    get getContainer() {
        return this.containerElement;
    }
    /**
     * @method
     * @returns Canvas element
     */
    get canvas() {
        return this.canvasElement;
    }
    /**
     * @method
     * @returns Width of the container element
     */
    get containerWidth() {
        return this.containerElement.style.width;
    }
    /**
     * @method
     * @returns Height of the container element
     */
    get containerHeight() {
        return this.containerElement.style.height;
    }
    /**
     * @method
     * @returns Width of the canvas grid
     */
    get width() {
        return this.canvasElement.width;
    }
    /**
     * @method
     * @returns Height of the canvas grid
     */
    get height() {
        return this.canvasElement.height;
    }
    setupEvents(events) {
        const emitPointerEvent = (name, event) => {
            // if (event.target !== this.canvas) return;
            event.preventDefault();
            const canvasRect = this.canvas.getBoundingClientRect();
            const clientX = (event.changedTouches ? event.changedTouches[0].clientX : event.clientX) - canvasRect.left;
            const clientY = (event.changedTouches ? event.changedTouches[0].clientY : event.clientY) - canvasRect.top;
            const coordinates = this.getPixelPosition(clientX, clientY);
            if (this.recentPixelPos.x === coordinates.x && this.recentPixelPos.y === coordinates.y && name == "mousemove")
                return;
            this.recentPixelPos = coordinates;
            events.emit(`canvas:${name}`, {
                clientX: clientX,
                clientY: clientY,
                coordinates,
                pointerType: (event.touches ? "touch" : "mouse"),
            });
        };
        this.containerElement.addEventListener("mousedown", (e) => {
            emitPointerEvent("mousedown", e);
        });
        document.addEventListener("mouseup", (e) => {
            emitPointerEvent("mouseup", e);
        });
        document.addEventListener("mousemove", (e) => {
            emitPointerEvent("mousemove", e);
        });
        document.addEventListener("mouseleave", (e) => {
            emitPointerEvent("mouseleave", e);
        });
        document.addEventListener("mouseup", (e) => {
            emitPointerEvent("mouseup", e);
        });
        // containerElement.addEventListener("touchstart", (event) => {
        //     event.preventDefault();
        //
        //     const currentTime = new Date().getTime();
        //
        //     if (currentTime - this.#lastTouchTime <= doubleTapThreshold) {
        //         touchCount++;
        //     } else if (
        //         currentTime - this.#lastTouchTime <=
        //         tripleTapThreshold
        //     )
        //         touchCount = 2;
        //     else touchCount = 1;
        //
        //     lastTouchTime = currentTime;
        //     if (touchCount === 1) {
        //         this.#isDrawing = true;
        //
        //         const clientX = event.clientX || event.touches[0].clientX;
        //         const clientY = event.clientY || event.touches[0].clientY;
        //
        //         // this.#toolManager.use("touchdown - draw", clientX, clientY);
        //         // should be in every comment this.#events.emit("drawstart", clientX, clientY);
        //     }
        //
        //     if (touchCount === 2) {
        //         // this.#toolManager.use("touchdown - undo", clientX, clientY);
        //         touchCount = 0;
        //     }
        //
        //     if (touchCount === 3) {
        //         // this.#toolManager.use("touchdown - redo", clientX, clientY);
        //         touchCount = 0;
        //     }
        //     console.log(eventName);
        // });
        // ["mouseup", "touchend", "touchcancel"].forEach((eventName) => {
        //     document.addEventListener(eventName, (event) => {
        //         //event.preventDefault();
        //         this.#isDrawing = false;
        //
        //         const clientX =
        //             event.clientX || event.changedTouches[0].clientX;
        //         const clientY =
        //             event.clientY || event.changedTouches[0].clientX;
        //         console.log(eventName);
        //
        //         // this.#toolManager.use("mouseup", clientX, clientY);
        //     });
        // });
        // document.addEventListener("touchmove", (event) => {
        //     //event.preventDefault();
        //
        //     const clientX =
        //         event.clientX || event.changedTouches[0].clientX;
        //     const clientY =
        //         event.clientY || event.changedTouches[0].clientY;
        //     console.log(eventName);
        //
        //     if (this.#isDrawing);
        //     // this.#toolManager.use("mousedraw", clientX, clientY);
        //     else; // this.#toolManager.use("mousehover", clientX, clientY);
        // });
        // scroll effect
        this.containerElement.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1.1 : 0.9;
            this.zoom(delta);
            events.emit("canvas:zoom", {
                delta: delta,
                centerX: e.clientX,
                centerY: e.clientY
            });
        });
        //
        // window.addEventListener("resize", () => {
        //     this.canvasElement.refresh(true);
        // });
        document.addEventListener("keydown", (e) => {
            if (!e.ctrlKey)
                return;
            if (e.key == "z")
                events.emit("canvas:undo", { key: e.key });
            if (e.key == "y")
                events.emit("canvas:redo", { key: e.key });
            // this.#canvasElement.render(
            //     this.#layerManager.getRenderImage(
            //         this.#canvasElement.getCanvasContext,
            //     ),
            // );
        });
    }
}
