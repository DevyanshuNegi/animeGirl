import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

import { BASE_AUDIO_PATH } from '@/lib/constants';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    // Extract the path parameters
    const pathSegments = req.query.path as string[];
    
    if (!pathSegments || pathSegments.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Invalid path' });
    }
    
    // The last segment is the filename, everything before is the directory path
    const filename = pathSegments[pathSegments.length - 1];
    const directory = pathSegments.slice(0, pathSegments.length - 1).join('/');
    
    // Construct the file path
    const filePath = path.join(BASE_AUDIO_PATH, directory, filename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'error', message: 'File not found' });
    }
    
    // Get file stats
    const stat = fs.statSync(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the file
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    console.error("Error streaming audio:", error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

export const config = {
  api: {
    // Disable the default body parser
    bodyParser: false,
    // This is important for streaming responses
    responseLimit: false,
  },
};