// Delt logik for tilgængelighedskalenderen (offentlig + admin).
// Alle datoer håndteres som rene YYYY-MM-DD-strenge for at undgå tidszone-skæve datoer.

export type DayStatus = 'available' | 'partial' | 'full' | 'out-of-season' | 'past'

export interface OccupiedDay {
  date: string
  shelter_occupied: boolean
  tents_occupied: number
}

export interface SeasonConfig {
  season_start: string
  season_end: string
}

export const TOTAL_TENTS = 3

/** Formatér et Date-objekt til lokal YYYY-MM-DD (ingen UTC-konvertering). */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Dagens dato som YYYY-MM-DD i lokal tid. */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Parse YYYY-MM-DD til et lokalt Date-objekt (ingen tidszone-forskydning). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Beregn status for en dag.
 * Fortid prioriteres, derefter uden for sæson, derefter optaget-niveau.
 */
export function computeStatus(
  dateISO: string,
  occupied: OccupiedDay | undefined,
  season: SeasonConfig,
  today: string,
): DayStatus {
  if (dateISO < today) return 'past'
  if (dateISO < season.season_start || dateISO > season.season_end) return 'out-of-season'

  const shelter = occupied?.shelter_occupied ?? false
  const tents = occupied?.tents_occupied ?? 0

  if (!shelter && tents === 0) return 'available'
  if (shelter && tents >= TOTAL_TENTS) return 'full'
  return 'partial'
}

export function statusLabel(status: DayStatus): string {
  switch (status) {
    case 'available': return 'Alt ledigt'
    case 'partial': return 'Delvist ledigt'
    case 'full': return 'Alt optaget'
    case 'out-of-season': return 'Uden for sæson'
    case 'past': return 'Overstået'
  }
}

/** Detaljelinje vist når en dag vælges, fx "Shelter: optaget · Teltpladser: 2 af 3 ledige". */
export function dayDetail(status: DayStatus, occupied: OccupiedDay | undefined): string {
  if (status === 'out-of-season') return 'Uden for sæson — ikke til booking'
  if (status === 'past') return 'Datoen er overstået'

  const shelter = occupied?.shelter_occupied ?? false
  const tents = occupied?.tents_occupied ?? 0
  const tentsFree = TOTAL_TENTS - tents
  const shelterText = shelter ? 'optaget' : 'ledig'
  const tentText = `${tentsFree} af ${TOTAL_TENTS} ledige`
  return `Shelter: ${shelterText} · Teltpladser: ${tentText}`
}

/**
 * Byg en månedsgrid (mandag-først). Returnerer celler hvor null = tom plads
 * før månedens første dag, og strenge = YYYY-MM-DD.
 */
export function buildMonthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1)
  // getDay(): 0=søn..6=lør. Konvertér til mandag-først (0=man..6=søn).
  const leading = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISODate(new Date(year, month, d)))
  }
  return cells
}

/** Månedsoverskrift, fx "juni 2026". */
export function formatMonthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })
}

/** Lang datolabel, fx "tirsdag 16. juni". */
export function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const WEEKDAY_LABELS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
