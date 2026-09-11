import raw from "./questions.json";
import type { Bank, Question, Subject } from "../types";

const bank = raw as Bank;

export const subjects: Subject[] = bank.subjects;
export const questions: Question[] = bank.questions;

export function subjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
