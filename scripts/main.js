import PixelBoard from "./pixel-board.js";

const toolsElem = document.getElementsByClassName("tools")[0];

const colorPalette = [];
for (let i = 0; i < 10; i++) {
    let color = "";
    for (let j = 0; j < 6; j++) {
        let rand = Math.floor(Math.random() * 16);
        if (rand <= 9) rand = String(rand);
        else rand = String.fromCharCode('a'.charCodeAt(0) + rand - 10);
        color += rand;
    }
    colorPalette.push(`#${color}`);
}

const colorsList = document.getElementsByClassName("palette-container")[0];
colorPalette.forEach(addColor);

function addColor(color) {
    let element = document.createElement("div");
    element.classList.add("color");
    element.classList.add("btn");
    element.style.backgroundColor = color;
    element.addEventListener("click", (event) => {
        document.querySelector(".color-index.selected").style.backgroundColor =
            event.target.style.backgroundColor;
        board.toolManager.setDrawingColor(
            event.target.style.backgroundColor,
        );
    });
    colorsList.appendChild(element);
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

const board = new PixelBoard(document.getElementById("canvas-container"));
board.createBlankBoard(64, 64);
board.render();

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
        board.toolManager.setDrawingColor(elm.style.backgroundColor);
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
            board.toolManager.setDrawingColor(
                secondary.style.backgroundColor,
            );
        } else {
            secondary.classList.remove("selected");
            primary.classList.add("selected");
            board.toolManager.setDrawingColor(primary.style.backgroundColor);
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
        board.toolManager.setDrawingColor(primary.style.backgroundColor);
    });

document.getElementById("undo").addEventListener("click", () => {
    board.undo();
});

document.getElementById("redo").addEventListener("click", () => {
    board.redo();
});

for (let elm of toolsElem.children) {
    //if (elm.classList[0] === "color-picker")
    //    elm.addEventListener("click", () => {
    //        let eyeDropper = new EyeDropper();
    //        try {
    //            let pickedColor = await eyeDropper.open();
    //            primaryColorSelector.style.background = pickedColor.sRGBHex;
    //        } catch (error) {
    //            console.log("error");
    //        }
    //        console.log(elm.classList[0]);
    //    });
    //else
        elm.addEventListener("click", () => {
            console.log(elm.classList[0]);
            board.toolManager.toolName = elm.classList[0];
        });
}
