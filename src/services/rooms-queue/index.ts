import { QueueManager } from "../queue-manager";

export class RoomQueue {
  // Initialize queue manager instance
  queueManager: QueueManager = new QueueManager();

  constructor(roomId: string) {
    // Store the current instance in the _instances Map for easy access later
    RoomQueue._instances.set(roomId, this);
  }

  private static _instances = new Map<string, RoomQueue>();

  /**
   * Returns an instance of RoomQueue based on the provided roomId.
   *
   * @param roomId The ID of the room to get the queue instance for.
   * @returns An instance of RoomQueue if found, otherwise throws an error.
   */
  static getInstance(roomId: string) {
    // Check if an instance already exists in the _instances Map
    if (!this._instances.has(roomId)) {
      // If not, create a new instance and add it to the Map
      this._instances.set(roomId, new RoomQueue(roomId));
    }

    // Retrieve the instance from the Map
    const instance = this._instances.get(roomId);

    // Check if the instance was successfully retrieved
    if (!instance) {
      throw new Error("RoomUpdateQueue instance not found");
    }

    return instance;
  }
}
