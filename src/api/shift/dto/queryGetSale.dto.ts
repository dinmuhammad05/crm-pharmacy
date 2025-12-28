import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class QueryGetSaleDto {
    startDate:string 
    endDate:string
}