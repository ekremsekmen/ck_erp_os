export declare class PdfService {
    generateProforma(order: any): Promise<Buffer>;
    generateWaybill(shipment: any): Promise<Buffer>;
}
