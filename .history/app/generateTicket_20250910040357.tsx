import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');
const { height } = Dimensions.get('screen');

export default function TicketGenerator() {
    const { trip, refNumber } = useTrip();
    const { passengers } = usePassengers();
    const [tripDate, setTripDate] = useState('');
    const [year, setYear] = useState('');
    const viewRef = useRef<View | null>(null);

    useEffect(() => {
        const date = new Date();
        setTripDate(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));
        setYear(date.getFullYear().toString().slice(-2));
    });

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
            
            const asset = await MediaLibrary.createAssetAsync(cacheUri);
            await MediaLibrary.createAlbumAsync('Tickets', asset, false);

            await Sharing.shareAsync(cacheUri);
        } catch (error) {
            Alert.alert('Error', String(error))
        }
    }


    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-Ticket</Text>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ backgroundColor: '#fff', position: 'absolute', top: -70, left: '50%', transform: [{ translateX: '-50%' }], width: '85%', borderRadius: 10, padding: 10 }}>
                    <View ref={viewRef} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Image source={logo_icon} style={{ width: 36, height: 35 }} />
                            <Image source={logo_text} style={{ width: 95, height: 23 }} />
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ color: '#cf2a3a', fontSize: 15, fontWeight: '900' }}>E-TICKET</Text>
                            <Text style={{ fontSize: 6, marginTop: -3, fontWeight: 'bold' }}>This is NOT an official receipt.</Text>
                        </View>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderBlockColor: '#9B9B9B', paddingVertical: 5, gap: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                {trip.split(' ')?.[0] == 'HILONGOS' ? (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[0].charAt(0)}${trip.split(' ')[0].charAt(1)}${trip.split(' ')[0].charAt(2)}`}</Text>
                                ) : (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[0].charAt(0)}${trip.split(' ')[0].charAt(1)}${trip.split(' ')[0].charAt(3)}`}</Text>
                                )}
                                <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{trip.split(' ')[0]}</Text>
                            </View>
                            <MaterialCommunityIcons name='sail-boat' size={25} color={'#cf2a3a'}  />
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                {trip.split(' ')?.[4] == 'HILONGOS' ? (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[4].charAt(0)}${trip.split(' ')[4].charAt(1)}${trip.split(' ')[4].charAt(2)}`}</Text>
                                ) : (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[4].charAt(0)}${trip.split(' ')[4].charAt(1)}${trip.split(' ')[4].charAt(3)}`}</Text>
                                )}
                                <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{trip.split(' ')[4]}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12 }}>Trip Date:</Text>
                            <Text style={{ fontSize: 12 }}>{tripDate}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12 }}>Depart Time:</Text>
                            <Text style={{ fontSize: 12 }}>{trip.split(' ')[5]}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: '900' }}>Total:</Text>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#cf2a3a' }}>₱1,000.00</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                        <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-{refNumber.toString().padStart(6, '0')}-{year}{trip.split(" ")[0].charAt(0)}{trip.split(" ")[4].charAt(0)}</Text>
                        <QRCode value={`LMBS-${refNumber.toString().padStart(6, '0')}-${year}${trip.split(" ")[0].charAt(0)}${trip.split(" ")[4].charAt(0)}`} size={120} backgroundColor='#fff' color='#000' />
                    </View>
                    <View style={{ paddingVertical: 5 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>B-Class</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                            <Text style={{ fontSize: 12, width: 100 }}>Name:</Text>
                            <Text style={{ fontSize: 12, width: 50 }}>Type:</Text>
                            <Text style={{ fontSize: 12 }}>Seat#:</Text>
                        </View>
                        {passengers.map((p) => (
                            <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 12, width: 100 }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}, ${p.name?.split(',')[0]}`}</Text>
                                <Text style={{ fontSize: 12, width: 50 }}>{p.passType?.charAt(0)}</Text>
                                <Text style={{ fontSize: 12 }}>{`#${p.seatNumber}`}</Text>
                            </View>
                        ))}
                        {passengers.map((p, index) => p?.hasInfant && (
                            <View key={index}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10 }}>Infant</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, width: 100 }}>Name:</Text>
                                    <Text style={{ fontSize: 12, width: 50 }}>Gender:</Text>
                                    <Text style={{ fontSize: 12 }}>Age:</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 12, width: 100 }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}, ${p.name?.split(',')[0]}`}</Text>
                                    <Text style={{ fontSize: 12, width: 50 }}>{p.infantGender?.charAt(0)}</Text>
                                    <Text style={{ fontSize: 12 }}>{p.infantAge}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={() => generateTicket} style={{ position: 'absolute', bottom: 10, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 10, zIndex: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Print</Text>
            </TouchableOpacity>
        </View>
    )
}