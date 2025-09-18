import React, { createContext, ReactNode, useContext, useState } from "react";

type TripContextProps = {
    id: number;
    trip: string;
    origin: string;
    destination: string;
    vessel_id: number;
    totalFare: number;
    fareChange: number;
    cashTendered: number;
    code: string;
    setTrip: React.Dispatch<React.SetStateAction<string>>;
    setOrigin: React.Dispatch<React.SetStateAction<string>>;
    setDestination: React.Dispatch<React.SetStateAction<string>>;
    setID: React.Dispatch<React.SetStateAction<number>>;
    setVesselID: React.Dispatch<React.SetStateAction<number>>;
    setTotalFare: React.Dispatch<React.SetStateAction<number>>;
    setFareChange: React.Dispatch<React.SetStateAction<number>>;
    setCode: React.Dispatch<React.SetStateAction<string>>;
    setCashTendered: React.Dispatch<React.SetStateAction<number>>;
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

type TripProviderProps = {
    children: ReactNode;
}


export const TripProvider = ({ children }: TripProviderProps) => {
    const [trip, setTrip] = useState<string>('');
    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [code, setCode] = useState('');
    const [totalFare, setTotalFare] = useState<number>(0);
    const [id, setID] = useState<number>(0);
    const [vessel_id, setVesselID] = useState<number>(0);
    const [fareChange, setFareChange] = useState<number>(0);
    const [cashTendered, setCashTendered] = useState<number>(0);

    return (
        <TripContext.Provider value={{ id, trip, origin, destination, vessel_id, totalFare, fareChange, code, cashTendered, setTrip, setID, setOrigin, setDestination, setVesselID, setTotalFare, setFareChange, setCode, setCashTendered }}>
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


