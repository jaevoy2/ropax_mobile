import { FetchExpenses } from "@/api/expenses";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

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

        fetchExpenses()
    }, []);



    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Expenses</Text>
            </View>

            {/* Under Development Section */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

            </View>
        </View>
    )
}