/**
 * @jest-environment jsdom
 */

import CanvasManager from "../scripts/canvas-manager.js";
import { validateNumber } from "../scripts/validation.js"; // Assuming this is where validateNumber is defined

describe("CanvasManager", () => {
    let canvasManager;
    let container;

    beforeEach(() => {
        // Set up a container element for the PixelBoard
        container = document.createElement('div');
        document.body.appendChild(container); 
        canvasManager = new CanvasManager(container); 
    });

    afterEach(() => {
        // Clean up after each test
        document.body.removeChild(container);
    });

    test('should create a canvas element inside the container', () => {
        const canvas = container.querySelector('#canvas-image');
        expect(canvas).not.toBeNull();
        expect(canvas.tagName).toBe('CANVAS');
    });

    test('should set the canvas size correctly', () => {
        const canvas = canvasManager.getCanvas;

        container.style.width  = "200px";
        container.style.height = "200px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(1);

        container.style.width =  "300px";
        container.style.height = "400px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(1.5);

        container.style.width =  "500px";
        container.style.height = "400px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(2);

        container.style.width =  "50px";
        container.style.height = "40px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(0.2);
        
        // -------------

        container.style.width =  "100px";
        container.style.height = "100px";
        canvasManager.createBlankCanvas(1, 1);
        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(1);
        expect(canvasManager.getInitialScale).toEqual(100);

        container.style.width =  "100px";
        container.style.height = "100px";
        canvasManager.createBlankCanvas(1024, 1024);
        expect(canvas.width).toBe(1024);
        expect(canvas.height).toBe(1024);
        expect(canvasManager.getInitialScale).toEqual(100 / 1024);
    });

    test("should update the canvas inital scaling if refreshed after changing the container or canvas size", () => {
        const canvas = canvasManager.getCanvas;

        container.style.width =  "300px";
        container.style.height = "400px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(1.5);

        container.style.width =  "100px";
        container.style.height = "100px";

        canvasManager.refresh(true);

        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(0.5);

        canvasManager.setDimensions(20, 10);

        expect(canvas.width).toBe(20);
        expect(canvas.height).toBe(10);

        expect(canvasManager.getInitialScale).toEqual(0.5); // no effect without refreshing

        canvasManager.refresh(true);

        expect(canvasManager.getInitialScale).toEqual(5);
    });

    test("should be able to scale the canvas up to pixel size and down to 0.5 and refresh to get the scaling effect", () => {
        const canvas = canvasManager.getCanvas;

        container.style.width =  "300px";
        container.style.height = "400px";
        canvasManager.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvasManager.getInitialScale).toEqual(1.5);
        expect(canvasManager.getScale).toEqual(1);
        
        expect(canvas.style.width).toBe("300px");

        canvasManager.setScale(2);

        expect(canvas.style.width).toBe("300px"); // no effect
        expect(canvas.style.height).toBe("300px"); // no effect
        expect(canvasManager.getScale).toEqual(2);

        canvasManager.refresh();

        expect(canvas.style.width).toBe("600px"); 
        expect(canvas.style.height).toBe("600px");
        expect(canvasManager.getScale).toEqual(2);

        canvasManager.setScale(200000000);
        canvasManager.refresh();

        expect(canvas.style.width).toBe(`${200 * 300}px`); 
        expect(canvas.style.height).toBe(`${200 * 300}px`);
        expect(canvasManager.getScale).toEqual(200);

        canvasManager.setScale(-25235235);
        canvasManager.refresh();

        expect(canvas.style.width).toBe(`150px`); 
        expect(canvas.style.height).toBe(`150px`);
        expect(canvasManager.getScale).toEqual(0.5);
    });
});
