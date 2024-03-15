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
      {isTrendingStocksListDisplayed && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Trending Stocks</h2>
          {/* Render the list of trending stocks here */}
   Hello  trends
          {/* Assuming TrendingStocksList component displays the list of trending stocks */}
        </div>
      )}
      {isShowStockPriceCommandDetected && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Stock Prices</h2>
          {/* Render stock prices here */}
        Hello prices
          {/* Assuming StockPrices component fetches and displays the stock prices */}
        </div>
      )}
      {!isTrendingStocksListDisplayed && !isShowStockPriceCommandDetected && (
        <p>{content}</p>
      )}
      {children}
    </div>
  );
}
