import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testProLatest() {
  const modelName = "gemini-pro-latest";
  console.log(`📡 Testing Neural Link with ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello Hira AI!");
    console.log(`✅ SUCCESS! ${modelName} is online.`);
    console.log("Response:", result.response.text());
  } catch (e: any) {
    console.log(`❌ ${modelName} FAILED: [${e.status}] ${e.message}`);
  }
}

testProLatest();
