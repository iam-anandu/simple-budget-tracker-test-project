import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals, filterTransactions } from './finance.js';

const now = new Date('2025-06-09T12:00:00');
const entries = [
  { id: 1, title: 'Payday', category: 'Income', date: '2025-06-01', amount: 3000, type: 'income' },
  { id: 2, title: 'Groceries', category: 'Food', date: '2025-06-04', amount: 75.5, type: 'expense' },
  { id: 3, title: 'Older rent', category: 'Housing', date: '2025-05-01', amount: 1000, type: 'expense' },
];

test('summarizes monthly income and spending, with balance across all dates', () => {
  assert.deepEqual(calculateTotals(entries, now), { income: 3000, spending: 75.5, balance: 1924.5 });
});

test('filters by month and sorts newest first', () => {
  assert.deepEqual(filterTransactions(entries, {}, now).map(x => x.id), [2, 1]);
});

test('supports category search and income/expense filters', () => {
  assert.deepEqual(filterTransactions(entries, { query: 'food', filter: 'Expenses' }, now).map(x => x.id), [2]);
  assert.deepEqual(filterTransactions(entries, { filter: 'Income' }, now).map(x => x.id), [1]);
});

test('all-time view includes older transactions', () => {
  assert.deepEqual(filterTransactions(entries, { period: 'All time' }, now).map(x => x.id), [2, 1, 3]);
});
