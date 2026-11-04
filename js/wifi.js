/* Reglas de Wi-Fi independientes de la interfaz para poder probarlas sin DOM. */
(function (root) {
  'use strict';
  const bytes = value => new TextEncoder().encode(value).length;
  // El formato WIFI exige escapar estos caracteres, incluso dentro del SSID.
  const escape = value => value.replace(/[\\;,:\"]/g, '\\$&');
  function validate({ ssid, password, security }) {
    if (!ssid || !ssid.trim() || bytes(ssid) > 32) return 'El nombre de red debe ocupar entre 1 y 32 bytes.';
    if (/[\u0000-\u001f\u007f]/.test(ssid)) return 'El nombre de red no puede contener caracteres de control.';
    if (!['WPA', 'nopass'].includes(security)) return 'Selecciona un tipo de seguridad compatible.';
    if (security === 'WPA' && !(/^[\x20-\x7e]{8,63}$/.test(password) || /^[0-9a-fA-F]{64}$/.test(password))) return 'Usa de 8 a 63 caracteres ASCII o una clave hexadecimal de 64 dígitos.';
    return '';
  }
  function payload(data) {
    const error = validate(data);
    if (error) throw new Error(error);
    return `WIFI:T:${data.security};S:${escape(data.ssid)};P:${data.security === 'nopass' ? '' : escape(data.password)};H:${Boolean(data.hidden)};;`;
  }
  root.Wifi = Object.freeze({ validate, payload });
})(globalThis);
