import Color from "@src/services/color.js";
import { AppEventEmitter } from "@src/core/events.js";

export default class ColorPalette {
    private paletteContainer: HTMLElement;
    private colorMap: Map<HTMLElement, Color> = new Map();
    static readonly primary = '#4D6F99';

    constructor(paletteContainer: HTMLElement, events: AppEventEmitter) {
        this.paletteContainer = paletteContainer;
        this.setupEvents(events);
        for (let i = 0; i < 10; i++) {
            const color: Color = randomColor();
            this.addColor(color);
        }
    }
    addColor(color: Color) {
        let element: HTMLElement = document.createElement("div");
        element.classList.add("color");
        element.classList.add("btn");
        element.style.backgroundColor = color.hex;
        this.paletteContainer.appendChild(element);
        this.colorMap.set(element, color);
    }

    chooseColor(colorElement: HTMLElement): Color {
        return this.colorMap.get(colorElement);
    }

    setupEvents(events: AppEventEmitter) {
        // Click on any color on the palette
        this.paletteContainer.addEventListener("click", (event: MouseEvent) => {
            const colorElement = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('color')) as HTMLElement;
            const addColorElement = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('add-color')) as HTMLElement;

            if (addColorElement) {
                const color: Color = randomColor();
                events.emit("palette:color-added", { color });
            } else if (colorElement) {
                events.emit("palette:color-chose", { color: this.chooseColor(colorElement) });
            }
        });
    }
}

function randomColor(): Color {
    let colorHex = "";
    for (let j = 0; j < 6; j++) {
        const rand = Math.floor(Math.random() * 16);
        if (rand <= 9) colorHex += String(rand);
        else colorHex += String.fromCharCode('a'.charCodeAt(0) + rand - 10);
    }
    return Color.get({ hex: `#${colorHex}` });
}

