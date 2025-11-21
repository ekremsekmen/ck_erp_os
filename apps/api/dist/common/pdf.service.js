"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
let PdfService = class PdfService {
    async generateProforma(order) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const fontPath = path.join(__dirname, '..', 'assets', 'fonts');
            const regularFontPath = path.join(fontPath, 'Arial-Regular.ttf');
            const boldFontPath = path.join(fontPath, 'Arial-Bold.ttf');
            console.log('Loading fonts from:', fontPath);
            try {
                if (fs.existsSync(regularFontPath)) {
                    doc.registerFont('Arial', fs.readFileSync(regularFontPath));
                }
                else {
                    console.warn('Arial-Regular.ttf not found at', regularFontPath);
                }
                if (fs.existsSync(boldFontPath)) {
                    doc.registerFont('Arial-Bold', fs.readFileSync(boldFontPath));
                }
                else {
                    console.warn('Arial-Bold.ttf not found at', boldFontPath);
                }
            }
            catch (error) {
                console.error('Error registering font:', error);
            }
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                reject(err);
            });
            doc.font('Arial-Bold').fontSize(20).text('PROFORMA FATURA', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).font('Arial').text('AtölyeOS', { align: 'left' });
            doc.text('Organize Sanayi Bölgesi', { align: 'left' });
            doc.text('İstanbul, Türkiye', { align: 'left' });
            doc.moveDown();
            doc.font('Arial-Bold').text('Müşteri Bilgileri:', { align: 'left' });
            doc.font('Arial').text(order.customerName);
            if (order.customerInfo) {
                try {
                    const info = JSON.parse(order.customerInfo);
                    if (info.address)
                        doc.text(info.address);
                    if (info.phone)
                        doc.text(info.phone);
                    if (info.email)
                        doc.text(info.email);
                }
                catch (e) {
                    doc.text(order.customerInfo);
                }
            }
            doc.moveDown();
            doc.font('Arial-Bold').text(`Sipariş No: ${order.id.substring(0, 8)}`, { align: 'right' });
            doc.text(`Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}`, { align: 'right' });
            doc.moveDown();
            const tableTop = 250;
            const itemCodeX = 50;
            const descriptionX = 150;
            const quantityX = 350;
            const priceX = 400;
            const totalX = 480;
            doc.font('Arial-Bold');
            doc.text('Ürün', itemCodeX, tableTop);
            doc.text('Miktar', quantityX, tableTop);
            doc.text('Birim Fiyat', priceX, tableTop);
            doc.text('Toplam', totalX, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            let y = tableTop + 30;
            doc.font('Arial');
            order.items.forEach((item) => {
                const productName = item.product ? item.product.name : 'Unknown Product';
                const total = item.quantity * item.unitPrice;
                doc.text(productName, itemCodeX, y);
                doc.text(item.quantity.toString(), quantityX, y);
                doc.text(`$${item.unitPrice.toFixed(2)}`, priceX, y);
                doc.text(`$${total.toFixed(2)}`, totalX, y);
                y += 20;
            });
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;
            doc.font('Arial-Bold');
            doc.text(`Genel Toplam: $${order.totalAmount.toFixed(2)}`, totalX - 50, y, { align: 'right' });
            doc.end();
        });
    }
    async generateWaybill(shipment) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const fontPath = path.join(__dirname, '..', 'assets', 'fonts');
            const regularFontPath = path.join(fontPath, 'Arial-Regular.ttf');
            const boldFontPath = path.join(fontPath, 'Arial-Bold.ttf');
            try {
                if (fs.existsSync(regularFontPath)) {
                    doc.registerFont('Arial', fs.readFileSync(regularFontPath));
                }
                if (fs.existsSync(boldFontPath)) {
                    doc.registerFont('Arial-Bold', fs.readFileSync(boldFontPath));
                }
            }
            catch (error) {
                console.error('Error registering font:', error);
            }
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                reject(err);
            });
            doc.font('Arial-Bold').fontSize(20).text('İRSALİYE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).font('Arial');
            doc.text(`İrsaliye No: ${shipment.waybillNumber}`);
            doc.text(`Sevk Tarihi: ${new Date(shipment.shippedAt).toLocaleDateString('tr-TR')}`);
            doc.moveDown();
            const order = shipment.order;
            doc.font('Arial-Bold').text('Alıcı:', { align: 'left' });
            doc.font('Arial').text(order.customerName);
            if (order.customerInfo) {
                try {
                    const info = JSON.parse(order.customerInfo);
                    if (info.address)
                        doc.text(info.address);
                }
                catch (e) { }
            }
            doc.moveDown();
            doc.font('Arial-Bold');
            doc.text('Ürün', 50, 200);
            doc.text('Miktar', 400, 200);
            doc.moveTo(50, 215).lineTo(550, 215).stroke();
            let y = 230;
            doc.font('Arial');
            order.items.forEach((item) => {
                const productName = item.product ? item.product.name : 'Unknown Product';
                doc.text(productName, 50, y);
                doc.text(item.quantity.toString(), 400, y);
                y += 20;
            });
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map