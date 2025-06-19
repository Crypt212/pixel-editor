/**
 * @jest-environment jsdom
 */

import Canvas from "#ui/canvas.js";

describe("Canvas", () => {
    let canvas;
    let container;

    beforeEach(() => {
        // Set up a container element for the PixelBoard
        container = document.createElement('div');
        document.body.appendChild(container); 
        canvas = new Canvas(container); 
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
        const canvas = canvas.getCanvas;

        container.style.width  = "200px";
        container.style.height = "200px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(1);

        container.style.width =  "300px";
        container.style.height = "400px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(1.5);

        container.style.width =  "500px";
        container.style.height = "400px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(2);

        container.style.width =  "50px";
        container.style.height = "40px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(0.2);
        
        // -------------

        container.style.width =  "100px";
        container.style.height = "100px";
        canvas.createBlankCanvas(1, 1);
        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(1);
        expect(canvas.getInitialScale).toEqual(100);

        container.style.width =  "100px";
        container.style.height = "100px";
        canvas.createBlankCanvas(1024, 1024);
        expect(canvas.width).toBe(1024);
        expect(canvas.height).toBe(1024);
        expect(canvas.getInitialScale).toEqual(100 / 1024);
    });

    test("should update the canvas inital scaling if refreshed after changing the container or canvas size", () => {
        const canvas = canvas.getCanvas;

        container.style.width =  "300px";
        container.style.height = "400px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(1.5);

        container.style.width =  "100px";
        container.style.height = "100px";

        canvas.refresh(true);

        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(0.5);

        canvas.setDimensions(20, 10);

        expect(canvas.width).toBe(20);
        expect(canvas.height).toBe(10);

        expect(canvas.getInitialScale).toEqual(0.5); // no effect without refreshing

        canvas.refresh(true);

        expect(canvas.getInitialScale).toEqual(5);
    });

    test("should be able to scale the canvas up to pixel size and down to 0.5 and refresh to get the scaling effect", () => {
        const canvas = canvas.getCanvas;

        container.style.width =  "300px";
        container.style.height = "400px";
        canvas.createBlankCanvas(200, 200);
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
        expect(canvas.getInitialScale).toEqual(1.5);
        expect(canvas.getScale).toEqual(1);
        
        expect(canvas.style.width).toBe("300px");

        canvas.setScale(2);

        expect(canvas.style.width).toBe("300px"); // no effect
        expect(canvas.style.height).toBe("300px"); // no effect
        expect(canvas.getScale).toEqual(2);

        canvas.refresh();

        expect(canvas.style.width).toBe("600px"); 
        expect(canvas.style.height).toBe("600px");
        expect(canvas.getScale).toEqual(2);

        canvas.setScale(200000000);
        canvas.refresh();

        expect(canvas.style.width).toBe(`${200 * 300}px`); 
        expect(canvas.style.height).toBe(`${200 * 300}px`);
        expect(canvas.getScale).toEqual(200);

        canvas.setScale(-25235235);
        canvas.refresh();

        expect(canvas.style.width).toBe(`150px`); 
        expect(canvas.style.height).toBe(`150px`);
        expect(canvas.getScale).toEqual(0.5);
    });
});
