
export async function getPicturesOfStocks(queries: { query: string }[]) {
    try {
      const API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
      const headers = {
        Authorization: API_KEY || '',
      };
      const picturesArray: string[][] = [];
  
      for (const queryObject of queries) {
        const { query } = queryObject; // Corrected spelling here
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, // Corrected spelling here
          { headers }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch pexels data for query '${query}': ${response.statusText}`);
        }
  
        const data = await response.json();
        const pictureUrls = data.photos.map((photo: any) => photo.src.medium);
        picturesArray.push(pictureUrls);
      }
  
      return picturesArray;
    } catch (error) {
      console.error("Error in Pexels", error);
      throw error;
    }
  }
  