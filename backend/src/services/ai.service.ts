import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

// Initialize with a fallback key if not provided
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export class AIService {
  /**
   * Scans a CNIC/ID document and extracts key information using Google Gemini Vision.
   */
  static async scanIdentityDocument(imageUrl: string) {
    try {
      console.log(`[Neural Link] Fetching document for scanning: ${imageUrl}`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');
      
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

      // Use gemini-1.5-flash for reliability and speed
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
              },
            ],
          },
        ],
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/gi, "").trim();
      
      const extractedData = JSON.parse(cleanJson);
      console.log(`[ReVault AI] Neural Scan Complete for: ${extractedData.fullName}`);
      
      return { extractedData };
    } catch (error: any) {
      console.error("AI Scan Error:", error);
      return { 
        error: "AI Scan failed",
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
   */
  static async performVisualSearch(imageUrl: string) {
    try {
      console.log(`[Gemini Search] Analyzing visual intent for image: ${imageUrl}`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');

      const prompt = `Identify this luxury item. Return detected category, brand (if visible), and descriptive tags.
      Categories must be one of: SHADI-WEAR, BRIDAL, KURTAS, SHOES, BAGS, WATCHES.
      
      Return ONLY a JSON object:
      {
        "detectedCategory": "CATEGORY",
        "brand": "string",
        "suggestedTags": ["tag1", "tag2"],
        "confidence": 0.9
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
              },
            ],
          },
        ],
      });

      const text = result.text || '';
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
   * Supercharged with Real-time Store Context & Luxury Fashion Intelligence
   */
  static async getChatResponse(message: string, history: any[]) {
    // Correct models list
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-pro"
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`📡 Attempting Neural Link with model: ${modelName}...`);

        const systemPrompt = `CRITICAL: YOUR LINGUISTIC IDENTITY IS FIXED. 
          - YOU ONLY KNOW AND USE TWO LANGUAGES: ENGLISH AND ROMAN URDU.
          - ALWAYS WRITE URDU IN ROMAN SCRIPT (e.g., "Aapka order process ho raha hai").
          
          PLATFORM: 'ReVault' - Pakistan's #1 Luxury Preloved Marketplace.
          FEE: 20% commission.
          AUTHENTICITY: 100% Guaranteed. Physical inspection by team.
          SHIPPING: 3-5 working days.
          
          TONE: Sophisticated, helpful, and premium.`;

        const historyItems = (history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: h.content || "" }]
        }));

        if (historyItems.length === 0) {
          historyItems.push({ role: 'user' as const, parts: [{ text: systemPrompt }] });
          historyItems.push({ role: 'model' as const, parts: [{ text: "Understood. How may I assist you?" }] });
        }

        const chat = ai.chats.create({
          model: modelName,
          history: historyItems,
        });
        
        const result = await chat.sendMessage({ message });
        console.log(`✅ Neural Link established with ${modelName}`);
        return result.text;
      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} failed: ${error.status || error.message}`);
        lastError = error;
        
        if (error.status === 429) {
          return `Daily neural link quota exceeded. Please try again later. 💎`;
        }
        continue;
      }
    }

    return `Neural link unstable. (Error: ${lastError?.status || 'Connection Failed'}). Please try again.`;
  }

  /**
   * Neural Receipt Auditor: Extracts and verifies payment data from bank screenshots.
   */
  static async verifyPaymentReceipt(imageUrl: string, orderDetails: any) {
    try {
      console.log(`[Neural Link] Scanning receipt for order validation...`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');
      
      const prompt = `Analyze this payment receipt screenshot.
      Match Amount with: Rs. ${orderDetails.totalAmount}
      Match Receiver with: "ReVault" or "Meezan Bank"
      
      Return ONLY a JSON object:
      {
        "amount": number,
        "trxId": "string",
        "receiver": "string",
        "isMatch": boolean,
        "reason": "explanation",
        "confidence": 0.95
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
              },
            ],
          },
        ],
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/gi, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error("Receipt verification failed:", error);
      throw error;
    }
  }
}
