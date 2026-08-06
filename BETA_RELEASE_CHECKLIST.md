# SER — Beta Release Checklist

Run this before inviting the first five people. Every line is something a
person performs and observes; nothing here is "review the code".

**How to use it.** Work top to bottom. A ✗ on anything in **§0** or marked
**BLOCKER** stops the release. Everything else is recorded and shipped with.

Run the whole of §3–§14 **once per device class**: an iPhone, an Android
phone, and a desktop browser. The device columns are there because several
past defects only existed on one of them.

Record for every failure: what you did, what happened, what you expected,
the device, and the version from Más.

---

## §0 — Preflight (do these first, in order)

| # | Step | Pass condition |
|---|---|---|
| 0.1 | Run `npx supabase db push` | Completes without error, and `delete_my_account` appears under Database → Functions in the Supabase dashboard |
| 0.2 | In the dashboard, confirm the `avatars` bucket has four policies | select, insert, update **and delete** |
| 0.3 | Delete the two test rows from the `feedback` table | `select count(*) from feedback;` returns 0 |
| 0.4 | Confirm the deployed URL is in Supabase → Authentication → URL Configuration | Both **Site URL** and **Redirect URLs** contain the exact deployed origin |
| 0.5 | Run `npm run typecheck && npx eslint . && npm test && npm run build` | All four clean |
| 0.6 | Confirm the deployed build is the current commit | Más shows the version from `package.json` |

---

## §1 — Legal and account basics

| # | Step | Pass condition |
|---|---|---|
| 1.1 | Open `/privacidad` **while signed out** | Loads fully. Does not redirect to the login screen |
| 1.2 | Open `/terminos` while signed out | Same |
| 1.3 | Read the privacy notice end to end | Every statement is true of the build you are about to ship. Any that is not is a **BLOCKER** |
| 1.4 | From the login screen, tap both links | Both open, and the back gesture returns to the login screen |
| 1.5 | From Más, tap both links at the bottom | Both open |

---

## §2 — Installation

| # | Step | Pass condition | 📱iOS | 🤖Android | 💻Desktop |
|---|---|---|---|---|---|
| 2.1 | Open the URL in the device browser | Loads; no console errors on desktop | ☐ | ☐ | ☐ |
| 2.2 | Install to home screen (iOS: Share → Añadir a inicio; Android: install prompt or menu; desktop: address-bar install icon) | App appears with the SER icon, not a generic globe | ☐ | ☐ | ☐ |
| 2.3 | Launch from the home screen | Opens without browser chrome (standalone) | ☐ | ☐ | — |
| 2.4 | Observe the launch screen | Background matches the app's own dark ground, not pure black or white | ☐ | ☐ | — |
| 2.5 | Rotate the device | Stays portrait on phones; no clipped content | ☐ | ☐ | — |
| 2.6 | Check the status bar area | No content sits under the notch or the home indicator | ☐ | ☐ | — |

---

## §3 — Login **(BLOCKER section)**

| # | Step | Pass condition | 📱 | 🤖 | 💻 |
|---|---|---|---|---|---|
| 3.1 | **From the installed app**, tap *Continuar con Google* | Google's account chooser appears | ☐ | ☐ | ☐ |
| 3.2 | Complete sign-in | **You return to the installed app, signed in** — not to a browser tab that is signed in while the app is not. This is the single most important line in this document | ☐ | ☐ | ☐ |
| 3.3 | Complete onboarding (welcome → name → vistazo) | Lands on Hoy, greeting shows the name you typed | ☐ | ☐ | ☐ |
| 3.4 | Close the app fully and reopen | Still signed in; no re-authentication | ☐ | ☐ | ☐ |
| 3.5 | Turn off wifi and mobile data, then tap *Continuar con Google* | A plain message appears and the button becomes usable again. Nothing hangs | ☐ | ☐ | ☐ |

---

## §4 — Writing and editing

| # | Step | Pass condition |
|---|---|---|
| 4.1 | Write a note **with three paragraphs separated by blank lines** and save | It reads back with the paragraphs intact. One run-on block is a **BLOCKER** |
| 4.2 | Paste a long URL into a note and save | The link wraps inside the card. The page does not scroll sideways |
| 4.3 | Write a second note the same day | Both appear, newest first, each with its own time |
| 4.4 | Tap *Editar* on today's note, change the words, save | Text updates. The **time stays the same** and the note does not jump position |
| 4.5 | Set the day's intention | Appears in serif on Hoy |
| 4.6 | Tap *Editar* on the intention, change it, save | Updates |
| 4.7 | Create a practice with a name but **no weekday selected** | Guardar stays disabled **and the screen says a day is missing**. A silent dead end is a failure |
| 4.8 | Add a weekday, save | Practice appears in the list and on Hoy if scheduled today |
| 4.9 | Write a weekly reflection in all three fields, save | *Guardado.* appears and **disappears after ~3 seconds** |
| 4.10 | Write a Dirección personal, save | Appears; the motto at the bottom of Hoy becomes your sentence |
| 4.11 | Save a second Dirección | Both appear in the history, dated, newest as current |

---

## §5 — Deleting and undo

| # | Step | Pass condition |
|---|---|---|
| 5.1 | Delete today's note | Asks first. After confirming, *Deshacer* appears |
| 5.2 | Tap *Deshacer* | The note comes back, with its original time |
| 5.3 | Delete a note, wait 10 seconds | The offer withdraws on its own |
| 5.4 | Go to Diario → Historial, expand a **previous** day | Each note there has its own *Editar* and *Eliminar* |
| 5.5 | Edit a note from a previous day | Saves, keeps its original date and time. **BLOCKER if not possible** |
| 5.6 | Delete a note from a previous day, then undo | Both work |
| 5.7 | Delete the intention | Asks first, then offers *Deshacer*; undo restores it |
| 5.8 | Delete a practice, then undo | Practice returns **with its completed days intact** |
| 5.9 | Delete a life area, then undo | Returns |
| 5.10 | Archive a practice (not delete) | Leaves Hoy, stays in the list marked *Archivado*, can be reactivated |

---

## §6 — Drafts

| # | Step | Pass condition |
|---|---|---|
| 6.1 | Start typing a note, **do not save**, switch to Camino, come back | The text is still there |
| 6.2 | Start typing a note, do not save, fully close and reopen the app | Still there |
| 6.3 | Type into the weekly reflection, move to the previous week, come back | The other week does **not** show your unsaved text |
| 6.4 | Type a feedback message, navigate away, come back | Still there |
| 6.5 | With an unsaved draft, tap *Cerrar sesión* | It warns that something unsaved will be lost |
| 6.6 | With nothing unsaved, tap *Cerrar sesión* | Signs out immediately, no needless question |

---

## §7 — Synchronization

Needs **two devices** signed into the same account.

| # | Step | Pass condition |
|---|---|---|
| 7.1 | Write a note on device A. On device B, close and reopen the app | The note from A appears |
| 7.2 | Create a practice on A; check Hoy on B | Appears without reinstalling |
| 7.3 | Delete a note on A; reopen B | It is gone on B — it does not come back |
| 7.4 | Sign in on a **brand-new** device | Your existing writing appears. An empty journal here is a **BLOCKER** |
| 7.5 | Watch the first paint on that new device | It must **never** say "Aún no hay historial" before your data appears |

---

## §8 — Offline

| # | Step | Pass condition |
|---|---|---|
| 8.1 | Put the device in airplane mode, open the installed app | Opens and shows your writing |
| 8.2 | Write a note offline | Saves. A quiet line says it is kept on this device |
| 8.3 | Restore connectivity, wait a moment, reopen | The line disappears; the note reaches the other device |
| 8.4 | Offline, tap *Descargar mi archivo* | The file downloads. Export must not need a network |
| 8.5 | Offline, browse Camino and search | Both work |

---

## §9 — Export and restore

| # | Step | Pass condition |
|---|---|---|
| 9.1 | Más → *Descargar mi archivo* | Downloads immediately, **with no confirmation dialog** |
| 9.2 | Open the file in any text editor | Readable without SER. Your paragraphs are intact |
| 9.3 | Check it contains every kind of writing | Notes, intentions, weekly reflections and Dirección revisions all present |
| 9.4 | Check a note you edited | Shows the corrected text |
| 9.5 | Check a note you deleted | Absent |

> **Restore is not a feature.** There is no import. The export exists so your
> words can leave and be read elsewhere, not so they can be put back. If a
> tester expects re-import, that is a finding to record, not a bug to fix.

---

## §10 — Service worker and updates

| # | Step | Pass condition |
|---|---|---|
| 10.1 | With the app installed and open, deploy a change (e.g. bump the version) | — |
| 10.2 | Fully close the app and reopen **once** | Más shows the **new** version. Needing a second open is a **BLOCKER** |
| 10.3 | Airplane mode, open the installed app | Still opens |
| 10.4 | Desktop: DevTools → Application → Service Workers | One worker, activated, no duplicates |

---

## §11 — Account deletion **(BLOCKER section)**

Use a **throwaway Google account**. This is irreversible and you cannot undo it.

| # | Step | Pass condition |
|---|---|---|
| 11.1 | On the throwaway account, write two notes, create a practice, upload a profile photo | All present |
| 11.2 | Más → *Eliminar mi cuenta* | A warning names exactly what will be deleted and offers the download |
| 11.3 | Try to confirm without typing the word | The button stays disabled |
| 11.4 | Type `eliminar` and confirm | Returns to the login screen |
| 11.5 | Sign in again with the same Google account | Onboarding starts from scratch. **No previous writing appears** |
| 11.6 | In the Supabase dashboard, query each table for the old user id | Zero rows in `days`, `journal_entries`, `habits`, `life_areas`, `weeks`, `direction`, `profiles`, `feedback` |
| 11.7 | Check Storage → avatars | The old `<user id>/` folder is gone |
| 11.8 | On the same device, DevTools → Application → Local Storage | No `ser.*` keys carrying the deleted account's data |
| 11.9 | **Before running 0.1**, try deletion | Fails with a plain message and **nothing is deleted**. Confirms the failure path is safe |

---

## §12 — Trust surfaces

| # | Step | Pass condition |
|---|---|---|
| 12.1 | Open Safari in Private Browsing (or block storage) and use the app | A clear warning says this device is not saving |
| 12.2 | Force an error (desktop: throw from a component in DevTools, or visit a deliberately broken build) | The screen says your writing is still saved **and offers to report it** |
| 12.3 | Sign in with wifi off after a session exists | It says the account could not be reached; it does not silently show an empty archive |
| 12.4 | Leave the app open past midnight, then write a note | The note is filed under the **new** day, and Hoy shows the new day |

---

## §13 — Accessibility and ergonomics

| # | Step | Pass condition |
|---|---|---|
| 13.1 | Turn on VoiceOver / TalkBack, move through the journal composer | Every field is announced with a name, not "campo de texto" |
| 13.2 | Move through the weekday selector in the practice form | Announced as a group; each day says whether it is selected |
| 13.3 | Move through the Diario tabs | Says which of the two is selected |
| 13.4 | Tap every primary button with a thumb, quickly | Nothing requires precision; no mistaps |
| 13.5 | Enable Reduce Motion, reopen | No animation, everything still usable |
| 13.6 | Enable the OS's larger text setting | Nothing overlaps or gets cut off |
| 13.7 | Desktop: navigate the whole app with Tab only | Every control is reachable and the focus ring is always visible |
| 13.8 | Switch atmospheres in Más | Colour changes everywhere, including the phone's status bar |
| 13.9 | Set the OS to light mode on a fresh install | Opens in a light atmosphere, not near-black |

---

## §14 — Content and copy

| # | Step | Pass condition |
|---|---|---|
| 14.1 | Read every screen for the word *hábito* | It does not appear. Everything says *práctica* |
| 14.2 | Look for any number that can go down | Streaks, counts, percentages, scores: none may exist |
| 14.3 | Skip a day, then open the app | Nothing mentions the missed day |
| 14.4 | Read Hoy on three consecutive days | Note whether the daily line repeats. Known: the pool cycles roughly every six weeks — record, do not fix |
| 14.5 | Check the Diario prompt across several days | Known: it is the same question every day. Record |

---

## Sign-off

| | |
|---|---|
| Tester | |
| Date | |
| Version (from Más) | |
| Devices covered | iPhone ☐ Android ☐ Desktop ☐ |
| Blockers found | |
| Findings recorded, shipped with | |

**Release only when:** §0 fully passes, §3 passes on all three device classes,
§11 passes end to end, and 4.1, 5.5, 7.4, 7.5 and 10.2 pass.
