import PDFDocument from 'pdfkit';
import { Stream } from 'stream';

export class PDFService {
  static async generateOrderReceipt(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- Header ---
      doc.fontSize(20).text('PrelovedByHira', { align: 'center' });
      doc.fontSize(10).text('Official Order Receipt', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // --- Order Info ---
      doc.fontSize(12).text(`Order ID: ${order.id}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${order.status}`);
      doc.moveDown();

      // --- Shipping Info ---
      const addr = order.shippingAddress as any;
      doc.fontSize(14).text('Shipping Details', { underline: true });
      doc.fontSize(12).text(`Name: ${addr.name}`);
      doc.text(`Phone: ${addr.phone}`);
      doc.text(`Address: ${addr.address}, ${addr.city}`);
      doc.moveDown();

      // --- Item Info ---
      doc.fontSize(14).text('Items', { underline: true });
      doc.fontSize(12).text(`${order.product.title} - Rs. ${order.totalPrice}`);
      doc.moveDown();

      // --- Summary ---
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(14).text(`Total Amount: Rs. ${order.totalPrice}`, { align: 'right' });

      // --- Footer ---
      doc.moveDown(5);
      doc.fontSize(10).fillColor('grey').text('Thank you for shopping with PrelovedByHira!', { align: 'center' });

      doc.end();
    });
  }
}
