// ══════════════════════════════════════════════════
// PENDURA v2.1.6 — CALENDAR.JS
// Calendário de pagamentos e vencimentos
// ══════════════════════════════════════════════════

const Calendar = (() => {
  let state = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selectedDay: null,
    events: {}
  };

  const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  function buildEvents(allTransactions = [], schedules = []) {
    state.events = {};

    (Array.isArray(allTransactions) ? allTransactions : []).forEach(tx => {
      const dateStr = _dateOnly(tx?.created_at);
      if (!dateStr) return;

      _addEvent(dateStr, {
        type: tx.type === 'payment' ? 'paid' : 'purchase',
        label: tx.description || (tx.type === 'payment' ? 'Pagamento' : 'Compra'),
        customer: tx.customerName || tx.customer_name || tx.customer?.name || tx.ledgers?.customers?.name || '—',
        amount: tx.amount,
        status: tx.status,
        txId: tx.id || null
      });
    });

    (Array.isArray(schedules) ? schedules : []).forEach(s => {
      const due = _dateOnly(s?.due_date);
      if (!due) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(due + 'T00:00:00');
      const isPaid = s.status === 'paid' || s.status === 'confirmed';
      const isLate = dueDate < today && !isPaid;

      _addEvent(due, {
        type: isPaid ? 'paid' : isLate ? 'late' : 'upcoming',
        label: s.description || 'Vencimento',
        customer: s.customerName || s.customer_name || s.customer?.name || s.customers?.name || '—',
        amount: s.amount,
        status: s.status,
        txId: s.txId || s.tx_id || s.id || null
      });
    });
  }

  function navigate(delta) {
    state.month += Number(delta) || 0;
    if (state.month > 11) { state.month = 0; state.year++; }
    if (state.month < 0) { state.month = 11; state.year--; }
    state.selectedDay = null;
    render();
  }

  function render() {
    const labelEl = document.getElementById('cal-month-label');
    const gridEl = document.getElementById('cal-grid');
    if (!labelEl || !gridEl) {
      console.warn('[Calendar] Elementos não encontrados:', { labelEl, gridEl });
      return;
    }

    labelEl.textContent = `${MONTHS_PT[state.month]} ${state.year}`;

    const today = new Date();
    const firstDay = new Date(state.year, state.month, 1).getDay();
    const daysInMon = new Date(state.year, state.month + 1, 0).getDate();

    let html = DAYS_PT.map(d => `<div class="cal-day-header">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day cal-empty"></div>';

    for (let d = 1; d <= daysInMon; d++) {
      const dateStr = `${state.year}-${String(state.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evs = state.events[dateStr] || [];

      const isToday = today.getFullYear() === state.year && today.getMonth() === state.month && today.getDate() === d;
      const isSelected = state.selectedDay === dateStr;
      const hasPaid = evs.some(e => e.type === 'paid');
      const hasUpcoming = evs.some(e => e.type === 'upcoming');
      const hasLate = evs.some(e => e.type === 'late');
      const hasPurchase = evs.some(e => e.type === 'purchase');

      const classes = [
        'cal-day',
        isToday ? 'today' : '',
        isSelected ? 'selected' : '',
        hasLate ? 'has-late' : hasUpcoming ? 'has-upcoming' : hasPaid ? 'has-paid' : hasPurchase ? 'has-purchase' : ''
      ].filter(Boolean).join(' ');

      html += `<button type="button" class="${classes}" onclick="App.calSelectDay('${dateStr}')">${d}</button>`;
    }

    gridEl.innerHTML = html;
    renderDayDetail(state.selectedDay);
  }

  function renderDayDetail(dateStr) {
    const titleEl = document.getElementById('cal-detail-title');
    const listEl = document.getElementById('cal-detail-list');
    if (!listEl) return;

    if (!dateStr) {
      if (titleEl) titleEl.textContent = 'Próximos vencimentos';
      const upcoming = _getUpcoming(30).filter(item => item.type !== 'purchase');
      listEl.innerHTML = upcoming.length
        ? upcoming.map(item => _eventCard(item)).join('')
        : '<div class="empty-state"><span>📅</span><p>Nenhum vencimento próximo.</p></div>';
      return;
    }

    const d = new Date(dateStr + 'T00:00:00');
    const evs = state.events[dateStr] || [];
    if (titleEl) titleEl.textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    listEl.innerHTML = evs.length
      ? evs.map(e => _eventCard({ ...e, date: dateStr })).join('')
      : '<div class="empty-state"><span>🗓️</span><p>Nenhum evento neste dia.</p></div>';
  }

  function selectDay(dateStr) {
    state.selectedDay = state.selectedDay === dateStr ? null : dateStr;
    render();
  }

  function _addEvent(dateStr, ev) {
    const key = _dateOnly(dateStr);
    if (!key) return;
    if (!state.events[key]) state.events[key] = [];
    state.events[key].push(ev);
  }

  function _dateOnly(value) {
    if (!value) return null;
    if (typeof value === 'string') return value.slice(0, 10);
    try { return new Date(value).toISOString().slice(0, 10); }
    catch { return null; }
  }

  function _getUpcoming(days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today.getTime() + days * 86400000);
    const result = [];

    Object.entries(state.events).forEach(([dateStr, evs]) => {
      const d = new Date(dateStr + 'T00:00:00');
      if (d >= today && d <= limit) evs.forEach(e => result.push({ ...e, date: dateStr }));
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  function _typeLabel(type) {
    const map = { paid: '✅ Pago', upcoming: '⏳ Pendente', late: '🔴 Atrasado', purchase: '🛒 Compra' };
    return map[type] || type;
  }

  function _typeClass(type) {
    const map = { paid: 'confirmed', upcoming: 'pending', late: 'contested', purchase: 'pending' };
    return map[type] || 'pending';
  }

  function _formatCurrency(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  }

  function _eventCard(item) {
    const dateLabel = item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';
    const safeTxId = String(item.txId || '').replace(/'/g, '\\&#39;');
    const clickable = item.txId ? `onclick="App.openTransactionDetail('${safeTxId}')"` : '';
    const icon = item.type === 'paid' ? '✅' : item.type === 'late' ? '🔴' : item.type === 'purchase' ? '🛒' : '⏳';

    return `
      <div class="tx-item tx-${item.type === 'paid' || item.type === 'purchase' ? 'payment' : 'purchase'}" ${clickable}>
        <div class="tx-icon">${icon}</div>
        <div class="tx-info">
          <div class="tx-desc">${_escape(item.label)}</div>
          <div class="tx-date">${_escape(item.customer)}${dateLabel ? ' · ' + dateLabel : ''}</div>
          <span class="tx-status-pill ${_typeClass(item.type)}">${_typeLabel(item.type)}</span>
        </div>
        <div class="tx-amount-col">
          <div class="tx-amount" style="color:${item.type === 'paid' ? 'var(--green-bright)' : item.type === 'late' ? 'var(--red)' : 'var(--amber)'}">
            ${_formatCurrency(item.amount)}
          </div>
        </div>
      </div>`;
  }

  function _escape(v) {
    return String(v ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  }

  return { buildEvents, navigate, render, renderDayDetail, selectDay };
})();

window.Calendar = Calendar;

// Patch defensivo: o app.js atual tem um bloco antigo duplicado no método de calendário.
// Esta correção sobrescreve apenas as ações públicas do calendário, sem mexer no restante do app.
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof App === 'undefined' || !window.Calendar) return;

    function getMerchantIdFromSession() {
      try {
        const session = JSON.parse(localStorage.getItem('pendura_session') || 'null');
        if (!session || session.type !== 'merchant') return null;
        return session.data?.id || null;
      } catch (e) {
        return null;
      }
    }

    function customerNameFromLedger(tx, ledgers, customers) {
      if (tx.customerName || tx.customer_name) return tx.customerName || tx.customer_name;
      const nested = tx.ledgers?.customers;
      if (Array.isArray(nested)) return nested[0]?.name || '—';
      if (nested?.name) return nested.name;
      const ledger = (ledgers || []).find(l => l.id === tx.ledger_id);
      const customer = ledger?.customers || (customers || []).find(c => c.id === ledger?.customer_id);
      return customer?.name || '—';
    }

    async function loadTransactions(mid) {
      if (typeof dbGetAllTransactionsForMerchant === 'function') {
        const res = await dbGetAllTransactionsForMerchant(mid);
        return res?.data || [];
      }

      if (typeof dbGetLedgersForMerchant !== 'function' || typeof dbGetTransactions !== 'function') return [];
      const ledgerRes = await dbGetLedgersForMerchant(mid);
      const ledgers = ledgerRes?.data || [];
      const chunks = await Promise.all(ledgers.map(async ledger => {
        try {
          const txRes = await dbGetTransactions(ledger.id);
          return (txRes?.data || []).map(tx => ({ ...tx, ledger_id: tx.ledger_id || ledger.id, ledgers: ledger }));
        } catch (e) {
          console.warn('[Calendar] falha ao buscar transações:', ledger.id, e);
          return [];
        }
      }));
      return chunks.flat();
    }

    App.showCalendarScreen = async function showCalendarScreenFixed() {
      App.showScreen('calendar');
      Calendar.buildEvents([], []);
      Calendar.render();

      const mid = getMerchantIdFromSession();
      if (!mid) return;

      try {
        const allTxRaw = await loadTransactions(mid);
        let customers = [];
        try {
          if (typeof dbGetCustomers === 'function') customers = (await dbGetCustomers(mid))?.data || [];
        } catch (e) { customers = []; }

        let ledgers = [];
        try {
          if (typeof dbGetLedgersForMerchant === 'function') ledgers = (await dbGetLedgersForMerchant(mid))?.data || [];
        } catch (e) { ledgers = []; }

        const allTx = (allTxRaw || []).map(tx => ({
          ...tx,
          customerName: customerNameFromLedger(tx, ledgers, customers)
        }));

        let schedules = [];
        if (typeof dbGetSchedules === 'function') {
          try {
            schedules = (await dbGetSchedules(mid))?.data || [];
          } catch (e) {
            console.warn('[Calendar] dbGetSchedules falhou:', e);
          }
        }

        const txSchedules = allTx
          .filter(tx => tx.due_date && tx.status !== 'cancelled')
          .map(tx => ({
            due_date: tx.due_date,
            amount: tx.amount,
            description: tx.description || 'Vencimento',
            customerName: tx.customerName || '—',
            status: tx.status === 'confirmed' ? 'paid' : 'pending',
            txId: tx.id
          }));

        Calendar.buildEvents(allTx, [...schedules, ...txSchedules]);
        Calendar.render();
      } catch (e) {
        console.error('[Calendar] erro ao abrir:', e);
        Calendar.buildEvents([], []);
        Calendar.render();
        if (typeof App.toast === 'function') App.toast('⚠️ Não consegui carregar os vencimentos', 'warning');
      }
    };

    App.calNav = delta => Calendar.navigate(delta);
    App.calSelectDay = dateStr => Calendar.selectDay(dateStr);
  } catch (e) {
    console.error('[Calendar] patch não aplicado:', e);
  }
});
