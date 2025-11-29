import { Global, Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Global() // 关键：标记为全局模块
@Module({
  providers: [ExcelService],
  exports: [ExcelService], // 导出服务，供其他模块使用
})
export class SharedModule {}
