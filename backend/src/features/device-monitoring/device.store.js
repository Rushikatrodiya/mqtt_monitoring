// Pure data layer. In-memory map for the prototype.
// This is the seam for a future Postgres swap.

const store = new Map();

class DeviceStore {
  get(deviceId) {
    return store.get(deviceId);
  }

  getAll() {
    return Array.from(store.values());
  }

  upsertLastSeen(deviceId, timestamp) {
    const existing = store.get(deviceId) || { deviceId };
    existing.lastSeenAt = timestamp;
    store.set(deviceId, existing);
    return existing;
  }

  setStatus(deviceId, status) {
    const existing = store.get(deviceId) || { deviceId };
    existing.status = status;
    store.set(deviceId, existing);
    return existing;
  }
}

module.exports = new DeviceStore();
