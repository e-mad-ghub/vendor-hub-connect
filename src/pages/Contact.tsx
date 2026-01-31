import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Seo } from '@/components/Seo';

const LAST_UPDATED = '31 يناير 2026';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(false);
    // Simulated submit for now
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Layout>
      <Seo title="اتصل بينا" description="تواصل معنا لأي استفسار أو دعم." />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">اتصل بينا</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">تواصل معانا</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span>support@markethub.demo</span></div>
              <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span>+1 (555) 123-4567</span></div>
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span>123 Market Street, Demo City</span></div>
            </div>

            <div className="mt-6 text-sm text-muted-foreground space-y-2">
              <p>
                نجمع فقط بيانات التواصل اللازمة للرد على رسالتك.
              </p>
              <p>
                قد نستخدم ملفات تعريف الارتباط لتحسين الأداء وتجربة الاستخدام.
              </p>
              <p>آخر تحديث: {LAST_UPDATED}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="font-semibold mb-4">ابعتلنا رسالة</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="contact-name">اسمك</Label>
                <Input
                  id="contact-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="محمد أحمد"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-email">الإيميل</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-message">رسالتك</Label>
                <Textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب رسالتك هنا"
                  rows={4}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
              {submitted && (
                <p className="text-sm text-marketplace-success" role="status" aria-live="polite">
                  تم إرسال رسالتك بنجاح.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
