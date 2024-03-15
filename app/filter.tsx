export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  // Check if the show_stock_price command is detected for Microsoft (MSFT)
  const isShowStockPriceCommandDetected = content.includes('show_stock_price');

  return (
    <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
      {isShowStockPriceCommandDetected && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Stock Prices for Microsoft (MSFT)</h2>
          {/* Render stock prices for Microsoft here */}
      
      <>{content}</>
          {/* Assuming StockPrices component accepts a prop 'symbol' to fetch specific stock price */}
        </div>
      )}
      {children}
    </div>
  );
}
