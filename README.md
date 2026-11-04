# ISYRED · Generador de etiquetas Wi-Fi

Herramienta estática para preparar etiquetas de router de **80 × 60 mm**, con logo ISYRED, QR de conexión, nombre de red y contraseña legibles. HTML, CSS y JavaScript separados, sin compilación ni backend. Dominio previsto: `qr.isyre.com`. Prueba local aprobada por Tirso el 3 de noviembre de 2026; publicación mediante GitHub y configuración del dominio a cargo de Tirso.

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

## Publicación con GitHub Pages

La versión local fue probada y aprobada por Tirso el 3 de noviembre de 2026. Los cambios se preparan en `dev` y se promueven a `main`, que es la rama de publicación. Dominio acordado: `qr.isyre.com` (sin la «d»).

### 1. Seleccionar la fuente de publicación

En el repositorio [qr-generator → Settings → Pages](https://github.com/comoreyes13/qr-generator/settings/pages), configurar **Build and deployment**:

| Campo | Valor |
| --- | --- |
| Source | `Deploy from a branch` |
| Branch | `main` |
| Folder | `/ (root)` |

Pulsar **Save**. No hace falta agregar un framework, tema o proceso de compilación. GitHub Pages publica los cambios que lleguen a `main`; subir sólo a `dev` no actualiza el sitio. El estado de la ejecución puede revisarse en la pestaña **Actions** del repositorio.

### 2. Registrar el dominio en GitHub

En **Custom domain**, escribir únicamente `qr.isyre.com`, sin `https://` ni rutas, y pulsar **Save**.

Al publicar desde una rama, GitHub crea un commit con el archivo `CNAME` en la raíz de esa rama. Su contenido debe ser:

```text
qr.isyre.com
```

Conservar ese archivo y traer el commit remoto a la copia local y a `dev` antes de continuar trabajando; no sobrescribir el cambio generado por GitHub.

### 3. Crear el registro DNS del subdominio

En el panel del proveedor que administra actualmente los DNS de `isyre.com`, agregar:

| Campo | Valor |
| --- | --- |
| Tipo | `CNAME` |
| Nombre / Host | `qr` |
| Destino / Valor | `comoreyes13.github.io` |
| TTL | Predeterminado del proveedor |

Algunos paneles solicitan el nombre completo `qr.isyre.com` en lugar de `qr`; revisar cómo muestra el proveedor el nombre final. El destino no lleva `https://`, `/qr-generator` ni otra ruta. El registro DNS `CNAME` y el archivo `CNAME` del repositorio son dos configuraciones distintas; ambas deben estar correctas.

No modificar los registros del dominio raíz, correo u otros subdominios. Si ya existe un registro para `qr`, revisar su uso antes de sustituirlo; un `CNAME` no debe coexistir con otros tipos de registro en ese mismo nombre.

### 4. Esperar la validación y activar HTTPS

Volver a **Settings → Pages** y esperar a que GitHub valide el DNS y emita el certificado. Un aviso inicial de comprobación pendiente o fallida puede deberse a la propagación del DNS; si persiste, revisar el nombre y destino del registro.

Cuando esté disponible, activar **Enforce HTTPS**. Después abrir [https://qr.isyre.com](https://qr.isyre.com), generar una etiqueta con datos ficticios y comprobar la descarga y la lectura del QR. Configurar el dominio no prueba por sí solo que el sitio ya esté disponible.

Si aparece un error 404, revisar que la publicación de **Actions** haya terminado correctamente, que la fuente sea `main` + `/ (root)` y que `index.html` permanezca en la raíz. Si falla HTTPS, revisar primero la validación DNS y el estado del certificado en Pages.

### Referencias oficiales

- [Configurar la fuente de publicación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
- [Configurar un dominio personalizado y un subdominio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain).
- [Solucionar problemas de dominios personalizados](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages).

### Consideraciones del hosting

La aplicación no requiere secretos, variables de entorno ni backend. No guardar credenciales de redes o datos de clientes en el repositorio. No se ha agregado un flujo de despliegue personalizado; Pages gestiona la publicación desde la rama seleccionada.

La restricción `connect-src 'none'` impide solicitudes de datos desde scripts. La CSP incluida en el HTML funciona sin configuración adicional. Si en el futuro se utiliza un hosting con control de cabeceras HTTP, se pueden agregar `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y CSP `frame-ancestors 'none'`; GitHub Pages no permite configurar directamente cabeceras HTTP personalizadas. La publicación estándar de Pages no restringe el acceso al equipo: conocer la URL permite abrir la herramienta, aunque las credenciales introducidas se procesan en el navegador.
