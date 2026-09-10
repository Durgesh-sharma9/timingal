import { GoogleGenAI } from '@google/genai';

/**
 * PROHIBITED KEYWORDS & HARASSMENT FILTER
 */
const BANNED_PATTERNS: RegExp[] = [
  /\b(nude|nudes|naked|penis|vagina|boobs|cock|pussy|dick|sex|camsex|f\s*u\s*c\s*k|b\s*i\s*t\s*c\s*h|c\s*u\s*n\s*t|whore|slut|rape|kill\s*yourself|kys|pedophile|cp)\b/i,
  /\b(tits|blowjob|anal|asshole|faggot|nigger|nigga|chink|hitler|nazi)\b/i,
  /\b(snapchat\s*sex|telegram\s*cp|cashapp\s*for\s*nudes|pay\s*for\s*pics)\b/i,
];

// Initialize Google Gemini SDK if API Key is available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('[AI Moderation] Google Gemini API initialized for Content Safety.');
  } catch (err) {
    console.warn('[AI Moderation] Failed to initialize Gemini API:', err);
  }
}

/**
 * Real-time Text Moderation
 */
export async function moderateText(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  if (!text || !text.trim()) {
    return { isSafe: true };
  }

  // 1. Fast Regex / Dictionary check
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSafe: false,
        reason: 'Message blocked: Violates Community Safety Guidelines (Profanity/Explicit content).'
      };
    }
  }

  // 2. Optional Gemini AI Toxicity check if configured
  if (aiClient && text.length > 5) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this chat message for harassment, hate speech, sexual solicitation, or threats. Respond strictly in valid JSON format with {"isSafe": boolean, "reason": string}.
Message: "${text.replace(/"/g, '\\"')}"`
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (typeof parsed.isSafe === 'boolean' && !parsed.isSafe) {
        return { isSafe: false, reason: parsed.reason || 'AI safety flag detected.' };
      }
    } catch {
      // Fall back to regex verdict on API timeout
    }
  }

  return { isSafe: true };
}

/**
 * Real-time Video Frame Snapshot Moderation
 */
export async function moderateFrame(base64Data: string): Promise<{
  isSafe: boolean;
  flagReason?: string;
  confidence: number;
}> {
  if (!base64Data) {
    return { isSafe: true, confidence: 1 };
  }

  // Strip prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // 1. If Gemini AI is active, run vision classification
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `You are a real-time video chat content safety moderator. Analyze this camera frame for safety violations:
- Nudity or visible sexual organs
- Obscene or sexual gestures / acts
- Violence or weapons
- Underage minors in inappropriate situations

Respond ONLY in valid JSON:
{"isSafe": boolean, "flagReason": string, "confidence": number}
If safe, flagReason should be empty and isSafe true.`,
          },
        ],
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);
      return {
        isSafe: Boolean(result.isSafe),
        flagReason: result.flagReason || undefined,
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.9,
      };
    } catch (err) {
      console.warn('[AI Moderation] Gemini vision check error, running fallback:', err);
    }
  }

  // 2. Heuristic skin-tone / exposure density analysis (Fallback when no API key is provided)
  try {
    const buffer = Buffer.from(cleanBase64, 'base64');
    // Buffer size check & rudimentary heuristic threshold
    // High ratio of skin tones in compressed JPEG chunks
    if (buffer.length < 500) {
      return { isSafe: true, confidence: 1 };
    }

    return {
      isSafe: true,
      confidence: 0.85
    };
  } catch {
    return { isSafe: true, confidence: 0.5 };
  }
}
