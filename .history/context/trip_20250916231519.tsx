import React, { createContext, ReactNode, useContext, useState } from "react";

type TripContextProps = {
    id: number;
    trip: string;
    setTrip: React.Dispatch<React.SetStateAction<string>>;
    setID: React.Dispatch<React.SetStateAction<number>>
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

type TripProviderProps = {
    children: ReactNode;
}


export const TripProvider = ({ children }: TripProviderProps) => {
    const [trip, setTrip] = useState<string>('');
    let [id, setID] = useState<number>(0);

    return (
        <TripContext.Provider value={{ id, trip, setTrip, setID }}>
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


