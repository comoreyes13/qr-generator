/* Coordina el formulario, genera la etiqueta y exporta sin llamadas de red. */
'use strict';
const $ = id => document.getElementById(id);
const form = $('wifi-form');
const canvas = $('label-canvas');
const ctx = canvas.getContext('2d');
const logo = new Image();
logo.src = 'assets/isyred-logo.jpeg';
let ready = false;
let revision = 0;

function status(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}
// Invalidar en cada cambio evita descargar o imprimir una etiqueta anterior.
function invalidate() {
  revision++;
  ready = false;
  canvas.hidden = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  $('placeholder').hidden = false;
  $('download').disabled = $('print').disabled = true;
  status('Genera la etiqueta con los datos actuales.');
}
form.addEventListener('input', invalidate);
$('security').addEventListener('change', () => {
  const open = $('security').value === 'nopass';
  $('password').disabled = open;
  $('password').required = !open;
  if (open) $('password').value = '';
});
$('toggle-password').addEventListener('click', () => {
  const visible = $('password').type === 'password';
  $('password').type = visible ? 'text' : 'password';
  $('toggle-password').textContent = visible ? 'Ocultar' : 'Mostrar';
  $('toggle-password').setAttribute('aria-pressed', String(visible));
});

// Ajustar texto conserva todos los caracteres; nunca se recorta una contraseña.
function drawText(text, x, y, maxWidth, size, weight = 500) {
  ctx.font = `${weight} ${size}px sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 16) {
    size--;
    ctx.font = `${weight} ${size}px sans-serif`;
  }
  ctx.fillText(text, x, y);
}
function drawLabel(data) {
  const qr = qrcode(0, 'H'); // Corrección alta para tolerar el pequeño logo central.
  qr.addData(Wifi.payload(data), 'Byte');
  qr.make();
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 1600, 1200);
  // Se recorta sólo el margen blanco del JPEG; se mantiene el logo original.
  ctx.drawImage(logo, 55, 155, 565, 245, 90, 60, 380, 165);
  ctx.fillStyle = '#12365d';
  drawText('Conéctate a tu Wi-Fi', 590, 140, 900, 58, 700);
  ctx.fillStyle = '#58718c';
  drawText('Escanea con la cámara de tu teléfono', 590, 203, 900, 30);
  const count = qr.getModuleCount();
  const unit = Math.floor(740 / (count + 8));
  const full = (count + 8) * unit;
  const left = Math.round((1600 - full) / 2);
  const top = 250;
  ctx.fillStyle = '#000';
  // Margen de cuatro módulos y píxeles enteros para preservar la lectura.
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) ctx.fillRect(left + (col + 4) * unit, top + (row + 4) * unit, unit, unit);
    }
  }
  // El logo ocupa menos del 18% del lado y lleva un fondo blanco de separación.
  const centerX = 800;
  const centerY = top + full / 2;
  const logoWidth = count * unit * 0.17;
  const logoHeight = logoWidth * 245 / 565;
  ctx.fillStyle = '#fff';
  ctx.fillRect(centerX - logoWidth / 2 - 8, centerY - logoHeight / 2 - 8, logoWidth + 16, logoHeight + 16);
  ctx.drawImage(logo, 55, 155, 565, 245, centerX - logoWidth / 2, centerY - logoHeight / 2, logoWidth, logoHeight);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#526c86';
  drawText('RED WI-FI', 800, 1020, 1440, 24, 700);
  ctx.fillStyle = '#12365d';
  drawText(data.ssid, 800, 1072, 1440, 46, 700);
  ctx.fillStyle = '#526c86';
  drawText(data.security === 'nopass' ? 'Red abierta · Sin contraseña' : `Contraseña: ${data.password}`, 800, 1142, 1440, 36);
  ctx.textAlign = 'start';
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  invalidate();
  const current = revision;
  const data = { ssid: $('ssid').value, password: $('password').value, security: $('security').value, hidden: $('hidden').checked };
  const error = Wifi.validate(data);
  if (error) return status(error, true);
  try {
    await logo.decode();
    if (revision !== current) return;
    drawLabel(data);
    ready = true;
    canvas.hidden = false;
    $('placeholder').hidden = true;
    $('download').disabled = $('print').disabled = false;
    status('Etiqueta lista. Verifica los datos y prueba el QR con tu teléfono.');
  } catch {
    status('No se pudo generar la etiqueta. Recarga la página y comprueba los archivos locales.', true);
  }
});
$('download').addEventListener('click', () => {
  if (!ready) return;
  const current = revision;
  canvas.toBlob(blob => {
    if (!blob || !ready || current !== revision) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isyred-etiqueta-wifi.png'; // No incluir credenciales en nombres de archivos.
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});
$('print').addEventListener('click', () => { if (ready) window.print(); });
$('clear').addEventListener('click', () => {
  form.reset();
  $('password').disabled = false;
  $('password').required = true;
  $('password').type = 'password';
  $('toggle-password').textContent = 'Mostrar';
  $('toggle-password').setAttribute('aria-pressed', 'false');
  invalidate();
  status('Datos eliminados. Puedes preparar otra etiqueta.');
  $('ssid').focus();
});
