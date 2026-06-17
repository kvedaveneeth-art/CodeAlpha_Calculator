const expressionEl = document.getElementById('expression');
const resultEl     = document.getElementById('result');

let currentVal  = '0';
let prevVal     = '';
let operator    = '';
let justEvaled  = false;

/* ── display ── */
function updateDisplay(val, expr = '') {
  expressionEl.textContent = expr;
  resultEl.textContent = val;
  resultEl.className = 'result';
  if (val.length > 12) resultEl.classList.add('small');
  if (val === 'Error') resultEl.classList.add('error');
}

/* ── evaluate ── */
function calc(a, op, b) {
  const x = parseFloat(a), y = parseFloat(b);
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  if (op === '×') return x * y;
  if (op === '÷') {
    if (y === 0) return 'Error';
    return x / y;
  }
  return b;
}

function fmt(n) {
  if (n === 'Error') return 'Error';
  const s = parseFloat(n.toPrecision(12)).toString();
  return s;
}

/* ── actions ── */
function handleAction(action, value) {
  switch (action) {
    case 'num':
      if (justEvaled) { currentVal = ''; justEvaled = false; }
      if (currentVal === '0' && value !== '.') currentVal = value;
      else if (currentVal.length < 15) currentVal += value;
      updateDisplay(currentVal, operator ? `${prevVal} ${operator}` : '');
      break;

    case 'decimal':
      if (justEvaled) { currentVal = '0'; justEvaled = false; }
      if (!currentVal.includes('.')) currentVal += '.';
      updateDisplay(currentVal, operator ? `${prevVal} ${operator}` : '');
      break;

    case 'op':
      justEvaled = false;
      if (operator && prevVal && currentVal !== '') {
        const res = calc(prevVal, operator, currentVal);
        if (res === 'Error') { updateDisplay('Error'); resetState(); return; }
        prevVal = fmt(res);
        currentVal = '';
        updateDisplay(prevVal, `${prevVal} ${value}`);
      } else {
        prevVal = currentVal || prevVal || '0';
        currentVal = '';
        updateDisplay(prevVal, `${prevVal} ${value}`);
      }
      operator = value;
      break;

    case 'equals':
      if (!operator || !prevVal) break;
      const target = currentVal !== '' ? currentVal : prevVal;
      const res = calc(prevVal, operator, target);
      const display = res === 'Error' ? 'Error' : fmt(res);
      updateDisplay(display, `${prevVal} ${operator} ${target} =`);
      currentVal = display;
      prevVal = '';
      operator = '';
      justEvaled = true;
      break;

    case 'clear':
      resetState();
      updateDisplay('0');
      break;

    case 'backspace':
      if (justEvaled) { resetState(); updateDisplay('0'); break; }
      currentVal = currentVal.length > 1 ? currentVal.slice(0, -1) : '0';
      updateDisplay(currentVal, operator ? `${prevVal} ${operator}` : '');
      break;

    case 'sign':
      if (currentVal && currentVal !== '0') {
        currentVal = currentVal.startsWith('-') ? currentVal.slice(1) : '-' + currentVal;
        updateDisplay(currentVal, operator ? `${prevVal} ${operator}` : '');
      }
      break;

    case 'percent':
      if (currentVal) {
        currentVal = fmt(parseFloat(currentVal) / 100);
        updateDisplay(currentVal, operator ? `${prevVal} ${operator}` : '');
      }
      break;

    case 'sqrt':
      if (currentVal) {
        const n = parseFloat(currentVal);
        if (n < 0) { updateDisplay('Error'); return; }
        currentVal = fmt(Math.sqrt(n));
        updateDisplay(currentVal);
      }
      break;

    case 'square':
      if (currentVal) {
        currentVal = fmt(parseFloat(currentVal) ** 2);
        updateDisplay(currentVal);
      }
      break;

    case 'inverse':
      if (currentVal) {
        if (parseFloat(currentVal) === 0) { updateDisplay('Error'); return; }
        currentVal = fmt(1 / parseFloat(currentVal));
        updateDisplay(currentVal);
      }
      break;
  }
}

function resetState() {
  currentVal = '0'; prevVal = ''; operator = ''; justEvaled = false;
}

/* ── click handler ── */
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', e => {
    rippleEffect(e, btn);
    handleAction(btn.dataset.action, btn.dataset.value);
  });
});

/* ── keyboard ── */
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') handleAction('num', e.key);
  else if (e.key === '.') handleAction('decimal');
  else if (e.key === '+') handleAction('op', '+');
  else if (e.key === '-') handleAction('op', '−');
  else if (e.key === '*') handleAction('op', '×');
  else if (e.key === '/') { e.preventDefault(); handleAction('op', '÷'); }
  else if (e.key === 'Enter' || e.key === '=') handleAction('equals');
  else if (e.key === 'Backspace') handleAction('backspace');
  else if (e.key === 'Escape') handleAction('clear');
  else if (e.key === '%') handleAction('percent');
});

/* ── ripple ── */
function rippleEffect(e, btn) {
  const circle = document.createElement('span');
  const d = Math.max(btn.clientWidth, btn.clientHeight);
  const r = btn.getBoundingClientRect();
  circle.className = 'ripple';
  circle.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;
  btn.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}