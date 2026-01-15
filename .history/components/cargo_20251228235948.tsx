import { FetchCargoProps } from '@/api/cargoProps';
import { FetchCargoVessel } from '@/api/cargoVessel';
import { CargoOnlyProperties, CargoProperties, useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function CargoComponent({ dateChange }: {dateChange: string} ) {
    const { vessel, routeID, setRouteID, setVessel, setID, setOrigin, setDestination, setVesselID, setCode, setWebCode, setDepartureTime, setMobileCode, clearTrip } = useTrip();
    const { totalAmount, cargoProperties, cargoOnlyProperty, setTotalAmount, setCargoProperties, setCargoOnlyProperty, updateCargoOnlyProperty } = useCargo();
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
        if(cargoOnlyProperty.length === 0) {
            addCargo();
        }
    }, [cargoOnlyProperty]);

    useEffect(() => {
        closeFormSheet()
        setCargoContentLoading(true);
        handleFetchTrips(dateChange);
    }, [dateChange]);

    const addCargo = () => {
        const form_id = formId + 1;
        setFormId(form_id);
        setCargoOnlyProperty(prev => [...prev, { id: form_id }]);
    }

    const handleTripSelect = (vesselName: string, trip_id: number, routeId: number, origin: string, destination: string, mobileCode: string, code: string, web_code: string, departureTime: string, vesselID: number) => {
        clearTrip();
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
    
            setVessel(vesselName);
            setID(trip_id);
            setVesselID(vesselID);
            setRouteID(routeId);
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
            const cargoPropsResponse = await FetchCargoProps();

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
            if(cargoPropsResponse) {
                setCargoProperties(cargoPropsResponse as CargoProperties)
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
        setCargoOnlyProperty([]);
        setFormId(0);
        setFormLoading(true);
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

    // const handleSaveCargo = () => {
    //     setSaveCargoLoading(true);
        
    //     setTimeout(() => {
    //         if(!cargoOnlyProperty.name?.trim()) {
    //             Alert.alert('Invalid', 'Name is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }
    //         if(!cargoOnlyProperty.name?.includes(',')) {
    //             Alert.alert('Invalid', 'Invalid name format.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }
    //         if(cargoOnlyProperty.cargoType == 'Rolling Cargo' && !cargoOnlyProperty?.cargoBrand?.trim()) {
    //             Alert.alert('Invalid', 'Brand is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }
    //         if(cargoOnlyProperty.cargoType == 'Rolling Cargo' && !cargoOnlyProperty?.cargoSpecification?.trim()) {
    //             Alert.alert('Invalid', 'CC is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }
    //         if(cargoOnlyProperty.cargoType == 'Rolling Cargo' && !cargoOnlyProperty?.cargoPlateNo?.trim()) {
    //             Alert.alert('Invalid', 'Plate number is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }

    //         if(cargoOnlyProperty.cargoType == 'Parcel' && !cargoOnlyProperty?.parcelCategory.trim()) {
    //             Alert.alert('Invalid', 'Parcel category is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }

    //         if(cargoOnlyProperty.cargoType == 'Animal' && !cargoOnlyProperty?.parcelCategory.trim()) {
    //             Alert.alert('Invalid', 'Parcel category is required.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }

    //         if(cargoOnlyProperty.cargoAmount == null) {
    //             Alert.alert('Invalid', 'Cargo amount is missing.');
    //             setSaveCargoLoading(false);
    //             return;
    //         }

    //         setSaveCargoLoading(false);
    //         router.push('/summary');
    //     }, 500);

    // }

    const ComputedCargoAmount = (cargo: CargoOnlyProperties) => {
        if(!cargo || !cargoProperties) return '0.00';

        if(cargo?.cargoType == 'Rolling Cargo') {
            if(!cargo.cargoBrandID  || !cargo.cargoSpecificationID) return '0.00';
            
            return cargoProperties.data.cargo_options?.find(
                c => 
                    c.cargo_type_id == cargo.cargoTypeID &&
                    c.cargo_brand_id == cargo.cargoBrandID &&
                    c.cargo_specification_id == cargo.cargoSpecificationID &&
                    c.route_id == routeID
            )?.price ?? '0.00'
        }

        if(cargo?.cargoType == 'Parcel') {
            if(!cargo.parcelCategoryID) return '0.00';

            return cargoProperties.data.cargo_options?.find(
                c => 
                    c.parcel_category_id == cargo.parcelCategoryID &&
                    c.route_id == routeID
            )?.price ?? '0.00';
        }

        if(cargo?.cargoType == 'Animal/Pet') {
            return cargoProperties.data.cargo_options?.find(
                c => c.cargo_type_id == cargoProperties.data.cargo_types?.find(t => t.name == 'Animal/Pet').id &&
                c.route_id == routeID
            )?.price ?? '0.00';
        }

        return '0.00'
    };

    useEffect(() => {
        cargoOnlyProperty.forEach(c => {
            const amount = ComputedCargoAmount(c);
            updateCargoOnlyProperty(c.id, 'cargoAmount', amount);
        });
    }, [cargoProperties]);

    useEffect(() => {
        const total = cargoOnlyProperty.reduce((sum, c) => {
            let subtotal = sum + Number(c.cargoAmount || 0.00);
            return subtotal;
        }, 0);

        // const : CargoTotalAmount = { total } wla pay total amount
    }, [cargoOnlyProperty])

    const removeCargoForm = (formId: number) => {
        setCargoOnlyProperty(prev => prev.filter(c => c.id !== formId));
    }


    return (
        <View style={{ flex: 1 }}>
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
                            <TouchableOpacity onPress={() => handleTripSelect(trip.vessel, trip.trip_id, trip.route_id, trip.route_origin, trip.route_destination, trip.mobile_code, trip.code, trip.web_code, trip.departure_time, trip.vessel_id)} key={trip.trip_id} style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

            <Animated.View style={{ paddingHorizontal: 15, transform: [{ translateX: tripsAnimation }], position: 'absolute', width, top: -100 }}>
                {formLoading == true ? (
                    <View style={{ height: height - 200, justifyContent: 'center', alignSelf: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                    </View>
                ) : (
                    <View style={{ paddingTop: 40 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => closeFormSheet()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                <Ionicons name={'swap-horizontal'} color={'#cf2a3a'} size={18} />
                                <Text style={{ color: '#cf2a3a', fontWeight: 'bold', fontSize: 15 }}>Change Trip</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => addCargo()} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#cf2a3a', borderRadius: 5 }}>
                                <Ionicons name={'add'} color={'#fff'} size={18} />
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Add Cargo</Text>
                            </TouchableOpacity>
                        </View>

                        {cargoOnlyProperty.length > 1 && (
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Total Amount:</Text>
                                <View style={{ borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 16 }}>₱ </Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 16 }}>
                                        {/* {ComputedCargoAmount ? String(ComputedCargoAmount) : '0.00'} */}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {cargoOnlyProperty.map((c: any) => (
                            <View key={c.id} style={{ borderColor: '#B3B3B3', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                        <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                            <Text style={{ fontSize: 16 }}>₱ </Text>
                                            <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 16 }}>
                                                {ComputedCargoAmount(c)}
                                            </Text>
                                        </View>
                                    </View>
                                    {c.id == 1 ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <Text style={{ color: '#747373ff', fontSize: 11 }}>{timeWithRoute}</Text>
                                                <Text style={{ color: '#cf2a3a', fontSize: 20, fontWeight: '900', marginTop: -5 }}>{selectedVessel}</Text>
                                            </View>
                                            <Ionicons name={'boat'} color={'#fff'} size={26} style={{ backgroundColor: '#cf2a3a', padding: 5, borderRadius: 50 }} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => removeCargoForm(c.id)}>
                                            <Ionicons color={'#cf2a3a'} name={'close'} size={25} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {c.id == 1 && (
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                            <TextInput onChangeText={(text) => updateCargoOnlyProperty(c.id, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13 }} />
                                        </View>
                                    </View>
                                )}
                                <View style={{ marginTop: 10 }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Cargo Type:</Text>
                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                        <Dropdown onChange={(item) => {updateCargoOnlyProperty(c.id, 'cargoType', item.label), updateCargoOnlyProperty(c.id, 'cargoTypeID', item.value)}} value={c.cargoTypeID} data={cargoProperties?.data.cargo_types.map((type: any) => ({ label: type.name, value: type.id }))} labelField="label" valueField="value" placeholder="Select Cargo Type" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                            containerStyle={{
                                                alignSelf: 'flex-start',
                                                width: '85%',
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
                                {c?.cargoType != null && (
                                    <>
                                        { c?.cargoType == 'Rolling Cargo' ? (
                                            <>
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <Dropdown onChange={(item) => {updateCargoOnlyProperty(c.id, 'cargoBrand', item.label), updateCargoOnlyProperty(c.id, 'cargoBrandID', item.value)}} value={c.cargoBrandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))} labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                            containerStyle={{
                                                                alignSelf: 'flex-start',
                                                                width: '85%',
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
                                                <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ width: '48%' }}>
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Specification:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                            <Dropdown onChange={(item) => {updateCargoOnlyProperty(c.id, 'cargoSpecification', item.label), updateCargoOnlyProperty(c.id, 'cargoSpecificationID', item.value)}} value={c.specificationID} data={cargoProperties?.data.specifications.map((specs: any) => ({ label: specs.cc, value: specs.id }))} labelField="label" valueField="value" placeholder="Select CC" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                                containerStyle={{
                                                                    alignSelf: 'flex-start',
                                                                    width: '40%',
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
                                                    <View style={{ width: '48%' }}>
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Plate#:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, paddingVertical: 1 }}>
                                                            <TextInput onChangeText={(text) => updateCargoOnlyProperty(c.id, 'cargoPlateNo', text)} placeholder='Plate#' style={{ fontSize: 13 }} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </>
                                        ) : c?.cargoType == 'Parcel' ? (
                                            <View style={{ marginTop: 5 }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Parcel Category:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <Dropdown onChange={(item) => {updateCargoOnlyProperty(c.id, 'parcelCategory', item.label), updateCargoOnlyProperty(c.id, 'parcelCategoryID', item.value)}} value={c.parcelCategoryID} data={cargoProperties?.data.parcel_categories.map((category: any) => ({ label: category.name, value: category.id })) } labelField="label" valueField="value" placeholder="Select Category" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                        containerStyle={{
                                                            alignSelf: 'flex-start',
                                                            width: '85%',
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
                                        ) : (
                                            <View/>
                                        )}
                                    </>
                                )}


                            </View>
                        ))}
                        <TouchableOpacity disabled={saveCargoLoading} style={{ backgroundColor: '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, marginTop: 30 }}>
                            {saveCargoLoading == true ? (
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