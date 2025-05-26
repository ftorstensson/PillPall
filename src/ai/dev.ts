import { config } from 'dotenv';
config();

import '@/ai/flows/medication-summary.ts';
import '@/ai/flows/phil-motivator.ts'; // Changed from pillwise-assistant.ts
