# ISYRED · Generador de etiquetas Wi-Fi

Herramienta estática para preparar etiquetas de router de **80 × 60 mm**, con logo ISYRED, QR de conexión, nombre de red y contraseña legibles. HTML, CSS y JavaScript separados, sin compilación ni backend. Dominio previsto: `qr.isyre.com`; despliegue pendiente de revisión local.

## Probar localmente

Con Python 3 instalado, desde esta carpeta:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8765. Detener el servidor con `Ctrl+C`. No hace falta Node.js para usar la aplicación.

1. Introducir exactamente el SSID y contraseña configurados en el router.
2. Seleccionar WPA/WPA2 Personal o red abierta; indicar si la red está oculta.
3. Generar y revisar la etiqueta. Cambiar datos invalida el resultado anterior.
4. Descargar PNG de 1600 × 1200 px o imprimir en papel de 80 × 60 mm, a tamaño real/100%, sin encabezados ni pies del navegador. Revisar los ajustes de márgenes y tamaño admitidos por la impresora.
5. Probar el QR impreso con Android y iPhone antes de pegarlo. La cámara ofrece conectarse; puede requerir confirmación del usuario. La red debe existir y estar al alcance. Esta herramienta no configura el router.

## Organización

- `index.html`: estructura semántica, formulario, políticas de contenido.
- `css/styles.css`: identidad visual, diseño adaptable e impresión.
- `js/wifi.js`: validación y formato estándar `WIFI:`, con escape de separadores.
- `js/app.js`: interfaz, dibujo de QR y logo, descarga y limpieza.
- `assets/isyred-logo.jpeg`: logo original proporcionado por ISYRED; sólo se recorta su margen blanco al dibujar.
- `vendor/`: biblioteca QR con versión fija y avisos originales.
- `tests/wifi.test.cjs`: pruebas del formato y límites de credenciales.

## Seguridad y compatibilidad

No se envían credenciales, no hay analítica, cookies, almacenamiento local ni peticiones a APIs. Los datos viven en memoria y en la etiqueta generada. El PNG, la impresión y el QR contienen la contraseña; conservarlos como datos de acceso. «Limpiar datos» borra formulario y canvas, pero no archivos descargados ni la cola de impresión.

SSID: máximo 32 bytes UTF-8, sin recortar espacios. WPA/WPA2 Personal: 8–63 caracteres ASCII o 64 dígitos hexadecimales. No soporta redes empresariales, portales cautivos ni WPA3 exclusivo. Las redes mixtas deben permitir WPA2. La compatibilidad final depende de la cámara y del sistema operativo.

El QR usa negro sobre blanco, margen de cuatro módulos, módulos enteros y corrección H. El logo central es pequeño para limitar la obstrucción; probar la lectura física sigue siendo necesario, especialmente con credenciales largas o impresoras térmicas.

## Verificación

Pruebas automáticas opcionales con Node.js 18 o superior:

```sh
node --test tests/wifi.test.cjs
```

Revisión manual: generación, cambio de credenciales, contraseña inválida, SSID Unicode y con `; , : " \\`, red abierta/oculta, limpiar datos, descarga PNG, impresión, pantallas pequeñas y lectura en teléfonos reales. No usar credenciales de clientes como datos de prueba.

## Publicación posterior

Servir `index.html`, `css/`, `js/`, `assets/` y `vendor/` desde cualquier hosting estático con HTTPS. No se requieren secretos ni variables de entorno. Excluir `.git/`, pruebas y archivos de trabajo. Configurar DNS y TLS para `qr.isyre.com` en el proveedor elegido después de aprobar la prueba local. No se ha añadido despliegue automático.

La restricción `connect-src 'none'` impide solicitudes de datos desde scripts. Al publicar, conviene enviar también cabeceras HTTP `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y una política CSP `frame-ancestors 'none'` (esta última requiere cabecera HTTP). El acceso restringido al equipo, si se desea, se configura en el hosting.
