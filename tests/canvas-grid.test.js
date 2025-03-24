import CanvasGrid from "../scripts/canvas-grid.js";

describe("CanvasGrid", () => {
    let assertDimentions;
    let cd;
    beforeEach(() => {
        assertDimentions = (expectedWidth, expectedHeight) => {
            expect(cd.getWidth).toBe(expectedWidth);
            expect(cd.getHeight).toBe(expectedHeight);
        };
    });
    describe("Construction", () => {
        test("should construct with (width, height) default values of (1, 1) if not given", () => {
            expect(() => (cd = new CanvasGrid())).not.toThrow();
            assertDimentions(1, 1);
            expect(() => (cd = new CanvasGrid(3))).not.toThrow();
            assertDimentions(3, 1);
            expect(() => (cd = new CanvasGrid(undefined, 3))).not.toThrow();
            assertDimentions(1, 3);
        });
        test("should throw an error if (width, height) values are not defined, not integers or not in range [1, 1024]", () => {
            expect(() => new CanvasGrid("a")).toThrow(
                TypeError("Width must be defined finite number"),
            );
            expect(() => new CanvasGrid(undefined, "1")).toThrow(
                TypeError("Height must be defined finite number"),
            );
            expect(() => new CanvasGrid(1, "1")).toThrow(
                TypeError("Height must be defined finite number"),
            );
            expect(() => new CanvasGrid([], 1)).toThrow(
                TypeError("Width must be defined finite number"),
            );
            expect(() => new CanvasGrid(0, 1024)).toThrow(
                RangeError(`Width must have:
Minimum of: 1
Maximum of: 1024
`),
            );
            expect(() => new CanvasGrid(2, -1)).toThrow(
                RangeError(`Height must have:
Minimum of: 1
Maximum of: 1024
`),
            );
            expect(() => new CanvasGrid(4, 2024)).toThrow(
                RangeError(`Height must have:
Minimum of: 1
Maximum of: 1024
`),
            );
        });
        test("should construct a canvas with specified width and height and initialize it with transparent pixel data", () => {
            expect(() => (cd = new CanvasGrid(2, 54))).not.toThrow();
            assertDimentions(2, 54);
            expect(() => cd.getColor(2, 54)).toThrow(
                RangeError(`x must have:
Minimum of: 0
Maximum of: 1
`),
            );
            expect(() => cd.getColor(2, 54 - 1)).toThrow(
                RangeError(`x must have:
Minimum of: 0
Maximum of: 1
`),
            );
            expect(() => cd.getColor(2 - 1, 54)).toThrow(
                RangeError(`y must have:
Minimum of: 0
Maximum of: 53
`),
            );
            expect(cd.getColor(2 - 1, 54 - 1)).toStrictEqual([0, 0, 0, 0]);
        });
    });

    describe("Functionality", () => {
        let cd;
        beforeEach(() => {
            cd = new CanvasGrid(16, 16);
        });

        beforeAll(() => {
            global.ImageData = class {
                constructor(data, width, height) {
                    this.data = []; // Uint8ClampedArray
                    this.width = width;
                    this.height = height;
                    for (let i = 0; i < this.width * this.height; i++) {
                        this.data.push(data[0]);
                        this.data.push(data[1]);
                        this.data.push(data[2]);
                        this.data.push(data[3]);
                    }
                }
            };
        });

        describe("Initializing blank canvas", () => {
            test("should throw an error if initialized blank canvas with (width, height) values that are not defined, not integers or not in range [1, 1024]", () => {
                expect(() => cd.initializeBlankCanvas()).toThrow(
                    TypeError("Width must be defined finite number"),
                );
                expect(() => cd.initializeBlankCanvas(1)).toThrow(
                    TypeError("Height must be defined finite number"),
                );
                expect(() => cd.initializeBlankCanvas([], "1")).toThrow(
                    TypeError("Width must be defined finite number"),
                );
                expect(() => cd.initializeBlankCanvas(4, 2024)).toThrow(
                    RangeError(`Height must have:
Minimum of: 1
Maximum of: 1024
`),
                );
                expect(() => cd.initializeBlankCanvas(2, 54)).not.toThrow();
            });

            test("should initialize blank canvas with valid width, and height", () => {
                expect(() => cd.initializeBlankCanvas(2, 1024)).not.toThrow();
                expect(cd.get(1, 24)).toStrictEqual({
                    x: 1,
                    y: 24,
                    color: [0, 0, 0, 0],
                });
                expect(cd.get(0, 0)).toStrictEqual({
                    x: 0,
                    y: 0,
                    color: [0, 0, 0, 0],
                });
                expect(cd.get(1, 1023)).toStrictEqual({
                    x: 1,
                    y: 1023,
                    color: [0, 0, 0, 0],
                });
                expect(() => cd.get(2, 24)).toThrow(
                    RangeError(`x must have:
Minimum of: 0
Maximum of: 1
`),
                );
                expect(() => cd.get(0, -24)).toThrow(
                    RangeError(`y must have:
Minimum of: 0
Maximum of: 1023
`),
                );
                expect(() => cd.get(3, 1024)).toThrow(
                    RangeError(`x must have:
Minimum of: 0
Maximum of: 1
`),
                );
            });
        });

        describe("Loading image data - Last action array", () => {
            test("should throw an error if loaded an image with invalid image data or if x and y are not finite integers", () => {
                expect(() => cd.loadImage()).toThrow(
                    TypeError(
                        "Image data must be defined instance of ImageData class",
                    ),
                );
                expect(() => cd.loadImage(undefined)).toThrow(
                    TypeError(
                        "Image data must be defined instance of ImageData class",
                    ),
                );
                expect(() => cd.loadImage(5)).toThrow(
                    TypeError(
                        "Image data must be defined instance of ImageData class",
                    ),
                );
                expect(() =>
                    cd.loadImage(
                        new ImageData(
                            new Uint8ClampedArray([0, 0, 0, 1], 16, 16),
                        ),
                        "a",
                        4,
                    ),
                ).toThrow("x must be defined finite number");
            });

            test("should load an image data sucessfully if all of it is in valid bounds", () => {
                const imageData = new ImageData(
                    new Uint8ClampedArray([255, 0, 0, 1]),
                    16,
                    16,
                ); // 16x16 red square
                expect(() => cd.initializeBlankCanvas(32, 32)).not.toThrow();
                expect(() => cd.loadImage(imageData)).not.toThrow();
                expect(cd.getColor(0, 0)).toStrictEqual([255, 0, 0, 1]);
                expect(cd.getColor(15, 15)).toStrictEqual([255, 0, 0, 1]);
                expect(cd.getColor(16, 16)).toStrictEqual([0, 0, 0, 0]);
            });

            test("should load an image data sucessfully except the part of it that is out of bound", () => {
                const imageData = new ImageData(
                    new Uint8ClampedArray([255, 0, 0, 1]),
                    4,
                    4,
                ); // 16x16 red square
                expect(() => cd.initializeBlankCanvas(32, 32)).not.toThrow();
                expect(() => cd.loadImage(imageData, -2, -2)).not.toThrow();
                expect(() => cd.loadImage(imageData, 32 - 2, -2)).not.toThrow();
                expect(() =>
                    cd.loadImage(imageData, 32 - 2, 32 - 2),
                ).not.toThrow();
                expect(() => cd.loadImage(imageData, -2, 32 - 2)).not.toThrow();
                expect(() => cd.loadImage(imageData, 100, 100)).not.toThrow(); // completely out of bound
                expect(cd.getLastActions).toStrictEqual([
                    {
                        x: 0,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 0,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },

                    {
                        x: 32 - 2,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 2,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },

                    {
                        x: 32 - 2,
                        y: 32 - 2,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 32 - 2,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 2,
                        y: 32 - 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 32 - 1,
                        color: [255, 0, 0, 1],
                    },

                    {
                        x: 0,
                        y: 32 - 2,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 32 - 2,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 0,
                        y: 32 - 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 32 - 1,
                        color: [255, 0, 0, 1],
                    },
                ]);
            });
            test("should be able to reset last actions array on demand", () => {
                const imageData = new ImageData(
                    new Uint8ClampedArray([255, 0, 0, 1]),
                    2,
                    2,
                ); // 16x16 red square
                expect(() => cd.initializeBlankCanvas(32, 32)).not.toThrow();
                expect(() => cd.loadImage(imageData, 0, 0)).not.toThrow();
                expect(cd.getLastActions).toStrictEqual([
                    {
                        x: 0,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 0,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                ]);
                expect(() => cd.loadImage(imageData, 32 - 2, 0)).not.toThrow();
                expect(cd.getLastActions).toStrictEqual([
                    {
                        x: 0,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 0,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 1,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },

                    {
                        x: 32 - 2,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 0,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 2,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                    {
                        x: 32 - 1,
                        y: 1,
                        color: [255, 0, 0, 1],
                    },
                ]);
                cd.resetLastActions();
                expect(cd.getLastActions).toStrictEqual([]); // got emptied
            });
        });

        describe("Color maniqulations", () => {
            test("should set the color of a single pixel", () => {
                const color = [255, 0, 0, 1];
                cd.setColor(5, 5, color, { radius: 0 });
                cd.setColor(2, 8, color, { radius: 0 });

                expect(cd.getColor(5, 5)).toStrictEqual(color);
                expect(cd.getColor(2, 8)).toStrictEqual(color);
                expect(cd.getLastActions).toStrictEqual([
                    { x: 5, y: 5, color: color },
                    { x: 2, y: 8, color: color },
                ]);
            });

            test("should handle transparency correctly", () => {
                const color = [255, 0, 0, 0]; // Fully transparent
                cd.setColor(5, 5, color, { radius: 0 });

                expect(cd.getColor(5, 5)).toStrictEqual([0, 0, 0, 0]); // Should be transparent black
            });

            test("should not change pixels if quietly is true", () => {
                const color = [255, 0, 0, 1]; // Red color
                cd.setColor(5, 5, color, { radius: 1, quietly: true });

                expect(cd.getColor(5, 5)).toBe(color); // Color changed
                expect(cd.getLastActions).toStrictEqual([]); // No actions should be recorded
            });

            test("should throw an error for invalid coordinates", () => {
                const color = [255, 0, 0, 1];
                expect(() => cd.setColor(-1, 5, color)).toThrow(
                    TypeError(`x must have:
Minimum of: 0
Maximum of: 15
`),
                );
            });

            test("should throw an error for invalid color array", () => {
                const invalidColor = [256, 0, 0, 1]; // Invalid red value
                expect(() => cd.setColor(5, 5, invalidColor)).toThrow(
                    TypeError(
                        "Color rgb values (at indices 0, 1, 2) must be between 0 and 255 inclusive",
                    ),
                );
            });
        });
    });
});
