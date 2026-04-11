import PreLoader from '@/components/preloader';
import { useCargo } from '@/context/cargoProps';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Modal, PermissionsAndroid, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');
const { height, width } = Dimensions.get('window');

export default function TicketGenerator() {
    const { vessel, mobileCode, origin, destination, cashTendered, fareChange, totalFare, note, departure_time, refNumber, clearTrip } = useTrip();
    const { paxCargoProperty, setPaxCargoProperties } = useCargo();
    const { passengers, clearPassengers } = usePassengers();
    const [tripDate, setTripDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const bleManagerRef = useRef<BleManager | null>(null)
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // BLE states
    const [bleDevices, setBleDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [bleModalVisible, setBleModalVisible] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [bleLoading, setBleLoading] = useState(false);

    const payingPaxCount = passengers.filter(p => p.passType != 'Infant' || 'Passes');
    const passesCount = passengers.filter(p => p.passType == 'Passes');

    useEffect(() => {
        bleManagerRef.current = new BleManager()
        const date = new Date();
        setTripDate(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));

        const timeFormat = () => {
            if (!departure_time) return;

            let [hour, minute, second] = departure_time.split(':').map(Number);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            setTime(`${hour}:${minute.toString().padStart(2, '0')} ${suffix}`);
        }

        timeFormat();

        return () => {
            bleManagerRef.current?.destroy();
            bleManagerRef.current = null;
        };
    }, []);

    const qrCommand = (text: string) => {
        const storeLen = text.length + 3;
        const pL = storeLen % 256;
        const pH = Math.floor(storeLen / 256);

        return (
            '\x1D(k' + String.fromCharCode(pL, pH, 49, 80, 48) + text + // store data
            '\x1D(k\x03\x00\x31\x45\x30' + // error correction
            '\x1D(k\x03\x00\x31\x43\x08'+ // size
            '\x1D(k\x03\x00\x31\x51\x30'   // print
        );
    };

    // ✅ Request BLE permissions
    const requestBlePermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            return Object.values(granted).every(
                status => status === PermissionsAndroid.RESULTS.GRANTED
            );
        }
        return true;
    };

    // ✅ Scan for BLE devices
    const startScan = async () => {
        const hasPermission = await requestBlePermissions();
        if (!hasPermission) {
            Alert.alert('Permission denied', 'Bluetooth permissions are required to print.');
            return;
        }

        setBleDevices([]);
        setScanning(true);
        setBleModalVisible(true);

        bleManagerRef.current?.startDeviceScan(null, null, (error, device) => {
            if (error) {
                setScanning(false);
                return;
            }

            if (device && device.name) {
                setBleDevices(prev => {
                    const exists = prev.some(d => d.id === device.id);
                    return exists ? prev : [...prev, device];
                });
            }
        });

        // Stop scan after 10 seconds
        scanTimeoutRef.current = setTimeout(() => {
          bleManagerRef.current?.stopDeviceScan();
          setScanning(false);  
        }, 10000);

        return () => {
            clearTimeout(scanTimeoutRef.current!);
            bleManagerRef.current?.destroy();
            bleManagerRef.current = null;
        }
    };

    // ✅ Connect to selected printer
    const connectToDevice = async (device: Device) => {
        try {
            setBleLoading(true);
            bleManagerRef.current?.stopDeviceScan();

            const connected = await bleManagerRef.current?.connectToDevice(device.id);
            await connected.discoverAllServicesAndCharacteristics();

            setConnectedDevice(connected);
            setBleModalVisible(false);
            Alert.alert('Connected', `Connected to ${device.name}`);
        } catch (error: any) {
            Alert.alert('Connection failed', error.message);
        } finally {
            setBleLoading(false);
        }
    };

    // ✅ Build ESC/POS print data from ticket
    const buildPrintData = (): string => {
        const ESC = '\x1B';
        const GS = '\x1D';
        const lines: string[] = [];

        const center = (text: string) => `${ESC}a\x01${text}\n`;
        const left = (text: string) => `${ESC}a\x00${text}\n`;
        const bold = (text: string) => `${ESC}E\x01${text}${ESC}E\x00`;
        const divider = () => '--------------------------------\n';
        const cut = () => `${GS}V\x41\x00`;

        // ✅ Font size controls
        const fontNormal = () => `${GS}!\x00`;      // normal size
        const fontSmall = () => `${ESC}M\x01`;       // smaller font (Font B)
        const fontLarge = () => `${GS}!\x11`;        // double width + height

        // ✅ Start with small font for body text
        lines.push(fontSmall());

        lines.push(center(bold('LEOPARDS TICKETING')));
        lines.push(center('TICKET - NOT AN OFFICIAL RECEIPT'));
        lines.push(divider());
        
        // ✅ Use normal for route codes since they're important
        lines.push(fontNormal());
        lines.push(center(bold(`${mobileCode.split('-')[0]} > ${mobileCode.split('-')[1]}`)));
        
        // ✅ Back to small for details
        lines.push(fontSmall());
        lines.push(center(`${origin} > ${destination}`));
        lines.push(divider());
        lines.push(left(`Vessel: ${vessel}`));
        lines.push(left(`Trip Date: ${tripDate}`));
        lines.push(left(`Depart Time: ${time}`));
        lines.push(divider());

        lines.push(fontNormal());
        lines.push(center(bold(refNumber ?? '')));
        lines.push(fontSmall());

        if (refNumber) {
            lines.push('\x1B\x61\x01');
            lines.push(qrCommand(refNumber));
            lines.push('\n');
        }

        lines.push(divider());

        if (passengers.length > 0) {
            passengers.forEach(p => {
                const name = p.name ? `${p.name.split(',')[1]?.trim().charAt(0)}. ${p.name.split(',')[0]}` : '';
                lines.push(left(`${name} | ${p.passTypeCode} | Seat: ${p.seatNumber || 'N/A'} | P${Number(p.fare).toFixed(2)}`));
            });
            lines.push(divider());
        }

        const cargos = passengers.flatMap(p => p.hasCargo ? p.cargo : []);
        if (cargos.length > 0) {
            lines.push(left(bold('CARGO:')));
            cargos.forEach(c => {
                const desc = c.cargoType == 'Rolling Cargo' ? `${c.cargoBrand} ${c.cargoSpecification}` : c.parcelCategory;
                lines.push(left(`${c.quantity}x ${desc} (${c.cargoType}) - P${Number(c.cargoAmount).toFixed(2)}`));
            });
            lines.push(divider());
        }

        lines.push(left(`Total Amount: P${Number(totalFare).toFixed(2)}`));
        lines.push(left(`Cash Tendered: P${Number(cashTendered).toFixed(2)} ?? '--`));
        lines.push(left(`Change: P${Number(fareChange).toFixed(2)} ?? '--`));
        lines.push(divider());

        if (note) {
            lines.push(center(note));
            lines.push(divider());
        }

        lines.push(center('TERMS AND CONDITIONS'));
        lines.push(left('- Boarding closes 30 mins before departure.'));
        lines.push(left('- Present valid ID with matching name.'));
        lines.push(left('- Service fee is non-refundable.'));
        lines.push(left('- Pre-Departure Refund: 10% charge'));
        lines.push(left('- Post-Departure/No Show: 20% charge'));
        lines.push(left('- REFUND TAKES 7 DAYS'));

        // ✅ Reset to normal before cut
        lines.push(fontNormal());
        lines.push('\n\n\n');
        lines.push(cut());

        return lines.join('');
    };

    // ✅ Send print data to connected BLE printer
    const printViaBluetooth = async () => {
        if (!connectedDevice) {
            Alert.alert('No printer connected', 'Please connect to a Bluetooth printer first.');
            startScan();
            return;
        }

        try {
            setBleLoading(true);

            const services = await connectedDevice.services();
            let printCharacteristic = null;

            // Find writable characteristic
            for (const service of services) {
                const characteristics = await service.characteristics();
                for (const char of characteristics) {
                    if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
                        printCharacteristic = char;
                        break;
                    }
                }
                if (printCharacteristic) break;
            }

            if (!printCharacteristic) {
                Alert.alert('Error', 'No writable characteristic found on this printer.');
                return;
            }

            const printData = buildPrintData();

            // Convert string to base64 chunks (BLE has MTU limit ~20 bytes)
            const chunkSize = 100;
            for (let i = 0; i < printData.length; i += chunkSize) {
                const chunk = printData.slice(i, i + chunkSize);
                const base64Chunk = btoa(unescape(encodeURIComponent(chunk)));

                if (printCharacteristic.isWritableWithResponse) {
                    await printCharacteristic.writeWithResponse(base64Chunk);
                } else {
                    await printCharacteristic.writeWithoutResponse(base64Chunk);
                }
            }

            Alert.alert('Success', 'Ticket printed successfully!');
        } catch (error: any) {
            Alert.alert('Print failed', error.message);
        } finally {
            setBleLoading(false);
        }
    };

    const clearAll = () => {
        setLoading(true);

        setTimeout(() => {
            clearTrip();
            clearPassengers();
            setPaxCargoProperties([]);
            setLoading(false);
            router.replace('/(tabs)/manual-booking');
        }, 400)
    }

    return (
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f1f1f1', position: 'relative', flex: 1, paddingBottom: insets.bottom }}>
            <PreLoader loading={loading || bleLoading} />

            {/* ✅ BLE Device Selection Modal */}
            <Modal transparent animationType="slide" visible={bleModalVisible}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: height * 0.6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Printer</Text>
                            <TouchableOpacity onPress={() => { bleManagerRef.current?.stopDeviceScan(); setBleModalVisible(false); }}>
                                <Ionicons name="close" size={24} color="#cf2a3a" />
                            </TouchableOpacity>
                        </View>
                        {scanning && (
                            <Text style={{ color: '#cf2a3a', textAlign: 'center', marginBottom: 10 }}>Scanning for devices...</Text>
                        )}
                        <ScrollView>
                            {bleDevices.length === 0 && !scanning ? (
                                <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>No devices found. Try scanning again.</Text>
                            ) : (
                                bleDevices.map((device) => (
                                    <TouchableOpacity
                                        key={device?.id}
                                        onPress={() => connectToDevice(device)}
                                        style={{ padding: 15, borderBottomColor: '#dadada', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="print" size={20} color="#cf2a3a" />
                                        <View>
                                            <Text style={{ fontWeight: 'bold' }}>{device.name}</Text>
                                            <Text style={{ fontSize: 12, color: '#999' }}>{device?.id}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            onPress={startScan}
                            style={{ backgroundColor: '#cf2a3a', padding: 12, borderRadius: 8, marginTop: 15 }}>
                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 17 }}>
                                {scanning ? 'Scanning...' : 'Scan Again'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View>
                <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                    <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Ticket</Text>
                </View>
                <TouchableOpacity onPress={() => clearAll()} style={{ position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name='checkmark-done' color={'#fff'} size={20} />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Done</Text>
                </TouchableOpacity>

                <View style={{ position: 'relative', height: '75%', top: -70 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ backgroundColor: '#fff', alignSelf: 'center', width: '90%', borderRadius: 10, padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Image source={logo_icon} style={{ width: 38, height: 37 }} />
                                    <Image source={logo_text} style={{ width: 105, height: 25 }} />
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 17, fontWeight: '900' }}>TICKET</Text>
                                    <Text style={{ fontSize: 8, marginTop: -3, fontWeight: 'bold' }}>This is NOT an official receipt.</Text>
                                </View>
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBlockColor: '#9B9B9B', paddingVertical: 5, gap: 5 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${mobileCode.split('-')[0]}`}</Text>
                                        <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{origin}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: '#cf2a3a' }}>---</Text>
                                        <MaterialCommunityIcons name='sail-boat' size={25} color={'#cf2a3a'}  />
                                    </View>
                                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${mobileCode.split('-')[1]}`}</Text>
                                        <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{destination}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Vessel:</Text>
                                    <Text style={{ fontSize: 13 }}>{vessel}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Trip Date:</Text>
                                    <Text style={{ fontSize: 13 }}>{tripDate}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Depart Time:</Text>
                                    <Text style={{ fontSize: 13 }}>{time}</Text>
                                </View>
                            </View>
                            {passengers.length> 0 ? (
                                <>
                                    <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, }}>
                                        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                                            <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>{refNumber}</Text>
                                            {refNumber && (
                                                <QRCode value={refNumber} size={120} backgroundColor='#fff' color='#000' />
                                            )}
                                        </View>
                                    
                                        <View style={{ paddingVertical: 5 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, borderBottomColor: '#9B9B9B', borderBottomWidth: 1, paddingBottom: 5 }}>
                                                <Text style={{ fontSize: 13, width: '40%', fontWeight: '700' }}>Name:</Text>
                                                <Text style={{ fontSize: 13, width: 50, fontWeight: '700' }}>Type:</Text>
                                                <Text style={{ fontSize: 13, fontWeight: '700', width: 50, }}>Seat#:</Text>
                                                <Text style={{ fontSize: 13, fontWeight: '700', width: 60, textAlign: 'right' }}>Fare</Text>
                                            </View>
                                            {passengers.some((p) => p?.accommodation == 'Business Class' || p?.accommodation == 'B-Class' || p?.accommodation == 'B Class') && (
                                                <View style={{ marginTop: 5}}>
                                                    <Text style={{ fontSize: 14, fontWeight: '900' }}>B-Class</Text>
                                                    {passengers.filter((p) => p?.accommodation == 'Business Class' || p?.accommodation == 'B-Class' || p?.accommodation == 'B Class')
                                                    .map((p) => (
                                                        <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Text style={{ fontSize: 13, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{p.passTypeCode}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{`${p.seatNumber}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 70, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                            {passengers.some((p) => p?.accommodation == 'Tourist') && (
                                                <>
                                                    <Text style={{ fontSize: 14, fontWeight: '900', marginTop: 5, marginBottom: 5 }}>Tourist</Text>
                                                    {passengers.filter((p) => p?.accommodation == 'Tourist')
                                                    .map((p) => (
                                                        <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Text style={{ fontSize: 13, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{p.passTypeCode}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{`${p.seatNumber}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 70, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                        </View>
                                                    ))}
                                                </>
                                            )}
                                            {passengers.some((p) => p?.accommodation == null) && (
                                                <>
                                                    <Text style={{ fontSize: 14, fontWeight: '900', marginTop: 5, marginBottom: 5 }}>Passes</Text>
                                                    {passengers.filter((p) => p.passType == 'Passes')
                                                    .map((p, index) => (
                                                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Text style={{ fontSize: 13, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{p.passTypeCode}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>{`${p.seatNumber ?? 'N/A'}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 70, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                        </View>
                                                    ))}
                                                </>
                                            )}
                                            {passengers.map((p, passIndex) => 
                                                p.hasInfant && p.infant?.map((i, index) => (
                                                    <View key={`${passIndex}-${index}`} style={{ marginBottom: 3 }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Text style={{ fontSize: 13, width: '40%' }}>{`${i.name?.split(',')[1]?.trim().charAt(0)}. ${i.name?.split(',')[0]}`}</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>I</Text>
                                                            <Text style={{ fontSize: 13, width: 50, textAlign: 'center' }}>N/A</Text>
                                                            <Text style={{ fontSize: 13, width: 70, textAlign: 'right' }}>₱ 00.00</Text>
                                                        </View>
                                                    </View>
                                                ))
                                            )}
                                        </View>
                                    </View>
                                    {passengers.some(p => p.hasCargo) && (
                                        <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, paddingVertical: 10 }}>
                                            <View style={{ width: '100%', flexDirection: 'column' }}>
                                                <Text style={{ fontSize: 14, fontWeight: '900', flexDirection: 'column' }}>Cargo</Text>
                                                {passengers.flatMap(p => p.hasCargo ? 
                                                    p.cargo.map(c => (
                                                        <View key={`${c?.id}-${c.cargoBrand}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <View style={{ flexDirection: 'row', gap: 3 }}>
                                                                <Text style={{ fontSize: 13, color: '#4b4b4bff' }}>{`${c.quantity}x`}</Text>
                                                                <Text style={{ fontSize: 13, color: '#4b4b4bff' }}>
                                                                    { c.cargoType == 'Rolling Cargo' ? `${c.cargoBrand} ${c.cargoSpecification}` : c.parcelCategory}
                                                                </Text>
                                                                <Text style={{ fontSize: 13, color: '#4b4b4bff' }}>{`(${c.cargoType})`}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                                                <Text style={{ fontSize: 13 }}>₱ </Text>
                                                                <Text style={{ fontSize: 13 }}>{c.cargoAmount.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                            </View>
                                                        </View>
                                                    )) : []
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, paddingVertical: 10 }}>
                                    <View style={{ width: '100%', flexDirection: 'column' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', flexDirection: 'column' }}>Cargo</Text>
                                        {paxCargoProperty.map((cargo: any) => (
                                            <View key={`${cargo?.id}-${cargo.cargoBrand}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 15, }}>
                                                <View style={{ flexDirection: 'row', gap: 3 }}>
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{`${cargo.quantity}x`}</Text>
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>
                                                        { cargo.cargoType == 'Rolling Cargo' ? `${cargo.cargoBrand} ${cargo.cargoSpecification}` : cargo.parcelCategory}
                                                    </Text>
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{`(${cargo.cargoType})`}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>₱ </Text>
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{cargo.cargoAmount.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            <View style={{ borderBottomColor: note ? '#9B9B9B' : 'transparent', borderBottomWidth: note ? 1 : 0, paddingVertical: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '900' }}>Total Amount:</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#cf2a3a' }}>₱ {totalFare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Cash Tendered:</Text>
                                    <Text style={{ fontSize: 13 }}>₱ {cashTendered.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Change:</Text>
                                    <Text style={{ fontSize: 13 }}>₱ {fareChange.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2 })}</Text>
                                </View>
                            </View>
                            {note &&(
                                <View style={{ paddingVertical: 10, borderColor: '#9B9B9B', borderWidth: 1, marginTop: 5 }}>
                                    <Text style={{ textAlign: 'center' }}>{note}</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>

            <View style={{ width: '90%', alignSelf: 'center', gap: 10, zIndex: 5, top: -18 }}>
                <TouchableOpacity
                    onPress={printViaBluetooth}
                    disabled={bleLoading}
                    style={{ backgroundColor: '#cf2a3a', borderRadius: 8, paddingVertical: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Ionicons name="print" size={20} color="#fff" />
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                            {connectedDevice ? `Print` : 'Connect & Print'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}