import {
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SUBJECTS = [
  {
    id: "arch",
    needle: "컴퓨터구조",
    name: "컴퓨터구조와 디지털저장매체",
    short: "컴퓨터구조",
    examCount: 15,
  },
  {
    id: "fs",
    needle: "파일시스템",
    name: "파일시스템과 운영체제",
    short: "파일시스템",
    examCount: 15,
  },
  {
    id: "appnet",
    needle: "응용프로그램",
    name: "응용프로그램과 네트워크",
    short: "응용·네트워크",
    examCount: 15,
  },
  {
    id: "db",
    needle: "데이터베이스",
    name: "데이터베이스",
    short: "데이터베이스",
    examCount: 15,
  },
  {
    id: "intro",
    needle: "기초실무",
    name: "디지털포렌식 개론",
    short: "개론·법률",
    examCount: 40,
  },
];

const CHOICE_RE = /^- ([가나다라])\.\s*(.*)$/;
const HANGUL_CHOICE_RE = /[가나다라]/g;
const ROUND_RE = /(\d+)\s*회/g;
const LECTURE_HEADING_RE =
  /^#\s+(?:.*\s)?(\d{1,2})\s*강(?:\s*기출문제)?\s*$/;

function nfc(s) {
  return s.normalize("NFC");
}

function findSourceFile(needle) {
  const files = readdirSync(root).filter((f) => f.endsWith(".md"));
  const hit = files.find((f) => nfc(f).includes(needle));
  if (!hit) {
    throw new Error(`markdown not found: ${needle}`);
  }
  return join(root, hit);
}

function parseRounds(text) {
  const rounds = [];
  const seen = new Set();
  for (const m of text.matchAll(ROUND_RE)) {
    const n = Number(m[1]);
    if (!seen.has(n)) {
      seen.add(n);
      rounds.push(n);
    }
  }
  return rounds;
}

function parseTitle(headerLine) {
  const rest = headerLine.replace(/^##\s+\d+\.\s*/, "").trim();
  const rounds = parseRounds(rest);
  let title = rest;
  const parts = rest.split("—");
  if (parts.length > 1) {
    title = parts.slice(1).join("—").trim();
  } else {
    title = rest.replace(/^\([^)]*\)\s*/, "").trim();
  }
  if (!title) title = rest.replace(/[()]/g, "").trim() || "기출문제";
  return { title, rounds };
}

function parseAnswer(raw) {
  const text = raw.trim();
  if (
    /정답이 없는/.test(text) ||
    /정답\s*없음/.test(text) ||
    /^없음$/.test(text)
  ) {
    return { answer: [], noAnswer: true };
  }
  const main = text.split("*")[0].split("(")[0];
  const keys = [];
  const seen = new Set();
  for (const m of main.matchAll(HANGUL_CHOICE_RE)) {
    if (!seen.has(m[0])) {
      seen.add(m[0]);
      keys.push(m[0]);
    }
  }
  return { answer: keys, noAnswer: false };
}

function extractChoiceItems(lines) {
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(CHOICE_RE);
    if (!m) continue;
    const chunks = [m[2]];
    let j = i + 1;
    while (j < lines.length) {
      const line = lines[j];
      if (CHOICE_RE.test(line)) break;
      if (/^- [ㄱㄴㄷㄹ]\./.test(line)) break;
      if (/^\*\*정답/.test(line)) break;
      if (/^\*\*해설/.test(line)) break;
      if (/^##\s/.test(line)) break;
      if (/^#\s/.test(line)) break;
      if (/^---\s*$/.test(line)) break;
      chunks.push(line);
      j++;
    }
    items.push({
      key: m[1],
      text: chunks.join("\n").trim(),
      start: i,
      end: j,
    });
    i = j - 1;
  }
  return items;
}

function pickChoices(items) {
  if (items.length === 0) return { choices: [], start: -1, incomplete: true };

  const keys = items.map((it) => it.key);
  let end = keys.length;
  let start = -1;
  for (let i = keys.length - 1; i >= 0; i--) {
    const slice = keys.slice(i, end);
    const set = new Set(slice);
    if (
      set.size === 4 &&
      set.has("가") &&
      set.has("나") &&
      set.has("다") &&
      set.has("라")
    ) {
      start = i;
      break;
    }
  }

  if (start >= 0) {
    const chosen = items.slice(start, start + 4);
    const order = ["가", "나", "다", "라"];
    chosen.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    return { choices: chosen, start: items[start].start, incomplete: false };
  }

  return {
    choices: items,
    start: items[0].start,
    incomplete: true,
  };
}

function cutTrailingNotes(text) {
  const cutters = [
    /\n##\s+추출/,
    /\n추출 메모/,
    /\n<!--/,
    /\n---\s*$/m,
    /\n#\s+/,
  ];
  let out = text;
  for (const re of cutters) {
    const m = out.search(re);
    if (m >= 0) out = out.slice(0, m);
  }
  return out.trim();
}

function parseQuestionBlock(block, subjectId, lecture) {
  const lines = block.replace(/\s+$/, "").split("\n");
  const header = lines[0] || "";
  let { title, rounds: titleRounds } = parseTitle(header);

  const answerIdx = lines.findIndex((l) => /^\*\*정답:/.test(l));
  const explainIdx = lines.findIndex((l) => /^\*\*해설/.test(l));

  const rawAnswer =
    answerIdx >= 0
      ? lines[answerIdx].replace(/^\*\*정답:\*\*\s*/, "")
      : "";
  const { answer, noAnswer } = parseAnswer(rawAnswer);

  let explanation = "";
  if (explainIdx >= 0) {
    const first = lines[explainIdx].replace(/^\*\*해설[^*]*\*\*\s*/, "");
    const rest = lines.slice(explainIdx + 1).join("\n");
    explanation = cutTrailingNotes([first, rest].filter(Boolean).join("\n"));
  }

  const bodyLines = lines.slice(1, answerIdx >= 0 ? answerIdx : lines.length);
  const items = extractChoiceItems(bodyLines);
  const picked = pickChoices(items);

  let stemLines =
    picked.start >= 0 ? bodyLines.slice(0, picked.start) : bodyLines;
  stemLines = stemLines.filter(
    (l) =>
      !/^\*\*보기/.test(l) &&
      !/^\*\*선택지/.test(l) &&
      !/^\*\*문제\*\*\s*$/.test(l),
  );
  let stem = stemLines.join("\n").trim();
  stem = stem.replace(/^\*\*문제\*\*\s*/, "").trim();

  if (/^기출/.test(title) || title.length < 6) {
    const first = stem
      .replace(/\*\*/g, "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("```") && !l.startsWith("|"));
    if (first) {
      title = first.replace(/[?？]$/, "");
      if (title.length > 40) title = title.slice(0, 38).trim() + "…";
    }
  }

  const moreRounds = parseRounds(header + "\n" + block.slice(0, 400));
  const rounds = [...new Set([...titleRounds, ...moreRounds])].sort(
    (a, b) => a - b,
  );

  const incomplete =
    picked.incomplete ||
    picked.choices.length !== 4 ||
    (answer.length === 0 && !noAnswer);

  return {
    title,
    stem,
    choices: picked.choices.map((c) => ({ key: c.key, text: c.text })),
    answer,
    explanation,
    lecture,
    rounds,
    flags: {
      ...(noAnswer ? { noAnswer: true } : {}),
      ...(incomplete ? { incomplete: true } : {}),
    },
  };
}

function parseFile(text, subjectId) {
  const lines = text.split("\n");
  const questions = [];
  let lecture = 0;
  let current = [];

  const flush = () => {
    if (current.length === 0) return;
    const block = current.join("\n");
    if (!/^##\s+\d+\./.test(block)) {
      current = [];
      return;
    }
    questions.push(parseQuestionBlock(block, subjectId, lecture));
    current = [];
  };

  for (const line of lines) {
    const heading = nfc(line);
    if (
      heading.startsWith("# ") &&
      !/통합|모음|합본/.test(heading)
    ) {
      const lec = heading.match(LECTURE_HEADING_RE);
      if (lec) {
        flush();
        lecture = Number(lec[1]);
        continue;
      }
    }
    if (/^##\s+\d+\./.test(line)) {
      flush();
      current = [line];
      continue;
    }
    if (current.length) current.push(line);
  }
  flush();
  return questions;
}

function applyOverrides(questions, overrides) {
  for (const q of questions) {
    const ov = overrides[q.id];
    if (!ov) continue;
    if (Array.isArray(ov.answer)) q.answer = ov.answer;
    if (ov.noAnswer) {
      q.flags.noAnswer = true;
      q.answer = [];
    }
    if (ov.incomplete === false) delete q.flags.incomplete;
    if (ov.incomplete === true) q.flags.incomplete = true;
    if (Object.keys(q.flags).length === 0) delete q.flags;
  }
}

const overridesPath = join(root, "scripts/answer-overrides.json");
const overrides = existsSync(overridesPath)
  ? JSON.parse(readFileSync(overridesPath, "utf8"))
  : {};

const all = [];
const report = [];

for (const subject of SUBJECTS) {
  const file = findSourceFile(subject.needle);
  const text = readFileSync(file, "utf8");
  const parsed = parseFile(text, subject.id);
  const byLecture = new Map();
  parsed.forEach((q) => {
    const n = (byLecture.get(q.lecture) ?? 0) + 1;
    byLecture.set(q.lecture, n);
    q.id = `${subject.id}:${String(q.lecture).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
    q.subjectId = subject.id;
    if (q.flags && Object.keys(q.flags).length === 0) delete q.flags;
    all.push(q);
  });
  const incomplete = parsed.filter((q) => q.flags?.incomplete);
  report.push({
    subject: subject.id,
    total: parsed.length,
    incomplete: incomplete.map((q) => q.id + " " + q.title),
    noAnswer: parsed.filter((q) => q.flags?.noAnswer).map((q) => q.id),
    multi: parsed.filter((q) => q.answer.length > 1).map((q) => q.id),
  });
}

applyOverrides(all, overrides);

const outDir = join(root, "src/data");
mkdirSync(outDir, { recursive: true });

const payload = {
  generatedAt: new Date().toISOString(),
  subjects: SUBJECTS,
  questions: all,
};

writeFileSync(join(outDir, "questions.json"), JSON.stringify(payload, null, 2));

console.log("questions:", all.length);
for (const r of report) {
  console.log(
    `${r.subject}: ${r.total}  incomplete=${r.incomplete.length}  noAnswer=${r.noAnswer.length}  multi=${r.multi.length}`,
  );
  for (const line of r.incomplete) console.log("  incomplete", line);
  for (const id of r.noAnswer) console.log("  noAnswer", id);
  for (const id of r.multi) console.log("  multi", id);
}
