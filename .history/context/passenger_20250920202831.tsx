import React, { createContext, useContext, useState } from "react";

export type InfantProps = {
    passType_id: number;
    name: string;
    age: number;
    gender: string;
}


export type PassengerProps = {
    accommodation?: string;
    accommodationID?: number;
    passType?: string;
    passType_id: number;
    passTypeCode?: string;
    name?: string;
    address?: string;
    age?: number;
    nationality?: string;
    contact?: string;
    gender?: string;
    seatNumber?: number | string;
    trip?: string;
    fare?: number;
    refNumber?: number;
    infant?: InfantProps[];
    hasInfant?: boolean;
}


type PassengerContextType = {
    passengers: PassengerProps[];
    setPassengers: React.Dispatch<React.SetStateAction<PassengerProps[]>>;
    clearPassengers: () => void;
    updatePassenger: <K extends keyof PassengerProps>(
        seatNumber: number | string,
        key: K,
        value: PassengerProps[K]
    ) => void;

    updateInfant: <K extends keyof InfantProps>(
        seatNumber: number | string,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => void;
}

const PassengerContext = createContext<PassengerContextType | undefined>(undefined);

export const PassengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [passengers, setPassengers] = useState<PassengerProps[]>([]);
    const clearPassengers = () => setPassengers([]);

    const updatePassenger = <K extends keyof PassengerProps>(
        seatNum: number | string,
        key: K,
        value: PassengerProps[K]
    ) => setPassengers(prev => 
        prev.map(p => p.seatNumber == seatNum ? { ...p, [key]: value }: p )
    );

    const updateInfant = <K extends keyof InfantProps> (
        seatNumber: number | string,
        index: number,
        key: K,
        value: InfantProps[K]
    ) => setPassengers((prev) =>
      prev.map((p) => { 
        if (p.seatNumber !== seatNumber || !p.infant) return p;
        return {
            ...p,
            infant: p.infant?.map((inf, i) =>
                i === index ? { ...inf, [key]: value }: inf
            )
        }
      })
    );

    return (
        <PassengerContext.Provider value={{ passengers, setPassengers, clearPassengers, updatePassenger, updateInfant }}>
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