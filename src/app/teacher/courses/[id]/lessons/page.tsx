"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TeacherShell } from "@/components/teacher/TeacherShell";
import { LessonList } from "@/components/teacher/LessonList";
import { Button } from "@/components/ui/button";

export default function TeacherLessonsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  return (
    <TeacherShell
      description="Add lessons, upload resources, and reorder them to shape the learning flow."
      title="Lesson Management"
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/teacher/courses/${courseId}/lessons/add`}>Add lesson</Link>
        </Button>
      </div>
      <LessonList courseId={courseId} />
    </TeacherShell>
  );
}

