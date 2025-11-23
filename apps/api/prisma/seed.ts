import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Users
    await prisma.user.create({
        data: {
            email: 'admin@celikkapi.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    await prisma.user.create({
        data: {
            email: 'uretim@celikkapi.com',
            name: 'Üretim Sorumlusu',
            password: hashedPassword,
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
    ]);

    console.log('Customers created.');

    // 3. Materials
    const materials = await Promise.all([
        prisma.material.create({ data: { name: 'DKP Sac 1.2mm', unit: 'm2', currentStock: 5000, minStockLevel: 500, unitPrice: 450, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Kale Kilit Sistemi (Monoblok)', unit: 'adet', currentStock: 1500, minStockLevel: 100, unitPrice: 1200, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Elektrostatik Toz Boya (Antrasit)', unit: 'kg', currentStock: 500, minStockLevel: 50, unitPrice: 250, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Menteşe (Ağır Tip)', unit: 'adet', currentStock: 5000, minStockLevel: 500, unitPrice: 150, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'Kauçuk Fitil', unit: 'metre', currentStock: 10000, minStockLevel: 1000, unitPrice: 15, currency: 'TRY' } }),
        prisma.material.create({ data: { name: 'DKP Sac 2mm', unit: 'm2', currentStock: 2000, minStockLevel: 200, unitPrice: 650, currency: 'TRY' } }),
    ]);

    console.log('Materials created.');

    // 3.1 Material Price History
    const dkpSac = materials[0];
    const kilit = materials[1]; // Kilit is index 1
    const dkpSac2mm = materials[5]; // DKP Sac 2mm is index 5
    const now = new Date();

    // DKP Sac 1.2mm History
    await prisma.materialPriceHistory.createMany({
        data: [
            { materialId: dkpSac.id, price: 380, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 5, 15) },
            { materialId: dkpSac.id, price: 395, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 4, 10) },
            { materialId: dkpSac.id, price: 410, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 3, 5) },
            { materialId: dkpSac.id, price: 425, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 2, 20) },
            { materialId: dkpSac.id, price: 440, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
        ]
    });

    // Kilit History (Stable then jump)
    await prisma.materialPriceHistory.createMany({
        data: [
            { materialId: kilit.id, price: 900, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
            { materialId: kilit.id, price: 950, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 3, 1) },
            { materialId: kilit.id, price: 1100, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
        ]
    });

    // DKP Sac 2mm History
    await prisma.materialPriceHistory.createMany({
        data: [
            { materialId: dkpSac2mm.id, price: 550, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 4, 1) },
            { materialId: dkpSac2mm.id, price: 580, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 3, 15) },
            { materialId: dkpSac2mm.id, price: 620, currency: 'TRY', changedAt: new Date(now.getFullYear(), now.getMonth() - 1, 10) },
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
                    { materialId: materials[1].id, quantity: 1 }, // 1 Kilit
                    { materialId: materials[3].id, quantity: 3 }, // 3 Menteşe
                    { materialId: materials[4].id, quantity: 5 }, // 5m Fitil
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
                    { materialId: materials[0].id, quantity: 2.5 }, // 2.5m2 Sac
                    { materialId: materials[1].id, quantity: 1 },
                    { materialId: materials[3].id, quantity: 4 },
                    { materialId: materials[4].id, quantity: 6 },
                    { materialId: materials[2].id, quantity: 2 }, // 2kg Boya
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
                    { materialId: materials[2].id, quantity: 0.5 }, // Boya
                    { materialId: materials[3].id, quantity: 3 },
                ]
            }
        },
    });
    products.push(p3);

    console.log('Products and Recipes created.');

    // 5. Orders & Production History (For Bottleneck Analysis)
    const stages = ['CUTTING_BENDING', 'WELDING_GRINDING', 'PAINTING_WASHING', 'ASSEMBLY_PACKAGING', 'READY_FOR_SHIPMENT'];

    // Standard durations in hours
    const standardDurations = {
        'CUTTING_BENDING': 4,
        'WELDING_GRINDING': 6,
        'PAINTING_WASHING': 12,
        'ASSEMBLY_PACKAGING': 4,
    };

    console.log('Creating 50 historical orders...');

    for (let i = 0; i < 50; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        // Random date in last 3 months
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const order = await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                customerInfo: JSON.stringify({ address: customer.address, phone: customer.phone }),
                status: 'COMPLETED',
                totalAmount: product.basePrice * quantity,
                createdAt: startDate,
                updatedAt: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
                items: {
                    create: [{
                        productId: product.id,
                        quantity: quantity,
                        unitPrice: product.basePrice,
                        configuration: JSON.stringify({ color: 'Standart' }),
                    }]
                }
            }
        });

        // Create production history
        let currentStageTime = new Date(startDate);
        const historyCreates = [];

        for (const stage of stages) {
            if (stage === 'READY_FOR_SHIPMENT') break;

            let durationHours = standardDurations[stage as keyof typeof standardDurations];

            // Introduce bottleneck in WELDING_GRINDING for 30% of orders
            if (stage === 'WELDING_GRINDING' && Math.random() < 0.3) {
                durationHours = durationHours * 3; // 3x longer
            } else {
                // Add some random variance (+/- 20%)
                durationHours = durationHours * (0.8 + Math.random() * 0.4);
            }

            const enteredAt = new Date(currentStageTime);
            const completedAt = new Date(enteredAt.getTime() + durationHours * 60 * 60 * 1000);

            historyCreates.push({
                stage: stage,
                enteredAt: enteredAt,
                completedAt: completedAt,
                notes: 'Completed'
            });

            currentStageTime = completedAt;
        }

        await prisma.productionTracking.create({
            data: {
                orderId: order.id,
                currentStage: 'COMPLETED',
                startedAt: startDate,
                completedAt: currentStageTime,
                history: {
                    create: historyCreates
                }
            }
        });
    }

    // 6. Active Orders with Bottleneck (To trigger alerts)
    console.log('Creating active orders...');
    for (let i = 0; i < 5; i++) {
        const customer = customers[0];
        const product = products[1];

        const order = await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                status: 'IN_PRODUCTION',
                totalAmount: product.basePrice * 2,
                items: { create: [{ productId: product.id, quantity: 2, unitPrice: product.basePrice }] }
            }
        });

        // Stuck in WELDING_GRINDING for 20 hours (Avg is ~6h)
        const stuckStartTime = new Date(now.getTime() - 20 * 60 * 60 * 1000);

        await prisma.productionTracking.create({
            data: {
                orderId: order.id,
                currentStage: 'WELDING_GRINDING',
                startedAt: stuckStartTime,
                history: {
                    create: [
                        { stage: 'CUTTING_BENDING', enteredAt: new Date(stuckStartTime.getTime() - 5 * 3600000), completedAt: stuckStartTime },
                        { stage: 'WELDING_GRINDING', enteredAt: stuckStartTime } // No completedAt
                    ]
                }
            }
        });
    }

    // 7. Pending Orders (For Stock Forecast)
    console.log('Creating pending orders...');
    // Create enough pending orders to drain the stock of 'Menteşe' (Stock: 5000)
    // Product 1 uses 3 hinges. Product 2 uses 4 hinges.
    // Let's order 2000 doors total.

    for (let i = 0; i < 10; i++) {
        const customer = customers[1];
        const product = products[0]; // Uses 3 hinges
        const quantity = 200; // 200 * 3 = 600 hinges per order. 10 orders = 6000 hinges. > 5000 stock.

        await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                status: 'PENDING',
                totalAmount: product.basePrice * quantity,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: quantity,
                        unitPrice: product.basePrice,
                    }]
                }
            }
        });
    }

    // 5.4 Shipments
    // Create shipments for 20 of the completed orders
    // We need to fetch some completed orders first
    console.log('Creating shipments for some completed orders...');
    const completedOrders = await prisma.order.findMany({
        where: { status: 'COMPLETED' },
        take: 20
    });

    for (const order of completedOrders) {
        // Update status to SHIPPED
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'SHIPPED' }
        });

        await prisma.shipment.create({
            data: {
                orderId: order.id,
                waybillNumber: `IRS-${Math.floor(100000 + Math.random() * 900000)}`,
                carrierInfo: Math.random() > 0.5 ? 'Aras Kargo' : 'Yurtiçi Kargo',
                shippedAt: new Date(order.updatedAt.getTime() + 24 * 60 * 60 * 1000), // 1 day after completion
            }
        });
    }

    // 5.5 Cancelled Orders
    console.log('Creating cancelled orders...');
    for (let i = 0; i < 5; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];

        await prisma.order.create({
            data: {
                customerId: customer.id,
                customerName: customer.name,
                status: 'CANCELLED',
                totalAmount: product.basePrice,
                createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 1,
                        unitPrice: product.basePrice,
                    }]
                }
            }
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
