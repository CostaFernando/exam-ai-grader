export const createSchemaQueries = [
  `DO $$
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_status') THEN
          CREATE TYPE "public"."exam_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
      END IF;
  END$$;`,

  `CREATE TABLE IF NOT EXISTS "exam_answers" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "examId" integer NOT NULL,
    "questionId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "answersUrl" text,
    "score" numeric(3, 2) NOT NULL,
    "feedback" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS "exams" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name" text NOT NULL,
    "description" text,
    "status" "exam_status" DEFAULT 'IN_PROGRESS',
    "gradingRubric" text,
    "answerKey" text,
    "url" text,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS "questions" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "examId" integer NOT NULL,
    "text" text NOT NULL,
    "maxScore" integer NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS "students" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "students_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name" text NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS "users" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name" varchar(255) NOT NULL,
    "age" integer NOT NULL,
    "email" varchar(255) NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
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

  `DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'exam_answers_questionId_questions_id_fk'
      ) THEN
          ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_questionId_questions_id_fk" 
          FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
  END$$;`,

  `DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'exam_answers_studentId_students_id_fk'
      ) THEN
          ALTER TABLE "exam_answers" ADD CONSTRAINT "exam_answers_studentId_students_id_fk" 
          FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
  END$$;`,

  `DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'questions_examId_exams_id_fk'
      ) THEN
          ALTER TABLE "questions" ADD CONSTRAINT "questions_examId_exams_id_fk" 
          FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
  END$$;`,
];
