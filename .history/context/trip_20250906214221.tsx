import React, { createContext, ReactNode, useContext, useState } from "react";

type TripContextProps = {
    trip: string;
    refNumber: number;
    setTrip: React.Dispatch<React.SetStateAction<string>>;
    setRefNumber: React.Dispatch<React.SetStateAction<number>>
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

type TripProviderProps = {
    children: ReactNode;
}


export const TripProvider = ({ children }: TripProviderProps) => {
    const [trip, setTrip] = useState<string>('');
    const [refNumber, setRefNumber] = useState<number>(0);

    return (
        <TripContext.Provider value={{ trip, refNumber, setTrip, setRefNumber }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if(!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }

    return context;
}


