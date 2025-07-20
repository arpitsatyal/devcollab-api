export class PromptBuilder {
  static build(context: string, question: string): string {
    return `
You are a helpful and concise assistant for a web app called Dev-Collab.
Use the context below to answer the user's question directly and naturally.
Do not say "based on the context" or "in the given context".
Just give a clear, helpful answer.

Context:
${context}

Question:
${question}

Answer:`.trim();
  }
}
