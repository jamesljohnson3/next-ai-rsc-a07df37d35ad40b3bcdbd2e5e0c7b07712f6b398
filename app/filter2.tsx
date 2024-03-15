export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  // Check if the content includes the create_website command
  const isCreateWebsiteCommandDetected = content.includes('create_website');

  // Check if the content includes the modify_color command
  const isModifyColorCommandDetected = content.includes('modify_color');

  // Check if the content includes the discuss_marketing_strategy command
  const isDiscussMarketingStrategyCommandDetected = content.includes('discuss_marketing_strategy');

  return (
    <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
      {isCreateWebsiteCommandDetected && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Create Website</h2>
          {/* Render create website UI here */}
          Hello, create your website!
        </div>
      )}
      {isModifyColorCommandDetected && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Modify Color</h2>
          {/* Render modify color UI here */}
          Hello, modify your website color!
        </div>
      )}
      {isDiscussMarketingStrategyCommandDetected && (
        <div className="border border-gray-300 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Discuss Marketing Strategy</h2>
          {/* Render discuss marketing strategy UI here */}
          Hello, let's discuss your marketing strategy!
        </div>
      )}
      {!isCreateWebsiteCommandDetected && !isModifyColorCommandDetected && !isDiscussMarketingStrategyCommandDetected && (
        <p>{content}</p>
      )}
      {children}
    </div>
  );
}
