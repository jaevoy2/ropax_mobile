import { FetchManageBookingList } from "@/api/manageBookingList";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    });

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

    useEffect(() => {
        const dateString = new Date().toISOString().split('T')[0];
        fetchBooking(dateString)
    }, []);

    const fetchBooking = async (dateString: string) => {
        try {
            const response = await FetchManageBookingList(dateString);
            
            if(!response.error) {
                console.log(response.data[0].bookings.find((t: any) => t.trip_schedule.trip?.departure_time));
                const paxData: PaxBookingProps[] = response.data.map((passenger: any) => ({
                    id: passenger.id,
                    name: `${passenger.first_name} ${passenger.last_name}`,
                    departureDate: new Date(passenger.bookings.find((c: any) => c.created_at).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    departureTime: new Date(`1970-01-01T${passenger.bookings.find((t: any) => t.trip_schedule).trip.find(t => t.departure_time)}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    route: passenger.bookings.find((t: any) => t.trip_schedule).trip.route.mobile_code,
                    vessel: passenger.bookings.find((t: any) => t.trip_schedule).trip.vessel.name,
                    referenceNumber: passenger.bookings.find((r: any) => r.reference_no)
                }))

                setPassengers(paxData)
            }
        }catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 50, height: 150, backgroundColor: '#cf2a3a', paddingHorizontal: 20, gap: 15 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
                <View style={{ borderColor: '#cfcfcf73', backgroundColor: '#d4abab73', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput placeholder='Search' placeholderTextColor="#fff" style={{ fontSize: 13, fontWeight: '600', width: '90%', color: '#fff' }} />
                    <TouchableOpacity style={{ borderLeftWidth: 1, borderLeftColor: '#cfcfcfd0', paddingLeft: 10 }}>
                        <Ionicons name={'search'} size={20} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20, height: height - 170 }}>
                <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 20 }}>Bookings</Text>
                <FlatList data={passengers} keyExtractor={(booking) => booking.referenceNumber} showsVerticalScrollIndicator={false} renderItem={({ item }) => (
                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                        <Text style={{ alignSelf: 'flex-end', fontSize: 10 }}>{item.departureDate}</Text>
                        <View style={{ borderBottomColor: '#B3B3B3', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingBottom: 8 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, color: '#cf2a3a', fontWeight: 'bold' }}>{item.referenceNumber}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{`${item.vessel} | ${item.route} | ${item.departureTime}`}</Text>
                            <TouchableOpacity style={{ backgroundColor: '#cf2a3a', paddingVertical: 3 , paddingHorizontal: 10, borderRadius: 5}}>
                                <Text style={{ color: '#fff' }}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}/>
            </View>
        </View>
    )
}