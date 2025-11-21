"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verifyStockDeduction() {
    console.log('--- Starting Stock Deduction Verification ---');
    const product = await prisma.product.findFirst({
        where: { name: 'Eko Line Çelik Kapı' },
        include: {
            recipe: {
                include: {
                    material: true
                }
            }
        }
    });
    if (!product) {
        console.error('Product not found!');
        return;
    }
    if (!product.recipe || product.recipe.length === 0) {
        console.error('Product has no recipe!');
        return;
    }
    console.log(`Selected Product: ${product.name}`);
    console.log('Recipe:');
    product.recipe.forEach(item => {
        console.log(`- ${item.material.name}: ${item.quantity} ${item.material.unit}`);
    });
    const materialIds = product.recipe.map(r => r.materialId);
    const initialMaterials = await prisma.material.findMany({
        where: { id: { in: materialIds } }
    });
    const initialStockMap = new Map(initialMaterials.map(m => [m.id, m.currentStock]));
    const orderQuantity = 5;
    console.log(`\nCreating Order for ${orderQuantity} units...`);
    const customer = await prisma.customer.findFirst();
    if (!customer)
        throw new Error('No customer found');
    const order = await prisma.order.create({
        data: {
            customerId: customer.id,
            customerName: customer.name,
            status: 'PENDING',
            totalAmount: product.basePrice * orderQuantity,
            items: {
                create: [{
                        productId: product.id,
                        quantity: orderQuantity,
                        unitPrice: product.basePrice,
                    }]
            }
        }
    });
    console.log(`Order Created: ${order.id}`);
    console.log('Triggering Start Production...');
    try {
        const response = await fetch(`http://localhost:3001/orders/${order.id}/start-production`, {
            method: 'PATCH'
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        console.log('Production Started successfully.');
    }
    catch (error) {
        console.error('Failed to call API. Is the server running on port 3001?');
        console.error(error);
        return;
    }
    console.log('\n--- Verifying Results ---');
    const finalMaterials = await prisma.material.findMany({
        where: { id: { in: materialIds } }
    });
    let allCorrect = true;
    for (const recipeItem of product.recipe) {
        const material = finalMaterials.find(m => m.id === recipeItem.materialId);
        const initialStock = initialStockMap.get(recipeItem.materialId) || 0;
        const expectedDeduction = recipeItem.quantity * orderQuantity;
        const expectedStock = initialStock - expectedDeduction;
        const isCorrect = Math.abs(material.currentStock - expectedStock) < 0.01;
        console.log(`Material: ${material.name}`);
        console.log(`  Initial: ${initialStock}`);
        console.log(`  Expected Deduction: ${expectedDeduction} (${recipeItem.quantity} x ${orderQuantity})`);
        console.log(`  Expected Final: ${expectedStock}`);
        console.log(`  Actual Final:   ${material.currentStock}`);
        console.log(`  Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        if (!isCorrect)
            allCorrect = false;
    }
    if (allCorrect) {
        console.log('\n✅ SUCCESS: Automatic stock deduction is working correctly!');
    }
    else {
        console.log('\n❌ FAILURE: Stock deduction logic has errors.');
    }
}
verifyStockDeduction()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=verify-stock.js.map