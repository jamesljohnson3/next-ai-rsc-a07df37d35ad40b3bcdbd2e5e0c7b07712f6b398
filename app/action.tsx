"use server"
import { createAI, getMutableAIState } from "ai/rsc";
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';
import { sleep } from '@/lib/utils';
import Groq from 'groq-sdk';
import React from 'react';

const groq = new Groq();

export async function submitUserMessage(content: string) {
  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  try {
    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      stream: true,
      messages: [{ role: 'user', content }],
    });

    const stream = OpenAIStream(completion);

    return new experimental_StreamingReactResponse(stream, {
      ui({ content }) {
        return (
          <div className="bg-white dark:bg-white text-black rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            {content}
          </div>
        );
      },
    });
  } catch (error) {
    console.error('Error submitting user message:', error);
    return {
      id: Date.now().toString(),
      display: 'An error occurred. Please try again later.',
    };
  }
}

export async function getEvents() {
  try {
    const events = await fetchEventData();

    await sleep(1000);

    return {
      id: Date.now().toString(),
      display: (
        <div className="bg-white dark:bg-white text-black rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {/* Render events here */}
        </div>
      ),
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      id: Date.now().toString(),
      display: 'An error occurred while fetching events. Please try again later.',
    };
  }
}

export async function listStocks(stocks: { symbol: string; price: number; delta: number }[]) {
  try {
    await sleep(1000);

    return {
      id: Date.now().toString(),
      display: (
        <div className="bg-white dark:bg-white text-black rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {/* Render stocks list here */}
        </div>
      ),
    };
  } catch (error) {
    console.error('Error listing stocks:', error);
    return {
      id: Date.now().toString(),
      display: 'An error occurred while listing stocks. Please try again later.',
    };
  }
}

async function fetchEventData() {
  await sleep(1000);
  return [
    { date: '2024-03-15', headline: 'Event 1', description: 'Description of event 1' },
    { date: '2024-03-20', headline: 'Event 2', description: 'Description of event 2' },
    { date: '2024-03-25', headline: 'Event 3', description: 'Description of event 3' },
  ];
}

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

export const AI = createAI({
  actions: {
    submitUserMessage,
    get_events: getEvents,
    show_stock_purchase_ui: submitUserMessage, // Use the same function for now
    list_stocks: listStocks,
  },
  initialUIState,
  initialAIState,
});