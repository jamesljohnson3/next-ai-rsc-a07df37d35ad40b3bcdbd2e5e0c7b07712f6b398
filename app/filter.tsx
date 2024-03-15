
export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  // Check if the show_stock_price command is detected
  const isShowStockPriceCommandDetected = content.includes('show_stock_price');

  return (
    <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
      {isShowStockPriceCommandDetected ? content : null}
      {children}
    </div>
  );
}
