import React from 'react';
import { Layout } from '@/components/Layout';

const Privacy = () => (<Layout><div className="container py-8 max-w-3xl"><h1 className="text-3xl font-bold mb-6">سياسة الخصوصية</h1><div className="prose prose-gray max-w-none text-muted-foreground space-y-4"><p>خصوصيتك تهمنا. السياسة دي بتوضح إزاي بنجمع بياناتك ونستخدمها ونحميها.</p><h2 className="text-xl font-semibold text-foreground mt-6">البيانات اللي بنجمعها</h2><p>بنجمع البيانات اللي بتدخلها بنفسك زي الاسم والإيميل وعنوان الشحن.</p><h2 className="text-xl font-semibold text-foreground mt-6">استخدام البيانات</h2><p>بنستخدم بياناتك لمعالجة الطلبات، والتواصل معاك، وتحسين خدماتنا.</p><p className="text-sm italic mt-8">ده نموذج تجريبي، والسياسة للعرض بس.</p></div></div></Layout>);
export default Privacy;
