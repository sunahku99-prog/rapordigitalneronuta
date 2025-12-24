import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
export function createStreamedPDF(build: (doc: PDFDocument) => void) {
  const stream = new PassThrough();
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  doc.pipe(stream);
  build(doc);
  doc.end();
  return stream;
}
