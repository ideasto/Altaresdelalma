# Duelo, memoria y experiencia digital

Fecha: 6 de noviembre de 2026. Documento de trabajo para Mensajes Ancestrales / Espacio para la Memoria, de La Gata y la Magia.

## 1. Alcance y nivel de certeza

Este documento desarrolla el análisis que puede hacerse ahora: revisión del producto y del código, marco conceptual, hipótesis de posicionamiento, propuestas de textos, mejoras pequeñas y plan de investigación con personas.

**La investigación web actualizada sigue pendiente.** No hay buscador conectado y la política de red del entorno no habilita las fuentes de duelo o competidores. El intento de guardar una ampliación de acceso fue rechazado por el sistema de configuración con `draft_not_editable`; una segunda lectura devolvió el mismo borrador. No se modificaron las restricciones, no se consultaron los sitios de la matriz y no se presentan precios, disponibilidad, idiomas, valoraciones, cifras de usuarios ni funcionalidades actuales como hechos verificados.

La propuesta de acceso se conserva en `ACCESO_WEB_PROPUESTO.json`; no está aplicada ni guardada en el borrador del servicio. La matriz `FUENTES_Y_COMPETIDORES.csv` indica exactamente qué falta consultar. La revisión de fuentes debe completar este documento, no borrarle estas limitaciones sin evidencia.

Convenciones:

- **Observado:** comportamiento o texto presente en el repositorio, o confirmado por la persona usuaria.
- **Marco conceptual:** bibliografía identificada, no releída en línea durante esta tarea. No implica evidencia de eficacia de esta aplicación.
- **Hipótesis:** idea que requiere entrevistas, búsqueda o experimento.
- **Propuesta:** cambio posible; no está implementado ni aprobado por estar en este informe.

Se interpreta «apps de Duolingo» como una transcripción de «apps de duelo». La gamificación se considera por separado, sin asumir que el duelo deba parecerse a un curso.

## 2. Conclusión de trabajo

La dirección recomendada es **un espacio personal para recordar, escribir y crear algo tangible**, con ayuda para empezar. No se ha demostrado que sea una categoría vacía ni que la combinación sea única.

El diferencial que conviene probar es la combinación de: lenguaje cercano en español, cartas y recuerdos personales, piezas que se pueden imprimir, un ambiente cuidado y control sobre el contenido. Cada componente tiene sustitutos; el valor tendría que estar en cómo se unen y en cómo se siente usarlos.

Una posible promesa para probar:

> Un lugar para guardar recuerdos de alguien que querés, escribirle y crear un libro para conservar.

Versión centrada en el primer paso:

> Podés empezar con una foto, una frase o algo que hoy quieras escribir. No hace falta contar toda su historia.

No usar por ahora «la primera app», «no existe nada parecido», «sana tu duelo», «superá tu pérdida», «conserva tus recuerdos para siempre» ni «sin riesgo de perder nada». No hay evidencia para esas afirmaciones y el almacenamiento actual requiere cuidado y respaldo.

## 3. Qué producto existe hoy

**Observado en el código:** hay espacios personales, galería de fotos, cartas, cronología, mazo con frases propias y libro de recuerdos. Los cinco módulos exportan PDF. Hay papelera, borradores, respaldo y restauración. El contenido se guarda en el navegador por dirección; no hay una cuenta que sincronice recuerdos entre dispositivos. El sitio es público, pero los espacios guardados en un navegador no son memoriales públicos.

**Confirmado por la persona usuaria:** un registro real llegó a Google Sheets. Esto confirma ese envío, no todas las variantes de baja o de registro sin novedades en la planilla real. Los contactos y el consentimiento son distintos de los recuerdos. No se necesitan los textos de cartas ni las fotos para investigar la recepción de la propuesta.

**Observado:** al crear el primer espacio se exige nombre y email, con suscripción a novedades opcional, tal como se acordó. El mazo se llama «Mazo Oráculo»; el inicio dice «a quienes amamos» y varios mensajes se refieren a «santuario». El nombre visible es Espacio para la Memoria; el proyecto sigue usando otros nombres históricos. Hay una hipótesis de confianza y claridad que revisar, no un error funcional por definición.

**Límite central para el producto:** no confundir «se guardó», «se descargó un PDF» y «se descargó un respaldo restaurable». Un PDF sirve para leer o imprimir. El JSON sirve para restaurar la estructura editable y sus datos. Una persona puede creer que el email funciona como cuenta de recuperación aunque no sea así. Hay que preguntarlo en las pruebas y explicar la diferencia cerca del momento de guardar.

## 4. Duelo: criterios para diseñar sin imponer un proceso

### Una ruta lineal por etapas no es la opción recomendada

El duelo puede incluir cambios, vueltas, descanso, tristeza, humor, enojo y momentos de vida cotidiana. Una interfaz que diga «etapa 1 completada» puede comunicar una norma que la persona no reconoce en sí misma. El modelo de proceso dual de Stroebe y Schut [B1] ofrece un marco útil para pensar la alternancia entre atender la pérdida y atender la vida cotidiana. No prueba que una pantalla concreta ayude clínicamente.

**Decisión propuesta:** reemplazar «tu etapa» por «qué te gustaría hacer hoy». Permitir saltar, volver, dejar incompleto y no entrar durante mucho tiempo. Si se habla de etapas en material editorial, aclarar que no son una secuencia obligatoria ni una evaluación de la persona [B4].

### Mantener un vínculo puede tener sentido, sin convertirlo en mandato

La perspectiva de vínculos continuos [B2] permite pensar cartas, objetos y recuerdos sin exigir «olvidar» o «cerrar». No significa que escribirle o mirar fotos le sirva a todo el mundo, todo el tiempo. El producto puede ofrecer esas prácticas y también la posibilidad de no hacerlas.

**Decisión propuesta:** «Podés escribirle si hoy te sirve» en lugar de «Escribir una carta te va a ayudar». No pedir una despedida, un perdón ni una lección positiva como condición para avanzar.

### Hacer espacio para historias distintas

No todos los vínculos fueron amorosos o simples. No todos recuerdan fechas, tienen fotos o quieren explicar de qué murió alguien. Un espacio puede contener afecto, ambivalencia, enojo o silencio. No pedir detalles traumáticos para personalizar la experiencia.

**Decisión propuesta:** fechas opcionales, relación opcional si se agrega, símbolos elegibles, ausencia de foto aceptada y consignas que no presuponen buenos recuerdos. Mantener las fechas parciales que ya permite el producto.

### No equiparar uso de la app con evolución del duelo

La diversidad de respuestas a una pérdida se describe, entre otros trabajos, en Bonanno [B3]. No se debe inferir bienestar a partir del número de cartas, días de uso o tiempo sin entrar. Las investigaciones sobre intervenciones profesionales o programas clínicos específicos no pueden trasladarse directamente a esta herramienta.

**Decisión propuesta:** sin rachas, puntos por escribir, calificación de ánimo, cuenta atrás de recuperación ni avisos que culpabilicen. Para una futura guía que prometa acompañamiento psicológico, trabajar el contenido y los límites con profesionales, y buscar evidencia específica antes de formular esa promesa.

## 5. Mapa competitivo para verificar

Esta es una **lista de candidatos y preguntas**, basada en conocimiento previo. No es una comparación actualizada de productos probados. Las categorías se superponen. No se instaló ninguna app ni se inspeccionaron sus versiones, privacidad, precios o accesibilidad en esta tarea.

| Grupo | Candidatos a consultar | Pregunta para la investigación | Implicación para este proyecto |
| --- | --- | --- | --- |
| Acompañamiento y contenidos de duelo | Grief Works, Untangle, MyGrief.ca, Apart of Me, Good Grief | ¿Qué ofrecen realmente hoy, para quién, con qué evidencia y en qué idiomas? | No competir por prometer tratamiento; evaluar cómo invitan a empezar y pausar |
| Educación y recursos | What's Your Grief, Refuge in Grief, Cruse, Sue Ryder, Fundación Mario Losantos del Campo | ¿Qué vocabulario usan, qué situaciones incluyen y cómo delimitan orientación y atención profesional? | Mejorar claridad, límites y recursos de ayuda sin copiar contenidos |
| Memoriales y homenajes | MuchLoved, ForeverMissed, Ever Loved | ¿Qué es público o privado, quién puede colaborar y cómo se exporta? | La privacidad local es distinta de una página de homenaje compartida; explicar la diferencia |
| Historia de vida y libro | Storyworth, Remento | ¿Cómo pasan de una pregunta pequeña a una historia y a un objeto físico? | Es la comparación más útil para valorar el libro, además de las apps de duelo |
| Mensajes diferidos y legado | FutureMe | ¿Qué problema resuelve enviar algo al futuro y qué dependencia del servicio crea? | No confundir esta promesa con guardar recuerdos hoy |
| Memoria e IA conversacional | HereAfter AI | ¿Qué se conserva, qué se genera, quién consiente y qué pasa al cerrar el servicio? | Definir el límite de la marca: no simular respuestas de una persona fallecida |
| Sustitutos cotidianos | Notas, álbumes de fotos, WhatsApp consigo misma, cuaderno, Canva | ¿Por qué alguien abandonaría una herramienta familiar? | El competidor no es solo otra app de duelo; puede ser una foto guardada y nada más |

Para cada producto, recoger evidencia fechada de: situación de uso, primer recorrido, idiomas, tono, datos solicitados, cuenta, almacenamiento, descarga/restauración, recordatorios, colaboración, monetización, versión vigente, cierre de cuenta y continuidad del contenido. Comparar anuncios oficiales con el uso real; una reseña de usuario no demuestra una característica general.

No hace falta esperar a revisar todos los candidatos para hablar con personas, pero sí antes de declarar una ventaja de mercado o fijar un precio por comparación.

## 6. Personas y necesidades: hipótesis, no segmentos demostrados

Priorizar adultos que quieren conservar recuerdos de una persona significativa y pueden probar una herramienta sencilla. «Adultos» es alcance de investigación inicial, no una afirmación de que menores no necesiten apoyo.

| Situación | Necesidad a explorar | Entrada posible | Qué no asumir |
| --- | --- | --- | --- |
| Hay una foto o frase que no quieren perder | Conservar algo pequeño sin organizar una biografía | Foto y una línea | Que quieran contar la muerte o recibir consignas |
| Quieren escribir algo que quedó pendiente | Poder expresarlo sin publicarlo | Carta libre | Que busquen perdonar o despedirse |
| Se acerca una fecha significativa | Decidir cómo atravesarla a su manera | Página o recuerdo opcional | Que quieran un recordatorio automático |
| Quieren compartir algo con familia | Crear una pieza para otra persona | PDF o libro | Que quieran compartir todo o tener un memorial público |
| Pasaron años y quieren reconstruir una historia | Ordenar fragmentos y reconocer lo que no saben | Cronología sin fechas obligatorias | Que una historia incompleta sea un fracaso |
| El vínculo fue complejo | Un lenguaje que no obligue a idealizar | Espacio privado y consigna neutra | Que «amor», «luz» o «gratitud» describan ese vínculo |

Mascotas, pérdidas gestacionales, duelo anticipado, migración y rupturas podrían requerir otras palabras y recorridos. No agregarlos como un único «para toda pérdida» sin investigación. Elegir una expansión por vez y consultar personas y organizaciones con experiencia específica.

## 7. Mejoras pequeñas que aprovechan lo que existe

Estimaciones de esfuerzo relativas al código actual; no son presupuestos ni compromisos de fecha. La selección final depende de las devoluciones de la revisión en curso.

| Prioridad | Propuesta | Por qué probarla | Criterio observable | Esfuerzo relativo |
| --- | --- | --- | --- | --- |
| P0 | Explicar «nombre/email no son una cuenta de respaldo» junto al registro | Evitar una expectativa falsa de recuperación | La persona explica dónde están sus datos sin ayuda | Bajo |
| P0 | Diferenciar copia restaurable de PDF | Ya hay ambas funciones, pero pueden confundirse | Puede descargar una copia y decir para qué sirve | Bajo |
| P0 | Revisar todas las promesas de permanencia y privacidad | El servicio público y el almacenamiento local son cosas distintas | Ningún texto promete sincronización o recuperación inexistente | Bajo |
| P1 | Una entrada opcional «No sé por dónde empezar» | La página en blanco puede frenar más que la falta de funciones | La persona elige o descarta una consigna sin sentirse evaluada | Bajo/medio |
| P1 | Nombre comprensible del mazo y explicación simbólica | «Oráculo» puede atraer a una parte del público y confundir a otra | La persona comprende de dónde sale la frase | Bajo |
| P1 | Sugerir «guardar una sola cosa» | No exigir una biografía completa | Guarda un primer recuerdo sin asistencia | Bajo |
| P1 | Vista de impresión más explicada, con una hoja de prueba | Pasar a papel es una propuesta concreta | Distingue PDF, escala y doble faz; prueba una hoja | Bajo/medio |
| P1 | Vacíos que ofrezcan una acción y permiso para dejarla | Orientar sin presión | Puede continuar o salir sin dudas ni contenido inventado | Bajo |
| P2 | Pequeños conjuntos de consignas dentro de cartas/libro | Añadir guía sin un sexto módulo grande | Se usa sin cambiar el mapa de navegación | Medio |
| P2 | Revisión de accesibilidad de lectura y edición | La estética aprobada no garantiza contraste o uso por teclado | Controles con nombres claros, foco visible, ampliación y contraste medido | Medio |
| P3 | Audio de recuerdos | Puede recuperar voz y oralidad, pero complica almacenamiento y exportación | Demanda repetida y prototipo con exportación fiable | Alto |
| P3 | Colaboración familiar o sincronización | Cambia profundamente la arquitectura y los permisos | Necesidad confirmada, plan de acceso y recuperación definido | Alto |

No confundir solicitudes de distintas personas con un roadmap acumulativo: elegir un problema principal para la siguiente iteración. Mejorar textos y confianza puede aportar más que otro módulo.

## 8. Una guía futura sin convertir el duelo en un curso

Prototipo editorial a revisar, no intervención validada. Título posible: **«Una idea para hoy»**. Entrada secundaria dentro de cartas o libro. Sin itinerario obligatorio, contador ni asignación automática de estado emocional.

| Si hoy querés… | Consigna de ejemplo | Dónde se guarda |
| --- | --- | --- |
| Guardar algo pequeño | «¿Hay una frase que no quieras olvidar? También puede ser una sola palabra.» | Mazo o página, a elección |
| Recordar una escena | «Una comida, un viaje o una tarde cualquiera. Contá solo lo que recuerdes.» | Libro |
| Escribirle | «Podés empezar por “Hoy quería contarte…”. No hace falta terminar la carta.» | Cartas |
| Reconocer lo difícil | «Si querés, escribí algo que no sabés cómo nombrar. No tenés que encontrarle una explicación.» | Carta privada |
| Compartir algo | «Elegí un recuerdo que sí quieras mostrar. Lo demás puede quedar para vos.» | PDF seleccionado |
| Acompañar una fecha | «¿Hay algo pequeño que quieras hacer o recordar en esta fecha? También podés no hacer nada especial.» | Página sin aviso automático |
| Pensar en vos | «¿Qué te gustaría hacer por vos hoy, además de recordar?» | Texto opcional; no evaluación |
| Descansar | «Podés cerrar por hoy. Lo que guardaste queda en este navegador; si querés conservar una copia, descargá el respaldo.» | Sin tarea |

No usar como consignas predeterminadas: reconstruir el momento de la muerte, buscar culpables, hablar en nombre de la persona fallecida, forzar gratitud o asumir reconciliación. No afirmar que escribir siempre alivia. Ofrecer salir y borrar sin penalización.

Para una guía más amplia del duelo, proponer antes una revisión editorial profesional, un alcance explícito, recursos adecuados a cada país y pruebas con personas. No crear un diagnóstico, un chatbot de crisis ni recomendaciones clínicas automáticas dentro de esta app por extensión de estas consignas.

## 9. Propuestas de lenguaje

Son variantes para probar; no reemplazos ya aplicados.

| Lugar o problema | Variante propuesta | Qué se investiga |
| --- | --- | --- |
| Promesa principal | «Un lugar para guardar recuerdos de alguien que querés.» | ¿Se entiende y se siente propio? |
| Alternativa más amplia | «Un lugar para los recuerdos que querés conservar.» | ¿Incluye vínculos complejos sin volverse genérico? |
| Primer paso | «Podés empezar con una foto o una frase. Lo demás puede esperar.» | ¿Disminuye la sensación de tener que completar todo? |
| Crear espacio | «Crear un espacio de recuerdos» | ¿Describe mejor la acción que «altar»? |
| Carta vacía | «Algo que hoy quieras contarle, recordar o dejar escrito.» | ¿Da libertad sin imponer una despedida? |
| Mazo | «Frases para reencontrar» o «Mazo de recuerdos» | ¿Se entiende mejor que «Mazo Oráculo»? |
| Explicación del mazo | «Una frase elegida al azar entre las que vos guardaste.» | ¿Evita atribuir mensajes nuevos a otra persona? |
| Libro | «Tus recuerdos, reunidos en un libro para imprimir.» | ¿Hace visible el resultado tangible? |
| Registro | «Tu nombre y email se guardan como datos de contacto. No crean una cuenta ni permiten recuperar tus recuerdos.» | ¿Comprende la separación? |
| Suscripción | «Quiero recibir novedades y otras herramientas por email. Es opcional.» | ¿Distingue guardar sus datos de suscribirse? |
| Respaldo | «Descargar una copia para restaurar mis recuerdos» | ¿Entiende que un PDF cumple otra función? |
| Almacenamiento | «Tus recuerdos se guardan en este navegador. Descargá una copia para conservarlos si cambiás de dispositivo o borrás sus datos.» | ¿Se recuerda sin generar una falsa garantía? |
| Guardado correcto | «Guardado en este navegador.» | ¿Responde a la preocupación concreta de la persona? |
| Fallo | «Todavía no pudimos guardarlo. Tu texto sigue aquí. Podés copiarlo o descargarlo.» | ¿Explica qué pasó y qué puede hacer? |
| Regreso después de tiempo | «Podés continuar donde lo dejaste.» | ¿Evita culpa o obligación de volver? |

Evitar «ya estás mejor», «cerrá esta etapa», «deberías», «tu ser querido quiere que…», «todo pasa por algo», «soltar para sanar», «cumpliste tu duelo». No cambiar por defecto el registro rioplatense que usa la marca; probar comprensión en otros países antes de neutralizarlo.

La identidad de La Gata y la Magia puede convivir con una entrada comprensible para personas sin interés espiritual. Una hipótesis es mostrar primero la acción concreta y dejar «santuario», «altar» u «oráculo» como lenguaje de marca u opciones, en vez de exigir que todas las personas se identifiquen con esos términos.

## 10. Cómo acercarla al público sin agrandarla

### Audiencia inicial y canales

**Hipótesis de entrada:** personas que ya guardan fotos, frases o textos sobre alguien y quieren darles una forma más cuidada. Es más accionable que «todas las personas en duelo».

1. **Comunidad propia:** mostrar una tarea breve con datos ficticios: una foto se convierte en una página y luego en un PDF. Describir el uso, no prometer una transformación emocional.
2. **Personas que acompañan duelos:** presentar una demostración a profesionales y coordinadores de grupos para obtener crítica y, si tiene sentido, difusión voluntaria. No afirmar respaldo profesional ni recomendación clínica sin acuerdo y evidencia.
3. **Contenido que responda preguntas concretas:** ideas para un libro de recuerdos, cómo conservar frases, qué escribir cuando no sabés por dónde empezar, diferencia entre un respaldo y un PDF. La existencia de esas búsquedas es hipótesis hasta medirla; no se conocen volúmenes ni dificultad SEO.
4. **Papelería, escritura y fotografía:** posibles colaboradores porque el resultado impreso puede ser el punto de entrada. Evaluar coherencia editorial antes de vincular productos o vender un paquete.
5. **Referidos voluntarios:** permitir compartir el enlace de la herramienta, no el contenido personal por defecto. No pedir una invitación al terminar una carta sensible.

No se enviaron mensajes, correos, solicitudes de colaboración ni campañas durante esta investigación. Google Sheets almacena contactos: no es un sistema de campañas, no prueba titularidad de cada email y requiere respetar el estado de suscripción y las bajas antes de usar una lista para novedades.

### Mensajes de difusión para probar

**Versión práctica:** «Estoy probando una herramienta para guardar fotos y recuerdos, escribir cartas y armar un libro para imprimir. Podés empezar con algo pequeño.»

**Versión de marca:** «Hay frases, fotos y momentos que queremos conservar. Este espacio reúne esos recuerdos y permite darles forma a tu manera.»

**Para colaboradores:** «Buscamos devoluciones sobre claridad, sensibilidad del lenguaje y facilidad de uso de una herramienta de memoria personal. No se presenta como tratamiento del duelo.»

Antes de pauta paga, revisar políticas vigentes de plataformas sobre segmentación por dificultades personales, además del tratamiento de datos sensibles. No se verificaron esas políticas en esta tarea; no se debe concluir que una campaña específica sea permitida ni usar historias privadas como audiencia publicitaria.

## 11. Monetización como hipótesis futura

Pagos y anuncios están apagados. No hace falta activarlos para validar la propuesta.

Investigar si el valor está en un acabado editorial, un conjunto de plantillas, impresión opcional o acompañamiento humano separado. No asumir que pagarían una suscripción por guardar recuerdos. No fijar precios con referencias de mercado que no se consultaron.

La exportación y la continuidad de los datos deberían tener una política clara antes de cobrar. Evitar que un pago inesperado oculte el único modo de retirar recuerdos. Para impresión o sincronización futura, calcular por separado producción, envío, almacenamiento, atención y posibilidad de cierre del servicio. No hay estimaciones de coste verificadas en este documento.

Una prueba inicial puede mostrar tres propuestas de valor sin cobrar y pedir que expliquen cuál usarían y por qué. Las respuestas hipotéticas de precio no prueban disposición real de pago. No presentar una puerta de pago ficticia dentro de un momento sensible.

## 12. Investigación con personas durante la revisión

### Dos rondas pequeñas, con objetivos distintos

**Ronda A: claridad y usabilidad.** Empezar con unas cinco a ocho personas adultas como muestra exploratoria, no representativa. Incluir alguna con poca comodidad digital y distintos tamaños de pantalla. Pueden trabajar con una persona ficticia o un recuerdo neutro. No exigir una pérdida reciente para conseguir una entrevista.

**Ronda B: significado y lenguaje.** Solo después de corregir los bloqueos de A, conversar con personas que quieran hablar de su experiencia y con algunas que acompañen duelos profesionalmente. No usar una prueba para diagnosticar, extraer testimonios ni preguntar detalles de la muerte. Se puede parar sin explicar por qué.

No grabar ni conservar contenido personal sin consentimiento específico. No hace falta recibir sus respaldos ni leer cartas reales para detectar problemas de interfaz. En un reporte, usar identificadores de prueba y describir el problema, no la historia privada.

### Guion de tareas

1. Antes de tocar: «¿Qué pensás que se puede hacer acá?»
2. «Creá un espacio de prueba con los datos ficticios que prefieras.» Observar qué campos frenan y qué creen que implica dejar el email.
3. «Guardá una foto o una frase.» No dictar qué módulo usar.
4. «Si quisieras conservar esto fuera de la app, ¿qué harías?» Observar diferencia entre PDF y respaldo.
5. «Cerrá y volvé a abrir. ¿Dónde esperabas encontrarlo?»
6. «Imaginá que abrís desde otro celular: ¿qué esperás que pase?»
7. «¿Qué palabra o texto te hizo ruido, o sentiste que no era para vos?»
8. «¿Qué quitarías antes de agregar algo?»

La restauración se prueba en un contexto de ensayo y con respaldo, no reemplazando contenido real. Registrar el sistema, navegador, dirección utilizada y versión aproximada. Las fechas de muerte, nombres reales y cartas no son necesarios en la hoja de incidencias.

### Qué registrar

Usar `PLANTILLA_DEVOLUCIONES.csv`: tarea, observación literal breve, resultado, severidad, propuesta, si se reprodujo y siguiente decisión. Separar «prefiero otro azul» de «no distingo el texto»; ambas importan, pero requieren evidencia distinta.

Severidades sugeridas: **S0**, posible pérdida o exposición no prevista de contenido; **S1**, no puede completar una tarea esencial; **S2**, confusión o esfuerzo importante; **S3**, ajuste de tono o preferencia estética. Una petición de nueva función no es automáticamente un defecto.

Métricas exploratorias: tareas que pudo terminar sin ayuda, errores al guardar/restaurar, comprensión de dónde viven los datos, claridad del propósito y utilidad relatada. No interpretar retención, cantidad de cartas o abandono como mejora o empeoramiento psicológico. No recopilar analítica del contenido de los recuerdos.

## 13. Orden recomendado de trabajo

**Ahora, durante la revisión:** recopilar devoluciones sin cambios simultáneos que vuelvan imposible comparar; dar prioridad a pérdida de datos, claridad del guardado y bloqueos. Mantener un nombre de trabajo estable mientras se prueba. El nombre final se puede investigar sin volver a cambiar el origen del navegador durante estas pruebas.

**Siguiente iteración pequeña:** elegir hasta tres problemas de las devoluciones. Reescribir los textos afectados; probar una ayuda para empezar dentro de cartas o libro; volver a comprobar lectura móvil y exportación después de los cambios. No implementar todas las propuestas del informe.

**Después:** validar el conjunto de consignas con personas y revisar los candidatos de mercado. Decidir si hay demanda repetida de colaboración, audio o sincronización. Solo entonces estimar esos proyectos.

**No priorizar ahora:** red social, múltiples módulos de duelo, ranking o rachas, avatares conversacionales de fallecidos, diagnóstico automático, recordatorios de aniversarios no solicitados, legado post mortem y administración funeraria. No son necesariamente productos inviables; son cambios grandes de promesa, responsabilidad o arquitectura para esta app.

## 14. Plan de búsqueda web pendiente

Buscar por necesidades, no solo por «app de duelo»: grief app; bereavement memory journal; grief journal app Spanish; libro de recuerdos fallecido; cartas a alguien fallecido; memorial app privacy export; digital legacy grief; duelo escritura recuerdos aplicación. Son consultas propuestas, sin volumen o resultados observados.

1. Abrir fuentes oficiales de los candidatos. Registrar fecha, país o tienda, versión, capturas y fragmentos que sustentan cada dato. Si un sitio está cerrado o un producto dejó de estar disponible, registrar el hecho y no compararlo como activo.
2. Examinar el recorrido de tres a cinco candidatos de categorías distintas con datos ficticios. Diferenciar lo que dice la página comercial de lo probado en el producto.
3. Leer políticas de privacidad, exportación, eliminación y precios. Marcar cualquier dato que requiera pago o cuenta como no comprobado si no se accede.
4. Buscar revisiones sistemáticas recientes de herramientas digitales de duelo y estudios específicos de cada intervención. Extraer población, diseño, comparador, seguimiento, desenlaces, riesgos, patrocinio y límites. Una app con ejercicios no hereda la eficacia de una terapia por parecido.
5. Completar fuentes en español y recursos de Argentina. Verificar datos de contacto antes de incluir ayuda pública. No inventar líneas de asistencia ni presentarlas como vigentes sin consulta.
6. Reescribir esta conclusión si la evidencia contradice las hipótesis. Añadir una fecha de consulta por fuente y una síntesis de hallazgos que se pueda rastrear.

## 15. Bibliografía y fuentes de partida

Estas referencias se identifican como punto de partida bibliográfico; **no fueron abiertas ni verificadas en línea durante esta tarea**. No hay citas textuales, síntesis de revisiones recientes ni tamaños de efecto extraídos aquí. Antes de publicar un texto de salud o atribuir beneficios, leer los originales y revisar el lenguaje con una persona cualificada.

- **[B1]** Stroebe, M.; Schut, H. (1999). *The dual process model of coping with bereavement: rationale and description*. Death Studies, 23(3), 197–224. DOI de referencia: https://doi.org/10.1080/074811899201046. Marco para pensar alternancia, no itinerario de pantallas validado.
- **[B2]** Klass, D.; Silverman, P. R.; Nickman, S. L. (eds.) (1996). *Continuing Bonds: New Understandings of Grief*. Taylor & Francis. Marco sobre vínculos continuos; no prueba de que el mazo o el libro tengan eficacia terapéutica.
- **[B3]** Bonanno, G. A. (2004). *Loss, trauma, and human resilience: Have we underestimated the human capacity to thrive after extremely aversive events?* American Psychologist, 59(1), 20–28. DOI de referencia: https://doi.org/10.1037/0003-066X.59.1.20. Referencia sobre diversidad de respuestas; no se usa para prescribir cómo debería sentirse una persona.
- **[B4]** Stroebe, M.; Schut, H.; Boerner, K. (2017). *Cautioning health-care professionals: Bereaved persons are misguided through the stages of grief*. OMEGA—Journal of Death and Dying, 74(4), 455–473. DOI de referencia: https://doi.org/10.1177/0030222817691870. Punto de partida para revisar el uso prescriptivo de etapas.

Fuentes públicas candidatas de orientación y contexto: [Cruse](https://www.cruse.org.uk/), [Sue Ryder](https://www.sueryder.org/), [What's Your Grief](https://whatsyourgrief.com/), [Refuge in Grief](https://refugeingrief.com/), [Fundación Mario Losantos del Campo](https://www.fundacionmlc.org/), [PubMed](https://pubmed.ncbi.nlm.nih.gov/). Enlaces de partida, no páginas consultadas en esta sesión. Condiciones actuales y contenido preciso pendientes de validación.

## 16. Qué quedó hecho y qué falta

**Hecho:** revisión de la app y sus textos en código, hipótesis de valor, segmentación exploratoria, criterios de diseño, candidatos de comparación, propuestas de lenguaje, guía no lineal de ejemplo, prioridades y protocolo de pruebas. Se registró la confirmación de Google Sheets sin guardar datos personales de la captura. No se cambió la aplicación ni se desplegó una versión para esta investigación.

**Pendiente por acceso:** búsquedas públicas, lectura de las fuentes, versiones actuales de competidores, reseñas fechadas, precios, idiomas, políticas y síntesis de evidencia reciente. El intento de ampliar la red no se guardó: no es un cambio pendiente ya aprobado ni publicado.

**Pendiente por investigación:** devoluciones de la persona usuaria y participantes, preferencia de lenguaje, valoración del libro frente al mazo y utilidad de las consignas. Nada de eso se considera confirmado por este documento.
