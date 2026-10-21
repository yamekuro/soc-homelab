# Publicación y límites de privacidad

La edición pública conserva el razonamiento, las políticas, sus pruebas resumidas y las capacidades del proyecto. Las direcciones internas y los equipos de los ejemplos son ilustrativos. No se reconstruyen registros ficticios con esos valores: los resultados históricos se describen por roles del entorno original.

Se han omitido la entrada administrativa real, los identificadores de equipos personales, MAC, ubicaciones de secretos, nombres de claves y transcripciones operativas. Los originales se conservan fuera de esta edición. Los puertos estándar de los servicios y las referencias públicas de proveedores pueden mantenerse por su valor técnico.

## Revisión realizada

Antes de preparar esta corrección se revisaron las dos ramas visibles: 33 commits —32 de las ramas y uno adicional referenciado por un despliegue antiguo—, 32 árboles únicos y 133 versiones únicas de archivos de texto. Sus contenidos se contrastaron con los identificadores Git de los blobs. También se inspeccionaron los mensajes de commit, el PR, los comentarios disponibles, las referencias de tags y las releases visibles. No había comentarios, tags ni releases en esa muestra. También se revisaron metadatos de 15 ejecuciones de GitHub Pages: no devolvían artefactos. Los logs de ejecución y la representación de la web desplegada no se inspeccionaron.

La revisión no identificó credenciales utilizables inequívocas con las comprobaciones empleadas. Sí encontró direcciones internas, cadena de administración, nombres de equipos, identidades y MAC en versiones actuales o históricas. Una búsqueda heurística no demuestra ausencia universal de secretos ni cubre copias externas o referencias que no se hayan enumerado.

## Historial y ramas

Un commit normal modifica la versión actual de una rama, pero no retira sus versiones anteriores, otros branches, copias descargadas o cachés. Esta corrección se prepara en un PR borrador: no modifica por sí sola la rama principal ni reescribe el historial.

No se ha declarado una filtración de credenciales ni se presenta una reescritura del historial como necesaria por el solo hecho de encontrar IP privadas. Si se identificase un secreto utilizable, la primera medida sería revocarlo o rotarlo y después determinar el alcance de la retirada. GitHub explica los impactos y límites de ese procedimiento en su [guía oficial](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

El tratamiento de la edición pública se inspira en la revisión de información interna al extraer o compartir registros descrita por [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude). No es una certificación OWASP ni una auditoría completa del sistema.

## Estado técnico

La [guía del firewall](firewall-policy.md) y el [resumen de evidencia](evidence-summary.md) mantienen sus límites: P1 sigue en validación, el receptor Wazuh está previsto y la revisión visual de los mapas e impresión real sigue pendiente. El saneado editorial no cambia la configuración del laboratorio ni ejecuta sus pruebas.
