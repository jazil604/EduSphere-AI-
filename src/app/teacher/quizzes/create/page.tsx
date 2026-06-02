"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { QuizBuilder } from "@/components/teacher/QuizBuilder";
import { teacherFetchJson } from "@/components/teacher/api";
import type { TeacherLesson } from "@/components/teacher/LessonList";
import type { TeacherCourseCardData } from "@/components/teacher/CourseCard";

export default function TeacherCreateQuizPage() {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => teacherFetchJson<TeacherCourseCardData[]>("/api/teacher/courses"),
  });

  const lessonsQuery = useQuery({
    queryKey: ["teacher-quiz-lessons", courseId],
    queryFn: () => teacherFetchJson<TeacherLesson[]>(`/api/teacher/courses/${courseId}/lessons`),
    enabled: Boolean(courseId),
  });

  useEffect(() => {
    setLessonId("");
  }, [courseId]);

  return (
    <TeacherShell description="Select a lesson, define questions, and set the scoring rules." title="Create Quiz">
      <div className="glass-card space-y-5 rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Course</label>
            <select className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              <option value="">Select a course</option>
              {coursesQuery.data?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Lesson</label>
            <select className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none" value={lessonId} onChange={(event) => setLessonId(event.target.value)}>
              <option value="">Select a lesson</option>
              {lessonsQuery.data?.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {lessonId ? <QuizBuilder lessonId={lessonId} /> : null}
    </TeacherShell>
  );
}

