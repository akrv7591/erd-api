import {QueueManager} from "./QueueManager";

export class RoomUpdateQueue {
  queueManager: QueueManager = new QueueManager();

  constructor(roomId: string) {
    RoomUpdateQueue._instances.set(roomId, this);
  }

  private static _instances = new Map<string, RoomUpdateQueue>();

  static getInstance(roomId: string) {
    if (!this._instances.has(roomId)) {
      this._instances.set(roomId, new RoomUpdateQueue(roomId));
    }

    const instance = this._instances.get(roomId);

    if (!instance) {
      throw new Error("RoomUpdateQueue instance not found");
    }

    return instance
  }
}
