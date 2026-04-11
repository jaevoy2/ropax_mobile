import React, { createContext, ReactNode, useContext, useState } from "react";

export type TripContextProps = {
    id: number;
    vessel: string;
    routeID: number | null;
    origin: string;
    destination: string;
    vessel_id: number;
    totalFare: number;
    note?: string;
    departure_time: string;
    fareChange: number | null;
    cashTendered: number;
    webCode: string;
    code: string;
    mobileCode: string;
    refNumber: string;
    isCargoable: number;
    approvedBy?: string;
    hasScanned?: boolean;
    tripAccom?: string;
    bookingId?: number | null;
    setVessel: React.Dispatch<React.SetStateAction<string>>;
    setRouteID: React.Dispatch<React.SetStateAction<number>>;
    setOrigin: React.Dispatch<React.SetStateAction<string>>;
    setDestination: React.Dispatch<React.SetStateAction<string>>;
    setID: React.Dispatch<React.SetStateAction<number>>;
    setVesselID: React.Dispatch<React.SetStateAction<number>>;
    setTotalFare: React.Dispatch<React.SetStateAction<number>>;
    setNote: React.Dispatch<React.SetStateAction<string>>;
    setDepartureTime: React.Dispatch<React.SetStateAction<string>>;
    setFareChange: React.Dispatch<React.SetStateAction<number | null>>;
    setWebCode: React.Dispatch<React.SetStateAction<string>>;
    setCode: React.Dispatch<React.SetStateAction<string>>;
    setMobileCode: React.Dispatch<React.SetStateAction<string>>;
    setCashTendered: React.Dispatch<React.SetStateAction<number>>;
    setRefNumber: React.Dispatch<React.SetStateAction<string>>;
    setIsCargoable: React.Dispatch<React.SetStateAction<number>>;
    setApprovedBy: React.Dispatch<React.SetStateAction<string>>;
    setHasScanned: React.Dispatch<React.SetStateAction<boolean>>;
    setTripAccom: React.Dispatch<React.SetStateAction<string>>;
    setBookingId: React.Dispatch<React.SetStateAction<number | null>>;
    clearTrip: () => void;
}

const TripContext = createContext<TripContextProps | undefined>(undefined);

type TripProviderProps = {
    children: ReactNode;
}


export const TripProvider = ({ children }: TripProviderProps) => {
    const [vessel, setVessel] = useState<string>('');
    const [routeID, setRouteID] = useState<number | null>(null);
    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [refNumber, setRefNumber] = useState<string>('');
    const [webCode, setWebCode] = useState('');
    const [code, setCode] = useState('');
    const [mobileCode, setMobileCode] = useState('');
    const [totalFare, setTotalFare] = useState<number>(0);
    const [id, setID] = useState<number>(0);
    const [vessel_id, setVesselID] = useState<number>(0);
    const [fareChange, setFareChange] = useState<number | null>(null);
    const [cashTendered, setCashTendered] = useState<number>(0);
    const [departure_time, setDepartureTime] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [isCargoable, setIsCargoable] = useState<number>(0);
    const [approvedBy, setApprovedBy] = useState('');
    const [hasScanned, setHasScanned] = useState<boolean>(false);
    const [tripAccom, setTripAccom] = useState('');
    const [bookingId, setBookingId] = useState<number | null>(null)

    const clearTrip = () => {
        setID(0);
        setVessel("");
        setRouteID(null);
        setOrigin("");
        setDestination("");
        setVesselID(0);
        setTotalFare(0);
        setFareChange(null);
        setCashTendered(0);
        setWebCode("");
        setMobileCode("");
        setCode("");
        setRefNumber("");
        setDepartureTime("");
        setVesselID(null)
        setIsCargoable(0);
        setTripAccom('');
        setBookingId(null);
        setHasScanned(false);
        setApprovedBy('');
        setNote('')
    };

    return (
        <TripContext.Provider value={{ id, vessel, routeID, origin, destination, vessel_id, totalFare, note, departure_time, tripAccom, bookingId,
                                        fareChange, code, webCode, mobileCode, cashTendered, refNumber, isCargoable, approvedBy, hasScanned,
                                    setVessel, setID, setRouteID, setOrigin, setDestination, setVesselID, setTotalFare, setNote,setDepartureTime, setHasScanned, setBookingId,
                                    setFareChange, setCode, setWebCode, setMobileCode, setCashTendered, setRefNumber, setIsCargoable, clearTrip, setApprovedBy, setTripAccom }}>
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


