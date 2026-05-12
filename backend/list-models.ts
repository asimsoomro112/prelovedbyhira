import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    console.log("Listing available models...");
    // The SDK doesn't always have a direct listModels method exposed easily in the same way, 
    // but we can try to guess or use a specific model that is guaranteed.
    // Let's try 'gemini-1.5-flash' again but with a different check.
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hi");
    console.log("gemini-pro works!");
  } catch (error: any) {
    console.error("gemini-pro failed:", error.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Hi");
    console.log("gemini-1.5-flash-latest works!");
  } catch (error: any) {
    console.error("gemini-1.5-flash-latest failed:", error.message);
  }
}

listModels();
