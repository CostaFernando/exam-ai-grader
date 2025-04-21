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
  status: examStatusEnum().default("IN_PROGRESS").notNull(),
  gradingRubric: text(),
  answerKey: text(),
  url: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const examsTableRelations = relations(examsTable, ({ many }) => ({
  examAnswers: many(examAnswersTable),
}));

export const examAnswersTable = pgTable("exam_answers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  examId: integer()
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  answerSheetUrl: text().notNull(),
  score: numeric({ precision: 3, scale: 2, mode: "number" }),
  feedback: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const examAnswersTableRelations = relations(
  examAnswersTable,
  ({ one }) => ({
    exam: one(examsTable, {
      fields: [examAnswersTable.examId],
      references: [examsTable.id],
    }),
  })
);
