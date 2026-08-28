// Minimal Entity-Component-System core.
// An entity is just a numeric id; components are plain data objects kept in
// per-type maps keyed by that id. Systems are plain functions that iterate
// the maps they need - there is no framework beyond this file.

export type EntityId = number;

export class ComponentStore<T> {
    private map = new Map<EntityId, T>();

    set(id: EntityId, value: T): void {
        this.map.set(id, value);
    }

    get(id: EntityId): T | undefined {
        return this.map.get(id);
    }

    has(id: EntityId): boolean {
        return this.map.has(id);
    }

    remove(id: EntityId): void {
        this.map.delete(id);
    }

    entries(): IterableIterator<[EntityId, T]> {
        return this.map.entries();
    }

    values(): IterableIterator<T> {
        return this.map.values();
    }

    keys(): IterableIterator<EntityId> {
        return this.map.keys();
    }

    get size(): number {
        return this.map.size;
    }
}

let nextEntityId = 1;

export function createEntity(): EntityId {
    return nextEntityId++;
}
