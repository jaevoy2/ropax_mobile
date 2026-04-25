import { FetchPassengerType } from "@/api/passengerType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type PassesProps = {
    passesTypeID: number;
    setPassesTypeID: React.Dispatch<React.SetStateAction<number>>;
    passesTypeName: string;
    setPassesTypeName: React.Dispatch<React.SetStateAction<string>>;
    passesTypeCode: string;
    setPassesTypeCode: React.Dispatch<React.SetStateAction<string>>;
    passesTypeLoading: boolean; 
}


const PassesTypeContext = createContext<PassesProps | undefined>(undefined);

export function PassesTypeProvider({ children }: { children: ReactNode }) {
    const [passesTypeID, setPassesTypeID] = useState(0);
    const [passesTypeName, setPassesTypeName] = useState('');
    const [passesTypeCode, setPassesTypeCode] = useState('');
    const [passesTypeLoading, setPassesTypeLoading] = useState(true);

    useEffect(() => {
        const passesType = async () => {
            try {
                const response = await FetchPassengerType();

                if(response) {
                    const passergerType = response.types.find((type: any) => type.name == 'Passes' || type.code == 'P');

                    if(passergerType) {
                        await AsyncStorage.multiSet([
                            ['passesId', String(passergerType.id)],
                            ['passesName', passergerType.name],
                            ['passesCode', passergerType?.passenger_types_code ?? ''],
                        ]);

                        const getValues = await AsyncStorage.multiGet(['passesId', 'passesName', 'passesCode'])

                        setPassesTypeID(Number(getValues[0][1]));
                        setPassesTypeName(getValues[1][1]);
                        setPassesTypeCode(getValues[2][1]);
                    }else {
                        console.log('Passes type not found.')
                    }
                }
            }catch(error: any) {
                console.log('Error', error.message);
            }finally {
                setPassesTypeLoading(false)
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
        setPassesTypeCode,
        passesTypeLoading
    }), [passesTypeID, passesTypeName, passesTypeCode, passesTypeLoading])

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
