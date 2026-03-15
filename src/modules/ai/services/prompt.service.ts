import { Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { PromptPort } from '../interfaces/prompt.port';

export const IntentSchema = z.object({
  intent: z.enum(['WORKSPACE_QUERY', 'CONVERSATIONAL']),
  scope: z.enum(['APP_SPECIFIC', 'OUT_OF_SCOPE']),
  confidence: z.number().min(0).max(1),
});

@Injectable()
export class PromptService implements PromptPort {
  constructPrompt(context: string, history: string, question: string) {
    return ChatPromptTemplate.fromTemplate(
      `
You are DevCollab AI Assistant. Help answer the user's question with concise, accurate information grounded strictly in the provided context and workspace artifacts. Avoid speculation.

Context:
{context}

Recent conversation:
{history}

User question:
{question}

If the answer isn't in the context, say so and suggest what data would help. Provide clear, actionable steps when relevant.
  `.trim(),
    ).format({
      context,
      history,
      question,
    });
  }

  buildChatMessages(history: string, question: string) {
    return [
      new SystemMessage(
        'You are DevCollab AI Assistant. Use the provided tools to gather workspace-specific information before answering. Always stay within the workspace scope.',
      ),
      new HumanMessage(
        `Conversation history:\n${history}\n\nUser question: ${question}`,
      ),
    ];
  }

  buildIntentClassificationPrompt(question: string) {
    return [
      new SystemMessage(
        'Classify the user intent. Decide if the user asks about DevCollab workspace data (WORKSPACE_QUERY) or is just casual chat (CONVERSATIONAL). Determine scope: APP_SPECIFIC if it clearly refers to app data, OUT_OF_SCOPE otherwise. Return JSON with fields intent, scope, confidence (0-1).',
      ),
      new HumanMessage(question),
    ];
  }

  buildConversationalMessages(history: string, question: string) {
    return [
      new SystemMessage(
        'You are a friendly DevCollab assistant. Keep answers short, relevant to the conversation, and avoid non-DevCollab topics. If the question is unrelated to DevCollab, gently steer back.',
      ),
      new HumanMessage(
        `Conversation history:\n${history}\n\nUser question: ${question}`,
      ),
    ];
  }
}
