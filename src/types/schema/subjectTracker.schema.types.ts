import { SubjectStreakGetSchema, SubjectStreakPostSchema, SubjectStreakUpdateSchema } from "@/schema/subjectStreak.schema"
import z from "zod"

export type tSubjectStreakPostSchema = z.infer<typeof SubjectStreakPostSchema>
export type tSubjectStreakGetSchema = z.infer<typeof SubjectStreakGetSchema>
export type tSubjectStreakUpdateSchema = z.infer<typeof SubjectStreakUpdateSchema>