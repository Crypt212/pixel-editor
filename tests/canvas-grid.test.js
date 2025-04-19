import CanvasGrid from "../scripts/canvas-grid.js";
import Color from "../scripts/color.js";

describe("CanvasGrid", () => {
  let canvas;
  const testColor = Color.create({rgb: [255, 255, 0]});

  beforeAll(() => {
    // Mock ImageData for browser-like environment
    global.ImageData = class {
      constructor(data, width, height) {
        this.data = new Uint8ClampedArray(data);
        this.width = width;
        this.height = height;
      }
    };
  });

  describe("Initialization", () => {
    test("should create valid canvas with default size", () => {
      canvas = new CanvasGrid();
      expect(canvas.width).toBe(1);
      expect(canvas.height).toBe(1);
      expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
    });

    test.each([ [16, 16], [1024, 1024], [5, 10]
    ])("should create %ix%i canvas", (width, height) => {
      canvas = new CanvasGrid(width, height);
      expect(canvas.width).toBe(width);
      expect(canvas.height).toBe(height);
    });

    test.each([
      [0, 1], [1.5, 1], [1025, 1], [1, "invalid"]
    ])("should reject invalid dimensions %p", (width, height) => {
      expect(() => new CanvasGrid(width, height)).toThrow();
    });
  });

  describe("Pixel Operations", () => {
    beforeEach(() => {
      canvas = new CanvasGrid(16, 16);
    });

    test("should set and get pixel colors", () => {
      canvas.setColor(5, 5, testColor);
      expect(canvas.getColor(5, 5)).toEqual(testColor);
    });

    test("should validate coordinates", () => {
      expect(() => canvas.getColor(-1, 0)).toThrow("x");
      expect(() => canvas.getColor(16, 0)).toThrow("x");
      expect(() => canvas.getColor(0, -1)).toThrow("y");
      expect(() => canvas.getColor(0, 16)).toThrow("y");
    });

    test("should handle quiet updates", () => {
      canvas.setColor(5, 5, testColor, { quietly: true });
      expect(canvas.changeBuffer.isEmpty).toBe(true);
    });
  });

  describe("Change Tracking", () => {
    beforeEach(() => {
      canvas = new CanvasGrid(16, 16);
    });

    test("should track color changes", () => {
      canvas.setColor(0, 0, testColor);
      canvas.setColor(1, 1, testColor);
      
      const changes = canvas.changeBuffer.afterStates;
      expect(changes).toHaveLength(2);
      expect(changes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: 0, y: 0 }),
          expect.objectContaining({ x: 1, y: 1 })
        ])
      );
    });

    test("should reset change buffer", () => {
      canvas.setColor(0, 0, testColor);
      const oldBuffer = canvas.resetChangeBuffer();
      
      expect(oldBuffer.afterStates).toHaveLength(1);
      expect(canvas.changeBuffer.isEmpty).toBe(true);
    });
  });

  describe("Image Loading", () => {
    const createTestImage = (color, size = 2) => {
      const data = new Array(size * size * 4).fill(0).map((_, i) => 
        color[i % 4] ?? 0
      );
      return new ImageData(data, size, size);
    };

    test("should load full image", () => {
      const imageData = createTestImage([255, 0, 0, 1], 4);
      canvas.loadImage(imageData, 0, 0);
      
      expect(canvas.getColor(0, 0)).toEqual(Color.create({hex: '#f00'}));
      expect(canvas.getColor(3, 3)).toEqual(Color.create({hex: '#f00'}));
    });

    test("should handle partial out-of-bounds images", () => {
      const imageData = createTestImage([0, 255, 0, 128 / 255], 4);
      canvas.loadImage(imageData, 14, 14);
      
      // Should only modify pixels 14-15 in both dimensions
      expect(canvas.getColor(14, 14)).toEqual(Color.create({rgb: [0, 255, 0], alpha: 128 / 255}));
      expect(canvas.getColor(15, 15)).toEqual(Color.create({rgb: [0, 255, 0], alpha: 128 / 255}));
      expect(canvas.getColor(0, 0)).toEqual(Color.TRANSPARENT);
    });
  });

  describe("Edge Cases", () => {
    test("should handle minimum canvas size", () => {
      canvas = new CanvasGrid(1, 1);
      canvas.setColor(0, 0, testColor);
      expect(canvas.getColor(0, 0)).toEqual(testColor);
    });

    test("should handle maximum canvas size", () => {
      canvas = new CanvasGrid(1024, 1024);
      canvas.setColor(1023, 1023, testColor);
      expect(canvas.getColor(1023, 1023)).toEqual(testColor);
    });

    test("should reject invalid color types", () => {
      canvas = new CanvasGrid(16, 16);
      expect(() => canvas.setColor(0, 0, [255, 0, 0, 1])).toThrow("Color class");
    });
  });
});
