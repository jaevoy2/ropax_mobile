import { AddCategory } from '@/api/addCategory';
import { FetchCategories } from '@/api/fetchCategories';
import { SaveExpenses } from '@/api/saveExpenses';
import { FetchTrips } from '@/api/trips';
import { useExpense } from '@/context/expense';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');
const TEMP_DIR = FileSystem.cacheDirectory + 'expensesImages/';

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
    const [permission, requestPermission] = useCameraPermissions();
    const { expenses, setExpenses, updateExpense } = useExpense();
    const [trips, setTrips] = useState<TripProps[] | null>(null);
    const [categories, setCategories] = useState<CategoryProps[]>([])
    const [date, setDate] = useState('');
    const [screenLoading, setScreenLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [saveExpenseSpinner, setSaveExpenseSpinner] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(0);
    const [modal, setModal] = useState(false);
    const [addedCategory, setAddedCategory] = useState('');
    const [saveCategotySpinner, setCategorySpinner] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>('back');
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const cameraRef = useRef<CameraView>(null)
    const [onCapture, setOnCapture] = useState(false)
    const [expenseID, setExpenseID] = useState(0);


    const handleOnCapture = async (expenseId: number) => {
        if(!permission.granted) {
            permissionView()
        }

        setExpenseID(expenseId)
        setOnCapture(true);
    }
    
    const permissionView = () => {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 20 }}>
                <Text>
                    We need access to your camera.
                </Text>
                <TouchableOpacity style={{ backgroundColor: '#3B82F6',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 12,
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4, }} onPress={requestPermission}>
                    <Text style={{ color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: '600', }}>Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const renderCameraCaptureView = () => {
        if(!onCapture) return null;

        return (
            <View style={{ flex: 1, position: 'relative' }}>
                {capturedImage != null ? (
                    <View>
                        <Image source={{ uri: capturedImage }} style={{ height: '100%', width: '100%' }} />
                    </View>
                ) : (
                    <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing='back' />
                )}
                <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20, zIndex: 5, backgroundColor: '#fff', padding: 8, borderRadius: 50 }} onPress={() => setOnCapture(false)}>
                    <Ionicons name={'arrow-back'} size={25} color="#cf2a3a" />
                </TouchableOpacity>
                
                <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', height: 160, width: '100%', position: 'absolute', bottom: 0, zIndex: 5, justifyContent: 'center' }}>
                    {capturedImage != null ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setCapturedImage(null)} style={{ backgroundColor: '#cf2a3a', padding: 12, borderRadius: 50 }}>
                                <Ionicons name={'trash'} size={28} color={'#fff'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {handleOnSaveImage(), setOnCapture(false)}} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 50 }}>
                                <Ionicons name={'checkmark'} size={28} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => handleCaptureImage()} style={{ alignSelf: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 50 }}>
                            <Ionicons name={'camera'} color={'#cf2a3a'} size={40} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    const handleCaptureImage = async () => {
        if(cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    skipProcessing: true,
                    base64: false
                });

                setCapturedImage(photo.uri)
            }catch (error) {
                Alert.alert('Error', 'Failed to capture image.');
            }
        }
    }

    const handleOnSaveImage = async () => {
        if (!capturedImage) return;

        const filename = `expense_${expenseID}-${Date.now()}.jpg`;
        const path = TEMP_DIR + filename;

        await FileSystem.moveAsync({
            from: capturedImage,
            to: path
        });

        updateExpense(expenseID, 'image_uri', path);
        setCapturedImage(null)
    }

    const expenseImgTempDir = async () => {
        const dir = await FileSystem.getInfoAsync(TEMP_DIR);

        if(!dir.exists) {
            await FileSystem.makeDirectoryAsync(TEMP_DIR, { intermediates: true })
        }
    }

    useEffect(() => {
        handleFetchCategories();
        expenseImgTempDir();

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
        return (categories || []).map((c) => ({
            label: c.name,
            id: c.categoryID
        }));
    }, [categories]);

    const tripDropdown = useMemo(() => {
        if(trips && trips.length > 0) {
            return trips.map((t) => ({
                label: `${t.code} ${t.departure} [${t.vessel}]`,
                id: t.trip_id
            }))
        }
    }, [trips])

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
            setCategorySpinner(false);
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

    const addExpenseForm = () => {
        setExpenses(prev => {
            const lastID = prev[prev.length - 1].id;
            return [...prev, { id: lastID + 1, trip_schedule_id: 0, description: '', amount: 0, expense_category_id: 0 }]
        })
    }

    const removeExpenseForm = (formID: number) => {
        const remainingForm = expenses.filter((e) => e.id != formID);
        setExpenses(remainingForm);
    }

    const handleSaveExpense = async () => {
        setSaveExpenseSpinner(true);
        const hasEmpty = expenses.find((e) => 
            !e.amount || !e.description.trim() || !e.expense_category_id || !e.trip_schedule_id
        )
        
        if(hasEmpty) {
            setSaveExpenseSpinner(false);
            Alert.alert('Invalid', 'Failed to save expense. Please fill out all required fields.');
            return;
        }
        
        try {
            const response = await SaveExpenses(expenses);

            if(!response.error) {
                Alert.alert('Success', response.success, [{
                    text: 'OK',
                    onPress:() => router.back()
                }]);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setSaveExpenseSpinner(false);
        }
    }

    const handleTripSelect = (tripID: number) => {
        setSelectedTrip(tripID);

        setExpenses(prev => 
            prev.map(e => ({
                ...e, trip_schedule_id: tripID
            }))
        )
    }

    if(onCapture == true) {
        return renderCameraCaptureView();
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


            <TouchableOpacity onPress={() => [ setExpenses([]), router.back() ]} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Add Daily Expense</Text>
            </View>
            <View style={{ padding: 10, marginTop: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 12 }}>Date:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 15, fontWeight: '900' }}>{date}</Text>
                    </View>
                    <TouchableOpacity disabled={trips && trips.length == 0} onPress={addExpenseForm} style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', paddingHorizontal: 15, paddingVertical: 8, backgroundColor: trips?.length == 0 ? '#d8727c' : '#cf2a3a', justifyContent: 'center', marginBottom: 15, borderRadius: 5 }}>
                        <Ionicons name='add' size={20} color={'#fff'} />
                        <Text style={{ fontWeight: 'bold', color: '#fff' }}>Add</Text>
                    </TouchableOpacity>
                </View>

                {trips && trips.length == 0 ? (
                    <View style={{ height: height / 2, justifyContent: 'center' }}>
                        <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Trip Available To Add Expense</Text>
                    </View>
                ) : (
                    <>
                        <View>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Trip Schedules:</Text>
                            <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                                <Dropdown onChange={item => handleTripSelect(item.id)} value={selectedTrip || undefined} data={tripDropdown} labelField="label" valueField="id" placeholder="Select Trip Schedule" 
                                    style={{ height: 40, width: '100%', paddingHorizontal: 10 }}
                                    containerStyle={{
                                        alignSelf: 'flex-start',
                                        width: '94%',
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
                        <View style={{ flex: 1, flexGrow: 1, marginTop: 10 }}>
                            <View style={{ minHeight: height - 350, maxHeight: height - 300 }}>
                                <ScrollView style={{ maxHeight: height - 300 }} contentContainerStyle={{ minHeight: height - 350 }}>
                                    {expenses.map((e) => (
                                        <View key={e.id} style={{ padding: 10, marginTop: 15, borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 8, backgroundColor: '#fff' }}>
                                            {e.id !== 1 && (
                                                <TouchableOpacity onPress={() => removeExpenseForm(e.id)}  style={{ alignSelf: 'flex-end' }} >
                                                    <Ionicons name={'close'} size={25} color={'#cf2a3a'}/>
                                                </TouchableOpacity>
                                            )}
                                            <View>
                                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Description</Text>
                                                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                                                    <TextInput onChangeText={(text) => updateExpense(e.id, 'description', text)} placeholder='e.g. Vessel Oil' style={{ fontSize: 13 }} />
                                                </View>
                                            </View>
                                            <View style={{ marginTop: 5, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                                                <View style={{ width: '25%' }}>
                                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Amount:</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }}>
                                                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: -5 }}>₱</Text>
                                                        <TextInput onChangeText={(text) => updateExpense(e.id, 'amount', Number(text))} keyboardType='numeric' placeholder='00.00' style={{ fontSize: 13, textAlign: 'right', }} />
                                                    </View>
                                                </View>
                                                <View style={{ width: '72.5%' }}>
                                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Category</Text>
                                                    <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Dropdown onChange={item => updateExpense(e.id, 'expense_category_id', item.id)} value={e.expense_category_id || undefined} data={dropdownCategory} labelField="label" valueField="id" placeholder="Select Category" 
                                                            style={{ height: 40, width: '80%', paddingHorizontal: 10 }}
                                                            containerStyle={{
                                                                alignSelf: 'flex-start',
                                                                width: '53%',
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
                                                        <TouchableOpacity onPress={() => setModal(true)} style={{ borderLeftColor: '#B3B3B3', borderLeftWidth: 1, height: '100%', padding: 8 }} >
                                                            <Ionicons name='add' size={20}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ marginTop: 5 }}>
                                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#545454' }}>Image</Text>
                                                <TouchableOpacity onPress={() => handleOnCapture(e.id)} style={{ borderColor: '#b3b3b3', borderWidth: 1, borderRadius: 5, height: 60, justifyContent: 'center', position: 'relative' }}>
                                                    {e.image_uri == null ? (
                                                        <View style={{ backgroundColor: '#f8f8f8', borderRadius: 5, height: '100%', justifyContent: 'center' }}>
                                                            <Text style={{ textAlign: 'center', color: '#a3a3a3' }}>Tap to capture image.</Text>
                                                        </View>
                                                    ) : (
                                                        <>
                                                            <Image source={{ uri: e.image_uri }} resizeMode={'cover'} style={{ width: '90%', height: '95%', alignSelf: 'center' }} />
                                                            <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 10 }} />
                                                            <LinearGradient
                                                                colors={[
                                                                'rgba(0, 200, 83, 0)',
                                                                'rgba(2, 224, 95, 0.15)',
                                                                'rgba(1, 226, 95, 0.4)',
                                                                'rgba(3, 226, 96, 0.8)',
                                                                ]}
                                                                style={{ flex: 1, height: 40, position: 'absolute', width: '100%', bottom: 0, zIndex: 2 }}
                                                            />
                                                        </>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </>
                )}
            </View>
            
            <TouchableOpacity disabled={saveExpenseSpinner || trips?.length == 0} onPress={handleSaveExpense} style={{ width: '95%', paddingVertical: 13, borderRadius: 60, position: 'absolute', bottom: 0, backgroundColor: trips?.length == 0 ? '#d8727c' : '#cf2a3a', transform: [{ translateX: '-50%' }], left: '50%' }}>
                {saveExpenseSpinner == true ? (
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                ) : (
                    <Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center', fontSize: 18 }}>Save</Text>
                )}
            </TouchableOpacity>
        </View>
    )
}