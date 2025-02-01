const canvas = [];
const canvasElement = document.getElementById("canvas");
const canvasCells = [];
const tool = {
    toolIndex: 0,
    toolSize: 1,
};
const colorPalette = ["#9f9f9"];
let cellLength;

function initializeCanvas() {
    for (let i = 0; i < 120; i++) {
        canvas.push([]);
        for (let j = 0; j < 48; j++) {
            canvas[i].push(-1);
        }
    }
}

function initializePalette() {
    for (let i = 0; i < colorPalette.length; i++) {
        let color = document.createElement("div");
        color.className = "color";
    }
}

function initializeCanvasElement() {
    canvasElement.style.aspectRatio = canvas[0].length + ' / ' + canvas.length;
    for (let i = 0; i < canvas.length; i++) {
        canvasCells.push([]);
        let row = document.createElement("tr");
        canvasElement.appendChild(row);
        for (let j = 0; j < canvas[i].length; j++) {
            let cell = document.createElement("td");
            canvasCells[i].push(cell);
            row.appendChild(cell);
            if (canvas[i][j] == -1) {
                cell.style.backgroundColor =
                    (i + j) % 2 == 0 ? "#a0a0a0" : "#d9d9d9";
            } else cell.style.backgroundColor = canvas[i][j];
            cell.addEventListener("mousedown", actionOnCell);
        }
    }
}

function actionOnCell(cell) {
    switch (tool.toolIndex) {
        case 0: // pen
            drawTo(cell);
            break;
    }
}

document.querySelector(".container").addEventListener('wheel', event => {
event.preventDefault();
    let scale = 1;
    
    const delta = event.deltaY > 0 ? 0.97 : 1.03;
    let transform = getComputedStyle(canvasElement).transform
    if (transform !== 'none') {
        scale = new DOMMatrix(getComputedStyle(canvasElement).transform).a;
        if ((scale >= 8 && delta > 1) || (scale <= 0.9 && delta < 1)) return;
    } else {
        scale = 1;
    }
    canvasElement.style.transform = `scale(${scale * delta})`;
});

function drawTo(cell) { }

initializeCanvas();
initializeCanvasElement();
