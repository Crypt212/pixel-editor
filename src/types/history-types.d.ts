import PixelChanges from "@src/services/pixel-change.ts"

export const enum HistoryMove { Forward, Backward }

export type RecordData = {
    name: string,
    timestamp: number,
    change: PixelChanges,
    steps: PixelChanges[]
}
