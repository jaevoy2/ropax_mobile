import { ExpenseProps } from '@/context/expense';
import Constants from 'expo-constants';

export async function SaveExpenses(expenses: ExpenseProps[]) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        const formData = new FormData();
        
        formData.append('trip_schedule_id', String(expenses[0].trip_schedule_id));
        formData.append('description', String(expenses[0].description));
        formData.append('amount', String(expenses[0].amount));
        formData.append('expense_category_id', String(expenses[0].expense_category_id));

        if (expenses[0].image_uri) {
            const fileName = expenses[0].image_uri.split('/').pop() || `photo_${Date.now()}.jpg`;
            formData.append('image', {
                uri: expenses[0].image_uri,
                name: fileName,
                type: 'image/jpeg'
            } as any);
        }

        const res = await fetch(`${API_URL}save/expenses`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'x-api-key': `${API_KEY}`,
                'Origin': `${ORIGIN}`,
            },
            body: formData
        });

        console.log(formData)
        const response = await res.json();

        if(!res.ok) {
            throw new Error(response.message);
        }

        return response;
    } catch (error: any) {
        throw error;
    }
}