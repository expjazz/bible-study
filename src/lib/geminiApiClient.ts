import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const API_KEY = process.env.GEMINI_API_KEY ?? "";

// Create and export the Gemini client
export const geminiClient = new GoogleGenerativeAI(API_KEY);

// Helper to get the model
export const getGeminiModel = (modelName = "gemini-1.5-pro") => {
  return geminiClient.getGenerativeModel({ model: modelName });
};