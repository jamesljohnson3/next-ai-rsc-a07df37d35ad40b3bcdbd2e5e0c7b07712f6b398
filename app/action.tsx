"use server";
import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, BotMessage, EventsSkeleton, Events, StocksSkeleton, Stocks, Purchase } from '@/components/llm-stocks';
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';

// Define initial states
const initialAIState: any[] = [];
const initialUIState: any[] = [];

// Create AI instance
export const AI = createAI({
  actions: {
    // Define action to fetch events
    get_events: async () => {
      try {
        // Create UI streamable for events
        const uiStream = createStreamableUI(
          <BotCard>
            <EventsSkeleton />
          </BotCard>
        );

        // Fetch events data
        const events = await fetchEventData();

        // Simulate delay
        await sleep(1000);

        // Update UI with events data
        const eventsComponent = (
          <BotCard>
            <Events events={events} />
          </BotCard>
        );
        uiStream.update(eventsComponent);

        // Return UI stream value
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

    // Define action to submit user message
    submitUserMessage: async (userInput: string) => {
      const aiState = getMutableAIState<typeof AI>();
      aiState.update([
        ...aiState.get(),
        {
          role: 'user',
          content: userInput,
        },
      ]);

      try {
        // Initialize Groq instance
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY
        });

        // Call Groq API for chat completions
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: `Your message content...` },
            { role: "user", content: userInput }
          ],
          model: 'mixtral-8x7b-32768',
          stream: false,
        });

        // Extract assistant message
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: chatCompletion.choices[0]?.message?.content || '',
        };
        
        // Create response array with assistant message
        const response: Message[] = [assistantMessage];

        // Create stream from response
        const stream = OpenAIStream(response);

        // Update AI state with assistant message
        const aiState = getMutableAIState<typeof AI>();
        aiState.done([
          ...aiState.get(),
          assistantMessage,
        ]);

        // Create streaming response
        const streamingResponse = new experimental_StreamingReactResponse(stream, {
          ui({ content }) {
            return (
              <div className="bg-white dark:bg-white text-black rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                {content}
              </div>
            );
          },
        });

        // Consume the stream
        await consumeStream(stream);

        // Return streaming response
        return streamingResponse;
      } catch (error) {
        console.error('Error:', error);
        return {
          id: Date.now(),
          display: 'An error occurred. Please try again later.',
        };
      }
    },

    // Define action to show stock purchase UI
    show_stock_purchase_ui: async ({ symbol, price, numberOfShares }: { symbol: string; price: number; numberOfShares?: number }) => {
      if (numberOfShares && (numberOfShares <= 0 || numberOfShares > 1000)) {
        return {
          id: Date.now(),
          display: <BotCard><BotMessage>Invalid amount</BotMessage></BotCard>,
        };
      }

      return {
        id: Date.now(),
        display: (
          <>
            <BotMessage>
              Sure!{' '}
              {typeof numberOfShares === 'number'
                ? `Click the button below to purchase ${numberOfShares} shares of $${symbol}:`
                : `How many $${symbol} would you like to purchase?`}
            </BotMessage>
            <BotCard showAvatar={false}>
              <Purchase
                defaultAmount={numberOfShares || 100}
                name={symbol}
                price={price}
              />
            </BotCard>
          </>
        ),
      };
    },

    // Define action to list stocks
    list_stocks: async ({ stocks }: { stocks: { symbol: string; price: number; delta: number }[] }) => {
      const uiStream = createStreamableUI(
        <BotCard>
          <StocksSkeleton />
        </BotCard>
      );

      await sleep(1000);

      const stocksComponent = (
        <BotCard>
          <Stocks stocks={stocks} />
        </BotCard>
      );

      uiStream.update(stocksComponent);

      return {
        id: Date.now(),
        display: uiStream.value,
      };
    },
  },
  initialUIState,
  initialAIState,
});

// Define function to fetch event data
async function fetchEventData() {
  await sleep(1000);
  return [
    { date: '2024-03-15', headline: 'Event 1', description: 'Description of event 1' },
    { date: '2024-03-20', headline: 'Event 2', description: 'Description of event 2' },
    { date: '2024-03-25', headline: 'Event 3', description: 'Description of event 3' },
  ];
}

// Define function to consume stream
const consumeStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
};

// Export AI instance
export default AI;
