/** Runs an event-triggered worker task without allowing its rejection to escape the listener. */
export async function runBackgroundTask(
  label: string,
  operation: () => Promise<void>,
  report: (label: string, cause: Error) => void = reportBackgroundTaskFailure,
): Promise<void> {
  try {
    await operation();
  } catch (cause) {
    report(label, cause instanceof Error ? cause : new Error("Unknown background task failure."));
  }
}

function reportBackgroundTaskFailure(label: string, cause: Error): void {
  console.error(`[octobase] Failed while ${label}.`, cause);
}
