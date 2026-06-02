"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Clock3, CheckCircle2, Loader2 } from "lucide-react";
import type { QuizAttemptResponse } from "@/services/student.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuizPlayerProps = {
  quiz: QuizAttemptResponse;
  onSubmit: (payload: { answers: Array<{ questionId: string; answer: string }>; timeTaken: number }) => Promise<void> | void;
  isSubmitting?: boolean;
};

type SavedAnswer = {
  questionId: string;
  answer: string;
  isCorrect: boolean;
};

function toAnswerMap(answers: SavedAnswer[] | undefined) {
  return (answers ?? []).reduce<Record<string, string>>((accumulator, entry) => {
    accumulator[entry.questionId] = entry.answer;
    return accumulator;
  }, {});
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function QuizPlayer({ quiz, onSubmit, isSubmitting = false }: QuizPlayerProps) {
  const storageKey = `student-quiz-${quiz.quiz._id}`;
  const totalSeconds = (quiz.quiz.timeLimit ?? 0) * 60;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const didSubmitRef = useRef(false);

  useEffect(() => {
    const draft = typeof window === "undefined" ? null : window.localStorage.getItem(storageKey);
    if (draft) {
      try {
        setAnswers(JSON.parse(draft) as Record<string, string>);
        return;
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setAnswers(toAnswerMap(quiz.existingSubmission?.answers));
  }, [quiz.existingSubmission?.answers, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  useEffect(() => {
    if (!totalSeconds) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [totalSeconds]);

  useEffect(() => {
    if (timeLeft !== 0 || didSubmitRef.current || !totalSeconds) return;
    void handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, totalSeconds]);

  async function handleSubmit(autoSubmitted = false) {
    if (didSubmitRef.current || isSubmitting || localSubmitting) return;
    didSubmitRef.current = true;
    setLocalSubmitting(true);
    const payload = {
      answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      timeTaken: totalSeconds ? totalSeconds - timeLeft : 0,
    };

    try {
      await onSubmit(payload);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
    } finally {
      setLocalSubmitting(false);
      if (!autoSubmitted) {
        didSubmitRef.current = false;
      }
    }
  }

  const questionCount = quiz.questions.length;
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const completionPercent = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;
  const isBusy = isSubmitting || localSubmitting;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 border-b border-outline-variant/40 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-secondary">{quiz.course.title}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">{quiz.quiz.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">{quiz.quiz.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">Passing score: {quiz.quiz.passingScore}%</span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">
              {quiz.quiz.timeLimit ? `${quiz.quiz.timeLimit} minutes` : "No timer"}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-on-surface-variant">{questionCount} questions</span>
          </div>
        </div>

        {quiz.existingSubmission ? (
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            You already have a saved attempt. You can review it below or submit a fresh attempt to replace it.
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {quiz.questions.map((question, index) => {
            const value = answers[question._id] ?? "";
            return (
              <article className="rounded-3xl border border-outline-variant/50 bg-white/70 p-5" key={question._id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-secondary">Question {index + 1}</p>
                    <h2 className="mt-2 font-heading text-xl font-semibold">{question.text}</h2>
                  </div>
                  <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs text-on-surface-variant">{question.points} pt</span>
                </div>

                <div className="mt-4 space-y-3">
                  {question.type === "MCQ" ? (
                    question.options.map((option) => (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface-variant transition-colors hover:border-primary/50"
                        key={`${question._id}-${option}`}
                      >
                        <input
                          checked={value === option}
                          className="size-4 accent-blue-600"
                          name={question._id}
                          onChange={() => setAnswers((current) => ({ ...current, [question._id]: option }))}
                          type="radio"
                        />
                        {option}
                      </label>
                    ))
                  ) : question.type === "TRUE_FALSE" ? (
                    ["True", "False"].map((option) => (
                      <label
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/50 bg-white px-4 py-3 text-sm text-on-surface-variant transition-colors hover:border-primary/50"
                        key={`${question._id}-${option}`}
                      >
                        <input
                          checked={value.toLowerCase() === option.toLowerCase()}
                          className="size-4 accent-blue-600"
                          name={question._id}
                          onChange={() => setAnswers((current) => ({ ...current, [question._id]: option }))}
                          type="radio"
                        />
                        {option}
                      </label>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={question._id}>Your answer</Label>
                      <Input
                        id={question._id}
                        onChange={(event) => setAnswers((current) => ({ ...current, [question._id]: event.target.value }))}
                        placeholder="Type your answer"
                        value={value}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-outline-variant/50 bg-white/70 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-on-surface-variant">Answer progress</p>
            <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-surface-container-low">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="text-xs text-on-surface-variant">
              {answeredCount} of {questionCount} answered
            </p>
          </div>

          <Button disabled={isBusy} onClick={() => void handleSubmit(false)} type="button">
            {isBusy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <CheckCircle2 aria-hidden className="size-4" />}
            {isBusy ? "Submitting..." : "Submit quiz"}
          </Button>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="ai-gradient flex size-11 items-center justify-center rounded-2xl text-white">
              <Clock3 aria-hidden className="size-5" />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold">Timer</p>
              <p className="text-sm text-on-surface-variant">Stay focused and submit before time runs out.</p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-outline-variant/50 bg-white/70 p-5 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-secondary">Remaining time</p>
            <p className={`mt-2 font-heading text-5xl font-bold ${timeLeft <= 60 ? "text-rose-600" : "text-primary"}`}>{formatTime(timeLeft)}</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {timeLeft <= 60 ? "Last minute. Submit soon." : "You can auto-save and continue."}
            </p>
          </div>
        </div>

        {quiz.existingSubmission ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              <p>
                Previous score: <strong>{quiz.existingSubmission.percentage}%</strong> with {quiz.existingSubmission.answers.length} saved answers.
              </p>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
