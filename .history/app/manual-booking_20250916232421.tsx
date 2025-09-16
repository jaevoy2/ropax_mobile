import { FetchTrips } from "@/api/trips";
import { usePassengers } from "@/context/passenger";
import { useTrip } from "@/context/trip";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('screen');

type TripProps = {
    trip_id: number;
    vessel: string;
    route_origin: string;
    route_destination: string;
}

export default function ManualBooking() {
    const { trip, setTrip, setID } = useTrip();
    const { clearPassengers } = usePassengers();
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [contentLoading, setContentLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const tripsFetch = await FetchTrips();

                if(tripsFetch) {
                    const tripsData: TripProps[] = tripsFetch.data.map((t: any) => ({
                        trip_id: t.id,
                        vessel: t.trip.vessel.name,
                        route_origin: t.trip.route.origin,
                        route_destination: t.trip.route.destination,
                    }))

                    setTrips(tripsData);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }finally{
                setContentLoading(false);
            }
        }
        fetchTrips()
    }, [])

    const handleSaveTrip = (selectedTrip: string, trip_id: number) => {
        setLoading(true);            
        setTimeout(() => {
            if(trip != selectedTrip) {
                setTrip('');
                clearPassengers();
            }
    
            setTrip(selectedTrip);
            setID(trip_id);
            setLoading(false);
            router.push('/seatPlan');
        }, 200);
    }


    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manual Booking</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TouchableOpacity>
                        <Ionicons name="boat" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="calendar" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ padding: 20 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Trip</Text>
                    <Modal visible={loading} transparent animationType="fade">
                        <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ height: height / 5, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                                <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                            </View>
                        </View>
                    </Modal>
                </View>
                <View>
                    {contentLoading == true ? (
                        <View style={{ height: height / 2 }}>
                            <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                        </View>
                    ) : (
                        <>
                        {trips?.map((trip) => (
                            <TouchableOpacity onPress={() => handleSaveTrip(trip.vessel, trip.trip_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 25, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{`${trip.route_origin}  >  ${trip.route_destination} [${trip.vessel}]`}</Text>
                                <Ionicons name="chevron-forward" size={18} />
                            </TouchableOpacity>
                        ))}
                        </>
                    )}
                </View>
            </View>
        </View>
    )
}