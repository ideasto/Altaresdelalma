# Recibir contactos en Google Sheets

El formulario ya está en la aplicación. Falta conectar un destino real; los registros actuales guardados en cada navegador no aparecen todavía en una planilla central. Google Sheets almacenará nombre, email, estado de suscripción, consentimiento y fecha; no fotos, cartas ni recuerdos. Esto no envía campañas de email. Nombre y email son obligatorios al crear el primer espacio; recibir novedades es opcional. La columna Estado distingue Suscrito, Registrado sin novedades y Baja solicitada. Usar para futuras novedades únicamente las filas Suscrito.

## Preparación en tu cuenta de Google

1. Crear una planilla nueva, por ejemplo «Contactos · Espacio para la Memoria». Mantener el archivo privado.
2. En la planilla, abrir **Extensiones → Apps Script**.
3. Sustituir el código inicial por todo el contenido de [Code.gs](../integrations/google-sheets/Code.gs), y guardar.
4. Elegir la función **inicializar** arriba y pulsar **Ejecutar**. Autorizar el acceso a esa planilla con tu cuenta. Se creará la pestaña Contactos y se guardará su identificador en las propiedades del script.
5. Pulsar **Implementar → Nueva implementación → Aplicación web**.
6. Seleccionar **Ejecutar como: yo** y **Quién tiene acceso: cualquier persona**. Esto hace público el receptor de formularios, no la planilla ni sus filas. Una cuenta de organización puede impedir ese ajuste; si ocurre, hay que revisar esa restricción.
7. Pulsar **Implementar** y copiar la **URL de la aplicación web**, que termina en `/exec`. No usar la URL de edición de la planilla ni la de pruebas `/dev`.
8. Compartir en el chat solamente esa URL `/exec`. No hace falta compartir contraseña, token de Google ni publicar la planilla.

## Trabajo que completa Codex al recibir la URL

- Configurar REACT_APP_CONTACT_ENDPOINT en el mismo proyecto Vercel.
- Compilar y actualizar el enlace principal; las variables de Create React App quedan incluidas al compilar.
- Enviar un registro sintético identificable, comprobar que aparece en la planilla y que repetir la solicitud actualiza la misma fila.
- Comprobar una solicitud de baja y retirar los datos de prueba.
- Confirmar en el navegador real que se recibe JSON con ok:true; no marcar un envío como correcto solo porque la solicitud HTTP no falló.

El script registra altas/bajas y evita fórmulas en celdas. Su URL es pública y puede recibir solicitudes ajenas al formulario: no demuestra que quien escribe un email sea su titular. Para campañas futuras, revisar confirmación del correo, bajas y medidas contra registros abusivos. No colocar claves privadas en el frontend.

Si se modifica el script después, actualizar la implementación a una versión nueva conservando la misma URL.
