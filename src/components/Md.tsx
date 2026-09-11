import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Md({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="md">
      <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
    </div>
  );
}
