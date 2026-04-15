import React, { createContext, useContext, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

const bleManager = new BleManager();

type BleContextType = {
    connectedDevice: Device | null;
    setConnectedDevice: (device: Device | null) => void;
    bleManager: BleManager
}

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider = ({ children }: { children: React.ReactNode }) => {
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

    return (
        <BleContext.Provider value={{ connectedDevice, setConnectedDevice, bleManager }}>
            { children }
        </BleContext.Provider>
    )
}

export const useBleManager = () => {
    const context = useContext(BleContext);

    if(!context) {
        throw new Error('useBle must be used within BleProvider');
    }

    return context;
}