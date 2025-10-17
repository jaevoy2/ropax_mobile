import React, { createContext, ReactNode, useContext, useState } from "react";

export type TripContextProps = {
    id: number;
    trip: string;
    origin: string;
    destination: string;
    vessel_id: number;
    totalFare: number;
    fareChange: number;
    cashTendered: number;
    webCode: string;
    code: string;
    refNumber: string;
    setTrip: React.Dispatch<React.SetStateAction<string>>;
    setOrigin: React.Dispatch<React.SetStateAction<string>>;
    setDestination: React.Dispatch<React.SetStateAction<string>>;
    setID: React.Dispatch<React.SetStateAction<number>>;
    setVesselID: React.Dispatch<React.SetStateAction<number>>;
    setTotalFare: React.Dispatch<React.SetStateAction<number>>;
    setFareChange: React.Dispatch<React.SetStateAction<number>>;
    setWebCode: React.Dispatch<React.SetStateAction<string>>;
    setCode: React.Dispatch<React.SetStateAction<string>>;
    setCashTendered: React.Dispatch<React.SetStateAction<number>>;
    setRefNumber: React.Dispatch<React.SetStateAction<string>>;
    clearTrip: () => void;
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

type TripProviderProps = {
    children: ReactNode;
}


export const TripProvider = ({ children }: TripProviderProps) => {
    const [trip, setTrip] = useState<string>('');
    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [refNumber, setRefNumber] = useState<string>('');
    const [webCode, setWebCode] = useState('');
    const [code, setCode] = useState('');
    const [totalFare, setTotalFare] = useState<number>(0);
    const [id, setID] = useState<number>(0);
    const [vessel_id, setVesselID] = useState<number>(0);
    const [fareChange, setFareChange] = useState<number>(0);
    const [cashTendered, setCashTendered] = useState<number>(0);

    const clearTrip = () => {
        setID(0);
        setTrip("");
        setOrigin("");
        setDestination("");
        setVesselID(0);
        setTotalFare(0);
        setFareChange(0);
        setCashTendered(0);
        setWebCode("");
        setCode("");
        setRefNumber("");
    };

    return (
        <TripContext.Provider value={{ id, trip, origin, destination, vessel_id, totalFare, fareChange, code, webCode, cashTendered, refNumber,
                                    setTrip, setID, setOrigin, setDestination, setVesselID, setTotalFare, setFareChange, setCode, setWebCode, setCashTendered, setRefNumber, clearTrip }}>
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


