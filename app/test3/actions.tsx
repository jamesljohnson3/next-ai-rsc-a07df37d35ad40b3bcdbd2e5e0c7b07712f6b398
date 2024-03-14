import { createAI, getMutableAIState } from "ai/rsc";
import { OpenAIStream, experimental_StreamingReactResponse } from 'ai';
import type OpenAI from 'openai';
import zodToJsonSchema from 'zod-to-json-schema';
import { TAnyToolDefinitionArray, TToolDefinitionMap } from '@/lib/utils/tool-definition';
import Groq from 'groq-sdk';

const groq = new Groq();

export async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    stream: true,
    messages: [{ role: 'user', content }],
  });

  const stream = OpenAIStream(completion);

  return new experimental_StreamingReactResponse(stream, {
    ui({ content }) {
      return (
        <div className="bg-white dark:bg-white text-black  rounded-2xl mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {content} 
        </div>
      );
    },
  });
}

// Define the initial state of the AI. It can be any JSON object.
const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

// Create the AI instance
export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});
