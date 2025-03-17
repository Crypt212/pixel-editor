import PixelBoard from "./pixel-board.js";
import Tool from "./tool.js";

const toolsElem = document.getElementsByClassName("tools")[0];

const colorPalette = [
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#11ee11",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
    "#9f9f9f",
    "#5a5a5a",
    "#ee0f0f",
    "#2121da",
];

const colorsList = document.getElementsByClassName("palette-container")[0];
colorPalette.forEach(s);

function s(color) {
    let element = document.createElement("div");
    element.classList.add("color");
    element.classList.add("btn");
    element.style.backgroundColor = color;
    element.addEventListener("click", (event) => {
        document.querySelector(".color-index.selected").style.backgroundColor =
            Tool.drawColor = event.target.style.backgroundColor;
    });
    colorsList.appendChild(element);
}

for (let elm of toolsElem.children) {
    elm.addEventListener("click", () => {
        console.log(elm.classList[0]);
        Tool.name = elm.classList[0];
    });
}

function drawToCanvas(matrix) {
    const canvasElement = document.getElementById("canvas");
    const ctx = canvasElement.getContext("2d");

    const pixelSize = 1;
    canvasElement.width = matrix[0].length * pixelSize;
    canvasElement.height = matrix.length * pixelSize;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            ctx.fillStyle = matrix[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
}

function downloadCanvasAsPNG() {
    const canvas = document.getElementById("canvas");
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

document.getElementById("download-png").addEventListener("click", () => {
    drawToCanvas(canvas.colorsMatrix);
    downloadCanvasAsPNG();
});

document.querySelectorAll(".color-index").forEach((elm) => {
    elm.addEventListener("click", () => {
        document
            .querySelectorAll(".color-index")
            .forEach((e) => e.classList.remove("selected"));
        elm.classList.add("selected");
        Tool.drawColor = elm.style.backgroundColor;
    });
});

document
    .getElementsByClassName("swap-colors")[0]
    .addEventListener("click", () => {
        const primary = document.querySelector(".color-index.primary");
        const secondary = document.querySelector(".color-index.secondary");
        primary.classList.remove("primary");
        primary.classList.add("secondary");
        secondary.classList.remove("secondary");
        secondary.classList.add("primary");
        if (primary.classList.contains("selected")) {
            primary.classList.remove("selected");
            secondary.classList.add("selected");
            Tool.drawColor = secondary.style.backgroundColor;
        } else {
            secondary.classList.remove("selected");
            primary.classList.add("selected");
            Tool.drawColor = primary.style.backgroundColor;
        }
    });

document
    .getElementsByClassName("reset-colors")[0]
    .addEventListener("click", () => {
        const primary = document.querySelectorAll(".color-index")[0];
        const secondary = document.querySelectorAll(".color-index")[1];

        primary.classList.remove("secondary");
        primary.classList.add("primary");
        primary.classList.add("selected");
        secondary.classList.remove("primary");
        secondary.classList.add("secondary");
        secondary.classList.remove("selected");
        Tool.drawColor = primary.style.backgroundColor;
    });

async function pickColor() {
    let eyeDropper = new EyeDropper();
    try {
        let pickedColor = await eyeDropper.open();
        primaryColorSelector.style.background = pickedColor.sRGBHex;
    } catch (error) {
        console.log("error");
    }
}

const board = new PixelBoard(document.getElementById("canvas-container"));
board.createBlankBoard(32, 32);
board.render();

document.getElementById('undo').addEventListener('click', () => {
    board.undo();
});

document.getElementById('redo').addEventListener('click', () => {
    board.redo();
});

