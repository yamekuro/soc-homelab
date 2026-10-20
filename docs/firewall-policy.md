# Políticas del firewall: qué permiten, qué bloquean y por qué

**soc-homelab · Evidencia hasta el 19 de octubre de 2026 · Revisión del 20 de octubre de 2026 · P1 en construcción**

El firewall `fw-01` separa administración, usuarios, servidores, servicios expuestos y SOC. La política manual permite servicios concretos para administrar el laboratorio, generar actividad legítima y recoger telemetría, y termina con bloqueos de cierre. La evaluación completa depende también de estados, reglas automáticas y NAT. DNS y hora se concentran en el firewall para conservar una referencia común y evitar que cada máquina elija servicios externos distintos.

Esta guía explica la implementación y sus límites. El [mapa interactivo](firewall-policy-map.html) permite recorrer las zonas y los flujos; los ejemplos que contiene ilustran la política y no generan tráfico. El [plano de red](network-plan.html) conserva el diseño general, incluidas fases futuras. Para el detalle de ejecución y la procedencia de cada observación, véanse el [registro de implementación](https://github.com/yamekuro/soc-homelab/blob/docs/p1-capacity-retention/infra/p1-network-start.md) y el [preflight de P1](https://github.com/yamekuro/soc-homelab/blob/docs/p1-capacity-retention/infra/p1-preflight.md).

## Cómo interpretar el estado

| Etiqueta | Qué acredita | Qué no acredita |
|---|---|---|
| **Observado en configuración** | Campos, alias u orden vistos en la GUI, o configuración generada leída en consola. | Que el flujo funcione desde un cliente o que se haya inspeccionado todo el ruleset de PF. |
| **Reportado** | El propietario confirmó una acción, por ejemplo Save → Apply o una descarga. | Una comprobación independiente del resultado o del archivo. |
| **Probado, con alcance** | Una consulta o salida real produjo el resultado descrito. | Todas las zonas, protocolos, nombres y condiciones de fallo. |
| **Pendiente** | Una obligación conservada para el despliegue o la validación posterior. | Una función eliminada del proyecto. |

Las cinco zonas internas tienen dirección y reglas observadas. Hay pruebas locales satisfactorias de DNS y DNSSEC, y tráfico WAN observado hacia dos servidores en TCP/853. **Todavía no hay evidencia de despliegue de Wazuh ni de las nuevas fuentes de P1.** La creación de su VM se estaba preparando cuando se detuvo el trabajo para documentar. Las pruebas desde los futuros clientes, la ingesta y el criterio de salida de P1 permanecen abiertos.

## Arquitectura y fronteras de confianza

Cada zona utiliza un **LAN segment de VMware**, una subred IPv4 y una interfaz de OPNsense. No se ha implementado aquí un troncal de VLAN 802.1Q. El firewall enruta entre segmentos; dos máquinas dentro de un mismo segmento pueden comunicarse sin atravesarlo. Por ello, esta política no sustituye al firewall del endpoint ni demuestra aislamiento entre vecinos de una misma zona.

| Zona | Segmento / red | Interfaz real de `fw-01` | Dirección de `fw-01` | Función |
|---|---|---|---|---|
| MGMT, denominada **LAN** en la GUI | `LS-MGMT` · `10.20.10.0/24` | `vmx1` | `10.20.10.1` | Bastión y administración. |
| USERS | `LS-USERS` · `10.20.20.0/24` | `em0` | `10.20.20.1` | Endpoints y actividad legítima de usuario. |
| SERVERS | `LS-SERVERS` · `10.20.30.0/24` | `em1` | `10.20.30.1` | Servicios internos. |
| DMZ | `LS-DMZ` · `10.20.40.0/24` | `em2` | `10.20.40.1` | Servicios separados de las redes internas. |
| SOC | `LS-SOC` · `10.20.50.0/24` | `em3` | `10.20.50.1` | Recogida, análisis y futura recepción de eventos. |
| WAN | `VMnet8`, NAT · `10.20.254.0/24` | `vmx0` | `10.20.254.10` | Salida mediante la puerta de enlace de VMware `10.20.254.2`. |

Las interfaces y sus MAC se contrastaron antes de asignarlas. Los nombres `vmx2`–`vmx5` del plano original eran referencias de diseño; los cuatro dispositivos detectados son `em0`–`em3`. No deben reasignarse por parecido de nombre. Las direcciones `.1` y rutas conectadas se observaron en **Interfaces → Overview**; tener una ruta no implica tener permiso de acceso.

La casa, su red de invitados y el adaptador de VirtualBox están fuera del laboratorio y se protegen mediante R01. ATTACK, SANDBOX, AI y OT conservan sus fases futuras. SANDBOX está diseñada sin enlace al firewall. Ninguna regla condicional de ataque o escaneo de P2 se presenta como habilitada ahora.

### Camino de administración

El acceso existente parte del Mac administrador, entra por TCP/2222 del ordenador Windows y atraviesa las traducciones de VMware y OPNsense hasta SSH del bastión `mgmt-01`, `10.20.10.10:22` —R02—. Desde el bastión se abre un túnel hacia `10.20.10.1:443` —R03—; el navegador del Mac usa `https://127.0.0.1:8443`.

R02 es una dependencia heredada de P0, descrita en el plano y utilizada por la administración observada. Esta documentación no equivale a una nueva inspección completa de sus campos NAT, del filtrado del host y de su rechazo desde otro equipo. El acceso SSH al propio firewall se observó deshabilitado. Las comprobaciones de consola se realizaron mediante VMware, sin habilitarlo por comodidad.

El bastión concentra el privilegio: R03 permite su acceso web al firewall y R04 su administración de destinos del laboratorio. Esto reduce el número de orígenes autorizados por esas reglas, pero hace especialmente importante proteger el bastión y recoger sus logs. No se reauditaron todas las reglas automáticas, incluido el estado actual de anti-lockout en LAN, ni todos los estados y asociaciones NAT. Por tanto, el modelo busca concentrar la administración en el bastión, pero estas capturas no prueban exclusividad completa de acceso a la GUI. Abrirla con un certificado autofirmado tampoco valida por sí solo la identidad del certificado.

## Cómo se decide un flujo

OPNsense aplica filtrado con estado: el retorno de una conexión admitida suele seguir su estado, sin una segunda regla simétrica. Para tráfico nuevo, las reglas automáticas y flotantes pueden intervenir antes que las de interfaz. En las reglas **Quick**, gana la primera coincidencia. Las reglas de zona se aplican en dirección **In**, donde entra el origen. Un cambio de política puede requerir revisar estados existentes, evitando borrar indiscriminadamente los de administración. [Semántica de reglas y estados](https://docs.opnsense.org/manual/firewall.html#the-basics).

Esto explica cuatro decisiones de este laboratorio:

1. **R01 flotante precede a los permisos de las zonas.** Una futura ampliación de permisos no debe abrir conexiones nuevas hacia casa. El retorno de una sesión administrativa ya admitida es un caso distinto.
2. **R13a precede a R13.** Una IP de un resolutor conocido no debe aprovechar el permiso general TCP/443 para DoH.
3. **En DMZ, R05 y R06 preceden a R09.** DNS, NTP y telemetría son excepciones concretas a su prohibición de iniciar conexiones hacia el laboratorio.
4. **R15 queda al final.** Una regla añadida debajo sería inalcanzable para tráfico nuevo que ya coincida con ese bloqueo Quick. El permiso del agente del bastión se corrigió precisamente por este motivo.

El tráfico generado por `fw-01` —DoT, NTP y futuro syslog— tiene origen local. No debe modelarse copiando una regla de entrada de un cliente a la interfaz SOC. La política de salida local y las reglas automáticas necesitan su propia verificación. Una tabla filtrada por interfaz tampoco muestra necesariamente todos los elementos que participan en la decisión. [Dirección y salida local](https://docs.opnsense.org/manual/firewall.html#direction).

## Alias: los objetos que sostienen las reglas

Un alias hace explícito el conjunto de destinos o puertos y evita repetirlo en cada zona. Su contenido es parte de la política: cambiarlo modifica todos los permisos que lo referencian.

| Alias | Contenido de referencia | Uso y estado |
|---|---|---|
| `LAB_NETS` | `10.20.0.0/16` | Observado; abarca las subredes del laboratorio. R01, R04 y R09. |
| `HOME_NETS` | `192.168.0.0/24`, `192.168.5.0/24`, `192.168.56.0/24` | Observado; red doméstica, invitados y VirtualBox. R01. |
| `BASTION` | `10.20.10.10` | Host existente; administración y excepción de telemetría de MGMT. |
| `RFC1918` | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Tres redes de referencia; lista con tres entradas cargadas observada, sin nueva lectura individual completa. Se invierte en R13. |
| `PUBLIC_DNS` | Las 24 IPv4 de [0006](decisions/0006-doh-blocking.md) | Lista habilitada con 24 entradas cargadas observada; no se releyeron individualmente todas en esta ejecución. R13a. |
| `ADMIN_PORTS` | TCP `22`, `3389`, `443` | Alcance documentado de R04; la tabla abreviada no sustituye a una lectura completa del alias cargado. |
| `WEB_PORTS` | `80`, `443` | Contenido observado; R08 y R13. |
| `SOC_WAZUH` | `10.20.50.10` | Contenido observado en formulario y guardado reportado. Es un destino previsto, no un servidor desplegado. |
| `WAZUH_AGENT_PORTS` | `1514`, `1515`, como entradas separadas | Creación y aplicación reportadas; referencias observadas en R06. |
| `LAB_WEB_SERVICES` | `10.20.30.10` y `10.20.40.10` | Formulario observado y guardado reportado; futuros `srv-01` y `web-01`. R08. |

`Loaded#` acredita un recuento mostrado por la GUI, no una inspección individual de toda la tabla activa ni el éxito de una conexión. Los alias de PF tampoco son automáticamente nombres DNS: el destino remoto de syslog se preparó con la IP literal, no con `SOC_WAZUH`.

### Direcciones de `PUBLIC_DNS`

La definición aceptada agrupa direcciones dedicadas publicadas por cinco operadores. Se documenta completa para que una revisión pueda detectar diferencias; se debe contrastar con el alias efectivo antes de afirmar equivalencia exacta.

| Operador | IPv4 del diseño aceptado |
|---|---|
| Cloudflare | `1.1.1.1`, `1.0.0.1`, `1.1.1.2`, `1.0.0.2`, `1.1.1.3`, `1.0.0.3` |
| Google | `8.8.8.8`, `8.8.4.4` |
| Quad9 | `9.9.9.9`, `149.112.112.112`, `9.9.9.10`, `149.112.112.10`, `9.9.9.11`, `149.112.112.11` |
| AdGuard | `94.140.14.14`, `94.140.15.15`, `94.140.14.15`, `94.140.15.16`, `94.140.14.140`, `94.140.14.141` |
| OpenDNS | `208.67.222.222`, `208.67.220.220`, `208.67.222.123`, `208.67.220.123` |

## Reglas implementadas y su motivo

Los identificadores R01–R15 proceden del plano; no expresan por sí solos la posición efectiva. R05 se desdobla en DNS y NTP por zona. Las matrices siguientes conservan el **orden observado**, aunque los números no sean consecutivos.

### R01 · Proteger la red doméstica

Regla flotante habilitada: **Block / In / IPv4 / Quick**, cualquier protocolo, origen `LAB_NETS`, destino `HOME_NETS`, puertos cualquiera y registro activado. Su motivo es impedir que una máquina del laboratorio use su conectividad para iniciar tráfico hacia casa, invitados o el adaptador de VirtualBox.

Los campos y los dos alias se observaron directamente. La prueba negativa desde las nuevas zonas y su coincidencia con un registro de R01 siguen pendientes. No cubre por sí sola nuevas subredes domésticas que se añadan fuera del alias ni un futuro despliegue IPv6.

### R03 y R04 · Administración desde el bastión

R03 permite a `BASTION` llegar a la dirección LAN del firewall por TCP/443. R04 permite a ese mismo host llegar a `LAB_NETS` por los puertos administrativos definidos. El objetivo es administrar desde un origen concreto y reconocible, en lugar de confiar en toda MGMT.

R04 es un permiso amplio dentro de esos puertos y de todo el `/16`; no se debe describir como autorización exclusiva a una sola VM o a un único servicio web del firewall. Su funcionamiento hacia los nuevos destinos se probará cuando existan. Las filas de permiso administrativo muestran logging activado; el registro de paquetes no sustituye a los logs de autenticación de cada servicio.

### R05 · Un único DNS y una única referencia horaria por zona

Cada red interna tiene dos permisos hacia **la dirección del firewall de su propia zona**: DNS por TCP/UDP 53 y NTP por UDP/123. Se evita autorizar estos servicios hacia cualquier dirección del laboratorio. TCP/53 se conserva para las consultas DNS que lo necesiten, no solo UDP.

Estos permisos hacen posible usar los servicios comunes sin abrir el resto del firewall a cada zona. Las filas están configuradas con logging desactivado; los bloqueos posteriores sí se registran. Se ha probado resolución local desde `fw-01`, pero falta validar R05 y el uso efectivo de DNS/NTP desde los futuros clientes.

### R06 · Eventos y registro de agentes hacia Wazuh

USERS, SERVERS y DMZ tienen permiso TCP hacia `SOC_WAZUH`, limitado a `WAZUH_AGENT_PORTS` —1514 y 1515—. No es permiso general hacia SOC, su dashboard, API o base de datos. La existencia de la regla no instala un agente ni un receptor.

Se añadió una **extensión explícita de R06 para el bastión**: en LAN, origen solo `BASTION`, mismos destino y puertos. El diseño original enumeraba USERS/SERVERS/DMZ; la extensión resuelve la obligación de recoger también el bastión. R04 no cubría esos dos puertos. Esta regla se observó finalmente antes de R15, tras corregir su posición inicial.

La recepción de eventos y el enrolamiento siguen pendientes. No se ha bloqueado todavía la contraseña de root del bastión: [0008](decisions/0008-sudo.md) exige primero sudo verificado e ingesta real de sus logs. La regla de red por sí sola no satisface esa condición.

### R08 · Actividad legítima hacia servicios concretos

USERS puede iniciar TCP/80 y TCP/443 hacia `srv-01` y `web-01`, representados por `LAB_WEB_SERVICES`. Esta actividad dará una línea base para la futura observación del SOC. El permiso se limita a dos hosts y al servicio web; no habilita libre tránsito de USERS a SERVERS o DMZ.

La regla y los destinos se observaron; las dos máquinas y sus servicios aún no están acreditados como desplegados. Su prueba positiva se realizará durante el alta de fuentes, manteniendo pruebas negativas hacia otros puertos o destinos.

### R09 · Contener las conexiones iniciadas desde DMZ

Después de sus excepciones R05 y R06, DMZ bloquea cualquier protocolo IPv4 hacia `LAB_NETS`, con registro. El motivo es que un servicio de DMZ no pueda explorar o iniciar conexiones arbitrarias hacia la administración, usuarios, servidores o SOC.

R09 no bloquea el retorno con estado de una conexión legítima admitida desde otra zona. Tampoco controla tráfico que permanezca dentro del segmento DMZ. Su orden es esencial: situarla antes de R06 cortaría la telemetría de esa zona. Se observó el orden correcto; falta la prueba negativa con registro.

### R13 y R13a · Web necesaria y bloqueo previo de resolutores conocidos

R13 permite únicamente **TCP/80 y TCP/443** desde la red de cada zona hacia el destino **invertido `RFC1918`**. Permite actualizaciones y navegación sin una regla de salida general. La inversión excluye las redes privadas; no es una clasificación exhaustiva de todos los rangos especiales de Internet ni una lista de sitios fiables. No inspecciona el contenido HTTPS.

R13a se evalúa antes: bloquea cualquier protocolo y puerto hacia `PUBLIC_DNS`, con logging. Evita que las direcciones conocidas usen el permiso web para saltarse el DNS del laboratorio, aunque ello también impide acceder a otros servicios que esos operadores alojen en esas mismas IP.

Para clientes, el DNS externo ordinario en 53 y DoT en 853 no encajan en R13; terminan en R13a cuando su IP está listada o en R15 en los demás casos. UDP/443 tampoco está permitido por R13: HTTP/3 y el DoH sobre ese transporte no tienen una excepción aquí. DoH sobre TCP/443 hacia una dirección no listada sigue siendo una limitación residual. El bloqueo de nombres añade otra capa, descrita más abajo.

`fw-01` utiliza algunas de esas IP para su propio DoT. No hay contradicción: R13a es tráfico entrante desde una zona, mientras que la conexión del resolutor tiene origen local en el firewall.

### R15 · Denegación final y visible

Cada zona termina con un bloqueo Quick de cualquier origen, destino y protocolo, con logging. La columna de versión se observó como comodín. Hace explícito qué ocurre con una conexión nueva que no obtiene una excepción anterior y permite investigar intentos inesperados.

Los permisos específicos observados son IPv4; las interfaces tienen IPv6 configurado como None. Esto no acredita una auditoría completa de IPv6, de tráfico local al segmento o de todas las reglas automáticas. No deben deducirse esas coberturas de la presencia de R15.

## Matriz ordenada por zona

En estas tablas, **Permitir** significa autorización configurada para iniciar el flujo, no servicio confirmado disponible. `*` significa cualquier valor. Las reglas específicas observadas están habilitadas, son IPv4, **In / Quick**, sin gateway de política elegido y con puerto de origen cualquiera. R15 conserva los comodines observados. R01 flotante se aplica además de estas filas; DHCP puede generar sus propias reglas y no se cuenta como una fila manual.

### MGMT · interfaz LAN · `10.20.10.0/24`

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R03 | `BASTION` → LAN address | TCP/443 | Permitir | Sí |
| 2 | R05 DNS | LAN network → LAN address | TCP/UDP 53 | Permitir | No |
| 3 | R05 NTP | LAN network → LAN address | UDP/123 | Permitir | No |
| 4 | R13a | LAN network → `PUBLIC_DNS` | `*` | Bloquear | Sí |
| 5 | R13 | LAN network → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 6 | R04 | `BASTION` → `LAB_NETS` | TCP `ADMIN_PORTS` | Permitir | Sí |
| 7 | R06, extensión bastión | `BASTION` → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 8 | R15 | `*` → `*` | `*` | Bloquear | Sí |

### USERS · `10.20.20.0/24`

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | USERS network → USERS address | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | USERS network → USERS address | UDP/123 | Permitir | No |
| 3 | R13a | USERS network → `PUBLIC_DNS` | `*` | Bloquear | Sí |
| 4 | R13 | USERS network → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R06 | USERS network → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 6 | R08 | USERS network → `LAB_WEB_SERVICES` | TCP `WEB_PORTS` | Permitir | No |
| 7 | R15 | `*` → `*` | `*` | Bloquear | Sí |

### SERVERS · `10.20.30.0/24`

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | SERVERS network → SERVERS address | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | SERVERS network → SERVERS address | UDP/123 | Permitir | No |
| 3 | R13a | SERVERS network → `PUBLIC_DNS` | `*` | Bloquear | Sí |
| 4 | R13 | SERVERS network → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R06 | SERVERS network → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 6 | R15 | `*` → `*` | `*` | Bloquear | Sí |

R08 no se copió a SERVERS: su permiso de actividad legítima pertenece a USERS. Una copia llegó a conservar dos redes como origen en R13a; la vista final muestra únicamente SERVERS. Los selectores múltiples añaden valores: copiar una regla exige sustituir los anteriores, no acumularlos.

### DMZ · `10.20.40.0/24`

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | DMZ network → DMZ address | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | DMZ network → DMZ address | UDP/123 | Permitir | No |
| 3 | R06 | DMZ network → `SOC_WAZUH` | TCP `WAZUH_AGENT_PORTS` | Permitir | No |
| 4 | R09 | DMZ network → `LAB_NETS` | `*` | Bloquear | Sí |
| 5 | R13a | DMZ network → `PUBLIC_DNS` | `*` | Bloquear | Sí |
| 6 | R13 | DMZ network → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 7 | R15 | `*` → `*` | `*` | Bloquear | Sí |

### SOC · `10.20.50.0/24`

| Orden | Regla | Origen → destino | Servicio | Acción | Log |
|---:|---|---|---|---|---|
| 1 | R05 DNS | SOC network → SOC address | TCP/UDP 53 | Permitir | No |
| 2 | R05 NTP | SOC network → SOC address | UDP/123 | Permitir | No |
| 3 | R13a | SOC network → `PUBLIC_DNS` | `*` | Bloquear | Sí |
| 4 | R13 | SOC network → `!RFC1918` | TCP `WEB_PORTS` | Permitir | No |
| 5 | R15 | `*` → `*` | `*` | Bloquear | Sí |

No se añadió una R06 de SOC hacia sí misma: el tráfico entre hosts de ese segmento no necesita atravesar el firewall. Tampoco se habilitó el escáner futuro. Las tablas reúnen **33 reglas manuales de interfaz observadas y R01 flotante suma 34**. R02 heredada y las reglas automáticas se tratan aparte. No es un recuento del ruleset completo cargado en PF.

## DNS: servicio local, salida cifrada y control de evasiones

### Por qué se eligió DoT

La [decisión 0004](decisions/0004-upstream-dns.md) documenta que el router doméstico interceptaba DNS en claro, lo que impedía la recursión esperada y alteraba respuestas. Se eligió reenviar desde Unbound por DoT autenticado, sin modificar la red doméstica. Se acepta depender de dos operadores y de TCP/853, conservando el filtrado bajo control local.

Las cuatro entradas de **DNS over TLS** se observaron habilitadas, con dominio vacío —cobertura general— y los siguientes parámetros:

| Operador | IP | Puerto | Verify CN | Forward first |
|---|---|---:|---|---|
| Quad9 sin bloqueo | `9.9.9.10` | 853 | `dns10.quad9.net` | Desmarcado |
| Quad9 sin bloqueo | `149.112.112.10` | 853 | `dns10.quad9.net` | Desmarcado |
| Cloudflare | `1.1.1.1` | 853 | `one.one.one.one` | Desmarcado |
| Cloudflare | `1.0.0.1` | 853 | `one.one.one.one` | Desmarcado |

**Use System Nameservers** está desmarcado. En **System → Settings → General**, los DNS manuales se dejaron vacíos, se desmarcó la importación por DHCP/PPP de WAN y se mantuvo permitido el DNS local para el sistema. Una consulta con servidor por defecto dejó de mostrar `10.20.254.2` y mostró `127.0.0.1` para A, AAAA, MX y TXT. Esto comprueba ese diagnóstico, no todas las posibles rutas de salida.

La configuración elegida debe fallar sin recurrir silenciosamente al DNS doméstico si pierde los upstreams DoT. Se observaron sesiones WAN con tráfico hacia `9.9.9.10:853` y `1.1.1.1:853`, pero **aún no se ha probado de forma controlada el fallo de ambos operadores ni la ausencia de fallback**. Ver TCP/853 tampoco demuestra por sí solo la autenticación del certificado o atribuye cada paquete a una consulta concreta.

Unbound está habilitado en el puerto 53, con selección de interfaces All y DNSSEC activo. Se observó el daemon en marcha y su archivo ACL generado con allow IPv4/IPv6 general. La tabla GUI de ACL vacía no significaba que faltasen las subredes; la cobertura efectiva también depende del filtro de paquetes. No se presenta ese ACL como una prueba de exposición desde WAN ni como una auditoría completa del acceso al resolutor.

El archivo personalizado `/usr/local/etc/unbound.opnsense.d/no-ipv6.conf` conserva `do-ip6: no`, porque no hay una ruta IPv6 desplegada. No elimina registros AAAA de las respuestas ni significa que deban bloquearse por ser IPv6. Su existencia explica al menos una sobrescritura manual; el aviso azul de la GUI no identifica por sí mismo todos los archivos o su precedencia.

### DoH: dos políticas de nombres y una capa por IP

La [decisión 0006](decisions/0006-doh-blocking.md) combina R13a con bloqueo local por nombre. No se utilizan aquí listas de terceros ni inspección TLS. Se prepararon dos políticas habilitadas de Unbound:

| Política | Coincidencia | Respuesta / alcance | Estado |
|---|---|---|---|
| `Firefox canary - desactivar DoH automatico` | Exacta: `use-application-dns.net` | Return NXDOMAIN; Source Net(s) vacío, sin restricción por origen; TTL 72000. | Formulario observado y respuesta A local NXDOMAIN probada. |
| `Bloqueo DoH por nombre` | Los 15 nombres de la tabla siguiente | Return NXDOMAIN y alcance global reportados; TTL 72000. | Guardado/aplicación reportados; `dns.google` probado por consulta real local. |

| Familia | Dominios exactos instruidos y reportados |
|---|---|
| Cloudflare | `cloudflare-dns.com`, `mozilla.cloudflare-dns.com`, `security.cloudflare-dns.com`, `family.cloudflare-dns.com`, `one.one.one.one` |
| Google | `dns.google` |
| Quad9 | `dns.quad9.net`, `dns10.quad9.net`, `dns11.quad9.net`, `dns12.quad9.net` |
| AdGuard | `dns.adguard-dns.com`, `unfiltered.adguard-dns.com`, `family.adguard-dns.com` |
| OpenDNS | `doh.opendns.com`, `doh.familyshield.opendns.com` |

Son nombres exactos, sin comodines ni una promesa de cubrir todos los servicios de cada operador. R13a cubre IP conocidas; estas políticas afectan al cliente que resuelve el nombre mediante `fw-01`. Un cliente con una IP no listada, un nombre alternativo o una selección manual de DoH puede escapar a esa combinación. El canary informa a Firefox para su activación automática; no impone por sí mismo una política de navegador cuando el usuario selecciona DoH expresamente. [Funcionamiento del canary según Mozilla](https://support.mozilla.org/en-US/kb/canary-domain-use-application-dnsnet).

El [matcher de DNSBL 26.7.4](https://github.com/opnsense/core/blob/26.7.4/src/opnsense/scripts/unbound-dnsbl/lib/dnsbl.py#L123) procesa A, AAAA, CNAME y HTTPS; no se afirma un bloqueo de todos los tipos de registro.

Bloquear los nombres de los proveedores no exige resolverlos para las conexiones DoT del firewall: las entradas usan IP y el nombre se configura como identidad del certificado. Las pruebas de evasión y el comportamiento de Firefox desde USERS siguen pendientes; no se ha observado todavía un navegador de esa zona.

### Una lección de verificación: Tester y la respuesta real

El **Tester de Blocklists** coincidía con la política correcta para el origen representativo `10.20.20.100`, pero devolvía `rcode: 0`. No era una consulta DNS real desde ese cliente. La lectura del [matcher de OPNsense 26.7.4](https://github.com/opnsense/core/blob/26.7.4/src/opnsense/scripts/unbound-dnsbl/dnsbl_match.py) y de [ModuleContext](https://github.com/opnsense/core/blob/26.7.4/src/opnsense/scripts/unbound-dnsbl/lib/__init__.py) identificó una doble conversión de la misma configuración: NXDOMAIN se transforma primero a 3 y después a 0 en la ruta del Tester. No se compararon directamente todos los archivos instalados con ese tag.

La comprobación decisiva fue `drill @127.0.0.1 use-application-dns.net A`: el resolutor devolvió **NXDOMAIN y ANSWER 0**. Se corrigió la interpretación inicial que exigía `rcode: 3` al Tester; no hizo falta parchear el firewall ni eliminar sobrescrituras. La conclusión se limita a ese flujo probado; que un evaluador de políticas diga Block y que un cliente reciba NXDOMAIN son evidencias distintas.

## Dnsmasq y DHCP: direcciones y nombres de USERS

Unbound atiende las consultas normales en 53; Dnsmasq conserva el puerto **53053** para su servicio DNS local y presta DHCP como función separada. Dnsmasq tiene seleccionadas **LAN y USERS**, pero **LAN está en Interface [no DHCP]**. El único rango DHCP configurado es USERS, `10.20.20.100`–`10.20.20.199`, con concesión de un día. El dominio es `internal` y los anuncios de router de Dnsmasq están desactivados; no se infiere una auditoría de todo el tráfico IPv6 a partir de ese campo.

Las direcciones `.10`–`.99` se reservan para estáticos; no se añadió DHCP a MGMT, SERVERS, DMZ o SOC. El arranque de Dnsmasq 2.93 y la carga del rango USERS con lease de un día constan en logs. La lectura mostraba cero nombres de concesiones; no se ha presentado una oferta DHCP real a un cliente.

El diseño de opciones es:

| Parámetro | Valor esperado en USERS | Configuración y límite |
|---|---|---|
| Router, opción 3 | `10.20.20.1` | Valor automático documentado para la interfaz; no se creó una entrada duplicada. Oferta real pendiente. |
| DNS, opción 6 | `10.20.20.1` | Mismo valor automático; concesión y uso efectivo pendientes. |
| NTP, opción 42 | `10.20.20.1` | Única opción personalizada observada, Type Set. El cliente puede requerir configuración explícita para usarla. |

Dnsmasq tiene marcada **Do not forward to system defined DNS servers**. El objetivo es que no vuelva a importar un upstream doméstico ni devuelva consultas desconocidas a Unbound. En Unbound se observaron solo estos reenvíos locales, con los servidores del sistema desactivados:

| Zona de consulta | Destino | Motivo |
|---|---|---|
| `internal` | `127.0.0.1:53053` | Nombres locales, incluidos futuros nombres DHCP. |
| `20.20.10.in-addr.arpa` | `127.0.0.1:53053` | Consulta inversa de `10.20.20.0/24`. |

Forward first desmarcado fue instruido y reportado, aunque no se releía en la tabla final. No se añadió un reenvío general de Internet por DNS en claro ni se amplió DHCP a otras redes. `configctl unbound check` no encontró errores y `no-existe.internal` recibió NXDOMAIN en 1 ms. Las pruebas positivas de un nombre DHCP y su PTR requieren una concesión real. [Integración oficial de Unbound con Dnsmasq](https://docs.opnsense.org/manual/dnsmasq.html#dhcpv4-with-dns-registration).

## NTP: una referencia temporal compartida

El diseño hace de `fw-01` la fuente NTP de cada zona mediante R05. Así se reducen diferencias que dificultan correlacionar un inicio de sesión, un evento de endpoint y un bloqueo de red. También importa para validar certificados de DoT. La [decisión 0005](decisions/0005-time.md) conserva servidores upstream por nombre y por IP para no depender solo de DNS al corregir el reloj.

Se observaron los pools de OPNsense y las IP de Cloudflare `162.159.200.1` y `162.159.200.123`. El estado mostraba un peer activo `195.95.153.59`, referencia GNSS, reach 377, offset −1.121 ms y jitter 0.653 ms. Su estrato 1 corresponde al upstream mostrado; no se atribuye ese estrato al firewall por copiar la cifra.

Ese estado confirma selección de un peer en la observación, no sincronización de los futuros endpoints. R05, la oferta DHCP y el uso efectivo por Windows/Linux se probarán durante el alta. Es NTP sin autenticación NTS desplegada; no se presenta una garantía criptográfica de hora. El firewall usa UTC y las capturas del Mac hora de Madrid: los tiempos de las evidencias deben conservar zona u offset.

## R07: syslog preparado, aún sin recepción

Se reportó guardado y aplicado un destino remoto **intencionadamente deshabilitado**, en **System → Settings → Logging → Remote**: UDP(4), IP `10.20.50.10`, puerto 514 y descripción `R07 fw-01 to Wazuh syslog`. Applications, Levels y Facilities quedaron vacíos —todas las categorías según la ayuda— y RFC5424 sin marcar. No se obtuvo una nueva captura de la fila persistida; el logging local permaneció habilitado. [Ajustes de logging de OPNsense](https://docs.opnsense.org/manual/settingsmenu.html#logging).

Cuando se despliegue Wazuh habrá que configurar expresamente su receptor, comprobar la IP de origen real de `fw-01`, activar el destino y seguir el evento hasta recepción, decodificación, indexación y búsqueda. Aceptar un datagrama o abrir un puerto no cierra esa cadena. UDP no aporta confirmación de entrega y deben comprobarse interrupciones, pérdidas y salud de fuente.

No se añadió una regla de entrada SOC como sustituto de esa configuración. Tampoco se ha declarado R07 completada. La retención del futuro receptor se rige por [0010](decisions/0010-retention.md), con gestión separada de índices, archivos y evidencia protegida; la rotación local observada del firewall no demuestra esa política implementada.

## Evidencia disponible y pruebas que faltan

La siguiente tabla evita confundir un diseño correcto con su validación completa. Las salidas proceden de capturas suministradas por el propietario; el repositorio registra transcripciones técnicas y no contiene sus XML privados ni un volcado de capturas con información personal.

| Control / prueba | Resultado observado | Alcance y pendiente |
|---|---|---|
| Interfaces y rutas, 17-oct | Las cinco zonas internas y WAN tienen los dispositivos y direcciones de la tabla. | Tráfico de extremo a extremo no deducido. |
| Reglas de interfaz, 17–18-oct | Conjuntos y orden de las cinco zonas observados; recordatorio de cambios pendientes ausente en vistas finales, con aplicación reportada. | Inspección completa de PF, alias activos y pruebas por zona pendientes. |
| DNS por defecto, 18-oct | A/AAAA/MX/TXT de `deb.debian.org` vía `127.0.0.1`; `10.20.254.2` ya no aparece en ese diagnóstico. | No acredita todas las rutas DNS o todos los procesos. |
| Canary, 19-oct | A de `use-application-dns.net`: NXDOMAIN, ANSWER 0, 1 ms. | Consulta localhost; Firefox y cliente USERS pendientes. |
| DoH por nombre, 19-oct | A de `dns.google`: NXDOMAIN, ANSWER 0, 0 ms. | Solo uno de los 15 nombres y un tipo de consulta probado. |
| DNS normal, 19-oct | A de `deb.debian.org`: NOERROR, CNAME y cuatro IPv4, 363 ms. | La resolución permitida sigue funcionando en localhost. |
| DNSSEC positivo, 19-oct | `cloudflare.com`: NOERROR, bandera ad, dos A y RRSIG, 222 ms. | Comportamiento de la ruta de resolución; no atribución exclusiva al validador local. |
| DNSSEC inválido, 19-oct | `dnssec-failed.org`: SERVFAIL, ANSWER 0, 1159 ms. | Coherente con el rechazo esperado junto al positivo; SERVFAIL aislado no identifica su causa. |
| Captura WAN, 19-oct | Tráfico bidireccional TCP/853 con `9.9.9.10` y `1.1.1.1`; 139 paquetes capturados, 0 descartados por kernel. | Solo se mostró la cola; no prueba ausencia global de puerto 53, autenticación TLS ni fallo cerrado. |
| Integración local, 19-oct | Sintaxis de Unbound sin errores; `no-existe.internal` NXDOMAIN en 1 ms. | Nombre DHCP real y PTR pendientes; el negativo no demuestra el salto exacto a Dnsmasq. |
| DHCP | Rango USERS y opción NTP observados; arranque/rango de un día en logs. | Concesión, opciones recibidas, ausencia de servicio fuera de USERS y uso por cliente pendientes. |
| NTP | Peer activo y estado upstream observados; bastión tenía comprobaciones previas de hora. | Cobertura de servicio y sincronización de nuevas fuentes pendientes. |
| Syslog y Wazuh | Preparación deshabilitada reportada. | Receptor, envío, ingesta, decodificación y salud pendientes. |
| Recuperación | XML cifrado previo y actualizado reportados fuera de la VM. | Archivo, descifrado y restauración no inspeccionados; archivo personalizado aparte. |

### Validación progresiva al incorporar las máquinas

Para cada nueva fuente se conservarán dirección de origen, destino, puerto/protocolo, hora con zona, resultado y regla o registro que explica la decisión. Una conexión fallida por timeout no demuestra un bloqueo: puede faltar el servidor. Una conexión permitida necesita un servicio o testigo disponible en el destino.

| Caso | Resultado esperado y evidencia útil |
|---|---|
| USERS obtiene DHCP | Dirección `.100`–`.199`, `/24`, gateway/DNS/NTP `.1`; leer concesión y parámetros del cliente. |
| Cada zona consulta su firewall y sincroniza hora | DNS UDP/TCP y NTP funcionando por R05; verificar servidor realmente usado, no solo configuración. |
| Acceso legítimo USERS → servicios | HTTP/HTTPS a los dos destinos R08; otros puertos o destinos sin excepción rechazados. |
| Nueva conexión DMZ → interior | Bloqueo por R09 y registro coincidente, mientras DNS/NTP/R06 conservan su excepción. |
| Nueva conexión laboratorio → HOME_NETS | Bloqueo por R01 y registro; usar una prueba acotada autorizada, no escanear la red doméstica. |
| Cliente intenta DNS externo o resolutor conocido | R13a o R15 según destino/servicio; probar el navegador y registrar límite de IP/nombre conocido. |
| Agente de USERS/SERVERS/DMZ y bastión → Wazuh | Registro y eventos recibidos, con trazabilidad de origen; los demás servicios SOC no se abren por R06. |
| Firewall → receptor syslog | Evento real recibido, interpretado e indexado; comprobar fuente y salud tras una interrupción. |
| Pérdida controlada de DoT | Tras una prueba reversible acordada, no debe aparecer un upstream en claro; conservar un positivo de control y restaurar. |
| Nombre DHCP y reversa USERS | Resolver A y PTR de una concesión real mediante Unbound y contrastarlos con Dnsmasq. |

No es necesario repetir todas las pruebas satisfactorias tras cada lectura. Se reabren cuando cambian reglas, servicios, upstreams, direcciones, versiones o aparece una discrepancia. Las pruebas de ingesta, retención, pérdida/recuperación y fuentes obligatorias siguen formando parte de P1, no de una conclusión anticipada del firewall.

## Límites aceptados y mantenimiento

- **El estado documentado no es una auditoría completa.** Faltan reglas activas, pruebas por zona y algunos contenidos completos de alias. Se distingue cada nivel de evidencia para que otra persona pueda revisarlo.
- **HTTPS sigue siendo una salida permitida.** Puede transportar actividad no deseada hacia direcciones no bloqueadas; no hay inspección de contenido TLS. Las listas manuales de DoH requieren revisión.
- **El bastión concentra autoridad.** R04 alcanza todo `LAB_NETS` en puertos administrativos. Sus credenciales, actualizaciones, auditoría y futura ingesta son parte del control.
- **La segmentación no cubre el mismo segmento.** La visibilidad de red adicional conserva su fase P4; no se adelanta ni se da por instalada.
- **DoT desplaza confianza a dos operadores.** La dependencia de red, certificado y hora permanece; falta comprobar el fallo cerrado, además de vigilar errores de autenticación y SERVFAIL.
- **El estado IPv6 es deliberadamente limitado.** Interfaces sin IPv6 y Unbound sin transporte IPv6 no equivalen a una auditoría de toda la pila. Si se habilita IPv6, deben revisarse reglas, aliases, DHCPv6/RA, DNS y aislamiento.
- **Las IP estáticas de servicios todavía son destinos previstos.** Alias, rutas y permisos no prueban un listener. Wazuh, `srv-01` y `web-01` se validarán al desplegarlos.
- **Los controles futuros no están abiertos por adelantado.** R10 de escaneo y R11/R12/R14 de ATTACK son P2; las redes AI/OT y sandbox conservan sus condiciones originales.

Cada cambio de proveedor o red debe actualizar alias, reglas, documentación y casos del mapa como una sola revisión. No se debe confundir la matriz del plano original —diseño de varias fases— con esta fotografía de implementación.

## Copias, cambios y reversión

Antes de modificar políticas, se conserva acceso por consola VMware y una exportación completa cifrada de OPNsense fuera de la VM. La copia previa a P1 y la actualizada de 19-oct fueron **reportadas** como descargadas y con contraseña privada en KeePassXC. No se inspeccionó el descifrado ni se ejecutó una restauración para este hito. No deben subirse al repositorio XML, contraseñas, claves ni bases del gestor. [Copias de configuración](https://docs.opnsense.org/manual/backups.html).

El XML no incluye el archivo externo `no-ipv6.conf`; debe preservarse o reconstruirse conforme a 0004. La copia `.vmx` previa a añadir hardware protege la definición de adaptadores, no los discos de las VM ni sus cadenas de snapshots. Restaurar una configuración antigua exige contrastar de nuevo MAC, dispositivo, interfaz y dirección: no asumir que la enumeración es idéntica.

Una reversión debe dirigirse al cambio concreto: identificar la última configuración correcta, restaurar o deshabilitar la entrada afectada, aplicar, verificar el acceso administrativo y repetir el caso que motivó el cambio junto a su control positivo. Para reglas con estado, revisar únicamente los estados pertinentes. No se prescribe deshabilitar globalmente PF, abrir una regla any-any ni degradar permanentemente a DNS doméstico como paso ordinario de recuperación.

Save guarda la intención; Apply solicita llevarla al servicio. Los selectores múltiples, el orden real, la configuración generada y una prueba de tráfico completan la revisión. El aviso de sobrescrituras manuales no es una orden de borrar archivos correctos. El mapa y esta guía describen el estado documentado; ninguna interacción del lector aplica cambios al laboratorio.

## Documentos de referencia

- [Mapa interactivo de la política](firewall-policy-map.html) y [plano general de red](network-plan.html).
- [0003 · Direccionamiento](decisions/0003-addressing.md), [0004 · DNS upstream](decisions/0004-upstream-dns.md), [0005 · NTP](decisions/0005-time.md), [0006 · Bloqueo DoH](decisions/0006-doh-blocking.md) y [0008 · Condición de bloqueo de root en el bastión](decisions/0008-sudo.md).
- [0009 · Capacidad](decisions/0009-capacity.md) y [0010 · Retención](decisions/0010-retention.md): decisiones aceptadas cuyo comportamiento completo requiere implementación y validación.
- [Ejecución y evidencias de red P1](https://github.com/yamekuro/soc-homelab/blob/docs/p1-capacity-retention/infra/p1-network-start.md), [preflight](https://github.com/yamekuro/soc-homelab/blob/docs/p1-capacity-retention/infra/p1-preflight.md), [runbook](runbook.md), [progreso del proyecto](progress.md) y [blueprint](blueprint.html).

La documentación de producto enlazada se consultó como apoyo técnico; los archivos del proyecto y las evidencias con su fecha gobiernan lo que se declara implementado. **Este documento no cierra P1.**
