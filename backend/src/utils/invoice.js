const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

/**
 * Generate invoice PDF for an order.
 * Format: INV-2026-000001
 */
const generateInvoicePDF = async (order) => {
  const year = new Date().getFullYear();

  // Generate invoice number
  let invoiceNumber = order.invoiceNumber;
  if (!invoiceNumber) {
    const invoiceDir = path.join(__dirname, '..', '..', env.UPLOAD_DIR, 'invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

    const files = fs.readdirSync(invoiceDir);
    const yearInvoices = files.filter((f) => f.startsWith(`INV-${year}-`));
    const sequence = yearInvoices.length + 1;
    invoiceNumber = `INV-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  const filePath = `${env.UPLOAD_DIR}/invoices/${invoiceNumber}.pdf`;
  const absolutePath = path.join(__dirname, '..', '..', filePath);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(absolutePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text(env.COMPANY_NAME, 50, 50);
    doc.fontSize(10).font('Helvetica').text(env.COMPANY_ADDRESS, 50, 78);
    doc.text(`Phone: ${env.COMPANY_PHONE}`, 50, 92);
    doc.text(`Email: ${env.COMPANY_EMAIL}`, 50, 106);
    if (env.GST_NUMBER) doc.text(`GSTIN: ${env.GST_NUMBER}`, 50, 120);

    // Invoice details (right aligned)
    doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice: ${invoiceNumber}`, 400, 75, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 89, { align: 'right' });
    doc.text(`Order: ${order.orderNumber}`, 400, 103, { align: 'right' });

    // Line
    doc.moveTo(50, 145).lineTo(545, 145).stroke();

    // Shipping Address
    doc.fontSize(11).font('Helvetica-Bold').text('Ship To:', 50, 160);
    doc.fontSize(10).font('Helvetica');
    const addr = order.shippingAddress;
    doc.text(addr.fullName, 50, 177);
    doc.text(addr.addressLine1, 50, 191);
    if (addr.addressLine2) doc.text(addr.addressLine2, 50, 205);
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 50, addr.addressLine2 ? 219 : 205);
    doc.text(`Phone: ${addr.phone}`, 50, addr.addressLine2 ? 233 : 219);

    // Table header
    const tableTop = addr.addressLine2 ? 265 : 250;
    doc.font('Helvetica-Bold').fontSize(9);

    const cols = { item: 50, hsn: 240, qty: 300, rate: 345, gst: 400, amount: 480 };
    doc.text('Item', cols.item, tableTop);
    doc.text('HSN', cols.hsn, tableTop);
    doc.text('Qty', cols.qty, tableTop);
    doc.text('Rate', cols.rate, tableTop);
    doc.text('GST%', cols.gst, tableTop);
    doc.text('Amount', cols.amount, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Table rows
    doc.font('Helvetica').fontSize(9);
    let y = tableTop + 25;

    for (const item of order.items) {
      if (y > 700) { doc.addPage(); y = 50; }

      doc.text(`${item.productName} - ${item.variantName}`, cols.item, y, { width: 185 });
      doc.text(item.hsnCode || '-', cols.hsn, y);
      doc.text(item.quantity.toString(), cols.qty, y);
      doc.text(`₹${item.effectivePrice.toFixed(2)}`, cols.rate, y);
      doc.text(`${item.gstPercentage}%`, cols.gst, y);
      doc.text(`₹${item.total.toFixed(2)}`, cols.amount, y);

      y += 20;
    }

    // Totals
    doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
    y += 20;

    const rightCol = 400;
    doc.font('Helvetica');
    doc.text('Subtotal:', rightCol, y); doc.text(`₹${order.subtotal.toFixed(2)}`, cols.amount, y);
    y += 16;
    doc.text('CGST:', rightCol, y); doc.text(`₹${order.gst.cgst.toFixed(2)}`, cols.amount, y);
    y += 16;
    doc.text('SGST:', rightCol, y); doc.text(`₹${order.gst.sgst.toFixed(2)}`, cols.amount, y);
    y += 16;
    doc.text('Shipping:', rightCol, y); doc.text(`₹${order.shippingCharge.toFixed(2)}`, cols.amount, y);

    if (order.discount > 0) {
      y += 16;
      doc.text('Discount:', rightCol, y); doc.text(`-₹${order.discount.toFixed(2)}`, cols.amount, y);
    }

    y += 20;
    doc.moveTo(rightCol, y).lineTo(545, y).stroke();
    y += 8;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', rightCol, y); doc.text(`₹${order.total.toFixed(2)}`, cols.amount, y);

    // Footer
    y += 50;
    doc.font('Helvetica').fontSize(8);
    doc.text('Thank you for shopping with Venus Essentials!', 50, y, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a signature.', 50, y + 14, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      resolve({ invoiceNumber, filePath });
    });

    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };
