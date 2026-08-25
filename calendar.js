(() => {
  'use strict';

  const groups = [
    { key: 'all', label: 'Whole Studio', short: 'Everything at our house' },
    { key: 'capoeira', label: 'Capoeira Families', short: 'Kids, youth, teens + adults' },
    { key: 'salsa', label: 'Salsa Community', short: 'Classes + community socials' },
    { key: 'yoga', label: 'Yoga', short: 'Early Vinyasa classes' },
    { key: 'mobility', label: 'Mobility', short: 'Ground-based mobility flow' }
  ];

  const weeklyClasses = [
    { dow: 1, title: 'Ground-based Mobility Flow', start: '12:30', end: '13:30', group: 'mobility', instructor: 'Uriel' },
    { dow: 2, title: 'Vinyasa Yoga — Early', start: '06:00', end: '07:00', group: 'yoga', instructor: 'Melissa' },
    { dow: 2, title: 'Kids Capoeira · Ages 4–7', start: '16:00', end: '17:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 2, title: 'Youth Capoeira · Ages 8–13', start: '17:00', end: '18:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 2, title: 'Teens + Adults Capoeira · Ages 14+', start: '18:00', end: '19:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 3, title: 'Ground-based Mobility Flow', start: '14:00', end: '15:00', group: 'mobility', instructor: 'Uriel' },
    { dow: 3, title: 'Salsa — Absolute Beginner', start: '18:30', end: '19:25', group: 'salsa', instructor: 'Luis' },
    { dow: 3, title: 'Salsa — Advanced Beginner', start: '19:30', end: '20:25', group: 'salsa', instructor: 'Luis' },
    { dow: 4, title: 'Kids Capoeira · Ages 4–7', start: '16:00', end: '17:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 4, title: 'Youth Capoeira · Ages 8–13', start: '17:00', end: '18:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 4, title: 'Vinyasa Yoga — Early', start: '06:00', end: '07:00', group: 'yoga', instructor: 'Melissa' },
    { dow: 6, title: 'Youth Capoeira · Ages 8–13', start: '10:00', end: '11:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 6, title: 'Kids Capoeira · Ages 4–7', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 6, title: 'Teens + Adults Capoeira · Ages 14+', start: '12:00', end: '13:00', group: 'capoeira', instructor: 'Uriel' }
  ];

  const specialEvents = [
    { id: 'salsa-practica-2026-08-26', title: 'Salsa Práctica', date: '2026-08-26', start: '18:30', end: '20:00', group: 'salsa', instructor: 'Salsa Community', note: "Luis will be away for a last-minute family event. We'll practice the sequences we learned in class last week, and everyone is welcome to join us.", status: 'confirmed', special: true },
    { id: 'combined-2026-08-29', title: 'Combined Kids Capoeira Class', date: '2026-08-29', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel', note: 'All kids ages 4–13 come together as a community at 11:00 AM!', status: 'confirmed', special: true },
    { id: 'social-2026-09-19', title: 'First Salsa + Community Social', date: '2026-09-19', start: '16:00', end: '19:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Doors open at 3:45 PM. Booking details coming soon.', status: 'details-soon', special: true },
    { id: 'combined-2026-09-26', title: 'Combined Kids Capoeira Class', date: '2026-09-26', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel', note: 'All kids ages 4–13 come together as a community at 11:00 AM!', status: 'confirmed', special: true },
    { id: 'halloween-2026-10-30', title: 'Halloween Salsa + Community Social', date: '2026-10-30', start: '18:00', end: '21:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Friday special — bring your best costume. Booking details to follow.', status: 'details-soon', special: true },
    { id: 'combined-2026-10-31', title: 'Happy Halloween Combined Kids Capoeira Class', date: '2026-10-31', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel', note: 'All kids ages 4–13 come together as a community at 11:00 AM—and costumes are a must! 🎃', status: 'confirmed', special: true },
    { id: 'combined-2026-11-21', title: 'Combined Kids Capoeira Class', date: '2026-11-21', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel', note: "We're coming together on the 3rd Saturday this month because of the Thanksgiving holiday break. All kids ages 4–13 join us at 11:00 AM!", status: 'confirmed', special: true },
    { id: 'capoeira-family-year-end-2026-12-05', title: 'Capoeira Family Year-End Celebration', date: '2026-12-05', start: '12:00', group: 'capoeira', instructor: 'Capoeira Families', note: "Save the date! Let's gather, celebrate our kids and families, and close out a beautiful year of Capoeira together. More joy, more community, and more details coming soon!", status: 'details-soon', special: true, timeTbd: true },
    { id: 'combined-2026-12-19', title: 'Combined Kids Capoeira Class', date: '2026-12-19', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel', note: "We're coming together on the 3rd Saturday this month because of the Christmas holiday break. All kids ages 4–13 join us at 11:00 AM!", status: 'confirmed', special: true },
    { id: 'social-2026-12-19', title: 'Year-End Salsa + Community Social', date: '2026-12-19', start: '16:00', end: '19:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Booking details to follow.', status: 'details-soon', special: true }
  ];

  const combinedKidsDates = new Set(['2026-08-29', '2026-09-26', '2026-10-31', '2026-11-21', '2026-12-19']);
  const salsaPrácticaDates = new Set(['2026-08-26']);

  const filters = document.getElementById('group-filters');
  const title = document.getElementById('group-title');
  const nextLabel = document.getElementById('next-label');
  const nextTitle = document.getElementById('next-title');
  const nextMeta = document.getElementById('next-meta');
  const specialOnly = document.getElementById('special-only');
  const programNote = document.getElementById('program-note');
  const eventList = document.getElementById('event-list');
  const hostBios = document.getElementById('host-bios');

  let activeGroup = validGroupFromUrl();

  function validGroupFromUrl() {
    const incoming = new URLSearchParams(window.location.search).get('group');
    return groups.some((group) => group.key === incoming) ? incoming : 'all';
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function buildEvents(startDate, days = 70) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const events = [];

    for (let offset = 0; offset <= days; offset += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + offset);
      const key = dateKey(day);

      weeklyClasses
        .filter((event) => event.dow === day.getDay())
        .filter((event) => !(combinedKidsDates.has(key) && (event.title.startsWith('Kids Capoeira') || event.title.startsWith('Youth Capoeira'))))
        .filter((event) => !(salsaPrácticaDates.has(key) && event.group === 'salsa'))
        .forEach((event, index) => events.push({ ...event, id: `weekly-${key}-${index}`, date: key, status: 'confirmed' }));
    }

    const currentDay = dateKey(start);
    const futureSpecialEvents = specialEvents.filter((event) => event.date >= currentDay);
    return [...events, ...futureSpecialEvents].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
  }

  function formatTime(time) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(`2026-01-01T${time}:00`));
  }

  function formatTimeRange(event) {
    return event.timeTbd ? 'Time to follow' : `${formatTime(event.start)}${event.end ? `–${formatTime(event.end)}` : ''}`;
  }

  function disciplineLabel(group) {
    return groups.find((item) => item.key === group)?.label || group;
  }

  function dateParts(date) {
    const eventDate = new Date(`${date}T12:00:00`);
    return {
      month: eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: eventDate.getDate(),
      weekday: eventDate.toLocaleDateString('en-US', { weekday: 'short' })
    };
  }

  function escapeIcs(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function downloadIcs(event) {
    const start = `${event.date.replaceAll('-', '')}T${event.start.replace(':', '')}00`;
    const end = event.end ? `${event.date.replaceAll('-', '')}T${event.end.replace(':', '')}00` : start;
    const timing = event.timeTbd
      ? [`DTSTART;VALUE=DATE:${event.date.replaceAll('-', '')}`]
      : [`DTSTART;TZID=America/Los_Angeles:${start}`, `DTEND;TZID=America/Los_Angeles:${end}`];
    const location = event.timeTbd ? [] : ['LOCATION:2029 Mt. Diablo Blvd., Walnut Creek, CA 94596'];
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Roots & Wisdom Studio//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@rootsandwisdomstudio.com`,
      ...timing,
      `SUMMARY:${escapeIcs(event.title)}`,
      ...location,
      `DESCRIPTION:${escapeIcs(event.note || `With ${event.instructor}`)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([calendar], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.date}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function instructorMarkup(event) {
    if (event.group === 'salsa' && event.instructor === 'DJ Super Chino + Luis Aguilar') {
      return 'with <a class="bio-link" href="#bio-dj-super-chino">DJ Super Chino</a> + <a class="bio-link" href="#bio-luis-aguilar">Luis Aguilar</a>';
    }
    if (event.group === 'salsa' && event.instructor === 'Luis') {
      return 'with <a class="bio-link" href="#bio-luis-aguilar">Luis Aguilar</a>';
    }
    return `with ${event.instructor}`;
  }

  function updateUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('group', activeGroup);
    window.history.replaceState({}, '', url);
  }

  function renderFilters() {
    filters.innerHTML = groups.map((group) => `
      <button class="group-button ${activeGroup === group.key ? 'active' : ''}" type="button" data-group="${group.key}" aria-pressed="${activeGroup === group.key}">
        <strong>${group.label}</strong>
        <span>${group.short}</span>
      </button>
    `).join('');

    filters.querySelectorAll('[data-group]').forEach((button) => {
      button.addEventListener('click', () => {
        activeGroup = button.dataset.group;
        updateUrl();
        render();
      });
    });
  }

  function renderProgramNote() {
    if (activeGroup === 'yoga') {
      programNote.innerHTML = '<div class="program-note yoga-note"><strong>Yoga</strong><span>6:00 AM Vinyasa Yoga on Tuesdays + Thursdays with Melissa.</span></div>';
      return;
    }
    if (activeGroup === 'mobility') {
      programNote.innerHTML = '<div class="program-note mobility-note"><strong>Mobility</strong><span>Ground-based Mobility Flow on Mondays + Wednesdays with Uriel.</span></div>';
      return;
    }
    programNote.innerHTML = '';
  }

  function renderEvents(events) {
    if (!events.length) {
      eventList.innerHTML = '<p class="empty-calendar">No upcoming dates are posted for this view yet.</p>';
      return;
    }

    eventList.innerHTML = events.map((event) => {
      const parts = dateParts(event.date);
      const classes = ['event-card', event.special ? 'special' : '', event.group, event.id, event.id === 'combined-2026-10-31' ? 'halloween' : '', event.id === 'capoeira-family-year-end-2026-12-05' ? 'year-end' : ''].filter(Boolean).join(' ');
      return `
        <article class="${classes}">
          <time datetime="${event.date}">
            <span>${parts.month}</span>
            <strong>${parts.day}</strong>
            <small>${parts.weekday}</small>
          </time>
          <div class="event-info">
            <div class="badges">
              <span class="discipline ${event.group}">${disciplineLabel(event.group)}</span>
              ${event.special ? '<span class="special-badge">★ SPECIAL EVENT</span>' : ''}
            </div>
            <h3>${event.title}</h3>
            <p>${formatTimeRange(event)} · ${instructorMarkup(event)}</p>
            ${event.note ? `<p class="note">${event.note}</p>` : ''}
            ${event.status === 'details-soon' ? '<span class="soon-label">Save the Date!</span>' : ''}
          </div>
          <button class="add-button" type="button" data-event-id="${event.id}" aria-label="Add ${event.title} to my calendar">Add to my calendar</button>
        </article>
      `;
    }).join('');

    eventList.querySelectorAll('[data-event-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const event = events.find((item) => item.id === button.dataset.eventId);
        if (event) downloadIcs(event);
      });
    });
  }

  function render() {
    const allEvents = buildEvents(new Date());
    const filtered = allEvents.filter((event) => (activeGroup === 'all' || event.group === activeGroup) && (!specialOnly.checked || event.special));
    const visibleEvents = filtered.filter((event, index) => index < 18 || event.special);
    const group = groups.find((item) => item.key === activeGroup);

    title.textContent = group.label;
    nextLabel.textContent = `NEXT UP FOR ${group.label.toUpperCase()}`;
    if (filtered[0]) {
      nextTitle.textContent = filtered[0].title;
      nextMeta.textContent = `${formatDate(filtered[0].date)} · ${formatTimeRange(filtered[0])}`;
    } else {
      nextTitle.textContent = 'No upcoming dates posted';
      nextMeta.textContent = '';
    }

    renderFilters();
    renderProgramNote();
    renderEvents(visibleEvents);
    hostBios.style.display = activeGroup === 'all' || activeGroup === 'salsa' ? '' : 'none';
  }

  specialOnly.addEventListener('change', render);
  render();
})();
