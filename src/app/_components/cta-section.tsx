"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { motion } from "motion/react";

export default function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Pronto para Transformar Seu Processo de Correção?
            </h2>
            <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Junte-se aos educadores que estão economizando tempo e fornecendo
              feedback melhor com nosso assistente de correção com IA.
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
  );
}
