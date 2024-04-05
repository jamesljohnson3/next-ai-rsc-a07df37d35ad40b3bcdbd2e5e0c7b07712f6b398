"use client";// components/Pictures.tsx
// components/Pictures.tsx

import React, { useEffect, useState } from 'react';

type PictureProps = {
  initialQuery: string;
};

const Pictures: React.FC<PictureProps> = ({ initialQuery }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [pictureUrls, setPictureUrls] = useState<string[]>([]);

  const fetchPictures = async (query: string) => {
    try {
      const response = await fetch('/api/pexels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries: [{ query }] }),
      });

      if (response.ok) {
        const data = await response.json();
        setPictureUrls(data);
      } else {
        console.error('Failed to fetch pictures:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pictures:', error);
    }
  };

  useEffect(() => {
    if (query) {
      fetchPictures(query); // Fetch pictures when the query is set
    }
  }, [query]);

  return (
    <div className="flex flex-row w-full gap-2">
      {pictureUrls.map((pictureUrl, index) => (
        <div key={index} className="flex flex-col flex-1 h-full">
          <img
            className="size-6 bg-zinc-300 rounded-lg w-full mt-8 h-32 object-cover"
            src={pictureUrl}
            alt={`Picture ${index + 1}`}
            style={{ height: '115px' }}
          />
          <div className="text-sm text-zinc-500">Picture {index + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default Pictures;
