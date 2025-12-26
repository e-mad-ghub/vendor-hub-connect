import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const footerLinks = {
    'Customer Service': [
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/about' },
      { label: 'Shipping Info', path: '/about' },
      { label: 'Returns', path: '/refund-policy' },
    ],
    'About Us': [
      { label: 'About MarketHub', path: '/about' },
      { label: 'Careers', path: '/about' },
      { label: 'Press', path: '/about' },
    ],
    'Sell on MarketHub': [
      { label: 'Become a Vendor', path: '/vendor/register' },
      { label: 'Vendor Policy', path: '/vendor-policy' },
      { label: 'Vendor Login', path: '/login' },
    ],
    'Legal': [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Refund Policy', path: '/refund-policy' },
    ],
  };

  return (
    <footer className="bg-marketplace-header text-marketplace-header-foreground mt-auto pb-20 md:pb-0">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-muted mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">
                Market<span className="text-primary">Hub</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Your trusted multi-vendor marketplace
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="Visa" className="h-6 rounded" />
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="Mastercard" className="h-6 rounded" />
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="PayPal" className="h-6 rounded" />
            </div>
            
            <p className="text-xs text-muted-foreground">
              © 2024 MarketHub. All rights reserved. (Demo Prototype)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
