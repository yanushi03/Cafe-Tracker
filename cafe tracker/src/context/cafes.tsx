import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { SavedCafe, DiaryEntry } from "../types/cafe";

interface CafeContextType {
    cafes: SavedCafe[];
    addCafe: (cafe: SavedCafe) => void;
    deleteCafe: (id: string) => void;
    diaryEntries: DiaryEntry[];
    addDiaryEntry: (entry: DiaryEntry) => void;
    deleteDiaryEntry: (id: string) => void;
}

export const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {
    const [cafes, setCafes] = useState<SavedCafe[]>(() => {
        const store = localStorage.getItem('cafes');
        return store ? JSON.parse(store) : [];
    });

    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
        const store = localStorage.getItem('diary');
        return store ? JSON.parse(store) : [];
    });

    useEffect(() => {
        localStorage.setItem('cafes', JSON.stringify(cafes));
    }, [cafes]);

    useEffect(() => {
        localStorage.setItem('diary', JSON.stringify(diaryEntries));
    }, [diaryEntries]);

    const addCafe = (cafe: SavedCafe) => {
        setCafes(prev => prev.some(c => c.id === cafe.id) ? prev : [...prev, cafe]);
    };

    const deleteCafe = (id: string) => {
        setCafes(prev => prev.filter(c => c.id !== id));
    };

    const addDiaryEntry = (entry: DiaryEntry) => {
        setDiaryEntries(prev => {
            const exists = prev.some(e => e.id === entry.id);
            return exists ? prev.map(e => e.id === entry.id ? entry : e) : [...prev, entry];
        });
    };

    const deleteDiaryEntry = (id: string) => {
        setDiaryEntries(prev => prev.filter(e => e.id !== id));
    };

    return (
        <CafeContext.Provider value={{ cafes, addCafe, deleteCafe, diaryEntries, addDiaryEntry, deleteDiaryEntry }}>
            {children}
        </CafeContext.Provider>
    );
}
