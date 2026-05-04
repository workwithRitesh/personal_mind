import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { getWeatherByCity, getTopNews } from "./dataServices";
import { getYouTubeTranscript } from "../utils/youtubeHelper";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: `You are PersonalMind, an advanced AI Life Assistant. 
    You are proactive, thoughtful, and highly efficient.
    
    Capabilities:
    - Real-time weather, news, and financial data.
    - Deep memory of user preferences.
    - YouTube video summarization.
    - Task organization.
    
    Response Voice:
    - Professional yet empathetic.
    - Use bullet points for readability.
    - Avoid long paragraphs.
    
    Current Environment:
    Date: ${new Date().toLocaleDateString()}
    Time: ${new Date().toLocaleTimeString()}
    `
  });
};

export async function chatWithGemini(
  history: Content[],
  message: string,
  attachments: { mimeType: string; data: string }[] = []
) {
  let enrichedMessage = message;

  // YouTube Link Detection
  const ytMatch = message.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([\w-]{11})/);
  if (ytMatch) {
    try {
      const transcript = await getYouTubeTranscript(ytMatch[0]);
      if (transcript) {
        enrichedMessage += `\n\n[CONTEXT: YouTube Video Transcript:\n${transcript.slice(0, 15000)}]`;
      }
    } catch (e) {
      console.error("YT context failed", e);
    }
  }

  // Simple Intent Detection
  if (message.toLowerCase().includes("weather in")) {
    const city = message.split("weather in")[1]?.trim()?.split(" ")[0];
    if (city) {
      try {
        const weather = await getWeatherByCity(city);
        enrichedMessage += `\n\n[CONTEXT: The current weather in ${city} is ${weather.current_weather.temperature}°C, condition code ${weather.current_weather.weathercode}.]`;
      } catch (e) {}
    }
  }

  if (message.toLowerCase().includes("latest news") || message.toLowerCase().includes("headlines")) {
    try {
      const news = await getTopNews();
      const headlines = news.articles.slice(0, 3).map((a: any) => `- ${a.title}`).join("\n");
      enrichedMessage += `\n\n[CONTEXT: Recent Headlines:\n${headlines}]`;
    } catch (e) {}
  }

  const model = getGeminiModel();
  const chat = model.startChat({
    history: history,
  });

  const parts: (string | Part)[] = [enrichedMessage];
  
  if (attachments.length > 0) {
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });
  }

  const result = await chat.sendMessage(parts);
  const response = await result.response;
  return response.text();
}
