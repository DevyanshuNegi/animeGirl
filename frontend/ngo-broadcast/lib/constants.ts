import { ThemeDefinitions } from '@/types';
import path from 'path';

// Predefined Themes
export const THEMES: ThemeDefinitions = {
  "CourageAndConsent": "Stories about empowerment, making informed choices, and understanding consent.",
  "HealthAndHygiene": "Educational stories about physical health, cleanliness, and menstrual awareness.",
  "KnowYourRights": "Informative stories about legal rights, gender equality, and self-advocacy.",
  "MindMatters": "Narratives that focus on mental health, emotional intelligence, and resilience.",
  "SafetyAndBoundaries": "Stories about personal safety, setting boundaries, and recognizing red flags.",
};

// Base path for audio storage
export const BASE_AUDIO_PATH = path.join(process.cwd(), 'public', 'audioFiles', 'topics');