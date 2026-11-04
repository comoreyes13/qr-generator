// Ejecutar con Node.js: node --test tests/wifi.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../js/wifi.js');
const base = { ssid: 'ISYRED-Prueba', password: 'Prueba1234', security: 'WPA', hidden: false };

test('Codifica conexión WPA sin modificar credenciales', () => {
  assert.equal(Wifi.payload(base), 'WIFI:T:WPA;S:ISYRED-Prueba;P:Prueba1234;H:false;;');
});
test('Escapa separadores y conserva espacios y Unicode del SSID', () => {
  assert.equal(Wifi.payload({ ...base, ssid: ' Casa;ñ,:"\\ ' }), 'WIFI:T:WPA;S: Casa\\;ñ\\,\\:\\"\\\\ ;P:Prueba1234;H:false;;');
  assert.equal(Wifi.payload({ ...base, password: 'a;b:c,d"e\\' }), 'WIFI:T:WPA;S:ISYRED-Prueba;P:a\\;b\\:c\\,d\\"e\\\\;H:false;;');
});
test('Valida longitud en bytes UTF-8 y controles', () => {
  assert.equal(Wifi.validate({ ...base, ssid: 'ñ'.repeat(16) }), '');
  assert.ok(Wifi.validate({ ...base, ssid: 'ñ'.repeat(17) }));
  for (const ssid of ['', '   ', 'a\nb', 'a'.repeat(33)]) assert.ok(Wifi.validate({ ...base, ssid }));
});
test('Valida claves WPA y no recorta contraseñas', () => {
  for (const password of ['1234567', 'x'.repeat(64), 'contraseña']) assert.ok(Wifi.validate({ ...base, password }));
  for (const password of ['12345678', 'x'.repeat(63), 'a'.repeat(64), ' 123456 ']) assert.equal(Wifi.validate({ ...base, password }), '');
});
test('Red abierta omite la contraseña previa y soporta red oculta', () => {
  assert.equal(Wifi.payload({ ...base, security: 'nopass', hidden: true }), 'WIFI:T:nopass;S:ISYRED-Prueba;P:;H:true;;');
  assert.throws(() => Wifi.payload({ ...base, security: 'invalid' }));
});
