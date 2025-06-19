import PixelEditor from "./core/pixel-editor.js";
import Color from "./services/color.js";
console.log(" Hello! ");
const containerElement = document.querySelector("#canvas-container");
const paletteContainer = document.querySelector(".palette-container");
const board = new PixelEditor(containerElement, 63, 63);
board.render();
const colorMap = new Map();
let selectedColors = [Color.get({ hex: "#ff0000" }), Color.get({ hex: "#00ff00" })];
// Fill the color palette with random shit
for (let i = 0; i < 10; i++) {
    let colorHex = "";
    for (let j = 0; j < 6; j++) {
        const rand = Math.floor(Math.random() * 16);
        if (rand <= 9)
            colorHex += String(rand);
        else
            colorHex += String.fromCharCode('a'.charCodeAt(0) + rand - 10);
    }
    const color = Color.get({ hex: `#${colorHex}` });
    const elem = createColorElement(color);
    colorMap.set(elem, color);
}
function createColorElement(color) {
    let element = document.createElement("div");
    element.classList.add("color");
    element.classList.add("btn");
    element.style.backgroundColor = color.hex;
    paletteContainer.appendChild(element);
    return element;
}
// Click on any color on the palette
paletteContainer.addEventListener("click", (event) => {
    const element = event.target;
    if (!element.classList.contains("color") || element.classList.contains("add-color"))
        return;
    document.querySelector(".color-index.selected")
        .style.backgroundColor = colorMap.get(element).hex;
    board.toolManager.drawingColor = colorMap.get(element);
});
// Click on index colors
document.querySelectorAll(".color-index").forEach((elm, index) => {
    elm.addEventListener("click", () => {
        if (elm.classList.contains("selected"))
            return;
        document.querySelectorAll(".color-index").forEach((e) => {
            e.classList.toggle("selected");
        });
        board.toolManager.drawingColor = selectedColors[index];
    });
});
document
    .getElementsByClassName("swap-colors")[0]
    .addEventListener("click", () => {
    const colorElements = Array.from(document.querySelectorAll(".color-index"));
    if (!colorElements[0].classList.contains(".primary"))
        colorElements.reverse();
    colorElements[0].classList.toggle("primary");
    colorElements[1].classList.toggle("primary");
    colorElements[0].classList.toggle("selected");
    colorElements[1].classList.toggle("selected");
    selectedColors = [selectedColors[1], selectedColors[0]];
    board.toolManager.drawingColor = selectedColors[0];
});
document
    .getElementsByClassName("reset-colors")[0]
    .addEventListener("click", () => {
    const colorElements = Array.from(document.querySelectorAll(".color-index"));
    colorElements[0].classList.add("primary");
    colorElements[0].classList.add("selected");
    colorElements[1].classList.remove("primary");
    colorElements[1].classList.remove("selected");
    board.toolManager.drawingColor = selectedColors[0];
});
const toolsElem = document.getElementsByClassName("tools")[0];
// function downloadCanvasAsPNG() {
//     const canvas: S = document.getElementById("canvas");
//     const link = document.createElement("a");
//     link.download = "pixel-art.png";
//     link.href = canvas.toDataURL("image/png");
//     link.click();
// }
//
// document.getElementById("download-png").addEventListener("click", () => {
//     drawToCanvas(canvas.colorsMatrix);
//     downloadCanvasAsPNG();
// });
//
// document.getElementById("undo").addEventListener("click", () => {
//     board.undo();
// });
//
// document.getElementById("redo").addEventListener("click", () => {
//     board.redo();
// });
//
// for (let elm of toolsElem.children) {
//     //if (elm.classList[0] === "color-picker")
//     //    elm.addEventListener("click", () => {
//     //        let eyeDropper = new EyeDropper();
//     //        try {
//     //            let pickedColor = await eyeDropper.open();
//     //            primaryColorSelector.style.background = pickedColor.sRGBHex;
//     //        } catch (error) {
//     //            console.log("error");
//     //        }
//     //        console.log(elm.classList[0]);
//     //    });
//     //else
//     elm.addEventListener("click", () => {
//         console.log(elm.classList[0]);
//         board.toolManager.toolName = elm.classList[0];
//     });
// }
// /*    "dev": "vite", "build": "vite build", */
