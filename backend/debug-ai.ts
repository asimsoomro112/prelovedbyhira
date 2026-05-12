import { GoogleGenerativeAI } from '@google/generative-ai';

async function testAI() {
  const key = "AIzaSyB_dIl2QG1zL-AthCnmEgN_ea78VK8qTi8";
  const genAI = new GoogleGenerativeAI(key);
  
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-flash-latest", "gemini-3.1-flash-preview"];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`✅ ${m} WORKS! Response: ${result.response.text().substring(0, 50)}...`);
      return;
    } catch (e: any) {
      console.log(`❌ ${m} FAILED: ${e.message}`);
    }
  }
}

testAI();
