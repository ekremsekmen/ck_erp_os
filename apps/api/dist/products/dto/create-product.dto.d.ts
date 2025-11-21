export declare class RecipeItemDto {
    materialId: string;
    quantity: number;
}
export declare class CreateProductDto {
    name: string;
    basePrice: number;
    description?: string;
    recipe?: RecipeItemDto[];
}
