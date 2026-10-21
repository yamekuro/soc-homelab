# Pruebas del firewall: resultados y alcance

Este documento resume las comprobaciones disponibles hasta el **20 de octubre de 2026**. Los registros originales y las capturas se conservan fuera de esta edición. Los nombres y las direcciones de la [guía](firewall-policy.md) y el [mapa](firewall-policy-map.html) son ilustrativos; **no son los valores originales de estas pruebas**.

## Qué se comprobó

| Área | Resultado observado | Límite de la conclusión |
|---|---|---|
| Política principal IPv4 | Las reglas cargadas conservan el orden documentado: R01 antes de las interfaces, R13a antes de R13, excepciones DMZ antes de R09 y R15 al final. | La lectura no constituye una auditoría completa de estados, NAT, anchors o IPv6. Las 34 filas manuales pueden expandirse en más líneas PF. |
| Alias de resolutores | La tabla activa `PUBLIC_DNS` contenía las 24 IPv4 únicas del diseño. | Otros alias requieren su propia comprobación; pertenecer a esta tabla no acredita por sí solo un bloqueo. |
| DNS desde MGMT | Seis consultas A: un nombre ordinario devolvió respuesta positiva; el dominio de control de Firefox y `dns.google` devolvieron NXDOMAIN. Cada caso se probó por UDP y TCP. | Prueba real del bastión hacia el servicio DNS del firewall. No acredita otros clientes, todos los nombres bloqueados ni una regla PF decisiva mediante log. |
| DNSSEC | Un nombre válido devolvió AD y RRSIG; un dominio de prueba con DNSSEC incorrecto devolvió SERVFAIL. | Comportamiento esperado en la ruta consultada; no atribución exclusiva de la validación al resolver local. |
| Transporte DNS hacia fuera | Se observó tráfico bidireccional TCP/853 entre el firewall y dos resolutores públicos. | La cola de captura revisada no prueba autenticación TLS de todas las sesiones, ausencia general de DNS en claro ni comportamiento ante fallos. |
| Hora de MGMT | Primero se observó el cliente sin sincronizar; después hubo respuesta NTP del firewall y el cliente indicó sincronización. | Es una muestra tras el arranque. No prueba precisión sostenida, NTS, otras zonas ni una regla PF decisiva. No se ajustó el reloj manualmente para la prueba. |
| HTTPS ordinario desde MGMT | Conexión a un servicio público, TLS 1.3 con validación del certificado y respuesta HTTP 200 OK. | Control positivo de aplicación. No hay atribución exclusiva por log a R13. |
| Resolutor público desde MGMT | Una conexión nueva TCP/443 a un resolutor listado fue bloqueada; se correlacionó con R13a. | Una muestra IPv4/TCP, no todos los resolutores, puertos o clientes. |
| SSH exterior desde MGMT | Una conexión nueva TCP/22 hacia un destino exterior terminó en un bloqueo correlacionado con R15. | No generaliza a otros protocolos, reglas, zonas ni conexiones ya establecidas. |
| Red ajena desde MGMT | Una conexión nueva TCP/80 hacia una red protegida por `HOME_NETS` terminó en un bloqueo correlacionado con R01. | Prueba de ese origen y destino; otras zonas y las demás redes declaradas siguen pendientes. |
| Nombres locales | Nombre inexistente con NXDOMAIN y comprobación de sintaxis de Unbound sin errores. | No hay prueba positiva A/PTR de una concesión DHCP ni identificación del salto exacto al servicio de nombres local. |

## Cómo se atribuyeron los tres bloqueos

Un timeout aislado no demuestra que el firewall haya bloqueado una conexión: también puede faltar un servicio o existir un fallo de ruta. Por eso se contrastaron los intentos del cliente con la captura y con el registro local del firewall.

En las tres muestras negativas coincidieron la conexión, el tiempo y el identificador de la regla con el listado previamente observado. El registro indicó coincidencia, bloqueo y entrada por la interfaz de MGMT. Eso permite atribuir esas muestras a **R13a, R15 y R01**, respectivamente.

Esta edición publica el método y la conclusión. Omite los identificadores originales, las tuplas completas, las horas exactas, los puertos de origen y los registros íntegros. No reconstruye registros ficticios con las direcciones ilustrativas. Los resultados positivos de DNS, NTP y HTTPS conservan expresamente su límite de atribución.

## Qué falta comprobar

- USERS real: concesión DHCP y opciones recibidas y usadas; resolución A/PTR; comportamiento de Firefox y DoH.
- Flujos permitidos y bloqueados desde SERVERS, DMZ y SOC, con sus registros y servicios de destino.
- Recepción y enrolamiento Wazuh; activación de R07 únicamente cuando exista su receptor; decodificación, indexado y salud de la ingesta.
- Cobertura individual de los demás nombres de bloqueo; fallo controlado de upstreams, autenticación DoT y ausencia de fallback no deseado.
- Estados, NAT, reglas automáticas, anchors e IPv6; el filtrado por reglas manuales no cubre todas esas capas.
- Estabilidad horaria y de recursos, restauración de copias y recuperación de configuración externa.
- Revisión visual del mapa en navegador e impresión real. Las pruebas del controlador no sustituyen esa revisión.

**P1 sigue en validación.** Una configuración observada no implica que todos sus servicios estén desplegados o que todos sus recorridos hayan sido probados.
