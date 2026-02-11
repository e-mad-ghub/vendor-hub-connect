import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const footerLinks = {
    'خدمة العملاء': [
      { label: 'اتصل بينا', path: '/contact' },
      { label: 'الاسترجاع', path: '/refund-policy' },
    ],
    'لوحة الإدارة': [
      { label: 'إدارة طلبات عروض السعر', path: '/admin' },
      { label: 'تسجيل دخول الأدمن', path: '/login' },
    ],
  };

  return (
    <footer className="bg-marketplace-header text-marketplace-header-foreground mt-auto pb-20 md:pb-0">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
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
                سوق <span className="text-primary">الحرفيين</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                متجر واحد بعروض سعر فورية عبر واتساب
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              © 2024 سوق الحرفيين. كل الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
