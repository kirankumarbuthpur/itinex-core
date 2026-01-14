import { Link as LinkIcon } from "lucide-react";

export default function SkyscannerCTA({ href, label = "Find flights" }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="
        inline-flex items-center gap-2 px-3 py-1
        rounded-full bg-white/90 backdrop-blur
        border border-black/10
        text-xs font-semibold text-slate-900
        hover:bg-white
      "
      title="Open Skyscanner"
    >
      <LinkIcon className="w-4 h-4" />
      {label}
    </a>
  );
}
