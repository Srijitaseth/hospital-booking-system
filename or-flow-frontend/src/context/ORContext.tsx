import React, { createContext, useState, useContext, ReactNode } from 'react';
import { fetchAllSlots } from '../api/or-flow-api';
import { ORSlot, ORContextType } from '../types';

const initialContext: ORContextType = {
    slots: [],
    loading: false,
    error: null,
    fetchSlots: async () => {},
};

const ORContext = createContext<ORContextType>(initialContext);

export const useORContext = () => useContext(ORContext);

export const ORProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [slots, setSlots] = useState<ORSlot[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllSlots();
            setSlots(response.data);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load slots. Is the Backend running on Port 5001?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ORContext.Provider value={{ slots, loading, error, fetchSlots }}>
            {children}
        </ORContext.Provider>
    );
};