import { FetchCargoVessel } from '@/api/cargoVessel';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

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

const brands = [
    {id: 1, name: 'Honda'},
    {id: 2, name: 'Rusi'},
    {id: 3, name: 'Motopush'},
    {id: 4, name: 'SkyGo'}
]

export default function CargoComponent({ dateChange }: {dateChange: string} ) {
    const { vessel, setVessel, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode, clearTrip } = useTrip();
    const { clearPassengers } = usePassengers();
    const [trips, setTrips] = useState<CargoTripProps[] | null>(null);
    const [cargoContentLoading, setCargoContentLoading] = useState(true);
    const [selectedVessel, setSelectedVessel] = useState('');
    const [timeWithRoute, setTimeWithRoute] = useState('');
    const [selectedBrand, setSelectdBrand] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const tripsAnimation = useRef(new Animated.Value(width)).current;
    const formSheetAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        closeFormSheet()
        setCargoContentLoading(true);
        clearTrip();
        handleFetchTrips(dateChange);
    }, [dateChange]);

    const handleSaveTrip = (vesselName: string, trip_id: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number) => {
        setFormLoading(true);
        const departure_time = new Date(`1970-01-01T${departureTime}`).toLocaleTimeString(
                        'en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });

        setSelectedVessel(vesselName);
        setTimeWithRoute(`${origin} --- ${destination} | ${departure_time}`)
        toggleFormSheet();
        setTimeout(() => {
            if(vessel != vesselName) {
                setVessel('');
                clearPassengers();
            }
    
            setVessel(vesselName);
            setID(trip_id);
            setVesselID(vesselID);
            setOrigin(origin);
            setDestination(destination);
            setMobileCode(mobileCode);
            setCode(code);
            setWebCode(web_code);
            setDepartureTime(departureTime);
            setFormLoading(false);
        }, 500);
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
        Animated.timing(tripsAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start();

        Animated.timing(formSheetAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start()
    }

    const closeFormSheet = () => {
        clearTrip();
        Animated.timing(tripsAnimation, {
            toValue: width,
            duration: 200,
            useNativeDriver: true
        }).start();

        Animated.timing(formSheetAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start()
    }

    const formattedBrands = brands.map((brand) => ({
        label: brand.name,
        value: brand.id
    }));

    return (
        <View style={{ height: height }}>
            <Modal visible={saveLoading} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 5, width: width - 100, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                </View> 
            </Modal>
            <Animated.View style={{ opacity: tripsAnimation, height: height }}> 
                {cargoContentLoading == true ? (
                    <View style={{ height: height / 2, justifyContent: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                ) : trips?.length == 0 ? (
                    <View style={{ height: height / 2, justifyContent: 'center' }}>
                        <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Available Trips</Text>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 20 }}>
                        {trips?.map((trip) => (
                            <TouchableOpacity onPress={() => handleSaveTrip(trip.vessel, trip.trip_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>{`${trip.departure}`}</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{`${trip.route_origin}  >  ${trip.route_destination} [ ${trip.vessel} ]`}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </Animated.View>

            <Animated.View style={{ paddingHorizontal: 15, paddingTop: 25, backgroundColor: '#f1f1f1', height: '100%', transform: [{ translateX: tripsAnimation }], bottom: '105%' }}>
                {formLoading == true ? (
                    <View style={{ height: '50%', justifyContent: 'center', alignSelf: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                ) : (
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name={'boat'} color={'#fff'} size={28} style={{ backgroundColor: '#cf2a3a', padding: 5, borderRadius: 50 }} />
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ color: '#747373ff', fontSize: 12 }}>{timeWithRoute}</Text>
                                    <Text style={{ color: '#cf2a3a', fontSize: 22, fontWeight: '900', marginTop: -5 }}>{selectedVessel}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => closeFormSheet()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#cf2a3a', borderRadius: 5 }}>
                                <Ionicons name={'swap-horizontal'} color={'#fff'} size={15} />
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Change Trip</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderColor: '#B3B3B3', padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 25 }}>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Owner Full Name:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                </View>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <Dropdown onChange={(item) => setSelectdBrand(item.value)} value={selectedBrand} data={formattedBrands} labelField="label" valueField="id" placeholder="Select Category" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                        containerStyle={{
                                            alignSelf: 'flex-start',
                                            width: '85%',
                                        }}
                                        selectedTextStyle={{ fontWeight: '500', fontSize: 12, lineHeight: 35, }}
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
                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8 }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>CC:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput placeholder='CC' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Plate#:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <TextInput placeholder='Address' style={{ fontSize: 13 }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, marginTop: 30 }}>
                            {saveLoading == true ? (
                                <ActivityIndicator size='small' color={'#fff'} />
                            ) : (
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Proceed</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    )
}