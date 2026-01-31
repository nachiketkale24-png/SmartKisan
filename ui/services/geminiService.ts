
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeCropImage = async (base64Image: string, mimeType: string = 'image/jpeg') => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType } },
        { text: "Act as a plant pathologist. Analyze this crop image. Diagnose the disease, estimate its risk severity (0-100), assign a stress level (Low, Medium, or High), and provide 3-4 actionable suggestions for the farmer." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          disease: { type: Type.STRING },
          severity: { type: Type.NUMBER },
          stressLevel: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["disease", "severity", "stressLevel", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getFarmingAdvice = async (query: string, history: any[] = []) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are Kisan Sahayak, a friendly AI farming assistant. You help Indian farmers with crop health, irrigation, and pest control. Keep advice simple and actionable. Use common terminology. Answer in the language the user is using (Hindi, English, or Marathi)."
    }
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};
