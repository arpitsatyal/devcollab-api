import { StructuredTool } from '@langchain/core/tools';

export abstract class ToolRegistry {
  abstract getTools(): {
    list: StructuredTool[];
    byName: Record<string, StructuredTool>;
  };
}
