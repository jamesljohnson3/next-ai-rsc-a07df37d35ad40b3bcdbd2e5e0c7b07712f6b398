"use server";

import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, BotMessage, EventsSkeleton, Events, StocksSkeleton, Stocks, Purchase } from '@/components/llm-stocks';
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';

const initialAIState: any[] = [];
const initialUIState: any[] = [];

export const AI = createAI({
  actions: {
    get_events: async () => {
      try {
        const uiStream = createStreamableUI(
          <BotCard>
            <EventsSkeleton />
          </BotCard>
        );

        const events = await fetchEventData();

        await sleep(1000);

        const eventsComponent = (
          <BotCard>
            <Events events={events} />
          </BotCard>
        );

        uiStream.update(eventsComponent);

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
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY
        });

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
          stream: false,
        });

        const assistantMessage: Message = {
          id: Date.now(),
          role: 'assistant',
          content: chatCompletion.choices[0]?.message?.content || '',
        };
        const response: Message[] = [assistantMessage];
        const stream = OpenAIStream(response);

        const aiState = getMutableAIState<typeof AI>();
        aiState.done([
          ...aiState.get(),
          assistantMessage,
        ]);

        const streamingResponse = new experimental_StreamingReactResponse(stream, {
          ui({ content }) {
            return (
              <div className="bg-white dark:bg-white text-black  rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                {content}
              </div>
            );
          },
        });

        await consumeStream(stream); // Consume the stream
        return streamingResponse;
      } catch (error) {
        console.error('Error:', error);
        return {
          id: Date.now(),
          display: 'An error occurred. Please try again later.',
        };
      }
    },

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

async function fetchEventData() {
  await sleep(1000);
  return [
    { date: '2024-03-15', headline: 'Event 1', description: 'Description of event 1' },
    { date: '2024-03-20', headline: 'Event 2', description: 'Description of event 2' },
    { date: '2024-03-25', headline: 'Event 3', description: 'Description of event 3' },
  ];
}

const consumeStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
};
