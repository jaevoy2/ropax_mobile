import { FetchFares } from '@/api/fares';
import { FetchPassengerType } from '@/api/passengerType';
import { useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
    const { vessel_id, destination, origin, totalFare, departure_time, vessel, setTotalFare } = useTrip();
    const { passengers, setPassengers, updatePassenger, updateInfant, updateCargo } = usePassengers();
    const [typeLoading, setTypeLoading] = useState(true);
    const { cargoProperties, setCargoProperties } = useCargo();

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

                if(!target) return;

                const isHasInfant = !p.hasInfant;
                return {
                    ...p, hasInfant: isHasInfant, infant: isHasInfant ? p.infant ?? [] : []
                }
            })
        )

    }

    const hasCargoChecker = (seat: number | string, passIndex: number) => {
        const hasPasses = passengers.some((p) => p.passType == 'Passes');

        setPassengers(prev => 
            prev.map((p, index) => {
                const target = !hasPasses ?
                p.seatNumber == seat :
                index == passIndex;

                if(!target) return;
                
                const isHasCargo = !p.hasCargo;

                return {
                    ...p, hasCargo: isHasCargo, cargo: isHasCargo ? p.cargo ?? [] : []
                }
            })
        )
    }

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

    // const handlePassesRemove = (passIndex: number) => {

    // }

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
                                    <TextInput onChangeText={(text) => onFareInput(index, p.seatNumber, text)} value={String(p.fare ?? '')} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold', textAlign: 'right' }} />
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
                            <TouchableOpacity onPress={() => hasInfantChecker(p.seatNumber!, index, p.hasInfant!, passengerType?.find((i) => i.name == 'Infant')?.id ?? 0 )}
                                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                <Text style={{ fontSize: 13 }}>With Infant</Text>
                                <Checkbox status={p.hasInfant ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => hasCargoChecker(p.seatNumber!, index )}
                                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                                <Text style={{ fontSize: 13 }}>With Cargo</Text>
                                <Checkbox status={p.hasCargo ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                            </TouchableOpacity>
                        </View>

                        {p.hasCargo == true && (
                            <View style={{ marginTop: 25 }}>
                                <TouchableOpacity onPress={() => {
                                    const hasPasses = passengers.some(p => p.passType == 'Passes');
                                            if(!hasPasses) {
                                                addPaxCargo(p.seatNumber!, { cargoFare: '' })
                                            }else {
                                                addPaxCargo(p.seatNumber!, { cargoFare: '' })
                                            } 
                                        }}
                                    style={{ backgroundColor: '#cf2a3a', borderColor: '#cf2a3a', borderWidth: 1, padding: 5, borderRadius: 5, alignSelf: 'flex-end', marginTop: 10, marginBottom: -15, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: 600 }}>Add Cargo</Text>
                                    <Ionicons name={'add-circle'} size={20} color={'#fff'} />
                                </TouchableOpacity>
                                
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#cf2a3a', marginBottom: 5 }}>Cargo Details</Text>
                                {p.cargo.map((c, index) => (
                                    <View key={`${p.name}-${index}`}>
                                        {index != 0 && (
                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, alignSelf: 'flex-end' }}>
                                                <Ionicons name={'close'} size={20} color={'#cf2a3a'} />
                                                <Text style={{ color: '#cf2a3a', fontWeight: '600', fontSize: 13 }}>Remove</Text>
                                            </TouchableOpacity>
                                        )}
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ width: '70%' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Cargo Type:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <Dropdown onChange={(item) => {updateCargo( p.seatNumber ?? null, 0, 'cargoType', item.label), updateCargo(p.seatNumber ?? null, 0, 'cargoTypeID', item.value)}} value={c.cargoTypeID} data={cargoProperties?.data.cargo_types.map((type: any) => ({ label: type.name, value: type.id })) } labelField="label" valueField="value" placeholder="Select Cargo Type" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                                        containerStyle={{
                                                            alignSelf: 'flex-start',
                                                            width: '63%',
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
                                            <View style={{ flexDirection: 'column', alignSelf: 'flex-end' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Cargo Amount:</Text>
                                                <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, width: 90 }}>
                                                    <Text style={{ fontSize: 16 }}>₱</Text>
                                                    <TextInput value={String(c.cargoFare)} onChangeText={(text) => updateCargo(p.seatNumber ?? null, 0, 'cargoFare', text)} editable={false} keyboardType={'numeric'} placeholder='00.00' style={{ fontWeight: 'bold', textAlign: 'right' }} />
                                                </View>
                                            </View>
                                        </View>
                                        {c.cargoType == 'Rolling Cargo' ? (
                                            <View>
                                                <View style={{ width: '100%' }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Brand:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                        <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, 0, 'brand', item.value)}} value={c.brandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))} labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                            <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, 0, 'specification', item.label),  updateCargo(p.seatNumber ?? null, 0, 'specificationID', item.value)}} value={c.specificationID} data={cargoProperties.data.specifications.map((specs: any) => ({ label: specs.cc, value: specs.id }))} labelField="label" valueField="value" placeholder="Select CC" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                            <TextInput value={c.plateNo} onChangeText={(text) => updateCargo(p.seatNumber ?? null, 0, 'plateNo', text)} placeholder='Plate#' style={{ fontSize: 13 }} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        ) : c.cargoType == 'Parcel' ? (
                                            <View style={{ marginTop: 5 }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Parcel Category:</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <Dropdown onChange={(item) => {updateCargo(p.seatNumber ?? null, 0, 'parcelCategory', item.label), updateCargo(p.seatNumber ?? null, 0, 'parcelCategoryID', item.value)}} value={c.parcelCategoryID} data={cargoProperties?.data.parcel_categories.map((category: any) => ({ label: category.name, value: category.id })) } labelField="label" valueField="value" placeholder="Select Category" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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