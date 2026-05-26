import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DecideScoutDocumentDto {
  @IsIn(["approve", "return"])
  action!: "approve" | "return";

  @IsString()
  @IsNotEmpty()
  decidedBy!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
