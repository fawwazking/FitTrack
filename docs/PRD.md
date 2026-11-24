# PRD FitCal Tracker

FitCal Tracker adalah aplikasi Android offline-first yang menggabungkan target kalori dan makro harian dengan pencatatan progressive overload di gym, dimulai sebagai aplikasi pribadi (single user).

## 1\. Ringkasan Produk dan Visi

**FitCal Tracker** membantu orang yang rutin berlatih gym menjawab dua pertanyaan setiap hari: "Berapa kalori dan makro yang harus saya makan?" dan "Berapa beban yang harus saya angkat hari ini?". Keduanya dijawab dalam satu aplikasi, dengan data yang saling terhubung.

**Visi:** menjadi asisten pribadi yang membuat progres tubuh terukur, dengan target nutrisi yang menyesuaikan diri dan saran beban latihan yang jelas.

**Proposisi nilai:**

* Target kalori dan makro otomatis dari profil, tujuan (bulking, cutting, recomp), dan frekuensi latihan, lalu dihitung ulang saat berat badan berubah.
* Database makanan Indonesia (nasi, tempe, ayam geprek, soto, dan sebagainya) dengan input cepat serta makanan custom.
* Pencatatan latihan dengan data sesi sebelumnya langsung terlihat, saran progressive overload, estimasi 1RM, dan penanda Personal Record (PR).
* Evaluasi mingguan yang membandingkan tren berat badan dengan target, lalu menyarankan penyesuaian kalori.

**Batasan awal:** satu pengguna (pribadi), Android (APK), bisa dipakai penuh tanpa internet, dan terbuka untuk dikembangkan ke publik setelah MVP terbukti berguna.

**Pembeda dari aplikasi sejenis:** aplikasi kalori (misalnya MyFitnessPal atau FatSecret) lemah di pelacakan beban latihan, sedangkan aplikasi gym (misalnya Strong atau Hevy) tidak mengatur kalori. FitCal Tracker menghubungkan keduanya, misalnya frekuensi latihan mingguan langsung memengaruhi TDEE, dan tren berat badan memengaruhi target kalori.

## 2\. Masalah yang Diselesaikan dan Target Pengguna

**Masalah utama:**

* Pelaku gym menghitung kalori di satu aplikasi dan mencatat beban di aplikasi lain (atau di catatan HP), sehingga tidak ada gambaran utuh antara asupan dan progres.
* Target kalori dari kalkulator umum sering tidak memperhitungkan frekuensi latihan dan tidak ikut berubah saat berat badan naik atau turun.
* Database makanan aplikasi global kurang lengkap untuk makanan Indonesia, sehingga input makanan lambat dan hasilnya tidak akurat.
* Saat mencatat set di gym, pengguna lupa beban dan repetisi sesi sebelumnya, sehingga kenaikan beban jadi tebakan.
* Pengguna tidak tahu kapan harus menaikkan atau menurunkan kalori ketika berat badan stagnan.

**Persona**

||Persona 1: Rizky (pemilik, bulking)|Persona 2: Dinda (pemula cutting)|Persona 3: Bayu (intermediate recomp)|
|-|-|-|-|
|Profil|Pria 25 th, 70 kg, 170 cm, karyawan kantoran|Wanita 28 th, 62 kg, 160 cm, baru 6 bulan ke gym|Pria 32 th, 78 kg, 175 cm, latihan 5 th, kerja shift|
|Latihan|4x/minggu, Upper/Lower|3x/minggu, Full Body|5x/minggu, Push/Pull/Legs|
|Tujuan|Naik 0,2 kg/minggu tanpa lemak berlebih|Turun 0,5 kg/minggu dengan massa otot terjaga|Berat badan stabil, lingkar pinggang turun|
|Frustrasi|Beban stagnan, tidak tahu kapan naik, lupa angka sesi lalu|Bingung angka kalori dan protein, takut makan terlalu sedikit|Progres lambat, sulit melihat tren di antara fluktuasi harian|
|Kebutuhan utama|Target kalori surplus dan saran progressive overload|Panduan sederhana, batas aman defisit, makanan Indonesia|Grafik tren berat dan volume, evaluasi mingguan|
|Perilaku|Mencatat di gym dengan satu tangan, sering tanpa sinyal|Mencatat makanan 3-4x sehari lewat HP|Jadwal tidak tetap, butuh pengingat fleksibel|

Rizky adalah persona utama untuk MVP. Dinda dan Bayu menjadi acuan saat produk dibuka untuk publik.

## 3\. Tujuan dan Metrik Keberhasilan (KPI)

**Tujuan produk:** (1) pengguna mencatat makanan dan latihan secara konsisten, (2) target nutrisi akurat dan aman, (3) pengguna melihat progres beban dan berat badan yang terukur. Karena tahap awal adalah pengguna pribadi, target KPI di bawah dibaca sebagai target kebiasaan pemilik. Untuk tahap publik, angka yang sama diukur dari kohort pengguna.

|KPI|Definisi|Target MVP (90 hari)|Cara ukur|
|-|-|-|-|
|Konsistensi pencatatan makanan|Hari dengan minimal 3 waktu makan tercatat / total hari|≥ 80%|Query lokal|
|Kepatuhan kalori|Hari dengan asupan dalam ±10% target / hari tercatat|≥ 60%|Query lokal|
|Konsistensi latihan|Sesi terselesaikan / sesi terjadwal per minggu|≥ 85%|Query lokal|
|Kecepatan pencatatan makanan|Waktu dari buka aplikasi sampai satu makanan tersimpan|≤ 20 detik (makanan yang pernah dicatat)|Uji manual|
|Kecepatan pencatatan set|Waktu mencatat satu set (beban dan repetisi)|≤ 5 detik|Uji manual|
|Progres beban|Latihan utama dengan e1RM naik dalam 8 minggu|≥ 60% dari latihan utama|Query lokal|
|Kesesuaian tren berat|Laju perubahan berat 2 minggu terakhir dalam rentang target|≥ 70% minggu|Evaluasi mingguan|
|Retensi (publik)|Pengguna aktif di hari ke-30|≥ 30%|Analytics anonim (v2.0)|
|Stabilitas|Crash-free sessions|≥ 99,5%|Crash reporter|
|Akurasi database makanan|Makanan Indonesia populer yang tersedia (100 item uji)|≥ 90% ditemukan|Uji pencarian|

**Metrik pengawal (guardrail):** tidak ada rekomendasi di bawah batas kalori aman, dan tidak ada peringatan medis yang diabaikan tanpa konfirmasi eksplisit pengguna.

## 4\. User Stories dan Acceptance Criteria

Format: *Sebagai \[pengguna], saya ingin \[aksi], agar \[manfaat].* AC = acceptance criteria.

### A. Profil dan Onboarding

**A1.** Sebagai pengguna baru, saya ingin mengisi profil (umur, jenis kelamin, tinggi, berat, frekuensi latihan, level aktivitas), agar target dihitung sesuai kondisi saya.

* AC: Umur 18-80 tahun, tinggi 120-230 cm, berat 30-250 kg, frekuensi latihan 0-7. Nilai di luar rentang ditolak dengan pesan jelas.
* AC: Tombol "Lanjut" nonaktif sampai semua kolom wajib valid.
* AC: Profil tersimpan lokal dan bisa diubah dari layar Profil; perubahan berat atau frekuensi memicu perhitungan ulang.

**A2.** Sebagai pengguna, saya ingin memilih tujuan (bulking, cutting, recomp) dan kecepatan (pelan, sedang, agresif), agar target sesuai ambisi saya.

* AC: Setiap kecepatan menampilkan estimasi kalori per hari dan estimasi perubahan berat per minggu sebelum dikonfirmasi.
* AC: Kecepatan di luar batas aman tidak bisa dipilih; alasannya ditampilkan (lihat bagian 7).
* AC: Pengguna dengan BMI < 18,5 tidak bisa memilih cutting; pengguna dengan BMI ≥ 30 mendapat catatan bahwa bulking tidak disarankan.

### B. Kalkulator Kalori dan Makro

**B1.** Sebagai pengguna, saya ingin target kalori dan makro dihitung otomatis, agar tidak menghitung manual.

* AC: BMR memakai Mifflin-St Jeor, TDEE memakai pengali dari frekuensi latihan dan level aktivitas harian.
* AC: Hasil menampilkan rincian BMR, TDEE, penyesuaian tujuan, kalori target, protein, karbohidrat, dan lemak dalam gram dan persen.
* AC: Setiap angka punya tombol "Kenapa angka ini?" yang menjelaskan rumusnya dalam bahasa sederhana.

**B2.** Sebagai pengguna, saya ingin target dihitung ulang saat berat atau tujuan berubah, agar tetap relevan.

* AC: Perubahan berat ≥ 1 kg dari berat saat target terakhir dihitung memicu notifikasi "Hitung ulang target?".
* AC: Perubahan tujuan atau frekuensi latihan menghitung ulang seketika; target lama tetap tersimpan di riwayat.
* AC: Pengguna bisa mengganti target secara manual (override), dan penanda "manual" muncul di dashboard.

### C. Tracker Kalori Harian

**C1.** Sebagai pengguna, saya ingin mencatat makanan per waktu makan, agar asupan harian terlihat.

* AC: Empat waktu makan: sarapan, makan siang, makan malam, camilan; makanan bisa ditambah, diubah porsinya, dan dihapus.
* AC: Pencarian makanan memberi hasil dalam ≤ 300 ms dan mendukung ketikan sebagian ("ayam gor" menemukan "Ayam goreng").
* AC: Makanan yang sering dan terakhir dicatat muncul di atas sebelum pengguna mengetik.

**C2.** Sebagai pengguna, saya ingin menambah makanan custom, agar menu rumahan bisa dicatat.

* AC: Kolom wajib: nama, ukuran porsi dan satuan, kalori, protein, karbohidrat, lemak. Kalori diperingatkan jika selisih > 15% dari 4P + 4K + 9L.
* AC: Makanan custom muncul di pencarian dengan label "Saya" dan bisa dibuat dari kombinasi beberapa makanan (resep sederhana).

**C3.** Sebagai pengguna, saya ingin melihat sisa kalori dan makro hari ini, agar bisa memutuskan makan berikutnya.

* AC: Ring atau progress bar untuk kalori, protein, karbohidrat, lemak; warna berubah saat melebihi target.
* AC: Layar utama diperbarui dalam ≤ 1 detik setelah makanan ditambah.

**C4.** Sebagai pengguna, saya ingin melihat riwayat, agar bisa mengevaluasi pola makan.

* AC: Tampilan harian, mingguan (rata-rata dan kepatuhan), dan bulanan (kalender dengan indikator kepatuhan).
* AC: Hari yang belum lengkap dicatat ditandai terpisah dan tidak dihitung sebagai defisit.

### D. Program Latihan dan Progressive Overload

**D1.** Sebagai pengguna, saya ingin membuat dan menyimpan program latihan, agar jadwal saya terstruktur.

* AC: Template Push/Pull/Legs, Upper/Lower, dan Full Body; template yang dipilih disesuaikan dengan frekuensi latihan (lihat bagian 7).
* AC: Setiap hari latihan berisi daftar latihan, target set, dan rentang repetisi; semua bisa diubah dan program bisa diduplikasi.

**D2.** Sebagai pengguna, saya ingin mencatat sesi (set, repetisi, beban, RPE), agar semua data latihan tersimpan.

* AC: Satu set tercatat dalam ≤ 3 ketukan; beban dan repetisi terisi awal dari sesi sebelumnya.
* AC: Kolom RPE bersifat opsional (skala 6-10, kelipatan 0,5).
* AC: Pencatatan sesi berjalan tanpa internet, dan sesi yang terputus bisa dilanjutkan setelah aplikasi ditutup.
* AC: Pengatur waktu istirahat (default 90 detik, bisa diubah) tersedia di layar sesi.

**D3.** Sebagai pengguna, saya ingin melihat data sesi sebelumnya dan saran beban, agar tahu target hari ini.

* AC: Di bawah setiap latihan tampil "Terakhir: 80 kg × 8, 8, 7" dan saran "Hari ini: 82,5 kg × 8" berikut alasannya.
* AC: Saran mengikuti aturan double progression di bagian 7 dan bisa diabaikan tanpa efek apa pun.

**D4.** Sebagai pengguna, saya ingin estimasi 1RM dan penanda PR, agar pencapaian terlihat.

* AC: e1RM dihitung dengan rumus Epley untuk set dengan repetisi 1-12 dan ditampilkan per latihan.
* AC: PR terdeteksi seketika saat set disimpan (PR beban, PR repetisi, PR e1RM, PR volume) dan memunculkan lencana dan catatan di riwayat.
* AC: Set pemanasan (ditandai) tidak dihitung ke PR.

**D5.** Sebagai pengguna, saya ingin grafik progres latihan, agar tren terlihat.

* AC: Grafik e1RM dan beban teratas per latihan, total volume mingguan (set × repetisi × beban), dan konsistensi latihan (kalender atau garis waktu).
* AC: Rentang waktu 4 minggu, 12 minggu, dan semua data.

### E. Progress Tubuh

**E1.** Sebagai pengguna, saya ingin mencatat berat badan berkala, agar tren terlihat.

* AC: Satu entri berat per hari (entri ulang menimpa dengan konfirmasi); lingkar tubuh dan foto bersifat opsional.
* AC: Grafik menampilkan titik harian dan rata-rata bergerak 7 hari; foto progres disimpan lokal dan bisa dibandingkan berdampingan.

**E2.** Sebagai pengguna, saya ingin evaluasi mingguan, agar tahu apakah kalori perlu diubah.

* AC: Evaluasi dibuat setiap minggu (hari bisa dipilih) bila ada ≥ 4 entri berat dan ≥ 4 hari makanan tercatat; kalau tidak, aplikasi meminta data tambahan.
* AC: Saran penyesuaian kalori mengikuti aturan bagian 7; pengguna bisa menerima (target diperbarui) atau menolak.

### F. Dashboard dan Pengingat

**F1.** Sebagai pengguna, saya ingin dashboard harian, agar semua informasi penting ada di satu layar.

* AC: Dashboard menampilkan ring kalori dan makro, latihan hari ini (nama sesi atau "hari istirahat"), PR terbaru (7 hari terakhir), dan berat terakhir.

**F2.** Sebagai pengguna, saya ingin pengingat, agar tidak lupa mencatat.

* AC: Pengingat makan (per waktu makan), latihan (per hari terjadwal), dan timbang badan (hari dan jam bebas); masing-masing bisa dimatikan.
* AC: Pengingat tetap berbunyi setelah HP restart dan mengikuti pembatasan baterai Android; pengguna dijelaskan cara memberi izin notifikasi dan alarm tepat waktu.

## 5\. Prioritas Fitur (MoSCoW)

Prinsip pemisahan: MVP harus bisa dipakai penuh setiap hari untuk satu pengguna (hitung target, catat makanan, catat latihan, lihat berat). Fitur yang butuh data historis atau database besar menyusul.

|Fitur|Prioritas|Rilis|Alasan|
|-|-|-|-|
|Onboarding dan profil (A1, A2)|Must|MVP|Dasar semua perhitungan|
|Kalkulator BMR, TDEE, kalori, makro (B1)|Must|MVP|Inti nilai produk|
|Hitung ulang target otomatis (B2)|Must|MVP|Syarat target tetap akurat|
|Catat makanan per waktu makan (C1)|Must|MVP|Kebiasaan harian utama|
|Database makanan Indonesia (±500 item awal)|Must|MVP|Tanpa ini pencatatan lambat|
|Makanan custom (C2)|Must|MVP|Menutup kekurangan database|
|Ring sisa kalori dan makro (C3)|Must|MVP|Umpan balik harian|
|Riwayat harian (C4)|Must|MVP|Sebagian dari C4|
|Buat program dan template latihan (D1)|Must|MVP|Dasar pencatatan sesi|
|Catat sesi dan tampil data sesi lalu (D2, D3)|Must|MVP|Inti tracker gym|
|Saran progressive overload (D3)|Must|MVP|Pembeda utama produk|
|e1RM dan penanda PR (D4)|Must|MVP|Motivasi, perhitungan ringan|
|Catat berat dan grafik tren (E1)|Must|MVP|Dibutuhkan evaluasi mingguan|
|Dashboard harian (F1)|Must|MVP|Titik masuk aplikasi|
|Pengingat makan, latihan, timbang (F2)|Should|MVP|Meningkatkan konsistensi; bisa dipotong bila waktu mepet|
|Riwayat mingguan dan bulanan (C4)|Should|v1.1|Butuh data beberapa minggu|
|Evaluasi mingguan dan saran kalori (E2)|Should|v1.1|Butuh ≥ 2 minggu data|
|Grafik progres beban, volume, konsistensi (D5)|Should|v1.1|Data sesi harus terkumpul dulu|
|Pengatur waktu istirahat|Should|v1.1|Kenyamanan di gym|
|Lingkar tubuh dan foto progres (E1)|Could|v1.1|Opsional bagi pengguna|
|Pindai barcode makanan kemasan|Could|v2.0|Perlu database produk dan kamera|
|Ekspor dan impor data (CSV)|Could|v1.1|Pencadangan manual|
|Cadangan cloud dan sinkronisasi antar perangkat|Could|v2.0|Syarat membuka ke publik|
|Akun, login, multi-pengguna|Could|v2.0|Tidak perlu untuk pengguna pribadi|
|Integrasi wearable (Health Connect)|Could|v2.0|Langkah harian dan berat otomatis|
|Rekomendasi program latihan adaptif|Could|v2.0|Perlu aturan lebih matang|
|Fitur sosial, komunitas, papan peringkat|Won't|Setelah v2.0|Di luar fokus|
|Langganan berbayar|Won't|Setelah v2.0|Menunggu keputusan publikasi|
|Pengenalan makanan dari foto (AI)|Won't|Setelah v2.0|Akurasi dan biaya tinggi|

**Aturan pemotongan lingkup:** bila jadwal MVP terlambat, potong dari bawah: pengingat dulu, lalu riwayat bulanan. Kalkulator, pencatatan makanan, dan pencatatan sesi tidak dipotong.

## 6\. Alur Pengguna (User Flow)

Setiap alur ditulis sebagai langkah berurutan; percabangan ditandai dengan "Jika".

### Alur A: Onboarding

1. Buka aplikasi pertama kali, lihat layar sambutan singkat dan penjelasan disclaimer, lalu setuju.
2. Isi data diri: jenis kelamin, umur, tinggi, berat.
3. Pilih frekuensi latihan (0-7x/minggu) dan level aktivitas harian.
4. Pilih tujuan: bulking, cutting, atau recomp. Jika BMI di luar batas yang aman untuk tujuan itu, tampil peringatan dan opsi tujuan lain.
5. Pilih kecepatan (pelan, sedang, agresif); tiap opsi menampilkan kalori dan estimasi perubahan berat per minggu.
6. Lihat ringkasan target (kalori, protein, karbohidrat, lemak) dan penjelasan singkat.
7. Konfirmasi, atur pengingat (opsional), masuk ke dashboard.

### Alur B: Hitung ulang target

1. Pengguna mencatat berat baru, atau mengubah tujuan atau frekuensi latihan.
2. Sistem mengecek: apakah berat berubah ≥ 1 kg dari acuan terakhir, atau tujuan atau frekuensi berubah?
3. Jika ya, tampil kartu "Target baru tersedia" dengan perbandingan target lama dan baru.
4. Pengguna menerima atau menolak. Jika menerima, target baru berlaku mulai hari itu dan riwayat target lama disimpan.

### Alur C: Catat makanan

1. Dari dashboard, ketuk waktu makan (atau tombol "+").
2. Lihat daftar "Sering dan terakhir"; ketik untuk mencari.
3. Jika makanan ditemukan, pilih dan atur porsi, lalu simpan. Jika tidak ditemukan, pilih "Buat makanan baru", isi nilai gizi, lalu simpan dan otomatis dipilih.
4. Dashboard menampilkan sisa kalori dan makro terbaru.
5. Opsional: salin seluruh waktu makan dari hari lain.

### Alur D: Latihan

1. Buka tab Latihan, lihat sesi terjadwal hari ini (atau pilih sesi lain, atau mulai sesi kosong).
2. Ketuk "Mulai sesi"; daftar latihan tampil dengan data sesi lalu dan saran beban.
3. Untuk tiap set: sesuaikan beban dan repetisi (terisi awal), isi RPE jika perlu, ketuk "Selesai set"; pengatur waktu istirahat berjalan.
4. Jika set mencetak PR, tampil lencana PR seketika.
5. Setelah semua latihan, ketuk "Selesai sesi"; ringkasan menampilkan total volume, PR, dan durasi.
6. Jika sesi terputus (aplikasi tertutup), saat dibuka lagi muncul opsi melanjutkan sesi.

### Alur E: Progres tubuh dan evaluasi mingguan

1. Pengguna mencatat berat (ideal pagi hari, kondisi sama).
2. Grafik tren menampilkan titik harian dan garis rata-rata 7 hari.
3. Pada hari evaluasi: sistem membandingkan laju perubahan rata-rata berat dengan target.
4. Jika data kurang (kurang dari 4 entri berat atau 4 hari makanan), tampil permintaan melengkapi data. Jika cukup dan laju sesuai, tampil "Sesuai target". Jika menyimpang dua minggu berturut-turut, tampil saran ±150 kcal.
5. Pengguna menerima atau menolak saran; keputusan dicatat.

### Alur F: Pengingat

1. Pengguna membuka Pengaturan, Pengingat.
2. Aktifkan pengingat per jenis (makan, latihan, timbang) dan atur jam serta hari.
3. Jika izin notifikasi belum diberikan, aplikasi meminta izin dan menjelaskan manfaatnya.
4. Saat pengingat berbunyi, ketuk notifikasi untuk langsung masuk ke layar terkait (tambah makanan, mulai sesi, input berat).

## 7\. Spesifikasi Fungsional Rinci

Satuan: kg, cm, kcal, gram. Semua hasil dibulatkan ke bilangan bulat terdekat saat ditampilkan; perhitungan internal memakai desimal penuh.

### 7.1 BMR (Mifflin-St Jeor)

```latex
BMR\_{pria} = 10 \\cdot BB + 6{,}25 \\cdot TB - 5 \\cdot U + 5
```

```latex
BMR\_{wanita} = 10 \\cdot BB + 6{,}25 \\cdot TB - 5 \\cdot U - 161
```

BB = berat badan (kg), TB = tinggi (cm), U = umur (tahun). Aplikasi ini hanya mendukung usia ≥ 18 tahun.

### 7.2 TDEE dan pengali aktivitas

Pengali (PAL) = nilai dari frekuensi latihan + tambahan level aktivitas harian. Nilai frekuensi mengikuti skala umum (1,2 sampai 1,725) dengan interpolasi per sesi agar setiap pilihan 0-7 punya nilai sendiri.

```latex
TDEE = BMR \\times (PAL\_{frekuensi} + PAL\_{harian})
```

|Latihan per minggu|0|1|2|3|4|5|6|7|
|-|-|-|-|-|-|-|-|-|
|PAL frekuensi|1,20|1,30|1,375|1,46|1,55|1,64|1,725|1,80|

|Level aktivitas harian|Contoh|Tambahan PAL|
|-|-|-|
|Rendah|Kerja kantoran, banyak duduk|+0,00|
|Sedang|Sering berdiri atau berjalan (guru, retail)|+0,05|
|Tinggi|Pekerjaan fisik (kurir, bangunan)|+0,10|

PAL total dibatasi maksimum 1,90 agar TDEE tidak berlebihan.

### 7.3 Target kalori menurut tujuan dan kecepatan

```latex
Kalori\_{target} = TDEE \\times (1 + penyesuaian)
```

|Tujuan|Pelan|Sedang (default)|Agresif|Batas keras|
|-|-|-|-|-|
|Bulking|+5%|+10%|+15%|Surplus maks. +20% atau +500 kcal, mana yang lebih kecil|
|Cutting|−10%|−15%|−20%|Defisit maks. −25%; kalori tidak boleh di bawah 1.500 (pria) atau 1.200 (wanita) dan tidak di bawah 1,0 × BMR|
|Recomp|0%|−5%|−10%|Defisit maks. −10%|

Estimasi perubahan berat per minggu ditampilkan sebagai kalori per hari × 7 ÷ 7.700 (1 kg massa tubuh ≈ 7.700 kcal). Ini hanya perkiraan kasar; evaluasi mingguan (7.9) memakai data nyata.

Pembatasan tambahan: kecepatan cutting agresif dinonaktifkan jika estimasi penurunan > 1% berat badan per minggu; BMI < 18,5 tidak boleh cutting; BMI ≥ 30 mendapat peringatan saat bulking; jika kalori hasil hitung melanggar batas bawah, kalori dinaikkan ke batas bawah dan pengguna diberi tahu alasannya.

### 7.4 Target makro

Kalori protein dan karbohidrat 4 kcal/g, lemak 9 kcal/g. Urutan hitung: protein (g/kg), lemak (persen kalori dengan batas bawah), karbohidrat = sisa.

|Tujuan|Protein default (rentang)|Lemak default (rentang)|Karbohidrat|
|-|-|-|-|
|Bulking|1,8 g/kg (1,6-2,2)|25% kalori (20-35%)|Sisa kalori|
|Cutting|2,2 g/kg (2,0-2,6)|25% kalori (20-35%)|Sisa kalori|
|Recomp|2,0 g/kg (1,8-2,4)|25% kalori (20-35%)|Sisa kalori|

**Logika:**

* *Protein:* asupan sekitar 1,6 g/kg ke atas umumnya dianggap cukup untuk membangun otot; saat defisit kalori, protein dinaikkan untuk membantu menjaga massa otot. Rentang ini merujuk konsensus umum literatur nutrisi olahraga (misalnya posisi ISSN dan meta-analisis Morton dkk. 2018) dan perlu ditinjau ahli gizi sebelum rilis publik.
* *Lemak:* minimal 20% kalori dan tidak kurang dari 0,6 g/kg untuk fungsi hormon dan penyerapan vitamin larut lemak. Pengguna boleh mengubah di rentang 20-35%.
* *Karbohidrat:* bahan bakar latihan; mengisi sisa kalori. Jika karbohidrat hasil hitung < 2 g/kg, lemak diturunkan ke batas bawah 20% dan dihitung ulang; jika masih < 2 g/kg, tampil peringatan.
* Pengguna dapat menggeser protein dalam rentang yang disarankan; di luar rentang, tampil peringatan; protein tidak boleh > 3,0 g/kg.
* Opsional: target serat 14 g per 1.000 kcal sebagai informasi (tanpa pembatasan).

### 7.5 Pemicu hitung ulang

* Berat badan berubah ≥ 1 kg dari berat acuan target terakhir (berat acuan = berat saat target terakhir diterima).
* Tujuan, kecepatan, frekuensi latihan, atau level aktivitas berubah.
* Evaluasi mingguan menyetujui penyesuaian kalori (7.9).

Setiap hitung ulang menyimpan satu catatan target (tanggal, nilai, alasan). Pengguna bisa menolak; penolakan tidak memunculkan notifikasi yang sama selama 7 hari, kecuali berat berubah ≥ 2 kg.

### 7.6 Contoh perhitungan: pria 25 tahun, 70 kg, 170 cm, latihan 4x/minggu, bulking

Asumsi: kerja kantoran (aktivitas harian rendah), kecepatan sedang.

|Langkah|Perhitungan|Hasil|
|-|-|-|
|BMR|10 × 70 + 6,25 × 170 − 5 × 25 + 5 = 700 + 1.062,5 − 125 + 5|1.642,5 kcal|
|PAL|1,55 (4x/minggu) + 0,00 (rendah)|1,55|
|TDEE|1.642,5 × 1,55|2.546 kcal|
|Kalori target (bulking sedang)|2.546 × 1,10 (+255 kcal)|2.801 kcal|
|Estimasi kenaikan berat|255 × 7 ÷ 7.700|≈ 0,23 kg/minggu (≈ 0,33% BB)|
|Protein|1,8 × 70 = 126 g (504 kcal)|126 g|
|Lemak|25% × 2.801 = 700 kcal ÷ 9|≈ 78 g|
|Karbohidrat|(2.801 − 504 − 702) ÷ 4|≈ 399 g (5,7 g/kg)|

Selisih pembulatan sekitar 1 kcal tidak dipermasalahkan. Pembanding untuk orang yang sama bila memilih cutting kecepatan sedang (−15%): kalori 2.164 kcal, protein 2,2 × 70 = 154 g, lemak 25% ≈ 60 g, karbohidrat ≈ 252 g (estimasi penurunan ≈ 0,35 kg/minggu atau 0,5% BB).

### 7.7 Program latihan berdasarkan frekuensi

Aplikasi menyarankan template yang cocok; pengguna bebas mengganti.

|Frekuensi|Template yang disarankan|Susunan hari|
|-|-|-|
|0|Tidak ada program|Tampil saran memulai 2-3x/minggu|
|1|Full Body|Full Body|
|2|Full Body A/B|A, B|
|3|Full Body A/B/A (minggu berikut B/A/B) atau Push/Pull/Legs sekali|A, B, A|
|4|Upper/Lower|Upper, Lower, Upper, Lower|
|5|Upper/Lower + PPL|Upper, Lower, Push, Pull, Legs|
|6|Push/Pull/Legs dua putaran|Push, Pull, Legs, Push, Pull, Legs|
|7|PPL dua putaran + 1 hari aktif ringan|Aplikasi menyarankan minimal 1 hari istirahat penuh per minggu|

Default per sesi: 4-6 latihan, latihan majemuk 3-4 set di rentang 6-10 repetisi, latihan isolasi 2-3 set di rentang 10-15 repetisi; istirahat 90 detik (isolasi) hingga 180 detik (majemuk). Semua angka ini bisa diubah.

### 7.8 Progressive overload (double progression)

Setiap latihan menyimpan rentang repetisi (mis. 6-10) dan kenaikan beban default: barbel tubuh atas 2,5 kg, barbel tubuh bawah 5 kg, dumbel 2 kg per tangan, mesin atau kabel satu pelat (default 2,5 kg). Hanya set kerja yang dihitung (set pemanasan ditandai dan diabaikan).

|Kondisi sesi terakhir|Saran sesi berikutnya|
|-|-|
|Semua set kerja mencapai batas atas rentang dan RPE ≤ 9 (atau RPE kosong)|Naikkan beban sebesar kenaikan default; target repetisi kembali ke batas bawah|
|Semua set ≥ batas bawah, sebagian < batas atas|Beban tetap; target +1 repetisi pada set yang belum mencapai batas atas|
|Ada set < batas bawah (sekali)|Beban tetap|
|Ada set < batas bawah dua sesi berturut-turut|Turunkan beban 5-10% (dibulatkan ke kenaikan terdekat)|
|Ada set dengan RPE 10|Jangan naikkan beban|
|e1RM tidak naik dalam 3 sesi berturut-turut|Sarankan deload 10% atau ganti variasi latihan|
|Tidak latihan ini ≥ 14 hari|Mulai dari 90% beban terakhir|

Saran bersifat usulan: pengguna dapat mengabaikannya, dan beban yang dicatat tidak dibatasi oleh saran.

### 7.9 e1RM dan Personal Record

```latex
e1RM = w \\times \\left(1 + \\frac{r}{30}\\right)
```

w = beban (kg), r = repetisi. Untuk r = 1 hasilnya sama dengan w. Rumus Epley dipakai untuk r = 1-12; r > 12 tidak dihitung e1RM (akurasi turun) dan ditandai "tidak diestimasi". Contoh: 80 kg × 8 repetisi → 80 × (1 + 8/30) ≈ 101,3 kg.

Jenis PR (hanya dari set kerja, per latihan):

* *PR beban:* beban terberat yang pernah diangkat untuk ≥ 1 repetisi.
* *PR repetisi:* repetisi terbanyak pada suatu beban (atau lebih berat) dibanding semua catatan sebelumnya.
* *PR e1RM:* e1RM tertinggi.
* *PR volume sesi:* total beban × repetisi terbesar untuk latihan itu dalam satu sesi.

Sama dengan catatan lama tidak dihitung PR. Jika catatan lama diedit atau dihapus, PR dihitung ulang dari seluruh riwayat.

**Volume mingguan** = jumlah (beban × repetisi) seluruh set kerja dalam satu minggu kalender (Senin-Minggu, bisa diubah). **Konsistensi** = sesi selesai ÷ sesi terjadwal.

### 7.10 Evaluasi mingguan dan penyesuaian kalori

Tren berat = rata-rata bergerak 7 hari. Laju mingguan = (rata-rata 7 hari terakhir − rata-rata 7 hari sebelumnya) ÷ rata-rata sebelumnya.

|Tujuan|Laju wajar|Jika di luar rentang 2 minggu berturut-turut|
|-|-|-|
|Bulking|+0,15% sampai +0,5% BB/minggu|< 0,15%: tambah 150 kcal. > 0,5%: kurangi 150 kcal|
|Cutting|−0,25% sampai −1,0% BB/minggu|Penurunan < 0,25%: kurangi 150 kcal atau sarankan tambah aktivitas. Penurunan > 1,0%: tambah 150 kcal|
|Recomp|±0,25% BB/minggu|Naik > 0,25%: kurangi 100 kcal. Turun > 0,25%: tambah 100 kcal. Lingkar pinggang turut ditampilkan bila ada|

**Syarat saran:** ≥ 4 entri berat dan ≥ 4 hari makanan tercatat dalam minggu itu, dan kepatuhan kalori ≥ 70% hari tercatat. Jika kepatuhan rendah, saran yang muncul adalah "perbaiki kepatuhan dulu", bukan perubahan kalori. Maksimal satu penyesuaian per 14 hari, dan hasilnya tetap tunduk pada batas keras di 7.3. Penyesuaian kalori dialokasikan ke karbohidrat; protein dan lemak tetap.

### 7.11 Aturan bisnis lain

* **Hari dan zona waktu:** hari dimulai pukul 00:00 zona waktu perangkat; makanan dan sesi dikaitkan ke tanggal lokal.
* **Database makanan:** nilai gizi disimpan per 100 g dan per porsi umum (misalnya 1 piring nasi, 1 potong tempe). Acuan awal: Tabel Komposisi Pangan Indonesia (TKPI) Kemenkes dan label kemasan; status lisensi dan akurasi diverifikasi sebelum rilis. Setiap entri punya sumber dan penanda "bawaan" atau "buatan pengguna".
* **Kalori makanan:** jika kalori dan makro tidak konsisten (selisih > 15% dari 4P + 4K + 9L), pengguna diberi peringatan tetapi tetap boleh menyimpan.
* **Satu target per hari:** MVP memakai satu target harian tetap (tanpa pembedaan hari latihan dan hari istirahat); *carb cycling* ditunda ke v2.0.
* **Kondisi khusus:** hamil, menyusui, riwayat gangguan makan, atau kondisi medis tertentu tidak didukung; saat onboarding, pengguna menyatakan tidak memiliki kondisi tersebut, atau disarankan berkonsultasi dengan tenaga profesional.
* **Data tidak lengkap:** hari yang tidak dicatat tidak dihitung sebagai 0 kcal dan tidak dihitung dalam rata-rata kepatuhan.

## 8\. Kebutuhan Non-Fungsional

|Area|Kebutuhan|Target terukur|
|-|-|-|
|Performa|Aplikasi cepat di perangkat kelas menengah (RAM 4 GB)|Cold start ≤ 2 detik; pencarian makanan ≤ 300 ms; simpan satu set ≤ 100 ms; grafik 12 minggu tampil ≤ 1 detik|
|Ukuran dan sumber daya|Ringan dan hemat baterai|APK ≤ 60 MB (termasuk database makanan ±10 MB); tanpa proses latar belakang berat, pengingat memakai alarm sistem|
|Offline-first|Seluruh fitur MVP berfungsi tanpa internet; database lokal menjadi sumber kebenaran|100% alur A-F berjalan mode pesawat; tidak ada layar yang memblokir karena koneksi|
|Keandalan data|Tidak ada data hilang saat aplikasi ditutup atau crash|Setiap set dan makanan disimpan seketika (bukan saat sesi selesai); migrasi database antar versi lolos uji; crash-free sessions ≥ 99,5%|
|Keamanan dan privasi|Data kesehatan bersifat sensitif|Data tersimpan di penyimpanan privat aplikasi; kunci aplikasi PIN atau biometrik (opsional); foto progres tidak muncul di galeri; ekspor atau cadangan terenkripsi (AES-256, kata sandi dari pengguna); izin seminimal mungkin (notifikasi, alarm tepat waktu, kamera opsional)|
|Analytics|Tidak ada pelacakan di MVP|Tanpa SDK iklan atau pelacak pihak ketiga; crash report anonim bisa dimatikan; analytics produk hanya dipertimbangkan di v2.0 dengan persetujuan|
|Kepatuhan (publik)|Data kesehatan termasuk data pribadi yang spesifik|Kebijakan privasi, persetujuan eksplisit, hak hapus data; mengacu pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, ditinjau konsultan hukum sebelum rilis publik|
|Aksesibilitas|Dapat dipakai dengan satu tangan di gym dan oleh pengguna dengan kebutuhan khusus|Area sentuh ≥ 48 dp; kontras teks minimal 4,5:1 (WCAG AA); label TalkBack di semua kontrol; teks mengikuti ukuran font sistem hingga 200%; status tidak hanya dengan warna (ikon dan teks pendamping); mode gelap|
|Kompatibilitas|Perangkat Android yang luas|Android 8.0 (API 26) ke atas; layar 5-7 inci; orientasi potret|
|Lokalisasi|Bahasa dan format Indonesia|Bahasa Indonesia default; desimal dengan koma; satuan metrik (kg, cm); bahasa Inggris dan satuan imperial menyusul v1.1 atau v2.0|
|Kualitas|Perhitungan inti tidak boleh salah|Uji unit rumus (BMR, TDEE, makro, e1RM, evaluasi mingguan) dengan cakupan ≥ 95%; contoh pada bagian 7.6 dan 7.9 menjadi uji acuan (golden test)|
|Pemeliharaan|Mudah dikembangkan|Aturan perhitungan terpisah dari UI sebagai modul tersendiri yang bisa diuji; konstanta (pengali, persen) dalam satu berkas konfigurasi|

## 9\. Model Data

Basis data: SQLite lokal. Semua tabel memakai kunci `id` (UUID), `created\_at`, `updated\_at`; tanggal disimpan sebagai tanggal lokal (`YYYY-MM-DD`) dan waktu dalam UTC.

|Entitas|Atribut utama|Relasi|
|-|-|-|
|UserProfile|sex, birth\_date, height\_cm, activity\_level, sessions\_per\_week, units, week\_start\_day|1 pengguna; punya banyak GoalSetting|
|GoalSetting|goal (bulking, cutting, recomp), pace, start\_date, reference\_weight\_kg, manual\_override|Milik UserProfile; punya banyak NutritionTarget|
|NutritionTarget|effective\_date, bmr, tdee, calories, protein\_g, carbs\_g, fat\_g, reason (onboarding, weight\_change, goal\_change, weekly\_review, manual)|Milik GoalSetting; riwayat target|
|Food|name, brand, source (bawaan, pengguna), kcal\_100g, protein\_100g, carbs\_100g, fat\_100g, is\_custom, category|Punya banyak FoodServing|
|FoodServing|food\_id, label (1 piring, 1 butir), grams|Milik Food|
|RecipeItem|recipe\_food\_id, ingredient\_food\_id, grams|Menghubungkan makanan resep ke bahan|
|MealEntry|date, meal\_type (sarapan, makan siang, makan malam, camilan), food\_id, serving\_id, quantity, kcal, protein\_g, carbs\_g, fat\_g (salinan nilai saat dicatat)|Milik Food; satu hari punya banyak entri|
|WeightLog|date, weight\_kg, note|Unik per tanggal|
|BodyMeasurement|date, type (pinggang, dada, lengan, paha), value\_cm|Banyak per tanggal|
|ProgressPhoto|date, file\_path, angle|Opsional per tanggal|
|Exercise|name, muscle\_group, equipment, default\_rep\_min, default\_rep\_max, increment\_kg, is\_custom|Dipakai di banyak ProgramDayExercise dan SessionExercise|
|WorkoutProgram|name, template (PPL, Upper/Lower, Full Body, Custom), sessions\_per\_week, is\_active|Punya banyak ProgramDay|
|ProgramDay|program\_id, name (Push, Upper A), order|Punya banyak ProgramDayExercise|
|ProgramDayExercise|program\_day\_id, exercise\_id, order, target\_sets, rep\_min, rep\_max, rest\_seconds|Menghubungkan hari ke latihan|
|WorkoutSession|date, program\_day\_id (nullable), started\_at, ended\_at, status (berjalan, selesai), note|Punya banyak SessionExercise|
|SessionExercise|session\_id, exercise\_id, order|Punya banyak SetLog|
|SetLog|session\_exercise\_id, set\_index, weight\_kg, reps, rpe (nullable), is\_warmup, e1rm\_kg|Milik SessionExercise|
|PersonalRecord|exercise\_id, type (beban, repetisi, e1rm, volume), value, set\_log\_id, achieved\_on|Dihitung dari SetLog; bisa dihitung ulang|
|WeeklyReview|week\_start, avg\_weight\_kg, weight\_change\_pct, avg\_kcal, adherence\_pct, suggestion, decision (diterima, ditolak, tertunda)|Terhubung ke NutritionTarget bila diterima|
|Reminder|type (makan, latihan, timbang), time, days\_of\_week, meal\_type (nullable), enabled|Mandiri|
|AppSettings|kunci aplikasi, tema, bahasa, hari mulai minggu|Mandiri|

**Aturan integritas:**

* `MealEntry` menyalin nilai gizi saat dicatat, sehingga perubahan makanan di kemudian hari tidak mengubah riwayat.
* Menghapus `Food` yang sudah dipakai ditolak (hanya bisa diarsipkan); menghapus `Exercise` yang sudah dipakai diarsipkan.
* `WeightLog` unik per tanggal; `SetLog.e1rm\_kg` diisi otomatis dan kosong untuk repetisi > 12 atau set pemanasan.
* `PersonalRecord` adalah data turunan: dapat dibangun ulang dari `SetLog` kapan saja.
* `NutritionTarget` tidak pernah ditimpa, selalu ditambah; target yang berlaku pada tanggal tertentu adalah entri dengan `effective\_date` terbaru yang ≤ tanggal itu.

**Hubungan utama:** UserProfile 1-N GoalSetting 1-N NutritionTarget. Food 1-N FoodServing; Food 1-N MealEntry. WorkoutProgram 1-N ProgramDay 1-N ProgramDayExercise N-1 Exercise. WorkoutSession 1-N SessionExercise 1-N SetLog; SessionExercise N-1 Exercise. Exercise 1-N PersonalRecord.

## 10\. Garis Besar Desain UI/UX

**Prinsip desain:** (1) pencatatan cepat dengan sedikit ketukan, terutama saat di gym dengan satu tangan; (2) angka paling penting selalu terlihat (sisa kalori, beban sesi lalu); (3) saran selalu disertai alasan; (4) tampilan bersih, kontras tinggi, mode gelap sejak MVP.

**Navigasi:** bilah bawah dengan 5 tab: Beranda, Makanan, Latihan, Progres, Profil. Tombol aksi cepat (+) di Beranda untuk tambah makanan, mulai sesi, dan catat berat.

|No|Layar|Tujuan|Komponen utama|
|-|-|-|-|
|1|Sambutan dan disclaimer|Menjelaskan manfaat dan batasan|Ilustrasi singkat, teks disclaimer, tombol setuju|
|2|Onboarding (4 langkah)|Mengumpulkan profil, tujuan, kecepatan|Input angka dengan stepper, pemilih jenis kelamin, slider frekuensi 0-7, kartu pilihan tujuan dan kecepatan dengan estimasi|
|3|Ringkasan target|Menampilkan hasil hitung dan alasannya|Kartu kalori, tiga kartu makro, tombol "Kenapa angka ini?"|
|4|Beranda (dashboard)|Ringkasan hari ini|Ring kalori, tiga bar makro, kartu latihan hari ini, kartu PR terbaru, berat terakhir, tombol aksi cepat|
|5|Makanan harian|Melihat dan mengelola catatan makan|Pemilih tanggal, empat bagian waktu makan, ringkasan kalori per bagian, geser untuk hapus, tombol salin hari|
|6|Cari dan tambah makanan|Menambah makanan cepat|Kolom cari, tab Sering, Terakhir, Semua, Custom; pemilih porsi dan jumlah; pratinjau makro|
|7|Buat makanan custom|Menyimpan makanan baru|Formulir gizi, peringatan konsistensi kalori, mode resep sederhana|
|8|Riwayat makan|Melihat pola mingguan dan bulanan|Grafik batang kalori, kalender kepatuhan, rata-rata makro|
|9|Latihan (beranda latihan)|Memilih atau memulai sesi|Sesi hari ini, daftar program, tombol mulai sesi kosong|
|10|Editor program|Membuat dan mengubah program|Pemilih template, daftar hari, pencarian latihan, atur set dan rentang repetisi, ubah urutan dengan seret|
|11|Sesi latihan aktif|Mencatat set|Kartu latihan, baris set (beban, repetisi, RPE), data sesi lalu, saran beban, tombol selesai set, pengatur waktu istirahat, lencana PR|
|12|Ringkasan sesi|Menutup sesi|Volume total, durasi, daftar PR, catatan|
|13|Detail latihan|Melihat progres satu latihan|Grafik e1RM dan beban, daftar PR, riwayat sesi|
|14|Progres|Tren tubuh dan latihan|Grafik berat (titik dan rata-rata 7 hari), volume mingguan, konsistensi latihan, kartu evaluasi mingguan|
|15|Catat berat dan ukuran|Input data tubuh|Input berat, lingkar, foto, catatan|
|16|Evaluasi mingguan|Menampilkan hasil dan saran|Laju perubahan, kepatuhan, saran kalori, tombol terima atau tolak|
|17|Profil dan target|Mengubah data dan target|Data profil, tujuan, kecepatan, override manual, riwayat target|
|18|Pengaturan|Konfigurasi aplikasi|Pengingat, tema, satuan, kunci aplikasi, ekspor dan impor data, tentang dan disclaimer|

**Komponen yang dipakai ulang:** ring progres, bar makro, kartu statistik, input angka dengan tombol +/−, baris set latihan, lencana PR, kartu saran (teks, alasan, tombol terima atau abaikan), grafik garis dan batang, status kosong (empty state) yang mengajak mencatat pertama kali.

**Keadaan khusus yang harus dirancang:** hari belum ada data, melebihi target kalori (warna peringatan lembut, bukan menghakimi), tidak ada data sesi sebelumnya (pertama kali latihan), izin notifikasi ditolak, data tidak cukup untuk evaluasi mingguan.

## 11\. Rekomendasi Tech Stack

**Keputusan: React Native dengan Expo (TypeScript), data disimpan lokal di perangkat, tanpa backend.** Alasan: aplikasi ini untuk pemakaian pribadi, harus berjalan penuh tanpa internet, dan pemilik lebih nyaman dengan React. React Native menghasilkan UI native sungguhan dengan bahasa yang sama (React dan TypeScript), dan Expo menyediakan SQLite, notifikasi terjadwal, kamera, dan build APK tanpa mengurus Android Studio secara manual.

|Kriteria|React Native + Expo (dipilih)|React + Capacitor|Kotlin + Compose|
|-|-|-|-|
|Bahasa|TypeScript|TypeScript|Kotlin|
|Tampilan|Komponen native sungguhan|Halaman web di WebView|Native sungguhan|
|Database lokal|expo-sqlite (SQLite)|IndexedDB atau SQLite|Room (SQLite)|
|Pengingat|expo-notifications (notifikasi lokal terjadwal)|Plugin Local Notifications|AlarmManager, langsung|
|Grafik|Pustaka berbasis SVG atau Skia|Recharts dan pustaka web|Vico|
|Build APK|EAS Build atau build lokal|Android Studio|Android Studio|
|Risiko utama|Ketergantungan pada pustaka dan versi Expo; perlu belajar komponen RN|Terasa kurang native|Perlu belajar Kotlin|
|Opsi iOS di kemudian hari|Mudah (basis kode sama)|Mudah|Tidak ada|

**Susunan teknologi yang diusulkan:**

* **Kerangka:** Expo (SDK stabil terbaru), React Native, TypeScript, Expo Router untuk navigasi. Gunakan development build (expo-dev-client), bukan hanya Expo Go, agar fitur native diuji sesuai kondisi sebenarnya.
* **Data:** expo-sqlite sebagai sumber kebenaran, dengan Drizzle ORM dan migrasi; pengaturan sederhana di penyimpanan kunci-nilai. Database makanan awal dikirim sebagai berkas aset dan diimpor saat pertama dibuka.
* **State dan formulir:** Zustand untuk state UI; react-hook-form dan zod untuk validasi input (profil, makanan custom, set latihan).
* **Tampilan:** NativeWind (Tailwind untuk RN) atau StyleSheet; mode gelap sejak MVP.
* **Grafik:** react-native-gifted-charts untuk memulai (garis, batang); Victory Native XL jika butuh grafik lebih halus.
* **Pengingat:** expo-notifications (notifikasi lokal terjadwal). Jadwal pengingat harus diuji setelah HP restart dan pada mode hemat baterai di perangkat nyata.
* **Perangkat:** expo-image-picker atau expo-camera (foto progres), expo-file-system dan expo-sharing (ekspor), expo-document-picker (impor), expo-local-authentication dan expo-secure-store (kunci aplikasi).
* **Arsitektur:** aturan hitung (BMR, TDEE, makro, double progression, e1RM, evaluasi mingguan) ditulis sebagai modul TypeScript murni tanpa React, agar mudah diuji dan dipakai ulang bila nanti ada backend.
* **Pengujian:** Jest (jest-expo) untuk rumus dan aturan bisnis dengan contoh di 7.6 dan 7.9 sebagai uji acuan; React Native Testing Library untuk alur utama.
* **Distribusi:** APK pribadi lewat EAS Build (profil APK) untuk dipasang langsung; Google Play (AAB) hanya jika kelak dibuka ke publik.
* **Cadangan:** ekspor dan impor berkas JSON (opsional terenkripsi) di MVP.

**Backend (Go + Postgres): ditunda.** Untuk pengguna tunggal tidak ada manfaat nyata dan akan menghilangkan kemudahan offline. Jika kelak butuh multi-perangkat atau publik, tambahkan sebagai lapisan sinkronisasi; model data sudah disiapkan (UUID, `updated\_at`, `deleted\_at`) sehingga aplikasi tidak perlu ditulis ulang.

## 12\. Risiko, Asumsi, dan Batasan

**Disclaimer wajib (tampil di onboarding, Pengaturan, dan halaman target):** FitCal Tracker adalah alat bantu pencatatan dan estimasi, bukan pengganti saran medis, diagnosis, atau konsultasi dengan dokter atau ahli gizi. Angka kalori dan makro adalah perkiraan berdasarkan rumus populasi umum. Konsultasikan dengan tenaga profesional sebelum memulai diet atau program latihan, terutama jika Anda memiliki kondisi medis, sedang hamil atau menyusui, atau memiliki riwayat gangguan makan.

**Risiko**

|Risiko|Dampak|Kemungkinan|Mitigasi|
|-|-|-|-|
|Target kalori tidak akurat untuk individu tertentu (rumus rata-rata populasi)|Progres tidak sesuai target|Tinggi|Evaluasi mingguan berbasis data nyata; override manual; penjelasan bahwa angka adalah titik awal|
|Defisit terlalu agresif atau kalori terlalu rendah|Risiko kesehatan|Sedang|Batas keras kalori dan defisit (7.3); BMI < 18,5 tidak boleh cutting; disclaimer|
|Pemicu atau penguat perilaku makan tidak sehat|Risiko kesehatan|Sedang|Bahasa netral, tidak ada pujian untuk defisit ekstrem, tanpa "streak puasa"; saran konsultasi bila angka mendekati batas bawah|
|Data makanan Indonesia tidak lengkap atau tidak akurat|Pencatatan lambat, hasil salah|Tinggi|Mulai ±500 item dari acuan resmi (TKPI), makanan custom mudah, tanda sumber, perbaikan berkala|
|Estimasi porsi oleh pengguna meleset|Kalori tercatat tidak akurat|Tinggi|Porsi umum (piring, sendok, potong), pilihan gram, penjelasan bahwa pencatatan perlu konsisten, bukan sempurna|
|Pengingat tidak berbunyi (pembatasan baterai Android)|Konsistensi turun|Sedang|Alarm tepat waktu, penerima boot, panduan mengecualikan dari penghemat baterai|
|Kehilangan data (ganti HP, hapus aplikasi)|Hilang riwayat|Sedang|Ekspor terenkripsi di MVP, cloud di v2.0, pengingat cadangan berkala|
|Hak cipta dan lisensi data makanan serta gambar latihan|Masalah hukum saat publik|Sedang|Memakai data berlisensi atau bersumber resmi; konten latihan ditulis sendiri|
|Isu data pribadi saat dibuka ke publik|Hukum dan reputasi|Sedang|Kebijakan privasi, persetujuan, hak hapus data; tinjauan hukum sebelum rilis|
|Lingkup melebar (terlalu banyak fitur sebelum MVP)|Jadwal molor|Tinggi|Prioritas MoSCoW dan aturan pemotongan lingkup (bagian 5)|

**Asumsi yang dipakai** (karena belum ada keputusan dari Anda):

* Pengguna dewasa (≥ 18 tahun), sehat, tanpa kondisi medis yang membatasi diet.
* Pengguna tunggal di satu perangkat Android 8.0 ke atas; tidak ada akun atau server di MVP.
* Satuan metrik (kg, cm, kcal); minggu dimulai hari Senin.
* Satu target kalori per hari (tanpa pembedaan hari latihan dan istirahat).
* Pengali aktivitas memakai tabel di 7.2; kecepatan default adalah "sedang".
* Database makanan awal sekitar 500 item makanan Indonesia dan umum, ditambah makanan custom.
* Daftar latihan awal sekitar 80-100 gerakan gym umum, dengan nama Indonesia dan Inggris.
* Tidak ada konten medis, resep diet, atau saran suplemen.
* Pengembangan oleh 1 pengembang (atau tim kecil) dengan estimasi kapasitas penuh waktu; ubah estimasi roadmap bila kapasitas berbeda.

**Batasan**

* Estimasi 1 kg ≈ 7.700 kcal dan rumus Mifflin-St Jeor adalah pendekatan; keduanya kurang akurat pada kondisi ekstrem (sangat berotot, sangat gemuk, sangat kurus).
* Tren berat dipengaruhi air, garam, siklus hormonal, dan waktu penimbangan; evaluasi memakai rata-rata 7 hari untuk meredamnya, namun tidak menghilangkannya.
* Aplikasi tidak mendeteksi cedera atau teknik yang salah, dan tidak menggantikan pelatih.
* Foto progres bersifat privat dan tersimpan hanya di perangkat; kehilangan perangkat berarti kehilangan foto jika tidak diekspor.

## 13\. Roadmap Rilis

Estimasi kasar untuk 1 pengembang penuh waktu; durasi dalam minggu kerja. Estimasi akan bergeser jika kapasitas, pengalaman React Native, atau penyusunan database makanan berbeda dari asumsi.

|Rilis|Isi utama|Estimasi|Kriteria selesai|
|-|-|-|-|
|Persiapan|Desain UI semua layar MVP, penyusunan 500 makanan awal dan 80-100 latihan, kerangka proyek, uji rumus|3-4 minggu (termasuk menyiapkan proyek Expo dan mempelajari dasar React Native bila belum terbiasa)|Prototipe disetujui; daftar makanan dan latihan siap diimpor; uji golden rumus lolos|
|**MVP (v1.0)**|Onboarding dan profil; kalkulator kalori dan makro; tracker kalori harian (database, custom, ring, riwayat harian); program dan template latihan; pencatatan sesi dengan data sesi lalu; saran progressive overload; e1RM dan PR; catat berat dan grafik tren dasar; dashboard; pengingat dasar|10-12 minggu|Semua cerita Must lolos acceptance criteria; dipakai penuh oleh pemilik selama 2 minggu tanpa kehilangan data; crash-free ≥ 99%|
|**v1.1**|Riwayat mingguan dan bulanan; evaluasi mingguan dan saran kalori; grafik progres beban, volume, konsistensi; pengatur waktu istirahat; lingkar tubuh dan foto progres; ekspor dan impor (CSV, cadangan terenkripsi); perbaikan dari pemakaian nyata; bahasa Inggris|6-8 minggu|KPI di bagian 3 terukur; evaluasi mingguan teruji dengan data nyata|
|**v2.0**|Persiapan publik: akun dan cadangan cloud, sinkronisasi, kebijakan privasi dan persetujuan, pindai barcode, integrasi Health Connect, carb cycling, rekomendasi program adaptif, analytics dengan persetujuan, rilis Google Play (AAB)|12-16 minggu|Tinjauan hukum selesai; uji beta ≥ 20 pengguna; retensi hari ke-30 ≥ 30%|

**Total perkiraan:** sekitar 30-39 minggu (±7-9 bulan) sampai v2.0, dengan MVP yang bisa dipakai sendiri setelah sekitar 12-15 minggu sejak mulai.

**Urutan pengerjaan MVP yang disarankan:**

1. Modul domain dan uji (rumus BMR, TDEE, makro, e1RM, double progression) dan model data.
2. Onboarding, profil, dan ringkasan target.
3. Tracker makanan dengan database makanan awal.
4. Pencatatan sesi latihan dan saran overload, lalu e1RM dan PR.
5. Berat badan, dashboard, dan pengingat.
6. Uji pemakaian pribadi, perbaikan, dan pembuatan APK rilis bertanda tangan.

**Titik keputusan (gate):** (1) setelah persiapan, pastikan database makanan dan desain layak sebelum coding berat; (2) setelah MVP dipakai 2 minggu, putuskan prioritas v1.1 dari pengalaman nyata; (3) sebelum v2.0, putuskan apakah produk benar-benar dibuka ke publik.

## 14\. Pertanyaan Terbuka untuk Anda Putuskan

Setiap pertanyaan menyertakan asumsi yang saya pakai di dokumen ini; ubah jika tidak sesuai.

|No|Pertanyaan|Asumsi saat ini|Dampak jika berubah|
|-|-|-|-|
|1|Apakah aplikasi pernah perlu berjalan di iOS?|Hanya Android|Dengan React Native, iOS bisa ditambah tanpa menulis ulang (butuh akun pengembang Apple dan perangkat uji)|
|2|Siapa yang akan mengembangkan, dan berapa kapasitasnya?|1 pengembang penuh waktu|Estimasi roadmap berubah; pengalaman React Native menentukan lamanya persiapan|
|3|sApakah Anda punya sumber data makanan Indonesia (TKPI, spreadsheet pribadi, lisensi pihak ketiga)?|untuk saat ini fokus ke real food saja dan data nya ada proses yang di panggang,di rebus dan di goreng,buatkan juga menu other snack dan bisa di input bebas kalori ny dari user|Waktu persiapan dan akurasi database|
|4|Apakah pengguna perempuan termasuk di MVP (termasuk siklus menstruasi)?|saat ini fokus ke laki laki saja karna app ini hanya untuk saya (lakilaki)|Aturan kalori dan evaluasi mingguan untuk perempuan|
|5|Apakah rentang protein dan lemak di 7.4 sesuai preferensi atau saran ahli gizi Anda?|Default di 7.4|Perubahan angka default dan rentang|
|6|Apakah target kalori perlu berbeda antara hari latihan dan hari istirahat?|Tidak, satu target harian|Tambahan fitur carb cycling dan perubahan UI dashboard|
|7|Seberapa penting pindai barcode untuk makanan kemasan?|Ditunda ke v2.0|Perlu database produk dan lisensi; bisa masuk lebih awal|
|8|Apakah foto progres dan data tubuh perlu cadangan otomatis di cloud?|Hanya ekspor manual di MVP|Perlu backend dan keamanan tambahan|
|9|Apakah aplikasi akan dipublikasikan di Google Play atau dibagikan sebagai APK?|APK pribadi lewat EAS Build, untuk dipakai sendiri|Kebutuhan kebijakan privasi, penandatanganan, dan tinjauan hukum|
|10|Apakah model bisnis perlu dipikirkan (gratis, iklan, langganan)?|Belum, gratis|Mempengaruhi arsitektur akun, analytics, dan fitur berbayar|
|11|Apakah nama "FitCal Tracker" final?|FitTrack|Pemeriksaan merek, nama paket (package name), ikon|
|12|Apakah perlu mode latihan untuk jenis lain (kardio, kalisthenik, olahraga)?|Hanya latihan beban gym|Perubahan model data latihan dan perhitungan volume|
|13|Apakah pengguna menimbang diri sendiri harian, atau lebih jarang?|Harian dianjurkan, minimal 4 kali per minggu|Aturan evaluasi mingguan bila datanya jarang|
|14|Bagaimana jika pengguna tidak lagi sesuai batas aman (misalnya BMI) tetapi tetap ingin melanjutkan?|Diblokir untuk cutting BMI < 18,5, peringatan untuk kondisi lain|Kebijakan keamanan dan bahasa disclaimer|

Keputusan paling berpengaruh ke jadwal: nomor 1, 2, 3, dan 9.

