import { google } from "googleapis";
import { v4 as uuid } from "uuid";

import { expenseSheetName, incomeSheetName, type ExpenseCategory } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { getRecentMonths } from "@/lib/date";
import type { Expense, Income, MonthlyBalancePoint } from "@/lib/types";

type SheetName = typeof expenseSheetName | typeof incomeSheetName;

type RawRow = string[];

type RowMatch = {
  index: number;
  row: RawRow;
};

const expenseHeaders = ["id", "date", "month", "category", "description", "amount"];
const incomeHeaders = ["id", "month", "description", "amount"];

function normalizePrivateKey(privateKey: string) {
  return privateKey
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");
}

function createSheetsClient() {
  const env = getEnv();
  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: normalizePrivateKey(env.GOOGLE_PRIVATE_KEY),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

function parseAmount(value: string | undefined) {
  return Number(value ?? 0);
}

function mapExpenseRow(row: RawRow): Expense {
  return {
    id: row[0] ?? "",
    date: row[1] ?? "",
    month: row[2] ?? "",
    category: (row[3] ?? "Outros") as ExpenseCategory,
    description: row[4] ?? "",
    amount: parseAmount(row[5])
  };
}

function mapIncomeRow(row: RawRow): Income {
  return {
    id: row[0] ?? "",
    month: row[1] ?? "",
    description: row[2] ?? "",
    amount: parseAmount(row[3])
  };
}

async function getSpreadsheet() {
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();

  const response = await sheets.spreadsheets.get({
    spreadsheetId: GOOGLE_SHEETS_ID
  });

  return response.data;
}

async function getSheetIdByName(name: SheetName) {
  const spreadsheet = await getSpreadsheet();
  const sheet = spreadsheet.sheets?.find((entry) => entry.properties?.title === name);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error(`Sheet "${name}" not found.`);
  }

  return sheetId;
}

async function getSheetRows(name: SheetName) {
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${name}!A:Z`
  });

  return (response.data.values ?? []) as RawRow[];
}

async function ensureHeaders(name: SheetName) {
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();
  const rows = await getSheetRows(name);

  if (rows.length > 0) {
    return;
  }

  const headers = name === expenseSheetName ? expenseHeaders : incomeHeaders;

  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${name}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [headers]
    }
  });
}

function findRowById(rows: RawRow[], id: string): RowMatch | null {
  const index = rows.findIndex((row, rowIndex) => rowIndex > 0 && row[0] === id);

  if (index === -1) {
    return null;
  }

  return {
    index,
    row: rows[index]
  };
}

export async function listExpenses() {
  await ensureHeaders(expenseSheetName);
  const rows = await getSheetRows(expenseSheetName);
  return rows.slice(1).filter((row) => row[0]).map(mapExpenseRow);
}

export async function listIncome() {
  await ensureHeaders(incomeSheetName);
  const rows = await getSheetRows(incomeSheetName);
  return rows.slice(1).filter((row) => row[0]).map(mapIncomeRow);
}

export async function appendExpense(input: Omit<Expense, "id">) {
  await ensureHeaders(expenseSheetName);
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();
  const expense: Expense = {
    id: uuid(),
    ...input
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${expenseSheetName}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          expense.id,
          expense.date,
          expense.month,
          expense.category,
          expense.description,
          expense.amount
        ]
      ]
    }
  });

  return expense;
}

export async function appendIncome(input: Omit<Income, "id">) {
  await ensureHeaders(incomeSheetName);
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();
  const income: Income = {
    id: uuid(),
    ...input
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: `${incomeSheetName}!A:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[income.id, income.month, income.description, income.amount]]
    }
  });

  return income;
}

async function deleteRowById(name: SheetName, id: string) {
  const sheets = createSheetsClient();
  const { GOOGLE_SHEETS_ID } = getEnv();
  const rows = await getSheetRows(name);
  const match = findRowById(rows, id);

  if (!match) {
    return false;
  }

  const sheetId = await getSheetIdByName(name);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: GOOGLE_SHEETS_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: match.index,
              endIndex: match.index + 1
            }
          }
        }
      ]
    }
  });

  return true;
}

export function filterByMonth<T extends { month: string }>(rows: T[], month: string) {
  return rows.filter((row) => row.month === month);
}

export async function deleteExpenseById(id: string) {
  return deleteRowById(expenseSheetName, id);
}

export async function deleteIncomeById(id: string) {
  return deleteRowById(incomeSheetName, id);
}

export async function getMonthlyBalanceHistory(expenses: Expense[], income: Income[]) {
  const months = getRecentMonths(6);

  return months.map<MonthlyBalancePoint>((month) => {
    const totalIncome = income
      .filter((entry) => entry.month === month)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenses
      .filter((entry) => entry.month === month)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      month,
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  });
}
