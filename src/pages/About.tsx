import React from 'react';
import { Layout } from '@/components/Layout';

const About = () => (
  <Layout>
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">About MarketHub</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-4">MarketHub is a multi-vendor marketplace prototype designed to demonstrate the core features of a modern e-commerce platform. This is a demo application for stakeholder review purposes.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Our Mission</h2>
        <p className="text-muted-foreground mb-4">To connect buyers with trusted sellers, providing a seamless shopping experience with competitive prices and excellent customer service.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Features</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Multi-vendor marketplace with verified sellers</li>
          <li>Secure checkout and payment processing</li>
          <li>Customer reviews and ratings</li>
          <li>Vendor dashboard for store management</li>
          <li>Admin panel for platform oversight</li>
        </ul>
      </div>
    </div>
  </Layout>
);

export default About;
