
-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  question_text TEXT NOT NULL,
  bg_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Users can create own questions" ON public.questions FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own questions" ON public.questions FOR DELETE USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create question replies table
CREATE TABLE public.question_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.question_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send replies" ON public.question_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Question owners can read replies" ON public.question_replies FOR SELECT USING (
  question_id IN (
    SELECT q.id FROM questions q
    JOIN profiles p ON q.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Enable realtime for replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_replies;
