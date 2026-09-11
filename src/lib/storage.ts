import type { Progress, RecordEntry } from "../types";

const KEY = "df2.progress.v1";

export function emptyProgress(): Progress {
  return { version: 1, records: {} };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (parsed?.version !== 1 || typeof parsed.records !== "object" || !parsed.records) {
      return emptyProgress();
    }
    return parsed;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function recordAnswer(
  progress: Progress,
  id: string,
  lastChoices: string[],
  correct: boolean | null,
): Progress {
  const prev = progress.records[id];
  const entry: RecordEntry = {
    lastChoices,
    correct,
    updatedAt: Date.now(),
    seenCount: (prev?.seenCount ?? 0) + 1,
  };
  const next: Progress = {
    version: 1,
    records: { ...progress.records, [id]: entry },
  };
  saveProgress(next);
  return next;
}

export function clearProgress(): Progress {
  localStorage.removeItem(KEY);
  return emptyProgress();
}
