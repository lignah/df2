export type Route =
  | { name: "home" }
  | { name: "subject"; subjectId: string }
  | {
      name: "quiz";
      subjectId: string;
      mode: string;
      random: boolean;
      qid: string | null;
    }
  | { name: "review"; tab: string; subjectId: string | null }
  | { name: "settings" };

function parseHash(hash: string): Route {
  const raw = (hash || "#/").replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const params = new URLSearchParams(queryPart || "");

  if (parts[0] === "subject" && parts[1]) {
    return { name: "subject", subjectId: parts[1] };
  }
  if (parts[0] === "quiz" && parts[1]) {
    return {
      name: "quiz",
      subjectId: parts[1],
      mode: params.get("mode") || "all",
      random: params.get("random") === "1",
      qid: params.get("qid"),
    };
  }
  if (parts[0] === "review") {
    return {
      name: "review",
      tab: params.get("tab") || "wrong",
      subjectId: params.get("subject"),
    };
  }
  if (parts[0] === "settings") return { name: "settings" };
  return { name: "home" };
}

export function readRoute(): Route {
  return parseHash(window.location.hash);
}

export function go(path: string): void {
  const next = path.startsWith("#") ? path : `#${path}`;
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = next;
}

export function quizPath(
  subjectId: string,
  opts: { mode?: string; random?: boolean; qid?: string } = {},
): string {
  const params = new URLSearchParams();
  params.set("mode", opts.mode || "all");
  if (opts.random) params.set("random", "1");
  if (opts.qid) params.set("qid", opts.qid);
  return `#/quiz/${subjectId}?${params.toString()}`;
}
