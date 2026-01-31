import React, { createContext, useContext, useState } from "react";
import { PaxCargoProperties } from "./cargoProps";

export type InfantProps = {
    passType_id?: number;
    name: string;
    age: number;
    gender: string;
}

export type PassengerProps = {
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
}


type PassengerContextType = {
    passengers: PassengerProps[];
    setPassengers: React.Dispatch<React.SetStateAction<PassengerProps[]>>;
    clearPassengers: () => void;
    updatePassenger: <K extends keyof PassengerProps>(
        index: number | string | null,
        seatNumber: number | string | null,
        key: K,
        value: PassengerProps[K]
    ) => void;

    updateInfant: <K extends keyof InfantProps>(
        seatNumber: number | string | null,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => void;

    updateCargo: <K extends keyof PaxCargoProperties> (
        seatNumber: number | string | null,
        paxIndex: number,
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
        index: number | string | null,
        seatNumber: number | string | null,
        key: K,
        value: PassengerProps[K]
    ) => setPassengers(prev => 
        prev.map((p, paxIndex) => p.seatNumber == seatNumber || index == paxIndex ? { ...p, [key]: value }: p )
    );

    const updateInfant = <K extends keyof InfantProps> (
        indentifier: number | string | null,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => setPassengers((prev) =>
        prev.map((p, passIndex) => { 
            if (p.seatNumber !== indentifier && passIndex !== indentifier || !p.infant) return p;
            return {
                ...p,
                infant: p.infant?.map((inf, i) =>
                    i === index ? { ...inf, [key]: value }: inf
                )
            }
        })
    );

    const updateCargo = <K extends keyof PaxCargoProperties> (
        seatNumber: number | string | null,
        paxIndex: number | number,
        cargoIndex: number,
        key: K,
        value: PaxCargoProperties[K]
    ) => setPassengers((prev) => 
        prev.map((p, index) => {
            if (!p.cargo || seatNumber != p.seatNumber || paxIndex != index) return p;
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