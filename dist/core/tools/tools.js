export {};
// import Tool from "@src/core/tools/tool";
// import { validateNumber } from "../../utils/validation";
//
// /**
//  * Contains graphics methods to draw on layers managed by a layer manager class
//  * @class
//  */
// export default class PixelTool {
//     private canvasWidth: number = 1;
//     private canvasHeight: number = 1;
//     private actionMethod: ActionFunction;
//
//     private recentPosition: PixelCoord = { x: 0, y: 0 };
//
//     private configs: Map<string, any>;
//
//     public selectedColor: Color = Color.TRANSPARENT;
//     public state = ToolState.IDLE;
//     public actionType = ActionType.CONSECUTIVE;
//
//
//     private static changes: PixelChanges = new PixelChanges();
//     public static image: ImageData;
//
//     /**
//      * Sets a specific layer manager class for which the layers will be drawn on
//      * @constructor
//      */
//     constructor() {
//     }
//
//     startDrawing(x: number, y: number) {
//         this.recentPosition = { x, y };
//         this.state = ToolState.DRAWING;
//     }
//
//     endDrawing() {
//         this.state = ToolState.IDLE;
//     }
//
//     setAction(actionMethod: ActionFunction) {
//         this.actionMethod = actionMethod;
//     }
//
//     private setPixel(x: number, y: number) {
//         if (
//             x < 0 ||
//             y < 0 ||
//             x >= this.canvasWidth ||
//             y >= this.canvasHeight
//         )
//             return;
//
//         const newColorState = { color: this.selectedColor };
//         const oldColorState = PixelTool.changes.getChange({ x, y }) ? PixelTool.changes.getChange({ x, y }).before : {
//             color: Color.create({
//                 rgb: [
//                     PixelTool.image.data[x * 4 + 0],
//                     PixelTool.image.data[x * 4 + 1],
//                     PixelTool.image.data[x * 4 + 2],
//                 ], alpha: PixelTool.image.data[x * 4 + 3] / 255
//             })
//         };
//
//         PixelTool.changes.setChange({ x, y }, newColorState, oldColorState);
//     };
//
//     applyAction(x: number, y: number): PixelChanges {
//         this.actionMethod({
//             x0: this.recentPosition.x,
//             y0: this.recentPosition.y,
//             x1: x,
//             y1: y,
//             toolConfigs: this.configs,
//             setPixel: this.setPixel
//         });
//
//         let changes = PixelTool.changes;
//         PixelTool.changes = new PixelChanges();
//         return changes;
//     }
// }
//
//
// export const penTool = new Tool();
//
// penTool.setAction( function(params: {
//     x0: number,
//     y0: number,
//     x1: number,
//     y1: number,
//     toolConfigs: Map<string, any>,
//     setPixel: (x: number, y: number) => void
// }) {
//     drawPixel(
//         params.x0,
//         params.y0,
//         params.toolConfigs.get("size"),
//         true,
//     );
//
//     drawLine(
//         params.x0,
//         params.y0,
//         params.x1,
//         params.y1,
//         () => 1,
//     );
// })
