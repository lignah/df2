export type ChoiceKey = "가" | "나" | "다" | "라";

export type SubjectId = "arch" | "fs" | "appnet" | "db" | "intro" | "all";

export type Subject = {
  id: Exclude<SubjectId, "all">;
  needle: string;
  name: string;
  short: string;
  examCount: number;
};

export type Question = {
  id: string;
  subjectId: Exclude<SubjectId, "all">;
  lecture: number;
  title: string;
  stem: string;
  choices: { key: ChoiceKey; text: string }[];
  answer: ChoiceKey[];
  explanation: string;
  rounds: number[];
  flags?: { noAnswer?: boolean; incomplete?: boolean };
};

export type QuizMode = "all" | "unseen" | "wrong" | "correct";

export type RecordEntry = {
  lastChoices: string[];
  correct: boolean | null;
  updatedAt: number;
  seenCount: number;
};

export type Progress = {
  version: 1;
  records: Record<string, RecordEntry>;
};

export type Bank = {
  generatedAt: string;
  subjects: Subject[];
  questions: Question[];
};
