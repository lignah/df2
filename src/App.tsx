import { useEffect, useState } from "react";
import { readRoute, type Route } from "./lib/hash";
import { Home } from "./screens/Home";
import { SubjectScreen } from "./screens/Subject";
import { QuizScreen } from "./screens/Quiz";
import { ReviewScreen } from "./screens/Review";
import { SettingsScreen } from "./screens/Settings";

export function App() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  switch (route.name) {
    case "subject":
      return <SubjectScreen subjectId={route.subjectId} />;
    case "quiz":
      return (
        <QuizScreen
          key={`${route.subjectId}:${route.mode}:${route.random}:${route.qid ?? ""}`}
          subjectId={route.subjectId}
          mode={route.mode}
          random={route.random}
          qid={route.qid}
        />
      );
    case "review":
      return <ReviewScreen tab={route.tab} subjectId={route.subjectId} />;
    case "settings":
      return <SettingsScreen />;
    default:
      return <Home />;
  }
}
