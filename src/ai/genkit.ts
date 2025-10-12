import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// WARNING: It is strongly recommended to use environment variables to store your API key.
// Hardcoding the key in your source code can be a security risk.
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.warn(
    'Gemini API key is not set. Please replace "YOUR_GEMINI_API_KEY_HERE" in src/ai/genkit.ts with your actual API key.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
