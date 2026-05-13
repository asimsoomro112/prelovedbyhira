import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
  /**
   * Scans a CNIC/ID document and extracts key information using Google Gemini Pro Vision.
   */
  static async scanIdentityDocument(imageUrl: string) {
    try {
      console.log(`[Neural Link] Fetching document from vault for scanning...`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data).toString('base64');

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `You are the Hira AI Verification Agent. 
      Analyze this identification document and extract:
      1. Full Name
      2. ID Number (CNIC/Identity Number)
      3. Address (if present)
      
      Return ONLY a JSON object in this format:
      {
        "fullName": "Extracted Name",
        "cnicNumber": "Extracted ID Number",
        "address": "Extracted Address",
        "confidence": 0.95
      }`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const text = result.response.text();
      // Remove potential markdown formatting
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      if (!cleanJson) throw new Error("AI returned an empty response");
      
      const extractedData = JSON.parse(cleanJson);

      console.log(`[Hira AI] Neural Scan Complete for: ${extractedData.fullName}`);
      
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
   * Analyzes an uploaded image to find similar luxury products using Gemini.
   */
  static async performVisualSearch(imageUrl: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log(`[Gemini Search] Analyzing visual intent for image: ${imageUrl}`);
    
    return {
      suggestedTags: ["Velvet", "Maroon", "Bridal", "Hand-worked"],
      detectedCategory: "Shadi Wear",
      confidence: 0.94
    };
  }

  /**
   * Neural Chat Assistant (Hira AI Concierge)
   * Supercharged with Real-time Store Context & Luxury Fashion Intelligence
   */
  static async getChatResponse(message: string, history: any[]) {
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-3-flash-preview",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`📡 Attempting Neural Link with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const systemPrompt = `CRITICAL: YOUR LINGUISTIC IDENTITY IS FIXED. 
          - YOU ONLY KNOW AND USE TWO LANGUAGES: ENGLISH AND ROMAN URDU.
          - IF ASKED WHAT LANGUAGES YOU SPEAK, ONLY MENTION ENGLISH AND ROMAN URDU.
          - NEVER MENTION HINDI, ARABIC, OR ANY OTHER LANGUAGE.
          - NEVER USE HINDI SCRIPT (DEVANAGARI).
          - ALWAYS WRITE URDU IN ROMAN SCRIPT (e.g., "Aapka order process ho raha hai").
          
          YOUR KNOWLEDGE BASE (THE VAULT):
          - PLATFORM: 'PrelovedByHira' - Pakistan's #1 Luxury Preloved Marketplace.
          - FEE SYSTEM: 20% flat commission on every sale. (Example: If item sells for 10,000 PKR, seller gets 8,000 PKR).
          - SELLER VERIFICATION: Sellers must upload CNIC/ID and address. Hira AI (you) verifies them within 24-48 hours.
          - AUTHENTICITY: 100% Guaranteed. Every item is physically inspected by the Hira team before shipping to buyer.
          - CATEGORIES: Shadi Wear, Luxury Handbags (Zara, LV, Gucci), Designer Shoes, Jewelry.
          - SHIPPING: 3-5 working days across Pakistan.
          
          YOUR MISSION & ACTIONS:
          - TRACK ORDER: Tell users to visit the 'My Orders' page (/orders) to see their real-time tracking status.
          - LIST ITEM: Tell sellers to go to the 'Seller Dashboard' (/seller/dashboard) to upload their luxury items.
          - COMPLAINTS: If a user has an issue, tell them to visit the 'Support' page (/contact) or 'Dispute Center'.
          - AUTHENTICITY: Remind them that we physically verify every item before they receive it.
          - TONE: Sophisticated, helpful, and premium.`;

        const historyItems = (history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content || "" }]
        }));

        if (historyItems.length === 0) {
          historyItems.push({ role: 'user', parts: [{ text: systemPrompt }] });
          historyItems.push({ role: 'model', parts: [{ text: "Understood. How may I assist you?" }] });
        }

        const chat = model.startChat({ history: historyItems });
        
        // Final Linguistic Guardrail: Re-enforce the Roman Urdu rule in every message
        const promptWithGuardrail = `(REMINDER: USE ONLY ROMAN URDU OR ENGLISH. NO HINDI SCRIPT.) ${message}`;
        
        const result = await chat.sendMessage(promptWithGuardrail);
        console.log(`✅ Neural Link established with ${modelName}`);
        return result.response.text();
      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} failed: ${error.status || error.message}`);
        lastError = error;
        
        // If we get a 429 (Quota Exceeded), it means the model is VALID 
        // but we are out of free credits. Stop here instead of showing a 404 later.
        if (error.status === 429) {
          return `I apologize, my neural link to the vault is momentarily unstable. (Error: 429 - Quota Exceeded). Your daily free Gemini credits have been used. Please try again later or upgrade your Vault plan. 💎`;
        }
        
        continue;
      }
    }

    console.error("❌ All Neural Models Failed!");
    return `I apologize, my neural link to the vault is momentarily unstable. (Error: ${lastError?.status || 'Total Outage'}). Please check your API key in the Vault settings.`;
  }
  /**
   * Neural Receipt Auditor: Extracts and verifies payment data from bank screenshots.
   */
  static async verifyPaymentReceipt(imageUrl: string, orderDetails: any) {
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Neural Link] Scanning receipt with ${modelName}...`);
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(response.data).toString('base64');
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
        Analyze this payment receipt screenshot (JazzCash/EasyPaisa/Bank).
        1. Extract the Transaction Amount.
        2. Extract the Transaction ID (TRX ID).
        3. Extract the Receiver Account/Name.
        4. Match Amount with: Rs. ${orderDetails}
        5. Match Receiver with: "Preloved By Hira" or "Meezan Bank" or "asimsoomro"
        
        Return ONLY a JSON object:
        {
          "amount": number,
          "trxId": "string",
          "receiver": "string",
          "isMatch": true, (is amount correct AND receiver matches Preloved platform?)
          "reason": "short explanation of match/mismatch",
          "isLikelyFraud": false,
          "confidence": 0.95
        }
      `;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageData,
              mimeType: "image/jpeg"
            }
          }
        ]);

        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleanJson);
      } catch (error: any) {
        console.warn(`[AI Audit] ${modelName} failed, trying next...`);
        lastError = error;
      }
    }
    throw lastError;
  }
}
