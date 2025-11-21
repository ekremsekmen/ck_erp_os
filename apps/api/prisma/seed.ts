import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDb() {
    console.log('Cleaning database...');
    await prisma.productionHistory.deleteMany();
    await prisma.productionTracking.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.recipeItem.deleteMany();
    await prisma.materialPriceHistory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.material.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    await cleanDb();

    console.log('Seeding database...');

    // 1. Users
    await prisma.user.create({
        data: {
            email: 'admin@celikkapi.com',
            name: 'Admin User',
            password: 'password123', // In real app, hash this!
            role: 'ADMIN',
        },
    });

    await prisma.user.create({
        data: {
            email: 'uretim@celikkapi.com',
            name: 'Üretim Sorumlusu',
            password: 'password123',
            role: 'WORKER',
        },
    });

    console.log('Users created.');

    // 2. Customers
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                name: 'Yılmaz İnşaat A.Ş.',
                email: 'info@yilmazinsaat.com',
                phone: '0212 555 10 20',
                address: 'Maslak Mah. Büyükdere Cad. No:123 Sarıyer/İstanbul',
                taxId: '9876543210',
                taxOffice: 'Maslak',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Modern Konutlar Yapı Kooperatifi',
                email: 'yonetim@modernkonutlar.com',
                phone: '0216 444 30 40',
                address: 'Ataşehir Bulvarı, 34. Ada, Ataşehir/İstanbul',
                taxId: '1234567890',
                taxOffice: 'Kozyatağı',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Ahmet Demir (Bireysel)',
                email: 'ahmet.demir@email.com',
                phone: '0532 111 22 33',
                address: 'Bağdat Cad. No:456 Kadıköy/İstanbul',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Ege Mimarlık Ofisi',
                email: 'info@egemimarlik.com',
                phone: '0232 333 44 55',
                address: 'Alsancak, İzmir',
                taxId: '5556667778',
                taxOffice: 'Kordon',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'Kaya Yapı Malzemeleri Ltd. Şti.',
                email: 'satis@kayayapi.com',
                phone: '0312 444 55 66',
                address: 'Ostim OSB, Ankara',
                taxId: '1112223334',
                taxOffice: 'Ostim',
            },
        }),
    ]);

    console.log('Customers created.');

    // 3. Materials
    const materials = await Promise.all([
        prisma.material.create({ data: { name: 'DKP Sac 1.2mm', unit: 'm2', currentStock: 5000, minStockLevel: 500, unitPrice: 450, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'DKP Sac 2.0mm', unit: 'm2', currentStock: 3000, minStockLevel: 300, unitPrice: 750, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'MDF Panel 8mm', unit: 'm2', currentStock: 2000, minStockLevel: 200, unitPrice: 320, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Kale Kilit Sistemi (Monoblok)', unit: 'adet', currentStock: 1500, minStockLevel: 100, unitPrice: 1200, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Çelik Kapı Kolu (Krom)', unit: 'takım', currentStock: 2000, minStockLevel: 150, unitPrice: 450, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Taş Yünü İzolasyon', unit: 'm2', currentStock: 10000, minStockLevel: 1000, unitPrice: 85, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Elektrostatik Toz Boya (Antrasit)', unit: 'kg', currentStock: 500, minStockLevel: 50, unitPrice: 250, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Menteşe (Ağır Tip)', unit: 'adet', currentStock: 5000, minStockLevel: 500, unitPrice: 150, currency: 'TRY' } }),
    ]);

    console.log('Materials created.');

    // 3.1 Material Price History
    const dkpSac = materials[0];
    const now = new Date();
    await prisma.materialPriceHistory.createMany({
        data: [
            { materialId: dkpSac.id, price: 380, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 5, 15) },
            { materialId: dkpSac.id, price: 395, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 4, 10) },
            { materialId: dkpSac.id, price: 410, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 3, 5) },
            { materialId: dkpSac.id, price: 425, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 2, 20) },
            { materialId: dkpSac.id, price: 440, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
        ]
    });

    // 4. Products & Recipes
    const products = [];

    // Product 1: Eko Line
    const p1 = await prisma.product.create({
        data: {
            name: 'Eko Line Çelik Kapı',
            basePrice: 5500,
            description: 'Ekonomik, temel güvenlikli daire giriş kapısı.',
            recipe: {
                create: [
                    { materialId: materials[0].id, quantity: 2 }, // 2m2 Sac
                    { materialId: materials[5].id, quantity: 2 }, // 2m2 Taş Yünü
                    { materialId: materials[3].id, quantity: 1 }, // 1 Kilit
                    { materialId: materials[4].id, quantity: 1 }, // 1 Kol
                    { materialId: materials[7].id, quantity: 3 }, // 3 Menteşe
                ]
            }
        },
    });
    products.push(p1);

    // Product 2: Lüks Seri
    const p2 = await prisma.product.create({
        data: {
            name: 'Lüks Kabartma Seri',
            basePrice: 12500,
            description: 'Özel kabartma desenli, yüksek güvenlikli lüks seri.',
            recipe: {
                create: [
                    { materialId: materials[1].id, quantity: 2.5 }, // 2.5m2 Kalın Sac
                    { materialId: materials[2].id, quantity: 2 }, // 2m2 MDF
                    { materialId: materials[5].id, quantity: 2 },
                    { materialId: materials[3].id, quantity: 1 },
                    { materialId: materials[4].id, quantity: 1 },
                    { materialId: materials[7].id, quantity: 4 },
                ]
            }
        },
    });
    products.push(p2);

    // Product 3: Yangın Kapısı
    const p3 = await prisma.product.create({
        data: {
            name: 'Yangın Kapısı (120dk)',
            basePrice: 3500,
            description: '120 dakika yangına dayanıklı, sertifikalı acil çıkış kapısı.',
            recipe: {
                create: [
                    { materialId: materials[0].id, quantity: 2 },
                    { materialId: materials[5].id, quantity: 2.5 }, // Ekstra izolasyon
                    { materialId: materials[6].id, quantity: 0.5 }, // Boya
                    { materialId: materials[7].id, quantity: 3 },
                ]
            }
        },
    });
    products.push(p3);

    console.log('Products and Recipes created.');

    // 5. Orders & Production & Shipments

    // 5.1 Completed Orders (Last 6 months revenue)
    for (let i = 0; i < 50; i++) {
        const randomMonth = Math.floor(Math.random() * 6);
        const date = new Date(now.getFullYear(), now.getMonth() - randomMonth, Math.floor(Math.random() * 28) + 1);
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;

        await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                customerInfo: JSON.stringify({ address: customer.address, phone: customer.phone }),
                status: 'DELIVERED',
                totalAmount: product.basePrice * quantity,
                createdAt: date,
                updatedAt: date,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: quantity,
                        unitPrice: product.basePrice,
                        configuration: JSON.stringify({ color: 'Standart', width: 90, height: 200 }),
                    }]
                }
            }
        });
    }

    // 5.2 Active Production Orders
    const stages = ['CUTTING_BENDING', 'WELDING_GRINDING', 'PAINTING_WASHING', 'ASSEMBLY_PACKAGING', 'READY_FOR_SHIPMENT'];

    for (let i = 0; i < 10; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const currentStageIndex = Math.floor(Math.random() * stages.length);
        const currentStage = stages[currentStageIndex];
        const status = currentStage === 'READY_FOR_SHIPMENT' ? 'READY_FOR_SHIPMENT' : 'IN_PRODUCTION';

        const order = await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                customerInfo: JSON.stringify({ address: customer.address, phone: customer.phone }),
                status: status,
                totalAmount: product.basePrice * quantity,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: quantity,
                        unitPrice: product.basePrice,
                        configuration: JSON.stringify({ color: 'Özel', width: 100, height: 210 }),
                    }]
                }
            }
        });

        await prisma.productionTracking.create({
            data: {
                orderId: order.id,
                currentStage: currentStage,
                startedAt: new Date(now.getTime() - (10 - i) * 24 * 60 * 60 * 1000),
                history: {
                    create: stages.slice(0, currentStageIndex + 1).map((stage, idx) => ({
                        stage: stage,
                        enteredAt: new Date(now.getTime() - (10 - i + idx) * 24 * 60 * 60 * 1000),
                        notes: `Moved to ${stage}`
                    }))
                }
            }
        });
    }

    // 5.3 Pending Orders
    for (let i = 0; i < 5; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 20) + 1;

        await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                customerInfo: JSON.stringify({ address: customer.address, phone: customer.phone }),
                status: 'PENDING',
                totalAmount: product.basePrice * quantity,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: quantity,
                        unitPrice: product.basePrice,
                        configuration: JSON.stringify({ color: 'Beyaz', width: 90, height: 200 }),
                    }]
                }
            }
        });
    }

    // 5.4 Shipments
    // Create a shipment for one of the delivered orders (simulated)
    const shippedOrder = await prisma.order.create({
        data: {
            customerId: customers[0].id,
            customerName: customers[0].name,
            status: 'SHIPPED',
            totalAmount: 50000,
            items: {
                create: [{
                    productId: products[0].id,
                    quantity: 5,
                    unitPrice: products[0].basePrice,
                }]
            }
        }
    });

    await prisma.shipment.create({
        data: {
            orderId: shippedOrder.id,
            waybillNumber: 'IRS-2024-001',
            carrierInfo: 'Aras Kargo - Takip: 123456',
            shippedAt: new Date(),
        }
    });

    console.log('Orders, Production, and Shipments created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
