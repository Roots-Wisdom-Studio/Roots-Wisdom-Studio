(() => {
  'use strict';

  const groups = [
    { key: 'all', label: 'Whole Studio', short: 'Everything at our house' },
    { key: 'capoeira', label: 'Capoeira Families', short: 'Kids, youth, teens + adults' },
    { key: 'salsa', label: 'Salsa Community', short: 'Classes + community socials' },
    { key: 'samba', label: 'Samba', short: 'Guest program with Isabel' },
    { key: 'mobility', label: 'Mobility', short: 'Ground-based mobility flow' },
    { key: 'yoga', label: 'Yoga', short: 'Returning soon' }
  ];

  const weeklyClasses = [
    { dow: 1, title: 'Ground-based Mobility Flow', start: '12:30', end: '13:30', group: 'mobility', instructor: 'Uriel' },
    { dow: 2, title: 'Kids Capoeira · Ages 4–7', start: '16:00', end: '17:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 2, title: 'Youth Capoeira · Ages 8–13', start: '17:00', end: '18:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 2, title: 'Teens + Adults Capoeira · Ages 14+', start: '18:00', end: '19:00', group: 'capoeira', instructor: 'Uriel' },
    // October 6 is already represented by the special series-launch event below.
    { dow: 2, title: 'Vem Sambar! — Six-Week Samba Journey', start: '19:30', end: '20:30', group: 'samba', instructor: 'Isabel De Montiel', starts: '2026-10-13', ends: '2026-11-10', note: 'Closed six-week cohort · $180 full series · No drop-ins.', registrationUrl: 'samba.html', registrationLabel: 'Program details →' },
    { dow: 3, title: 'Ground-based Mobility Flow', start: '14:00', end: '15:00', group: 'mobility', instructor: 'Uriel' },
    { dow: 3, title: 'Salsa — Absolute Beginner', start: '18:30', end: '19:25', group: 'salsa', instructor: 'Luis' },
    { dow: 3, title: 'Salsa — Advanced Beginner', start: '19:30', end: '20:25', group: 'salsa', instructor: 'Luis' },
    { dow: 4, title: 'Kids Capoeira · Ages 4–7', start: '16:00', end: '17:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 4, title: 'Youth Capoeira · Ages 8–13', start: '17:00', end: '18:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 4, title: 'Teens Capoeira · Ages 14–17', start: '18:00', end: '19:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 6, title: 'Youth Capoeira · Ages 8–13', start: '10:00', end: '11:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 6, title: 'Kids Capoeira · Ages 4–7', start: '11:00', end: '12:00', group: 'capoeira', instructor: 'Uriel' },
    { dow: 6, title: 'Teens + Adults Capoeira · Ages 14+', start: '12:00', end: '13:00', group: 'capoeira', instructor: 'Uriel' }
  ];

  const specialEvents = [
    { id: 'salsa-practica-2026-08-26', title: 'Salsa Práctica', date: '2026-08-26', start: '18:30', end: '20:00', group: 'salsa', instructor: 'Salsa Community', note: "Luis will be away for a last-minute family event. We'll practice the sequences we learned in class last week, and everyone is welcome to join us.", status: 'confirmed', special: true },
    { id: 'social-2026-09-19', title: 'First Salsa + Community Social', date: '2026-09-19', start: '16:00', end: '19:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Doors open at 3:30 PM · Advance reservation available · Payment due at the door.', status: 'registration-open', registrationUrl: 'https://rootsandwisdomsalsasocial.manus.space', registrationLabel: 'Register Now →', special: true },
    { id: 'samba-welcome-2026-09-29', title: 'Samba with Live Percussion — Welcome Workshop', date: '2026-09-29', start: '19:30', end: '20:30', group: 'samba', instructor: 'Isabel De Montiel + Marcos & Gui', note: '$30 workshop tuition · Beginners welcome · Featured live percussionists Marcos and Gui.', status: 'registration-open', registrationUrl: 'https://form.jotform.com/262537356025154', registrationLabel: 'Register Now →', special: true },
    { id: 'samba-series-launch-2026-10-06', title: 'Vem Sambar! 6-Week Series Launch (Oct 6 – Nov 10)', date: '2026-10-06', start: '19:30', end: '20:30', group: 'samba', instructor: 'Isabel De Montiel', note: 'Tuesdays 7:30–8:30 PM · Closed 6-Week Cohort ($180) · Pre-registration required.', status: 'registration-open', registrationUrl: 'https://form.jotform.com/262537661593163', registrationLabel: 'Register Now →', special: true },
    { id: 'halloween-2026-10-30', title: 'Halloween Salsa + Community Social', date: '2026-10-30', start: '18:00', end: '21:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Friday special — bring your best costume. Booking details to follow.', status: 'details-soon', special: true },
    { id: 'capoeira-family-year-end-2026-12-05', title: 'Capoeira Family Year-End Celebration', date: '2026-12-05', start: '12:00', group: 'capoeira', instructor: 'Capoeira Families', note: "Save the date! Let's gather, celebrate our kids and families, and close out a beautiful year of Capoeira together. More joy, more community, and more details coming soon!", status: 'details-soon', special: true, timeTbd: true },
    { id: 'social-2026-12-19', title: 'Year-End Salsa + Community Social', date: '2026-12-19', start: '16:00', end: '19:00', group: 'salsa', instructor: 'DJ Super Chino + Luis Aguilar', note: 'Booking details to follow.', status: 'details-soon', special: true }
  ];

  const salsaPrácticaDates = new Set(['2026-08-26']);

  const filters = document.getElementById('group-filters');
  const title = document.getElementById('group-title');
  const groupSummary = document.getElementById('group-summary');
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

  function isLastSaturday(date) {
    if (date.getDay() !== 6) return false;
    const nextSaturday = new Date(date);
    nextSaturday.setDate(date.getDate() + 7);
    return nextSaturday.getMonth() !== date.getMonth();
  }

  function buildEvents(startDate, days = 70) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const events = [];

    for (let offset = 0; offset <= days; offset += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + offset);
      const key = dateKey(day);
      const lastSaturday = isLastSaturday(day);

      weeklyClasses
        .filter((event) => event.dow === day.getDay())
        .filter((event) => !event.starts || key >= event.starts)
        .filter((event) => !event.ends || key <= event.ends)
        .filter((event) => !(lastSaturday && event.dow === 6))
        .filter((event) => !(salsaPrácticaDates.has(key) && event.group === 'salsa'))
        .forEach((event, index) => events.push({ ...event, id: `weekly-${key}-${index}`, date: key, status: event.status || 'confirmed' }));

      if (lastSaturday) {
        const halloween = key === '2026-10-31';
        events.push({
          id: `last-saturday-kids-${key}`,
          title: halloween ? 'Happy Halloween All-Kids Community Class' : 'All-Kids Community Class',
          date: key,
          start: '10:00',
          end: '11:00',
          group: 'capoeira',
          instructor: 'Uriel',
          note: halloween ? 'All kids ages 4–13 come together as a community at 10:00 AM—and costumes are a must! 🎃' : 'All kids ages 4–13 come together as a community at 10:00 AM.',
          status: 'confirmed',
          special: true
        });
        events.push({
          id: `last-saturday-adults-${key}`,
          title: 'Teens + Adults Capoeira · Ages 14+',
          date: key,
          start: '11:00',
          end: '12:00',
          group: 'capoeira',
          instructor: 'Uriel',
          note: 'Last-Saturday time: 11:00 AM instead of the usual 12:00 PM.',
          status: 'confirmed',
          special: true
        });
      }
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
    if (event.id === 'samba-welcome-2026-09-29') {
      return 'with <a class="bio-link" href="#bio-isabel-de-montiel">Isabel De Montiel</a> + Marcos &amp; Gui';
    }
    if (event.group === 'samba') {
      return `with <a class="bio-link" href="#bio-isabel-de-montiel">${event.instructor}</a>`;
    }
    if (event.group === 'capoeira' || event.group === 'mobility') {
      return `with <a class="bio-link" href="#bio-uriel-arauz">${event.instructor}</a>`;
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
      programNote.innerHTML = '<div class="program-note yoga-note"><strong>Yoga Returning Soon</strong><span>Yoga is returning soon. Class and instructor details will be shared once confirmed.</span></div>';
      return;
    }
    if (activeGroup === 'mobility') {
      programNote.innerHTML = '<div class="program-note mobility-note"><strong>Mobility</strong><span>Ground-based Mobility Flow on Mondays + Wednesdays with Uriel.</span></div>';
      return;
    }
    if (activeGroup === 'samba') {
      programNote.innerHTML = '<div class="program-note samba-note"><strong>Vem Sambar!</strong><span>Six-week guest program with Isabel · October 6–November 10 · Tuesdays, 7:30–8:30 PM · <a href="samba.html">Program details →</a></span></div>';
      return;
    }
    programNote.innerHTML = '';
  }

  function renderGroupSummary() {
    const summaries = {
      all: 'Browse upcoming classes, guest programs, and community gatherings.',
      salsa: 'Browse upcoming Salsa classes and community socials.',
      samba: 'Vem Sambar! runs October 6–November 10, Tuesdays, 7:30–8:30 PM. See program details for full-series registration.',
      capoeira: 'Browse upcoming Capoeira classes, combined family dates, and community gatherings.',
      yoga: 'Yoga is returning soon. Class and instructor details will be shared once confirmed.',
      mobility: 'Browse the active Monday and Wednesday Ground-based Mobility Flow schedule.'
    };
    groupSummary.textContent = summaries[activeGroup] || summaries.all;
  }

  function renderEvents(events) {
    if (!events.length) {
      eventList.innerHTML = '<p class="empty-calendar">No upcoming dates are posted for this view yet.</p>';
      return;
    }

    eventList.innerHTML = events.map((event) => {
      const parts = dateParts(event.date);
      const classes = ['event-card', event.special ? 'special' : '', event.group, event.id, event.id === 'last-saturday-kids-2026-10-31' ? 'halloween' : '', event.id === 'capoeira-family-year-end-2026-12-05' ? 'year-end' : ''].filter(Boolean).join(' ');
      return `
        <article class="${classes}" id="${event.id}">
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
              ${event.status === 'details-soon' ? '<span class="soon-label">Save the Date!</span>' : event.status === 'registration-open' ? '<span class="soon-label">Registration Open</span>' : ''}
          </div>
          <div class="event-actions">
            ${event.registrationUrl ? `<a class="register-button" href="${event.registrationUrl}" target="_blank" rel="noopener">${event.registrationLabel || 'Register'}</a>` : ''}
            <button class="add-button" type="button" data-event-id="${event.id}" aria-label="Add ${event.title} to my calendar">Add to my calendar</button>
          </div>
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
    renderGroupSummary();
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
    hostBios.style.display = '';
    document.getElementById('bio-dj-super-chino').style.display = activeGroup === 'all' || activeGroup === 'salsa' ? '' : 'none';
    document.getElementById('bio-luis-aguilar').style.display = activeGroup === 'all' || activeGroup === 'salsa' ? '' : 'none';
    document.getElementById('bio-isabel-de-montiel').style.display = activeGroup === 'all' || activeGroup === 'samba' ? '' : 'none';
    document.getElementById('bio-uriel-arauz').style.display = activeGroup === 'all' || activeGroup === 'capoeira' || activeGroup === 'mobility' ? '' : 'none';
  }

  specialOnly.addEventListener('change', render);
  render();
})();
