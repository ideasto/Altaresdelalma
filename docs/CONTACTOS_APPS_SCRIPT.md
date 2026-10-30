# Conectar los contactos a Google Sheets (pendiente)

Hoy `REACT_APP_CONTACT_ENDPOINT` (frontend/.env) está vacío. Por eso los contactos quedan en el navegador de cada persona (clave `altares_contact_v1`, estado `pending-no-endpoint`) y **no llegan a ninguna planilla**.

## Qué se envía (solo esto)
`{ action: "subscribe" | "unsubscribe", name, email, consentAt, consentVersion, consentScope, source }`
Nunca se envían cartas, fotos, nombres de seres amados ni contenido de los espacios.
Las celdas que empiezan con `= + - @` llevan un `'` delante para que no se tomen como fórmulas.

## Apps Script sugerido (Extensiones → Apps Script en la planilla)
```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var safe = function (v) { v = String(v || "").slice(0, 200); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.replace(/^'/, ""))) return out({ ok: false });
  var sh = SpreadsheetApp.getActive().getSheetByName("Contactos");
  var rows = sh.getDataRange().getValues();
  var i = rows.findIndex(function (r) { return r[1] === safe(d.email); });
  var row = [safe(d.name), safe(d.email), d.consentAt, d.consentVersion, d.consentScope, d.action === "unsubscribe" ? "BAJA" : "ALTA", new Date()];
  if (i >= 0) sh.getRange(i + 1, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
  return out({ ok: true });
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
```
Publicar como **Aplicación web** → Ejecutar como: vos · Acceso: cualquiera. La planilla queda privada (solo el script escribe; nadie puede leerla desde la app). Copiar la URL `/exec` y pasarla para cargarla en `REACT_APP_CONTACT_ENDPOINT`.

La app solo marca «enviado» cuando el script responde `{ ok: true }`. Si no hay conexión, reintenta sola con espera creciente y sin duplicar.
