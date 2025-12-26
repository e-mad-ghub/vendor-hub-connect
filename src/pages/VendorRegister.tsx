import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Store, CheckCircle, Clock } from 'lucide-react';

const VendorRegister = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, registerVendor, vendor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ storeName: '', description: '' });

  if (vendor?.status === 'pending') {
    return (
      <Layout>
        <div className="container py-12 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <Clock className="h-16 w-16 mx-auto text-marketplace-pending mb-4" />
            <h1 className="text-2xl font-bold mb-2">Application Pending</h1>
            <p className="text-muted-foreground mb-6">Your vendor application is under review. We'll notify you once it's approved.</p>
            <Link to="/"><Button>Back to Home</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (vendor?.status === 'approved') {
    return (
      <Layout>
        <div className="container py-12 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <CheckCircle className="h-16 w-16 mx-auto text-marketplace-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">You're Already a Vendor!</h1>
            <p className="text-muted-foreground mb-6">Access your dashboard to manage your store.</p>
            <Link to="/vendor/dashboard"><Button>Go to Dashboard</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }
    setIsLoading(true);
    const result = await registerVendor(formData.storeName, formData.description);
    if (result.success) {
      toast.success('Application submitted!');
    } else {
      toast.error(result.error || 'Failed to submit');
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
          <div className="text-center mb-6">
            <Store className="h-12 w-12 mx-auto text-primary mb-3" />
            <h1 className="text-2xl font-bold">Become a Vendor</h1>
            <p className="text-muted-foreground">Start selling on MarketHub today</p>
          </div>

          {!isAuthenticated && (
            <div className="bg-muted/50 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm mb-2">Please sign in first to register as a vendor</p>
              <Link to="/login"><Button size="sm">Sign In</Button></Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input id="storeName" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} placeholder="Your Store Name" required />
            </div>
            <div>
              <Label htmlFor="description">Store Description *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Tell us about your store..." rows={4} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !isAuthenticated}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VendorRegister;
