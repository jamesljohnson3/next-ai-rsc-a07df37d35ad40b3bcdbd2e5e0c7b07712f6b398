'use server';
import Groq from 'groq-sdk'


import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';
 


const groq = new Groq()

export async function handler({ messages }: { messages: Message[] }) {
  // Request the OpenAI API for the response based on the prompt
  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    stream: true,
    messages: messages as any,
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
 
  // Respond with the stream
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