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
    const { cargoOnlyProperty } = useCargo();
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

    useEffect(() => {
        if(cashTendered != 0) {
            const change = cashTendered - totalFare;
            setFareChange(change);
        }
    }, [cashTendered]);

    const handleConfirmation = async () => {
        setLoading(true);

        if(cashTendered == 0 && !passengers.some(p => p.passType == 'Passes')) {
            setLoading(false);
            Alert.alert('Invalid', 'Passenger payment is missing.');
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
                {passengers.some(p => p.hasCargo == true) || cargoOnlyProperty && (
                    <View style={{ borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ width: '80%' }}>
                                <Text style={{ fontSize: 14, width: '40%', fontWeight: '500' }}>Cargo</Text>
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={{ fontSize: 12, width: '40%', color: '#c9c9c9ff' }}>{cargoOnlyProperty.cargoType}</Text>
                                    <Text style={{ fontSize: 12, width: '40%', color: '#c9c9c9ff' }}>{`${cargoOnlyProperty.cargoBrand} ${cargoOnlyProperty.cargoSpecification}` || cargoOnlyProperty.parcelCategory}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>₱ {passengers.find(p => p.hasCargo)?.cargo?.cargoFare || cargoOnlyProperty.cargoAmount}</Text>
                        </View>
                    </View>
                )}
                <View style={{ borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, paddingVertical: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Subtotal:</Text>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a' }}>₱ {totalFare}.00</Text>
                    </View>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomColor: '#c9c9c9ff', borderBottomWidth: 1, }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Cash Tendered:</Text>
                        <View style={{ marginTop: -10, flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 8 }}>₱ </Text>
                            <TextInput onChangeText={(text) => setPassCashTendered(Number(text))} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold', fontSize: 17, textAlign: 'right', borderBottomColor: '#979797ff', borderBottomWidth: 1, borderRadius: 5 }} />
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