import { useCargo } from '@/context/cargoProps';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');
const { height, width } = Dimensions.get('window');

export default function TicketGenerator() {
    const { vessel ,mobileCode, origin, destination, cashTendered, fareChange, totalFare, note, departure_time, refNumber, clearTrip } = useTrip();
    const { paxCargoProperty } = useCargo();
    const { passengers, clearPassengers } = usePassengers();
    const [tripDate, setTripDate] = useState('');
    const [time, setTime] = useState('');
    const viewRef = useRef<View | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const date = new Date();
        setTripDate(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));

        const timeFormat = () => {
            let [hour, minute, second] = departure_time.split(':').map(Number);
            const suffix = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;

            setTime(`${hour}:${minute.toString().padStart(2, '0')} ${suffix}`);
        }
        
        timeFormat()
    }, []);

    const generateTicket = async () => {
        if(!viewRef.current) {
            Alert.alert('Error', 'View not available for snapshot');
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if(!status) {
                Alert.alert('Permission denied', 'Cannot save image without permission');
                return;
            }

            const snapshotUri: string = await captureRef(viewRef, {
                format: 'png',
                quality: 1
            });

            const cacheUri: string = `${FileSystem.cacheDirectory}.ticket.png`;
            await FileSystem.copyAsync({ from: snapshotUri, to: cacheUri });
            

            // Share (first time shows chooser, then RawBT can be set as default)
            await Sharing.shareAsync(cacheUri, {
            dialogTitle: "Print with RawBT",
            mimeType: "image/png",
            });
        } catch (error) {
            Alert.alert('Error', String(error))
        }
    }

    const clearAll = () => {
        setLoading(true);

        setTimeout(() => {
            clearTrip();
            clearPassengers();
            setLoading(false);

            router.replace('/(tabs)/manual-booking');
        }, 400);
    }

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <Modal visible={loading} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 5, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                </View>
            </Modal>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-Ticket</Text>
            </View>
            <TouchableOpacity onPress={() => clearAll()} style={{ position: 'absolute', top: 50, right: 20, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name='checkmark-done' color={'#fff'} size={20} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
            <View style={{ position: 'relative', height: '80%', top: -70 }}>
                <ScrollView>
                    <View ref={viewRef} style={{ backgroundColor: '#fff', left: '50%', transform: [{ translateX: '-50%' }], width: '85%', borderRadius: 10, padding: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Image source={logo_icon} style={{ width: 38, height: 37 }} />
                                <Image source={logo_text} style={{ width: 105, height: 25 }} />
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Text style={{ color: '#cf2a3a', fontSize: 17, fontWeight: '900' }}>E-TICKET</Text>
                                <Text style={{ fontSize: 9, marginTop: -3, fontWeight: 'bold' }}>This is NOT an official receipt.</Text>
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBlockColor: '#9B9B9B', paddingVertical: 5, gap: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${mobileCode.split('-')[0]}`}</Text>
                                    <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{origin}</Text>
                                </View>
                                <MaterialCommunityIcons name='sail-boat' size={25} color={'#cf2a3a'}  />
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
                                        <Text style={{ fontWeight: '900', fontSize: 12, color: '#cf2a3a' }}>{refNumber}</Text>
                                        {refNumber && (
                                            <QRCode value={refNumber} size={120} backgroundColor='#fff' color='#000' />
                                        )}
                                    </View>
                                
                                    <View style={{ paddingVertical: 5, marginTop: 5 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <Text style={{ fontSize: 14, width: '40%', fontWeight: '700' }}>Name:</Text>
                                            <Text style={{ fontSize: 14, width: 50, fontWeight: '700' }}>Type:</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '700', width: 50, }}>Seat#:</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '700', width: 60, textAlign: 'right' }}>Fare</Text>
                                        </View>
                                        {passengers.some((p) => p.accommodation == 'B Class') && (
                                            <View style={{ marginTop: 5}}>
                                                <Text style={{ fontSize: 14, fontWeight: '900' }}>B-Class</Text>
                                                {passengers.filter((p) => p.accommodation == 'B Class')
                                                .map((p) => (
                                                    <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontSize: 14, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{p.passTypeCode}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{`${p.seatNumber}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 60, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                        {passengers.some((p) => p.accommodation == 'Tourist') && (
                                            <>
                                                <Text style={{ fontSize: 14, fontWeight: '900', marginTop: 5, marginBottom: 5 }}>Tourist</Text>
                                                {passengers.filter((p) => p.accommodation == 'Tourist')
                                                .map((p) => (
                                                    <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontSize: 14, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{p.passTypeCode}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{`${p.seatNumber}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 60, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                    </View>
                                                ))}
                                            </>
                                        )}
                                        {passengers.some((p) => p.accommodation == null) && (
                                            <>
                                                <Text style={{ fontSize: 14, fontWeight: '900', marginTop: 5, marginBottom: 5 }}>Passes</Text>
                                                {passengers.filter((p) => p.passType == 'Passes')
                                                .map((p, index) => (
                                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontSize: 14, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}. ${p.name?.split(',')[0]}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{p.passTypeCode}</Text>
                                                        <Text style={{ fontSize: 14, width: 50 }}>{`${p.seatNumber ?? 'N/A'}`}</Text>
                                                        <Text style={{ fontSize: 14, width: 60, textAlign: 'right' }}>₱ {p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                    </View>
                                                ))}
                                            </>
                                        )}
                                        {passengers.map((p, passIndex) => 
                                            p.hasInfant && p.infant?.map((i, index) => (
                                                <View key={`${passIndex}-${index}`} style={{ marginBottom: 3 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontSize: 12, width: '40%' }}>{`${i.name?.split(',')[1]?.trim().charAt(0)}. ${i.name?.split(',')[0]}`}</Text>
                                                        <Text style={{ fontSize: 12, width: 50 }}>I</Text>
                                                        <Text style={{ fontSize: 12, width: 50 }}>N/A</Text>
                                                        <Text style={{ fontSize: 12, width: 60, textAlign: 'right' }}>₱00.00</Text>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                </View>
                                <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, paddingVertical: 10 }}>
                                    {passengers.some(p => p.hasCargo) && (
                                        <View style={{ width: '100%', flexDirection: 'column' }}>
                                            <Text style={{ fontSize: 14, fontWeight: '900', flexDirection: 'column' }}>Cargo</Text>
                                            {passengers.flatMap(p => p.hasCargo ? 
                                                p.cargo.map(c => (
                                                    <View key={`${c.id}-${c.cargoBrand}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 15, }}>
                                                        <View style={{ flexDirection: 'row', gap: 3 }}>
                                                            {c.quantity > 1 && (
                                                                <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{`${c.quantity}x`}</Text>
                                                            )}
                                                            <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>
                                                                { c.cargoType == 'Rolling Cargo' ? `${c.cargoBrand} ${c.cargoSpecification}` : c.parcelCategory}
                                                            </Text>
                                                            <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{`(${c.cargoType})`}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                                            <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>₱ </Text>
                                                            <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{c.cargoAmount.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2})}</Text>
                                                        </View>
                                                    </View>
                                                )) : []
                                            )}
                                        </View>
                                    )}
                                </View>
                            </>
                        ) : (
                            <View style={{ borderBottomColor: '#9B9B9B', borderBottomWidth: 1, paddingVertical: 10 }}>
                                <View style={{ width: '100%', flexDirection: 'column' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '900', flexDirection: 'column' }}>Cargo</Text>
                                    {paxCargoProperty.map((cargo: any) => (
                                        <View key={`${cargo.id}-${cargo.cargoBrand}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 15, }}>
                                            <View style={{ flexDirection: 'row', gap: 3 }}>
                                                {cargo.quantity > 1 && (
                                                    <Text style={{ fontSize: 12, color: '#4b4b4bff' }}>{`${cargo.quantity}x`}</Text>
                                                )}
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
                                <Text style={{ textAlign: 'center' }}>Handle with care.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
            <TouchableOpacity onPress={() => generateTicket()} style={{ position: 'absolute', bottom: 0, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 12, zIndex: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Print</Text>
            </TouchableOpacity>
        </View>
    )
}