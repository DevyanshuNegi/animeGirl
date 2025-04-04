import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import fs from 'fs';

import path from 'path';
import { BASE_AUDIO_PATH } from './constants';

/**
 * Ensures a directory exists, creating it if needed
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get the file path for storing audio based on topic
 */
export const getAudioFilePath = (topic: string, customTopic: string, filename: string): string => {
  let folderPath: string;

  if (topic) {
    folderPath = path.join(BASE_AUDIO_PATH, topic);
  } else {
    folderPath = path.join(BASE_AUDIO_PATH, 'CustomTopics', customTopic.replace(/\s+/g, '_'));
  }

  ensureDirectoryExists(folderPath);
  return path.join(folderPath, filename);
};

/**
 * Get the public URL for an audio file
 */
export const getAudioUrl = (topic: string, customTopic: string, filename: string): string => {
  if (topic) {
    return `/api/stream-audio/${topic}/${filename}`;
  } else {
    return `/api/stream-audio/CustomTopics/${customTopic.replace(/\s+/g, '_')}/${filename}`;
  }
};