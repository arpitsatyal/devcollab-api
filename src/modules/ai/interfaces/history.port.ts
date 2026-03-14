export abstract class MessageHistoryPort {
  abstract getRecentHistory(chatId: string, limit: number): Promise<string>;
}
