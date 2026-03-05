import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AskDto {
  @IsUUID()
  chatId: string;

  @IsString()
  @MaxLength(4000)
  question: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}
