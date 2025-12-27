import { User, Vendor, Product, Category, Order, Review, PayoutRequest, PlatformSettings } from '@/types/marketplace';

export const categories: Category[] = [
  { id: '1', name: 'إلكترونيات', icon: '📱', subcategories: ['موبايلات', 'لابتوب', 'تابلت', 'إكسسوارات'] },
  { id: '2', name: 'أزياء', icon: '👕', subcategories: ['رجالي', 'حريمي', 'أطفال', 'أحذية', 'إكسسوارات'] },
  { id: '3', name: 'البيت والحديقة', icon: '🏠', subcategories: ['أثاث', 'ديكور', 'مطبخ', 'حديقة'] },
  { id: '4', name: 'رياضة', icon: '⚽', subcategories: ['لياقة', 'خارج البيت', 'رياضات جماعية', 'دراجات'] },
  { id: '5', name: 'جمال', icon: '💄', subcategories: ['عناية بالبشرة', 'مكياج', 'عناية بالشعر', 'عطور'] },
  { id: '6', name: 'كتب', icon: '📚', subcategories: ['روايات', 'كتب عامة', 'تعليم', 'قصص مصورة'] },
  { id: '7', name: 'ألعاب', icon: '🧸', subcategories: ['ألعاب', 'تعليمية', 'خارج البيت', 'عرائس'] },
  { id: '8', name: 'أكل وبقالة', icon: '🍎', subcategories: ['طازج', 'سناكس', 'مشروبات', 'أورجانيك'] },
];

export const vendors: Vendor[] = [
  {
    id: 'v1',
    userId: 'u2',
    storeName: 'تك هب إلكترونيات',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop',
    description: 'كل اللي محتاجه من أحدث الإلكترونيات والجهازات في مكان واحد. جودة عالية، خدمة مميزة وشحن سريع.',
    status: 'approved',
    commissionRate: 12,
    totalSales: 125000,
    totalOrders: 856,
    rating: 4.7,
    reviewCount: 324,
    createdAt: '2024-01-15',
  },
  {
    id: 'v2',
    userId: 'u3',
    storeName: 'فاشون فوروارد',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=300&fit=crop',
    description: 'موضة عصرية لكل الناس. من اللبس الكاجوال للمناسبات، هنطلعك بأحلى ستايل.',
    status: 'approved',
    totalSales: 89000,
    totalOrders: 1234,
    rating: 4.5,
    reviewCount: 567,
    createdAt: '2024-02-20',
  },
  {
    id: 'v3',
    userId: 'u4',
    storeName: 'ستايل البيت',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=300&fit=crop',
    description: 'غيّر شكل بيتك مع مجموعة مختارة من الديكور والأثاث. خامات ممتازة وأسعار على قد الإيد.',
    status: 'approved',
    commissionRate: 10,
    totalSales: 67000,
    totalOrders: 445,
    rating: 4.8,
    reviewCount: 189,
    createdAt: '2024-03-10',
  },
];

export const products: Product[] = [
  // TechHub Electronics (v1)
  { id: 'p1', vendorId: 'v1', title: 'Wireless Bluetooth Earbuds Pro', description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.', price: 79.99, originalPrice: 129.99, stock: 150, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'], rating: 4.6, reviewCount: 234, sold: 1250, tags: ['wireless', 'bluetooth', 'audio'], createdAt: '2024-06-01' },
  { id: 'p2', vendorId: 'v1', title: 'Smart Watch Series X', description: 'Advanced smartwatch with health monitoring, GPS, and 5-day battery. Water resistant to 50m.', price: 299.99, originalPrice: 349.99, stock: 75, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], rating: 4.8, reviewCount: 189, sold: 890, tags: ['smartwatch', 'fitness', 'health'], createdAt: '2024-06-05' },
  { id: 'p3', vendorId: 'v1', title: 'Portable Power Bank 20000mAh', description: 'High-capacity portable charger with fast charging support. Charge 3 devices simultaneously.', price: 45.99, stock: 200, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'], rating: 4.4, reviewCount: 156, sold: 2100, tags: ['power bank', 'portable', 'charger'], createdAt: '2024-06-10' },
  { id: 'p4', vendorId: 'v1', title: 'Wireless Keyboard & Mouse Combo', description: 'Ergonomic wireless keyboard and mouse set. Silent keys, long battery life.', price: 59.99, originalPrice: 79.99, stock: 120, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'], rating: 4.5, reviewCount: 98, sold: 650, tags: ['keyboard', 'mouse', 'wireless'], createdAt: '2024-06-15' },
  { id: 'p5', vendorId: 'v1', title: 'USB-C Hub 7-in-1', description: 'Multiport USB-C hub with HDMI, USB 3.0, SD card reader, and PD charging.', price: 39.99, stock: 180, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500'], rating: 4.7, reviewCount: 112, sold: 890, tags: ['usb-c', 'hub', 'adapter'], createdAt: '2024-06-20' },
  { id: 'p6', vendorId: 'v1', title: 'Gaming Mouse RGB', description: 'High-precision gaming mouse with customizable RGB lighting. 16000 DPI sensor.', price: 49.99, originalPrice: 69.99, stock: 95, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'], rating: 4.6, reviewCount: 178, sold: 1100, tags: ['gaming', 'mouse', 'rgb'], createdAt: '2024-06-25' },
  { id: 'p7', vendorId: 'v1', title: 'Webcam HD 1080p', description: 'Full HD webcam with auto-focus, noise-canceling microphone. Perfect for video calls.', price: 69.99, stock: 85, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500'], rating: 4.3, reviewCount: 67, sold: 430, tags: ['webcam', 'video', 'streaming'], createdAt: '2024-07-01' },
  { id: 'p8', vendorId: 'v1', title: 'Bluetooth Speaker Portable', description: 'Waterproof portable speaker with 360° sound. 12-hour playtime.', price: 89.99, originalPrice: 119.99, stock: 110, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'], rating: 4.5, reviewCount: 145, sold: 780, tags: ['speaker', 'bluetooth', 'portable'], createdAt: '2024-07-05' },
  { id: 'p9', vendorId: 'v1', title: 'Laptop Stand Adjustable', description: 'Ergonomic aluminum laptop stand. Adjustable height and angle. Fits 10-17" laptops.', price: 34.99, stock: 160, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'], rating: 4.7, reviewCount: 89, sold: 560, tags: ['laptop', 'stand', 'ergonomic'], createdAt: '2024-07-10' },
  { id: 'p10', vendorId: 'v1', title: 'Wireless Charging Pad', description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design.', price: 29.99, stock: 200, category: 'إلكترونيات', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=500'], rating: 4.4, reviewCount: 134, sold: 1450, tags: ['wireless', 'charging', 'qi'], createdAt: '2024-07-15' },

  // Fashion Forward (v2)
  { id: 'p11', vendorId: 'v2', title: 'Classic Cotton T-Shirt', description: 'Premium 100% cotton t-shirt. Comfortable fit, available in multiple colors.', price: 24.99, stock: 300, category: 'أزياء', subcategory: 'Men', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], rating: 4.5, reviewCount: 256, sold: 3200, tags: ['cotton', 't-shirt', 'casual'], createdAt: '2024-06-01' },
  { id: 'p12', vendorId: 'v2', title: 'Slim Fit Jeans', description: 'Modern slim fit jeans with stretch comfort. Perfect everyday wear.', price: 59.99, originalPrice: 79.99, stock: 150, category: 'أزياء', subcategory: 'Men', images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500'], rating: 4.4, reviewCount: 189, sold: 1890, tags: ['jeans', 'slim fit', 'denim'], createdAt: '2024-06-05' },
  { id: 'p13', vendorId: 'v2', title: 'Floral Summer Dress', description: 'Beautiful floral print dress perfect for summer. Light and breezy fabric.', price: 49.99, stock: 100, category: 'أزياء', subcategory: 'Women', images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'], rating: 4.7, reviewCount: 134, sold: 890, tags: ['dress', 'floral', 'summer'], createdAt: '2024-06-10' },
  { id: 'p14', vendorId: 'v2', title: 'Running Sneakers', description: 'Lightweight running shoes with cushioned sole. Breathable mesh upper.', price: 89.99, originalPrice: 119.99, stock: 120, category: 'أزياء', subcategory: 'Shoes', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], rating: 4.6, reviewCount: 223, sold: 1560, tags: ['sneakers', 'running', 'athletic'], createdAt: '2024-06-15' },
  { id: 'p15', vendorId: 'v2', title: 'Leather Belt Classic', description: 'Genuine leather belt with classic buckle. Timeless accessory for any outfit.', price: 34.99, stock: 200, category: 'أزياء', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], rating: 4.5, reviewCount: 98, sold: 1200, tags: ['belt', 'leather', 'accessory'], createdAt: '2024-06-20' },
  { id: 'p16', vendorId: 'v2', title: 'Winter Parka Jacket', description: 'Warm winter parka with faux fur hood. Water-resistant outer shell.', price: 149.99, originalPrice: 199.99, stock: 60, category: 'أزياء', subcategory: 'Men', images: ['https://images.unsplash.com/photo-1544923246-77307dd628b7?w=500'], rating: 4.8, reviewCount: 67, sold: 340, tags: ['jacket', 'winter', 'parka'], createdAt: '2024-06-25' },
  { id: 'p17', vendorId: 'v2', title: 'Crossbody Bag', description: 'Stylish crossbody bag with multiple compartments. Perfect for everyday use.', price: 44.99, stock: 90, category: 'أزياء', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'], rating: 4.4, reviewCount: 112, sold: 780, tags: ['bag', 'crossbody', 'accessory'], createdAt: '2024-07-01' },
  { id: 'p18', vendorId: 'v2', title: 'Sunglasses Aviator', description: 'Classic aviator sunglasses with UV protection. Metal frame.', price: 29.99, stock: 150, category: 'أزياء', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], rating: 4.3, reviewCount: 89, sold: 1100, tags: ['sunglasses', 'aviator', 'uv'], createdAt: '2024-07-05' },
  { id: 'p19', vendorId: 'v2', title: 'Kids Hoodie Cute', description: 'Soft cotton hoodie for kids with fun prints. Comfortable and warm.', price: 29.99, stock: 180, category: 'أزياء', subcategory: 'Kids', images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'], rating: 4.6, reviewCount: 156, sold: 2300, tags: ['kids', 'hoodie', 'cotton'], createdAt: '2024-07-10' },
  { id: 'p20', vendorId: 'v2', title: 'Silk Scarf Pattern', description: 'Elegant silk scarf with artistic pattern. Versatile accessory.', price: 39.99, stock: 80, category: 'أزياء', subcategory: 'Accessories', images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500'], rating: 4.7, reviewCount: 45, sold: 320, tags: ['scarf', 'silk', 'pattern'], createdAt: '2024-07-15' },

  // HomeStyle Living (v3)
  { id: 'p21', vendorId: 'v3', title: 'Modern Table Lamp', description: 'Minimalist table lamp with warm LED light. Touch dimmer control.', price: 49.99, stock: 80, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'], rating: 4.6, reviewCount: 78, sold: 450, tags: ['lamp', 'led', 'modern'], createdAt: '2024-06-01' },
  { id: 'p22', vendorId: 'v3', title: 'Throw Pillow Set', description: 'Set of 2 decorative throw pillows. Soft velvet cover, multiple colors.', price: 34.99, stock: 120, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500'], rating: 4.5, reviewCount: 134, sold: 890, tags: ['pillow', 'decor', 'velvet'], createdAt: '2024-06-05' },
  { id: 'p23', vendorId: 'v3', title: 'Kitchen Knife Set', description: 'Professional 5-piece knife set with wooden block. Stainless steel blades.', price: 79.99, originalPrice: 99.99, stock: 60, category: 'البيت والحديقة', subcategory: 'Kitchen', images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500'], rating: 4.8, reviewCount: 67, sold: 340, tags: ['knife', 'kitchen', 'stainless'], createdAt: '2024-06-10' },
  { id: 'p24', vendorId: 'v3', title: 'Plant Pot Ceramic', description: 'Handcrafted ceramic plant pot with drainage. Perfect for indoor plants.', price: 24.99, stock: 150, category: 'البيت والحديقة', subcategory: 'Garden', images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'], rating: 4.4, reviewCount: 89, sold: 670, tags: ['plant', 'ceramic', 'pot'], createdAt: '2024-06-15' },
  { id: 'p25', vendorId: 'v3', title: 'Wall Clock Vintage', description: 'Vintage-style wall clock with silent mechanism. 12-inch diameter.', price: 39.99, stock: 70, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500'], rating: 4.5, reviewCount: 56, sold: 280, tags: ['clock', 'vintage', 'wall'], createdAt: '2024-06-20' },
  { id: 'p26', vendorId: 'v3', title: 'Bedding Set Queen', description: 'Luxury bedding set including duvet cover and pillowcases. 100% cotton.', price: 89.99, originalPrice: 129.99, stock: 50, category: 'البيت والحديقة', subcategory: 'Furniture', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'], rating: 4.7, reviewCount: 123, sold: 560, tags: ['bedding', 'cotton', 'queen'], createdAt: '2024-06-25' },
  { id: 'p27', vendorId: 'v3', title: 'Coffee Maker Drip', description: 'Programmable drip coffee maker. 12-cup capacity with thermal carafe.', price: 59.99, stock: 65, category: 'البيت والحديقة', subcategory: 'Kitchen', images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'], rating: 4.6, reviewCount: 98, sold: 430, tags: ['coffee', 'maker', 'kitchen'], createdAt: '2024-07-01' },
  { id: 'p28', vendorId: 'v3', title: 'Bathroom Towel Set', description: 'Premium cotton towel set. Includes 2 bath towels, 2 hand towels.', price: 44.99, stock: 100, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1583845112203-29329902332e?w=500'], rating: 4.5, reviewCount: 76, sold: 520, tags: ['towel', 'bathroom', 'cotton'], createdAt: '2024-07-05' },
  { id: 'p29', vendorId: 'v3', title: 'Storage Basket Woven', description: 'Natural woven storage basket. Perfect for organizing and decor.', price: 19.99, stock: 200, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'], rating: 4.4, reviewCount: 145, sold: 890, tags: ['basket', 'storage', 'woven'], createdAt: '2024-07-10' },
  { id: 'p30', vendorId: 'v3', title: 'Candle Set Scented', description: 'Set of 3 scented candles. Long-lasting fragrance, soy wax.', price: 29.99, stock: 130, category: 'البيت والحديقة', subcategory: 'Decor', images: ['https://images.unsplash.com/photo-1602607753419-3420e7a64532?w=500'], rating: 4.6, reviewCount: 112, sold: 780, tags: ['candle', 'scented', 'soy'], createdAt: '2024-07-15' },
];

export const users: User[] = [
  { id: 'u1', email: 'admin@marketplace.com', name: 'Admin User', role: 'admin', createdAt: '2024-01-01' },
  { id: 'u2', email: 'techhub@vendor.com', name: 'Tech Hub', role: 'vendor', createdAt: '2024-01-15' },
  { id: 'u3', email: 'fashion@vendor.com', name: 'Fashion Forward', role: 'vendor', createdAt: '2024-02-20' },
  { id: 'u4', email: 'homestyle@vendor.com', name: 'HomeStyle', role: 'vendor', createdAt: '2024-03-10' },
  { id: 'u5', email: 'customer@test.com', name: 'John Customer', role: 'customer', createdAt: '2024-04-01' },
];

export const reviews: Review[] = [
  { id: 'r1', productId: 'p1', customerId: 'u5', customerName: 'John C.', rating: 5, comment: 'Amazing sound quality! The noise cancellation is top-notch.', helpful: 24, createdAt: '2024-07-20' },
  { id: 'r2', productId: 'p1', customerId: 'u5', customerName: 'Sarah M.', rating: 4, comment: 'Great earbuds, battery life is excellent. Slightly tight fit though.', helpful: 12, createdAt: '2024-07-18' },
  { id: 'r3', productId: 'p2', customerId: 'u5', customerName: 'Mike R.', rating: 5, comment: 'Best smartwatch I\'ve owned. Love the health features!', helpful: 18, createdAt: '2024-07-15' },
  { id: 'r4', productId: 'p14', customerId: 'u5', customerName: 'Lisa T.', rating: 5, comment: 'Super comfortable for running. Great cushioning!', helpful: 15, createdAt: '2024-07-12' },
  { id: 'r5', productId: 'p21', customerId: 'u5', customerName: 'Emma W.', rating: 4, comment: 'Beautiful lamp, perfect for my bedside table.', helpful: 8, createdAt: '2024-07-10' },
];

export const orders: Order[] = [
  {
    id: 'o1',
    customerId: 'u5',
    items: [
      { productId: 'p1', vendorId: 'v1', quantity: 1, price: 79.99, title: 'Wireless Bluetooth Earbuds Pro', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
      { productId: 'p11', vendorId: 'v2', quantity: 2, price: 24.99, title: 'Classic Cotton T-Shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
    ],
    subtotal: 129.97,
    shipping: 5.99,
    tax: 10.40,
    total: 146.36,
    status: 'delivered',
    shippingAddress: { fullName: 'John Customer', phone: '+1234567890', street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    createdAt: '2024-07-01',
    updatedAt: '2024-07-05',
  },
  {
    id: 'o2',
    customerId: 'u5',
    items: [
      { productId: 'p21', vendorId: 'v3', quantity: 1, price: 49.99, title: 'Modern Table Lamp', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500' },
    ],
    subtotal: 49.99,
    shipping: 5.99,
    tax: 4.00,
    total: 59.98,
    status: 'shipped',
    shippingAddress: { fullName: 'John Customer', phone: '+1234567890', street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    createdAt: '2024-07-10',
    updatedAt: '2024-07-12',
  },
];

export const payoutRequests: PayoutRequest[] = [
  { id: 'pay1', vendorId: 'v1', amount: 5000, status: 'paid', requestedAt: '2024-06-01', processedAt: '2024-06-05' },
  { id: 'pay2', vendorId: 'v2', amount: 3500, status: 'approved', requestedAt: '2024-07-01', processedAt: '2024-07-03' },
  { id: 'pay3', vendorId: 'v3', amount: 2000, status: 'pending', requestedAt: '2024-07-15' },
];

export const platformSettings: PlatformSettings = {
  defaultCommissionRate: 15,
  minPayoutAmount: 50,
  currency: 'USD',
};

export const getVendorById = (id: string): Vendor | undefined => vendors.find(v => v.id === id);
export const getProductById = (id: string): Product | undefined => products.find(p => p.id === id);
export const getProductsByVendor = (vendorId: string): Product[] => products.filter(p => p.vendorId === vendorId);
export const getProductsByCategory = (category: string): Product[] => products.filter(p => p.category === category);
export const getReviewsByProduct = (productId: string): Review[] => reviews.filter(r => r.productId === productId);
export const getOrdersByCustomer = (customerId: string): Order[] => orders.filter(o => o.customerId === customerId);
export const getOrdersByVendor = (vendorId: string): Order[] => orders.filter(o => o.items.some(i => i.vendorId === vendorId));
