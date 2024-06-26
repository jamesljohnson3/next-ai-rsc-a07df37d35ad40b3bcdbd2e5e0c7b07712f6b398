"use server"
import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, EventsSkeleton, Events, StocksSkeleton, Stocks, BotMessage, Purchase } from '@/components/llm-stocks';
import { z } from 'zod';
import  CustomFilter from  "./filter"
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
            You are a CRM conversation bot and you can help users query their Stripe information, step by step.
            
            Messages inside [] means that it's a UI element or a user event. For example:
            - "[Get 10 customers]" means that an interface of the list of 10 customers with name and emails is showsn to the user.
            
            If you want to show the list of customers, call \`list_customers\`.
            If you want to show the list of products, call \`list_products\`.
            If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.
            
            Besides that, you can also chat with users and do some calculations if needed.` },
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
          display: <CustomFilter content={assistantMessage}><div className='border shadow-xl bg-muted'>{assistantMessage}</div></CustomFilter>,
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