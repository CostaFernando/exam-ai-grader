"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Loader2,
  BarChart,
} from "lucide-react";
import { initializeDatabase } from "@/db";
import { type examStatusEnum, examsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type Exam = {
  id: number;
  name: string;
  description: string | null;
  status: (typeof examStatusEnum.enumValues)[number];
  gradingRubric: string | null;
  answerKey: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
  examAnswers: ExamAnswer[];
};

type ExamAnswer = {
  id: number;
  examId: number;
  name: string;
  answerSheetUrl: string | null;
  score: number;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  const gradeExam = (id: number) => {
    router.push(`/exams/${id}?tab=answerSheets&grade=true`);
  };

  useEffect(() => {
    async function initializeDatabaseAndSetDb() {
      try {
        const database = await initializeDatabase();
        setDb(database);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Falha ao conectar ao banco de dados");
        setLoading(false);
      }
    }

    initializeDatabaseAndSetDb();
  }, []);

  useEffect(() => {
    async function fetchExams() {
      if (!db) return;

      try {
        setLoading(true);
        const result = await db.query.examsTable.findMany({
          with: {
            examAnswers: true,
          },
        });
        setExams(result);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Falha ao carregar provas");
      } finally {
        setLoading(false);
      }
    }

    if (db) {
      fetchExams();
    }
  }, [db]);

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteExam = async (id: number) => {
    if (!db) return;

    try {
      await db.delete(examsTable).where(eq(examsTable.id, id));
      setExams(exams.filter((exam) => exam.id !== id));
    } catch (err) {
      console.error("Error deleting exam:", err);
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Ativa";
      case "COMPLETED":
        return "Concluída";
      case "ARCHIVED":
        return "Arquivada";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provas</h1>
        <Link href="/exams/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Prova
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Provas</CardTitle>
          <CardDescription>
            Gerencie suas provas criadas e o status de correção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar provas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filtrar</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Todas as Provas</DropdownMenuItem>
                <DropdownMenuItem>Ativa</DropdownMenuItem>
                <DropdownMenuItem>Concluída</DropdownMenuItem>
                <DropdownMenuItem>Arquivada</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Carregando provas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Nenhuma prova encontrada</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm
                  ? "Tente um termo de busca diferente"
                  : "Crie sua primeira prova para começar"}
              </p>
              {!searchTerm && (
                <Link href="/exams/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Prova
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Prova</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Folhas de Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => {
                    const answersGraded = exam.examAnswers.length;

                    const createdDate =
                      exam.createdAt instanceof Date
                        ? format(exam.createdAt, "yyyy-MM-dd")
                        : format(new Date(exam.createdAt), "yyyy-MM-dd");

                    return (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          {exam.name}
                        </TableCell>
                        <TableCell>{createdDate}</TableCell>
                        <TableCell>
                          {answersGraded} / {answersGraded}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(exam.status)}>
                            {formatStatus(exam.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/exams/${exam.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/exams/${exam.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Prova
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() => gradeExam(exam.id)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Corrigir Respostas
                              </DropdownMenuItem>
                              <Link href={`/answers/upload?examId=${exam.id}`}>
                                <DropdownMenuItem>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Folhas de Resposta
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/results?examId=${exam.id}`}>
                                <DropdownMenuItem>
                                  <BarChart className="h-4 w-4 mr-2" />
                                  Ver Resultados
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() => handleDeleteExam(exam.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
