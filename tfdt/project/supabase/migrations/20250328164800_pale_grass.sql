/*
  # Create book lists table

  1. New Tables
    - `book_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (text, from Google Books API)
      - `list_name` (text, one of: want-to-read, reading, finished)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `book_lists` table
    - Add policies for authenticated users to:
      - Read their own book lists
      - Insert new books to their lists
      - Delete books from their lists
*/

CREATE TABLE IF NOT EXISTS book_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  book_id text NOT NULL,
  list_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_list_name CHECK (list_name IN ('want-to-read', 'reading', 'finished'))
);

ALTER TABLE book_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own book lists"
  ON book_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add books to their lists"
  ON book_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove books from their lists"
  ON book_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);