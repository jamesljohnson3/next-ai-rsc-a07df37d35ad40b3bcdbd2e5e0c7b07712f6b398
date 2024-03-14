
"use server"

import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, EventsSkeleton, Events, StocksSkeleton, Stocks, BotMessage, Purchase } from '@/components/llm-stocks';
import { z } from 'zod';
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai'; // Import OpenAIStream and experimental_StreamingReactResponse

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
            { role: "system", content: `Your message content...` },
            { role: "user", content: userInput }
          ],
          model: 'mixtral-8x7b-32768',
        });

        const assistantMessage = chatCompletion.choices[0]?.message?.content || '';

        const aiState = getMutableAIState<typeof AI>();
        aiState.done([
          ...aiState.get(),
          {
            role: 'assistant',
            content: assistantMessage,
          },
        ]);

        return {
          id: Date.now(),
          display: assistantMessage,
        };
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

      const response: Message[] = [{ role: 'assistant', content: uiStream.value }];
      const stream = OpenAIStream(response);

      const streamingResponse = new experimental_StreamingReactResponse(stream, {
        ui({ content }) {
          return (
            <div className="bg-white dark:bg-white text-black  rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              {content}
            </div>
          );
        }
      });

      await consumeStream(stream);

      return streamingResponse;
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
