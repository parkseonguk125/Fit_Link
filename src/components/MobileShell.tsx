import { BottomNav } from "@/components/BottomNav";

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
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </header>
      ) : null}
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
