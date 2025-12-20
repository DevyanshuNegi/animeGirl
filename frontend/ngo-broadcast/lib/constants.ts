import { ThemeDefinitions } from '@/types';
import path from 'path';

// Predefined Themes with detailed context for realistic storytelling
export const THEMES: ThemeDefinitions = {
  "CourageAndConsent": "Tell a story about understanding consent - learning to say 'no' when uncomfortable, respecting others' boundaries, and knowing that your body belongs to you. Include a scenario where a child learns to speak up about unwanted touch or pressure, and emphasize that it's brave to tell a trusted adult.",
  
  "HealthAndHygiene": "Tell a story about health and hygiene - this could include menstrual health awareness (for appropriate topics), importance of handwashing, keeping clean during monsoon season, or understanding how bodies change during puberty. Normalize these topics and remove shame or embarrassment.",
  
  "KnowYourRights": "Tell a story about children's rights - the right to education (especially for girls), protection from child labor, right to play and be a child, or gender equality. Show a character who learns about their rights and uses that knowledge to help themselves or others.",
  
  "MindMatters": "Tell a story about mental and emotional wellbeing - dealing with anxiety, handling bullying, managing anger, coping with family problems, or building self-confidence. Show that it's okay to have difficult feelings and that talking to someone helps.",
  
  "SafetyAndBoundaries": "Tell a story about personal safety - recognizing unsafe situations, understanding good touch vs bad touch, knowing whom to trust, and what to do if someone makes you uncomfortable. Teach about safe vs unsafe secrets and the importance of telling a trusted adult.",
};

// Base path for audio storage
export const BASE_AUDIO_PATH = path.join(process.cwd(), 'public', 'audioFiles', 'topics');