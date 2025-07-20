import { Injectable } from '@nestjs/common';
import { TogetherLLM } from 'src/lib/togetherLLM';

@Injectable()
export class LlmService {
  private readonly llm = new TogetherLLM({});

  async ask(prompt: string): Promise<string> {
    const response = await this.llm.invoke(prompt);
    return (
      response?.['lc_kwargs']?.content ??
      'Sorry, I could not generate a response.'
    );
  }
}
