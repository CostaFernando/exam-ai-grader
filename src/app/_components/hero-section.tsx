"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

export default function HeroSection() {
  return (
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
                src="https://www.youtube.com/embed/LI2flm_fNZA?si=T-I9Ce4gX7Lm0TFo"
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
  );
}
