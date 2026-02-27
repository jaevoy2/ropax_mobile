import { FetchPaxBookingInfo } from '@/api/paxBookingInfo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


const { height, width } = Dimensions.get('screen');

type PaxInfo = {
    id?: number;
    name?: string;
    departureDate?: string;
    departureTime?: string;
    route?: string;
    vessel?: string;
    referenceNumber?: string;
    bookingStatus?: number;
}

const tabs = [
    { id: 1, name: 'Passenger' },
    { id: 2, name: 'Cargo' }
]

export default function BookingInfo() {
    const { bookingId, paxId } = useLocalSearchParams();
    const [ loading, setLoading ] = useState(true);
    const [ paxInfo, setPaxInfo ] = useState<PaxInfo | null>(null);
    const [formTab, setFormTab] = useState('Passenger');

    useEffect(() => {
        handleFetchInfo();
    }, []);

    const handleFetchInfo = async () => {
        try {
            const response = await FetchPaxBookingInfo(Number(bookingId), Number(paxId));

            if(!response.error) {
                const paxData: PaxInfo = ({
                    id: response.data.id,
                    name: `${response.data.first_name} ${response.data.last_name}`,
                    departureDate: new Date(response.data.bookings.find((c: any) => c.created_at).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    departureTime: new Date(`1970-01-01T${response.data.bookings.find((t: any) => 
                        t.trip_schedule)?.trip_schedule.trip.departure_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    route: response.data.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.route.mobile_code,
                    vessel: response.data.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.vessel.name,
                    referenceNumber: response.data.bookings.find((r: any) => r.reference_no).reference_no,
                    bookingStatus: response.data.bookings.find((s: any) => s.status_id)?.status_id,
                });

                setPaxInfo(paxData)
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setTimeout(() => {
                setLoading(false)
            }, 200);
        }
    }



    return (
        <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name={'arrow-back'} size={24} color={'#fff'} />
                    </Pressable>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Booking Detail</Text>
                </View>
            </View>
            {loading == true ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                </View>
            ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, padding: 20 }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={[styles.card, { padding: 10, gap: 12 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Ionicons name={'person'} color={'#fff'} size={22} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50 }} />
                                    <View style={{ width: '60%' }}>
                                        <Text style={{ fontWeight: '600', fontSize: 16 }}>{paxInfo.name}</Text>
                                        <Text style={{ color: '#cf2a3a', fontSize: 10, fontWeight: '900' }}>{paxInfo.referenceNumber}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                    <Text style={{ color: '#646464', fontSize: 10, fontWeight: '700' }}>Status</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, borderColor: paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03', backgroundColor: paxInfo.bookingStatus != null ? '#19b87e3d' : '#fcca032a', borderWidth: 1, padding: 3, borderRadius: 5 }}>
                                        <Text style={{ color: paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03', fontSize: 10 }}>{paxInfo.bookingStatus != null ? 'Paid' : 'Pending'}</Text>
                                        <MaterialCommunityIcons name={paxInfo.bookingStatus != null ? 'check-decagram' : 'clock-time-eight'} size={14} color={paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03'} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.fareContainer}>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ color: '#646464', fontSize: 10 }}>Accommodation</Text>
                                    <Text style={{ fontWeight: '700', fontSize: 16 }}>Tourist</Text>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#646464', fontSize: 10 }}>Total Fare</Text>
                                    <Text style={{ color: '#cf2a3a', fontWeight: '800', fontSize: 16 }}>₱ 800.00</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold' }}>Booking Information</Text>
                            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Booking Type</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>Walk In</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Passenger Type</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>Adult</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Accommodation</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>Tourist</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Seat#</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>P5</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Vessel</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.vessel}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Route</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.route}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Departure Date</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.departureDate}</Text>
                                </View>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Departure Time</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>{paxInfo.departureTime}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#cf2a3b27', borderBottomRightRadius: 6, borderBottomLeftRadius: 6 }}>
                                <Text style={{ color: '#cf2a3a', fontSize: 13, fontWeight: '800' }}>Fare</Text>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#cf2a3a' }}>₱ 800.00</Text>
                            </View>
                        </View>
                        <View>
                            <View style={styles.tabs}>
                                {tabs.map((t: any) => (
                                    <Pressable onPress={() => setFormTab(t.name)} key={t.id} style={{ backgroundColor: formTab == t.name ? '#f1f1f1' : 'transparent', padding: 9, borderRadius: 5  }}>
                                        <Text style={{ color: formTab == t.name ? '#cf2a3a' : '#646464' }}>{t.name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        {formTab == 'Passenger' ? (
                            <View style={[styles.card,  { marginTop: 10 }]}>
                                <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold' }}>Passenger</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name={'person'} color={'#fff'} size={18} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50, marginRight: 10 }} />
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Ronilo Calape</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Adult</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Seat# P32</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Text style={{ color: '#646464', fontSize: 12, }}>Fare</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#cf2a3a' }}>₱ 800.00</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name={'person'} color={'#fff'} size={18} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50, marginRight: 10 }} />
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Boyet Calape</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Adult</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Seat# P32</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Text style={{ color: '#646464', fontSize: 12, }}>Fare</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#cf2a3a' }}>₱ 800.00</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View>
                                
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#cf2a3a',
        height: 100,
        paddingHorizontal: 20,
        paddingTop: 50,
        position: 'relative'
    },
    loadingContainer: {
        height: height - 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderColor: "#dadada",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
    },
    fareContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: '#f1f1f1',
        padding: 8,
        borderRadius: 8
    },
    bookingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10
    },
    tabs: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 8,
        gap: 5,
        borderColor: "#dadada",
        borderWidth: 1,
    },
})