import { SaveBooking } from '@/api/saveBooking';
import { SaveCargo } from '@/api/saveCargo';
import { useCargo } from '@/context/cargoProps';
import { usePassengers } from '@/context/passenger';
import { TripContextProps, useTrip } from '@/context/trip';
import { seatRemoval } from '@/utils/channel';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');


export default function PaymentSummary() {
    const { passengers } = usePassengers();
    const { id, totalFare, fareChange, webCode, destination, origin, departure_time, vessel, setRefNumber, setFareChange, setCashTendered } = useTrip();
    const { paxCargoProperty } = useCargo();
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
            if(paxCargoProperty.some((c => c.withPassenger == true))) {
                const change = cashTendered - totalFare;
                setFareChange(change);
            }else{
                const change = cashTendered - Number(totalFare);
                setFareChange(change);
            }
        }
    }, [cashTendered]);

    const handleConfirmation = async () => {
        setLoading(true);

        if(cashTendered == 0 && !passengers.some(p => p.passType == 'Passes')) {
            setLoading(false);
            Alert.alert('Invalid', 'Payment is missing.');
            return;
        }

        if((!passengers.some(p => p.passType == 'Passes') && totalFare > cashTendered)) {
            setLoading(false);
            Alert.alert('Invalid', 'Cash tendered is less than the total amount due.');
            return;
        }
        
        setCashTendered(cashTendered);

        const stationID = await AsyncStorage.getItem('stationID');

        if(!stationID) {
            setLoading(false);
            Alert.alert('Invalid', 'Station is not set yet.');
            return;
        }

        try {
            const trip = { id, totalFare, fareChange, webCode } as TripContextProps;
            if(passengers.length > 0) {
                const response = await SaveBooking(trip, passengers, Number(stationID));
                
                if(!response.error) {
                    setRefNumber(response.reference_no);
                    passengers.forEach(p => {
                        if(p.seatNumber) {
                            seatRemoval(p.seatNumber, id)
                        }
                    })
                }
            }else {
                const res = await SaveCargo(trip, paxCargoProperty)
            }

            router.push('/generateTicket');
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setLoading(false);
        }

    }

    return (
        <View style={{ backgroundColor: '#fafafa', flex: 1 }}>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 40, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => router.back()} >
                    <Ionicons name='arrow-back' size={28} color={'#fff'} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Payment Summary</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ borderColor: "#dadada", borderWidth: 1, padding: 10, borderRadius: 8, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Ionicons name={'boat'} color={'#fff'} size={28} style={{ backgroundColor: '#cf2a3a', padding: 10, borderRadius: 50 }} />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: '#cf2a3a', fontSize: 16, fontWeight: '900', marginTop: -5 }}>{vessel}</Text>
                        <Text style={{ color: '#747373ff', fontSize: 11, fontWeight: '600' }}>{timeWithRoute}</Text>
                    </View>
                </View>
                <View style={{ borderColor: "#dadada", borderWidth: 1, borderRadius: 8, marginTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 3, backgroundColor: '#cf2a3b27', borderTopRightRadius: 6, borderTopLeftRadius: 6, padding: 10  }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', color: '#cf2a3a' }}>Payment</Text>
                            <Text style={{ fontSize: 9, fontWeight: '600', color: '#cf2a3a' }}>Payment must be settled before departure.</Text>
                        </View>
                        <Ionicons name={'alert-circle'} color={'#cf2a3a'} size={24} />
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 15, gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#646464', fontSize: 13, }}>Cash Tendered</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderBottomColor: "#cf2a3a", borderBottomWidth: 1 }}>
                                <Text style={{ fontSize: 20, fontWeight: '600' }}>₱</Text>
                                <TextInput onChangeText={(text) => setPassCashTendered(Number(text))} keyboardType={'numeric'} placeholder='0.00' style={{ width: 100, fontSize: 20, height: 45, fontWeight: 'bold', backgroundColor: '#fafafa', textAlign: 'right', paddingHorizontal: 3, borderColor: '#fafafa' }} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#cf2a3a', fontSize: 16, fontWeight: '700' }}>Change</Text>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: '#cf2a3a' }}>₱ {cashTendered != 0 ? fareChange?.toFixed(2) : '00.00'}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1, paddingBottom: 10 }}>
                <View style={{ height: height * 0.4 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ paddingHorizontal: 10 }}>
                            <View style={{ borderColor: "#dadada", borderWidth: 1, borderRadius: 8 }}>
                                {passengers.length > 0 ? (
                                    <>
                                        <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold' }}>Passenger/s</Text>
                                        {passengers.map((pax: any) =>(
                                            <View key={pax.id}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10 }}>
                                                    <View style={{ flexDirection: 'column', width: '65%' }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#cf2a3a' }}>{pax.name}</Text>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.seatNumber != 'N/A' ? `Seat# ${pax?.seatNumber}` : '--'}</Text>
                                                            <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                            <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.passType}</Text>
                                                            <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                            <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{pax?.accommodation}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        <Text style={{ color: '#646464', fontSize: 10, }}>Fare</Text>
                                                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#cf2a3a' }}>₱ {Number(pax?.fare ?? 0).toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                                {pax.infant && pax.infant.length > 0 && pax.infant.map((inf: any, index: number) => (
                                                    <View key={`inf-${index}`} style={{ flexDirection: 'row',justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 5 }} >
                                                        <View style={{ flexDirection: 'column', width: '70%' }}>
                                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#cf2a3a' }}>
                                                                {inf.name}
                                                            </Text>

                                                            <View style={{ flexDirection: 'row', gap: 5 }}>
                                                                <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                                    N/A
                                                                </Text>
                                                                <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                                    |
                                                                </Text>
                                                                <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                                    Infant
                                                                </Text>
                                                                <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                                    |
                                                                </Text>
                                                                <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                                    {inf.gender}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                            <Text style={{ color: '#646464', fontSize: 10, }}>Fare</Text>
                                                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#cf2a3a' }}>₱ 0.00</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                    
                                            </View>
                                        ))}
                                        {passengers.some(p => p.hasCargo == true) && (
                                            <>
                                                <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1,borderTopColor: '#dadada', borderTopWidth: 1, fontWeight: 'bold', marginTop: 5 }}>
                                                    Cargo/s
                                                </Text>
                                               {passengers.map((p, pIndex) =>
                                                    p.hasCargo && p.cargo?.map((cargo, index) => (
                                                        <View
                                                        key={`${pIndex}-${index}`}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            paddingHorizontal: 10,
                                                            paddingTop: 10
                                                        }}
                                                        >
                                                        <View style={{ flexDirection: 'column', width: '65%' }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#cf2a3a' }}>
                                                                {`${cargo.quantity}x`}
                                                            </Text>

                                                            <Text style={{ fontSize: 14, color: '#cf2a3a', fontWeight: '700' }}>
                                                                {cargo.cargoType === 'Rolling Cargo'
                                                                ? `${cargo.cargoBrand} ${cargo.cargoSpecification}`
                                                                : cargo.parcelCategory}
                                                            </Text>
                                                            </View>

                                                            <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>
                                                            {`(${cargo.cargoType})`}
                                                            </Text>
                                                        </View>

                                                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#cf2a3a' }}>
                                                            ₱ {(Number(cargo.cargoAmount || 0)).toFixed(2)}
                                                        </Text>
                                                        </View>
                                                    ))
                                                )}
                                            </> 
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold', marginTop: 5 }}>
                                            Cargo/s
                                        </Text>
                                        {paxCargoProperty.map((cargo, index) =>(
                                            <View key={cargo.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10 }}>
                                                <View style={{ flexDirection: 'column', width: '65%' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#cf2a3a' }}>{`${cargo.quantity}x`}</Text>
                                                        <Text style={{ fontSize: 14, color: '#cf2a3a', fontWeight: '700' }}>
                                                            { cargo.cargoType == 'Rolling Cargo' ? `${cargo.cargoBrand} ${cargo.cargoSpecification}` : cargo.parcelCategory}
                                                        </Text>
                                                    </View>
                                                    <Text style={{ fontSize: 10, color: '#646464', fontWeight: '600' }}>{`(${cargo.cargoType})`}</Text>
                                                </View>
                                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#cf2a3a' }}>₱ {(Number(cargo.cargoAmount || 0)).toFixed(2)}</Text>
                                            </View>
                                        ))}
                                    </> 
                                )}

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#cf2a3b27', borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 13, fontWeight: '800' }}>Total Amount</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#cf2a3a' }}>₱ {totalFare.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <TouchableOpacity onPress={() => handleConfirmation()} style={{ position: 'absolute', bottom: 30, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 8, paddingVertical: 15, zIndex: 5 }}>
                {loading == true ? (
                    <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                ) : (
                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Confirm</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

