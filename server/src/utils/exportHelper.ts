import { Response } from 'express';
import ExcelJS from 'exceljs';
export const exportToExcel = async (data: Record<string, unknown>[], columns: { header: string; key: string; width?: number }[], fileName: string, res: Response) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dữ Liệu');
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20
  }));
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF166534' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  data.forEach(row => {
    worksheet.addRow(row);
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
  await workbook.xlsx.write(res);
};