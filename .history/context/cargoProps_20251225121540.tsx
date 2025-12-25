import React, { createContext, ReactNode, useContext, useState } from "react";

type CargoTypeProps = {
    cargoTypeID: number;
    name: string;
}

type CargoPivotProps = {
    CargoPivotID: number;
    cargoTypeID: number;
    cargoBrandID?: number;
    cargoSpecsID?: number;
    cargoParcelCategory?: number;
    cargoPrice: number;
}

type CargoBrandProps = {
    brandID: number;
    name: string;
}

type CargoSpecsProps = {
    specsID: number;
    cc: string;
}

type CargoParcelProps = {
    parcelID: number;
    name: string;
}

type CargoProps = {
    data: {
        cargo_types: CargoTypeProps[];
        brands: CargoBrandProps[];
        specifications: CargoSpecsProps[];
        parcel_categories: CargoParcelProps[];
        cargos: CargoPivotProps[];
    };
}

type CargoContextType = {
    cargoProperties: CargoProps | null;
    setCargoProperties: React.Dispatch<React.SetStateAction<CargoProps | null>>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider = ({ children }: {children: ReactNode}) => {
    const [cargoProperties, setCargoProperties] = useState<CargoProps | null>(null);

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