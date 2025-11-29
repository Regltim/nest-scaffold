import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWhitelistDto {
  @ApiProperty({ description: '接口路徑', example: '/api/test/hello' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\//, { message: '路徑必須以 / 開頭' })
  path: string;
}

export class DeleteWhitelistDto {
  @ApiProperty({ description: '要刪除的接口路徑', example: '/api/test/hello' })
  @IsString()
  @IsNotEmpty()
  path: string;
}

export class UpdateWhitelistDto {
  @ApiProperty({ description: '舊路徑', example: '/api/wrong/path' })
  @IsString()
  @IsNotEmpty()
  oldPath: string;

  @ApiProperty({ description: '新路徑', example: '/api/right/path' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\//, { message: '路徑必須以 / 開頭' })
  newPath: string;
}
