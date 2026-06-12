import { api } from "../utils/api";

const subUrl = "/expenses";

export const expenseApis = {
    addExpense: (data:any) => api.post(`${subUrl}/add-expense`,data),
    viewExpenses: () => api.get(`${subUrl}/view-all-expenses`),
    viewExpense: (expenseId: string) => api.get(`${subUrl}/view-expense-id/${expenseId}`),
    updateExpense: (expenseId: string,data:any) => api.patch(`${subUrl}/modify-expense/${expenseId}`,data),
    deleteExpense: (expenseId: string) => api.delete(`${subUrl}/delete-expense/${expenseId}`),
    filterExpense: () => api.get(`${subUrl}/filter-expense`)
}