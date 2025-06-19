import PixelChanges from "@src/services/pixel-change.js";

export default interface Historyable {
    startAction(name: string): void;
    commitStep(): PixelChanges;
    cancelAction(): void;
    endAction(): void;
    undo(): void;
    redo(): void;
};
