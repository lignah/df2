import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function Shell({
  children,
  nav = true,
}: {
  children: ReactNode;
  nav?: boolean;
}) {
  return (
    <div className={nav ? "frame" : "frame frame-quiz"}>
      <div className="frame-body">{children}</div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}
