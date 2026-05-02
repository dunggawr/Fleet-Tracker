import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  message?: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message || 'OK';
  }
}

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.success = true;
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export class ApiErrorDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  error: {
    code: string;
    message: string;
  };

  constructor(code: string, message: string) {
    this.success = false;
    this.error = { code, message };
  }
}
