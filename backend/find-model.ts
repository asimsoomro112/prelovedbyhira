import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function findWorkingModel() {
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash",
    "gemini-3.1-flash-preview",
    "gemini-3.1-flash-live-preview"
  ];

  console.log("🔍 Scanning for a functional neural model...");

  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`✅ SUCCESS! ${m} is alive.`);
      return m;
    } catch (e: any) {
      console.log(`❌ ${m} FAILED: [${e.status}] ${e.message}`);
    }
  }
}

findWorkingModel();
