import { FetchFares } from '@/api/fares';
import { FetchPassengerType } from '@/api/passengerType';
import { PaxCargoProperties, useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checkbox } from 'react-native-paper';
import { CargoProps, InfantProps, PassengerProps, usePassengers } from './passenger';


const passGender = ['Male', 'Female'];
type FormProps = {
    errorForm: (string | number)[];
}

type PassTypeProps = {
    id: number;
    name: string;
    code: string;
}

export default function Forms({ errorForm }: FormProps) {
    const { vessel_id, routeID, destination, origin, totalFare, departure_time, vessel, setTotalFare } = useTrip();
    const { passengers, setPassengers, updatePassenger, updateInfant, updateCargo } = usePassengers();
    const [typeLoading, setTypeLoading] = useState(true);
    const { paxCargoProperty, cargoProperties, updatePaxCargoProperty, setPaxCargoProperties } = useCargo();

    const [timeWithRoute, setTimeWithRoute] = useState('');
    const [passengerType, setPassengerType] = useState<PassTypeProps[] | null>(null);

    useEffect(() => {
        const departureTime = new Date(`1970-01-01T${departure_time}`).toLocaleTimeString(
            'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

        setTimeWithRoute(`${origin} --- ${destination} | ${departureTime}`)

        const passengerType = async () => {
            try {
                const passTypes = await FetchPassengerType();

                if(!passTypes.error) {
                    const types: PassTypeProps[] = passTypes.data.map((type: any) => ({
                        id: type.id,
                        name: type.name,
                        code: type.passenger_types_code
                    }));

                    setPassengerType(types);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }finally{
                setTypeLoading(false);
            }
        }

        passengerType();
    }, []);

    const getPassengerFare = async (passType_id: number, accomm_id: number, seatNum: string | number) => {
        try{
            const passFare = await FetchFares(passType_id, accomm_id, vessel_id);

            if(!passFare.error) {
                const fare = passFare.data.fare;
                updatePassenger(seatNum, 'fare', fare);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }
    }

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

    const addPaxCargo = (indentifier: string | number, newCargo: CargoProps) => {
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

    const onFareInput = (passIndex: number, seatNum: string | number | undefined | null, fare: string) => {
        const hasPasses = passengers.some((p) => p.passType == 'Passes');

        if(!hasPasses && seatNum) {
            updatePassenger(seatNum!, 'fare', Number(fare.replace(/[^0-9.]/g,'')));
            return;
        }

        updatePassenger(passIndex, 'fare', Number(fare.replace(/[^0-9.]/g,'')));

    }

    const onFieldInput = (passIndex: number, seatNum: string | number | undefined | null, inputKey: string, value: string | number) => {
        const hasPasses = passengers.some((p) => p.passType == 'Passes');

        if(!hasPasses && seatNum) {
            updatePassenger(seatNum!, inputKey as keyof PassengerProps, value);
            return;
        }

        updatePassenger(passIndex, inputKey as keyof PassengerProps, value);
    }

    const handleCargoQuantity = (operation: 'add' | 'minus', cargoIndex: number, paxSeat: string | number | null, paxIndex: number) => {
        const passenger = passengers[paxSeat || paxIndex];
        console.log(paxIndex)
        if(!passenger) return;
        
        const paxCargo = passenger[cargoIndex]
        if(!paxCargo) return;

        // updateCargo(paxSeat, paxIndex, cargoIndex, 'quantity', operation == 'add' ? paxCargo.quantity += 1 : paxCargo.quantity -= 1)

    }

    // const handlePassesRemove = (passIndex: number) => {

    // }

    const ComputedCargoAmount = (cargo: PaxCargoProperties) => {
        let prop;
        if(!cargo || !cargoProperties) return { amount: Number(0.00), optionID: 0 };

        if(cargo?.cargoType == 'Rolling Cargo') {
            if(!cargo.cargoBrandID  || !cargo.cargoSpecificationID) return { amount: Number(0.00), optionID: 0 };;
            
            prop = cargoProperties.data.cargo_options?.find(
                c => 
                    c.cargo_type_id == cargo.cargoTypeID &&
                    c.cargo_brand_id == cargo.cargoBrandID &&
                    c.cargo_specification_id == cargo.cargoSpecificationID &&
                    c.route_id == routeID
            );

            return {
                amount: prop?.price ? Number(prop.price * cargo.quantity) : Number(0.00),
                optionID: prop?.id ?? 0
            }
        }

        if(cargo?.cargoType == 'Parcel') {
            if(!cargo.parcelCategoryID) return { amount: Number(0.00), optionID: 0 };

            prop = cargoProperties.data.cargo_options?.find(
                c => 
                    c.parcel_category_id == cargo.parcelCategoryID &&
                    c.route_id == routeID
            );

            return {
                amount: prop?.price ? Number(prop.price * cargo.quantity) : Number(0.00),
                optionID: prop?.id ?? 0
            }
        }

        if(cargo?.cargoType == 'Animal/Pet') {
            prop = cargoProperties.data.cargo_options?.find(
                c => c.cargo_type_id == cargoProperties.data.cargo_types?.find(t => t.name == 'Animal/Pet').id &&
                c.route_id == routeID
            );

            return {
                amount: prop?.price ? Number(prop.price * cargo.quantity) : Number(0.00),
                optionID: prop?.id ?? 0
            }
        }

        return { amount: 0.00, optionID: 0 };
    };

    const computedCargoList = useMemo(() => {
        const paxCargo = passengers.filter((p) => p.hasCargo == true)
            .flatMap((p, index) => 
                p.cargo.map((c, cargoIndex) => {
                const prop = ComputedCargoAmount(c)

                return {
                    ...c,
                    seatNumber: p.seatNumber,
                    paxIndex: index,
                    cargoIndex: cargoIndex,
                    cargoAmount: prop.amount,
                    cargoOptionID: prop.optionID
                };
            }));

        return paxCargo
    }, [passengers, cargoProperties, routeID]);


    useEffect(() => {
        computedCargoList.forEach((c) => {
            const passenger = passengers[c.paxIndex]
            if(!passenger) return;

            const prevCargoProp = passenger.cargo?.[c.cargoIndex];
            if(!prevCargoProp) return;

            if(prevCargoProp.cargoAmount != c.cargoAmount || prevCargoProp.cargoOptionID != c.cargoOptionID) {
                updateCargo(c.seatNumber, c.paxIndex,  c.cargoIndex, 'cargoAmount', c.cargoAmount)
                updateCargo(c.seatNumber, c.paxIndex,  c.cargoIndex, 'cargoOptionID', c.cargoOptionID)
            }
        });

    }, [computedCargoList, passengers])


    // const getTotalAmount = useMemo(() => {
    //     return computedCargoList.reduce((sum, c) => 
    //         sum + Number(c.cargoAmount), 0
    //     );
    // }, [computedCargoList]);



    return (
        <View>
            <View style={{ flex: 1, marginTop: 10 }}>
                {passengers.map((p, index) => (
                    <View key={index + 1} style={{ position: 'relative', borderColor: errorForm.includes(p.seatNumber ?? '') ? '#cf2a3a' : '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 20, backgroundColor: '#fff' }}>
                        {passengers.some((p) => p.passType == 'Passes' && index != 0) && (
                            <TouchableOpacity style={{ alignSelf: 'flex-end', top: -5, flexDirection:'row', alignItems: 'center' }}>
                                <Ionicons name='close' size={20} color={'#cf2a3a'} />
                                <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Remove</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            {!passengers.some((p) => p.passType == 'Passes') && (
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ color: '#cf2a3a', fontSize: 11, fontWeight: '900' }}>{p.accommodation} Seat#</Text>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#cf2a3a', borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 25, borderRadius: 5 }}>
                                        {p.seatNumber}
                                    </Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Fare:</Text>
                                <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                    <Text style={{ fontSize: 16 }}>₱</Text>
                                    <TextInput onChangeText={(text) => onFareInput(index, p.seatNumber, text)} value={String(p.fare ? p.fare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold', textAlign: 'right' }} />
                                </View>
                            </View>
                        </View>
                        {!passengers.some((p) => p.passType == 'Passes') && (
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 10, gap: 5 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Type:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {typeLoading == true ? (
                                        <>
                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#545454' }}>Fetching Passenger Types...</Text>
                                        </>
                                    ) : (
                                        <>
                                            {passengerType?.filter((t) => t.name != 'Infant' && t.name != 'Passes')
                                                .map((type) => (
                                                <TouchableOpacity onPress={() => {updatePassenger(p.seatNumber!, 'passType', type.name), updatePassenger(p.seatNumber!, 'passType_id', type.id), getPassengerFare(type.id, p.accommodationID!, p.seatNumber!), updatePassenger(p.seatNumber!, 'passTypeCode', type.code)}}
                                                key={type.id} style={{ backgroundColor: p.passType == type.name ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 18, borderRadius: 5  }}>
                                                    <Text style={{ textAlign: 'center', fontSize: 12, color: p.passType == type.name ? '#fff' : '#cf2a3a' }}>{type.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )}

                                </View>
                            </View>
                        )}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Full Name:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                <TextInput value={p.name ?? ''} onChangeText={(text) => onFieldInput(index, p.seatNumber, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13, fontWeight: '600' }} />
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput onChangeText={(text) => onFieldInput(index, p.seatNumber, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 13, fontWeight: '600' }} />
                                </View>
                            </View>
                            <View style={{ width: '56%', }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
                                <View style={{ flexDirection:'row', gap: 5 }}>
                                    {passGender.map((gender) => (
                                        <TouchableOpacity onPress={() => onFieldInput(index, p.seatNumber, 'gender', gender)} key={gender} style={{ backgroundColor: p.gender == gender ? '#cf2a3a' : 'transparent', borderColor: '#cf2a3a', borderWidth: 1, width: '50%', borderRadius: 5, justifyContent :'center', paddingVertical: 8 }}>
                                            <Text style={{ textAlign: 'center', fontSize: 14, color: p.gender == gender ? '#fff' : '#cf2a3a' }}>{gender}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8 }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Nationality:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput onChangeText={(text) => onFieldInput(index, p.seatNumber, 'nationality', text)} defaultValue='Filipino' style={{ fontSize: 13, fontWeight: '600' }} />
                                </View>
                            </View>
                            <View style={{ width: '57.5%' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Address:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput onChangeText={(text) => onFieldInput(index, p.seatNumber, 'address', text)} placeholder='Address' style={{ fontSize: 13, fontWeight: '600' }} />
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <View style={{ width: '40%' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Contact#:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput placeholder='+63' onChangeText={(text) => onFieldInput(index, p.seatNumber, 'contact', text)} style={{ fontSize: 13, fontWeight:'600' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => hasInfantChecker(p.seatNumber!, index, p.hasInfant!, passengerType?.find((i) => i.name == 'Infant')?.id ?? 0 )}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                    <Checkbox status={p.hasInfant ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                    <Text style={{ fontSize: 13 }}>Infant</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => hasCargoChecker(p.seatNumber!, index )}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                    <Checkbox status={p.hasCargo ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                    <Text style={{ fontSize: 13 }}>Cargo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {p.hasCargo == true && (
                            <View style={{ marginTop: 25 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#cf2a3a', marginBottom: 5 }}>Cargo Details</Text>
                                    <TouchableOpacity onPress={() => {
                                        const hasPasses = passengers.some(p => p.passType == 'Passes');
                                                if(!hasPasses) {
                                                    addPaxCargo(p.seatNumber!, { cargoFare: '' })
                                                }else {
                                                    addPaxCargo(p.seatNumber!, { cargoFare: '' })
                                                } 
                                            }}
                                        style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={{ color: '#fff', fontWeight: 600 }}>Add Cargo</Text>
                                        <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                    </TouchableOpacity>
                                </View>
                                
                                {p.cargo.map((c, cargoIndex) => (
                                    <View key={`${p.seatNumber}-${index}`}>
                                        {index != 0 && (
                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, alignSelf: 'flex-end' }}>
                                                <Ionicons name={'close'} size={20} color={'#cf2a3a'} />
                                            </TouchableOpacity>
                                        )}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5 }}>
                                            <View style={{ flexDirection: 'column', alignSelf: 'flex-start' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                                <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                                    <Text style={{ fontSize: 16 }}>₱ </Text>
                                                    <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 16 }}>
                                                        {ComputedCargoAmount(c).amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Text>
                                                </View>
                                            </View>
                                            {c.cargoType && c.cargoType != 'Rolling Cargo' && (
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Quantity:</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: '#B3B3B3', paddingHorizontal: 5, borderWidth: 1, borderRadius: 5 }}>
                                                        <TouchableOpacity disabled={c.quantity == 1} onPress={() => handleCargoQuantity('minus', cargoIndex, p.seatNumber, index)} style={{ paddingRight: 5 }}>
                                                            <Ionicons name={'remove'} size={18} color={c.quantity == 1 && "#d4d4d4ff"} />
                                                        </TouchableOpacity>
                                                        <Text style={{ paddingHorizontal: 14, fontWeight: 'bold', borderRightColor: '#B3B3B3', borderLeftColor: '#B3B3B3', borderLeftWidth: 1, borderRightWidth: 1, paddingVertical: 5 }}>
                                                            {c.quantity}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => handleCargoQuantity('add', cargoIndex, p.seatNumber, index)} style={{ paddingLeft: 5 }}>
                                                            <Ionicons name={'add'} size={18}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ width: '100%' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Cargo Type:</Text>
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <Dropdown onChange={(item) => {updateCargo( p.seatNumber ?? null, index, cargoIndex, 'cargoType', item.label), updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoTypeID', item.value)}} 
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
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoBrand', item.label), updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoBrandID', item.value)}} value={c.cargoBrandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))} labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Specifications:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                            <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoSpecification', item.label),  updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoSpecificationID', item.value)}} value={c.cargoSpecificationID} data={cargoProperties.data.specifications.map((specs: any) => ({ label: specs.cc, value: specs.id }))} labelField="label" valueField="value" placeholder="Select CC" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Plate#:</Text>
                                                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                            <TextInput value={c.cargoPlateNo} onChangeText={(text) => updateCargo(p.seatNumber ?? null, index, cargoIndex, 'cargoPlateNo', text)} placeholder='Plate#' style={{ fontSize: 13 }} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : c.cargoType == 'Parcel' ? (
                                            <View style={{ marginTop: 5 }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Parcel Category:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, index, cargoIndex, 'parcelCategory', item.label), updateCargo(p.seatNumber ?? null, index, cargoIndex, 'parcelCategoryID', item.value)}} 
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

                        {p.hasInfant && (
                            <>
                                <TouchableOpacity onPress={() => {
                                    const hasPasses = passengers.some(p => p.passType == 'Passes');
                                    if(!hasPasses) {
                                        addInfant(p.seatNumber!, {name: '', gender: '', age: 0, passType_id: passengerType?.find((i) => i.name == 'Infant')?.id! })
                                    }else {
                                        addInfant(index, {name: '', gender: '', age: 0, passType_id: passengerType?.find((i) => i.name == 'Infant')?.id! })
                                    } 
                                }}
                                    style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, alignSelf: 'flex-end', marginTop: 10, marginBottom: -15, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: 600 }}>Add Infant</Text>
                                    <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                </TouchableOpacity>
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
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'name', text)} placeholder='Last Name, First Name' style={{ fontSize: 13, fontWeight: '600' }} />
                                            </View>
                                        </View>
                                        <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                            <View style={{ width: '40%' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Age:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <TextInput onChangeText={(text) => updateInfant(p.seatNumber!, index, 'age', Number(text))} keyboardType='numeric' placeholder='Age' style={{ fontSize: 13, fontWeight: '600' }} />
                                                </View>
                                            </View>
                                            <View style={{ width: '56%', }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Gender:</Text>
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
                            </>
                        )}
                    </View>
                ))}
            </View>

        </View>
    )
}