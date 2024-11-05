type Task = () => Promise<void>;

export class QueueManager {
  private queue: Task[] = [];
  private isProcessing: boolean = false;

  // Adds a new task to the queue
  addTask(tasks: Task) {
    this.queue.push(tasks);
    this.processQueue();
  }

  // Processes tasks in the queue sequentially
  private async processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessing = false;
  }
}
