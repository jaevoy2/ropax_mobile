import React, { createContext, useContext, useState } from "react";

export type InfantProps = {
    passType_id: number;
    name: string;
    age: number;
    gender: string;
}

export type CargoProps = {
    cargoFare?: string;
    cargoTypeID: number;
    cargoType: string;
    brandID?: number | null;
    brand?: string;
    parcelCategory?: string;
    parcelCategoryID?: number | null;
    specificationID?: number | null;
    specification?: string;
    plateNo?: string;
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
    infant?: InfantProps[];
    hasInfant?: boolean;
    hasCargo?: boolean;
    cargo?: CargoProps;
}


type PassengerContextType = {
    passengers: PassengerProps[];
    setPassengers: React.Dispatch<React.SetStateAction<PassengerProps[]>>;
    clearPassengers: () => void;
    updatePassenger: <K extends keyof PassengerProps>(
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

    updateCargo: <K extends keyof CargoProps> (
        index: number,
        key: K,
        value: CargoProps[K]
    ) => void;
}

const PassengerContext = createContext<PassengerContextType | undefined>(undefined);

export const PassengerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [passengers, setPassengers] = useState<PassengerProps[]>([]);
    const clearPassengers = () => setPassengers([]);

    const updatePassenger = <K extends keyof PassengerProps>(
        indentifier: number | string | null,
        key: K,
        value: PassengerProps[K]
    ) => setPassengers(prev => 
        prev.map((p, index) => p.seatNumber == indentifier || index == indentifier ? { ...p, [key]: value }: p )
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

    const updateCargo = <K extends keyof CargoProps> (
        indentifier: number,
        key: K,
        value: CargoProps[K]
    ) => setPassengers((prev) => 
        prev.map((p, index) => index == indentifier ? {
            ...p, cargo: {...p.cargo, [key]: value}
        }: p)
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