import Color from "@src/services/color.js";
import { AppEventEmitter } from "@src/core/events.js";

export default class DualColorSelector {
    private colorContainer: HTMLElement;
    private selectedIndex: number = 0;
    private selections: [
        { color: Color, element: HTMLElement },
        { color: Color, element: HTMLElement }
    ];
    readonly defaultColors: [Color, Color] = [Color.get({ hex: "#ff8800" }), Color.get({ hex: "#0088ff" })];

    constructor(colorContainer: HTMLElement, events: AppEventEmitter) {
        this.colorContainer = colorContainer;
        const colorElements: HTMLElement[] = Array.from(this.colorContainer.querySelectorAll(".color-index"));
        this.selections = [
            {
                element: colorElements[0],
                color: this.defaultColors[0]
            },
            {
                element: colorElements[1],
                color: this.defaultColors[1]
            }
        ];
        this.resetColors();
        this.setupEvents(events);
    }

    switchColors(): Color {
        this.selections[0].element.classList.toggle("selected");
        this.selections[1].element.classList.toggle("selected");
        this.selectedIndex = (this.selectedIndex + 1) % 2;
        return this.selections[this.selectedIndex].color;
    }

    swapColors(): Color {
        this.selections.reverse();
        this.selections[0].element.classList.add("primary");
        this.selections[1].element.classList.remove("primary");
        this.selections[0].element.classList.toggle("selected");
        this.selections[1].element.classList.toggle("selected");
        return this.selections[this.selectedIndex].color;
    }

    resetColors(): Color {
        this.selections[0].color = this.defaultColors[0];
        this.selections[0].element.style.backgroundColor = this.selections[0].color.hex;
        this.selections[1].color = this.defaultColors[1];
        this.selections[1].element.style.backgroundColor = this.selections[1].color.hex;

        this.selections[0].element.classList.add("primary");
        this.selections[0].element.classList.add("selected");
        this.selections[1].element.classList.remove("primary");
        this.selections[1].element.classList.remove("selected");

        this.selectedIndex = 0;

        return this.selections[this.selectedIndex].color;
    }

    setColor(color: Color) {
        this.selections[this.selectedIndex].color = color;
        this.selections[this.selectedIndex].element.style.backgroundColor = color.hex;
    }

    get color(): Color {
        return this.selections[this.selectedIndex].color;
    }

    setupEvents(events: AppEventEmitter) {
        this.colorContainer.addEventListener("click", (event: MouseEvent) => {
            const colorIndex = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('color-index')) as HTMLElement;
            const swapColors = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('swap-colors')) as HTMLElement;
            const resetColors = event.composedPath()
                .find((el: HTMLElement) => el.classList?.contains('reset-colors')) as HTMLElement;

            if (colorIndex) {
                if (colorIndex.classList.contains("selected")) return;
                events.emit("dual-selector:colors-switched", {});
            } else if (swapColors) {
                events.emit("dual-selector:colors-swapped", {});
            } else if (resetColors) {
                events.emit("dual-selector:colors-reset", {});
            }
        });
    }
}
