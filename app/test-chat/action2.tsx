'use server';
import Groq from 'groq-sdk'


import { OpenAIStream, experimental_StreamingReactResponse, Message } from 'ai';
 


const groq = new Groq()

export async function handler({ messages }: { messages: string }) {
  // Request the OpenAI API for the response based on the prompt
  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    stream: true,
    messages: [
      { role: "system", content: "You are a personal branding expert, skilled at crafting LinkedIn profiles and resume cover letters. The following is a LinkedIn headline and About section for [NAME]. Your goal is to improve this profile.Suggest 5 alternative LinkedIn headlines of no more than 220 characters each that are both memorable and keyword-rich. Consider incorporating a unique value proposition and professional specialty.Then write a draft of a new, improved LinkedIn About section of no less than 2500 characters. Focus on structuring it with a clear narrative, showcasing achievements with quantifiable results, and including a call to action." },
      { role: "user", content: messages }
    ],  });
 
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