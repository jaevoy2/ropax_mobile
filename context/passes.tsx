import { FetchPassengerType } from "@/api/passengerType";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type PassesProps = {
    passesTypeID: number;
    setPassesTypeID: React.Dispatch<React.SetStateAction<number>>;
    passesTypeName: string;
    setPassesTypeName: React.Dispatch<React.SetStateAction<string>>;
    passesTypeCode: string;
    setPassesTypeCode: React.Dispatch<React.SetStateAction<string>>;
}


const PassesTypeContext = createContext<PassesProps | undefined>(undefined);

export function PassesTypeProvider({ children }: { children: ReactNode }) {
    const [passesTypeID, setPassesTypeID] = useState(0);
    const [passesTypeName, setPassesTypeName] = useState('');
    const [passesTypeCode, setPassesTypeCode] = useState('');

    useEffect(() => {
        const passesType = async () => {
            try {
                const response = await FetchPassengerType();

                if(response) {
                    const passergerType = response.types.find((type: any) => type.name == 'Passes' || type.code == 'P');

                    if(passergerType) {
                        setPassesTypeID(passergerType.id);
                        setPassesTypeName(passergerType.name);
                        setPassesTypeCode(passergerType?.passenger_types_code) ?? '';
                    }else {
                        console.log('Passes type not found.')
                    }
                }
            }catch(error: any) {
                console.log('Error', error.message);
            }
        }

        passesType()
    }, []);


    const contextValue = useMemo(() => ({
        passesTypeID, 
        passesTypeName, 
        passesTypeCode, 
        setPassesTypeID, 
        setPassesTypeName, 
        setPassesTypeCode
    }), [passesTypeID, passesTypeName, passesTypeCode])

    return (
        <PassesTypeContext.Provider value={ contextValue }>
            { children }
        </PassesTypeContext.Provider>
    )

}

export function usePassesType() { 
    const context = useContext(PassesTypeContext);
    if(!context) {
        throw new Error('usePassengers must be used within PassengerProvider');
    }

    return context;

}
