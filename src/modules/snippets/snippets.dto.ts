import { IsOptional, IsString } from 'class-validator';

export class SnippetsCreateDto {
  @IsString()
  title: string;

  @IsString()
  language: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  extension?: string;
}

export class SnippetsUpdateDto extends SnippetsCreateDto {
  @IsString()
  lastEditedById: string;
}
