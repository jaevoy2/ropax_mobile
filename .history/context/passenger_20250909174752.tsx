import React, { createContext, useContext, useState } from "react";


export type PassengerProps = {
    accommodation?: string;
    passType?: string;
    name?: string;
    address?: string;
    age?: number;
    nationality?: string;
    gender?: string;
    seatNumber?: number | string;
    trip?: string;
    refNumber?: number;
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

    return (
        <PassengerContext.Provider value={{ passengers, setPassengers, clearPassengers, updatePassenger }}>
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