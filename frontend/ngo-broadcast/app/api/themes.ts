import type { NextApiRequest, NextApiResponse } from 'next';
import { ThemesResponse } from '@/types';
import { THEMES } from '@/lib/constants';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ThemesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ themes: [] });
  }

  res.status(200).json({ themes: Object.keys(THEMES) });
}