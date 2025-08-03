# 📝 Exam AI Grader

**Exam AI Grader** é um assistente com Inteligência Artificial para correção automática de provas com questões discursivas. A plataforma permite que professores subam provas e respostas em PDF e recebam correções automatizadas com notas e feedbacks detalhados, com base em rubricas geradas por IA.

🔗 [Testar Aplicação](https://exam-ai-grader.vercel.app/)  
🎥 [Vídeo Demo no YouTube](https://www.youtube.com/watch?v=LI2flm_fNZA)

---

## ⚙️ Funcionalidades

- ✅ CRUD de provas e respostas
- 🧠 Geração automática de **rubricas de avaliação** com IA
- 📘 Geração automática de **gabarito** com IA
- 📄 Processamento de PDFs com **texto e imagens**
- 🤖 Correção automática com IA: **notas e feedback por questão**
- 📤 Exportação dos resultados em **.csv**

---

## 🚀 Como Funciona

1. **Criação da Prova**: O professor faz o upload do PDF com as questões, define ou gera as rubricas e o gabarito.
2. **Submissão das Respostas**: PDFs com as respostas dos alunos são adicionados à plataforma.
3. **Correção com IA**: A IA processa as provas e aplica os critérios definidos para gerar nota e feedback individual.
4. **Visualização de Resultados**: O professor acessa os resultados organizados por questão, aluno, nota e feedback.

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js](https://nextjs.org/)** — Framework de front-end e fullstack
- **[PostHog](https://posthog.com/)** — Analytics de produto
- **[PGLite](https://pglite.dev/)** — Banco de dados Postgres rodando localmente no navegador via WASM
- **[Drizzle ORM](https://orm.drizzle.team/)** — ORM moderno para tiposafe e SQL estruturado
- **[Vercel AI SDK](https://sdk.vercel.ai/)** — Integração com múltiplos LLMs (modelos de linguagem)

---

## 🧠 Modelos de IA Suportados

A plataforma permite o uso de diferentes modelos de LLM, com foco em modelos que suportam processamento de PDFs e instruções complexas. Entre os sugeridos:

### Google
- Gemini Flash 2.0 *(modelo padrão)*
- Gemini Pro 2.5
- Gemini Flash 2.5

### OpenAI
- gpt-4.1
- gpt-4o
- o4-mini

### Anthropic
- Sonnet 3.7

> ⚡️ O modelo padrão é o **Gemini Flash 2.0**, por apresentar ótimo desempenho, alta velocidade e baixo custo.

---

## 🧪 Rodando Localmente

1.	Copie o arquivo .env.example para .env:

```
cp .env.example .env
```

2.	Preencha as variáveis de ambiente com suas chaves de API e configurações.

3. Rode!
```
pnpm i
pnpm run dev
```

---
## 🧪 Experimentos

Este repositório faz parte de um estudo acadêmico para avaliar a acurácia e confiabilidade de LLMs para correção de provas discursivas multimodais.

Na pasta `experiments/` é possível acessar o código usado para os experimentos e os resultados obtidos.

Em breve, será publicado o nome e link para o estudo acadêmico 🧐.

---

📬 Contato

Para sugestões, dúvidas ou contribuições, fique à vontade para abrir uma issue ou entrar em contato!
