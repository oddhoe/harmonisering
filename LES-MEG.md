# Harmonisering – arbeidsskjema

`harmonisering.html` er appen. Den er uendret fra år til år.
`harmonisering-data.json` er årets kjørerute. Det er den du bytter.

Begge filene skal ligge i samme mappe på serveren, sammen med metodefil-PDF-en,
metodefil-ZIP-en og BoreSight-veiledningen.

## Slik gjør du det i 2027

1. Legg `Metodefil_XX_og_GeoJSON.pdf` og `.zip` i mappa.
2. Åpne appen, gå til **Oppsett → Les kjøreruten fra PDF**, velg kjørerute-PDF-en.
3. Kontroller tabellen. Røde felt mangler verdi. Har du GeoJSON-fila fra
   metodefilen, kan du hente koordinatene derfra i stedet – det er sikrere.
4. Trykk **Lagre som nytt datasett**. Appen bruker det med én gang.
5. Under **Aktivt datasett**, trykk **Last ned datasettet som JSON**, gi fila
   navnet `harmonisering-data.json` og legg den i mappa på serveren. Da får du
   samme oppsett på alle enheter uten å importere på nytt.
6. Rett opp filnavn på metodefil og BoreSight i JSON-en hvis de har endret seg.

Går PDF-tolkningen skeis, trykk **Vis råtekst fra PDF → Kopier råteksten** og
send teksten til meg. Da lager jeg JSON-en ferdig, og du bruker
**Bytt datasett → Bruk innlimt JSON**.

## Registreringer

Måleverdier og logg lagres under nøkkelen `harm_<id>`, der `id` kommer fra
datasettet. 2026-data og 2027-data ligger derfor side om side, og du mister
ingenting ved å bytte. **Nullstill** i topplinja tømmer bare det aktive året.

## Feltene i JSON-en

Toppnivå:

| Felt | Betydning |
|---|---|
| `id` | Kort kode, styrer lagringsnøkkelen. Må være ny hvert år, f.eks. `frk2027`. |
| `aar` | Årstall. |
| `tittel` | Vises i topplinja, PDF-rapporten og fanetittelen. |
| `versjon` | Fritekst, vises under tittelen. |
| `estKm` | Anslått kjørelengde, vises i kjøreplanen til GPS overtar. |
| `filer` | `metodefilPdf`, `metodefilZip`, `boresightPdf` – filnavn i samme mappe. |
| `parkering`, `base` | `navn` vises, `sok` er søkestrengen til Google Maps. |
| `routePoints` | Start- og sluttpunkt i kjøreplanen. GPS overskriver disse under kjøring. |
| `planOrder` | Rekkefølgen strekningene kjøres i, som indekser. Utelates den, brukes 0,1,2,… |

Hver strekning:

| Felt | Betydning |
|---|---|
| `veg` | `Fv112`, `Ev6` … |
| `seg` | Vegsystemreferanse, f.eks. `S1D1`. |
| `meter` | Meterintervall, f.eks. `373–1373`. |
| `felt` | `F1`, `F6` … |
| `tittel` | Kort beskrivelse. |
| `farge` | Hex-farge. Utelates den, tildeles en automatisk. |
| `type` | Merkelapp: Kalibrering, Snor, Lang, NY, Foto, Kontroll. |
| `metode` | Beregningsmetode i metodefila, `B` eller `S`. `null` hvis den ikke gjelder. |
| `ukedag` | Settes bare når strekningen må kjøres en bestemt dag. |
| `lat`, `lon` | Startpunkt. Brukes av navigasjonsknappene og GPS-deteksjonen. |
| `kjoring` | Kjøreinstruksjon, steg 1 i detaljvisningen. |
| `rapport` | Rapportinstruksjon. |
| `filter` | ViaPPS Analyse-filter, f.eks. `m530–2230`. `null` hvis ikke aktuelt. |
| `notat` | Advarsel, vises gult. |

`id` på strekningene settes av appen ut fra rekkefølgen i lista, så den skal du
ikke skrive selv.

## Verdt å vite

- PDF-lesingen bruker pdf.js fra nett, så den må gjøres med dekning – gjør det
  på kontoret før turen. Alt annet virker offline.
- Regexene som tolker PDF-en ligger samlet under kommentaren
  `Tolkning av kjoreruten` i `harmonisering.html`. Endrer Viatech oppsettet på
  kjøreruta, er det bare den blokka som må justeres.
- Appen leser `harmonisering-data.json` med `fetch`, som ikke virker når du
  åpner fila direkte fra disk. Lokalt må du kjøre en liten webserver
  (`python3 -m http.server`), ellers faller den tilbake på 2026-dataene som
  ligger innebygd.
