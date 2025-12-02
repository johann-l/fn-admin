import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: "AIzaSyB4feR6tnzNI_8fJaEJeAR6cVe9Yz4yr7Q" })],
  model: 'googleai/gemini-2.0-flash',
});