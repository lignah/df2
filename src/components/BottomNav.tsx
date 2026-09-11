import { readRoute, go } from "../lib/hash";

function IconHome({ on }: { on: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReview({ on }: { on: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v14L12 16.5 5.5 20V6A1.5 1.5 0 0 1 7 4.5Z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGear({ on }: { on: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.2 3.8h3.6l.4 2.1 1.8.8 1.9-1.1 2.5 2.5-1.1 1.9.8 1.8 2.1.4v3.6l-2.1.4-.8 1.8 1.1 1.9-2.5 2.5-1.9-1.1-1.8.8-.4 2.1h-3.6l-.4-2.1-1.8-.8-1.9 1.1-2.5-2.5 1.1-1.9-.8-1.8-2.1-.4v-3.6l2.1-.4.8-1.8-1.1-1.9 2.5-2.5 1.9 1.1 1.8-.8.4-2.1Z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.6"
        fill={on ? "var(--bg)" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function BottomNav() {
  const route = readRoute();
  const current =
    route.name === "settings"
      ? "settings"
      : route.name === "review"
        ? "review"
        : "home";

  return (
    <nav className="nav" aria-label="하단 메뉴">
      <button
        className={current === "home" ? "nav-btn is-on" : "nav-btn"}
        onClick={() => go("#/")}
        type="button"
      >
        <IconHome on={current === "home"} />
        홈
      </button>
      <button
        className={current === "review" ? "nav-btn is-on" : "nav-btn"}
        onClick={() => go("#/review?tab=wrong")}
        type="button"
      >
        <IconReview on={current === "review"} />
        복습
      </button>
      <button
        className={current === "settings" ? "nav-btn is-on" : "nav-btn"}
        onClick={() => go("#/settings")}
        type="button"
      >
        <IconGear on={current === "settings"} />
        설정
      </button>
    </nav>
  );
}
