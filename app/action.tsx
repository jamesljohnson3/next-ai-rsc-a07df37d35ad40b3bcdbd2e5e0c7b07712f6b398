"use server"
import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, EventsSkeleton, Events } from '@/components/llm-stocks';

// Define initial AI and UI state
const initialAIState: any[] = [];
const initialUIState: any[] = [];

// Create AI instance
export const AI = createAI({
  actions: {
    // Define the get_events action
    get_events: async () => {
      try {
        // Simulate loading by updating UI with skeleton
        const uiStream = createStreamableUI(
          <BotCard>
            <EventsSkeleton />
          </BotCard>
        );

        // Simulate fetching events data
        const events = await fetchEventData();

        // Simulate loading delay
        await sleep(1000);

        // Render the events using appropriate components
        const eventsComponent = (
          <BotCard>
            <Events events={events} />
          </BotCard>
        );

        // Update UI with fetched events
        uiStream.update(eventsComponent);

        // Return the updated UI
        return {
          id: Date.now(),
          display: uiStream.value,
        };
      } catch (error) {
        console.error('Error fetching events:', error);
        return {
          id: Date.now(),
          display: 'An error occurred while fetching events. Please try again later.',
        };
      }
    },

    // Define the submitUserMessage action
    submitUserMessage: async (userInput: string) => {
      // Update AI state with user input
      const aiState = getMutableAIState<typeof AI>();
      aiState.update([
        ...aiState.get(),
        {
          role: 'user',
          content: userInput,
        },
      ]);

      try {
        // Create a new Groq instance with your API key
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY
        });

        // Call Groq API to generate completion for user message
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: `\
            You are a stock trading conversation bot and you can help users buy stocks, step by step.
            You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.
            
            Messages inside [] means that it's a UI element or a user event. For example:
            - "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
            - "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.
            
            If the user requests purchasing a stock, call \`show_stock_purchase_ui\` to show the purchase UI.
            If the user just wants the price, call \`show_stock_price\` to show the price.
            If you want to show trending stocks, call \`list_stocks\`.
            If you want to show events, call \`get_events\`.
            If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.
            
            Besides that, you can also chat with users and do some calculations if needed.` },
            { role: "user", content: userInput }
          ],
          model: 'mixtral-8x7b-32768',
        });

        // Process the response from Groq API
        const assistantMessage = chatCompletion.choices[0]?.message?.content || '';

        // Update AI state with assistant's response
        const aiState = getMutableAIState<typeof AI>();
        aiState.done([
          ...aiState.get(),
          {
            role: 'assistant',
            content: assistantMessage,
          },
        ]);

        // Return assistant's response for display
        return {
          id: Date.now(),
          display: assistantMessage,
        };
      } catch (error) {
        // Handle errors
        console.error('Error:', error);
        // Return error message for display
        return {
          id: Date.now(),
          display: 'An error occurred. Please try again later.',
        };
      }
    },
  },
  initialUIState,
  initialAIState,
});

// Simulate fetching events data
async function fetchEventData() {
  // Placeholder logic for fetching event data
  await sleep(1000);

  // Return some dummy events data
  return [
    { date: '2024-03-15', headline: 'Event 1', description: 'Description of event 1' },
    { date: '2024-03-20', headline: 'Event 2', description: 'Description of event 2' },
    { date: '2024-03-25', headline: 'Event 3', description: 'Description of event 3' },
  ];
}