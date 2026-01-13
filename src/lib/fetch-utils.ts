// ============================================
// Fetch Utilities
// Deduplication, throttling, and request management
// ============================================

/**
 * Request deduplication
 * Prevents concurrent identical requests by returning the same promise
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  const existing = pendingRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  // Create new request and store it
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Check if a request is currently pending
 */
export function isRequestPending(key: string): boolean {
  return pendingRequests.has(key);
}

/**
 * Clear a pending request (useful for force refresh)
 */
export function clearPendingRequest(key: string): void {
  pendingRequests.delete(key);
}

/**
 * Throttle function
 * Limits how often a function can be called
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else if (!timeout) {
      // Schedule trailing call
      timeout = setTimeout(() => {
        timeout = null;
        lastCall = Date.now();
        if (lastArgs) {
          fn(...lastArgs);
        }
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function
 * Delays function execution until after a period of inactivity
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn(...args);
    }, delay);
  };
}

/**
 * Create an AbortController with timeout
 */
export function createAbortController(timeoutMs?: number): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (timeoutMs) {
    timeoutId = setTimeout(() => {
      controller.abort(new DOMException("Request timeout", "TimeoutError"));
    }, timeoutMs);
  }

  return {
    controller,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}

/**
 * Request keys for deduplication
 */
export const REQUEST_KEYS = {
  exercises: "fetch:exercises",
  workouts: (userId: string) => `fetch:workouts:${userId}`,
  settings: (userId: string) => `fetch:settings:${userId}`,
  sessions: (userId: string) => `fetch:sessions:${userId}`,
} as const;

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff with jitter
      delay = Math.min(delay * 2 + Math.random() * 100, maxDelay);
    }
  }

  throw lastError;
}
