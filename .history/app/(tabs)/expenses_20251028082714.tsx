import { FetchExpenses } from "@/api/expenses";
import { useExpense } from "@/context/expense";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

type ExpenseProps = {
    id: number;
    tripSchedID: number;
    trip: string;
    description: string;
    amount: string;
    date: string;
    category: {
        id: number;
        name: string;
        created_at?: string;
        updated_at?: string;
    }
}


const { height } = Dimensions.get('screen');

export default function Expenses() {
    const { setExpenses } = useExpense();
    const [fetchedExpenses, setFetchedExpenses] = useState<ExpenseProps[]>([]);
    const [calendar, setCalendar] = useState(false);
    const [totalAmount, setTotalAmount] = useState('');
    const [contentLoading, setContentLoading] = useState(false);
    const [date, setDate] = useState('');
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
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
        const monthName = getDate.toLocaleString('en-US', { month: 'long', timeZone: 'Asia/Manila' });
        const year = getDate.getFullYear();
        const fulldate = `${formattedDate}`;

        setDate(fulldate);
        fetchExpenses(monthName, String(year))
    }, []);


    const fetchExpenses = async (monthName: string, year: string, fullDate?: string) => {
        try {
            setContentLoading(true);
            const expensesfetch = await FetchExpenses(monthName, year, fullDate ?? '');
    
            if(expensesfetch) {
                const expense: ExpenseProps[] = expensesfetch.expenses.map((e: any) => ({
                    id: e.id,
                    tripSchedID: e.trip_schedule_id,
                    trip: `${e.trip_schedule.trip.route.mobile_code} ${e.trip_schedule.trip.vessel.name}`,
                    description: e.description,
                    amount: String(e.amount),
                    date: new Date(e.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'Asia/Manila'
                    }),
                    category: e.category
                }));
    
                setTotalAmount(expensesfetch.totalAmount)
                setFetchedExpenses(expense);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message)
        }finally{
            setContentLoading(false);
        }
    }

    const handleRefresh = () => {
        setRefresh(true);
        
        setTimeout(() => {
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
            const monthName = getDate.toLocaleString('en-US', { month: 'long', timeZone: 'Asia/Manila' });
            const year = getDate.getFullYear();
            const fulldate = `${formattedDate}`;
    
            setDate(fulldate);
            fetchExpenses(monthName, String(year))
            setRefresh(false);
        }, 500);
    }

    const addExpenses = () => {
        setExpenses([]);
        setExpenses(prev => [...prev, { id: 1, trip_schedule_id: 0, description: '', amount: 0, expense_category_id: 0 }]);
        router.push('/addExpenses');
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingLeft: 20, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Daily Expenses</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={addExpenses}>
                        <Ionicons name="add" size={35} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <>
            {contentLoading ? (
                <View style={{ height: height / 2, justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#cf2a3a'} />
                </View>
            ) : (
                <View style={{ paddingBottom: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#cf2a3b18', borderBottomColor: '#CF2A3A', borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 15 }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 10 }}>Date:</Text>
                            <Text style={{ color: '#CF2A3A', fontSize: 15, fontWeight: '900' }}>{date}</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10 }}>Total Expenses:</Text>
                            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#cf2a3a', marginTop: -1 }}>₱</Text>
                                <Text style={{ fontSize: 15, color: '#cf2a3a', fontWeight: '900' }}>
                                    {totalAmount ?? '00.00'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: height - 215 }}>
                        {fetchedExpenses.length > 0 ? (
                            <ScrollView refreshControl={ <RefreshControl refreshing={refresh} onRefresh={handleRefresh} colors={['#cf2a3a']} /> }>
                                {fetchedExpenses.map((e) => (
                                    <TouchableOpacity key={e.id} style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#fff', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={{ fontWeight: '900', fontSize: 15 , color: '#cf2a3a' }}>{e.description}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#9B9B9B' }}>{e.trip}</Text>
                                                <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#9B9B9B' }}>  |  </Text>
                                                <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#9B9B9B' }}>{e.category.name}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 19, color: '#FF636D', marginTop: -1 }}>₱</Text>
                                            <Text style={{ fontSize: 18, color: '#FF636D' }}>
                                                {e.amount}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            ) : (
                                <View style={{ height: height / 2, justifyContent: 'center' }}>
                                    <Text style={{ color: '#7A7A85', textAlign: 'center' }}>No Expense Record</Text>
                                </View>
                            )}

                    </View>
                </View>
            )}
            </>
            
        </View>
    )
}