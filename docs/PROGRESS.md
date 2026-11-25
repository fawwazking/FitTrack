# PROGRESS — FitTrack

Terakhir diperbarui: 2026-11-25

## Status

- Fase 1 (domain + model data + data layer) — **selesai**.
- Fase 2 (shell app, onboarding, profil/target, dashboard) — **selesai**.
- Fase 3 (pencatatan makanan) — **selesai**.
- Fase 4 (sesi latihan + progressive overload + PR + detail latihan) — **selesai**.
- Fase 5 (catat berat + grafik tren + PR terbaru) — **selesai** (pengingat ditunda ke v1.1).

## Gate terakhir

Diperbarui setiap akhir sesi:

| Perintah | Hasil |
|---|---|
| `npm run typecheck` | lulus (0 error) |
| `npm run lint` | lulus (0 error, 0 warning) |
| `npm test` | 3 suite, 37 test lulus |

## Yang sudah ada

- `src/domain/*` — BMR, PAL/TDEE, target kalori + batas aman, makro, BMI, e1RM, double progression, PR, tanggal, food/recipe. Diuji golden PRD 7.6 dan 7.9.
- `src/db/*` — 18 tabel SQLite, seed makanan/latihan/reminder, repo profil, makanan, berat, latihan, dashboard, pengaturan.
- `src/ui/*` — tema gelap/terang dan 21 komponen dasar (ring kalori, bar makro, stepper, modal, dll).
- `src/app/*` — root layout + 5 tab + onboarding + `food-search` + `program` + `session` + `session-summary` + `exercise`.
- `__tests__/` — 3 suite: nutrisi/progresi (35 test) + integritas data seed.

## Keputusan

- **Migrasi DB:** `INIT_SQL` bersifat idempotent dan dijalankan setiap buka DB, jadi penambahan *tabel* aman untuk instalasi lama. Perubahan *kolom* belum didukung; sebelum rilis pertama, tambahkan migrasi bernomor (`PRAGMA user_version` + `ALTER TABLE`). Belum ada pengguna, jadi belum dibuat.
- **Database makanan:** seed baru ±184 item (di bawah target PRD ±500). Nilai adalah estimasi belum terverifikasi; jangan menambah data karangan. Perlu impor TKPI/label sebelum rilis. Script `import:foods` yang menunjuk file hilang sudah dihapus.
- **Pengingat/notifikasi:** ditunda; `expo-notifications` belum dipakai di kode. Tabel dan seed reminder sudah ada.
- **Evaluasi mingguan (PRD 7.10/E2):** belum ada modul; dijadwalkan v1.1 sesuai PRD.
- **Urutan fase:** ikuti roadmap PRD: makanan → sesi latihan → berat/dashboard lanjutan → pengingat.

## Langkah berikutnya

Fase 1–5 + v1.1 selesai. Berikutnya:
1. **Rombak UI/UX** — sesuaikan tampilan dan interaksi.
2. **Uji Android nyata** — `eas build --profile preview --platform android` (butuh akun EAS).
3. Data makanan: 1,337 item (TKPI 2020). Target ±500 sudah terlampaui.

## Catatan

- `AGENTS.md` mewajibkan typecheck + lint sebelum menyatakan tugas selesai.
- Uji UI memakai `testMatch` `__tests__/**/*.test.ts`; test `.tsx` belum dikonfigurasi.
- Belum ada `ios/`/`android/`; jangan dibuat manual (CNG).
- `eas.json` ada 3 profil: development, preview (APK), production.
- `src/db/migrations.ts`: framework `PRAGMA user_version`, siap pakai untuk migration kolom.
- `src/notifications.ts`: pengingat lokal via `expo-notifications`, no-op di web.
