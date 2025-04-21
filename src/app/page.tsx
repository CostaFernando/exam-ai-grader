"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
  Clock,
  BarChart2,
  Sparkles,
  FileText,
} from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroHighlight
        containerClassName="py-12 md:py-24 lg:py-32"
        className="relative z-20"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-3xl px-4 md:text-4xl lg:text-5xl xl:text-6xl/none font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto"
            >
              <Highlight className="text-black dark:text-white">
                Corrija Provas Mais Rápido
              </Highlight>{" "}
              com Assistência de IA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.6,
              }}
              className="relative z-10 max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mx-auto"
            >
              Automatize a correção de questões discursivas com IA. Economize
              tempo, garanta consistência e forneça feedback melhor aos seus
              alunos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.8,
              }}
              className="relative z-10"
            >
              <Link href="/provas/criar">
                <Button
                  size="lg"
                  className="px-8 transform transition-all duration-300 hover:-translate-y-0.5"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 1.0,
              }}
              className="relative z-10 flex flex-wrap items-center justify-center space-x-4 text-sm"
            >
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Rápido e Preciso</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Feedback Detalhado</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Fácil de Usar</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 1.2,
              }}
              className="relative z-10 mt-12 w-full max-w-4xl rounded-3xl shadow-md"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
                <iframe
                  src="https://www.youtube.com/embed/N-Z8eCYZod8"
                  title="Demonstração do Assistente de Correção de Provas com IA"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </HeroHighlight>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                Principais Recursos
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Por que Escolher a Correção de Provas com IA?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Nossa plataforma com IA otimiza o processo de correção,
                economizando seu tempo e fornecendo feedback consistente e
                detalhado.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3 mt-12">
            <CardContainer containerClassName="p-0">
              <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-gray-900 dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="w-full flex flex-col items-center space-y-2"
                >
                  <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold">Economize Tempo</h3>
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2"
                >
                  Reduza o tempo de correção em até 70%, permitindo que você se
                  concentre no aprendizado.
                </CardItem>
              </CardBody>
            </CardContainer>

            <CardContainer containerClassName="p-0">
              <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-gray-900 dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="w-full flex flex-col items-center space-y-2"
                >
                  <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <BarChart2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold">Análises Detalhadas</h3>
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2"
                >
                  Obtenha insights sobre o desempenho dos alunos com análises e
                  relatórios abrangentes.
                </CardItem>
              </CardBody>
            </CardContainer>

            <CardContainer containerClassName="p-0">
              <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-gray-900 dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="w-full flex flex-col items-center space-y-2"
                >
                  <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <Sparkles className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold">Feedback com IA</h3>
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2"
                >
                  Forneça feedback para ajudar os alunos a entenderem seus erros
                  e melhorarem.
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                Processo Simples
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Como Funciona
              </h2>
              <TextGenerateEffect
                words="Nossa plataforma torna a correção de provas simples e eficiente em apenas alguns passos."
                className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              />
            </div>
          </div>
          <div className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-4 mt-12">
            <div className="flex flex-col items-center space-y-2 relative">
              <div className="rounded-full bg-primary text-primary-foreground p-3 relative z-10">
                <span className="text-xl font-bold">1</span>
              </div>
              <div className="h-1 w-full bg-gray-200 absolute top-6 left-1/2 hidden lg:block dark:bg-gray-800"></div>
              <h3 className="text-xl font-bold mt-2">Carregar Prova</h3>
              <TextGenerateEffect
                words="Crie uma nova prova e carregue o PDF."
                className="text-center text-gray-500 dark:text-gray-400"
              />
            </div>
            <div className="flex flex-col items-center space-y-2 relative">
              <div className="rounded-full bg-primary text-primary-foreground p-3 relative z-10">
                <span className="text-xl font-bold">2</span>
              </div>
              <div className="h-1 w-full bg-gray-200 absolute top-6 left-1/2 hidden lg:block dark:bg-gray-800"></div>
              <h3 className="text-xl font-bold mt-2">Adicionar Respostas</h3>
              <TextGenerateEffect
                words="Carregue as folhas de resposta dos alunos para correção."
                className="text-center text-gray-500 dark:text-gray-400"
              />
            </div>
            <div className="flex flex-col items-center space-y-2 relative">
              <div className="rounded-full bg-primary text-primary-foreground p-3 relative z-10">
                <span className="text-xl font-bold">3</span>
              </div>
              <div className="h-1 w-full bg-gray-200 absolute top-6 left-1/2 hidden lg:block dark:bg-gray-800"></div>
              <h3 className="text-xl font-bold mt-2">Correção com IA</h3>
              <TextGenerateEffect
                words="Nossa IA corrige as respostas com base na sua rubrica."
                className="text-center text-gray-500 dark:text-gray-400"
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-primary text-primary-foreground p-3 relative z-10">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mt-2">Ver Resultados</h3>
              <TextGenerateEffect
                words="Revise notas, feedback e análises."
                className="text-center text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Pronto para Transformar Seu Processo de Correção?
              </h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Junte-se aos educadores que estão economizando tempo e
                fornecendo feedback melhor com nosso assistente de correção com
                IA.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.8,
              }}
              className="relative z-10"
            >
              <Link href="/provas/criar">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 transform transition-all duration-300 hover:-translate-y-0.5"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Crie Sua Primeira Prova
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
