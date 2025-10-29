import { FetchPassengerType } from "@/api/passengerType";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type PassesProps = {
    passesTypeID: number;
    setPassesTypeID: React.Dispatch<React.SetStateAction<number>>;
    passesTypeName: string;
    setPassesTypeName: React.Dispatch<React.SetStateAction<string>>;
    passesTypeCode: string;
    setPassesTypeCode: React.Dispatch<React.SetStateAction<string>>;
}


const PassesTypeContext = createContext<PassesProps | null>(null);

export function PassesTypeProvider({ children }: { children: ReactNode }) {
    const [passesTypeID, setPassesTypeID] = useState(0);
    const [passesTypeName, setPassesTypeName] = useState('');
    const [passesTypeCode, setPassesTypeCode] = useState('');

    useEffect(() => {
        const passesType = async () => {
            try {
                const response = await FetchPassengerType();
    
                if(response) {
                    const passergerType = response.data.find((type: any) => type.name == 'Passes' || type.code == 'P');

                    if(passergerType) {
                        setPassesTypeID(passergerType.id);
                        setPassesTypeName(passergerType.name);
                        setPassesTypeCode(passergerType.passenger_types_code);
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


    return (
        <PassesTypeContext.Provider value={{ passesTypeID, passesTypeName, passesTypeCode, setPassesTypeID, setPassesTypeName, setPassesTypeCode }}>
            { children }
        </PassesTypeContext.Provider>
    )

}

export function usePassesType() {
    const context = useContext(PassesTypeContext);
    if (!context) {
        throw new Error("usePassesType must be used within a PassesTypeProvider");
    }

    return context;
}
