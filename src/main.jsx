import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { calculateTotals, filterTransactions } from './finance.js';

const dateOffset = days => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const starterTransactions = [
  { id: 1, title: 'Monthly salary', category: 'Income', date: dateOffset(-8), amount: 4250, type: 'income' },
  { id: 2, title: 'Weekly groceries', category: 'Groceries', date: dateOffset(-1), amount: 86.4, type: 'expense' },
  { id: 3, title: 'Studio rent', category: 'Housing', date: dateOffset(-4), amount: 1450, type: 'expense' },
  { id: 4, title: 'Coffee with Mia', category: 'Food & drink', date: dateOffset(-2), amount: 12.5, type: 'expense' },
  { id: 5, title: 'Train pass', category: 'Transport', date: dateOffset(-5), amount: 64, type: 'expense' },
  { id: 6, title: 'Bookshop', category: 'Shopping', date: dateOffset(-6), amount: 28.99, type: 'expense' },
  { id: 7, title: 'Freelance project', category: 'Income', date: dateOffset(-7), amount: 680, type: 'income' },
];
const categories = ['Housing', 'Food & drink', 'Groceries', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Other'];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const today = () => new Date().toISOString().slice(0, 10);

function Icon({ name, size = 20 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    down: <><path d="m7 10 5 5 5-5"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    try { const saved = localStorage.getItem('daybook-transactions'); return saved ? JSON.parse(saved) : starterTransactions; } catch { return starterTransactions; }
  });
  const [period, setPeriod] = useState('This month');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All activity');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [form, setForm] = useState({ type: 'expense', title: '', category: 'Groceries', date: today(), amount: '' });
  useEffect(() => localStorage.setItem('daybook-transactions', JSON.stringify(transactions)), [transactions]);

  const visible = useMemo(() => filterTransactions(transactions, { query, filter, period }), [transactions, query, filter, period]);
  const totals = useMemo(() => calculateTotals(transactions), [transactions]);

  function openNew() {
    setEditing(null); setForm({ type: 'expense', title: '', category: 'Groceries', date: today(), amount: '' }); setModal(true);
  }
  function openEdit(item) {
    setEditing(item.id); setForm({ ...item, amount: String(item.amount) }); setMenuId(null); setModal(true);
  }
  function saveTransaction(event) {
    event.preventDefault();
    const next = { ...form, amount: Number(form.amount), id: editing || Date.now() };
    setTransactions(current => editing ? current.map(x => x.id === editing ? next : x) : [next, ...current]);
    setModal(false);
  }
  function deleteTransaction(id) { setTransactions(current => current.filter(x => x.id !== id)); setMenuId(null); }
  const grouped = visible.reduce((groups, item) => { (groups[item.date] ||= []).push(item); return groups; }, {});
  const formatDay = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const chartPeriod = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="Daybook home"><span className="brand-mark"><span/><span/><span/></span><span>daybook<span className="brand-period">.</span></span></a>
      <div className="workspace-label">YOUR SPACE</div>
      <nav className="navigation" aria-label="Main navigation">
        <a className="nav-item active" href="#overview"><Icon name="home"/><span>Overview</span></a>
        <a className="nav-item" href="#transactions"><Icon name="calendar"/><span>Transactions</span><span className="nav-count">{transactions.length}</span></a>
        <a className="nav-item" href="#spending"><Icon name="chart"/><span>Spending</span></a>
      </nav>
      <div className="sidebar-bottom"><div className="tip-card"><span className="tip-spark">✳</span><strong>A little clarity<br/>goes a long way.</strong><p>Small steps today make a calmer tomorrow.</p><span className="tip-doodle">↗</span></div><div className="profile"><div className="avatar">J</div><div className="profile-copy"><strong>Jamie Parker</strong><span>Personal account</span></div><button className="icon-button profile-more" aria-label="Account options"><Icon name="more"/></button></div></div>
    </aside>

    <main id="top" className="main-content">
      <header className="topbar"><div className="breadcrumb">Your space <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="today-label">{todayLabel}</span><div className="avatar avatar-small">J</div></div></header>
      <section id="overview" className="welcome-row"><div><div className="eyebrow"><span className="sun-icon">☼</span> YOUR MONEY AT A GLANCE</div><h1>A fresh look at<br className="mobile-break"/> your finances<span className="title-dot">.</span></h1><p className="welcome-copy">Every little detail, all in one place.</p></div><button className="primary-button" onClick={openNew}><Icon name="plus" size={18}/> Add transaction</button></section>
      <section className="summary-grid" aria-label="Monthly summary">
        <article className="summary-card balance-card"><div className="card-top"><span className="card-label">TOTAL BALANCE</span><span className="card-icon balance-icon">↗</span></div><div className="amount balance-amount">{money(totals.balance)}</div><div className="card-foot"><span className="positive-dot"/> Across all your accounts</div><div className="balance-decoration">$</div></article>
        <article className="summary-card"><div className="card-top"><span className="card-label">INCOME THIS MONTH</span><span className="card-icon income-icon">↓</span></div><div className="amount">{money(totals.income)}</div><div className="card-foot"><span className="trend-up"><Icon name="arrow" size={13}/> On the way in</span></div></article>
        <article className="summary-card"><div className="card-top"><span className="card-label">SPENT THIS MONTH</span><span className="card-icon spend-icon">↗</span></div><div className="amount">{money(totals.spending)}</div><div className="card-foot"><span className="muted-dot"/> A little at a time</div></article>
      </section>

      <section id="spending" className="lower-grid"><article className="spending-card panel"><div className="panel-heading"><div><div className="eyebrow small-eyebrow">A HEALTHY PERSPECTIVE</div><h2>Spending overview</h2></div><button className="select-button" onClick={() => setPeriod(period === 'This month' ? 'All time' : 'This month')}>{period}<Icon name="down" size={15}/></button></div><div className="chart-top"><div><div className="chart-number">{money(totals.spending)}</div><span className="chart-caption">total outflow <span className="chart-period">· {chartPeriod}</span></span></div><span className="chart-note"><span className="note-dot"/> Spending</span></div><div className="chart-wrap"><div className="y-axis"><span>$1,500</span><span>$1,000</span><span>$500</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i/><i/><i/><i/></div><svg className="chart-svg" viewBox="0 0 700 160" preserveAspectRatio="none" role="img" aria-label="Spending over the last six months"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c8d7bd" stopOpacity=".55"/><stop offset="1" stopColor="#c8d7bd" stopOpacity="0"/></linearGradient></defs><path d="M0 124 C45 119 68 90 115 97 S176 123 230 88 S303 69 348 91 S407 111 463 61 S532 70 575 48 S646 56 700 17 L700 160 L0 160Z" fill="url(#area)"/><path d="M0 124 C45 119 68 90 115 97 S176 123 230 88 S303 69 348 91 S407 111 463 61 S532 70 575 48 S646 56 700 17" fill="none" stroke="#668568" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"/><circle cx="700" cy="17" r="5" fill="#668568" vectorEffect="non-scaling-stroke"/></svg><div className="x-axis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div></div></article>
        <article className="quick-card panel"><div className="quick-heading"><div><div className="eyebrow small-eyebrow">KEEP IT SIMPLE</div><h2>Quick add</h2></div><span className="quick-spark">✳</span></div><p>It all adds up. Capture the little things as you go.</p><button className="quick-action" onClick={openNew}><span className="quick-plus"><Icon name="plus" size={17}/></span><span><strong>Add an expense</strong><small>Log where it went</small></span><span className="quick-arrow">↗</span></button><button className="quick-action" onClick={() => { openNew(); setForm(f => ({ ...f, type: 'income', category: 'Income' })); }}><span className="quick-plus income-plus"><Icon name="plus" size={17}/></span><span><strong>Add income</strong><small>Log what came in</small></span><span className="quick-arrow">↗</span></button></article></section>

      <section id="transactions" className="transactions-section"><div className="transactions-heading"><div><div className="eyebrow small-eyebrow">THE LITTLE DETAILS</div><h2>Recent activity</h2></div><button className="text-button" onClick={() => { setFilter('All activity'); setPeriod('All time'); }}>View all <span>↗</span></button></div><div className="transaction-tools"><label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a transaction..." aria-label="Search transactions"/><kbd>⌘ K</kbd></label><div className="filter-tabs" role="tablist" aria-label="Filter transactions">{['All activity', 'Income', 'Expenses'].map(item => <button role="tab" aria-selected={filter === item} className={filter === item ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>
        <div className="transaction-list">{Object.keys(grouped).length === 0 ? <div className="empty-state"><div className="empty-icon">⌁</div><strong>Nothing here just yet</strong><span>Try another search, or add a transaction to get started.</span><button className="text-button" onClick={openNew}>Add your first transaction ↗</button></div> : Object.entries(grouped).map(([date, items]) => <div className="date-group" key={date}><div className="date-heading"><span>{formatDay(date)}</span><span>{items.length} {items.length === 1 ? 'transaction' : 'transactions'}</span></div>{items.map(item => <div className="transaction-row" key={item.id}><div className={`transaction-icon ${item.type}`}><span>{item.type === 'income' ? '↙' : item.category === 'Housing' ? '⌂' : item.category === 'Food & drink' || item.category === 'Groceries' ? '◒' : item.category === 'Transport' ? '↗' : item.category === 'Shopping' ? '◇' : '◦'}</span></div><div className="transaction-info"><strong>{item.title}</strong><span>{item.category}</span></div><div className="transaction-date">{new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div><div className={item.type === 'income' ? 'transaction-amount income-text' : 'transaction-amount'}>{item.type === 'income' ? '+' : '−'}{money(Number(item.amount))}</div><div className="row-menu-wrap"><button className="icon-button row-menu" aria-label={`Options for ${item.title}`} onClick={() => setMenuId(menuId === item.id ? null : item.id)}><Icon name="more" size={19}/></button>{menuId === item.id && <div className="row-menu-pop"><button onClick={() => openEdit(item)}>Edit transaction</button><button className="delete-option" onClick={() => deleteTransaction(item.id)}>Delete transaction</button></div>}</div></div>)}</div>)}</div>
      </section>
      <footer className="footer"><span>Made for a little more peace of mind <span className="footer-heart">♥</span></span><span>DAYBOOK · YOUR MONEY, IN GOOD ORDER</span></footer>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><div className="eyebrow small-eyebrow">A LITTLE ACCOUNTING</div><h2 id="modal-title">{editing ? 'Edit transaction' : 'New transaction'}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setModal(false)}><Icon name="close"/></button></div><form onSubmit={saveTransaction}><div className="type-switch" role="group" aria-label="Transaction type"><button type="button" className={form.type === 'expense' ? 'type-choice active-expense' : 'type-choice'} onClick={() => setForm(f => ({ ...f, type: 'expense', category: categories.includes(f.category) ? f.category : 'Groceries' }))}>Expense</button><button type="button" className={form.type === 'income' ? 'type-choice active-income' : 'type-choice'} onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Income' }))}>Income</button></div><label className="form-label">Description<input autoFocus required maxLength="60" placeholder="e.g. Saturday market" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}/></label><div className="form-pair"><label className="form-label">Amount<div className="amount-input"><span>$</span><input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}/></div></label><label className="form-label">Date<input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/></label></div><label className="form-label">Category<select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{form.type === 'income' ? <option>Income</option> : categories.map(category => <option key={category}>{category}</option>)}</select></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" type="submit">{editing ? 'Save changes' : 'Add transaction'} <span>↗</span></button></div></form></section></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
