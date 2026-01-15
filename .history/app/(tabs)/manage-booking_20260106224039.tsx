import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

const bookings = [
    {
        id: 1,
        name: "Juan Dela Cruz",
        date: new Date().toISOString().split("T")[0],
        route: "Cebu → Bohol",
        vessel: "MV Ocean Star",
        departureTime: "08:30 AM",
        referenceNumber: "LMBS-000123-25CBU"
    },
    {
        id: 2,
        name: "Maria Santos",
        date: new Date().toISOString().split("T")[0],
        route: "Cebu → Ormoc",
        vessel: "MV Sea Explorer",
        departureTime: "01:00 PM",
        referenceNumber: "LMBS-000124-25CBU"
    },
    {
        id: 3,
        name: "Pedro Reyes",
        date: new Date().toISOString().split("T")[0],
        route: "Cebu → Dumaguete",
        vessel: "MV Island Queen",
        departureTime: "06:00 PM",
        referenceNumber: "LMBS-000125-25CBU"
    }
];


export default function ManageBooking() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
            </View>

            <View style={{ justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20 }}>
                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput placeholder='Search Booking' style={{ fontSize: 13, fontWeight: '600', width: '90%' }} />
                    <TouchableOpacity style={{ borderLeftWidth: 1, borderLeftColor: '#B3B3B3', paddingLeft: 10 }}>
                        <Ionicons name={'search'} size={20} />
                    </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 20 }}>Bookings</Text>
                <FlatList data={bookings} keyExtractor={(booking) => booking.referenceNumber} renderItem={({ item }) => (
                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                        <View style={{ borderBottomColor: '#B3B3B3', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, color: '#cf2a3a', fontWeight: 'bold' }}>{item.referenceNumber}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{`${item.date} | ${item.vessel} | $${item.route}`}</Text>
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