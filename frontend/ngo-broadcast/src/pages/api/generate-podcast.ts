import type { NextApiRequest, NextApiResponse } from "next";
import { GeneratePodcastResponse } from "@/types";
import { THEMES } from "@/lib/constants";
import {
  getAudioFilePath,
  getAudioUrl,
  ensureDirectoryExists,
} from "@/lib/utils";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize the Google AI client
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate content with retry logic
async function generateWithRetry(
  model: any,
  contents: any,
  generationConfig: any,
  maxRetries = 3
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents,
        generationConfig,
      });
      return result;
    } catch (error: any) {
      const isRateLimitError = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('quota');
      
      if (isRateLimitError && attempt < maxRetries - 1) {
        // Extract retry delay from error or use exponential backoff
        const retryMatch = error?.message?.match(/retry in (\d+(?:\.\d+)?)/i);
        const retryDelay = retryMatch 
          ? Math.ceil(parseFloat(retryMatch[1]) * 1000) 
          : Math.pow(2, attempt + 1) * 1000;
        
        console.log(`Rate limited. Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await delay(retryDelay);
        continue;
      }
      throw error;
    }
  }
}

// Initialize the OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratePodcastResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const {
      topic = "",
      custom_topic = "",
      language = "Hindi",
      voice = "coral",
      temperature = 0.7,
    } = req.body;

    // Input validation
    if (!topic.trim() && !custom_topic.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a topic or custom topic",
      });
    }

    // Check if at least one AI client is available
    if (!openaiClient && !geminiClient) {
      return res.status(500).json({
        status: "error",
        message: "No AI API client initialized. Please configure OpenAI or Gemini API key.",
      });
    }
    // Generate the script
    const topicContext = THEMES[topic] || "This is a custom topic. Create an informative and engaging story.";
    
    const prompt = `You are "Sakhi Didi" (meaning "Friend Sister"), a warm, caring, and wise teacher. You speak directly to children aged 8-14 as if they are sitting right in front of you.

**CRITICAL INSTRUCTION - LANGUAGE:**
You MUST write the ENTIRE response in **${language}** language. Every single word of the story must be in ${language}. Do NOT use English unless the selected language is English.

**Your Personality:**
- You are patient, loving, and never judgmental
- You use simple, everyday examples that children can relate to
- You occasionally use gentle humor to keep children engaged
- You validate children's feelings and experiences
- You speak like a real person - with pauses, questions, and expressions of care

**Your Task:**
Create a realistic, conversational lesson ENTIRELY in **${language}** about: **${topic || custom_topic}**

Topic Context: ${topicContext}

**Storytelling Guidelines:**
1. Start with a warm greeting and ask a relatable question to engage them
2. Tell a story about a relatable character 
3. Include realistic dialogue between characters
4. Pause to ask the listener what they think or feel
5. Share the moral or lesson naturally, not as a lecture
6. End with encouragement and remind them they can always talk to a trusted adult
7. Keep the total length to about 2-3 minutes when spoken (roughly 300-400 words)

**Important:**
- THE ENTIRE STORY MUST BE IN ${language.toUpperCase()}
- Sound like a REAL teacher talking, not like reading from a textbook
- Include emotional moments - joy, concern, curiosity, pride
- Make the lesson memorable through storytelling, not preaching

**Pose Directives:**
After each sentence or phrase, include a pose directive for the animated character:
- [POSE: Normal] - Calm, neutral, listening
- [POSE: Greet] - Welcoming, waving, friendly
- [POSE: Think] - Thoughtful, considering, curious
- [POSE: Spread] - Explaining, showing, emphasizing
- [POSE: Point] - Important point, directing attention
- [POSE: Cross] - Concerned, serious, protective

**Output Format:**
- Output ONLY the narrative with pose directives
- No introductions like "Here is the script"
- No meta-commentary or explanations
- Start directly with Sakhi Didi speaking

**Example style:**
---
"Aao baccho, aao! Come sit with me today."
[POSE: Greet]

"Tell me, have you ever felt scared to say 'no' to someone older than you?"
[POSE: Think]

"It's okay, many children feel this way. Let me tell you about a brave girl named Meera from our village."
[POSE: Normal]

"One day, Meera was walking home from school when..."
[POSE: Spread]
---

Now create the lesson. Remember - you ARE Sakhi Didi. Speak from the heart.`;

    let podcast_script: string;

    // Try OpenAI first, then fall back to Gemini
    if (openaiClient) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: parseFloat(temperature.toString()),
        });
        podcast_script = completion.choices[0]?.message?.content || "";
        
        if (!podcast_script) {
          throw new Error("OpenAI returned empty response");
        }
      } catch (openaiError: any) {
        console.error("OpenAI script generation failed:", openaiError);
        
        // Fall back to Gemini if OpenAI fails
        if (geminiClient) {
          console.log("Falling back to Gemini...");
          const model = geminiClient.getGenerativeModel({
            model: "gemini-1.5-flash",
          });
          const result = await generateWithRetry(
            model,
            [{ role: "user", parts: [{ text: prompt }] }],
            { temperature: parseFloat(temperature.toString()) },
            3
          );
          
          if (!result) {
            throw new Error("Both OpenAI and Gemini failed to generate content");
          }
          podcast_script = result.response.text();
        } else {
          throw openaiError;
        }
      }
    } else if (geminiClient) {
      // Use Gemini if OpenAI is not available
      console.log("Using Gemini for script generation...");
      const model = geminiClient.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const result = await generateWithRetry(
        model,
        [{ role: "user", parts: [{ text: prompt }] }],
        { temperature: parseFloat(temperature.toString()) },
        3
      );

      if (!result) {
        throw new Error("Failed to generate content after retries");
      }
      podcast_script = result.response.text();
    } else {
      throw new Error("No AI client available");
    }

    //result for the tts
    const cleaned_script = podcast_script.replace(/\[POSE:.*?\]/g, "").trim();

    //result for the display
    const display_script = cleaned_script
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .trim();

    // Define file path
    const filename = `${(topic || custom_topic).replace(/\s+/g, "_")}.mp3`;
    const audioFilePath = getAudioFilePath(topic, custom_topic, filename);

    // Generate speech if OpenAI client is available
    let audio_url = null;
    if (openaiClient) {
      try {
        const tts_response = await openaiClient.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: voice,
          input: cleaned_script,
        });

        const buffer = Buffer.from(await tts_response.arrayBuffer());
        fs.writeFileSync(audioFilePath, buffer);

        audio_url = getAudioUrl(topic, custom_topic, filename);
      } catch (e) {
        console.error("OpenAI TTS failed:", e);
      }
    }

    res.status(200).json({
      status: "success",
      script: display_script,
      audio_url: audio_url ?? undefined,
    });
  } catch (error: any) {
    console.error("Error generating podcast:", error);
    
    // Check if it's a quota/rate limit error
    const isQuotaError = error?.status === 429 || 
      error?.message?.includes('429') || 
      error?.message?.includes('quota') ||
      error?.message?.includes('Too Many Requests');
    
    if (isQuotaError) {
      return res.status(429).json({
        status: "error",
        message: "API quota exceeded. The free tier daily limit has been reached. Please try again tomorrow or upgrade your Gemini API plan.",
      });
    }
    
    res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

// Configure Next.js to handle larger request bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
