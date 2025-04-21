export const createSchemaQueries = [
  `DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_status') THEN
          CREATE TYPE "public"."exam_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
      END IF;
  END$$;`,

  `CREATE TABLE IF NOT EXISTS "exam_answers" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name" text NOT NULL,
    "examId" integer NOT NULL,
    "answerSheetUrl" text NOT NULL,
    "score" numeric(3, 2),
    "feedback" text,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "exams" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name" text NOT NULL,
    "description" text,
    "status" "exam_status" DEFAULT 'IN_PROGRESS' NOT NULL,
    "gradingRubric" text,
    "answerKey" text,
    "url" text,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
  );`,

  `DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'exam_answers_examId_exams_id_fk'
      ) THEN
          ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_examId_exams_id_fk" 
          FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
  END$$;`,
];
