import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Initialize with official pattern
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
  /**
   * Scans a CNIC/ID document and extracts key information using Gemini 2.5 Flash.
   */
  static async scanIdentityDocument(imageUrl: string) {
    try {
      console.log(`[Neural Link] Fetching document for scanning: ${imageUrl}`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analyze this identification document and extract:
      1. Full Name
      2. ID Number (CNIC/Identity Number)
      3. Address (if present)
      
      Return ONLY a JSON object in this format:
      {
        "fullName": "Name",
        "cnicNumber": "ID Number",
        "address": "Address",
        "confidence": 0.95
      }`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ]);

      const text = result.response.text();
      console.log(`[ReVault AI] Raw Scan Result: ${text}`);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/gi, "").trim();
      
      const extractedData = JSON.parse(cleanJson);
      return { extractedData };
    } catch (error: any) {
      console.error("AI Scan Error Details:", error.response?.data || error.message || error);
      return { 
        error: error.message || "AI Scan failed",
        extractedData: {
          fullName: "Extraction Failed",
          cnicNumber: "PENDING",
          address: "N/A"
        }
      };
    }
  }

  /**
   * Analyzes an uploaded image to detect category and features for similarity search.
   * Uses Gemini 2.5 Flash.
   */
  static async performVisualSearch(imageUrl: string) {
    try {
      console.log(`[Gemini Search] Analyzing visual intent for image: ${imageUrl}`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Identify this luxury item. Return detected category, brand (if visible), and descriptive tags.
      Categories must be one of: SHADI-WEAR, BRIDAL, KURTAS, SHOES, BAGS, WATCHES.
      
      Return ONLY a JSON object:
      {
        "detectedCategory": "CATEGORY",
        "brand": "string",
        "suggestedTags": ["tag1", "tag2"],
        "confidence": 0.9
      }`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Visual Search Error:", error);
      return {
        suggestedTags: [],
        detectedCategory: "SHADI-WEAR",
        confidence: 0.5
      };
    }
  }

  /**
   * Neural Chat Assistant (ReVault AI Concierge)
   * Uses Gemini 2.5 Flash for high-speed Roman Urdu conversations.
   */
  static async getChatResponse(message: string, history: any[]) {
    const modelName = "gemini-2.5-flash";
    try {
      console.log(`📡 Attempting Neural Link with model: ${modelName}...`);

      const systemPrompt = `CRITICAL: YOUR LINGUISTIC IDENTITY IS FIXED. 
        - YOU ONLY KNOW AND USE TWO LANGUAGES: ENGLISH AND ROMAN URDU.
        - ALWAYS WRITE URDU IN ROMAN SCRIPT (e.g., "Aapka order process ho raha hai").
        
        PLATFORM: 'ReVault' - Pakistan's #1 Luxury Preloved Marketplace.
        TONE: Sophisticated, helpful, and premium.`;

      const historyItems = (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: h.content || "" }]
      }));

      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: historyItems,
      });
      
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error: any) {
      console.error(`⚠️ Model ${modelName} failed:`, error);
      return `Neural link unstable. Please try again later.`;
    }
  }

  /**
   * Neural Receipt Auditor: Extracts and verifies payment data from bank screenshots.
   * Uses Gemini 2.5 Flash.
   */
  static async verifyPaymentReceipt(imageUrl: string, orderDetails: any) {
    try {
      console.log(`[Neural Link] Scanning receipt for order validation...`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analyze this payment receipt screenshot. Match Amount with: Rs. ${orderDetails.totalAmount}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error("Receipt verification failed:", error);
      throw error;
    }
  }
}
