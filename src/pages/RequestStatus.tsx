import React from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailabilityRequests } from '@/contexts/RequestContext';
import { validatePhone, sanitizePhoneForStorage } from '@/lib/validation';
import { ArrowRight, Phone } from 'lucide-react';
import { Seo } from '@/components/Seo';

const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  quoted: 'تم إرسال سعر',
  accepted: 'مقبول - جاهز للدفع',
  declined: 'مرفوض',
  cancelled: 'ملغي',
  unavailable: 'غير متاح',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  quoted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-muted text-muted-foreground',
  unavailable: 'bg-red-100 text-red-800',
};

const RequestStatus = () => {
  const { requests } = useAvailabilityRequests();
  const [phone, setPhone] = React.useState(() => {
    const stored = localStorage.getItem('vhc_buyer_phone');
    return stored ? sanitizePhoneForStorage(stored) : '';
  });
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [searchedPhone, setSearchedPhone] = React.useState(phone);

  const filtered = React.useMemo(
    () => requests.filter(r => searchedPhone && r.buyerPhone === searchedPhone),
    [requests, searchedPhone]
  );

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 11);
    setPhone(digitsOnly);
    setPhoneError(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePhone(phone);
    if (!validation.valid) {
      setPhoneError(validation.error || 'رقم غير صالح');
      return;
    }
    
    const sanitized = validation.sanitized!;
    setSearchedPhone(sanitized);
    localStorage.setItem('vhc_buyer_phone', sanitized);
  };

  return (
    <Layout>
      <Seo title="تتبع حالة الطلب" description="تابع حالة طلبات عروض السعر باستخدام رقم الهاتف." />
      <div className="container py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">تتبع حالة طلب السعر</h1>
        <p className="text-muted-foreground mb-6">
          اكتب رقم تليفونك اللي استخدمته في طلب التوفر والسعر، وشوف حالة الطلبات الحالية.
        </p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
              className={phoneError ? 'border-destructive' : ''}
              required
            />
            {phoneError && (
              <p className="text-xs text-destructive mt-1" role="alert" aria-live="polite">{phoneError}</p>
            )}
          </div>
          <Button type="submit" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            تتبع
          </Button>
        </form>

        {searchedPhone && filtered.length === 0 && (
          <div className="bg-muted/40 border border-border rounded-xl p-6 text-center text-muted-foreground">
            مافيش طلبات مرتبطة بالرقم ده حتى الآن.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div key={req.id} className="p-4 border border-border rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">طلب #{req.id}</p>
                    <p className="text-xs text-muted-foreground">المنتجات: {req.items.length} • بتاريخ {new Date(req.requestedAt).toLocaleString()}</p>
                  </div>
                  <Badge className={statusColors[req.status] || 'bg-muted text-muted-foreground'}>
                    {statusLabels[req.status] || req.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {req.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-2">
                      <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-muted-foreground text-xs">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {req.quotedTotal && (
                  <p className="text-sm mt-3">السعر المرسل: <span className="font-semibold">ج.م {req.quotedTotal.toFixed(2)}</span></p>
                )}

                {req.sellerNote && (
                  <p className="text-sm text-muted-foreground mt-1">ملاحظة التاجر: {req.sellerNote}</p>
                )}

                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  لو عايز تحديث، كلم التاجر واذكر رقم الطلب.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RequestStatus;
