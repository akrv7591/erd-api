import { QueueManager } from "../queue-manager";

export class RoomQueue {
  queueManager: QueueManager = new QueueManager();

  constructor(roomId: string) {
    RoomQueue._instances.set(roomId, this);
  }

  private static _instances = new Map<string, RoomQueue>();

  static getInstance(roomId: string) {
    if (!this._instances.has(roomId)) {
      this._instances.set(roomId, new RoomQueue(roomId));
    }

    const instance = this._instances.get(roomId);

    if (!instance) {
      throw new Error("RoomUpdateQueue instance not found");
    }

    return instance
  }
}
