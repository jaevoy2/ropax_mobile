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
    price?: string;
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

type CargoOnlyProperties = {
    name?: string;
    cargoType?: string;
    cargoTypeID?: number;
    cargoBrand?: string;
    cargoBrandID?: number;
    cargoSpecification?: string;
    cargoSpecificationID?: number;
    cargoPlateNo?: string;
    parcelCategory?: string;
    parcelCategoryID?: number;
    cargoAmount?: string;
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
    setCargoProperties: React.Dispatch<React.SetStateAction<CargoProperties | null>>;
    cargoOnlyProperty: CargoOnlyProperties[];
    setCargoOnlyProperty: React.Dispatch<React.SetStateAction<CargoOnlyProperties[]>>
    updateCargoOnlyProperty: <K extends keyof CargoOnlyProperties> (
        indentifier: string | number,
        key: K,
        value: CargoOnlyProperties[K]
    ) => void;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider = ({ children }: {children: ReactNode}) => {
    const [cargoProperties, setCargoProperties] = useState<CargoProperties | null>(null);
    const [cargoOnlyProperty, setCargoOnlyProperty] = useState<CargoOnlyProperties[]>([]);

    const updateCargoOnlyProperty = <K extends keyof CargoOnlyProperties>(
        indentifier: string | number,
        key: K,
        value: CargoOnlyProperties[K]
    ) => {
        setCargoOnlyProperty(prev =>  prev.map((p, index) => index == indentifier || index == indentifier ? { ...p, [key]: value }: p ))
    }
    
    return (
        <CargoContext.Provider value={{ cargoProperties, cargoOnlyProperty, setCargoProperties, setCargoOnlyProperty, updateCargoOnlyProperty }}>
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