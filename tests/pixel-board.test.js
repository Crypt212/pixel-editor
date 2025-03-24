import PixelBoard from "../scripts/pixel-board.js";
import { validateNumber } from "./validation.js"; // Assuming this is where validateNumber is defined

describe("PixelBoard", () => {
    let pixelBoard;

    beforeEach(() => {
        const container = document.createElement("div"); // Create a container element
        container.style.width = "300px";
        container.style.height = "400px";
        pixelBoard = new PixelBoard(container); // Initialize PixelBoard with the container
    });

    test("should initialize with a HTMLElement variable that will contain the canvas", () => {
        expect(() => new PixelBoard()).toThrow(TypeError);
        expect(() => new PixelBoard("d")).toThrow(TypeError);
        expect(() => new PixelBoard(container)).not.toThrow(); // Initialize PixelBoard with the container
    });

    describe("createBlankBoard", () => {
        container.style.width = "300px";
        container.style.height = "400px";

        /*
         * will create 32x32 canvas and scale it to fit in the container,
         * this will make it scale to 300 300, with each pixel being of size around 9.4
         */
        pixelBoard.createBlankBoard(32, 32);


    });

    describe("getIntegerPosition", () => {
        test("should convert client coordinates to pixel coordinates correctly", () => {
            const clientX = 100;
            const clientY = 200;

            pixelBoard;

            pixelBoard.setScale(1);

            const position = pixelBoard.getIntegerPosition(clientX, clientY);
            expect(position).toEqual({ x: 200, y: 400 }); // Expect the output to match the input
        });

        it("should throw TypeError if clientX is not a number", () => {
            expect(() =>
                pixelBoard.getIntegerPosition("not-a-number", 200),
            ).toThrow(TypeError);
        });

        it("should throw TypeError if clientY is not a number", () => {
            expect(() =>
                pixelBoard.getIntegerPosition(100, "not-a-number"),
            ).toThrow(TypeError);
        });
    });
});
