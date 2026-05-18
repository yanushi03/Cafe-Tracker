import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { SavedCafe } from "../types/cafe";

interface CafeContextType {
    cafes: SavedCafe[];
    addCafe: (cafe: SavedCafe) => void;
    updateCafe: (cafe: SavedCafe) => void;
    deleteCafe: (id: string) => void;
}

export const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {   
    const [cafes, setCafes] = useState<SavedCafe[]>(() => {
        const store = localStorage.getItem('cafes');
        return store ? JSON.parse(store) : [];
    });

    useEffect(() => {
        localStorage.setItem('cafes', JSON.stringify(cafes));
    }, [cafes]);

    const addCafe = (cafe: SavedCafe) => {
        setCafes(prev => [...prev, cafe]);
    };

    const updateCafe = (updatedCafe: SavedCafe) => {
        setCafes(prev => prev.map(cafe => cafe.fsq_id === updatedCafe.fsq_id ? updatedCafe: cafe));
    };

    const deleteCafe = (deletedId: string) => {
        setCafes(prev => prev.filter(cafe => cafe.fsq_id !== deletedId));
    };    

    return (
        <CafeContext.Provider value={{ cafes, addCafe, updateCafe, deleteCafe }}>
            {children}
        </CafeContext.Provider>
    );
}
