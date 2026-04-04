import { useCargo } from '@/context/cargoProps';
import { useTrip } from '@/context/trip';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';


export default function AddPaxCargo() {
    const { vessel, routeID, origin, destination, setTotalFare } = useTrip()
    const { cargoProperties, paxCargoProperty, setPaxCargoProperties, updatePaxCargoProperty } = useCargo();
    const [saveCargoLoading, setSaveCargoloading] = useState(false)
    const { departureTime } = useLocalSearchParams();






    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, paddingTop: 50 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name={'arrow-back'} size={30} color={'#fff'} />
                    </Pressable>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Add Passenger Cargo</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '70%', padding: 20 }}>
                <Ionicons name={'boat'} color={'#fff'} size={26} style={{ backgroundColor: '#cf2a3a', padding: 5, borderRadius: 50 }} />
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ color: '#747373ff', fontSize: 11 }}>{`${origin} > ${destination} | ${departureTime}`}</Text>
                    <Text style={{ color: '#cf2a3a', fontSize: 15, fontWeight: '900', marginTop: -5, width: '90%' }}>{vessel}</Text>
                </View>
            </View>

            {paxCargoProperty.length > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 8, alignSelf: 'flex-end', paddingHorizontal: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: '#545454', fontSize: 14 }}>Total Amount:</Text>
                    <View style={{ borderBottomColor: '#cf2a3a', borderBottomWidth: 2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                        <Text style={{ fontSize: 17, color: '#cf2a3a', fontWeight: 'bold' }}>₱ </Text>
                        <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 17, color: '#cf2a3a' }}>
                            {/* {getTotalAmount.toFixed ? getTotalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2,  maximumFractionDigits: 2 }) : '0.00'} */}
                        </Text>
                    </View>
                </View>
            )}

            <KeyboardAvoidingView style={{ paddingBottom: 100 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }} nestedScrollEnabled={true}>
                    {paxCargoProperty?.map((c: any) => (
                        <View key={c.id} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 10, elevation: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                    <View style={{ borderColor: '#FFC107', backgroundColor: '#ffc10727', borderWidth: 2, borderRadius: 5, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
                                        <Text style={{ fontSize: 16 }}>₱ </Text>
                                        <Text style={{ fontWeight: 'bold', textAlign: 'right', fontSize: 16 }}>
                                            {/* {ComputedCargoAmount(c)?.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                                        </Text>
                                    </View>
                                </View>
                                {c.cargoType && c.cargoType != 'Rolling Cargo' && (
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Quantity:</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: '#B3B3B3', paddingHorizontal: 5, borderWidth: 1, borderRadius: 5 }}>
                                            <TouchableOpacity disabled={c.quantity == 1} style={{ paddingRight: 5 }}>
                                                <Ionicons name={'remove'} size={18} color={c.quantity == 1 && "#d4d4d4ff"} />
                                            </TouchableOpacity>
                                            <Text style={{ paddingHorizontal: 14, fontWeight: 'bold', borderRightColor: '#B3B3B3', borderLeftColor: '#B3B3B3', borderLeftWidth: 1, borderRightWidth: 1, paddingVertical: 5 }}>
                                                {c.quantity}
                                            </Text>
                                            <TouchableOpacity style={{ paddingLeft: 5 }}>
                                                <Ionicons name={'add'} size={18}/>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Cargo Type:</Text>
                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                    <Dropdown onChange={(item) => {updatePaxCargoProperty(c.id, 'cargoType', item.label), updatePaxCargoProperty(c.id, 'cargoTypeID', item.value)}} 
                                        value={c.cargoTypeID} data={cargoProperties?.data.cargo_types?.map((type: any) => ({ label: type.name, value: type.id }))} labelField="label" valueField="value" placeholder="Select Cargo Type" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                            <View key={item.value} style={{ width: '80%', padding: 8 }}>
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
                                                    <Dropdown onChange={(item) => {updatePaxCargoProperty(c.id, 'cargoBrand', item.label), updatePaxCargoProperty(c.id, 'cargoBrandID', item.value)}} 
                                                        value={c.cargoBrandID} data={cargoProperties?.data.brands.map((b: any) => ({ label: b.name, value: b.id }))} labelField="label" valueField="value" placeholder="Select Brand" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                            <View key={item.value} style={{ width: '80%', padding: 8 }}>
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
                                                        <Dropdown onChange={(item) => {updatePaxCargoProperty(c.id, 'cargoSpecification', String(item.label)), updatePaxCargoProperty(c.id, 'cargoSpecificationID', item.value)}} 
                                                            value={c.cargoSpecificationID} data={cargoProperties.data.cargo_options?.filter(opt => opt.specification).map((s: any) => ({ label: String(s.specification), value: s.id }))} labelField="label" valueField="value" placeholder="Select CC" style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
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
                                                                <View key={item.value} style={{ width: '80%', padding: 8 }}>
                                                                    <Text>{item.label}</Text>
                                                                </View>
                                                            )}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={{ width: '48%' }}>
                                                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Plate#:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, paddingVertical: 1 }}>
                                                        <TextInput onChangeText={(text) => updatePaxCargoProperty(c.id, 'cargoPlateNo', text)} placeholder='Plate#' style={{ fontSize: 13 }} />
                                                    </View>
                                                </View>
                                            </View>
                                        </>
                                    ) : c?.cargoType == 'Parcel' ? (
                                        <View style={{ marginTop: 5 }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Parcel Category:</Text>
                                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                <Dropdown onChange={(item) => {updatePaxCargoProperty(c.id, 'parcelCategory', item.label), updatePaxCargoProperty(c.id, 'parcelCategoryID', item.value)}} 
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
                                                        <View key={item.value} style={{ width: '80%', padding: 8 }}>
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
                    <TouchableOpacity disabled={saveCargoLoading} style={{ backgroundColor: '#cf2a3a', width: '100%', alignSelf: 'center', borderRadius: 8, paddingVertical: 15, marginTop: 30 }}>
                        {saveCargoLoading == true ? (
                            <ActivityIndicator size='small' color={'#fff'} />
                        ) : (
                            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Proceed</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}