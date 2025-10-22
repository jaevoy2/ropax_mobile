import { AddCategory } from '@/api/addCategory';
import { FetchCategories } from '@/api/fetchCategories';
import { FetchTrips } from '@/api/trips';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const { height, width } = Dimensions.get('window');

type TripProps = {
    trip_id: number;
    vessel: string;
    route_origin: string;
    route_destination: string;
    departure: string;
    route_id: number;
    code: string;
    web_code: string;
}

type CategoryProps = {
    categoryID: number;
    name: string;
}


export default function AddExpenses() {
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [categories, setCategories] = useState<CategoryProps[]>([])
    const [date, setDate] = useState('');
    const [screenLoading, setScreenLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(0);
    const [modal, setModal] = useState(false);
    const [addedCategory, setAddedCategory] = useState('');
    const [saveCategotySpinner, setCategorySpinner] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        handleFetchCategories();

        const getDate = new Date();
        const today = getDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        const date = new Date(today);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const formattedDate = date.toLocaleDateString('en-US', options);
        handleFetchTrips(today);
        setDate(formattedDate);
    }, []);

    const handleFetchTrips = async (queryDate: string) => {
        try {
            const tripsFetch = await FetchTrips(queryDate);

            if(tripsFetch) {
                const tripsData: TripProps[] = tripsFetch.data.map((t: any) => ({
                    trip_id: t.id,
                    vessel: t.trip.vessel.name,
                    route_origin: t.trip.route.origin,
                    route_destination: t.trip.route.destination,
                    vessel_id: t.trip.vessel_id,
                    route_id: t.trip.route_id,
                    code: t.trip.route.mobile_code,
                    web_code: t.trip.route.web_code,
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
            setContentLoading(false);
        }
    }

    const dropdownCategory = useMemo(() => {
        return categories.map((c) => ({
            label: c.name,
            id: c.categoryID
        }));
    }, [categories]);

    const handleFetchCategories = async () => {
        try {
            const response = await FetchCategories();

            if(!response.error) {
                const categories: CategoryProps[] = response.categories.map((c: any) => ({
                    categoryID: c.id,
                    name: c.name
                }))

                setCategories(categories);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }
    }

    const handleAddCategory = async () => {
        setCategorySpinner(true);

        if(!addedCategory){
            Alert.alert('Error', 'No category added');
            return;
        }
        
        try {
            const addCategory = await AddCategory(addedCategory);
            
            if(!addCategory.error) {
                setCategories(prev => [...prev, { categoryID: addCategory.id, name: addedCategory } ])
                Alert.alert('Succuss', addCategory.success);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally {
            setCategorySpinner(false);
            setModal(false);
        }
    }

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height, }}>
            {/* add category modal */}
            <Modal visible={modal} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 5, width: width - 40, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'space-between', padding: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Add Category</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                            <TextInput onChangeText={(text) => setAddedCategory(text)} placeholder='e.g. Consumable' style={{ fontSize: 13 }} />
                        </View>
                        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: 20, gap: 10 }}>
                            <TouchableOpacity onPress={() => setModal(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            {saveCategotySpinner ? (
                                <ActivityIndicator size="small" color="#cf2a3a" style={{ marginRight: 10 }} />
                            ) : (
                                <TouchableOpacity onPress={handleAddCategory} disabled={saveCategotySpinner}>
                                    <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Save</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>


            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Add Expense</Text>
            </View>
            <View style={{ padding: 10, marginTop: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 12 }}>Date:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 15, fontWeight: '900' }}>{date}</Text>
                    </View>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#cf2a3a', justifyContent: 'center', marginBottom: 15, borderRadius: 5 }}>
                        <Ionicons name='add' size={20} color={'#fff'} />
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Add</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 10, borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 8 }}>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Description</Text>
                        <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                            <TextInput placeholder='e.g. Vessel Oil' style={{ fontSize: 13 }} />
                        </View>
                    </View>
                    <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                        <View style={{ width: '25%' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: -5 }}>₱</Text>
                                <TextInput keyboardType='numeric' placeholder='00.00' style={{ fontSize: 13, textAlign: 'right', }} />
                            </View>
                        </View>
                        <View style={{ width: '72.5%' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Category</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Dropdown onChange={item => setSelectedCategory(item.value)} value={selectedCategory} data={dropdownCategory} labelField="label" valueField="value" placeholder="Select Category" style={{ height: 40, width: '80%', paddingHorizontal: 10 }}
                                    containerStyle={{
                                        alignSelf: 'flex-start',
                                        width: '53%',
                                    }}
                                    selectedTextStyle={{ fontWeight: '500', fontSize: 14, lineHeight: 40, }}
                                    renderRightIcon={() => (
                                        <Ionicons name="chevron-down" size={15} />
                                    )}
                                    dropdownPosition="bottom"
                                    renderItem={(item) => (
                                        <View style={{ width: '80%', padding: 10 }}>
                                        <Text>{item.label}</Text>
                                        </View>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setModal(true)} style={{ borderLeftColor: '#B3B3B3', borderLeftWidth: 1, height: '100%', padding: 8 }} >
                                    <Ionicons name='add' size={20}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 15, marginBottom: 5 }}>
                        {trips?.map((t) => (
                            <TouchableOpacity onPress={() => setSelectedTrip(t.trip_id)} key={t.trip_id} style={{ backgroundColor: selectedTrip == t.trip_id ? '#cf2a3a' : 'transparent', borderColor: selectedTrip == t.trip_id ? 'transparent' : '#cf2a3a', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 5, borderRadius: 5  }}>
                                <View>
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: selectedTrip  == t.trip_id ? '#fff' : '#cf2a3a' }}>{`${t.departure}`}</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: selectedTrip == t.trip_id ? '#fff' : '#cf2a3a' }}>{`${t.route_origin} > ${t.route_destination} [ ${t.vessel} ]`}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
            
            <TouchableOpacity style={{ width: '95%', paddingVertical: 10, borderRadius: 60, }}>
                <Text style={{ fontWeight: 'bold', color: '#fff' }}>Save</Text>
            </TouchableOpacity>
        </View>
    )
}