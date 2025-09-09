import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Image, Text, View } from 'react-native';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');

export default function TicketGenerator() {
    const { trip } = useTrip();
    const { passengers } = usePassengers();


    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-Ticket</Text>
            </View>
            <View style={{ position: 'relative' }}>
                <View style={{ backgroundColor: '#fff', position: 'absolute', top: -70, left: '50%', transform: [{ translateX: '-50%' }], width: '85%', height: 400, borderRadius: 10, padding: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBlockColor: '#9B9B9B' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Image source={logo_icon} style={{ width: 36, height: 35 }} />
                            <Image source={logo_text} style={{ width: 95, height: 23 }} />
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ color: '#cf2a3a', fontSize: 15, fontWeight: '900' }}>E-TICKET</Text>
                            <Text style={{ fontSize: 6, marginTop: -3, fontWeight: 'bold' }}>This is NOT an official receipt.</Text>
                        </View>
                    </View>
                    <View>
                        <View style={{ paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', paddingHorizontal: 10 }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                {trip.split(' ')?.[0] == 'HILONGOS' ? (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[0].charAt(0)}${trip.split(' ')[0].charAt(1)}${trip.split(' ')[0].charAt(2)}`}</Text>
                                ) : (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[0].charAt(0)}${trip.split(' ')[0].charAt(1)}${trip.split(' ')[0].charAt(3)}`}</Text>
                                )}
                                <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{trip.split(' ')[0]}</Text>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                {trip.split(' ')?.[4] == 'HILONGOS' ? (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[4].charAt(0)}${trip.split(' ')[4].charAt(1)}${trip.split(' ')[4].charAt(2)}`}</Text>
                                ) : (
                                    <Text style={{ fontSize: 30, fontWeight: '900', color: '#cf2a3a' }}>{`${trip.split(' ')[4].charAt(0)}${trip.split(' ')[4].charAt(1)}${trip.split(' ')[4].charAt(3)}`}</Text>
                                )}
                                <Text style={{ fontSize: 10, color: '#cf2a3a', marginTop: -5 }}>{trip.split(' ')[4]}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}