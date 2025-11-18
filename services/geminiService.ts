import { GoogleGenAI, Type } from "@google/genai";

// fix: Initialize GoogleGenAI client directly with process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateContent = async (prompt: string, schema: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
};

const initialDataSchema = {
  type: Type.OBJECT,
  properties: {
    tropos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          nombre: { type: Type.STRING },
          slug: { type: Type.STRING },
          color: { type: Type.STRING },
        },
        required: ["id", "nombre", "slug", "color"],
      },
    },
    noticias: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          titulo: { type: Type.STRING },
          slug: { type: Type.STRING },
          bajada: { type: Type.STRING },
          cuerpo: { type: Type.STRING },
          imagen_url: { type: Type.STRING },
          is_image_external: { type: Type.BOOLEAN },
          tropo_id: { type: Type.INTEGER },
          timestamp: { type: Type.STRING },
          publishDate: { type: Type.STRING, description: "The publication date in YYYY-MM-DD format." },
          estado: { type: Type.STRING, enum: ["borrador", "publicada"] },
          author: { type: Type.STRING, description: "The author of the article. Can be null." },
        },
        required: ["id", "titulo", "slug", "bajada", "cuerpo", "imagen_url", "is_image_external", "tropo_id", "timestamp", "estado"],
      },
    },
  },
  required: ["tropos", "noticias"],
};

export const generateInitialData = async () => {
  const prompt = `
    Generate a set of initial data for a news application.
    - Create 4 distinct "tropos" (categories) like 'Technology', 'Sports', 'Business', and 'Science'. Each should have a unique ID, name, a URL-friendly slug, and a unique hex color code.
    - Create 8 "noticias" (news articles). 
    - For about half of the articles, add a realistic author name to an 'author' field. For the rest, leave it null or undefined.
    - Each noticia must be associated with one of the generated tropos via its 'tropo_id'.
    - Ensure each noticia has a unique ID, a compelling title, a URL-friendly slug, a brief summary ('bajada'), and an 'imagen_url' from picsum.photos (e.g., https://picsum.photos/800/600?random=ID), 'is_image_external' set to true, a valid ISO 8601 timestamp within the last week, a 'publishDate' in YYYY-MM-DD format using the same date as the timestamp, and a status ('estado') of 'publicada'.
    - The 'cuerpo' (article body) should be at least 5 paragraphs long and include HTML headings. Use '<h2>' for main headings and '<h3>' for subheadings. The content should be valid HTML using tags like <p>, <h2>, <h3>, <strong>, and <em>.
    - Return the data as a single JSON object with two keys: "tropos" and "noticias".
  `;
  return generateContent(prompt, initialDataSchema);
};

const scrapeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    image: { type: Type.STRING },
    content: { type: Type.STRING },
    author: { type: Type.STRING },
  },
  required: ["title", "description", "image", "content"],
};

export const scrapeUrl = async (url: string) => {
  const prompt = `
    Analyze the content of the webpage at this URL: ${url}.
    Extract the following information:
    1. The main title of the article (og:title or <title>).
    2. A concise summary or description (og:description or first meaningful paragraph).
    3. The primary image URL associated with the article (og:image or first significant <img> src).
    4. The main article content, as plain text. Extract at least a few paragraphs.
    5. The author's name, if available (e.g., from a byline or author meta tag).
    Return the extracted data in a JSON object with keys "title", "description", "image", "content", and "author". If a piece of information cannot be found, return an empty string or null for that key.
  `;
  return generateContent(prompt, scrapeSchema);
};