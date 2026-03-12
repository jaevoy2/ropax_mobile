import React, { createContext, useContext, useState } from "react";
import { PaxCargoProperties } from "./cargoProps";

export type InfantProps = {
    passType_id?: number;
    name: string;
    age: number;
    gender: string;
}

export type PassengerProps = {
    id: string;
    accommodation?: string;
    accommodationID?: number | null;
    passType?: string;
    passType_id?: number;
    passTypeCode?: string;
    name?: string;
    address?: string;
    age?: number;
    nationality?: string;
    contact?: string;
    gender?: string;
    seatNumber?: number | string | null;
    trip?: string;
    fare?: number;
    refNumber?: number;
    hasInfant?: boolean;
    hasCargo?: boolean;
    infant?: InfantProps[];
    cargo?: PaxCargoProperties[];
    bookingType?: string;
}


type PassengerContextType = {
    passengers: PassengerProps[];
    setPassengers: React.Dispatch<React.SetStateAction<PassengerProps[]>>;
    clearPassengers: () => void;
    updatePassenger: <K extends keyof PassengerProps>(
        id: number | string,
        key: K,
        value: PassengerProps[K]
    ) => void;

    updateInfant: <K extends keyof InfantProps>(
        id: number | string,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => void;

    updateCargo: <K extends keyof PaxCargoProperties> (
        paxId: number | string,
        cargoIndex: number,
        key: K,
        value: PaxCargoProperties[K]
    ) => void;
}

const PassengerContext = createContext<PassengerContextType | undefined>(undefined);

export const PassengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [passengers, setPassengers] = useState<PassengerProps[]>([]);
    const clearPassengers = () => setPassengers([]);

    const updatePassenger = <K extends keyof PassengerProps>(
        id: number | string,
        key: K,
        value: PassengerProps[K]
    ) => setPassengers(prev => 
        prev.map((p) => p.id == id ? { ...p, [key]: value }: p )
    );

    const updateInfant = <K extends keyof InfantProps> (
        id: number | string,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => setPassengers((prev) =>
        prev.map((p, passIndex) => { 
            if (p.id !== id && passIndex !== index || !p.infant) return p;
            return {
                ...p,
                infant: p.infant?.map((inf, i) =>
                    i === index ? { ...inf, [key]: value }: inf
                )
            }
        })
    );

    const updateCargo = <K extends keyof PaxCargoProperties> (
        id: number | string,
        cargoIndex: number,
        key: K,
        value: PaxCargoProperties[K]
    ) => setPassengers((prev) => 
        prev.map((p, index) => {
            if (!p.cargo || id != p.id) return p;
            return {
                ...p,
                cargo: p.cargo.map((c, i) =>
                    i === cargoIndex ? { ...c, [key]: value } : c
                )
            }
        })
    );


    return (
        <PassengerContext.Provider value={{ passengers, setPassengers, clearPassengers, updatePassenger, updateInfant, updateCargo }}>
            { children }
        </PassengerContext.Provider>
    )
}


export const usePassengers = () => {
    const context = useContext(PassengerContext);
    if(!context) {
        throw new Error('usePassengers must be used within PassengerProvider');
    }

    return context;
}