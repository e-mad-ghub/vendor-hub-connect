import React from 'react';
import { Layout } from '@/components/Layout';

const VendorPolicy = () => (<Layout><div className="container py-8 max-w-3xl"><h1 className="text-3xl font-bold mb-6">Vendor Policy</h1><div className="prose prose-gray max-w-none text-muted-foreground space-y-4"><p>Guidelines and requirements for selling on MarketHub.</p><h2 className="text-xl font-semibold text-foreground mt-6">Commission Structure</h2><p>Default commission rate is 15% per sale. Custom rates may be negotiated for high-volume sellers.</p><h2 className="text-xl font-semibold text-foreground mt-6">Payout Schedule</h2><p>Payouts are processed weekly for approved amounts over $50.</p><h2 className="text-xl font-semibold text-foreground mt-6">Product Requirements</h2><p>All products must have accurate descriptions, clear images, and comply with applicable laws.</p></div></div></Layout>);
export default VendorPolicy;
