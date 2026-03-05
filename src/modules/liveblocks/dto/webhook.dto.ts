import { IsObject, IsString, IsOptional } from 'class-validator';

export class LiveblocksWebhookDto {
  @IsString()
  type: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
