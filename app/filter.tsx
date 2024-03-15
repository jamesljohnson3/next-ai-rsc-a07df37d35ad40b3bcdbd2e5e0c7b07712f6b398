export default async function Filter({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  // List of commands to check for
  const commandsToCheck = [
    'create_website',
    'modify_color',
    'choose_layout',
    'set_font',
    'discuss_marketing_strategy',
    'create_logo'
  ];

  // Variable to store the detected command
  let detectedCommand = '';

  // Check if any of the commands are found in the content
  commandsToCheck.forEach(command => {
    if (content.includes(command)) {
      detectedCommand = command;
    }
  });

  // Show default content only if one of the listed commands is detected
  if (!detectedCommand) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
        {content} No command detected
      </div>
    );
  }

  // If one of the commands is detected, render children with detected command
  return (
    <div className="flex flex-col sm:flex-row gap-2 py-4 -mt-2">
      {children} Detected command: {detectedCommand}
    </div>
  );
}
