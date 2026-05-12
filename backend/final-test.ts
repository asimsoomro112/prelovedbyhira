import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testFinal() {
  const modelName = "gemini-2.5-flash";
  console.log(`📡 Final Neural Link Test with ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Assalam-o-Alaikum! Tell me about PrelovedByHira.");
    console.log(`✅ FINAL SUCCESS! ${modelName} is ONLINE.`);
    console.log("Hira AI Response:", result.response.text());
  } catch (e: any) {
    console.log(`❌ ${modelName} FAILED: [${e.status}] ${e.message}`);
  }
}

testFinal();
