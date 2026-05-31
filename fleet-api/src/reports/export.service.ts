import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  async exportExcel(data: any, reportName: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportName);

    if (Array.isArray(data) && data.length > 0) {
      // Get headers from first object keys
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map((h) => ({
        header: h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, ' '),
        key: h,
        width: 20,
      }));

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCCC' },
      };

      // Add rows
      data.forEach((item) => {
        worksheet.addRow(item);
      });
    } else if (typeof data === 'object') {
      // Handle single object summary (like fleet performance)
      worksheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ];

      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          worksheet.addRow({ metric: key, value: JSON.stringify(value) });
        } else {
          worksheet.addRow({ metric: key, value });
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportPdf(data: any, reportTitle: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: any[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Document Title/Header
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a').text(reportTitle.toUpperCase().replace(/-/g, ' '), { align: 'center', underline: true });
      doc.moveDown(1.5);

      // Helper function to format keys
      const formatKey = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();

      // Content rendering
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          doc.font('Helvetica-Bold').fontSize(12).fillColor('#4f46e5').text(`RECORD ${index + 1}`, { underline: true });
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor('#334155');

          Object.entries(item).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              doc.fontSize(9).text(`  ${formatKey(key)}: ${JSON.stringify(value).substring(0, 120)}...`);
            } else {
              doc.fontSize(9).text(`  ${formatKey(key)}: ${value}`);
            }
          });
          doc.moveDown();
        });
      } else {
        doc.font('Helvetica');
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // Render sub-list of entries (e.g. trends or rankings)
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#4f46e5').text(`${formatKey(key)}:`);
            doc.moveDown(0.3);
            doc.font('Helvetica').fillColor('#334155');

            value.slice(0, 15).forEach((item, idx) => {
              const formattedItem = Object.entries(item)
                .map(([k, v]) => `${formatKey(k)}: ${typeof v === 'number' && v > 1000 ? v.toLocaleString() : v}`)
                .join(' | ');
              doc.fontSize(9).text(`  • ${formattedItem}`);
            });
            doc.moveDown();
          } else if (typeof value === 'object' && value !== null) {
            // Render sub-object
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#4f46e5').text(`${formatKey(key)}:`);
            doc.moveDown(0.3);
            doc.font('Helvetica').fillColor('#334155');

            Object.entries(value).forEach(([k, v]) => {
              doc.fontSize(9).text(`  ${formatKey(k)}: ${v}`);
            });
            doc.moveDown();
          } else {
            // Render standard metric
            const formattedVal = typeof value === 'number' && value > 1000 ? value.toLocaleString() : value;
            doc.font('Helvetica').fontSize(11).fillColor('#1e293b').text(`${formatKey(key)}: ${formattedVal}`);
            doc.moveDown(0.4);
          }
        });
      }

      doc.end();
    });
  }
}
