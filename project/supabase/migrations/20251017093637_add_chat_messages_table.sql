/*
  # Add Chat Messages Table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `analysis_id` (uuid, foreign key) - References the resume analysis
      - `role` (text) - Either 'user' or 'assistant'
      - `content` (text) - The message content
      - `created_at` (timestamptz) - Timestamp of message creation

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for reading and inserting messages

  3. Notes
    - Chat messages are linked to resume analyses
    - Allows users to ask questions about their analyzed resume
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES resume_analyses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read chat messages"
  ON chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert chat messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_analysis_id ON chat_messages(analysis_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);