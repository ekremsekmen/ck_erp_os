
const API_URL = 'http://localhost:3001';

async function verifyStockDeduction() {
    console.log('🚀 Starting Stock Deduction Verification...');

    try {
        // 1. Get a product with a recipe
        console.log('📦 Fetching products...');
        const productsRes = await fetch(`${API_URL}/products`);
        const products = await productsRes.json();

        const product = products.find(p => p.recipe && p.recipe.length > 0);
        if (!product) {
            console.error('❌ No product with recipe found. Cannot verify.');
            return;
        }
        console.log(`✅ Selected Product: ${product.name} (${product.id})`);
        console.log(`   Recipe: ${product.recipe.length} items`);

        // 2. Get initial stock for the first material in the recipe
        const recipeItem = product.recipe[0];
        const materialId = recipeItem.materialId;
        const quantityRequired = recipeItem.quantity;

        console.log(`🔍 Checking stock for material: ${recipeItem.material.name} (${materialId})`);
        const stockRes1 = await fetch(`${API_URL}/stock/${materialId}`);
        const materialBefore = await stockRes1.json();
        console.log(`   Initial Stock: ${materialBefore.currentStock}`);

        // 3. Create an order
        console.log('📝 Creating a test order...');
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: 'Stock Verification Test',
                customerInfo: 'Test Info',
                totalAmount: 0, // Will be calculated by backend
                items: [{
                    productId: product.id,
                    quantity: 1,
                    unitPrice: product.basePrice,
                    configuration: 'Test Config'
                }]
            })
        });
        const order = await orderRes.json();
        console.log(`✅ Order Created: ${order.id} (Status: ${order.status})`);

        // 4. Start Production (Triggers Stock Deduction)
        console.log('🏭 Starting Production...');
        const startRes = await fetch(`${API_URL}/orders/${order.id}/start-production`, {
            method: 'PATCH'
        });

        if (!startRes.ok) {
            const err = await startRes.text();
            throw new Error(`Failed to start production: ${err}`);
        }
        const updatedOrder = await startRes.json();
        console.log(`✅ Production Started. Order Status: ${updatedOrder.status}`);

        // 5. Verify Stock Deduction
        console.log('🔍 Verifying stock deduction...');
        const stockRes2 = await fetch(`${API_URL}/stock/${materialId}`);
        const materialAfter = await stockRes2.json();
        console.log(`   Final Stock: ${materialAfter.currentStock}`);

        const expectedStock = materialBefore.currentStock - quantityRequired;

        if (Math.abs(materialAfter.currentStock - expectedStock) < 0.001) {
            console.log('🎉 SUCCESS: Stock deducted correctly!');
            console.log(`   ${materialBefore.currentStock} - ${quantityRequired} = ${materialAfter.currentStock}`);
        } else {
            console.error('❌ FAILURE: Stock mismatch!');
            console.error(`   Expected: ${expectedStock}, Found: ${materialAfter.currentStock}`);
        }

    } catch (error) {
        console.error('❌ Error during verification:', error);
    }
}

verifyStockDeduction();
