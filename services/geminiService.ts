
import { GoogleGenAI, Chat } from "@google/genai";
import { LearnSenseResponse } from "../types";
import { SYSTEM_INSTRUCTION, RESPONSE_SCHEMA } from "../constants";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL declaration
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getPartsForSource = async (source: File | string, label: string): Promise<any> => {
  if (source instanceof File) {
    const base64 = await fileToBase64(source);
    return {
      inlineData: {
        mimeType: source.type,
        data: base64,
      },
    };
  } else {
    return {
      text: `[${label} URL]: ${source}`,
    };
  }
};

const cleanJsonString = (text: string): string => {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const analyzeLesson = async (
  apiKey: string,
  expertSource: File | string,
  studentSource: File | string
): Promise<LearnSenseResponse> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-pro-preview";

  try {
    const parts: any[] = [
       { text: "Analyze the Expert Source Material and the Student's Model/Notes. Provide a lesson plan bridging the gap." }
    ];

    parts.push(await getPartsForSource(expertSource, "Expert Source"));
    parts.push(await getPartsForSource(studentSource, "Student Notes"));

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini.");
    }

    const cleanedText = cleanJsonString(response.text);
    const data: LearnSenseResponse = JSON.parse(cleanedText);
    return data;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = error.message || "Failed to analyze content.";
    if (errorMessage.includes("400")) {
      errorMessage = "The file type or content is not supported by the AI model. Please try PDF or Images.";
    }
    throw new Error(errorMessage);
  }
};

export const createTutorChat = async (
  apiKey: string,
  expertSource: File | string,
  studentSource: File | string,
  initialAnalysis: LearnSenseResponse
): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey });
  
  // We construct the history so the model knows about the files and the previous analysis.
  // This allows the user to ask questions about the video or notes directly.
  const history = [
    {
      role: 'user',
      parts: [
        { text: "Here are my study materials:" },
        await getPartsForSource(expertSource, "Expert Source"),
        await getPartsForSource(studentSource, "Student Notes")
      ]
    },
    {
      role: 'model',
      parts: [{ text: `I have analyzed your materials. Here is the summary: ${initialAnalysis.lightbulbMoment}` }]
    }
  ];

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are the 'Doubt Solver' and 'AI Teaching Assistant' for LearnSense. Answer the student's questions based on the uploaded expert content and their notes. You can provide step-by-step reasoning, examples, or explain concepts like they are 10 years old if asked. Be encouraging and precise.",
    },
  });

  return chat;
};

export const generateAnalogyImage = async (apiKey: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create a clear, simple educational diagram or illustration explaining this concept: ${prompt}. Use a clean, textbook illustration style with white background.` }],
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};
