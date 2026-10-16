---
status: resolved
trigger: "3 P0 encadenados bloquean batch-send de 40 emails en Pulsar outreach — P0-1 YOUTUBE_API_KEY not set, P0-2 null unit_id en comms_dispatch_queue, P0-3 top_flags empty"
created: 2026-07-16T00:00:00Z
updated: 2026-07-16T03:40:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: RESUELTO
test: Verificación E2E completa
expecting: DONE
next_action: ARCHIVE

## Symptoms

expected: run_pulsar_outreach completa el ciclo: dossier con top_flags → compose draft → insert en comms_dispatch_queue con unit_id → draft firmado listo para envío
actual: Falla en cascada — P0-1 mata Pulsar antes de generar datos → P0-3 top_flags vacío → P0-2 null unit_id rompe el insert
errors: |
  [run-pulsar] FATAL: YOUTUBE_API_KEY not set in environment (.env.local or ~/.env)
  [agent] Draft insert failed: null value in column "unit_id" of relation "comms_dispatch_queue" violates not-null constraint
  [compose-draft] Pulsar dossier found for @adriang.martin but top_flags is empty — cannot compose a data-grounded email
reproduction: Disparar run_pulsar_outreach para cualquier canal (@adriang.martin usado como ejemplo)
started: 2026-07-16 01:12–01:20 según logs de Alpha

## Eliminated

(ninguna hipótesis eliminada aún)

## Evidence

- timestamp: 2026-07-16T00:00:00Z
  checked: logs de Alpha provistos por CEO
  found: 3 errores P0 encadenados; YOUTUBE_API_KEY ausente es el primero en el tiempo
  implication: P0-1 es la raíz; P0-3 es consecuencia directa; P0-2 puede ser independiente o también consecuencia

## Resolution

root_cause: |
  P0-1: SSH spawn en process-agent-task.ts usa spawn('ssh', [..., pulsarCommand]) donde pulsarCommand
  tenía 'source .env'. SSH ejecuta el string en /bin/sh=dash en Ubuntu, que NO tiene 'source'.
  El .env con YOUTUBE_API_KEY estaba en /opt/constellation/.env pero nunca se exportaba al proceso npx tsx.
  
  P0-2: compose_email_draft inserta en comms_dispatch_queue usando task.unit_id directamente.
  Si la compose task fue encolada con unit_id=null (por race o error en run anterior), el insert
  viola la restricción NOT NULL. No había fallback para resolver unit_id desde prospect_id.
  
  P0-3: Dependiente de P0-1 (sin YouTube API, solo corre decay fallback que dispara launch_velocity_decay,
  que NO está en TOP_FLAG_PRIORITY=['deletion_event','adrift_no_traction','view_concentration',
  'declining_slope','legacy_dominance']). La guard del composer abortaba hard si top_flags=[] aunque
  fired_flags tuviera datos — pero el body builder ya tenía el fallback fired_flags[0] implementado.

fix: |
  P0-1: En process-agent-task.ts línea ~571, cambiar pulsarCommand para usar:
    bash -c 'set -a; [ -f /opt/constellation/.env ] && . /opt/constellation/.env; set +a; cd /opt/constellation && npx tsx scripts/run-pulsar.ts @{handle}'
  Usa bash -c explícito y dot(.) en lugar de source (POSIX, funciona en dash/sh/bash).
  
  P0-2: En process-agent-task.ts bloque compose_email_draft (línea ~227), antes del insert
  a comms_dispatch_queue: resolver effectiveUnitId desde prospector_channels.unit_id si task.unit_id
  es null. Si sigue null, loguear error y saltar el insert (no violar NOT NULL).
  
  P0-3: En compose-email-draft.ts línea ~822, cambiar la guard: solo abortar hard si AMBOS
  top_flags Y fired_flags están vacíos. Si top_flags=[] pero fired_flags tiene datos, warn y continuar
  — el body builder ya tiene el fallback a fired_flags[0] (línea 563).

verification: |
  E2E para @adriang.martin:
  - run_pulsar_outreach task f5d6cbb7: completed, exit 0, SSH bash -c corrió Pulsar correctamente
  - unit creada: 56d36cbc-ec68-4595-a9d7-6af6e596c00a
  - compose_email_draft task f2a43f22: completed, subject="something in your channel's traffic"
  - draft_id: e053b1e1-e924-4b5f-ac51-c170050123ab en comms_dispatch_queue
  - unit_id: 56d36cbc (NOT NULL) ✓
  - html_body con sentinel <!-- ===== HOM EMAIL SIGNATURE, logo https://hypeon.media/email-logo.png,
    Chris Walker + New York + +1 727 353 2416 ✓
  - text_body con firma plain-text ✓

files_changed:
  - /opt/units-worker/src/jobs/process-agent-task.ts (P0-1 + P0-2, commit 63080ac)
  - /opt/units-worker/src/jobs/compose-email-draft.ts (P0-3, commit cb5cdbf)
