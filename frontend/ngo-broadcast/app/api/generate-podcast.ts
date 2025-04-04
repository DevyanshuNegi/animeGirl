import type { NextApiRequest, NextApiResponse } from 'next';
import { GeneratePodcastResponse } from '@/types';
import { THEMES } from '@/lib/constants';
import { getAudioFilePath, getAudioUrl, ensureDirectoryExists } from '@/lib/utils';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize the Google AI client
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiClient = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Initialize the OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeneratePodcastResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const {
      topic = '',
      custom_topic = '',
      language = 'Hindi',
      voice = 'coral',
      temperature = 0.7
    } = req.body;

    // Input validation
    if (!topic.trim() && !custom_topic.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a topic or custom topic'
      });
    }

    // Check if Gemini is available
    if (!geminiClient) {
      return res.status(500).json({
        status: 'error',
        message: 'Gemini API client not initialized'
      });
    }

    // Generate the script
    const prompt = `
    You are a creative storyteller and animation director. Create a detailed, engaging narrative in ${language} about ${topic || custom_topic}. ${THEMES[topic] || 'This is a custom topic. Create an informative and engaging story.'}

    Imagine you're telling this story to a young audience. Use natural, conversational language. Include descriptive details, relatable situations, and a clear story arc with a beginning, middle, and end.

    For each sentence or short phrase, provide a corresponding pose directive for the animated character. Use the following poses:
    - Normal: Neutral stance, hands down.
    - Cross: Hands closed.
    - Greet: Single hand wave.
    - Think: Chin touch, one eye slightly closed.
    - Spread: Elbow-out hand opening.
    - Point: Single hand point, palm open.

    Output ONLY the narrative and pose directives in the format:
    <sentence or short phrase>
    [POSE: <pose_name>]

    Ensure the poses naturally complement the story's emotions and actions, and that the transitions are smooth and suitable for audio synchronization.
    `;

    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: parseFloat(temperature.toString()) }
    });

    const podcast_script = result.response.text();

    // Define file path
    const filename = `${(topic || custom_topic).replace(/\s+/g, '_')}.mp3`;
    const audioFilePath = getAudioFilePath(topic, custom_topic, filename);

    // Generate speech if OpenAI client is available
    let audio_url = null;
    if (openaiClient) {
      try {
        const tts_response = await openaiClient.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: voice,
          input: podcast_script,
        });

        const buffer = Buffer.from(await tts_response.arrayBuffer());
        fs.writeFileSync(audioFilePath, buffer);
        
        audio_url = getAudioUrl(topic, custom_topic, filename);
      } catch (e) {
        console.error("OpenAI TTS failed:", e);
      }
    }

    res.status(200).json({
      status: 'success',
      script: podcast_script,
      audio_url: audio_url ?? undefined,
    });
  } catch (error) {
    console.error("Error generating podcast:", error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

// Configure Next.js to handle larger request bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};