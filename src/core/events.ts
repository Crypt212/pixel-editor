// Core events.ts
export type CoreEvents = {
  // System lifecycle
  "MODULE_REGISTERED": { module: string },
  "DEPENDENCY_READY": { service: string },
  
  // User actions
  "TOOL_ACTION": { tool: string, action: "start" | "move" | "end", coordinates: [number, number] },
  
  // State changes
  "CANVAS_STATE_CHANGED": { layers: string[], activeLayer: string }
};
//
// // Extension pattern
// declare module "./events" {
//   interface EventTypes {
//     "CUSTOM_TOOL_EVENT": { customData: any };
//   }
// }
