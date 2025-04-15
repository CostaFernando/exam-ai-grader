import {
  pgTable,
  timestamp,
  text,
  integer,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const examStatusEnum = pgEnum("exam_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
]);

export const examsTable = pgTable("exams", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  description: text(),
  status: examStatusEnum().default("IN_PROGRESS"),
  gradingRubric: text(),
  answerSheet: text(),
  url: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const examsTableRelations = relations(examsTable, ({ many }) => ({
  examAnswers: many(examAnswersTable),
}));

export const studentsTable = pgTable("students", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const studentsTableRelations = relations(studentsTable, ({ many }) => ({
  examAnswers: many(examAnswersTable),
}));

export const examAnswersTable = pgTable("exam_answers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  examId: integer()
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  studentId: integer()
    .notNull()
    .references(() => studentsTable.id, {
      onDelete: "cascade",
    }),
  answersUrl: text(),
  score: numeric({ precision: 3, scale: 2, mode: "number" }).notNull(),
  feedback: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const examAnswersTableRelations = relations(
  examAnswersTable,
  ({ one }) => ({
    exam: one(examsTable, {
      fields: [examAnswersTable.examId],
      references: [examsTable.id],
    }),
    student: one(studentsTable, {
      fields: [examAnswersTable.studentId],
      references: [studentsTable.id],
    }),
  })
);
