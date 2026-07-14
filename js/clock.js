let clockInterval = null;

function parseTimezoneOffset(timezone) {
  if (!timezone) return 0;
  const match = timezone.match(/UTC([+-]\d+(?::\d+)?)/);
  if (!match) return 0;
  const parts = match[1].split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  return hours + minutes / 60;
}

function getLocalTime(offsetHours) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + offsetHours * 3600000);
}

function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function startClock(timezone, clockElement, dateElement) {
  stopClock();
  const offset = parseTimezoneOffset(timezone);

  function update() {
    const localTime = getLocalTime(offset);
    clockElement.textContent = formatTime(localTime);
    if (dateElement) {
      dateElement.textContent = formatDate(localTime);
    }
  }

  update();
  clockInterval = setInterval(update, 1000);
}

export function stopClock() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}
