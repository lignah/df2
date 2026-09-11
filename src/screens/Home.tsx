import { subjects, questions } from "../data/bank";
import { statsFor } from "../lib/quiz";
import { go } from "../lib/hash";
import { useProgress } from "../progress";
import { ProgressBar } from "../components/ProgressBar";
import { Shell } from "../components/Shell";

export function Home() {
  const { progress } = useProgress();
  const all = statsFor(questions, progress, "all");
  const done = all.correct + all.wrong + all.reviewed;

  return (
    <Shell>
      <header className="page-head">
        <p className="eyebrow">국가공인 · 필기 기출</p>
        <h1 className="page-title">디지털 포렌식 전문가 2급</h1>
      </header>

      <section className="stat-card" aria-label="전체 진도">
        <div className="stat-row">
          <span>
            맞춘 <b className="ok">{all.correct}</b>
          </span>
          <span>
            틀린 <b className="bad">{all.wrong}</b>
          </span>
          <span>
            남은 <b>{all.unseen}</b>
          </span>
        </div>
        <ProgressBar
          value={done}
          max={all.total}
          label={`${done} / ${all.total}`}
        />
      </section>

      <h2 className="section-label">과목</h2>
      <ul className="subject-list">
        {subjects.map((s) => {
          const st = statsFor(questions, progress, s.id);
          const seen = st.correct + st.wrong + st.reviewed;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`subject-card subject-${s.id}`}
                onClick={() => go(`#/subject/${s.id}`)}
              >
                <div className="subject-card-top">
                  <span className="subject-name">{s.name}</span>
                  <span className="subject-count">{st.total}문항</span>
                </div>
                <ProgressBar
                  value={seen}
                  max={st.total}
                  label={`맞춘 ${st.correct} · 틀린 ${st.wrong} · 남은 ${st.unseen}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
