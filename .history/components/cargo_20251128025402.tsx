import { FetchCargoVessel } from '@/api/cargoVessel';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');


type CargoTripProps = {
    trip_id: number;
    departure: string;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure_time: string;
    vessel_id: number;
    route_id: number;
    code: string;
    web_code: string;
    mobile_code: string;
}

export default function CargoComponent() {
    const { trip, setTrip, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode } = useTrip();
    const { clearPassengers } = usePassengers();
    const [trips, setTrips] = useState<CargoTripProps[] | null>(null);
    const [cargoContentLoading, setCargoContentLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false)
    const [formExpanded, setFormExpanded] = useState(false);
    const sheetTranslateY = useRef(new Animated.Value(height + 50)).current;
    const sheetFadeInAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        handleFetchTrips(today);
    }, []);

    const handleSaveTrip = (selectedTrip: string, trip_id: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number) => {
        setFormLoading(true);
        toggleFormSheet();
        setTimeout(() => {
            if(trip != selectedTrip) {
                setTrip('');
                clearPassengers();
            }
    
            setTrip(selectedTrip);
            setID(trip_id);
            setVesselID(vesselID);
            setOrigin(origin);
            setDestination(destination);
            setMobileCode(mobileCode);
            setCode(code);
            setWebCode(web_code);
            setDepartureTime(departureTime);
            setFormLoading(false);
        }, 100);
    }

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchCargoVessel(queryDate);

            if(tripsFetch) {
                const tripsData: CargoTripProps[] = tripsFetch.data.map((t: any) => ({
                    trip_id: t.id,
                    vessel: t.trip.vessel.name,
                    route_origin: t.trip.route.origin,
                    route_destination: t.trip.route.destination,
                    departure_time: t.trip.departure_time,
                    vessel_id: t.trip.vessel_id,
                    route_id: t.trip.route_id,
                    mobile_code: t.trip.route.mobile_code,
                    web_code: t.trip.route.web_code,
                    code: t.trip.vessel.code,
                    departure: new Date(`1970-01-01T${t.trip.departure_time}`).toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }
                    )
                }))

                setTrips(tripsData);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setCargoContentLoading(false);
        }
    }

    const toggleFormSheet = () => {
        setFormExpanded(true);
        Animated.spring(sheetTranslateY, {
            toValue: height,
            useNativeDriver: true
        }).start();

        Animated.timing(sheetFadeInAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    const closeFormSheet = () => {
        setFormExpanded(false)
        Animated.spring(sheetTranslateY, {
            toValue: height + 50,
            useNativeDriver: true
        }).start();

        Animated.timing(sheetFadeInAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    return (
        <View style={{ height: height }}>
            <Modal visible={saveLoading} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 5, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                </View> 
            </Modal>
            {cargoContentLoading == true ? (
                <View style={{ height: height / 2, justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                </View>
            ) : trips?.length == 0 ? (
                <View style={{ height: height / 2, justifyContent: 'center' }}>
                    <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Available Trips</Text>
                </View>
            ) : (
                <>
                    {trips?.map((trip) => (
                        <TouchableOpacity onPress={() => handleSaveTrip(trip.vessel, trip.trip_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{`${trip.route_origin}  >  ${trip.route_destination} [ ${trip.vessel} ]`}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} />
                        </TouchableOpacity>
                    ))}
                </>
            )}
            {formExpanded && (
                <>
                    <Animated.View style={{ opacity: sheetFadeInAnim, position: 'absolute', top: -100 }}>
                        <TouchableOpacity onPress={() => closeFormSheet()} style={{ backgroundColor: '#00000065', width: width, height: height, }} />
                    </Animated.View>
                </>
            )}
            <Animated.View style={{ height, position: 'absolute', bottom: 0, backgroundColor: '#fff', width: width, transform: [{ translateY: sheetTranslateY }], borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                <View style={{ padding: 10 }}>
                    {formLoading == true ? (
                        <View style={{ height: '80%', justifyContent: 'center', alignSelf: 'center' }}>
                            <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                        </View>
                    ) : (
                        <>

                        </>
                    )}
                </View>
            </Animated.View>
        </View>
    )
}