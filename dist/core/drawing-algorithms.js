export function drawPixel({ x, y, diameter = 5, isSquare = false, setPixel }) {
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
                setPixel(currentX, currentY);
            }
    else
        // For circular area
        for (let currentY = startY; currentY < endY; currentY++)
            for (let currentX = startX; currentX < endX; currentX++) {
                const dx = x - currentX - 0.5;
                const dy = y - currentY - 0.5;
                if (dx * dx + dy * dy <= radiusSquared) {
                    setPixel(currentX, currentY);
                }
            }
}
export function drawLine({ x0, y0, x1, y1, setPixel }) {
    // Standard Bresenham's algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
        setPixel(x0, y0);
        if (x0 === x1 && y0 === y1)
            break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
export function drawVaryingThicknessLine({ x0, y0, x1, y1, thicknessFunction, setPixel }) {
    const drawPrepLine = (x0, y0, dx, dy, width, initError, initWidth, direction) => {
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
            setPixel(x, y);
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
    const drawLineRightLeftOctents = (x0, y0, x1, y1, thicknessFunction) => {
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
                drawPrepLine(x, y, dx * stepX, dy * stepY, thicknessFunction(i) / 2, prepError, error, dir);
            });
            if (error > threshold) {
                y += stepY;
                error += diagonalError;
                if (prepError > threshold) {
                    [1, -1].forEach((dir) => {
                        drawPrepLine(x, y, dx * stepX, dy * stepY, thicknessFunction(i) / 2, prepError + diagonalError + stepError, error, dir);
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
        drawLineRightLeftOctents(y0, x0, y1, x1, thicknessFunction);
    else
        drawLineRightLeftOctents(x0, y0, x1, y1, thicknessFunction);
}
