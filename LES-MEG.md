# Harmonisering – arbeidsskjema

Nettapp for harmoniseringsmålingene. `index.html` er selve appen og er
uendret fra år til år. `harmonisering-data.json` er årets kjørerute, og det
er den ene fila som byttes.

Appen virker offline etter første åpning, og kan legges til på hjem-skjermen
som en vanlig app.

## Filene i repoet

| Fil | Rolle |
|---|---|
| `index.html` | Appen. Årsnøytral. |
| `harmonisering-data.json` | Årets strekninger. Byttes hvert år. |
| `sw.js` | Offline-lagring og varsel om ny versjon. |
| `manifest.json`, `icon-*.png`, `apple-touch-icon.png` | Ikon og oppsett for hjem-skjermen. |
| Metodefil-PDF/ZIP, BoreSight-PDF | Vedlegg. Filnavnene står i JSON-en. |

## Sette det opp

1. Nytt, tomt, offentlig repo.
2. Legg inn filene over, sammen med årets metodefil og BoreSight-veiledning.
3. Settings → Pages → Source: Deploy from a branch, `main`, `/ (root)`.
4. Del adressen med sjåførene. De åpner den én gang med dekning og velger
   «Legg til på Hjem-skjerm».

Alt lastes med relative stier, så det virker uansett hva repoet heter.

## Ny kjørerute

1. Legg årets metodefil og BoreSight-PDF i repoet.
2. Åpne appen → **Oppsett → Les kjøreruten fra PDF** → velg arbeidsskjemaet.
3. Trykk **Hent koordinater fra NVDB**. Skjemaet har ingen koordinater, men
   vegreferansen holder – appen slår opp hver strekning på startmeteren.
   Har du GeoJSON-fila fra metodefilen, virker den også.
4. Kontroller tabellen. Røde felt mangler verdi.
5. **Lagre som nytt datasett.** År og versjon leses fra sidetoppen i PDF-en.
6. **Aktivt datasett → Last ned datasettet som JSON**, gi fila navnet
   `harmonisering-data.json` og legg den i repoet.

Punkt 6 er det som gjør at sjåførene får den. Til den er på plass, er det
bare din egen enhet som har det nye opplegget – og appen sier fra om det med
et gult kort i Oppsett.

Går PDF-tolkningen skeis: **Vis råtekst fra PDF → Kopier råteksten**, og be
om hjelp til å lage JSON-en. Den limes inn under **Bytt datasett**.

## Hvordan oppdateringer når fram

Appen viser den lagrede versjonen med en gang, og henter ny i bakgrunnen.
Er den endret, kommer en linje nederst: «Ny versjon … Oppdater». Datasettet
hentes alltid fra nett når det er dekning, med lagret kopi som reserve.

Endrer du `sw.js`, må `CACHE`-navnet øverst i fila endres (`harmonisering-v1`
→ `-v2`), ellers rydder ikke nettleseren den gamle lagringen.

## Før turen

**Oppsett → Offline-bruk → Gjør klar for felt** laster ned metodefilen og de
andre vedleggene, så de kan åpnes uten dekning. Selve appen lagres
automatisk. Gjøres på kontoret.

PDF-lesing av kjøreruten bruker pdf.js fra nett og virker ikke offline. NVDB-
og adresseoppslag krever også dekning. Alt annet – strekninger, kjøreplan,
GPS, registrering, logg, CSV og PDF-rapport – virker uten.

## Registreringer

Måleverdier og logg lagres i nettleseren under nøkkelen `harm_<id>`, der `id`
kommer fra datasettet. Årene ligger derfor side om side, og du mister ingenting
ved å bytte. **Nullstill** tømmer bare det aktive året. Dataene ligger lokalt
på hver enhet – sjåførene ser ikke hverandres tall, og eksport gjøres med
**Eksporter** (CSV) eller **PDF-rapport**.

## Feltene i JSON-en

Toppnivå:

| Felt | Betydning |
|---|---|
| `id` | Kort kode, styrer lagringsnøkkelen. Ny hvert år, f.eks. `frk2027`. |
| `aar` | Årstall. |
| `tittel` | Vises i topplinja, PDF-rapporten og fanetittelen. |
| `versjon` | Fritekst, vises under tittelen. Leses fra PDF-en. |
| `estKm` | Anslått kjørelengde, vises i kjøreplanen til GPS overtar. |
| `filer` | `metodefilPdf`, `metodefilZip`, `boresightPdf` – filnavn i repoet. |
| `parkering`, `base` | `navn` vises, `sok` er søkestrengen til Google Maps. |
| `routePoints` | Start- og sluttpunkt. GPS overskriver dem under kjøring. |
| `planOrder` | Rekkefølgen strekningene kjøres i, som indekser. |

Hver strekning:

| Felt | Betydning |
|---|---|
| `veg` | `Fv112`, `Ev6` … |
| `seg` | Vegsystemreferanse, f.eks. `S1D1`. |
| `meter` | Meterintervall, f.eks. `373–1373`. |
| `felt` | `F1`, `F6` … |
| `tittel` | Kort beskrivelse. |
| `farge` | Hex-farge. Utelates den, tildeles en automatisk. |
| `type` | Kalibrering, Snor, Lang, NY, Foto, Kontroll. |
| `metode` | Beregningsmetode i metodefila, `B` eller `S`. |
| `ukedag` | Settes bare når strekningen må kjøres en bestemt dag. |
| `lat`, `lon` | Startpunkt. Brukes av navigasjon og GPS-deteksjonen. |
| `kjoring` | Kjøreinstruksjon. |
| `rapport` | Rapportinstruksjon. |
| `filter` | ViaPPS Analyse-filter, f.eks. `m530–2230`. |
| `notat` | Advarsel, vises gult. |

`id` på strekningene settes av appen ut fra rekkefølgen i lista.

## Under panseret

Tolkningen av arbeidsskjemaet bygger på at hver strekning har en fast rad:

```
0  Fv112  S1D1  373-1373  F1  Ref strekn – 1000 meter
```

Raden står både i oversiktstabellen og på strekningens egen side, og de slås
sammen på strekningsnummeret. Endrer Viatech oppsettet, er det bare blokka
merket «Tolkning av arbeidsskjemaet» i `index.html` som må justeres.

NVDB-oppslaget bygger vegsystemreferansen `FV112S1D1M373` og henter punktet
fra `nvdbapiles.atlas.vegvesen.no`. Svaret kommer i UTM33 og konverteres
lokalt; konverteringen er kontrollert mot pyproj med under 2 mm avvik.

Appen må serveres over http/https. Åpner du `index.html` rett fra disk,
virker verken datasett-henting eller offline-lagring. Lokalt: `python3 -m
http.server` i mappa.
