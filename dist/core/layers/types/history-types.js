import HistorySystem from "../../../systems/history-system.js";
import { PixelChanges } from "../../../core/layers/types/pixel-types.js";
export class LayerHistory extends HistorySystem {
    constructor(capacity) {
        super(capacity, {
            name: "START",
            timestamp: Date.now(),
            change: new PixelChanges(),
            steps: []
        });
    }
}
