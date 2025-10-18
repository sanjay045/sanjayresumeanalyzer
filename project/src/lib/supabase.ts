import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ResumeAnalysis {
  id: string;
  file_name: string;
  file_content: string;
  overall_score: number;
  feedback: AnalysisFeedback;
  created_at: string;
  user_session: string;
}

export interface AnalysisFeedback {
  overallScore: number;
  sections: FeedbackSection[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface FeedbackSection {
  title: string;
  score: number;
  comments: string[];
  suggestions: string[];
}
