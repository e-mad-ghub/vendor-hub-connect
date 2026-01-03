import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AvailabilityRequest, AvailabilityRequestItem, AvailabilityRequestStatus } from '@/types/marketplace';
import { api } from '@/lib/api';

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
    } catch (e) {
      console.warn('[request:load:error]', e);
      return [];
    }
  });
  const isDev = import.meta.env.DEV;

  const latestRequest = useMemo(() => requests[0] || null, [requests]);

  const logRequest = (event: string, payload: unknown) => {
    if (isDev) {
      console.info(`[request:${event}]`, payload);
    }
  };

  const createRequest = useCallback(async (input: {
    items: AvailabilityRequestItem[];
    cartSignature: string;
    buyerPhone: string;
    customerId?: string;
    vendorId?: string;
    vendorName?: string;
  }) => {
    const payload = {
      vendorId: input.vendorId || 'v1',
      buyerPhone: input.buyerPhone,
      cartSignature: input.cartSignature,
      items: input.items.map(i => ({
        productId: i.productId,
        title: i.title,
        quantity: i.quantity,
        price: i.price || 0,
        image: i.image,
      })),
    };
    const created = await api.createAvailabilityRequest(payload);
    setRequests(prev => [created, ...prev]);
    logRequest('create', created);
    return created;
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
      logRequest('respond', { id, ...response });
    },
    [updateRequest]
  );

  const acceptRequest = useCallback(
    (id: string) => {
      updateRequest(id, req => ({ ...req, status: 'accepted' }));
      logRequest('accept', { id });
    },
    [updateRequest]
  );

  const declineRequest = useCallback(
    (id: string, note?: string) => {
      updateRequest(id, req => ({ ...req, status: 'declined', buyerNote: note }));
      logRequest('decline', { id, note });
    },
    [updateRequest]
  );

  const cancelRequest = useCallback(
    (id: string, note?: string) => {
      updateRequest(id, req => ({ ...req, status: 'cancelled', buyerNote: note }));
      logRequest('cancel', { id, note });
    },
    [updateRequest]
  );

  useEffect(() => {
    if (isDev) {
      console.info('[request:state]', requests);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('[request:save:error]', e);
    }
  }, [isDev, requests]);

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
