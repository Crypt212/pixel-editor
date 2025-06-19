import LayerSystem from "./layer-system.js";
import { validateNumber } from "./validation.js";
import ChangeRegion from "./change-region.js";

/**
 * Contains graphics methods to draw on layers managed by a layer manager class
 * @class
 */
class PixelTool {
    #layerSystem;

    #startPixel = null;
    #recentPixel = null;
    #isActionStart = false;
    #toolName;

    #metaData;

    #recentRect = new ChangeRegion();
    #currentRect = new ChangeRegion();

    /**
     * Sets a specific layer manager class for which the layers will be drawn on
     * @constructor
     */
    constructor(layerSystem) {
        if (!(layerSystem instanceof LayerSystem))
            throw new TypeError(
                "Input type must be of instance of LayerSystem class",
            );

        this.#layerSystem = layerSystem;
    }

    action(pixelPosition) {
        const pixelOperation = (x, y) => {
            if (
                x < 0 ||
                y < 0 ||
                x >= this.#layerSystem.getWidth ||
                y >= this.#layerSystem.getHeight
            )
                return;

            let newColor = this.#metaData.color;
            let oldColor = this.#layerSystem.getLayerCanvas().getColor(x, y);

            if (
                oldColor[0] === newColor[0] &&
                oldColor[1] === newColor[1] &&
                oldColor[2] === newColor[2]
            )
                return;
            this.#layerSystem.getLayerHistory().addActionData({
                x: x,
                y: y,
                colorOld: oldColor,
                colorNew: newColor,
            });
            this.#layerSystem
                .getLayerCanvas()
                .setColor(x, y, newColor, { validate: false });

            this.#currentRect.pushPixel(x, y);
        };

        const history = this.#layerSystem.getLayerHistory();

        let toRender = new ChangeRegion();

        if (this.#startPixel === null && !this.#isActionStart) {
            // did not start action yet
            return toRender;
        } else if (this.#startPixel === null)
            // just started an action
            this.#startPixel = pixelPosition;

        switch (this.#toolName) {
            case "pen":
            case "eraser":
                if (this.#isActionStart) {
                    history.addActionGroup(this.#toolName);
                    this.drawPixel(
                        pixelPosition.x,
                        pixelPosition.y,
                        this.#metaData.size,
                        true,
                        pixelOperation,
                    );
                } else {
                    this.drawLine(
                        this.#recentPixel.x,
                        this.#recentPixel.y,
                        pixelPosition.x,
                        pixelPosition.y,
                        () => 1,
                        (x, y) => {
                            this.drawPixel(
                                x,
                                y,
                                this.#metaData.size,
                                true,
                                pixelOperation,
                            );
                        },
                    );

                    this.#layerSystem.addToHistory();
                }
                toRender.copy(this.#currentRect);
                break;
            case "bucket":
                if (this.#isActionStart) {
                    history.addActionGroup(this.#toolName);
                    this.fill(
                        pixelPosition.x,
                        pixelPosition.y,
                        this.#metaData.color,
                        this.#metaData.tolerance,
                        pixelOperation,
                    );
                    this.#layerSystem.addToHistory();
                    toRender.copy(this.#currentRect);
                }
                break;
            case "line":
                if (!this.#isActionStart) {
                    this.#layerSystem.undo();
                }
                history.addActionGroup(this.#toolName);
                this.drawLine(
                    this.#startPixel.x,
                    this.#startPixel.y,
                    pixelPosition.x,
                    pixelPosition.y,
                    this.#metaData.thicknessTimeFunction,
                    pixelOperation,
                );
                this.#layerSystem.addToHistory();

                if (this.#isActionStart) {
                    toRender.add(this.#recentRect);
                    toRender.add(this.#currentRect);
                    this.#recentRect.set(this.#currentRect);
                } else {
                    toRender.copy(this.#recentRect);
                    toRender.add(this.#currentRect);
                    this.#recentRect.set(this.#currentRect);
                }
                break;
        }

        this.resetBuffer(this.#currentRect);
        this.#recentPixel = { x: pixelPosition.x, y: pixelPosition.y };
        this.#isActionStart = false;

        return toRender;
    }

    //preview(pixelPosition) {
    //    const pixelOperation = (x, y) => {
    //        this.#currentRect.dimensions.x0 = Math.min(
    //            this.#currentRect.dimensions.x0,
    //            x,
    //        );
    //        this.#currentRect.dimensions.y0 = Math.min(
    //            this.#currentRect.dimensions.y0,
    //            y,
    //        );
    //        this.#currentRect.dimensions.x1 = Math.max(
    //            this.#currentRect.dimensions.x1,
    //            x,
    //        );
    //        this.#currentRect.dimensions.y1 = Math.max(
    //            this.#currentRect.dimensions.y1,
    //            y,
    //        );
    //        this.#currentRect.pixelPositions.push({ x: x, y: y });
    //    };
    //
    //    let toRender = {
    //        pixelPositions: [],
    //        dimensions: {
    //            x0: Infinity,
    //            y0: Infinity,
    //            x1: -Infinity,
    //            y1: -Infinity,
    //        },
    //    };
    //
    //    switch (this.toolName) {
    //        case "pen":
    //        case "eraser":
    //            const size =
    //                this.toolName === "pen" ? this.#drawSize : this.#eraseSize;
    //            const color =
    //                this.toolName === "pen" ? this.#drawColor : [0, 0, 0, 0];
    //            this.setUsedColor(color);
    //            if (this.#isActionStart) {
    //                history.addActionGroup(this.toolName);
    //                this.drawPixel(
    //                    pixelPosition.x,
    //                    pixelPosition.y,
    //                    size,
    //                    true,
    //                    pixelOperation,
    //                );
    //            } else {
    //                this.drawLine(
    //                    this.#recentPixel.x,
    //                    this.#recentPixel.y,
    //                    pixelPosition.x,
    //                    pixelPosition.y,
    //                    () => 1,
    //                    (x, y) => {
    //                        this.drawPixel(x, y, size, true, pixelOperation);
    //                    },
    //                );
    //
    //                this.#layerSystem.addToHistory();
    //            }
    //            this.copyBuffer(this.#currentRect, toRender);
    //            break;
    //        case "bucket":
    //            this.setUsedColor(this.#drawColor);
    //            if (this.#isActionStart) {
    //                history.addActionGroup(this.toolName);
    //                this.fill(
    //                    pixelPosition.x,
    //                    pixelPosition.y,
    //                    this.#color,
    //                    this.#tolerance,
    //                    pixelOperation,
    //                );
    //                this.#layerSystem.addToHistory();
    //                this.copyBuffer(this.#currentRect, toRender);
    //            }
    //            break;
    //        /*
    //        case "eye-dropper":
    //            // !!!
    //            break;
    //    */
    //        case "line":
    //            this.setUsedColor(this.#drawColor);
    //            if (!this.#isActionStart) {
    //                this.#layerSystem.undo();
    //            }
    //            history.addActionGroup(this.toolName);
    //            this.drawLine(
    //                this.#startPixel.x,
    //                this.#startPixel.y,
    //                pixelPosition.x,
    //                pixelPosition.y,
    //                () => this.#drawSize,
    //                pixelOperation,
    //            );
    //            this.#layerSystem.addToHistory();
    //
    //            if (this.#isActionStart) {
    //                this.addBuffer(this.#recentRect, toRender);
    //                this.addBuffer(this.#currentRect, toRender);
    //                this.setBuffer(this.#currentRect, this.#recentRect);
    //            } else {
    //                this.copyBuffer(this.#recentRect, toRender);
    //                this.addBuffer(this.#currentRect, toRender);
    //                this.setBuffer(this.#currentRect, this.#recentRect);
    //            }
    //            break;
    //    }
    //
    //    this.resetBuffer(this.#currentRect);
    //    this.#recentPixel = { x: pixelPosition.x, y: pixelPosition.y };
    //    this.#isActionStart = false;
    //
    //    return toRender;
    //}

    addBuffer(sourceBuffer, targetBuffer) {
        targetBuffer.pixelPositions = [
            ...targetBuffer.pixelPositions,
            ...sourceBuffer.pixelPositions,
        ];
        targetBuffer.dimensions.x0 = Math.min(
            targetBuffer.dimensions.x0,
            sourceBuffer.dimensions.x0,
        );
        targetBuffer.dimensions.y0 = Math.min(
            targetBuffer.dimensions.y0,
            sourceBuffer.dimensions.y0,
        );
        targetBuffer.dimensions.x1 = Math.max(
            targetBuffer.dimensions.x1,
            sourceBuffer.dimensions.x1,
        );
        targetBuffer.dimensions.y1 = Math.max(
            targetBuffer.dimensions.y1,
            sourceBuffer.dimensions.y1,
        );
    }

    setBuffer(sourceBuffer, targetBuffer) {
        targetBuffer.pixelPositions = sourceBuffer.pixelPositions;
        targetBuffer.dimensions = sourceBuffer.dimensions;
    }

    copyBuffer(sourceBuffer, targetBuffer) {
        targetBuffer.pixelPositions = [...sourceBuffer.pixelPositions];
        targetBuffer.dimensions.x0 = sourceBuffer.dimensions.x0;
        targetBuffer.dimensions.y0 = sourceBuffer.dimensions.y0;
        targetBuffer.dimensions.x1 = sourceBuffer.dimensions.x1;
        targetBuffer.dimensions.y1 = sourceBuffer.dimensions.y1;
    }

    resetBuffer(buffer) {
        buffer.pixelPositions = [];
        buffer.dimensions = {
            x0: Infinity,
            y0: Infinity,
            x1: -Infinity,
            y1: -Infinity,
        };
    }

    startAction(toolName, metaData) {
        this.#toolName = toolName;
        this.#metaData = metaData;
        this.#isActionStart = true;
    }

    endAction() {
        this.#startPixel = null;
        this.#recentPixel = null;
        this.#isActionStart = false;
        if (this.#layerSystem.getLayerHistory().getActionData().length === 0)
            this.#layerSystem.undo(); // action does nothing, remove it
        this.resetBuffer(this.#currentRect);
        this.resetBuffer(this.#recentRect);
    }

    /**
     * draws pixel at position (x, y) with a specific diameter
     * @method
     * @param {number} x - x position
     * @param {number} y - y position
     * @param {number} [diameter=1] - Diameter for drawing the pixel, minimum = 1
     * @param {boolean} [isSquare=true] - Draws a square pixel with side = radius, draws in a circle shape otherwise
     * @throws {TypeError} - if type of parameters is invalid
     * @throws {RangeError} - if range of parameters is invalid
     */
    drawPixel(x, y, diameter = 1, isSquare = true, pixelOperation) {
        validateNumber(x, "x", { isInteger: true });
        validateNumber(y, "y", { isInteger: true });
        validateNumber(diameter, "Diameter", { start: 1 });
        if (typeof isSquare !== "boolean")
            throw new TypeError("isSquare must be boolean");

        diameter = Math.floor(diameter);
        const radius = Math.floor(0.5 * diameter); // Pre-calculate radius
        const radiusSquared = radius * radius; // Pre-calculate radius squared for performance
        const startX = x - radius;
        const startY = y - radius;
        const endX = Math.max(x + 1, x + radius);
        const endY = Math.max(y + 1, y + radius);

        if (isSquare)
            // For squared area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    pixelOperation(currentX, currentY);
                }
        else
            // For circular area
            for (let currentY = startY; currentY < endY; currentY++)
                for (let currentX = startX; currentX < endX; currentX++) {
                    const dx = x - currentX - 0.5;
                    const dy = y - currentY - 0.5;

                    if (dx * dx + dy * dy <= radiusSquared) {
                        pixelOperation(currentX, currentY);
                    }
                }
    }

    drawLine(x0, y0, x1, y1, thicknessFunction, pixelOperation) {
        const drawPrepLine = (
            x0,
            y0,
            dx,
            dy,
            width,
            initError,
            initWidth,
            direction,
            pixelOperation,
        ) => {
            const stepX = dx > 0 ? 1 : -1;
            const stepY = dy > 0 ? 1 : -1;
            dx *= stepX;
            dy *= stepY;

            const threshold = dx - 2 * dy;
            const diagonalError = -2 * dx;
            const stepError = 2 * dy;
            const widthThreshold = 2 * width * Math.sqrt(dx * dx + dy * dy);

            let error = direction * initError;
            let y = y0;
            let x = x0;
            let thickness = dx + dy - direction * initWidth;

            while (thickness <= widthThreshold) {
                pixelOperation(x, y);
                if (error > threshold) {
                    x -= stepX * direction;
                    error += diagonalError;
                    thickness += stepError;
                }
                error += stepError;
                thickness -= diagonalError;
                y += stepY * direction;
            }
        };
        const drawLineRightLeftOctents = (
            x0,
            y0,
            x1,
            y1,
            thicknessFunction,
            pixelOperation,
        ) => {
            const stepX = x1 - x0 > 0 ? 1 : -1;
            const stepY = y1 - y0 > 0 ? 1 : -1;
            const dx = (x1 - x0) * stepX;
            const dy = (y1 - y0) * stepY;
            const threshold = dx - 2 * dy;
            const diagonalError = -2 * dx;
            const stepError = 2 * dy;

            let error = 0;
            let prepError = 0;
            let y = y0;
            let x = x0;

            for (let i = 0; i < dx; i++) {
                [1, -1].forEach((dir) => {
                    drawPrepLine(
                        x,
                        y,
                        dx * stepX,
                        dy * stepY,
                        thicknessFunction(i) / 2,
                        prepError,
                        error,
                        dir,
                        pixelOperation,
                    );
                });
                if (error > threshold) {
                    y += stepY;
                    error += diagonalError;
                    if (prepError > threshold) {
                        [1, -1].forEach((dir) => {
                            drawPrepLine(
                                x,
                                y,
                                dx * stepX,
                                dy * stepY,
                                thicknessFunction(i) / 2,
                                prepError + diagonalError + stepError,
                                error,
                                dir,
                                pixelOperation,
                            );
                        });
                        prepError += diagonalError;
                    }
                    prepError += stepError;
                }
                error += stepError;
                x += stepX;
            }
        };

        if (Math.abs(x1 - x0) < Math.abs(y1 - y0))
            // if line is steep, flip along x = y axis, then do the function then flip the pixels again then draw
            drawLineRightLeftOctents(
                y0,
                x0,
                y1,
                x1,
                thicknessFunction,
                (x, y) => pixelOperation(y, x),
            );
        else
            drawLineRightLeftOctents(
                x0,
                y0,
                x1,
                y1,
                thicknessFunction,
                pixelOperation,
            );
    }

    /**
     * Fills an area of semi-uniform color (with some tolerance difference) which contains the position (x, y) with the given color
     * @method
     * @param {number} x
     * @param {number} y
     * @param {[number, number, number, number]} An array containing color data [red, green, blue, alpha]
     * @param {number} [tolerance=0] !!!
     */
    fill(x, y, color, tolerance = 0, pixelOperation) {
        if (
            x < 0 ||
            y < 0 ||
            x >= this.#layerSystem.getWidth ||
            y >= this.#layerSystem.getHeight
        )
            return;

        const canvas = this.#layerSystem.getLayerCanvas();
        const originalPixel = canvas.get(x, y);
        const originalColor = originalPixel.color;

        // early exit if the color is the same
        if (isColorSimilar(originalColor, color, tolerance)) return;

        const toVisit = [{ x: x, y: y }];
        const toFill = [];
        const visited = new Set();

        while (toVisit.length) {
            const currentPixel = toVisit.pop();
            const { x: currX, y: currY } = currentPixel;

            // check if already visited
            const pixelKey = `${currX},${currY}`;
            if (visited.has(pixelKey)) continue;
            visited.add(pixelKey);

            const currentColor = canvas.getColor(currX, currY);

            if (isColorSimilar(currentColor, originalColor, tolerance)) {
                toFill.push(currentPixel);

                // add adjacent pixels to visit
                if (currX > 0) toVisit.push({ x: currX - 1, y: currY }); // left
                if (currX < this.#layerSystem.getWidth - 1)
                    toVisit.push({ x: currX + 1, y: currY }); // right
                if (currY > 0) toVisit.push({ x: currX, y: currY - 1 }); // up
                if (currY < this.#layerSystem.getHeight - 1)
                    toVisit.push({ x: currX, y: currY + 1 }); // down
            }
        }
        // set the color for all pixels to fill
        toFill.forEach((pixel) => {
            pixelOperation(pixel.x, pixel.y);
        });
    }
}

function isColorSimilar(color1, color2, tolerance) {
    const distance = Math.sqrt(
        Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2),
    );
    const alphaDifference = 255 * Math.abs(color1[3] - color2[3]);
    return distance <= tolerance && alphaDifference <= tolerance;
}

export default PixelTool;
