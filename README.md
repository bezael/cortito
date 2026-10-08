# cortito

Acortador de enlaces con API, página web, estadísticas de clics y tests. Es el proyecto que se construye en el vídeo **Claude Code desde cero: curso completo en español** del canal Dominicode, y el proyecto de práctica del curso de Udemy **Claude Code para Developers**.

Stack: Bun + TypeScript + Hono + SQLite (`bun:sqlite`). Una sola dependencia (`hono`).

Todo el código lo ha escrito Claude Code siguiendo los prompts del vídeo. Los tienes copiados más abajo, capítulo a capítulo.

## Ramas

Cada rama es el estado del proyecto **al final** de un capítulo del vídeo, para que puedas saltar a cualquier punto. `main` es el estado final.

| Rama | Capítulo del vídeo | Qué hay | `bun test` |
|---|---|---|---|
| `cap-07` | 7. Proyecto 1: de carpeta vacía a API con tests | `POST /api/links`, `GET /:code` y sus tests | 6 pass |
| `cap-08` | 8. CLAUDE.md con /init y memoria del proyecto | + `CLAUDE.md` y `.claude/settings.json` (Claude Code no puede leer `.env`) | 6 pass |
| `cap-09` | 9. Proyecto 2: nueva funcionalidad con Plan Mode | + estadísticas de clics y página web con su hoja de estilos | 10 pass |
| `cap-10-inicio` | 10. Cuando Claude se equivoca (punto de partida) | La validación "simplificada" a mano antes de empezar el capítulo. **Tiene un bug a propósito**: es el que se depura en el vídeo | 10 pass (el bug no lo pilla ningún test) |
| `cap-10` | 10. Cuando Claude se equivoca (final) | Bug arreglado y test de regresión en `tests/seguridad.test.ts` | 12 pass |
| `cap-12` | 12. Tu primera skill | + la skill `/listo` en `.claude/skills/listo/SKILL.md` | 12 pass |
| `main` | Estado final | Igual que `cap-12` | 12 pass |
| `curso/v12` | Curso, lección V12 (refactoring multi-archivo) | Estado de partida de la lección | 12 pass |
| `curso/v13` | Curso, lección V13 (debugging con logs) | Estado de partida de la lección | 12 pass |

Los capítulos 11 (git, `/diff`, `/review` y PR) y el `/rewind` del 10 no cambian el código: no tienen rama propia.

Para ir a una rama:

```bash
git switch cap-09
bun install
bun test
```

Las ramas `curso/*` son los puntos de partida de lecciones del curso de Udemy. Úsalas cuando la lección te lo indique.

## Requisitos

- **Bun 1.3 o posterior.**
  - Windows (PowerShell): `powershell -c "irm bun.sh/install.ps1 | iex"`
  - macOS y Linux: `curl -fsSL https://bun.sh/install | bash`
  - Comprueba: `bun --version`
- **Git.** En Windows, instala Git for Windows (https://git-scm.com/download/win): Claude Code usa su Bash para ejecutar comandos; sin él usa PowerShell.
- **Claude Code**, si quieres repetir los prompts. Se instala en el capítulo 3 del vídeo:
  - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
  - macOS, Linux o WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Comprueba: `claude --version`
- **curl**, para probar la API a mano. Ya viene con Windows 10 y 11, macOS y casi todas las distribuciones de Linux.

No hace falta Node, ni `jq`, ni compilar nada: SQLite y el test runner vienen dentro de Bun.

## Arrancar

```bash
bun install
bun run dev
```

Abre http://localhost:3000 (desde `cap-09`), pega una URL y pulsa **Acortar**. Abre el enlace corto y vuelve a la pestaña: el contador de clics sube.

`bun run dev` recarga al guardar. `bun run start` arranca sin recarga. La base de datos se guarda en `cortito.sqlite`, que está en `.gitignore`.

Variables opcionales (copia `.env.example` a `.env`; Bun lo carga solo):

| Variable | Por defecto | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `BASE_URL` | el origen de la petición | Con qué dominio se construye `shortUrl` |
| `DB_PATH` | `cortito.sqlite` | Archivo de SQLite. `:memory:` para no guardar nada |

## Tests

```bash
bun test
```

En `main` tienen que salir **12 pass, 0 fail**. Cada test crea su propia base de datos en memoria, así que no tocan `cortito.sqlite` ni necesitan el servidor arrancado.

## API

| Método y ruta | Qué hace | Respuestas | Desde |
|---|---|---|---|
| `POST /api/links` con `{ "url": "https://..." }` | Crea un enlace corto | `201 { code, shortUrl }` · `400 { error }` si la URL no es http o https | `cap-07` |
| `GET /:code` | Redirige a la URL original (y suma un clic desde `cap-09`) | `302` · `404` | `cap-07` |
| `GET /api/links/:code/stats` | Estadísticas del enlace | `200 { url, clicks, createdAt }` · `404` | `cap-09` |
| `GET /` | Página con el formulario | `200` HTML | `cap-09` |

Probarlo a mano (Git Bash, macOS o Linux):

```bash
curl -s -X POST http://localhost:3000/api/links -H "content-type: application/json" -d '{"url":"https://dominicode.com"}'
curl -i http://localhost:3000/<code>
curl -s http://localhost:3000/api/links/<code>/stats
```

En PowerShell escribe `curl.exe`, no `curl` (que es un alias de `Invoke-WebRequest`). En PowerShell 7 el resto del comando es igual. En Windows PowerShell 5.1 (el azul que viene con Windows) hay que escapar las comillas del JSON:

```powershell
# PowerShell 7
curl.exe -s -X POST http://localhost:3000/api/links -H "content-type: application/json" -d '{"url":"https://dominicode.com"}'
# Windows PowerShell 5.1
curl.exe -s -X POST http://localhost:3000/api/links -H "content-type: application/json" -d '{\"url\":\"https://dominicode.com\"}'
```

## Estructura (en `main`)

```
src/
  index.ts        arranque del servidor (lee PORT, BASE_URL, DB_PATH)
  app.ts          rutas de Hono
  links.ts        acceso a la tabla links
  validation.ts   validateUrl: solo http y https
  code.ts         genera códigos de 6 caracteres
  db.ts           abre SQLite y crea la tabla
public/           index.html y styles.css
tests/            bun test
.claude/          settings.json (bloquea .env) y la skill /listo
CLAUDE.md         contexto para Claude Code
```

## Los prompts del vídeo

Copiados tal cual del guion. Lo que Claude conteste y el código que escriba cambian en cada sesión: si repites los prompts, no vas a obtener exactamente este código, y está bien. Lo que tiene que coincidir es el resultado: los tests en verde.

### Capítulo 7. Proyecto 1: de carpeta vacía a API con tests

```bash
mkdir cortito
cd cortito
git init
claude
```

En Plan Mode (`Shift+Tab` hasta "plan mode on"):

```text
Quiero crear un acortador de enlaces llamado cortito.

Stack: Bun, TypeScript, Hono y SQLite con bun:sqlite. No añadas más dependencias.

Primera versión:
- POST /api/links recibe { url } y devuelve { code, shortUrl }. Solo acepta URLs http y https.
- GET /:code redirige con un 302 a la URL original. Si el código no existe, devuelve 404.

Tests con bun test que cubran los dos endpoints y el caso de URL no válida.

Terminado significa: todos los tests en verde y me enseñas la salida de bun test.

Propón la estructura de carpetas, el esquema de la tabla y la lista de tests antes de escribir código.
```

Comprobarlo a mano, con el servidor arrancado en otra terminal:

```text
!curl -s -X POST http://localhost:3000/api/links -H "content-type: application/json" -d '{"url":"https://dominicode.com"}'
```

Primer commit:

```text
Haz commit de todo con un mensaje descriptivo.
```

### Capítulo 8. CLAUDE.md con /init y memoria del proyecto

```text
/init
```

El `CLAUDE.md` después de recortarlo (las líneas de "Comandos" las genera `/init`; la sección "Reglas" se escribe a mano):

````markdown
# cortito

Acortador de enlaces. Bun + TypeScript + Hono + SQLite (bun:sqlite).

## Comandos
- `bun test`: tests. Ejecútalos después de cada cambio.
- [el comando de desarrollo que haya generado /init]

## Reglas
- No añadas dependencias sin preguntarme antes.
- Cada endpoint nuevo lleva su test.
- Mensajes de commit en Conventional Commits y en español.
- Las URLs que guarda la app solo pueden ser http o https.
````

`.claude/settings.json`, para que Claude Code no pueda leer el `.env`:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  }
}
```

```text
Haz commit del CLAUDE.md y de .claude/settings.json.
```

### Capítulo 9. Proyecto 2: nueva funcionalidad con Plan Mode

Sesión nueva (`/clear`) y en Plan Mode. Primero explorar:

```text
¿Cómo se guarda hoy un enlace y dónde se resuelve la redirección? Dime qué archivos tendría que tocar para contar los clics.
```

Después, el plan:

```text
Añade estadísticas a cortito.

- Cada vez que alguien usa un enlace corto, suma un clic.
- GET /api/links/:code/stats devuelve { url, clicks, createdAt }. Si el código no existe, 404.
- En / quiero una página HTML sencilla, sin frameworks, con un formulario que acorta una URL y enseña el enlace corto.

Terminado significa: tests nuevos para el contador y para las estadísticas, todos los tests en verde, y la página funciona en el navegador.
```

Con una captura de la página pegada en la terminal (`Alt+V` en Windows, `Ctrl+V` en macOS y Linux):

```text
[Image #1] Esta es la página ahora. Centra el formulario, pon el enlace corto en grande con un botón para copiarlo y usa una sola hoja de estilos sin librerías.
```

### Capítulo 10. Cuando Claude se equivoca: depurar, /rewind y el contexto

Parte de la rama `cap-10-inicio`:

```text
Un usuario ha creado un enlace corto a javascript:alert(1) y la app lo ha aceptado.

Primero escribe un test que reproduzca el bug y enséñame que falla. Después arréglalo y vuelve a pasar todos los tests. Busca la causa: no pongas un parche solo para "javascript:".
```

Para probar `/rewind`, un cambio que no vas a querer:

```text
Reescribe todo el proyecto usando clases en vez de funciones
```

Después, `Esc` dos veces con la caja de texto vacía (o `/rewind`) y "Restore code and conversation".

Para el contexto:

```text
/context
/compact céntrate en los cambios de estadísticas
/clear
```

### Capítulo 11. Git con Claude Code: revisar, commit y PR

```text
/diff
/review
```

```text
Crea una rama feature/estadisticas, haz commit de los cambios y abre un PR con gh describiendo qué cambia y cómo probarlo.
```

El PR necesita la CLI de GitHub (`gh`) instalada y autenticada, y un remoto en GitHub.

### Capítulo 12. Tu primera skill

`.claude/skills/listo/SKILL.md`:

````markdown
---
description: Revisa si los cambios están listos para commit. Úsala cuando te pida revisar antes de hacer commit.
disable-model-invocation: true
---

## Cambios sin commitear

!`git diff HEAD`

## Resultado de los tests

!`bun test 2>&1`

## Instrucciones

Con los cambios y el resultado de los tests de arriba:

1. Di en una línea si está listo para commit: sí o no, y por qué.
2. Lista los riesgos: tests que faltan, valores escritos a fuego, errores sin manejar y cambios que no tienen que ver con la tarea.
3. Propón un mensaje de commit en Conventional Commits y en español.

No modifiques ningún archivo.
````

Y se lanza con:

```text
/listo
```

## Licencia

MIT. Úsalo, cámbialo y rómpelo todo lo que quieras.
