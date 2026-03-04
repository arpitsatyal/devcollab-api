import { IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;
}
