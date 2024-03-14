"use server"
import { getMutableAIState } from 'ai/rsc';
import Groq from 'groq-sdk';
import { createAI, createStreamableUI } from 'ai/rsc';
import { sleep } from '@/lib/utils';
import { BotCard, EventsSkeleton, Events } from '@/components/llm-stocks';

// Define initial AI and UI state
const initialAIState: any[] = [];
const initialUIState: any[] = [];

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

    // Define the submitUserMessage action
    submitUserMessage: async (userInput: string) => {
      // Update AI state with user input
      const aiState = getMutableAIState<typeof AI>();
      aiState.update([
        ...aiState.get(),
        {
          role: 'user',
          content: userInput,
        },
      ]);

      try {
        // Create a new Groq instance with your API key
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY
        });

        // Call Groq API to generate completion for user message
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a personal branding expert, skilled at crafting LinkedIn profiles and resume cover letters. The following is a LinkedIn headline and About section for [NAME]. Your goal is to improve this profile.Suggest 5 alternative LinkedIn headlines of no more than 220 characters each that are both memorable and keyword-rich. Consider incorporating a unique value proposition and professional specialty.Then write a draft of a new, improved LinkedIn About section of no less than 2500 characters. Focus on structuring it with a clear narrative, showcasing achievements with quantifiable results, and including a call to action." },
            { role: "user", content: userInput }
          ],
          model: 'mixtral-8x7b-32768',
        });

        // Process the response from Groq API
        const assistantMessage = chatCompletion.choices[0]?.message?.content || '';

        // Update AI state with assistant's response
        const aiState = getMutableAIState<typeof AI>();
        aiState.done([
          ...aiState.get(),
          {
            role: 'assistant',
            content: assistantMessage,
          },
        ]);

        // Return assistant's response for display
        return {
          id: Date.now(),
          display: assistantMessage,
        };
      } catch (error) {
        // Handle errors
        console.error('Error:', error);
        // Return error message for display
        return {
          id: Date.now(),
          display: 'An error occurred. Please try again later.',
        };
      }
    },
  },
  initialUIState,
  initialAIState,
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