export class KeyedSerialQueue {
  private readonly tails = new Map<string, Promise<void>>();

  /** Runs work for one key in call order while allowing different keys to proceed concurrently. */
  async run<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    const completion = Promise.withResolvers<void>();
    this.tails.set(key, completion.promise);

    try {
      await previous;
      return await operation();
    } finally {
      completion.resolve();
      if (this.tails.get(key) === completion.promise) this.tails.delete(key);
    }
  }
}
