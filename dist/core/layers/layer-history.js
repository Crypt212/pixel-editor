import HistorySystem from "../../generics/history-system.js";
import PixelChanges from "../../services/pixel-change.js";
export default class LayerHistory extends HistorySystem {
    constructor(capacity) {
        super(capacity, {
            name: "START",
            timestamp: Date.now(),
            change: new PixelChanges(),
            steps: []
        });
    }
}
