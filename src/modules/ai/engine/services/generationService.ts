import { Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { validateResponse } from 'src/utils/validateLLMResponse';
import { GenerationPort } from '../contracts/ports';

@Injectable()
export class GenerationService implements GenerationPort {
  improveResponseWithCitations(answer: string, filteredResults: any[]) {
    if (filteredResults.length > 0 && !answer.includes('Source:')) {
      const sources = [
        ...new Set(
          filteredResults.map(
            ([doc]: any) => doc.metadata?.type || 'Documentation',
          ),
        ),
      ];

      const containsInfo = !answer
        .toLowerCase()
        .includes("i don't have information");
      if (containsInfo) {
        answer += `\n\n_Sources: ${sources.join(', ')}_`;
      }
    }

    return answer;
  }

  async generateAnswer(
    llm: BaseChatModel,
    prompt: string,
    context: string,
    filteredResults: any[],
  ) {
    let answer = await llm.pipe(new StringOutputParser()).invoke(prompt);

    answer = this.improveResponseWithCitations(answer, filteredResults);

    const validated = await validateResponse(answer, context);

    if ((validated as any).warning) {
      console.log('warning', (validated as any).warning);
    }

    return { answer, context, validated };
  }
}
