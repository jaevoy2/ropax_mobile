import { FetchManageBookingList } from "@/api/manageBookingList";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

type PaxBookingProps = {
    id: number;
    name: string;
    departureDate: string;
    departureTime: string;
    route: string;
    vessel: string;
    referenceNumber: string;
}

const { height } = Dimensions.get('window')


export default function ManageBooking() {
    const [passengers, setPassengers] = useState<PaxBookingProps[] | []>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dateString = new Date().toISOString().split('T')[0];
        fetchBooking(dateString);
    }, []);

    const fetchBooking = async (dateString: string) => {
        try {
            const response = await FetchManageBookingList(dateString)
            
            if(!response.error) {
                const paxData: PaxBookingProps[] = response.data.map((passenger: any) => ({
                    id: passenger.id,
                    name: `${passenger.first_name} ${passenger.last_name}`,
                    departureDate: new Date(passenger.bookings.find((c: any) => c.created_at).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    departureTime: new Date(`1970-01-01T${passenger.bookings.find((t: any) => 
                        t.trip_schedule)?.trip_schedule.trip.departure_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    route: passenger.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.route.mobile_code,
                    vessel: passenger.bookings.find((t: any) => t.trip_schedule)?.trip_schedule.trip.vessel.name,
                    referenceNumber: passenger.bookings.find((r: any) => r.reference_no).reference_no
                }))
                setPassengers(paxData)
            }
        }catch (error: any) {
            Alert.alert('Error', error.message)
        }finally {
            setLoading(false);
        }
    }

    const PassengerItem = React.memo(({ paxDatas }: { paxDatas: PaxBookingProps }) => {
        return (
            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                <Text style={{ alignSelf: 'flex-end', fontSize: 10 }}>{paxDatas.departureDate}</Text>
                <View style={{ borderBottomColor: '#dadadaff', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{paxDatas.name}</Text>
                    <Text style={{ fontSize: 12, color: '#cf2a3a', fontWeight: 'bold' }}>{paxDatas.referenceNumber}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10 }}>{`${paxDatas.vessel}  |  ${paxDatas.route}  |  ${paxDatas.departureTime}`}</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#cf2a3a', paddingVertical: 3 , paddingHorizontal: 10, borderRadius: 5}}>
                        {/* <Text style={{ color: '#fff' }}>Edit</Text> */}
                        <MaterialCommunityIcons name={'pencil'} size={14} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    })

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 50, height: 150, backgroundColor: '#cf2a3a', paddingHorizontal: 20, gap: 15 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Bookings</Text>
                <View style={{ position: 'relative', borderColor: '#cfcfcf73', backgroundColor: '#d4abab73', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput placeholder='Search' placeholderTextColor='#fff' style={{ fontSize: 13, fontWeight: '600', width: '90%', color: '#fff' }} />
                    <TouchableOpacity style={{ borderLeftWidth: 1, borderLeftColor: '#cfcfcfd0', paddingLeft: 10 }}>
                        <Ionicons name={'search'} size={20} color={'#fff'} />
                    </TouchableOpacity>
                    <View style={{ backgroundColor: '#fff', position: 'absolute', height: 50, width: '107%', top: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, elevation: 2 }}>

                    </View>
                </View>
            </View>

            <View style={{ justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20, height: height - 170 }}>
                {loading == true ? (
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                ) : (
                    <>
                        {passengers.length > 0 ? (
                            <>
                                <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 18 }}>Bookings</Text>
                                <FlatList data={passengers.reverse()} keyExtractor={(passengers) => String(passengers.id)} showsVerticalScrollIndicator={false} 
                                    renderItem={({ item: passengerDatas }) => <PassengerItem paxDatas={passengerDatas}/>}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={{ fontSize: 16, textAlign: 'center', color: '#7A7A85' }}>No bookings found.</Text>
                            </>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}