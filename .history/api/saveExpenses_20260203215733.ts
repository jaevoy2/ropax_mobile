import { ExpenseProps } from '@/context/expense';
import axios from 'axios';
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
      } as any);
    }
  });

  try {
    const res = await axios.post(`${API_URL}save/expenses`, formData, {
      headers: {
        'x-api-key': API_KEY,
        'Origin': ORIGIN
      },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
