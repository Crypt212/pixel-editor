export default class EventBus {
    listeners = new Map();
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback); // Return unsubscribe function
    }
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        }
    }
    emit(event, args) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(args);
                }
                catch (err) {
                    console.error(`Error in ${event} handler:`, err);
                }
            });
        }
    }
    once(event, callback) {
        const onceWrapper = (args) => {
            this.off(event, onceWrapper);
            callback(args);
        };
        this.on(event, onceWrapper);
    }
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        }
        else {
            this.listeners.clear();
        }
    }
}
