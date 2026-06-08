export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <p className="text-base font-medium text-gray-800">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}
