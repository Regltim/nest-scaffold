import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
  /**
   * 通用导出方法
   * @param res Response 对象
   * @param data 数据数组
   * @param columns 列配置 [{ header: '姓名', key: 'username', width: 20 }]
   * @param filename 文件名
   */
  async export(res: Response, data: any[], columns: any[], filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 设置列
    worksheet.columns = columns;

    // 添加行数据
    worksheet.addRows(data);

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}.xlsx`,
    );

    // 写入流
    await workbook.xlsx.write(res);
    res.end();
  }
}
