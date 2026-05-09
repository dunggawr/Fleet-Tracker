import { IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExportType {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export enum ReportName {
  FLEET_PERFORMANCE = 'fleet-performance',
  FUEL_COST = 'fuel-cost',
  KPI_LEADERBOARD = 'kpi-leaderboard',
  TRIP_SUMMARY = 'trip-summary',
}

export class ExportReportDto {
  @ApiProperty({ enum: ExportType })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiProperty({ enum: ReportName })
  @IsEnum(ReportName)
  report_name: ReportName;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  to?: string;
}
