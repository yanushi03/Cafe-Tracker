import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Cafe } from "../types/cafe";

interface CafeContextType {
    cafes: Cafe[];
    addCafe: (cafe: Cafe) => void;
    updateCafe: (cafe: Cafe) => void;
    deleteCafe: (id: number) => void;
}

export const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {   
    const [cafes, setCafes] = useState<Cafe[]>(() => {
        const store = localStorage.getItem('cafes');
        return store ? JSON.parse(store) : [];
    });

    useEffect(() => {
        localStorage.setItem('cafes', JSON.stringify(cafes));
    }, [cafes]);

    const addCafe = (cafe: Cafe) => {
        setCafes(prev => [...prev, cafe]);
    };

    const updateCafe = (updatedCafe: Cafe) => {
        setCafes(prev => prev.map(cafe => cafe.id === updatedCafe.id ? updatedCafe: cafe));
    };

    const deleteCafe = (deletedId: number) => {
        setCafes(prev => prev.filter(cafe => cafe.id !== deletedId));
    };    

    return (
        <CafeContext.Provider value={{ cafes, addCafe, updateCafe, deleteCafe }}>
            {children}
        </CafeContext.Provider>
    );
}
