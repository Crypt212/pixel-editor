import LayerManager from "#core/layers/layer-manager";
import Tool from "#core/tools/base-tool";
import ChangeRegion from "#services/change-region";
import Color from "#services/color";

/**
 * Contains graphics methods to draw on layers managed by a layer manager class
 * @class
 */
class LineTool extends Tool {
    #layerManager;
    state = "idle";

    /**
     * Sets a specific layer manager class for which the layers will be drawn on
     * @constructor
     */
    constructor(layerManager) {
        if (!(layerManager instanceof LayerManager))
            throw new TypeError(
                "Input type must be of instance of LayerSystem class",
            );

        this.#layerManager = layerManager;
    }

    createCommand({
        x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0,
        color = new Color({ hex: "#ff0000" }),
        size = 1
    }) {

        new Command({ name: "pen" });

        Command.action = function() {
            const setPixel = (x, y) => {
                if (
                    x < 0 ||
                    y < 0 ||
                    x >= this.#layerManager.width ||
                    y >= this.#layerManager.height
                )
                    return;

                this.layer.setColor(x, y, color, { validate: false });
            };

            this.drawPixel(
                x0,
                y0,
                size,
                true,
                setPixel,
            );

            if (startPosition.x !== endPosition.x && startPosition.y !== endPosition.y)
                this.drawLine(
                    x0,
                    y0,
                    x1,
                    y1,
                    () => 1,
                    (x, y) => {
                        this.drawPixel(
                            x,
                            y,
                            size,
                            true,
                            setPixel,
                        );
                    },
                );
        }

        return new Command();

    }

    action(pixelPosition) {

        let toRender = new ChangeRegion();

        switch (this.#toolName) {
            case "line":
                if (!this.#isActionStart) {
                    this.#layerManager.undo();
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
                this.#layerManager.addToHistory();

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
}

export default LineTool;
