import { IsNotEmpty, IsString } from "class-validator";

export class CreateScoutDocumentDto {
  @IsString()
  @IsNotEmpty()
  candidateName!: string;

  @IsString()
  @IsNotEmpty()
  scoutTitle!: string;

  @IsString()
  @IsNotEmpty()
  scoutBody!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;
}
