import { FetchCargoProps } from '@/api/cargoProps';
import { FetchCargoVessel } from '@/api/cargoVessel';
import { CargoOnlyProperties, CargoProperties, useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
};

export default function CargoComponent({ dateChange }: { dateChange: string }) {
    const { vessel, setVessel, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode, clearTrip } = useTrip();
    const { cargoProperties, cargoOnlyProperty, setCargoProperties, setCargoOnlyProperty, updateCargoOnlyProperty } = useCargo();
    const [trips, setTrips] = useState<CargoTripProps[] | null>(null);
    const [cargoContentLoading, setCargoContentLoading] = useState(true);
    const [selectedVessel, setSelectedVessel] = useState('');
    const [timeWithRoute, setTimeWithRoute] = useState('');
    const [formId, setFormId] = useState(0);
    const [saveCargoLoading, setSaveCargoLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(true);
    const tripsAnimation = useRef(new Animated.Value(width)).current;
    const formSheetAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (cargoOnlyProperty.length === 0) addCargo();
    }, [cargoOnlyProperty]);

    useEffect(() => {
        closeFormSheet();
        setCargoContentLoading(true);
        handleFetchTrips(dateChange);
    }, [dateChange]);

    const addCargo = () => {
        const form_id = formId + 1;
        setFormId(form_id);
        setCargoOnlyProperty(prev => [...prev, { id: form_id }]);
    };

    const removeCargoForm = (formId: number) => {
        setCargoOnlyProperty(prev => prev.filter(c => c.id !== formId));
    };

    const handleTripSelect = (
        vesselName: string,
        trip_id: number,
        origin: string,
        destination: string,
        mobileCode: string,
        code: string,
        web_code: string,
        departureTime: string,
        vesselID: number
    ) => {
        clearTrip();
        const departure_time = new Date(`1970-01-01T${departureTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        setSelectedVessel(vesselName);
        setTimeWithRoute(`${origin} --- ${destination} | ${departure_time}`);
        toggleFormSheet();

        setTimeout(() => {
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
    };

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchCargoVessel(queryDate);
            const cargoPropsResponse = await FetchCargoProps();

            if (tripsFetch) {
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
                    departure: new Date(`1970-01-01T${t.trip.departure_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    }),
                }));
                setTrips(tripsData);
            }
            if (cargoPropsResponse) setCargoProperties(cargoPropsResponse as CargoProperties);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setCargoContentLoading(false);
        }
    };

    const toggleFormSheet = () => {
        Animated.timing(tripsAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        Animated.timing(formSheetAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeFormSheet = () => {
        setCargoOnlyProperty([]);
        setFormId(0);
        setFormLoading(true);

        Animated.timing(tripsAnimation, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
        }).start();

        Animated.timing(formSheetAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const ComputedCargoAmount = (cargo: CargoOnlyProperties) => {
        if (!cargo || !cargoProperties) return '';

        if (cargo?.cargoType == 'Rolling Cargo') {
            if (!cargo.cargoBrandID || !cargo.cargoSpecificationID) return '';
            return cargoProperties.data.cargo_options?.find(
                c =>
                    c.cargo_type_id == cargo.cargoTypeID &&
                    c.cargo_brand_id == cargo.cargoBrandID &&
                    c.cargo_specification_id == cargo.cargoSpecificationID
            )?.price ?? '0.00';
        }

        if (cargo?.cargoType == 'Parcel') {
            if (!cargo.parcelCategoryID) return '';
            return cargoProperties.data.cargo_options?.find(c => c.parcel_category_id == cargo.parcelCategoryID)?.price ?? '0.00';
        }

        if (cargo?.cargoType == 'Animal/Pet') {
            return cargoProperties.data.cargo_options?.find(
                c => c.cargo_type_id == cargoProperties.data.cargo_types?.find(t => t.name == 'Animal/Pet').id
            )?.price ?? '0.00';
        }

        return '0.00';
    };

    useEffect(() => {
        cargoOnlyProperty.forEach(c => {
            const amount = ComputedCargoAmount(c);
            updateCargoOnlyProperty(c.id, 'cargoAmount', amount);
        });
    }, [cargoProperties]);

    return (
        <View style={{ flex: 1 }}>
            {/* Trips View */}
            <Animated.View style={{ transform: [{ translateX: tripsAnimation }], flex: 1 }}>
                {cargoContentLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#cf2a3a" />
                    </View>
                ) : trips?.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Available Trips</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {trips.map(trip => (
                            <TouchableOpacity
                                key={trip.trip_id}
                                onPress={() =>
                                    handleTripSelect(
                                        trip.vessel,
                                        trip.trip_id,
                                        trip.route_origin,
                                        trip.route_destination,
                                        trip.mobile_code,
                                        trip.code,
                                        trip.web_code,
                                        trip.departure_time,
                                        trip.vessel_id
                                    )
                                }
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 20,
                                    backgroundColor: '#fff',
                                    borderRadius: 10,
                                    marginTop: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>{trip.departure}</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 13 }}>
                                        {trip.route_origin}  ---  {trip.route_destination} [ {trip.vessel} ]
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </Animated.View>

            {/* Form Sheet */}
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: tripsAnimation }],
                    width: '100%',
                    paddingHorizontal: 15,
                }}
            >
                {formLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#cf2a3a" />
                    </View>
                ) : (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 150, paddingTop: 40 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        >
                            {/* Header: Change Trip & Add Cargo */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TouchableOpacity onPress={closeFormSheet} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Ionicons name="swap-horizontal" color="#cf2a3a" size={18} />
                                    <Text style={{ color: '#cf2a3a', fontWeight: 'bold', fontSize: 15 }}>Change Trip</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={addCargo} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#cf2a3a', borderRadius: 5 }}>
                                    <Ionicons name="add" color="#fff" size={18} />
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Add Cargo</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Cargo Forms */}
                            {cargoOnlyProperty.map(c => (
                                <View key={c.id} style={{ borderColor: '#B3B3B3', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 10 }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                    <TextInput
                                        onChangeText={text => updateCargoOnlyProperty(c.id, 'name', text)}
                                        placeholder="Last Name, First Name"
                                        style={{ fontSize: 13, borderWidth: 1, borderColor: '#B3B3B3', borderRadius: 5, padding: 8 }}
                                    />
                                    {/* Cargo Type Dropdown */}
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454', marginTop: 10 }}>Cargo Type:</Text>
                                    <Dropdown
                                        onChange={item => {
                                            updateCargoOnlyProperty(c.id, 'cargoType', item.label);
                                            updateCargoOnlyProperty(c.id, 'cargoTypeID', item.value);
                                        }}
                                        value={c.cargoTypeID}
                                        data={cargoProperties?.data.cargo_types.map((type: any) => ({ label: type.name, value: type.id }))}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select Cargo Type"
                                        style={{ height: 40, width: '100%', paddingHorizontal: 10, borderWidth: 1, borderColor: '#B3B3B3', borderRadius: 5 }}
                                        renderRightIcon={() => <Ionicons name="chevron-down" size={15} />}
                                        dropdownPosition="bottom"
                                    />
                                    {/* Computed Amount */}
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                        <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                            <Text>₱ </Text>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{ComputedCargoAmount(c)}</Text>
                                        </View>
                                    </View>

                                    {/* Remove Button */}
                                    {c.id !== 1 && (
                                        <TouchableOpacity onPress={() => removeCargoForm(c.id)} style={{ marginTop: 5, alignSelf: 'flex-end' }}>
                                            <Ionicons name="close" color="#cf2a3a" size={25} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {/* Proceed Button */}
                            <TouchableOpacity disabled={saveCargoLoading} style={{ backgroundColor: '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, marginTop: 30 }}>
                                {saveCargoLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Proceed</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                )}
            </Animated.View>
        </View>
    );
}
