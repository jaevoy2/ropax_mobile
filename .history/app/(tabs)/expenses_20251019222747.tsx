import { FetchExpenses } from "@/api/expenses";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
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

export default function Expenses() {
    const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
    const [calendar, setCalendar] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const [date, setDate] = useState('');

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

        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
        const date = new Date(today);
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
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Expenses</Text>
                <TouchableOpacity onPress={() => setCalendar(true)}>
                    <Ionicons name="calendar" size={25} color={'#fff'} />
                </TouchableOpacity>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#CF2A3A', borderBottomWidth: 1, paddingBottom: 5, paddingHorizontal: 15 }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 10 }}>Date:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: 'bold' }}>{date}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10 }}>Total Month Expenses:</Text>
                        <Text style={{ color: '#CF2A3A', fontSize: 13, fontWeight: 'bold' }}>₱ 5000.00</Text>
                    </View>
                </View>

                <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>Vessel Gasoline</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{date}</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#FF636D' }}>
                        ₱ 1000.00
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}