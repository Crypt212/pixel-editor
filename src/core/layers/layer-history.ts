import HistorySystem from "@src/generics/history-system.js";
import PixelChanges from "@src/services/pixel-change.js";
import { RecordData } from "@src/types/history-types.js";

export default class LayerHistory extends HistorySystem<RecordData> {
    constructor(capacity: number) {
        super(capacity, {
            name: "START",
            timestamp: Date.now(),
            change: new PixelChanges(),
            steps: []
        });
    }
}

