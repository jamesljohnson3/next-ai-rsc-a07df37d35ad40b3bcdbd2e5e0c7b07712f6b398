import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';
import type OpenAI from 'openai';
import zodToJsonSchema from 'zod-to-json-schema';
import { TAnyToolDefinitionArray, TToolDefinitionMap } from '@/lib/utils/tool-definition';
import Groq from 'groq-sdk';
import { AI } from "../action";

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

// Other utility functions and exports if any...
