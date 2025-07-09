// src/core/event-emitter.ts
type EventMap = Record<string, any>;

export default class EventEmitter<T extends EventMap> {
    private listeners: {
        [K in keyof T]?: Array<(payload: T[K]) => void>
    } = {};

    on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): () => void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
        
        // Return unsubscribe function
        return () => this.off(event, listener);
    }

    off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
    }

    emit<K extends keyof T>(event: K, payload: T[K]): void {
        this.listeners[event]?.forEach(listener => listener(payload));
    }

    once<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
        const tempListener = (payload: T[K]) => {
            listener(payload);
            this.off(event, tempListener);
        };
        this.on(event, tempListener);
    }

    clear(): void {
        this.listeners = {};
    }
}
