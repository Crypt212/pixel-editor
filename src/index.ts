import PixelEditor from "@src/core/pixel-editor.js";
console.log(" Hello! ");

const canvasContainer: HTMLElement = document.querySelector("#canvas-container");
const paletteContainer: HTMLElement = document.querySelector("#palette-container");
const dualSelector: HTMLElement = document.querySelector("#user-colors");
const toolContainer: HTMLElement = document.querySelector(".tools");

const board = new PixelEditor({
    canvasContainer,
    paletteContainer,
    dualSelector,
    toolContainer
}, 63, 63);

board.render();

// Click on index colors

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
