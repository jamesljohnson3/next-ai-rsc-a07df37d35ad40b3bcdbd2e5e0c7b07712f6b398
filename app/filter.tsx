export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  // Check if the content includes the list of trending stocks
  const isTrendingStocksListDisplayed = content.includes('trending stocks');

  // Check if the content includes the show_stock_price command
  const isShowStockPriceCommandDetected = content.includes('show_stock_price');

  return (
    <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
   {content}
      {children}
    </div>
  );
}
