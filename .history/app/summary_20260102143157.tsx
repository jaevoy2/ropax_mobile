import { SaveBooking } from '@/api/saveBooking';
import { useCargo } from '@/context/cargoProps';
import { usePassengers } from '@/context/passenger';
import { TripContextProps, useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function PaymentSummary() {
    const { passengers } = usePassengers();
    const { id, totalFare, fareChange, webCode, destination, origin, departure_time, vessel, setRefNumber, setFareChange, setCashTendered } = useTrip();
    const { paxCargoProperty, totalAndNote } = useCargo();
    const [loading, setLoading] = useState(false);
    const [cashTendered, setPassCashTendered] = useState(0);
    const [timeWithRoute, setTimeWithRoute] = useState('');

    useEffect(() => {
        const departureTime = new Date(`1970-01-01T${departure_time}`).toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });

        setTimeWithRoute(`${origin} --- ${destination} | ${departureTime}`)
    }, []);

    // useEffect(() => {
    //     if(cashTendered != 0) {
    //         if(!paxCargoProperty.cargoAmount) {
    //             const change = cashTendered - totalFare;
    //             setFareChange(change);
    //         }else{
    //             const change = cashTendered - Number(paxCargoProperty.cargoAmount);
    //             setFareChange(change);
    //         }
    //     }
    // }, [cashTendered]);

    const handleConfirmation = async () => {
        setLoading(true);

        if(cashTendered == 0 && !passengers.some(p => p.passType == 'Passes')) {
            setLoading(false);
            Alert.alert('Invalid', 'Payment is missing.');
            return;
        }

        if((!passengers.some(p => p.passType == 'Passes') && totalFare > cashTendered) || totalAndNote.totalAmount > cashTendered) {
            setLoading(false);
            Alert.alert('Invalid', 'Cash tendered is less than the total amount due.');
            return;
        }
        
        setCashTendered(cashTendered);

        const stationID = await AsyncStorage.getItem('stationID');
        console.log(passengers);

        if(!stationID) {
            setLoading(false);
            Alert.alert('Invalid', 'Station is not set yet.');
            return;
        }

        try {
            const trip = { id, totalFare, fareChange, webCode } as TripContextProps;
            const response = await SaveBooking(trip, passengers, Number(stationID));

            if(!response.error) {
                setRefNumber(response.reference_no);
                router.push('/generateTicket');
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setLoading(false);
        }

    }

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Payment Summary</Text>
            </View>
            <View style={{ paddingHorizontal: 10, paddingTop: 20 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingBottom: 10 }}>
                    <Ionicons name={'boat'} color={'#fff'} size={30} style={{ backgroundColor: '#cf2a3a', padding: 5, borderRadius: 50 }} />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: '#747373ff', fontSize: 11 }}>{timeWithRoute}</Text>
                        <Text style={{ color: '#cf2a3a', fontSize: 20, fontWeight: '900', marginTop: -5 }}>{vessel}</Text>
                    </View>
                </View>
                {passengers.length > 0 && (
                    <View style={{ borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, paddingVertical: 15 }}>
                        <View style={{ gap: 5 }}>
                            {passengers.map((p, index) => (
                                <View key={`${p.accommodationID}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 14, width: '40%', fontWeight: '500' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>₱ {p.fare ? `${p.fare}.00` : '0.00'}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ gap: 5 }}>
                            {passengers.map((p, index) => 
                                p.hasInfant && p.infant?.map((i, index) => (
                                    <View key={`${p.accommodationID}-${index}`} style={{ marginBottom: 3 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 14, width: '40%', fontWeight: '500' }}>{`${i.name?.split(',')[1]?.trim().charAt(0)}. ${i.name?.split(',')[0]} (Infant)`}</Text>
                                            <Text style={{ fontSize: 14, width: 60, textAlign: 'right', fontWeight: 'bold' }}>₱ 00.00</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                )}
                {passengers.some(p => p.hasCargo == true) || paxCargoProperty && (
                    <View style={{ borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 14, width: '40%', fontWeight: '500', flexDirection: 'column', alignItems: 'flex-start' }}>Cargo</Text>
                            {paxCargoProperty.map((cargo: any) => (
                                <View key={cargo.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ marginLeft: 15, flexDirection: 'row', gap: 3 }}>
                                        <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{cargo.quantity >  1 ? cargo.quantity : ''}</Text>
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
                <View style={{ borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, paddingVertical: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Subtotal:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a' }}>₱ </Text>
                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a' }}>
                                {passengers.length != 0 ? totalFare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2}) : totalAndNote.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Cash Tendered:</Text>
                        <View style={{ marginTop: -10, flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 9 }}>₱ </Text>
                            <TextInput onChangeText={(text) => setPassCashTendered(Number(text))} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'right' }} />
                        </View>
                    </View>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Change:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#cf2a3a' }}>₱ </Text>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: '#cf2a3a' }}>{cashTendered != 0 ? fareChange : '00.00'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity onPress={() => handleConfirmation()} style={{ position: 'absolute', bottom: 0, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, zIndex: 5 }}>
                {loading == true ? (
                    <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                ) : (
                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Confirm</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}