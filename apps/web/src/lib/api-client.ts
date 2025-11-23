import axios from 'axios';

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor (for adding auth tokens if needed)
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// TypeScript interfaces
export interface Product {
    id: string;
    name: string;
    basePrice: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
    recipe?: {
        materialId: string;
        quantity: number;
    }[];
}

export interface Material {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
    minStockLevel: number;
    unitPrice: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface Shipment {
    id: string;
    orderId: string;
    waybillNumber: string;
    shippedAt: string;
    carrierInfo?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    id: string;
    customerName: string;
    customerInfo?: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    production?: {
        currentStage: string;
    };
}

// API functions

// Products
export const fetchProducts = async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
};

// Materials (Stock)
export const fetchMaterials = async (): Promise<Material[]> => {
    const response = await apiClient.get('/stock');
    return response.data;
};

export const createMaterial = async (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> => {
    const response = await apiClient.post('/stock', data);
    return response.data;
};

export const updateMaterial = async (id: string, data: Partial<Material>): Promise<Material> => {
    const response = await apiClient.patch(`/stock/${id}`, data);
    return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
    await apiClient.delete(`/stock/${id}`);
};

export interface MaterialPriceHistory {
    id: string;
    materialId: string;
    price: number;
    currency: string;
    changedAt: string;
}

export const fetchMaterialPriceHistory = async (id: string): Promise<MaterialPriceHistory[]> => {
    const response = await apiClient.get(`/stock/${id}/price-history`);
    return response.data;
};

// Shipments
export const fetchShipments = async (): Promise<Shipment[]> => {
    const response = await apiClient.get('/shipment');
    return response.data;
};

export const createShipment = async (data: Omit<Shipment, 'id' | 'shippedAt'>): Promise<Shipment> => {
    const response = await apiClient.post('/shipment', data);
    return response.data;
};

export const updateShipment = async (id: string, data: Partial<Shipment>): Promise<Shipment> => {
    const response = await apiClient.patch(`/shipment/${id}`, data);
    return response.data;
};

export const deleteShipment = async (id: string): Promise<void> => {
    await apiClient.delete(`/shipment/${id}`);
};

// Auth
export const login = async (credentials: { email: string; password: string }): Promise<{ access_token: string }> => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
};

export const createUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
};

// Customers
export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    taxOffice?: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchCustomers = async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data;
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
};

export const fetchCustomerOrders = async (id: string): Promise<Order[]> => {
    const response = await apiClient.get(`/customers/${id}/orders`);
    return response.data;
};

// Orders
export const fetchOrders = async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
};

export const fetchOrder = async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
};

export interface CreateOrderData {
    customerName: string;
    customerInfo?: Record<string, unknown>;
    customerId?: string;
    items?: Array<{
        productId: string;
        quantity: number;
        configuration?: Record<string, unknown>;
    }>;
}

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
};

export const startProduction = async (orderId: string): Promise<any> => {
    const response = await apiClient.post('/production', { orderId });
    return response.data;
};

// Production
export interface ProductionTask {
    id: string;
    orderId: string;
    currentStage: string;
    startedAt: string;
    order: {
        customerName: string;
        items: Array<{
            product: {
                name: string;
            };
            configuration?: any;
        }>
    }
}

export const fetchProduction = async (): Promise<ProductionTask[]> => {
    const response = await apiClient.get('/production');
    return response.data;
};

export const updateProductionStage = async (id: string, stage: string): Promise<void> => {
    await apiClient.patch(`/production/${id}/stage`, { stage });
};

export default apiClient;

// BI
export interface CostAnalysis {
    productId: string;
    productName: string;
    currentTotalCost: number;
    materialCosts: {
        materialName: string;
        quantity: number;
        unitPrice: number;
        totalCost: number;
        priceHistory: {
            price: number;
            changedAt: string;
        }[];
    }[];
}

export interface BottleneckAnalysis {
    stageBenchmarks: {
        stage: string;
        averageDurationHours: number;
        maxDurationHours: number;
        minDurationHours: number;
        sampleSize: number;
    }[];
    activeDelays: {
        orderId: string;
        stage: string;
        elapsedHours: number;
        averageExpected: number;
        delayRisk: string;
    }[];
}

export interface StockForecast {
    pendingOrdersCount: number;
    forecast: {
        materialId: string;
        materialName: string;
        currentStock: number;
        reservedForPending: number;
        projectedStock: number;
        minStockLevel: number;
        status: string;
    }[];
}

export const fetchCostAnalysis = async (productId: string): Promise<CostAnalysis> => {
    const response = await apiClient.get(`/bi/cost-analysis/${productId}`);
    return response.data;
};

export const fetchBottlenecks = async (): Promise<BottleneckAnalysis> => {
    const response = await apiClient.get('/bi/bottlenecks');
    return response.data;
};

export const fetchStockForecast = async (): Promise<StockForecast> => {
    const response = await apiClient.get('/bi/stock-forecast');
    return response.data;
};

