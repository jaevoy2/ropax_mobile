import { Ionicons } from "@expo/vector-icons";
import { Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    });
const bookings = [
    {
        id: 1,
        name: "Juan Dela Cruz",
        date: date,
        route: "Cebu → Bohol",
        vessel: "MV Ocean Star",
        departureTime: "08:30 AM",
        referenceNumber: "LMBS-000123-25CBU"
    },
    {
        id: 2,
        name: "Maria Santos",
        date: date,
        route: "Cebu → Ormoc",
        vessel: "MV Sea Explorer",
        departureTime: "01:00 PM",
        referenceNumber: "LMBS-000124-25CBU"
    },
    {
        id: 3,
        name: "Pedro Reyes",
        date: date,
        route: "Cebu → Dumaguete",
        vessel: "MV Island Queen",
        departureTime: "06:00 PM",
        referenceNumber: "LMBS-000125-25CBU"
    },
    {
        id: 4,
        name: "Juan Dela Cruz",
        date: date,
        route: "Cebu → Bohol",
        vessel: "MV Ocean Star",
        departureTime: "08:30 AM",
        referenceNumber: "LMBS-000126-25CBU",
    },
    {
        id: 5,
        name: "Maria Santos",
        date: date,
        route: "Cebu → Ormoc",
        vessel: "MV Sea Explorer",
        departureTime: "01:00 PM",
        referenceNumber: "LMBS-000127-25CBU",
    },
    {
        id: 6,
        name: "Carlos Mendoza",
        date: date,
        route: "Cebu → Tagbilaran",
        vessel: "MV Blue Horizon",
        departureTime: "10:15 AM",
        referenceNumber: "LMBS-000128-25CBU",
    },
    {
        id: 7,
        name: "Ana Lopez",
        date: date,
        route: "Cebu → Siquijor",
        vessel: "MV Island Pearl",
        departureTime: "04:45 PM",
        referenceNumber: "LMBS-000129-25CBU",
    },
];

const { height } = Dimensions.get('window')


export default function ManageBooking() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
            </View>

            <View style={{ justifyContent: 'center', paddingTop: 20, paddingHorizontal: 20, height }}>
                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput placeholder='Search Booking' style={{ fontSize: 13, fontWeight: '600', width: '90%' }} />
                    <TouchableOpacity style={{ borderLeftWidth: 1, borderLeftColor: '#B3B3B3', paddingLeft: 10 }}>
                        <Ionicons name={'search'} size={20} />
                    </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 20 }}>Bookings</Text>
                <FlatList data={bookings} keyExtractor={(booking) => booking.referenceNumber} renderItem={({ item }) => (
                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                        <Text style={{ alignSelf: 'flex-end', fontSize: 10 }}>{item.date}</Text>
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