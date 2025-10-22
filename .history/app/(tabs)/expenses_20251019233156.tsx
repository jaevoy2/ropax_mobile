import { FetchExpenses } from "@/api/expenses";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';

type ExpenseProps = {
    id: number;
    tripSchedID: number;
    description: string;
    amount: string;
    category: {
        id: number;
        name: string;
        created_at?: string;
        updated_at?: string;
    }
}

const { height } = Dimensions.get('screen');

export default function Expenses() {
    const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
    const [calendar, setCalendar] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [date, setDate] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            const expensesfetch = await FetchExpenses();

            if(expensesfetch) {
                const expense: ExpenseProps[] = expensesfetch.expenses.map((e: any) => ({
                    id: e.id,
                    tripSchedID: e.trip.expense_category_id,
                    description: e.description,
                    amount: String(e.amount),
                    category: e.category
                }));

                setExpenses(expense);
            }
        }

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
        const queryDate = `${formattedDate}`;

        setMonth(`${monthName} ${year}`);
        setDate(queryDate);
        fetchExpenses()
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
        const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });
        const queryDate = `${formattedDate}`;
        
        setDate(queryDate);
    }



    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingLeft: 20, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Expenses</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => setCalendar(true)}>
                        <Ionicons name="search" size={25} color={'#fff'} />
                    </TouchableOpacity>
                    <TouchableOpacity>
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
            <View style={{ paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#CF2A3A', borderBottomWidth: 1, paddingBottom: 10, paddingHorizontal: 15 }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 10 }}>Month:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: 'bold' }}>{month}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10 }}>Total Month Expenses:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: 'bold' }}>₱ 5000.00</Text>
                    </View>
                </View>

                <View style={{ height: height - 200 }}>
                    <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#f1f1f1', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 , color: '#cf2a3a' }}>Vessel Gasoline</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{date}</Text>
                        </View>
                        <Text style={{ fontSize: 18, color: '#FF636D' }}>
                            ₱ 1000.00
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#f1f1f1', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 , color: '#cf2a3a' }}>Vessel Gasoline</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{date}</Text>
                        </View>
                        <Text style={{ fontSize: 18, color: '#FF636D' }}>
                            ₱ 1000.00
                        </Text>
                    </TouchableOpacity><TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#f1f1f1', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 , color: '#cf2a3a' }}>Vessel Gasoline</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{date}</Text>
                        </View>
                        <Text style={{ fontSize: 18, color: '#FF636D' }}>
                            ₱ 1000.00
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#f1f1f1', borderBottomColor: '#FFC1C5', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 , color: '#cf2a3a' }}>Vessel Gasoline</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{date}</Text>
                        </View>
                        <Text style={{ fontSize: 18, color: '#FF636D' }}>
                            ₱ 1000.00
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
        </View>
    )
}