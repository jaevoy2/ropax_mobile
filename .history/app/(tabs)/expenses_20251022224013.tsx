import { FetchExpenses } from "@/api/expenses";
import { useExpense } from "@/context/expense";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';

type ExpenseProps = {
    id: number;
    tripSchedID: number;
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

type FilteredDate = {
    id: number;
    tripSchedID: number;
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
    const [contentLoading, setContentLoading] = useState(false);
    const [date, setDate] = useState('');
    const [filteredDate, setFilteredDate] = useState<FilteredDate | null>(null)

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

        console.log(monthName, String(year))
    }, []);

    const handleOnDateSelect = (selectedDate: string) => {
        setContentLoading(true);
        const selected = new Date(selectedDate).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        const date = new Date(selected);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        }

        const formattedDate = date.toLocaleDateString('en-US', options);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'Asia/Manila' });
        const year = date.getFullYear();
        const fulldate = `${formattedDate}`;
        
        setDate(fulldate);
        fetchExpenses(monthName, String(year), String(date))
    }

    const fetchExpenses = async (monthName: string, year: string, fullDate?: string) => {
        const expensesfetch = await FetchExpenses(monthName, year, fullDate ?? '');

        if(expensesfetch) {
            const expense: ExpenseProps[] = expensesfetch.expenses.map((e: any) => ({
                id: e.id,
                tripSchedID: e.trip_schedule_id,
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

            if(expensesfetch.filteredDate) {
                let filteredDateData = {
                    id: expensesfetch.filteredDate.id,
                    tripSchedID: expensesfetch.filteredDate.trip.expense_category_id,
                    description: expensesfetch.filteredDate.description,
                    amount: String(expensesfetch.filteredDate.amount),
                    date: expensesfetch.filteredDate.created_at,
                    category: expensesfetch.filteredDate.category
                }
                setFilteredDate(filteredDateData);
            }

            setFetchedExpenses(expense);
        }
    }

    const addExpenses = () => {
        setExpenses([]);
        setExpenses(prev => [...prev, { id: 1, trip_schedule_id: 0, description: '', amount: 0, expense_category_id: 0 }]);
        router.push('/addExpenses');
    }


    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingLeft: 20, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Expenses</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => setCalendar(true)}>
                        <Ionicons name="search" size={25} color={'#fff'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addExpenses}>
                        <Ionicons name="add" size={35} color={'#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            {calendar && (
                <Modal transparent animationType="slide" onRequestClose={() => setCalendar(false)} >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Date</Text>
                        <Calendar
                            onDayPress={(day) => {
                            setDate(day.dateString); setCalendar(false),
                            handleOnDateSelect(day.dateString)
                        }}
                        markedDates={{ [date ]: {selected: true, selectedColor: '#CF2A3A'} }} 
                        />
                        <TouchableOpacity onPress={() => setCalendar(false)} style={{ marginTop: 20, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5 }}>
                            <Text style={{ color: '#fff', textAlign: 'center' }}>Close Calendar</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </Modal>
            )}
            <View style={{ paddingBottom: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#cf2a3b18', borderBottomColor: '#CF2A3A', borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 15 }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 10 }}>Month:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: '900' }}>{date}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10 }}>Total Expenses:</Text>
                        <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#FF636D', marginTop: -1 }}>₱</Text>
                            <Text style={{ fontSize: 13, color: '#FF636D' }}>
                                5000.00
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: height - 215 }}>
                    <ScrollView>
                        {fetchedExpenses.map((e) => (
                            <TouchableOpacity key={e.id} style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#fff', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontWeight: '900', fontSize: 15 , color: '#cf2a3a' }}>{e.description}</Text>
                                    <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#9B9B9B' }}>{e.category.name}</Text>
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
                </View>
            </View>
            
        </View>
    )
}