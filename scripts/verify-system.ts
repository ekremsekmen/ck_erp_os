import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function runTests() {
    console.log('🚀 Starting Full System Verification...\n');

    try {
        // 0. Authenticate
        console.log('🔑 Authenticating...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@celikkapi.com',
            password: 'password123'
        });
        const token = login.data.access_token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Authenticated');

        // 1. Test Products
        console.log('📦 Testing Products...');
        const products = await axios.get(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } });
        if (products.data.length !== 3) throw new Error(`Expected 3 products, got ${products.data.length}`);
        console.log('✅ Products OK');

        // 2. Test Stock
        console.log('📊 Testing Stock...');
        const materials = await axios.get(`${API_URL}/stock`, { headers: { Authorization: `Bearer ${token}` } });
        if (materials.data.length !== 5) throw new Error(`Expected 5 materials, got ${materials.data.length}`);
        console.log('✅ Stock OK');

        // 3. Test Orders
        console.log('🛒 Testing Orders...');
        const orders = await axios.get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
        // 50 completed + 10 active + 10 pending + 5 cancelled = 75
        if (orders.data.length < 70) throw new Error(`Expected ~75 orders, got ${orders.data.length}`);

        const pending = orders.data.filter((o: any) => o.status === 'PENDING');
        if (pending.length !== 10) throw new Error(`Expected 10 PENDING orders, got ${pending.length}`);
        console.log('✅ Orders OK');

        // 4. Test BI - Bottlenecks
        console.log('⚠️ Testing BI Bottlenecks...');
        const bottlenecks = await axios.get(`${API_URL}/bi/bottlenecks`, { headers: { Authorization: `Bearer ${token}` } });
        const welding = bottlenecks.data.stageBenchmarks.find((s: any) => s.stage === 'WELDING_GRINDING');
        if (!welding) throw new Error('Welding stage missing in analysis');
        if (welding.averageDurationHours < 5) throw new Error('Welding average duration too low (should be high due to seed)');

        if (bottlenecks.data.activeDelays.length === 0) throw new Error('Expected active delays, got none');
        console.log('✅ BI Bottlenecks OK');

        // 5. Test BI - Stock Forecast
        console.log('📉 Testing BI Stock Forecast...');
        const forecast = await axios.get(`${API_URL}/bi/stock-forecast`, { headers: { Authorization: `Bearer ${token}` } });
        const shortage = forecast.data.forecast.find((f: any) => f.status === 'CRITICAL_SHORTAGE');
        if (!shortage) throw new Error('Expected critical shortage (Menteşe), got none');
        console.log('✅ BI Stock Forecast OK');

        // 6. Test BI - Cost Analysis
        console.log('💰 Testing BI Cost Analysis...');
        const product = products.data[0];
        const cost = await axios.get(`${API_URL}/bi/cost-analysis/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!cost.data.currentTotalCost) throw new Error('Cost calculation failed');
        if (cost.data.materialCosts.length === 0) throw new Error('Material breakdown missing');
        console.log('✅ BI Cost Analysis OK');

        // 7. Test Shipments
        console.log('🚚 Testing Shipments...');
        const shipments = await axios.get(`${API_URL}/shipment`, { headers: { Authorization: `Bearer ${token}` } });
        if (shipments.data.length < 20) throw new Error(`Expected >20 shipments, got ${shipments.data.length}`);
        console.log('✅ Shipments OK');

        console.log('\n✨ All Systems Operational! Verification Passed.');

    } catch (error: any) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        } else {
            console.error('Error Details:', error);
        }
        process.exit(1);
    }
}

runTests();
