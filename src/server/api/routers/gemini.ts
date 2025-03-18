import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getGeminiModel } from "@/lib/geminiApiClient";
import {
  GenerateContentResult,
  GenerativeModel,
  EnhancedGenerateContentResponse
} from "@google/generative-ai";

// Schema for the content of the model response
const GenerativeContentSchema = z.object({
  text: z.string(),
});

// Schema for a chat message
const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(z.object({
    text: z.string(),
  })),
});

export const geminiRouter = createTRPCRouter({
  // Generate text with a prompt
  generateText: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        modelName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const model = getGeminiModel(input.modelName);
        const result = await model.generateContent(input.prompt);
        const response = result.response;
        const text = response.text();
        return { text };
      } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content from Gemini");
      }
    }),

  // Stream text with a prompt - simplified version to avoid typing issues
  streamText: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        modelName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const model = getGeminiModel(input.modelName);
        // Create a non-streaming request instead to avoid type issues
        const result = await model.generateContent(input.prompt);
        const text = result.response.text();

        return {
          success: true,
          text,
          message: "Generated content successfully. For actual streaming, implement with SSE or WebSockets."
        };
      } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content from Gemini");
      }
    }),

  // Chat with history
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(ChatMessageSchema),
        modelName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const model = getGeminiModel(input.modelName);
        const chat = model.startChat({
          history: input.messages.map(msg => ({
            role: msg.role,
            parts: msg.parts,
          })),
        });

        // Get last user message
        const lastUserMessage = input.messages
          .filter(msg => msg.role === "user")
          .pop();

        if (!lastUserMessage) {
          throw new Error("No user message found in the conversation");
        }

        // Extract text from the last user message parts
        const lastUserContent = lastUserMessage.parts.map(part => part.text).join(" ");
        const result = await chat.sendMessage(lastUserContent);
        const text = result.response.text();

        return { text };
      } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to get response from Gemini chat");
      }
    }),

  // Vision analysis with image URL
  analyzeImage: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        imageUrl: z.string().url(),
        modelName: z.string().optional().default("gemini-1.5-pro-vision"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const model = getGeminiModel(input.modelName);

        // Create image part from URL
        const imageParts = [
          { text: input.prompt },
          { inlineData: {
              mimeType: "image/jpeg",
              data: await fetchImageAsBase64(input.imageUrl)
            }
          },
        ];

        const result = await model.generateContent(imageParts);
        const text = result.response.text();

        return { text };
      } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Failed to analyze image with Gemini");
      }
    }),
});

// Helper function to fetch image and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Failed to fetch and convert image");
  }
}