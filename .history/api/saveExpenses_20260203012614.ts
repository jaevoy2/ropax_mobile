import { ExpenseProps } from '@/context/expense';
import Constants from 'expo-constants';



export async function SaveExpenses(expenses: ExpenseProps[]) {
    const formData = new FormData();
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    expenses.forEach((expense, index) => {
        formData.append(`expenses[${index}][trip_schedule_id]`, String(expense.trip_schedule_id));
        formData.append(`expenses[${index}][description]`, expense.description);
        formData.append(`expenses[${index}][amount]`, String(expense.amount));
        formData.append(`expenses[${index}][expense_category_id]`, String(expense.expense_category_id));

        if (expense.image_uri) {
            formData.append(`expenses[${index}][image_uri]`, {
                uri: expense.image_uri,
                name: `expense_${expense.id}.jpg`,
                type: 'image/jpeg',
            } as any); // Expo's type workaround
        }
    })


    try {
        const res = await fetch(`${API_URL}save/expenses`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`
            },
            body: formData
        });
    
        const response = await res.json();
        
    
        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;
    }catch(error) {
        throw error;
    }
}

