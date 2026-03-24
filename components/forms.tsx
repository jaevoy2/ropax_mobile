import { FetchPassengerType } from '@/api/passengerType';
import { PaxCargoProperties, useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checkbox } from 'react-native-paper';
import { InfantProps, PassengerProps, usePassengers } from '../context/passenger';


const passGender = ['Male', 'Female'];
type FormProps = {
    errorForm: (string | number)[];
}

type PassTypeProps = {
    id?: number;
    name?: string;
    code?: string;
}

type PaxFareProps = {
    id: number;
    fare: number;
    routes_id: number;
    passenger_type_id?: number;
    vessel_id: number;
    accommodation_type_id: number;
}

export default function Forms({ errorForm }: FormProps) {
    const { vessel_id, routeID, isCargoable, departure_time, id } = useTrip();
    const { passengers, setPassengers, updatePassenger, updateInfant, updateCargo } = usePassengers();
    const [typeLoading, setTypeLoading] = useState(true);
    const { cargoProperties } = useCargo();
    const [passengerType, setPassengerType] = useState<PassTypeProps[] | null>(null);
    const [paxFares, setPaxFares] = useState<PaxFareProps[] | null>(null)

    useEffect(() => {
        const departureTime = new Date(`1970-01-01T${departure_time}`).toLocaleTimeString(
            'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

        const passengerType = async () => {
            try {
                const passTypesAndFares = await FetchPassengerType();

                if(!passTypesAndFares.error) {
                    const types: PassTypeProps[] = passTypesAndFares.types.map((type: any) => ({
                        id: type.id,
                        name: type.name,
                        code: type?.passenger_types_code
                    }));

                    const paxFares: PaxFareProps[] = passTypesAndFares.fares.map((fare: any) => ({
                        id: fare.id,
                        fare: fare.fare,
                        routes_id: fare.routes_id,
                        passenger_type_id: fare.passenger_type_id,
                        vessel_id: fare.vessel_id,
                        accommodation_type_id: fare.accommodation_type_id
                    }));

                    setPassengerType(types);
                    setPaxFares(paxFares)
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }finally{
                setTypeLoading(false);
            }
        }

        passengerType();
    }, []);

    const hasInfantChecker = (seat: number | string, passIndex: number, hasInfantValue: boolean, type_id: number) => {
        const hasPasses = passengers.some((p) => p.passType == 'Passes');

        setPassengers(prev =>  
            prev.map((p, index) => {
                const target = !hasPasses ? 
                p.seatNumber == seat :
                index == passIndex;

                if(!target) return p;

                const isHasInfant = !p.hasInfant;
                return {
                    ...p, hasInfant: isHasInfant, infant: isHasInfant ? [{ name: '', gender: '', age: 0, passType_id: type_id }] : []
                }
            })
        )

    }

    const hasCargoChecker = useCallback((seat, passIndex) => {
        const hasPasses = passengers.some((p) => p.passType == 'Passes');

        setPassengers(prev => 
            prev.map((p, index) => {
                const target = !hasPasses ?
                p.seatNumber == seat :
                index == passIndex;

                if(!target) return p;
                
                const isHasCargo = !p.hasCargo;

                return {
                    ...p, hasCargo: isHasCargo, cargo: isHasCargo ? [{cargoAmount: 0.00, quantity: 1}] : []
                }
            })
        )
    }, []);

    const addInfant = (indentifier: string | number, newInfant: InfantProps) => {
        setPassengers((prev) => 
            prev.map((p, index) => {
                if(p.seatNumber !== indentifier && index !== indentifier) return p;
                return {
                    ...p, infant: [...(p.infant || []), newInfant]
                }
            })
        )
    }

    const addPaxCargo = (indentifier: string | number, newCargo: PaxCargoProperties) => {
        console.log()
        setPassengers((prev) => 
            prev.map((p, index) => {
                if(p.seatNumber !== indentifier && index !== indentifier) return p;
                return {
                    ...p, cargo: [...(p.cargo || []), newCargo]
                }
            })
        )
    }

    const removeInfant = (seat: string | number, infantIndex: number) => {
        setPassengers((prev) => 
            prev.map((p) => {
                if(p.seatNumber !== seat) return p;
                return {
                    ...p, infant: p.infant?.filter((_, i) => i !== infantIndex)
                }
            })
        )
    }

    const removeCargo = (seat: string | number | null, paxIndex: number, cargoIndex: number) => {
        setPassengers((prev) => 
            prev.map((p, index) => {
                if(p.seatNumber != seat || index != paxIndex) return p;

                return {
                    ...p, cargo: p.cargo.filter((_, i) => i !== cargoIndex)
                }
            })
        )
    }

    const handleCargoQuantity = (operation: 'add' | 'minus', cargoIndex: number, paxId: string | number) => {
        const passenger = passengers.find(p => p.id == paxId);
        if(!passenger) return;

        const paxCargo = passenger.cargo[cargoIndex]
        if(!paxCargo) return;

        updateCargo(paxId, cargoIndex, 'quantity', operation == 'add' ? paxCargo.quantity += 1 : paxCargo.quantity -= 1)

    }

    // const handlePassesRemove = (passIndex: number) => {

    // }


    const handleOnPaxTypeSelect = (passenger: PassengerProps, typeID: number, paxType: string, paxTypeCode: string) => {        
        const prop = paxFares?.find(
            p => 
                p.routes_id == routeID &&
                p.vessel_id == vessel_id &&
                p.accommodation_type_id == passenger.accommodationID &&
                p.passenger_type_id == typeID
        );

        setPassengers(prev =>
            prev.map(p => p.id == passenger.id ? {
                ...p,
                passType: paxType,
                passType_id: typeID,
                passTypeCode: paxTypeCode,
                fare: prop?.fare ?? 0
            }: p )
        )
    }

    const ComputedCargoAmount = (cargo: PaxCargoProperties) => {
        if(!cargo || !cargoProperties) {
            return { amount: 0, optionID: 0 };
        }

        let prop;

        if(cargo.cargoType === 'Rolling Cargo') {

            if(!cargo.cargoBrandID || !cargo.cargoSpecificationID) {
                return { amount: 0, optionID: 0 };
            }

            prop = cargoProperties.data.cargo_options?.find(
                c => 
                    c.cargo_type_id == cargo.cargoTypeID &&
                    c.cargo_brand_id == cargo.cargoBrandID &&
                    c.specification == cargo.cargoSpecification &&
                    c.route_id == routeID
            );

            return {
                amount: prop ? Number(prop.price * cargo.quantity) : 0,
                optionID: prop?.id ?? 0
            };
        }

        if(cargo.cargoType === 'Parcel') {

            if(!cargo.parcelCategoryID) {
                return { amount: 0, optionID: 0 };
            }

            prop = cargoProperties.data.cargo_options?.find(
                c =>
                    c.parcel_category_id == cargo.parcelCategoryID &&
                    c.route_id == routeID
            );

            return {
                amount: prop ? Number(prop.price * cargo.quantity) : 0,
                optionID: prop?.id ?? 0
            };
        }

        if(cargo.cargoType === 'Animal/Pet') {

            const petType = cargoProperties.data.cargo_types?.find(
                t => t.name === 'Animal/Pet'
            );

            prop = cargoProperties.data.cargo_options?.find(
                c =>
                    c.cargo_type_id == petType?.id &&
                    c.route_id == routeID
            );

            return {
                amount: prop ? Number(prop.price * cargo.quantity) : 0,
                optionID: prop?.id ?? 0
            };
        }

        return { amount: 0, optionID: 0 };
    };

    const computedPassengerCargo = useMemo(() => {
        return passengers.map((pax) => {
            if (!pax.cargo || pax.cargo.length === 0) return pax;

            const updatedCargo = pax.cargo.map((cargoItem) => {
                const { amount, optionID } = ComputedCargoAmount(cargoItem);
                return {
                    ...cargoItem,
                    cargoAmount: amount,
                    cargoOptionID: optionID,
                };
            });

            return { ...pax, cargo: updatedCargo };
        });
    }, [passengers, cargoProperties, routeID]);
    
    useEffect(() => {
        computedPassengerCargo.forEach((pax) => {
            pax.cargo?.forEach((cargoItem) => {
                const original = passengers
                    .find((p) => p.id === pax.id)
                    ?.cargo?.find((c) => c.id === cargoItem.id);

                if (!original) return;

                if (
                    original.cargoAmount !== cargoItem.cargoAmount ||
                    original.cargoOptionID !== cargoItem.cargoOptionID
                ) {
                    updateCargo(pax.id, pax.cargo.indexOf(cargoItem), 'cargoAmount', cargoItem.cargoAmount);
                    updateCargo(pax.id, pax.cargo.indexOf(cargoItem), 'cargoOptionID', cargoItem.cargoOptionID);
                }
            });
        });

    }, [computedPassengerCargo, passengers]);



    const paxsengerTypes = useMemo(() => passengerType?.filter(
        paxType => paxType.name !== 'Infant' && paxType.name != 'Passes'
    ), [passengerType])




    return (
        <View>
            <View style={{ height: '100%', marginTop: 10, flexDirection: 'column', gap: 20 }}>
                {passengers.map((p, index) => (
                    <View key={p.id} style={{ position: 'relative', borderColor: errorForm.includes(p.seatNumber ?? '') ? '#cf2a3a' : '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', elevation: 5 }}>
                        {passengers.some((p) => p.passType == 'Passes' && index != 0) && (
                            <TouchableOpacity style={{ alignSelf: 'flex-end', top: -5, flexDirection:'row', alignItems: 'center' }}>
                                <Ionicons name='close' size={20} color={'#cf2a3a'} />
                                <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Remove</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            {p.passType != 'Passes' && (
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 11, fontWeight: '900' }}>{p.accommodation} Seat#</Text>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#cf2a3a', borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 25, borderRadius: 5 }}>
                                        {p.seatNumber}
                                    </Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Fare:</Text>
                                <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '900' }}>₱</Text>
                                    <TextInput onChangeText={(text) => updatePassenger(p.id, 'fare',  Number(text.replace(/[^0-9.]/g,'')))} value={String(p?.fare?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '')}
                                        keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: '900', textAlign: 'right',fontSize: 15 }} />
                                </View>
                            </View>
                        </View>
                        {p.passType != 'Passes' && (
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 10, gap: 5 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Type:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {typeLoading == true ? (
                                        <>
                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#545454' }}>Fetching Passenger Types...</Text>
                                        </>
                                    ) : (
                                        <>
                                            {paxsengerTypes.map((type) => (
                                                <TouchableOpacity onPress={() => handleOnPaxTypeSelect(p, type.id, type.name, type.code)}
                                                key={type.id} style={{ backgroundColor: p.passType == type.name ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 5  }}>
                                                    <Text style={{ textAlign: 'center', fontSize: 13, color: p.passType == type.name ? '#fff' : '#cf2a3a', fontWeight: '600' }}>{type.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}

                                </View>
                            </View>
                        )}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center' }}>
                                <TextInput value={p.name ?? ''} onChangeText={(text) => updatePassenger(p.id, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 15, fontWeight: '600' }} />
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center' }}>
                                    <TextInput value={String(p?.age ?? '')} onChangeText={(text) => updatePassenger(p.id, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 15, fontWeight: '600' }} />
                                </View>
                            </View>
                            <View style={{ width: '56%', }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                <View style={{ flexDirection:'row', gap: 5 }}>
                                    {passGender.map((gender) => (
                                        <TouchableOpacity onPress={() => updatePassenger(p.id, 'gender', gender)} key={gender} style={{ backgroundColor: p.gender == gender ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 12 }}>
                                            <Text style={{ textAlign: 'center', fontSize: 14, color: p.gender == gender ? '#fff' : '#cf2a3a' }}>{gender}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8 }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Nationality:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center'  }}>
                                    <TextInput value={p.nationality ?? 'Filipino'} onChangeText={(text) => updatePassenger(p.id, 'nationality', text)} defaultValue='Filipino' style={{ fontSize: 13, fontWeight: '600' }} />
                                </View>
                            </View>
                            <View style={{ width: '57.5%' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Address:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center'  }}>
                                    <TextInput value={p.address ?? ''} onChangeText={(text) => updatePassenger(p.id, 'address', text)} placeholder='Address' style={{ fontSize: 13, fontWeight: '600' }} />
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Contact#:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center'  }}>
                                    <TextInput value={p.contact ?? ''} placeholder='+63' onChangeText={(text) => updatePassenger(p.id, 'contact', text)} style={{ fontSize: 13, fontWeight:'600' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity disabled={p.passType == 'Child'} onPress={() => hasInfantChecker(p.seatNumber!, index, p.hasInfant!, passengerType?.find((i) => i.name == 'Infant')?.id ?? 0 )}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                    <Checkbox status={p.hasInfant ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                    <Text style={{ fontSize: 13 }}>Infant</Text>
                                </TouchableOpacity>
                                {isCargoable != 0 && (
                                    <TouchableOpacity onPress={() => hasCargoChecker(p.seatNumber!, index )}
                                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                        <Checkbox status={p.hasCargo ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                        <Text style={{ fontSize: 13 }}>Cargo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {p.hasInfant && (
                            <View style={{ marginTop: 30 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#949494', paddingBottom: 8 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a', marginBottom: 5 }}>Infant Details</Text>
                                    <TouchableOpacity onPress={() => {
                                        const hasPasses = passengers.some(p => p.passType == 'Passes');
                                        if(!hasPasses) {
                                            addInfant(p.seatNumber!, {name: '', gender: '', age: 0, passType_id: passengerType?.find((i) => i.name == 'Infant')?.id! })
                                        }else {
                                            addInfant(index, {name: '', gender: '', age: 0, passType_id: passengerType?.find((i) => i.name == 'Infant')?.id! })
                                        } 
                                    }}
                                        style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontWeight: 600 }}>Add Infant</Text>
                                        <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                    </TouchableOpacity>
                                </View>
                                {p.infant?.map((i, index) => (
                                    <View key={`${p.name}-${index}`}>
                                        <View style={{ marginTop: 30 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                                                {index != 0 && (
                                                    <TouchableOpacity onPress={() => removeInfant(p.seatNumber!, index)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name={'close'} size={20} color={'#cf2a3a'} />
                                                        <Text style={{ color: '#cf2a3a', fontWeight: '600', fontSize: 13 }}>Remove</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center'  }}>
                                                <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13, fontWeight: '600' }} />
                                            </View>
                                        </View>
                                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                            <View style={{ width: '40%' }}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center'  }}>
                                                    <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 13, fontWeight: '600' }} />
                                                </View>
                                            </View>
                                            <View style={{ width: '56%', }}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                                <View style={{ flexDirection:'row', gap: 5 }}>
                                                    {passGender.map((infntgender) => (
                                                        <TouchableOpacity onPress={() => updateInfant(p.seatNumber!, index, 'gender', infntgender)} key={infntgender} style={{ backgroundColor: p.infant?.[index]?.gender == infntgender ? '#cf2a3a' : 'transparent',
                                                            borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                                            <Text style={{ textAlign: 'center', fontSize: 14, color: p.infant?.[index]?.gender == infntgender ? '#fff' : '#cf2a3a' }}>{infntgender}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {p.hasCargo == true && (
                            <View style={{ marginTop: 40 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, borderBottomColor: '#949494', borderBottomWidth: 1, paddingBottom: 8 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#cf2a3a', marginBottom: 5 }}>Cargo Details</Text>
                                    <TouchableOpacity onPress={() => {
                                        const hasPasses = passengers.some(p => p.passType == 'Passes');
                                                if(!hasPasses) {
                                                    addPaxCargo(p.seatNumber!, { cargoAmount: 0.00, quantity: 1 })
                                                }else {
                                                    addPaxCargo(p.seatNumber!, { cargoAmount: 0.00, quantity: 1 })
                                                } 
                                            }}
                                        style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontWeight: 600 }}>Add Cargo</Text>
                                        <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                    </TouchableOpacity>
                                </View>
                                
                                {p.cargo.map((c, cargoIndex) => (
                                    <View key={`${p.id}-${cargoIndex}`}>
                                        {cargoIndex != 0 && (
                                            <TouchableOpacity onPress={() => removeCargo(p.seatNumber, index, cargoIndex)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, alignSelf: 'flex-end' }}>
                                                <Ionicons name={'close'} size={20} color={'#cf2a3a'} />
                                            </TouchableOpacity>
                                        )}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5 }}>
                                            <View style={{ flexDirection: 'column', alignSelf: 'flex-start' }}>
                                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                                <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                                    <Text style={{ fontSize: 16 }}>₱ </Text>
                                                    <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 16 }}>
                                                        {ComputedCargoAmount(c).amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Text>
                                                </View>
                                            </View>
                                            {c.cargoType && c.cargoType != 'Rolling Cargo' && (
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Quantity:</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: '#B3B3B3', paddingHorizontal: 5, borderWidth: 1, borderRadius: 5 }}>
                                                        <TouchableOpacity disabled={c.quantity == 1} onPress={() => handleCargoQuantity('minus', cargoIndex, p.id)} style={{ paddingRight: 5 }}>
                                                            <Ionicons name={'remove'} size={18} color={c.quantity == 1 && "#d4d4d4ff"} />
                                                        </TouchableOpacity>
                                                        <Text style={{ paddingHorizontal: 14, fontWeight: 'bold', borderRightColor: '#B3B3B3', borderLeftColor: '#B3B3B3', borderLeftWidth: 1, borderRightWidth: 1, paddingVertical: 5 }}>
                                                            {c.quantity}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => handleCargoQuantity('add', cargoIndex, p.id)} style={{ paddingLeft: 5 }}>
                                                            <Ionicons name={'add'} size={18}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ width: '100%' }}>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Cargo Type:</Text>
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <Dropdown onChange={(item) => {updateCargo( p.id, cargoIndex, 'cargoType', item.label), updateCargo(p.id, cargoIndex, 'cargoTypeID', item.value)}} 
                                                value={c.cargoTypeID} data={cargoProperties?.data.cargo_types.map((type: any) => ({ label: type.name, value: type.id })) } labelField="label" valueField="value" placeholder="Select Cargo Type" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                    containerStyle={{
                                                        alignSelf: 'flex-start',
                                                        width: '90%',
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
                                        {c.cargoType == 'Rolling Cargo' ? (
                                            <View>
                                                <View style={{ width: '100%' }}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <Dropdown onChange={(item) => {updateCargo(p.id, cargoIndex, 'cargoBrand', item.label), updateCargo(p.id, cargoIndex, 'cargoBrandID', item.value)}} value={c.cargoBrandID}
                                                            data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))} labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                            containerStyle={{
                                                                alignSelf: 'flex-start',
                                                                width: '90%',
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
                                                    <View style={{ width: '50%' }}>
                                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>{'Specifications (CC):'}</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center' }}>
                                                            <Dropdown onChange={(item) => {updateCargo(p.id, cargoIndex, 'cargoSpecification', String(item.label)),  updateCargo(p.id, cargoIndex, 'cargoSpecificationID', item.value)}} 
                                                                value={c.cargoSpecificationID} data={cargoProperties.data.cargo_options.filter(opt => opt.specification).map((s: any) => ({ label: String(s.specification), value: s.id }))} labelField="label" valueField="value" placeholder="Select CC" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                                containerStyle={{
                                                                    alignSelf: 'flex-start',
                                                                    width: '42%',
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
                                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Plate#:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5,height: 45, justifyContent: 'center'  }}>
                                                            <TextInput value={c.cargoPlateNo} onChangeText={(text) => updateCargo(p.id, cargoIndex, 'cargoPlateNo', text)} placeholder='Plate#' style={{ fontSize: 13 }} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : c.cargoType == 'Parcel' ? (
                                            <View style={{ marginTop: 5 }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Parcel Category:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <Dropdown onChange={(item) => {updateCargo(p.id, cargoIndex, 'parcelCategory', item.label), updateCargo(p.id, cargoIndex, 'parcelCategoryID', item.value)}} 
                                                    value={c.parcelCategoryID} data={cargoProperties?.data.parcel_categories.map((category: any) => ({ label: category.name.slice(1, -1), value: category.id })) } labelField="label" valueField="value" placeholder="Select Category" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                    </View>
                                ))}

                            </View>
                        )}
                    </View>
                ))}

                {passengers.some(p => p.passType == 'Passes') && (
                    <View style={{ padding: 10, backgroundColor: '#fff', elevation: 5, borderRadius: 8, borderWidth: 1, borderColor: '#B3B3B3' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Approved by:</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, height: 45, justifyContent: 'center' }}>
                            <TextInput placeholder='First Last' style={{ fontSize: 15, fontWeight: '600' }} />
                        </View>
                    </View>
                )}
            </View>

        </View>
    )
}