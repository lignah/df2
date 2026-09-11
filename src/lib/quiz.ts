import type { Progress, Question, QuizMode, SubjectId } from "../types";

export function isPlayable(q: Question): boolean {
  return !q.flags?.incomplete;
}

export function grade(q: Question, choices: string[]): boolean | null {
  if (q.flags?.noAnswer) return null;
  const a = [...q.answer].sort().join(",");
  const b = [...new Set(choices)].sort().join(",");
  return a === b;
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQueue(
  questions: Question[],
  progress: Progress,
  opts: {
    subjectId: SubjectId;
    mode: QuizMode;
    random: boolean;
  },
): Question[] {
  let list = questions.filter(isPlayable);
  if (opts.subjectId !== "all") {
    list = list.filter((q) => q.subjectId === opts.subjectId);
  }
  const rec = progress.records;
  if (opts.mode === "unseen") {
    list = list.filter((q) => rec[q.id] == null);
  } else if (opts.mode === "wrong") {
    list = list.filter((q) => rec[q.id]?.correct === false);
  } else if (opts.mode === "correct") {
    list = list.filter((q) => rec[q.id]?.correct === true);
  }
  return opts.random ? shuffle(list) : list;
}

export type Stats = {
  total: number;
  correct: number;
  wrong: number;
  unseen: number;
  reviewed: number;
};

export function statsFor(
  questions: Question[],
  progress: Progress,
  subjectId: SubjectId = "all",
): Stats {
  const list = questions.filter(isPlayable).filter((q) =>
    subjectId === "all" ? true : q.subjectId === subjectId,
  );
  let correct = 0;
  let wrong = 0;
  let reviewed = 0;
  for (const q of list) {
    const rec = progress.records[q.id];
    if (!rec) continue;
    if (rec.correct === true) correct += 1;
    else if (rec.correct === false) wrong += 1;
    else reviewed += 1;
  }
  return {
    total: list.length,
    correct,
    wrong,
    reviewed,
    unseen: list.length - correct - wrong - reviewed,
  };
}
