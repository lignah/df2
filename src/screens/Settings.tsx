import { useState } from "react";
import { questions } from "../data/bank";
import { isPlayable } from "../lib/quiz";
import { useProgress } from "../progress";
import { Shell } from "../components/Shell";

export function SettingsScreen() {
  const { progress, reset } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const n = Object.keys(progress.records).length;
  const total = questions.filter(isPlayable).length;

  return (
    <Shell>
      <header className="page-head">
        <p className="eyebrow">설정</p>
        <h1 className="page-title">학습 기록</h1>
      </header>

      <p className="muted">
        기록은 이 기기 브라우저에만 저장됨. 서버로 보내지 않음.
      </p>
      <p className="settings-count">
        저장됨 {n}문항 / 전체 {total}문항
      </p>

      {!confirm ? (
        <button
          type="button"
          className="btn-danger"
          onClick={() => setConfirm(true)}
          disabled={n === 0}
        >
          학습 기록 삭제
        </button>
      ) : (
        <div className="stack">
          <p>맞춘 문제와 틀린 문제를 모두 지움. 되돌릴 수 없음.</p>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              reset();
              setConfirm(false);
            }}
          >
            삭제 확인
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setConfirm(false)}
          >
            취소
          </button>
        </div>
      )}

      <section className="about">
        <h2 className="section-label">범위</h2>
        <p className="muted">
          디지털 포렌식 전문가 2급 필기 기출.
        </p>
      </section>
    </Shell>
  );
}
