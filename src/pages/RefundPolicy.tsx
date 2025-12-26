import React from 'react';
import { Layout } from '@/components/Layout';

const RefundPolicy = () => (<Layout><div className="container py-8 max-w-3xl"><h1 className="text-3xl font-bold mb-6">Refund Policy</h1><div className="prose prose-gray max-w-none text-muted-foreground space-y-4"><p>We want you to be completely satisfied with your purchase.</p><h2 className="text-xl font-semibold text-foreground mt-6">30-Day Returns</h2><p>Most items can be returned within 30 days of delivery for a full refund.</p><h2 className="text-xl font-semibold text-foreground mt-6">How to Return</h2><p>Contact the vendor directly or use the order details page to initiate a return.</p><h2 className="text-xl font-semibold text-foreground mt-6">Refund Processing</h2><p>Refunds are processed within 5-7 business days after the item is received.</p></div></div></Layout>);
export default RefundPolicy;
