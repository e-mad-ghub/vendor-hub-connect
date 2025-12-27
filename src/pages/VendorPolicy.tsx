import React from 'react';
import { Layout } from '@/components/Layout';

const VendorPolicy = () => (<Layout><div className="container py-8 max-w-3xl"><h1 className="text-3xl font-bold mb-6">سياسة البائع</h1><div className="prose prose-gray max-w-none text-muted-foreground space-y-4"><p>إرشادات ومتطلبات البيع على سوق علاء الدين.</p><h2 className="text-xl font-semibold text-foreground mt-6">هيكل العمولة</h2><p>العمولة الافتراضية 15% على كل بيع. ممكن التفاوض على نسب مختلفة للبائعين أصحاب المبيعات الكبيرة.</p><h2 className="text-xl font-semibold text-foreground mt-6">جدول الدفعات</h2><p>الدفعات بتتجهز أسبوعيًا للمبالغ الموافق عليها فوق ٥٠ ج.م.</p><h2 className="text-xl font-semibold text-foreground mt-6">متطلبات المنتجات</h2><p>كل المنتجات لازم يكون ليها وصف دقيق وصور واضحة وتلتزم بالقوانين.</p></div></div></Layout>);
export default VendorPolicy;
