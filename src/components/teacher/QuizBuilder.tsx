"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { teacherFetchJson } from "@/components/teacher/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type QuizQuestionDraft = {
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
  options: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
};

export type TeacherQuiz = {
  _id: string;
  lessonId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  questions: string[];
  passingScore: number;
  createdAt: string;
  updatedAt: string;
};

type QuizBuilderProps = {
  lessonId?: string;
  quizId?: string;
};

const emptyQuestion = (): QuizQuestionDraft => ({
  text: "",
  type: "MCQ",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 1,
  explanation: "",
});

export function QuizBuilder({ lessonId, quizId }: QuizBuilderProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [timeLimit, setTimeLimit] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([emptyQuestion()]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);

  const quizQuery = useQuery({
    queryKey: ["teacher-quizzes", quizId],
    enabled: Boolean(quizId),
    queryFn: () => teacherFetchJson<TeacherQuiz[]>("/api/teacher/quizzes"),
  });

  useEffect(() => {
    if (!quizId || !quizQuery.data) return;
    const quiz = quizQuery.data.find((item) => item._id === quizId);
    if (!quiz) return;
    setTitle(quiz.title);
    setDescription(quiz.description);
    setDifficulty(quiz.difficulty);
    setTimeLimit(quiz.timeLimit);
    setPassingScore(quiz.passingScore);
  }, [quizId, quizQuery.data]);

  const mutation = useMutation({
    mutationFn: async () =>
      teacherFetchJson("/api/teacher/quizzes", {
        method: quizId ? "PUT" : "POST",
        body: JSON.stringify({
          id: quizId,
          lessonId,
          title,
          description,
          difficulty,
          timeLimit,
          passingScore,
          questions,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-analytics"] });
    },
  });

  const aiMutation = useMutation({
    mutationFn: () =>
      teacherFetchJson<{
        title: string;
        description: string;
        difficulty: "easy" | "medium" | "hard";
        timeLimit: number;
        passingScore: number;
        questions: QuizQuestionDraft[];
      }>("/api/ai/quiz/generate", {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          topic: aiTopic,
          difficulty,
          questionCount: aiQuestionCount,
        }),
      }),
    onSuccess: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setDifficulty(data.difficulty);
      setTimeLimit(data.timeLimit);
      setPassingScore(data.passingScore);
      setQuestions(
        data.questions.length
          ? data.questions.map((question) => ({
              text: question.text,
              type: question.type,
              options: question.options ?? [""],
              correctAnswer: question.correctAnswer,
              points: question.points ?? 1,
              explanation: question.explanation ?? "",
            }))
          : [emptyQuestion()],
      );
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-secondary">AI Assist</p>
            <h3 className="mt-1 font-heading text-2xl font-semibold">Generate a quiz with NVIDIA NIM</h3>
            <p className="mt-2 text-sm text-on-surface-variant">Use the lesson content as context and let the agent draft the first version for you.</p>
          </div>
          <Button disabled={!lessonId || aiMutation.isPending} onClick={() => aiMutation.mutate()} type="button">
            {aiMutation.isPending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Sparkles aria-hidden className="size-4" />}
            Generate with AI
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="aiTopic">Focus topic</Label>
            <Input id="aiTopic" value={aiTopic} onChange={(event) => setAiTopic(event.target.value)} placeholder="Photosynthesis, linear equations, ..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aiQuestionCount">Question count</Label>
            <Input
              id="aiQuestionCount"
              type="number"
              min={3}
              max={10}
              value={aiQuestionCount}
              onChange={(event) => setAiQuestionCount(Number(event.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quizTitle">Quiz title</Label>
            <Input id="quizTitle" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Quiz title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quizDifficulty">Difficulty</Label>
            <select
              id="quizDifficulty"
              className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as "easy" | "medium" | "hard")}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quizDescription">Description</Label>
            <textarea
              id="quizDescription"
              className="min-h-[110px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time limit (minutes)</Label>
              <Input id="timeLimit" type="number" value={timeLimit} onChange={(event) => setTimeLimit(Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing score</Label>
              <Input id="passingScore" type="number" value={passingScore} onChange={(event) => setPassingScore(Number(event.target.value))} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div className="glass-card rounded-3xl p-6" key={index}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-xl font-semibold">Question {index + 1}</h3>
              <Button
                disabled={questions.length === 1}
                onClick={() => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                size="sm"
                type="button"
                variant="secondary"
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Question text</Label>
                <Input
                  value={question.text}
                  onChange={(event) =>
                    setQuestions((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, text: event.target.value } : item)))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
                  value={question.type}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, type: event.target.value as QuizQuestionDraft["type"] } : item,
                      ),
                    )
                  }
                >
                  <option value="MCQ">MCQ</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_BLANK">Fill blank</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(event) =>
                    setQuestions((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, points: Number(event.target.value) } : item)))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Options (one per line)</Label>
                <textarea
                  className="min-h-[110px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
                  value={question.options.join("\n")}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, options: event.target.value.split("\n") } : item,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Correct answer</Label>
                <Input
                  value={question.correctAnswer}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, correctAnswer: event.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Explanation</Label>
                <textarea
                  className="min-h-[90px] w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 py-2 text-base outline-none"
                  value={question.explanation}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, explanation: event.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden className="size-4" />
          Add question
        </Button>
        <Button disabled={mutation.isPending} type="submit">
          Save quiz
        </Button>
      </div>
    </form>
  );
}
