import { Clock, BarChart2, Sparkles } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function FeaturesSection() {
  return (
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
                Forneça feedback para ajudar os alunos a entenderem seus erros e
                melhorarem.
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    </section>
  );
}
