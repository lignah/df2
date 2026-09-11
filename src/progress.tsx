import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearProgress,
  loadProgress,
  recordAnswer,
} from "./lib/storage";
import type { Progress } from "./types";

type Ctx = {
  progress: Progress;
  record: (id: string, choices: string[], correct: boolean | null) => void;
  reset: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(loadProgress);

  const record = useCallback(
    (id: string, choices: string[], correct: boolean | null) => {
      setProgress((prev) => recordAnswer(prev, id, choices, correct));
    },
    [],
  );

  const reset = useCallback(() => {
    setProgress(clearProgress());
  }, []);

  const value = useMemo(
    () => ({ progress, record, reset }),
    [progress, record, reset],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("ProgressProvider missing");
  return ctx;
}
