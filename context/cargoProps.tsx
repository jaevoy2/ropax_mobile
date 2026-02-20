import React, { createContext, ReactNode, useContext, useState } from "react";

type CargoTypeProps = {
    id?: number;
    name?: string;
}

type CargoPivotProps = {
    id?: number;
    cargo_type_id?: number;
    cargo_brand_id?: number;
    cargo_specification_id?: number;
    parcel_category_id?: number;
    price?: number;
    specification: string;
    route_id?: number;
}

type CargoBrandProps = {
    id?: number;
    name?: string;
}

type CargoSpecsProps = {
    id?: number;
    cc?: string;
}

type CargoParcelProps = {
    id?: number;
    name?: string;
}


export type PaxCargoProperties = {
    id?: number;
    withPassenger?: boolean;
    passenger_id?: number;
    cargoOptionID?: number;
    cargoType?: string;
    cargoTypeID?: number;
    cargoBrand?: string;
    cargoBrandID?: number;
    cargoSpecification?: string;
    cargoSpecificationID?: number;
    cargoPlateNo?: string;
    parcelCategory?: string;
    parcelCategoryID?: number;
    cargoAmount?: number;
    quantity?: number;
}

export type CargoProperties = {
    data: {
        cargo_types?: CargoTypeProps[];
        brands?: CargoBrandProps[];
        specifications?: CargoSpecsProps[];
        parcel_categories?: CargoParcelProps[];
        cargo_options?: CargoPivotProps[];
    };
}


type CargoContextType = {
    cargoProperties: CargoProperties | null;
    paxCargoProperty: PaxCargoProperties[];
    setCargoProperties: React.Dispatch<React.SetStateAction<CargoProperties | null>>;
    setPaxCargoProperties: React.Dispatch<React.SetStateAction<PaxCargoProperties[]>>

    updatePaxCargoProperty: <K extends keyof PaxCargoProperties> (
        indentifier: number,
        key: K,
        value: PaxCargoProperties[K]
    ) => void;

}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider = ({ children }: {children: ReactNode}) => {
    const [cargoProperties, setCargoProperties] = useState<CargoProperties | null>(null);
    const [paxCargoProperty, setPaxCargoProperties] = useState<PaxCargoProperties[]>([]);

    const updatePaxCargoProperty = <K extends keyof PaxCargoProperties>(
        indentifier: number,
        key: K,
        value: PaxCargoProperties[K]
    ) => {
        setPaxCargoProperties(prev => prev.map(c => 
            c.id == indentifier ? {
                ...c, [key]: value
            }: c
        ));
    }
    
    return (
        <CargoContext.Provider value={{ cargoProperties, paxCargoProperty, setCargoProperties, setPaxCargoProperties, updatePaxCargoProperty }}>
            {children}
        </CargoContext.Provider>
    );
}

export const useCargo = () => {
    const context = useContext(CargoContext);
    if(!context) {
        throw new Error('useCargo must be used within a CargoProvider');
    }

    return context;
}