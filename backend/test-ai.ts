import dotenv from 'dotenv';
dotenv.config();
import { AIService } from './src/services/ai.service';

async function testAI() {
  console.log("🧪 Testing Hira AI Neural Link...");
  console.log("API KEY:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
  
  try {
    const response = await AIService.getChatResponse("Hello, what is the platform fee?", []);
    console.log("✅ AI Response:", response);
  } catch (error: any) {
    console.error("❌ AI Test Failed!");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
  }
}

testAI();
