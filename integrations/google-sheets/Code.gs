// Copiar en el proyecto de Apps Script vinculado a TU planilla.
// Ejecutar inicializar una vez antes de implementar como aplicación web.
function inicializar() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Abrí Apps Script desde Extensiones en tu planilla.');
  PropertiesService.getScriptProperties().setProperty('CONTACT_SHEET_ID', book.getId());
  obtenerHoja_(book);
}

function obtenerHoja_(book) {
  var sheet = book.getSheetByName('Contactos');
  if (!sheet) sheet = book.insertSheet('Contactos');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Email', 'Nombre', 'Estado', 'Consentimiento', 'Versión del consentimiento', 'Alcance', 'Origen', 'Actualizado']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function respuesta_(ok, error) {
  return ContentService.createTextOutput(JSON.stringify({ok: ok, error: error || null}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Toda celda recibida se guarda como texto, nunca como fórmula.
function texto_(value, max) {
  var text = String(value || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 8192) return respuesta_(false, 'Solicitud inválida');
    var data = JSON.parse(raw);
    if (!data || !['register', 'subscribe', 'unsubscribe'].includes(data.action)) return respuesta_(false, 'Acción inválida');
    var email = String(data.email || '').trim().toLowerCase();
    var name = String(data.name || '').trim();
    if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !name || name.length > 80) {
      return respuesta_(false, 'Nombre o email inválido');
    }
    if (data.action !== 'register' && (!data.consentAt || !isFinite(Date.parse(data.consentAt)) || !data.consentVersion || !data.consentScope)) {
      return respuesta_(false, 'Falta consentimiento válido');
    }
    if (!lock.tryLock(10000)) return respuesta_(false, 'Reintentar');
    var id = PropertiesService.getScriptProperties().getProperty('CONTACT_SHEET_ID');
    if (!id) return respuesta_(false, 'Ejecutar inicializar primero');
    var sheet = obtenerHoja_(SpreadsheetApp.openById(id));
    var values = sheet.getDataRange().getValues();
    var row = 0;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).toLowerCase() === email) { row = i + 1; break; }
    }
    var record = [texto_(email, 120), texto_(name, 80), data.action === 'unsubscribe' ? 'Baja solicitada' : data.action === 'subscribe' ? 'Suscrito' : 'Registrado sin novedades',
      texto_(data.consentAt, 40), texto_(data.consentVersion, 80), texto_(data.consentScope, 500),
      texto_(data.source, 80), new Date().toISOString()];
    if (row) sheet.getRange(row, 1, 1, record.length).setValues([record]);
    else sheet.appendRow(record);
    return respuesta_(true);
  } catch (error) {
    // No devolver detalles de la cuenta o de la planilla al navegador.
    return respuesta_(false, 'No se pudo registrar. Reintentar.');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  // La URL pública recibe registros, pero nunca devuelve la lista de contactos.
  return respuesta_(true);
}
