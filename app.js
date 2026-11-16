'use strict';
(() => {
  const { sessions, weeks } = window.STUDY_PLAN;
  const KEY = 'soco-study-sessions-hs26-v1';
  const $ = id => document.getElementById(id);
  let storageOK = true;
  const state = { current: 0, checks: {}, notes: {}, finished: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        if (Number.isInteger(saved.current) && saved.current >= 0 && saved.current < sessions.length) state.current = saved.current;
        for (const s of sessions) {
          if (Array.isArray(saved.checks?.[s.id])) state.checks[s.id] = s.tasks.map((_, i) => saved.checks[s.id][i] === true);
          if (typeof saved.notes?.[s.id] === 'string') state.notes[s.id] = saved.notes[s.id].slice(0, 20000);
        }
        state.finished = saved.finished === true;
      }
    }
  } catch { storageOK = false; }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch { storageOK = false; }
    $('save-state').classList.toggle('warning', !storageOK);
    $('save-state').innerHTML = storageOK ? '<span aria-hidden="true">✓</span> Saved on this browser' : 'Progress can’t be saved in this browser. Keep this tab open.';
  }
  const isDone = i => sessions[i].tasks.every((_, j) => state.checks[sessions[i].id]?.[j] === true);
  function link(label, href) {
    const a = document.createElement('a'); a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', label + ' (opens in a new tab)'); return a;
  }
  function renderNavigation() {
    const nav = $('session-nav'); nav.replaceChildren();
    weeks.forEach(w => {
      const group = document.createElement('div'); group.className = 'week-group';
      const heading = document.createElement('p'); heading.className = 'week-label';
      const name = document.createElement('span'); name.textContent = w.title;
      const dates = document.createElement('span'); dates.textContent = w.dates;
      heading.append(name, dates); group.append(heading);
      w.sessions.forEach(i => {
        const s = sessions[i]; const done = isDone(i);
        const button = document.createElement('button'); button.className = 'session-link' + (done ? ' complete' : '');
        if (i === state.current && !state.finished) button.setAttribute('aria-current', 'step');
        button.setAttribute('aria-label', `Session ${i + 1}: ${s.short}, ${s.minutes} minutes${done ? ', complete' : ''}`);
        const number = document.createElement('span'); number.className = 'session-num'; number.setAttribute('aria-hidden', 'true'); number.textContent = done ? '✓' : String(i + 1);
        const text = document.createElement('span');
        const title = document.createElement('span'); title.className = 'session-name'; title.textContent = s.short;
        const duration = document.createElement('small'); duration.textContent = `${s.minutes} min${done ? ' · complete' : ''}`;
        text.append(title, duration); button.append(number, text); button.addEventListener('click', () => navigate(i)); group.append(button);
      });
      nav.append(group);
    });
    const count = sessions.filter((_, i) => isDone(i)).length;
    $('overall-count').textContent = `${count} of ${sessions.length} sessions`;
    $('overall-percent').textContent = `${Math.round(count / sessions.length * 100)}%`;
    $('overall-progress').value = count;
  }
  function updateTasks() {
    const s = sessions[state.current];
    const count = s.tasks.filter((_, j) => state.checks[s.id]?.[j] === true).length;
    const remaining = s.tasks.length - count;
    $('task-count').textContent = `${count} of ${s.tasks.length} done`;
    $('task-progress').style.width = `${count / s.tasks.length * 100}%`;
    const last = state.current === sessions.length - 1;
    const all = sessions.every((_, i) => isDone(i));
    $('next').disabled = remaining > 0;
    $('next').replaceChildren(document.createTextNode(last ? (all ? 'Finish study plan ' : 'Review unfinished ') : 'Next session '));
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '→'; $('next').append(arrow);
    $('next-hint').textContent = remaining > 0 ? `Tick ${remaining === 1 ? 'the last step' : `all ${remaining} remaining steps`} to continue` : 'Session complete. Ready to move on.';
  }
  function render() {
    if (!sessions.every((_, i) => isDone(i))) state.finished = false;
    renderNavigation();
    document.querySelector('.session-card').hidden = state.finished;
    $('finish').hidden = !state.finished;
    const s = sessions[state.current]; const w = weeks[s.week];
    $('session-position').textContent = state.finished ? 'YOUR STUDY PLAN · COMPLETE' : `SESSION ${state.current + 1} OF ${sessions.length} · ${w.title}`;
    $('week-dates').textContent = `${w.full} · ${w.budget} planned this week`;
    $('session-category').textContent = s.category;
    $('session-meta').replaceChildren();
    for (const text of [`${s.minutes} min`, s.chapters]) { const span = document.createElement('span'); span.textContent = text; $('session-meta').append(span); }
    $('session-title').textContent = s.title; $('session-description').textContent = s.description;
    $('exit-check').textContent = s.exit; $('reference-content').innerHTML = s.reference;
    $('reference').open = false; document.querySelector('.notes-panel').open = Boolean(state.notes[s.id]);
    $('notes').value = state.notes[s.id] || '';
    const list = $('task-list'); list.replaceChildren();
    s.tasks.forEach((t, j) => {
      const row = document.createElement('div'); row.className = 'task';
      const input = document.createElement('input'); input.type = 'checkbox'; input.id = `task-${s.id}-${j}`; input.checked = state.checks[s.id]?.[j] === true;
      row.classList.toggle('done', input.checked);
      const body = document.createElement('div'); const label = document.createElement('label'); label.htmlFor = input.id; label.textContent = t.title;
      const desc = document.createElement('p'); desc.className = 'task-description'; desc.id = `${input.id}-description`; desc.textContent = t.description;
      input.setAttribute('aria-describedby', desc.id); body.append(label, desc);
      if (t.links?.length) { const links = document.createElement('div'); links.className = 'task-links'; t.links.forEach(([label, href]) => links.append(link(label, href))); body.append(links); }
      const duration = document.createElement('span'); duration.className = 'task-duration'; duration.textContent = `${t.minutes} min`;
      input.addEventListener('change', () => {
        if (!state.checks[s.id]) state.checks[s.id] = s.tasks.map(() => false);
        state.checks[s.id][j] = input.checked; state.finished = false; row.classList.toggle('done', input.checked);
        save(); renderNavigation(); updateTasks();
        $('announcer').textContent = isDone(state.current) ? 'Session complete. The next button is ready.' : $('task-count').textContent;
      });
      row.append(input, body, duration); list.append(row);
    });
    $('previous').disabled = state.current === 0;
    updateTasks();
    document.title = state.finished ? 'Plan complete · SoCo' : `Session ${state.current + 1} · ${s.title} · SoCo`;
    save();
  }
  function navigate(i) {
    if (i < 0 || i >= sessions.length) return;
    state.current = i; state.finished = false; render();
    if (window.innerWidth <= 800) $('main').scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
    $('session-title').focus({ preventScroll: true });
  }
  $('previous').addEventListener('click', () => navigate(state.current - 1));
  $('next').addEventListener('click', () => {
    if (!isDone(state.current)) return;
    if (state.current < sessions.length - 1) navigate(state.current + 1);
    else {
      const nextIncomplete = sessions.findIndex((_, i) => !isDone(i));
      if (nextIncomplete >= 0) navigate(nextIncomplete);
      else { state.finished = true; render(); $('finish').scrollIntoView({ block: 'start', behavior: 'instant' }); $('announcer').textContent = 'All nine sessions complete.'; }
    }
  });
  $('notes').addEventListener('input', e => { state.notes[sessions[state.current].id] = e.target.value; save(); });
  $('review').addEventListener('click', () => navigate(0));
  $('home').addEventListener('click', e => { e.preventDefault(); navigate(state.current); });
  const dialog = $('resources-dialog');
  $('open-resources').addEventListener('click', () => dialog.showModal());
  $('close-resources').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  const resources = [
    { title: 'The study guide', desc: 'Core concepts, learning-goal mapping, exam approach and sources.', links: [['Open PDF guide', 'resources/SoCo_Study_Guide_HS26.pdf']] },
    { title: 'Exam A · Foundations', desc: 'Official-exam style. Use selected questions in Sessions 1–2 and 5–6.', links: [['Questions', 'resources/SoCo_Practice_Exam_A.pdf'], ['Solutions & rubric', 'resources/SoCo_Practice_Exam_A_Solutions.pdf']] },
    { title: 'Exam B · Storage & data', desc: 'Archiving, persistence, testing, binary data and databases.', links: [['Questions', 'resources/SoCo_Practice_Exam_B.pdf'], ['Solutions & rubric', 'resources/SoCo_Practice_Exam_B_Solutions.pdf']] },
    { title: 'Exam C · Final rehearsal', desc: 'Save the questions for Session 7 and the solutions for Session 8.', links: [['Questions', 'resources/SoCo_Practice_Exam_C.pdf'], ['Solutions & rubric', 'resources/SoCo_Practice_Exam_C_Solutions.pdf']] },
    { title: 'Software Design by Example', desc: 'Greg Wilson’s Python book. Chapter links also appear in each session.', links: [['Open the book', 'https://third-bit.com/sdxpy/']] }
  ];
  resources.forEach(r => {
    const row = document.createElement('div'); row.className = 'resource-row';
    const h = document.createElement('h3'); h.textContent = r.title;
    const p = document.createElement('p'); p.textContent = r.desc;
    const links = document.createElement('div'); links.className = 'task-links'; r.links.forEach(([label, href]) => links.append(link(label, href)));
    row.append(h, p, links); $('resource-list').append(row);
  });
  render();
})();
