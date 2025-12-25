import React, { createContext, ReactNode, useContext, useState } from "react";

type CargoTypeProps = {
    id?: number;
    name?: string;
}

type CargoPivotProps = {
    id?: number;
    cargoTypeID?: number;
    cargoBrandID?: number;
    cargoSpecsID?: number;
    cargoParcelCategory?: number;
    cargoPrice?: number;
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

export type CargoProperties = {
    data: {
        cargo_types?: CargoTypeProps[] | null;
        brands?: CargoBrandProps[] | null;
        specifications?: CargoSpecsProps[] | null;
        parcel_categories?: CargoParcelProps[] | null;
        cargos?: CargoPivotProps[] | null;
    };
}

type CargoContextType = {
    cargoProperties: CargoProperties | null;
    setCargoProperties: React.Dispatch<React.SetStateAction<CargoProperties | null>>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider = ({ children }: {children: ReactNode}) => {
    const [cargoProperties, setCargoProperties] = useState<CargoProperties | null>(null);

    return (
        <CargoContext.Provider value={{ cargoProperties, setCargoProperties }}>
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