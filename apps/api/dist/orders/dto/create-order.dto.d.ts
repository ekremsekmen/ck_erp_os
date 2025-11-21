export declare class OrderItemDto {
    productId: string;
    quantity: number;
    configuration?: any;
}
export declare class CreateOrderDto {
    customerName: string;
    customerInfo?: any;
    customerId?: string;
    items?: OrderItemDto[];
}
