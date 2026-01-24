import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AvailabilityRequest, AvailabilityRequestItem, AvailabilityRequestStatus } from '@/types/marketplace';
import { sanitizePhoneForStorage } from '@/lib/validation';

interface RequestContextType {
  requests: AvailabilityRequest[];
  latestRequest: AvailabilityRequest | null;
  createRequest: (input: {
    items: AvailabilityRequestItem[];
    cartSignature: string;
    buyerPhone: string;
    customerId?: string;
    vendorId?: string;
    vendorName?: string;
  }) => AvailabilityRequest;
  respondToRequest: (id: string, response: { status: Exclude<AvailabilityRequestStatus, 'pending' | 'accepted' | 'declined' | 'cancelled'>; quotedTotal?: number; sellerNote?: string }) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string, note?: string) => void;
  cancelRequest: (id: string, note?: string) => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);
const STORAGE_KEY = 'vhc_availability_requests';

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<AvailabilityRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as AvailabilityRequest[]) : [];
      return parsed.map(req => ({ buyerPhone: '', ...req }));
    } catch {
      return [];
    }
  });

  const latestRequest = useMemo(() => requests[0] || null, [requests]);

  const createRequest = useCallback((input: {
    items: AvailabilityRequestItem[];
    cartSignature: string;
    buyerPhone: string;
    customerId?: string;
    vendorId?: string;
    vendorName?: string;
  }) => {
    const newRequest: AvailabilityRequest = {
      id: `req-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      cartSignature: input.cartSignature,
      items: input.items,
      buyerPhone: sanitizePhoneForStorage(input.buyerPhone),
      customerId: input.customerId,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
    };
    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  }, []);

  const updateRequest = useCallback((id: string, updater: (req: AvailabilityRequest) => AvailabilityRequest) => {
    setRequests(prev => prev.map(req => (req.id === id ? updater(req) : req)));
  }, []);

  const respondToRequest = useCallback(
    (id: string, response: { status: Exclude<AvailabilityRequestStatus, 'pending' | 'accepted' | 'declined' | 'cancelled'>; quotedTotal?: number; sellerNote?: string }) => {
      updateRequest(id, req => ({
        ...req,
        status: response.status,
        quotedTotal: response.quotedTotal ?? req.quotedTotal,
        sellerNote: response.sellerNote,
        respondedAt: new Date().toISOString(),
      }));
    },
    [updateRequest]
  );

  const acceptRequest = useCallback(
    (id: string) => {
      updateRequest(id, req => ({ ...req, status: 'accepted' }));
    },
    [updateRequest]
  );

  const declineRequest = useCallback(
    (id: string, note?: string) => {
      updateRequest(id, req => ({ ...req, status: 'declined', buyerNote: note }));
    },
    [updateRequest]
  );

  const cancelRequest = useCallback(
    (id: string, note?: string) => {
      updateRequest(id, req => ({ ...req, status: 'cancelled', buyerNote: note }));
    },
    [updateRequest]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // Silent fail for storage issues
    }
  }, [requests]);

  return (
    <RequestContext.Provider
      value={{
        requests,
        latestRequest,
        createRequest,
        respondToRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useAvailabilityRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useAvailabilityRequests must be used within a RequestProvider');
  }
  return context;
};
