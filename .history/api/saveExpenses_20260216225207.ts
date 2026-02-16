import { ExpenseProps } from '@/context/expense';
import Constants from 'expo-constants';

type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export async function SaveExpenses(expenses: ExpenseProps[]) {
    const extras = Constants.expoConfig?.extra ?? {};
    const API_KEY = extras.API_KEY as string;
    const API_URL = extras.API_URL as string;
    const ORIGIN = extras.ORIGIN as string;

    try {
        for (let index = 0; index < expenses.length; index++) {
            const expense = expenses[index];
            const formData = new FormData();
            
            formData.append('trip_schedule_id', String(expense.trip_schedule_id));
            formData.append('description', expense.description);
            formData.append('amount', String(expense.amount));
            formData.append('expense_category_id', String(expense.expense_category_id));

            if (expense.image_uri) {
                const uriParts = expense.image_uri.split('/');
                const filename = uriParts[uriParts.length - 1];
                
                // Read file as base64 from device
                const base64 = await FileSystem.readAsStringAsync(
                    expense.image_uri,
                    { encoding: FileSystem.EncodingType.Base64 }
                );
                
                // Create FormData with base64 encoded file
                const blob = new Blob(
                    [Uint8Array.from(atob(base64), c => c.charCodeAt(0))],
                    { type: 'image/jpeg' }
                );
                
                formData.append('image', blob, filename);
            }

            const res = await fetch(`${API_URL}save/expenses`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'x-api-key': `${API_KEY}`,
                    'Origin': `${ORIGIN}`,
                },
                body: formData,
            });
        
            const response = await res.json();

            if (!res.ok) {
                throw new Error(response.message || 'Failed to save expense');
            }
        }
        
        return { success: true, message: 'All expenses saved successfully' };
    } catch (error) {
        throw error;
    }
}
