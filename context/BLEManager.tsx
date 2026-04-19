import React, { createContext, useContext, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

const bleManager = new BleManager();

type BleContextType = {
    connectedDevice: Device | null;
    setConnectedDevice: (device: Device | null) => void;
    connectedDeviceId: string | null;
    setConnectedDeviceId: (id: string | null) => void;
    bleManager: BleManager
}

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider = ({ children }: { children: React.ReactNode }) => {
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);

    return (
        <BleContext.Provider value={{ connectedDevice, setConnectedDevice, connectedDeviceId, setConnectedDeviceId, bleManager }}>
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