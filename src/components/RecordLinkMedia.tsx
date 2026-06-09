import { linkDisplayHost } from "@/lib/link-url";

export function RecordLinkMedia({ url }: { url: string }) {
  const host = linkDisplayHost(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#4A90A4]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
        🔗
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          {host}
        </span>
        <span className="block truncate text-xs text-gray-500">{url}</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-[#4A90A4]">열기</span>
    </a>
  );
}
