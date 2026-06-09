import { BottomNav } from "@/components/BottomNav";
import { HeaderMenu } from "@/components/HeaderMenu";

export function MobileShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#F8F9FA]">
      {title ? (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
              {title}
            </h1>
            <HeaderMenu />
          </div>
        </header>
      ) : null}
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
