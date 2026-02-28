import { FetchPaxBookingInfo } from '@/api/paxBookingInfo';
import { useCargo } from '@/context/cargoProps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';


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
    passengers: {
        id: number;
        name?: string;
        seatNumber: string;
        passenger_type: string;
        accommodation: string
    }
}

const tabs = [
    { id: 1, name: 'Passengers' },
    { id: 2, name: 'Cargo' }
]


export default function BookingInfo() {
    const { cargoProperties, paxCargoProperty } = useCargo();
    const { bookingId, paxId, refNumber } = useLocalSearchParams();
    const [ loading, setLoading ] = useState(true);
    const [ paxInfo, setPaxInfo ] = useState<PaxInfo | null>(null);
    const [formTab, setFormTab] = useState('Passengers');
    const [toggleOption, setToggleOption] = useState(false);
    const [type, setType] = useState('')

    useEffect(() => {
        handleFetchInfo();
    }, []);

    const handleFetchInfo = async () => {
        try {
            const response = await FetchPaxBookingInfo(Number(bookingId), Number(paxId), String(refNumber));

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
                    route: `${response.data.bookings.find((t: any) => t.trip_schedule.trip)?.trip_schedule.trip.route.origin} - ${response.data.bookings.find((t: any) => t.trip_schedule.trip)?.trip_schedule.trip.route.destination}`,
                    vessel: response.data.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.vessel.name,
                    referenceNumber: response.data.bookings.find((r: any) => r.reference_no).reference_no,
                    bookingStatus: response.data.bookings.find((s: any) => s.status_id)?.status_id,
                    passengers: {
                        id: response.data.id,
                        name: `${response.data.first_name} ${response.data.last_name}`,
                        seatNumber: response.data.bookings.find((r: any) => r.pivot).pivot.seat_no,
                        passenger_type: response.data.passenger_type.name,
                        accommodation: response.data.accommodation_type.name
                    }
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
                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                                    <Text style={{ color: '#646464', fontSize: 9, fontWeight: '700' }}>Payment status</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, borderColor: paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03', backgroundColor: paxInfo.bookingStatus != null ? '#19b87e3d' : '#fcca032a', borderWidth: 1, padding: 3, borderRadius: 5 }}>
                                        <Text style={{ color: paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03', fontSize: 10 }}>{paxInfo.bookingStatus != null ? 'Paid' : 'Pending'}</Text>
                                        <MaterialCommunityIcons name={paxInfo.bookingStatus != null ? 'check-decagram' : 'clock-time-eight'} size={14} color={paxInfo.bookingStatus != null ? '#19B87E' : '#FCCA03'} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.fareContainer}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Seat#</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>D32</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, color: '#b6b6b6' }}>|</Text>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Type</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>Adult</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, color: '#b6b6b6' }}>|</Text>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{ color: '#646464', fontSize: 8 }}>Accommodation</Text>
                                        <Text style={{ fontWeight: '700', fontSize: 12 }}>Tourist</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Text style={{ color: '#646464', fontSize: 10 }}>Fare</Text>
                                    <Text style={{ color: '#cf2a3a', fontWeight: '800', fontSize: 16 }}>₱ 800.00</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <Text style={{ fontWeight: 'bold', padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, }}>Booking Information</Text>
                            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                                <View style={styles.bookingContainer}>
                                    <Text style={{ color: '#646464', fontSize: 13, }}>Booking Type</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700' }}>Walk In</Text>
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
                                <Text style={{ color: '#cf2a3a', fontSize: 13, fontWeight: '800' }}>Total Fare</Text>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#cf2a3a' }}>₱ 2,400.00</Text>
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
                        {formTab == 'Passengers' ? (
                            <View style={[styles.card,  { marginTop: 10 }]}>
                                <Text style={{ padding: 10, borderBottomColor: '#dadada', borderBottomWidth: 1, fontWeight: 'bold' }}>Passenger</Text>
                                {}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name={'person'} color={'#fff'} size={18} style={{ padding: 10, backgroundColor: '#cf2a3a', borderRadius: 50, marginRight: 10 }} />
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Ronilo Calape</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Seat# P32</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Adult</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>|</Text>
                                                <Text style={{ fontSize: 10, color: '#646464' }}>Tourist</Text>
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
                            <View style={[styles.card, { marginTop: 10 }]}>
                                <View style={{ position: 'relative', paddingHorizontal: 10, paddingVertical: 8, borderBottomColor: '#dadada', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Cargo</Text>
                                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setToggleOption(!toggleOption)}>
                                        <Ionicons name={'add'} color={'#cf2a3a'} size={20} />
                                        <Text style={{ color: '#cf2a3a', fontWeight: '600' }}>Add</Text>
                                    </Pressable>
                                </View>
                                {paxCargoProperty.length > 0 ? (
                                    <>
                                        <View style={{ paddingVertical: 10 }}>
                                            {paxCargoProperty.map((c: any) => (
                                                <View key={c.id} style={{ width: '90%', alignSelf: 'center' }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <Dropdown onChange={(item) => setType(item)} value={c.cargoBrandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))}
                                                            labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                            containerStyle={{
                                                                alignSelf: 'flex-start',
                                                                width: '79%',
                                                            }}
                                                            selectedTextStyle={{ fontSize: 14, lineHeight: 35, }}
                                                            renderRightIcon={() => (
                                                                <Ionicons name="chevron-down" size={15} />
                                                            )}
                                                            dropdownPosition="bottom"
                                                            renderItem={(item) => (
                                                                <View style={{ width: '80%', padding: 8 }}>
                                                                    <Text>{item.label}</Text>
                                                                </View>
                                                            )}
                                                        />
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                ) : (
                                    <View style={{ flexDirection: 'column', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name={'close-circle'} size={30} color={'#c7c7c7'} />
                                        <Text style={{ fontSize: 10, color: '#646464' }}>No cargo record</Text>
                                    </View>
                                )}
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
    optionContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 10,
        width: 150,
        flexDirection: 'column',
        gap: 5,
        elevation: 2,
        right: 10,
        top: 30,
        zIndex: 10,
        borderRadius: 5
    }
})