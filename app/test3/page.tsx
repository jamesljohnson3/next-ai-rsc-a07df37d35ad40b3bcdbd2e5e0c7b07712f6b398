"use client"
import { useState } from 'react';
import { useUIState, useActions } from "ai/rsc";
import { AI } from './actions';

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.display}
        </div>
      ))}

      <form onSubmit={async (e) => {
        e.preventDefault();

        const userMessage = {
          id: Date.now(),
          display: <div>{inputValue}</div>,
        };
        setMessages((currentMessages) => [
          ...currentMessages,
          userMessage,
        ]);

        const response = await submitUserMessage(inputValue);
        const responseMessage = {
          id: Date.now() + 1, // Adjust the ID as needed
          display: response.ui, // Assuming response.ui is the correct property
        };
        setMessages((currentMessages) => [
          ...currentMessages,
          responseMessage,
        ]);

        setInputValue('');
      }}>
        <input
          placeholder="Send a message..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
      </form>
    </div>
  )
}
