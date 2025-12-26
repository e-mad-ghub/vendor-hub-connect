import React from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => (
  <Layout>
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span>support@markethub.demo</span></div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span>+1 (555) 123-4567</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span>123 Market Street, Demo City</span></div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Send us a Message</h3>
          <form className="space-y-4">
            <Input placeholder="Your Name" />
            <Input type="email" placeholder="Your Email" />
            <Textarea placeholder="Your Message" rows={4} />
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  </Layout>
);

export default Contact;
