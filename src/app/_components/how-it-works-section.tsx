import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function HowItWorksSection() {
  return (
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
  );
}
