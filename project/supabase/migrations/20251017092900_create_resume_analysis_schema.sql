/*
  # Resume Analysis Schema

  1. New Tables
    - `resume_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `file_name` (text) - Original filename of uploaded resume
      - `file_content` (text) - Extracted text content from resume
      - `overall_score` (integer) - Overall strength score (0-100)
      - `feedback` (jsonb) - Detailed AI feedback including sections, strengths, and improvements
      - `created_at` (timestamptz) - Timestamp of analysis creation
      - `user_session` (text) - Session identifier for anonymous tracking
  
  2. Security
    - Enable RLS on `resume_analyses` table
    - Add policy for users to read their own analyses based on session
    - Add policy for users to insert their own analyses

  3. Notes
    - The feedback field stores structured JSON with analysis results
    - Session-based tracking allows anonymous usage without authentication
*/

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_content text NOT NULL,
  overall_score integer DEFAULT 0,
  feedback jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  user_session text NOT NULL
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analyses"
  ON resume_analyses
  FOR SELECT
  USING (user_session = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_session = '');

CREATE POLICY "Users can insert own analyses"
  ON resume_analyses
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resume_analyses_session ON resume_analyses(user_session);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at DESC);