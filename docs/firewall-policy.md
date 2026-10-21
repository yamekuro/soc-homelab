# Políticas del firewall: diseño, motivos y evidencia

**Versión pública ilustrativa.** Las direcciones y los nombres internos se han sustituido para proteger el entorno original. Las redes de esta guía no son una captura de su configuración ni direcciones con las que se hayan ejecutado nuevas pruebas. Los resultados resumidos corresponden al laboratorio original, observado hasta el **20 de octubre de 2026**. Los puertos y los dominios públicos de prueba conservan su significado técnico.

Esta guía explica **34 filas manuales documentadas**: 33 reglas de interfaz y una regla flotante. El [mapa interactivo](https://yamekuro.github.io/soc-homelab/firewall-policy-map.html) permite recorrer 18 ejemplos; el [resumen de evidencia](evidence-summary.md) separa los resultados observados de las comprobaciones pendientes. Ninguna interacción modifica el firewall.

## Zonas y propósito

El laboratorio separa administración, clientes, servicios, DMZ y monitorización mediante segmentos LAN de VMware. No se presenta esta separación como una implementación de VLAN 802.1Q.

| Zona | Red ilustrativa | Firewall ilustrativo | Función |
|---|---|---|---|
| MGMT, interfaz LAN | `10.77.10.0/24` | `10.77.10.1` | Administración mediante `bastion-demo` |
| USERS | `10.77.20.0/24` | `10.77.20.1` | Clientes, navegación y DHCP |
| SERVERS | `10.77.30.0/24` | `10.77.30.1` | Servicios internos |
| DMZ | `10.77.40.0/24` | `10.77.40.1` | Servicio web separado |
| SOC | `10.77.50.0/24` | `10.77.50.1` | Plataforma de monitorización prevista |
| WAN | `10.77.254.0/24` | No se detalla | Salida mediante NAT |

`fw-demo` representa el firewall. Los hosts previstos `server-demo`, `web-demo` y `soc-demo` se sitúan, respectivamente, en las direcciones ilustrativas `10.77.30.10`, `10.77.40.10` y `10.77.50.10`. El bastión ilustrativo es `10.77.10.10`.

La topología expresa funciones y relaciones. Una interfaz configurada, una regla de permiso y una aplicación disponible son hechos diferentes. La plataforma SOC y los nuevos endpoints todavía no constan desplegados en la evidencia resumida.

## Cómo leer una decisión

Las reglas de zona filtran conexiones nuevas a la entrada de la interfaz de origen. En las reglas manuales **Quick**, la primera coincidencia decide. Por eso el orden de las tablas importa más que la numeración de sus identificadores.

El firewall mantiene estados: el retorno de una sesión admitida no equivale a una conexión nueva iniciada en sentido contrario. Además intervienen reglas automáticas, posibles anchors y traducciones NAT. El mapa es un modelo didáctico de la política manual, no una reproducción completa de PF. [Semántica de filtrado de OPNsense](https://docs.opnsense.org/manual/firewall.html).

El tráfico generado por el propio firewall —DNS upstream, sincronización horaria o futuro syslog— debe distinguirse del tráfico de un cliente que entra por una zona. Tampoco se supone que dos vecinos del mismo segmento atraviesen el firewall para comunicarse.

## Objetos reutilizados

Los alias forman parte de la política: cambiar sus miembros modifica todas las reglas que los utilizan.

| Alias | Significado en esta versión ilustrativa |
|---|---|
| `LAB_NETS` | `10.77.0.0/16`; incluye más redes que las cinco zonas internas actuales |
| `HOME_NETS` | `172.31.240.0/24`, `172.31.241.0/24`, `172.31.242.0/24`; representan redes ajenas protegidas |
| `BASTION` | Host administrativo `bastion-demo` |
| `SOC_WAZUH` | Receptor previsto `soc-demo` |
| `LAB_WEB_SERVICES` | Los dos hosts previstos `server-demo` y `web-demo` |
| `PUBLIC_DNS` | Conjunto de resolutores públicos conocidos; 24 IPv4 activas verificadas en el entorno original |
| `RFC1918` | `10.0.0.0/8`, `172.16.0.0/12` y `192.168.0.0/16`; rangos privados estándar |
| `ADMIN_PORTS` | TCP 22, 443 y 3389 |
| `WEB_PORTS` | TCP 80 y 443 |
| `WAZUH_AGENT_PORTS` | TCP 1514 y 1515 |

La tabla activa de `PUBLIC_DNS` coincidía con sus 24 miembros de diseño. Un intento HTTPS desde MGMT se correlacionó con su bloqueo R13a; las demás direcciones y zonas no quedan probadas por esa muestra.

## Matrices ordenadas

Todas las reglas específicas siguientes son de entrada, IPv4 y Quick, con puerto de origen cualquiera y sin gateway de política elegido. R15 es el cierre manual de cada zona. La GUI mostraba comodines; la lectura de PF contrastó sus cláusulas IPv4.

**Permitir** significa autorización configurada, no disponibilidad confirmada del servicio. “Log: Sí” indica registro de paquetes en esa regla, no una garantía de ingesta en el SOC.

### Regla flotante

| Regla | Origen → destino | Servicio | Acción | Log |
|---|---|---|---|---|
| R01 | `LAB_NETS` → `HOME_NETS` | Cualquier protocolo IPv4 | Bloquear | Sí |

R01 precede a las reglas manuales de interfaz. Su objetivo es impedir conexiones nuevas hacia las redes ajenas declaradas, incluso si se amplían permisos internos. La evidencia confirma una muestra desde MGMT; no todos los estados, orígenes o destinos.

### MGMT · interfaz LAN

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R03 | `BASTION` → firewall de MGMT | TCP 443 | Permitir | Sí |
| 2 | R05 DNS | MGMT → firewall de MGMT | TCP/UDP 53 | Permitir | No |
| 3 | R05 NTP | MGMT → firewall de MGMT | UDP 123 | Permitir | No |
| 4 | R13a | MGMT → `PUBLIC_DNS` | Cualquiera | Bloquear | Sí |
| 5 | R13 | MGMT → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 6 | R04 | `BASTION` → `LAB_NETS` | TCP `ADMIN_PORTS` | Permitir | Sí |
| 7 | R06, extensión | `BASTION` → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 8 | R15 | Cualquiera → cualquiera | Cualquiera | Bloquear | Sí |

### USERS

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | USERS → firewall de USERS | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | USERS → firewall de USERS | UDP 123 | Permitir | No |
| 3 | R13a | USERS → `PUBLIC_DNS` | Cualquiera | Bloquear | Sí |
| 4 | R13 | USERS → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R06 | USERS → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 6 | R08 | USERS → `LAB_WEB_SERVICES` | TCP `WEB_PORTS` | Permitir | No |
| 7 | R15 | Cualquiera → cualquiera | Cualquiera | Bloquear | Sí |

### SERVERS

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | SERVERS → firewall de SERVERS | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | SERVERS → firewall de SERVERS | UDP 123 | Permitir | No |
| 3 | R13a | SERVERS → `PUBLIC_DNS` | Cualquiera | Bloquear | Sí |
| 4 | R13 | SERVERS → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R06 | SERVERS → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 6 | R15 | Cualquiera → cualquiera | Cualquiera | Bloquear | Sí |

### DMZ

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | DMZ → firewall de DMZ | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | DMZ → firewall de DMZ | UDP 123 | Permitir | No |
| 3 | R06 | DMZ → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 4 | R09 | DMZ → `LAB_NETS` | Cualquiera | Bloquear | Sí |
| 5 | R13a | DMZ → `PUBLIC_DNS` | Cualquiera | Bloquear | Sí |
| 6 | R13 | DMZ → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 7 | R15 | Cualquiera → cualquiera | Cualquiera | Bloquear | Sí |

### SOC

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | SOC → firewall de SOC | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | SOC → firewall de SOC | UDP 123 | Permitir | No |
| 3 | R13a | SOC → `PUBLIC_DNS` | Cualquiera | Bloquear | Sí |
| 4 | R13 | SOC → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R15 | Cualquiera → cualquiera | Cualquiera | Bloquear | Sí |

Son 8 + 7 + 6 + 7 + 5 filas de interfaz y R01: **34 filas manuales**. Los elementos automáticos, la dependencia heredada de acceso administrativo y las expansiones de PF se cuentan aparte.

## Motivos y límites de las excepciones

**R03 y R04 concentran la administración en el bastión.** R03 identifica el acceso a la GUI; R04 alcanza todo `LAB_NETS` en tres puertos administrativos. No debe describirse como permiso a una única máquina. Su presencia tampoco acredita exclusividad global de acceso: estados, NAT y reglas automáticas requieren revisión propia.

**R05 centraliza DNS y tiempo.** Cada zona puede utilizar estos servicios en su propia dirección del firewall, sin recibir acceso general a sus demás servicios. Mantener TCP además de UDP para DNS permite las consultas que necesitan ese transporte.

**R06 limita agentes y enrolamiento a un receptor.** No abre toda SOC, la API de Wazuh ni otros servicios. La extensión MGMT se añadió explícitamente para recoger también la fuente bastión y autoriza únicamente ese host, no toda su subred. Su posición anterior a R15 es necesaria. El receptor sigue previsto.

**R08 permite actividad web interna concreta.** USERS puede utilizar los dos servicios previstos para generar actividad legítima observable. El permiso no autoriza todos los destinos de SERVERS o DMZ ni sus puertos administrativos.

**R09 contiene conexiones iniciadas desde DMZ.** Sus excepciones DNS, NTP y Wazuh deben preceder al bloqueo. No se bloquea por este motivo el retorno con estado de una sesión legítima admitida desde otra zona, ni el tráfico que permanezca entre vecinos de DMZ.

**R13 permite salida web limitada por puerto y dirección.** `!RFC1918` excluye redes privadas; no es una lista de sitios aprobados ni una clasificación exhaustiva de direcciones públicas válidas. No hay inspección del contenido HTTPS. TCP 443 puede transportar protocolos distintos de navegación.

**R13a evita que resolutores conocidos aprovechen ese permiso web.** Bloquea todos los puertos y protocolos hacia sus IP, no solo DNS en 53. El alcance depende de una lista finita. DNS externo y DoT de clientes sin otra excepción terminan en R13a o R15; UDP 443 tampoco obtiene permiso mediante R13.

**R15 hace visible el cierre de cada zona.** Una excepción situada debajo quedaría sin efecto para conexiones nuevas ya bloqueadas por esa regla Quick. Los permisos específicos son IPv4; no se deduce de ellos una auditoría completa de IPv6.

## DNS, nombres internos y control de DoH

Unbound atiende DNS en 53 y conserva DNSSEC. Su salida general utiliza servidores DoT de Quad9 y Cloudflare mediante TCP 853, con identidad de certificado configurada, sin Forward first ni uso de servidores DNS del sistema. Los clientes no heredan permiso directo a esos upstreams.

Las respuestas firmadas y el rechazo de un dominio deliberadamente inválido presentaron el comportamiento DNSSEC esperado. También se observó tráfico WAN hacia dos upstreams configurados en 853. Esto no demuestra por sí solo autenticación TLS de cada sesión ni ausencia de fallback bajo fallo. [Configuración de Unbound](https://docs.opnsense.org/manual/unbound.html).

Dnsmasq conserva DNS local en 53053. En el modelo publicado, Unbound le reenvía `lab.example` y la zona inversa de USERS. Dnsmasq no reenvía esas consultas a los DNS del sistema, evitando un bucle de retorno. Falta comprobar nombres A/PTR positivos de una concesión real.

Dos políticas de nombres complementan R13a: una para `use-application-dns.net` y otra con quince dominios exactos de servicios DoH conocidos. Están configuradas para devolver NXDOMAIN; solo algunos nombres tienen prueba individual. El canary orienta la activación automática de Firefox; no impone por sí solo una política cuando DoH se activa manualmente. Tampoco se promete cobertura de todos los resolutores, nombres alternativos o tipos de registro. [Alcance del canary según Mozilla](https://support.mozilla.org/en-US/kb/canary-domain-use-application-dnsnet).

## DHCP, tiempo y futura telemetría

USERS tiene el único pool DHCP: `.100–.199`, con concesión de un día. Gateway y DNS corresponden al firewall de esa zona; la opción 42 ofrece NTP. Se observaron rango, arranque y configuración, pero faltan concesión, opciones recibidas, uso efectivo y ausencia de servicio fuera de USERS. [Integración Unbound/Dnsmasq](https://docs.opnsense.org/manual/dnsmasq.html#dhcpv4-with-dns-registration).

La sincronización horaria facilita correlacionar fuentes y validar certificados. El cliente MGMT confirmó sincronización con el firewall en una muestra; eso no acredita precisión sostenida, todas las zonas ni autenticación NTS.

**R07 sigue pendiente:** se preparó un destino syslog UDP 514 hacia el futuro receptor SOC, deshabilitado según confirmación del propietario. Es salida local del firewall, no una regla de entrada de clientes duplicada. Deben comprobarse recepción, decodificación, indexado y salud cuando exista el receptor. UDP no garantiza entrega. [Logging de OPNsense](https://docs.opnsense.org/manual/settingsmenu.html#logging).

## Qué se comprobó realmente

Los resultados siguientes se refieren a roles del entorno original. **No representan paquetes ejecutados con las direcciones ilustrativas anteriores.** Se omiten registros íntegros, identificadores originales y datos individuales de las conexiones.

| Comprobación | Resultado observado | Límite |
|---|---|---|
| DNS desde bastión MGMT | Positivo ordinario y NXDOMAIN para canary y `dns.google`, por UDP y TCP | No prueba USERS ni comportamiento del navegador |
| NTP desde bastión MGMT | Respuesta y estado de cliente sincronizado | Una muestra, sin estabilidad sostenida |
| Control HTTPS desde MGMT | Certificado validado, TLS 1.3 y HTTP 200 | Sin log decisor exclusivo de R13 |
| HTTPS a resolutor conocido desde MGMT | Bloqueo atribuido a R13a | Un destino y una conexión |
| SSH externo desde MGMT | Bloqueo atribuido a R15 | Una conexión TCP |
| Acceso desde MGMT a red ajena declarada | Bloqueo atribuido a R01 | Una red, un destino y TCP |

Los tres negativos se correlacionaron localmente por identificador de regla, datos de conexión y tiempo. El timeout aislado no fue suficiente. Esta publicación conserva la conclusión y su alcance, no los valores privados que permitieron esa correlación.

También se contrastó el listado principal IPv4 de PF con las matrices. Sus líneas no se cuentan como filas GUI: protocolos y puertos producen expansiones. El listado no sustituye a una auditoría de estados, NAT, anchors o IPv6.

Quedan pendientes las nuevas zonas, clientes y servicios; navegador USERS; concesiones y nombres internos; fallo controlado de DoT; agentes, R07 e ingesta; retención y recuperación. La fase P1 continúa abierta. La evidencia detallada y sus límites se resumen en [evidence-summary.md](evidence-summary.md); el [mapa](https://yamekuro.github.io/soc-homelab/firewall-policy-map.html) distingue recorridos esperados de resultados ya observados.

## Tratamiento de la edición pública

Se han omitido datos de acceso y registros operativos y se han sustituido los identificadores internos. El criterio se inspira en el tratamiento de información interna al extraer o compartir registros de la [guía de logging de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude). No se afirma cumplimiento integral ni certificación OWASP. Las direcciones RFC1918 estándar y las referencias públicas de proveedores conservan su función didáctica.

La revisión abarca esta edición local, no los archivos ni el historial publicados anteriormente. La revisión visual del mapa en navegador y de su impresión real sigue pendiente.
