

export default async function Filter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2  py-4 -mt-2">
     {children}
    </div>
  );
}
