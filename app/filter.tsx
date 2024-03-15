

export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2  py-4 -mt-2">
    {content}
     {children}
    </div>
  );
}
