'use server';
import Groq from 'groq-sdk';
import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';
import { createAI, getMutableAIState, render } from "ai/rsc";

const groq = new Groq();

export async function handler({ messages }: { messages: Message[] }) {
  // Request the OpenAI API for the response based on the prompt
  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    stream: true,
    messages: messages as any,
  }).then((response) => {
    return OpenAIStream(response).map((info: any) => ({
      role: info.role,
      content: info.content,
      name: info.name,
    }));
  });
 
  // Respond with the stream
  return new experimental_StreamingReactResponse(response, {
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

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AI = createAI({
  actions: {
    submitUserMessage
  },
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState
});

// Define submitUserMessage function
async function submitUserMessage(userInput: string) {
  // Implementation goes here
}
