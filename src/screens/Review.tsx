import { questions, subjects } from "../data/bank";
import { isPlayable } from "../lib/quiz";
import { go, quizPath } from "../lib/hash";
import { useProgress } from "../progress";
import { Shell } from "../components/Shell";
import type { Question } from "../types";

type Tab = "wrong" | "correct" | "all";

function tabOf(v: string): Tab {
  if (v === "correct" || v === "all") return v;
  return "wrong";
}

export function ReviewScreen({
  tab,
  subjectId,
}: {
  tab: string;
  subjectId: string | null;
}) {
  const { progress } = useProgress();
  const current = tabOf(tab);
  const playable = questions.filter(isPlayable);

  const filtered = playable.filter((q) => {
    if (subjectId && q.subjectId !== subjectId) return false;
    const rec = progress.records[q.id];
    if (current === "wrong") return rec?.correct === false;
    if (current === "correct") return rec?.correct === true;
    return rec != null;
  });

  filtered.sort(
    (a, b) =>
      (progress.records[b.id]?.updatedAt ?? 0) -
      (progress.records[a.id]?.updatedAt ?? 0),
  );

  const open = (q: Question) => {
    const mode = current === "all" ? "all" : current;
    go(
      quizPath(q.subjectId, {
        mode,
        qid: q.id,
      }),
    );
  };

  const startAll = () => {
    if (filtered.length === 0) return;
    const sid = subjectId || "all";
    const mode = current === "all" ? "all" : current;
    go(quizPath(sid, { mode }));
  };

  const emptyText =
    current === "wrong"
      ? "아직 틀린 문제가 없음"
      : current === "correct"
        ? "아직 맞춘 문제가 없음"
        : "아직 푼 문제가 없음";

  return (
    <Shell>
      <header className="page-head">
        <p className="eyebrow">복습</p>
        <h1 className="page-title">맞춘 문제 · 틀린 문제</h1>
      </header>

      <div className="seg" role="tablist">
        {(["wrong", "correct", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={current === t}
            className={current === t ? "seg-btn is-on" : "seg-btn"}
            onClick={() =>
              go(
                `#/review?tab=${t}${subjectId ? `&subject=${subjectId}` : ""}`,
              )
            }
          >
            {t === "wrong" ? "틀린" : t === "correct" ? "맞춘" : "푼 문제"}
          </button>
        ))}
      </div>

      <div className="chips">
        <button
          type="button"
          className={!subjectId ? "chip-btn is-on" : "chip-btn"}
          onClick={() => go(`#/review?tab=${current}`)}
        >
          전체
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            className={subjectId === s.id ? "chip-btn is-on" : "chip-btn"}
            onClick={() => go(`#/review?tab=${current}&subject=${s.id}`)}
          >
            {s.short}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <button type="button" className="btn-primary review-start" onClick={startAll}>
          {filtered.length}문항 풀기
        </button>
      ) : null}

      {filtered.length === 0 ? (
        <p className="empty">{emptyText}</p>
      ) : (
        <ul className="review-list">
          {filtered.map((q) => {
            const rec = progress.records[q.id];
            const sub = subjects.find((s) => s.id === q.subjectId);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className="review-item"
                  onClick={() => open(q)}
                >
                  <span className="review-item-top">
                    <span className={`chip chip-${q.subjectId}`}>
                      {sub?.short}
                    </span>
                    {rec?.correct === true ? (
                      <span className="ok">맞음</span>
                    ) : rec?.correct === false ? (
                      <span className="bad">틀림</span>
                    ) : (
                      <span className="muted">확인</span>
                    )}
                  </span>
                  <span className="review-title">{q.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}
