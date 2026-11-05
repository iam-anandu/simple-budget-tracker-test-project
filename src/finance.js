export function calculateTotals(transactions, now = new Date()) {
  const currentMonth = transactions.filter(item => {
    const date = new Date(`${item.date}T12:00:00`);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const income = currentMonth.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const spending = currentMonth.filter(item => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = transactions.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0);
  return { income, spending, balance };
}

export function filterTransactions(transactions, { query = '', filter = 'All activity', period = 'This month' } = {}, now = new Date()) {
  return transactions.filter(item => {
    const matchesQuery = `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All activity' || (filter === 'Income' ? item.type === 'income' : item.type === 'expense');
    const date = new Date(`${item.date}T12:00:00`);
    const monthMatches = period === 'All time' || (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());
    return matchesQuery && matchesFilter && monthMatches;
  }).sort((a, b) => b.date.localeCompare(a.date));
}
