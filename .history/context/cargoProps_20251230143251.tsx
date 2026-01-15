import React, { createContext, ReactNode, SetStateAction, useContext, useState } from "react";

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

type CargoTotalAndNote = {
    totalAmount: number;
    note?: string;
}

export type CargoOnlyProperties = {
    id: number;
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
    cargoAmount?: number;
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
    amountAndNote: CargoTotalAndNote | null;
    cargoProperties: CargoProperties | null;
    cargoOnlyProperty: CargoOnlyProperties[];
    setCargoProperties: React.Dispatch<React.SetStateAction<CargoProperties | null>>;
    setCargoOnlyProperty: React.Dispatch<React.SetStateAction<CargoOnlyProperties[]>>
    setAmountAndNote: React.Dispatch<SetStateAction<CargoTotalAndNote | null>>
    updateCargoOnlyProperty: <K extends keyof CargoOnlyProperties> (
        indentifier: number,
        key: K,
        value: CargoOnlyProperties[K]
    ) => void;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export const CargoProvider = ({ children }: {children: ReactNode}) => {
    const [cargoProperties, setCargoProperties] = useState<CargoProperties | null>(null);
    const [cargoOnlyProperty, setCargoOnlyProperty] = useState<CargoOnlyProperties[]>([]);
    const [amountAndNote, setAmountAndNote] = useState<CargoTotalAndNote | null>(null)

    const updateCargoOnlyProperty = <K extends keyof CargoOnlyProperties>(
        indentifier: number,
        key: K,
        value: CargoOnlyProperties[K]
    ) => {
        setCargoOnlyProperty(prev => prev.map(c => 
            c.id == indentifier ? {
                ...c, [key]: value
            }: c
        ));
    }
    
    return (
        <CargoContext.Provider value={{ amountAndNote, cargoProperties, cargoOnlyProperty, setAmountAndNote, setCargoProperties, setCargoOnlyProperty, updateCargoOnlyProperty }}>
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