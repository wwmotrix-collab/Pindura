// ══════════════════════════════════════════════════
// CALENDAR.JS — Calendário de Vencimentos
// ══════════════════════════════════════════════════

const Calendar = (() => {
  let currentDate = new Date();
  let events = []; // { due_date, amount, description, customerName, status, txId }
  let selectedDay = null;

  function buildEvents(transactions = [], schedules = []) {
    events = [];

    // Adiciona transações com due_date
    if (transactions && Array.isArray(transactions)) {
      transactions
        .filter(t => t.due_date && t.status !== 'cancelled')
        .forEach(t => {
          events.push({
            due_date: t.due_date,
            amount: t.amount,
            description: t.description || 'Vencimento',
            customerName: t.customerName || '—',
            status: t.status === 'confirmed' ? 'paid' : 'pending',
            txId: t.id,
            type: t.type || 'purchase',
          });
        });
    }

    // Adiciona schedules
    if (schedules && Array.isArray(schedules)) {
      schedules
        .filter(s => s.due_date && s.status !== 'paid')
        .forEach(s => {
          events.push({
            due_date: s.due_date,
            amount: s.amount,
            description: s.description || 'Pagamento',
            customerName: s.customerName || '—',
            status: s.status === 'paid' ? 'paid' : 'pending',
            txId: s.id,
            type: 'schedule',
          });
        });
    }

    return events;
  }

  function render() {
    const monthLabel = document.getElementById('cal-month-label');
    const grid = document.getElementById('cal-grid');

    if (!monthLabel || !grid) return;

    // Atualiza rótulo do mês
    const monthStr = currentDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
    monthLabel.textContent =
      monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    // Limpa grid
    grid.innerHTML = '';

    // Cabeçalho com dias da semana
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const header = document.createElement('div');
    header.className = 'cal-header-row';
    daysOfWeek.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day-header';
      dayEl.textContent = day;
      header.appendChild(dayEl);
    });
    grid.appendChild(header);

    // Calcula primeiro dia do mês e dias no mês
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Cria células do calendário
    let dayCounter = 1;
    let prevMonthCounter = daysInPrevMonth - firstDay + 1;

    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cal-cell';

        let dateStr = '';
        let isCurrentMonth = false;
        let dateObj = null;

        if (week === 0 && day < firstDay) {
          // Dias do mês anterior
          cellEl.classList.add('cal-other-month');
          cellEl.textContent = prevMonthCounter;
          prevMonthCounter++;
        } else if (dayCounter <= daysInMonth) {
          // Dias do mês atual
          cellEl.textContent = dayCounter;
          isCurrentMonth = true;
          dateObj = new Date(year, month, dayCounter);
          dateStr = dateObj.toISOString().split('T')[0];

          // Marca hoje
          const today = new Date();
          if (
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
          ) {
            cellEl.classList.add('cal-today');
          }

          // Busca eventos para este dia
          const dayEvents = getEventsForDay(dateStr);
          if (dayEvents.length > 0) {
            const statusClass = getStatusClass(dayEvents);
            cellEl.classList.add(statusClass);
            cellEl.classList.add('cal-has-event');

            // Adiciona indicadores visuais
            const dotsEl = document.createElement('div');
            dotsEl.className = 'cal-dots';
            dayEvents.forEach(ev => {
              const dot = document.createElement('span');
              dot.className = `cal-dot cal-dot-${ev.status}`;
              dotsEl.appendChild(dot);
            });
            cellEl.appendChild(dotsEl);
          }

          // Click para selecionar dia
          cellEl.style.cursor = 'pointer';
          cellEl.addEventListener('click', () => selectDay(dateStr));

          dayCounter++;
        } else {
          // Dias do próximo mês
          cellEl.classList.add('cal-other-month');
          cellEl.textContent = dayCounter - daysInMonth;
          dayCounter++;
        }

        grid.appendChild(cellEl);
      }
      if (dayCounter > daysInMonth) break;
    }

    // Atualiza lista de detalhes
    updateDetailList();
  }

  function getEventsForDay(dateStr) {
    return events.filter(e => e.due_date === dateStr);
  }

  function getStatusClass(dayEvents) {
    // Prioridade: late > upcoming > paid
    if (dayEvents.some(e => isLate(e.due_date) && e.status === 'pending')) {
      return 'cal-late';
    }
    if (dayEvents.some(e => e.status === 'pending')) {
      return 'cal-upcoming';
    }
    if (dayEvents.some(e => e.status === 'paid')) {
      return 'cal-paid';
    }
    return '';
  }

  function isLate(dateStr) {
    const eventDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }

  function navigate(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    render();
  }

  function selectDay(dateStr) {
    selectedDay = dateStr;
    updateDetailList();
  }

  function updateDetailList() {
    const detailList = document.getElementById('cal-detail-list');
    const detailTitle = document.getElementById('cal-detail-title');

    if (!detailList) return;

    let visibleEvents = [];

    if (selectedDay) {
      // Mostra eventos do dia selecionado
      visibleEvents = getEventsForDay(selectedDay);
      if (detailTitle) {
        const dayDate = new Date(selectedDay + 'T00:00:00');
        detailTitle.textContent = dayDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        });
      }
    } else {
      // Mostra próximos vencimentos (próximos 30 dias)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);

      visibleEvents = events
        .filter(e => {
          const eDate = new Date(e.due_date + 'T00:00:00');
          return eDate >= today && eDate <= maxDate && e.status !== 'paid';
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      if (detailTitle) {
        detailTitle.textContent = 'Próximos vencimentos';
      }
    }

    if (!visibleEvents.length) {
      detailList.innerHTML =
        '<div class="empty-state"><span>✨</span><p>Nenhum vencimento</p></div>';
      return;
    }

    const fmt = v =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        v || 0
      );

    detailList.innerHTML = visibleEvents
      .map((ev, i) => {
        const isLateEv = isLate(ev.due_date);
        const evDate = new Date(ev.due_date + 'T00:00:00');
        const dateStr = evDate.toLocaleDateString('pt-BR');

        return `<div class="tx-item tx-${ev.type || 'purchase'}" style="animation-delay:${i * 40}ms">
          <div class="tx-icon">${ev.status === 'paid' ? '✅' : isLateEv ? '🔴' : '📅'}</div>
          <div class="tx-info">
            <div class="tx-desc">${ev.description}</div>
            <div class="tx-date">${ev.customerName} · ${dateStr}</div>
            ${isLateEv ? '<span class="tx-status-pill late">🔴 Atrasado</span>' : '<span class="tx-status-pill pending">⏳ Próximo</span>'}
          </div>
          <div class="tx-amount-col">
            <div class="tx-amount">${fmt(ev.amount)}</div>
          </div>
        </div>`;
      })
      .join('');
  }

  return {
    buildEvents,
    render,
    navigate,
    selectDay,
  };
})();
