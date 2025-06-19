export default class EventBus {

    private listeners: Map<string, Function[]> = new Map();

    on(event: string, callback: Function): Function {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback); // Return unsubscribe function
    }

    off(event: string, callback: Function) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            this.listeners.set(
                event,
                callbacks.filter(cb => cb !== callback)
            );
        }
    }

    emit(event: string, args: Object) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(args);
                } catch (err) {
                    console.error(`Error in ${event} handler:`, err);
                }
            });
        }
    }

    once(event: string, callback: Function) {
        const onceWrapper = (args: Object) => {
            this.off(event, onceWrapper);
            callback(args);
        };
        this.on(event, onceWrapper);
    }

    clear(event: string) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}
