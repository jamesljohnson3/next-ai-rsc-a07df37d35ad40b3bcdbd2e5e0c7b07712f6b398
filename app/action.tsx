"use server"
"use server";

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { spinner, BotCard, BotMessage, SystemMessage, Events } from '@/components/llm-stocks';
import { runAsyncFnWithoutBlocking, sleep, formatNumber } from '@/lib/utils';
import { z } from 'zod';
import { EventsSkeleton } from '@/components/llm-stocks/events-skeleton';

const groq = new Groq();

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
  }
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

async function confirmPurchase(symbol: string, price: number, amount: number) {
  const aiState = getMutableAIState<typeof AI>();

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>,
  );

  const systemMessage = createStreamableUI(null);

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000);

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>,
    );

    await sleep(1000);

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>,
    );

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>,
    );

    aiState.done([
      ...aiState.get(),
      {
        role: 'system',
        content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
          amount * price
        }]`,
      },
    ]);
  });

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: Date.now(),
      display: systemMessage.value,
    },
  };
}

async function submitUserMessage(content: string) {
  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  // Use groq to generate a response based on user input
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `\
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

Besides that, you can also chat with users and do some calculations if needed.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    model: 'mixtral-8x7b-32768',
  });

  // Extract the assistant's message from the completion
  const assistantMessage = completion.choices[0]?.message?.content || '';

  // Update the AI state with the assistant's message
  aiState.done([
    ...aiState.get(),
    {
      role: 'assistant',
      content: assistantMessage,
    },
  ]);

  // Return the assistant's message and display it
  return {
    id: Date.now(),
    display: assistantMessage,
  };
}

// Define necessary types and create the AI.
const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];
