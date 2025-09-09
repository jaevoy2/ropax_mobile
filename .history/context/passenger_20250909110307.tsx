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
    withInfant?: boolean;
}

type PassengerContextType = {
    passengers: PassengerProps[];
    setPassengers: React.Dispatch<React.SetStateAction<PassengerProps[]>>;
    clearPassengers: () => void;
}

const PassengerContext = createContext<PassengerContextType | undefined>(undefined);

export const PassengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [passengers, setPassengers] = useState<PassengerProps[]>([]);

    const clearPassengers = () => setPassengers([]);

    return (
        <PassengerContext.Provider value={{ passengers, setPassengers, clearPassengers }}>
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