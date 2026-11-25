/**
 * Every user-facing string lives here (Bahasa Indonesia). Domain modules return
 * reason codes, never prose, and the UI resolves them through these maps.
 */

import type { ActivityLevel, Goal, MealType, Pace, Sex } from './config';
import type { NutritionReason, PrType, ProgressionReason } from './domain/types';

export const DISCLAIMER =
  'FitTrack adalah alat bantu pencatatan dan estimasi, bukan pengganti saran medis, diagnosis, atau konsultasi dengan dokter atau ahli gizi. Angka kalori dan makro adalah perkiraan berdasarkan rumus populasi umum. Konsultasikan dengan tenaga profesional sebelum memulai diet atau program latihan, terutama jika Anda memiliki kondisi medis, sedang hamil atau menyusui, atau memiliki riwayat gangguan makan.';

export const t = {
  appName: 'FitTrack',
  tagline: 'Kalori dan beban, satu aplikasi.',
  disclaimer: DISCLAIMER,

  nav: {
    home: 'Beranda',
    food: 'Makanan',
    workout: 'Latihan',
    progress: 'Progres',
    profile: 'Profil',
    settings: 'Pengaturan',
  },

  common: {
    save: 'Simpan',
    saved: 'Tersimpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Ubah',
    back: 'Kembali',
    next: 'Lanjut',
    finish: 'Selesai',
    skip: 'Lewati',
    close: 'Tutup',
    add: 'Tambah',
    increase: 'Tambah',
    decrease: 'Kurangi',
    remove: 'Hapus',
    search: 'Cari',
    loading: 'Memuat…',
    error: 'Terjadi kesalahan',
    retry: 'Coba lagi',
    yes: 'Ya',
    no: 'Tidak',
    confirm: 'Konfirmasi',
    today: 'Hari ini',
    yesterday: 'Kemarin',
    tomorrow: 'Besok',
    optional: 'opsional',
    required: 'wajib',
    total: 'Total',
    target: 'Target',
    remaining: 'Sisa',
    over: 'Lebih',
    of: 'dari',
    manual: 'Manual',
    auto: 'Otomatis',
    start: 'Mulai',
    continue: 'Lanjutkan',
    done: 'Selesai',
    none: 'Belum ada',
    noData: 'Belum ada data',
    seeAll: 'Lihat semua',
    note: 'Catatan',
    date: 'Tanggal',
    or: 'atau',
    results: 'hasil',
    minutesShort: 'mnt',
    hoursShort: 'j',
    secondsShort: 'dtk',
    reason: 'Alasan',
    why: 'Kenapa?',
    accept: 'Terima',
    reject: 'Tolak',
    later: 'Nanti',
  },

  comingSoon: {
    title: 'Segera hadir',
    food: 'Pencatatan makanan menyusul di fase berikutnya.',
    workout: 'Pencatatan sesi menyusul di fase berikutnya.',
    progress: 'Grafik dan catatan berat menyusul di fase berikutnya.',
  },

  units: {
    kcal: 'kkal',
    g: 'g',
    kg: 'kg',
    cm: 'cm',
    per100g: 'per 100 g',
    perServing: 'per porsi',
    sets: 'set',
    reps: 'repetisi',
  },

  sex: { male: 'Pria', female: 'Wanita' } satisfies Record<Sex, string>,
  goal: {
    bulking: 'Bulking',
    cutting: 'Cutting',
    recomp: 'Rekomposisi',
  } satisfies Record<Goal, string>,
  goalDesc: {
    bulking: 'Menambah massa dengan surplus kalori terkendali.',
    cutting: 'Menurunkan lemak dengan defisit dan protein tinggi.',
    recomp: 'Berat stabil, komposisi tubuh membaik.',
  } satisfies Record<Goal, string>,
  pace: {
    slow: 'Pelan',
    moderate: 'Sedang',
    aggressive: 'Agresif',
  } satisfies Record<Pace, string>,
  activity: {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
  } satisfies Record<ActivityLevel, string>,
  activityDesc: {
    low: 'Kerja kantoran, banyak duduk',
    medium: 'Sering berdiri atau berjalan',
    high: 'Pekerjaan fisik berat',
  } satisfies Record<ActivityLevel, string>,
  meal: {
    breakfast: 'Sarapan',
    lunch: 'Makan siang',
    dinner: 'Makan malam',
    snack: 'Camilan',
  } satisfies Record<MealType, string>,

  monthShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  dayShort: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  dayLong: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],

  onboarding: {
    welcomeTitle: 'Selamat datang di FitTrack',
    welcomeBody:
      'Atur target kalori dan makro dari profilmu, catat makanan Indonesia, dan ikuti progres beban di gym — semuanya offline.',
    disclaimerTitle: 'Baca sebelum mulai',
    agree: 'Saya sudah membaca dan setuju',
    profileTitle: 'Data dirimu',
    profileBody: 'Dipakai untuk menghitung BMR dan TDEE. Semua data tersimpan di perangkat ini.',
    age: 'Umur (tahun)',
    height: 'Tinggi (cm)',
    weight: 'Berat (kg)',
    sessions: 'Latihan per minggu',
    activity: 'Aktivitas harian',
    goalTitle: 'Pilih tujuan',
    goalBody: 'Tujuan memengaruhi kalori dan pembagian makro.',
    paceTitle: 'Pilih kecepatan',
    paceBody: 'Setiap kecepatan menampilkan perkiraan kalori dan perubahan berat per minggu.',
    summaryTitle: 'Target harianmu',
    summaryBody: 'Angka ini adalah titik awal. Evaluasi berkala dengan data nyata.',
    finish: 'Simpan dan mulai',
    step: 'Langkah',
    ofStep: 'dari',
    cuttingBlocked: 'Cutting tidak tersedia karena BMI di bawah 18,5.',
    bulkingWarn: 'Bulking tidak disarankan pada BMI 30 ke atas.',
    paceBlocked: 'Terlalu agresif untuk beratmu saat ini.',
    safeNote: 'Batas aman kalori diterapkan otomatis.',
  },

  nutrition: {
    bmr: 'BMR',
    tdee: 'TDEE',
    pal: 'Pengali aktivitas',
    calories: 'Kalori',
    protein: 'Protein',
    carbs: 'Karbohidrat',
    fat: 'Lemak',
    fiber: 'Serat',
    fiberNote: 'Target informasi (14 g per 1.000 kkal), tanpa pembatasan.',
    adjustment: 'Penyesuaian tujuan',
    weightChange: 'Perkiraan perubahan berat',
    perWeek: '/minggu',
    whyBmr:
      'BMR memakai rumus Mifflin-St Jeor: 10 × berat + 6,25 × tinggi − 5 × umur (+5 pria / −161 wanita). Ini energi saat istirahat total.',
    whyTdee:
      'TDEE = BMR × pengali aktivitas. Pengali berasal dari frekuensi latihan per minggu ditambah level aktivitas harian, maksimal 1,90.',
    whyCalories:
      'Kalori target = TDEE × (1 + penyesuaian tujuan). Bulking surplus maksimal 20% atau 500 kkal; cutting defisit maksimal 25% dengan batas bawah aman.',
    whyProtein:
      'Protein dihitung dari gram per kg berat badan sesuai tujuan. Cutting memakai protein lebih tinggi untuk menjaga massa otot.',
    whyFat:
      'Lemak default 25% kalori, minimal 20% dan tidak kurang dari 0,6 g/kg untuk fungsi hormon.',
    whyCarbs:
      'Karbohidrat mengisi sisa kalori setelah protein dan lemak. Jika di bawah 2 g/kg, lemak diturunkan ke batas bawah 20%.',
    weightChangeFormula: 'Perkiraan memakai 1 kg massa tubuh ≈ 7.700 kkal.',
    estimateNote: 'Perkiraan kasar; sesuaikan dengan tren berat nyata.',
    safetyFloor: 'Kalori dinaikkan ke batas aman.',
  },

  nutritionReasons: {
    bulkSurplusCapped: 'Surplus dibatasi ke batas aman (maksimal 20% atau 500 kkal).',
    cuttingFloorApplied: 'Kalori dinaikkan ke batas bawah aman (1.500 pria / 1.200 wanita dan tidak di bawah BMR).',
    cuttingTooFast: 'Penurunan melebihi 1% berat badan per minggu.',
    bulkNotRecommendedHighBmi: 'Bulking tidak disarankan pada BMI 30 ke atas.',
    cuttingBlockedLowBmi: 'Cutting tidak boleh pada BMI di bawah 18,5.',
    proteinOutOfRange: 'Protein di luar rentang yang disarankan untuk tujuan ini.',
    fatOutOfRange: 'Lemak di luar rentang 20-35% kalori; nilai disesuaikan.',
    fatRaisedToMinimum: 'Lemak dinaikkan ke minimal 0,6 g/kg berat badan.',
    fatLoweredForCarbs: 'Lemak diturunkan ke 20% agar karbohidrat cukup.',
    carbsBelowMinimum: 'Karbohidrat masih di bawah 2 g/kg; pertimbangkan menurunkan protein atau menambah kalori.',
    caloriesTooLowForMacros: 'Kalori terlalu rendah untuk kebutuhan protein dan lemak.',
  } satisfies Record<NutritionReason, string>,

  food: {
    title: 'Makanan',
    dailyTitle: 'Catatan makan',
    addFood: 'Tambah makanan',
    searchFood: 'Cari makanan',
    searchPlaceholder: 'Cari, mis. "ayam gor"',
    frequent: 'Sering',
    recent: 'Terakhir',
    allFoods: 'Semua',
    customTab: 'Saya',
    createFood: 'Buat makanan baru',
    createRecipe: 'Buat dari resep',
    name: 'Nama makanan',
    brand: 'Merek',
    servingLabel: 'Nama porsi',
    servingGrams: 'Gram per porsi',
    category: 'Kategori',
    per100g: 'Nilai gizi per 100 g',
    kcal: 'Kalori (kkal)',
    protein: 'Protein (g)',
    carbs: 'Karbohidrat (g)',
    fat: 'Lemak (g)',
    saveFood: 'Simpan makanan',
    kcalWarning: 'Kalori berbeda lebih dari 15% dari hitungan 4P + 4K + 9L. Tetap simpan?',
    recipeMode: 'Mode resep',
    ingredients: 'Bahan',
    addIngredient: 'Tambah bahan',
    ingredientGrams: 'Gram',
    totalGrams: 'Total berat',
    recipeNeedsIngredients: 'Tambahkan minimal satu bahan.',
    pickIngredient: 'Pilih bahan',
    emptyMeal: 'Belum ada makanan di waktu ini.',
    emptyDay: 'Belum ada catatan. Mulai dari sarapan?',
    copyDay: 'Salin hari',
    copied: 'Tersalin',
    entries: 'entri',
    deleteConfirm: 'Hapus entri makanan ini?',
    quantity: 'Jumlah',
    grams: 'Gram',
    portion: 'Porsi',
    preview: 'Pratinjau',
    source: 'Sumber',
    verified: 'Terverifikasi',
    unverified: 'Belum terverifikasi',
    estimateNote:
      'Nilai bawaan adalah estimasi dan belum terverifikasi. Periksa label/TKPI atau ubah lewat impor CSV.',
    noResults: 'Tidak ada makanan yang cocok.',
    noResultsHint: 'Coba kata lain atau buat makanan baru.',
    customLabel: 'Saya',
    builtInLabel: 'Bawaan',
    pickDate: 'Pilih tanggal',
    mealCalories: 'kkal',
    added: 'Ditambahkan',
    selectFood: 'Pilih makanan',
    servingSize: 'Ukuran porsi',
    saveEntry: 'Simpan ke catatan',
    noServing: 'gram',
    customTitle: 'Makanan baru',
    nameRequired: 'Nama wajib diisi.',
    positiveRequired: 'Nilai harus lebih dari 0.',
    kcalPer100: 'Kalori per 100 g',
    backToLog: 'Kembali ke catatan',
    noEntries: 'Belum ada makanan tercatat.',
    targetNote: 'Sisa target dihitung dari target harian aktif.',
    historyTitle: 'Riwayat harian',
    avgKcal: 'Rata-rata kalori',
    daysLogged: 'Hari tercatat',
  },

  workout: {
    title: 'Latihan',
    todaySession: 'Sesi hari ini',
    restDay: 'Hari istirahat',
    restDayBody: 'Tidak ada sesi terjadwal. Kamu tetap bisa mulai sesi kosong.',
    startSession: 'Mulai sesi',
    emptySession: 'Sesi kosong',
    programs: 'Program',
    program: 'Program',
    newProgram: 'Program baru',
    editProgram: 'Ubah program',
    template: 'Template',
    templateHint: 'Template disesuaikan dengan frekuensi latihan.',
    programName: 'Nama program',
    days: 'Hari',
    addDay: 'Tambah hari',
    dayName: 'Nama hari',
    exercises: 'Latihan',
    addExercise: 'Tambah latihan',
    targetSets: 'Target set',
    repRange: 'Rentang repetisi',
    restSeconds: 'Istirahat (detik)',
    saveProgram: 'Simpan program',
    duplicate: 'Duplikat program',
    activeSession: 'Sesi aktif',
    finishSession: 'Selesai sesi',
    elapsed: 'Durasi',
    restTimer: 'Waktu istirahat',
    startTimer: 'Mulai istirahat',
    resetTimer: 'Reset',
    set: 'Set',
    weight: 'Beban (kg)',
    reps: 'Reps',
    rpe: 'RPE',
    warmup: 'Pemanasan',
    completeSet: 'Selesai set',
    lastSession: 'Terakhir',
    firstTime: 'Latihan pertama untuk gerakan ini.',
    suggestion: 'Hari ini',
    acceptSuggestion: 'Pakai saran',
    prBadge: 'PR',
    prWeight: 'PR beban',
    prReps: 'PR repetisi',
    prE1rm: 'PR e1RM',
    prVolume: 'PR volume sesi',
    sessionSummary: 'Ringkasan sesi',
    totalVolume: 'Total volume',
    duration: 'Durasi',
    prList: 'Personal Record',
    noPr: 'Belum ada PR baru di sesi ini.',
    resumeSession: 'Lanjutkan sesi',
    resumeBody: 'Ada sesi yang belum selesai.',
    exercise: 'Latihan',
    muscleGroup: 'Otot',
    equipment: 'Alat',
    addSet: 'Tambah set',
    removeSet: 'Hapus set',
    finishConfirm: 'Selesaikan sesi ini?',
    sessionSaved: 'Sesi tersimpan',
    programSaved: 'Program tersimpan',
    noPrograms: 'Belum ada program. Buat dari template.',
    noWorkoutToday: 'Belum ada jadwal hari ini.',
    chooseSession: 'Pilih sesi',
    scheduledToday: 'Terjadwal hari ini',
    volume: 'Volume',
    deleteSessionConfirm: 'Hapus sesi ini beserta set-nya?',
    suggestionReason: 'Alasan saran',
    noSuggestion: 'Belum cukup data untuk saran.',
    restNote: 'Default 90 detik isolasi, 180 detik majemuk. Bisa diubah di sesi.',
    setsDone: 'set selesai',
    finishSessionShort: 'Selesai',
    keepGoing: 'Lanjut',
    historyTitle: 'Riwayat sesi',
    noHistory: 'Belum ada sesi selesai.',
    exerciseDetail: 'Detail latihan',
    topSet: 'Beban teratas',
    estimated1rm: 'Estimasi 1RM',
    recentSessions: 'Sesi terakhir',
    notEstimated: 'Tidak diestimasi (repetisi > 12)',
    addExerciseHint: 'Pilih dari daftar atau buat latihan baru.',
    setsShort: 'set',
    weekShort: '/minggu',
    setActive: 'Jadikan aktif',
    repMinLabel: 'Reps min',
    repMaxLabel: 'Reps max',
    repsShort: 'rep',
    warmupShort: 'pemanasan',
    finishSetError: 'Isi beban dan repetisi lebih dari 0.',
  },

  progressionReasons: {
    layoffRestart: 'Tidak latihan ini ≥ 14 hari. Mulai dari 90% beban terakhir.',
    deloadStalled: 'e1RM tidak naik 3 sesi berturut-turut. Deload 10% atau ganti variasi.',
    increaseAllMax: 'Semua set mencapai batas atas dengan RPE ≤ 9. Naikkan beban.',
    addRep: 'Semua set minimal di batas bawah. Tambah 1 repetisi sebelum menambah beban.',
    holdBelowMinOnce: 'Ada set di bawah batas bawah. Beban tetap.',
    reduceBelowMinTwice: 'Di bawah batas bawah dua sesi berturut-turut. Turunkan beban 10%.',
    holdRpe10: 'Ada set dengan RPE 10. Jangan naikkan beban.',
    hold: 'Beban tetap; fokus kualitas repetisi.',
  } satisfies Record<ProgressionReason, string>,

  prType: {
    weight: 'Beban',
    reps: 'Repetisi',
    e1rm: 'e1RM',
    volume: 'Volume',
  } satisfies Record<PrType, string>,

  progress: {
    title: 'Progres',
    weightTitle: 'Berat badan',
    logWeight: 'Catat berat',
    latestWeight: 'Berat terakhir',
    noWeightData: 'Belum ada catatan berat. Catat pagi ini untuk memulai tren.',
    sevenDayAvg: 'Rata-rata 7 hari',
    weightSaved: 'Berat tersimpan',
    weightToday: 'Berat hari ini (kg)',
    noteOptional: 'Catatan (opsional)',
    overwriteConfirm: 'Sudah ada berat untuk hari ini. Ganti dengan yang baru?',
    prRecent: 'PR 7 hari terakhir',
    noPr: 'Belum ada PR baru.',
    e1rmShort: 'e1RM',
    topSet: 'Beban teratas',
    targetCard: 'Target aktif',
    currentTarget: 'Target harian',
    chartsLater: 'Grafik progres latihan tersedia di v1.1.',
    trendNote: 'Turun/naik berat alami berfluktuasi. Lihat rata-rata 7 hari.',
    bmiLabel: 'BMI',
    exerciseProgress: 'Progres latihan',
    selectExercise: 'Pilih latihan',
    noExerciseData: 'Belum ada data latihan ini.',
    weeklyEval: 'Evaluasi mingguan',
    weeklyEvalHint: 'Dibandingkan rata-rata 7 hari sebelumnya.',
    weeklyEvalInsufficient: 'Data belum cukup untuk evaluasi.',
    weeklyEvalOnTrack: 'Sesuai target',
    weeklyEvalAddKcal: 'Tambah kalori',
    weeklyEvalReduceKcal: 'Kurangi kalori',
    weeklyEvalImprove: 'Perbaiki kepatuhan',
    weeklyEvalAccept: 'Terima',
    weeklyEvalReject: 'Tolak',
    weeklyEvalAccepted: 'Target diperbarui.',
    weeklyEvalRejected: 'Saran ditolak.',
    weeklyEvalRate: 'Laju mingguan',
    weeklyEvalWeightChange: 'Perubahan berat',
    weeklyEvalAvgKcal: 'Rata-rata kalori',
  },

  profile: {
    title: 'Profil',
    personal: 'Data pribadi',
    targets: 'Target dan tujuan',
    editProfile: 'Ubah profil',
    editTarget: 'Ubah tujuan',
    recalculate: 'Hitung ulang target',
    targetHistory: 'Riwayat target',
    manualOverride: 'Target manual',
    manualHint: 'Target manual menimpa hasil hitung sampai kamu menghitung ulang.',
    saveProfile: 'Simpan profil',
    saved: 'Profil tersimpan',
    targetUpdatePrompt: 'Target baru tersedia',
    targetUpdateBody: 'Berat atau tujuan berubah. Hitung ulang target?',
    oldTarget: 'Target lama',
    newTarget: 'Target baru',
    acceptTarget: 'Pakai target baru',
    currentTarget: 'Target berlaku',
    activeSince: 'Berlaku sejak',
    reason: 'Alasan',
    targetReason: {
      onboarding: 'Onboarding',
      weight_change: 'Berat berubah',
      goal_change: 'Tujuan berubah',
      weekly_review: 'Evaluasi mingguan',
      manual: 'Manual',
    },
    bmiNote: 'BMI adalah indikator kasar, bukan diagnosis.',
    weightChanged: 'Berat berubah ≥ 1 kg dari acuan target.',
    disclaimerTitle: 'Disclaimer medis',
    about: 'Tentang',
    estimatedNote: 'Angka adalah estimasi populasi, bukan saran medis.',
  },

  settings: {
    title: 'Pengaturan',
    reminders: 'Pengingat',
    mealReminders: 'Pengingat makan',
    workoutReminders: 'Pengingat latihan',
    weighInReminders: 'Pengingat timbang badan',
    reminderTime: 'Jam',
    reminderDays: 'Hari',
    notificationsTitle: 'Izin notifikasi',
    notificationsBody:
      'Izinkan notifikasi agar pengingat berbunyi. Di Android, kecualikan FitTrack dari penghemat baterai agar alarm tepat waktu.',
    enableNotifications: 'Aktifkan notifikasi',
    notificationsBlocked: 'Izin notifikasi ditolak. Aktifkan lewat pengaturan sistem.',
    theme: 'Tema',
    themeSystem: 'Ikuti sistem',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    about: 'Tentang',
    version: 'Versi',
    privacy: 'Privasi',
    privacyBody: 'Semua data tersimpan di perangkat ini. Tidak ada akun, iklan, atau pelacakan.',
    medicalDisclaimer: 'Disclaimer medis',
    backup: 'Cadangan',
    exportJson: 'Ekspor data (JSON)',
    importJson: 'Impor data (JSON)',
    backupLater: 'Ekspor/impor tersedia di v1.1.',
    resetApp: 'Hapus semua data',
    resetConfirm: 'Semua data profil, makanan, dan latihan akan dihapus permanen. Lanjutkan?',
    language: 'Bahasa',
    indonesian: 'Bahasa Indonesia',
    reminderSaved: 'Pengingat disimpan',
    reminderPermissionFirst: 'Aktifkan izin notifikasi terlebih dahulu.',
    reminderNote: 'Pengingat lokal berjalan offline. Uji setelah HP restart.',
    weighInDay: 'Hari timbang',
    everyDay: 'Setiap hari',
  },

  validation: {
    required: 'Wajib diisi.',
    number: 'Masukkan angka yang valid.',
    age: 'Umur harus 18-80 tahun.',
    height: 'Tinggi harus 120-230 cm.',
    weight: 'Berat harus 30-250 kg.',
    sessions: 'Frekuensi latihan 0-7 per minggu.',
    name: 'Nama wajib diisi.',
    positive: 'Harus lebih dari 0.',
    nonNegative: 'Tidak boleh negatif.',
    grams: 'Gram harus lebih dari 0.',
    tooLong: 'Terlalu panjang.',
  },

  empty: {
    food: 'Belum ada makanan. Tambahkan yang pertama.',
    workout: 'Belum ada sesi. Mulai latihan pertama.',
    weight: 'Belum ada berat tercatat.',
    pr: 'PR akan muncul setelah kamu menyelesaikan sesi.',
  },

  errors: {
    generic: 'Terjadi kesalahan. Coba lagi.',
    db: 'Gagal mengakses database lokal.',
    notFound: 'Data tidak ditemukan.',
    permission: 'Izin diperlukan.',
  },

  disclaimerShort: 'Bukan pengganti saran medis.',
} as const;

export const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
const intFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const oneDecimalFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '–';
  if (fractionDigits === 0) return intFormatter.format(value);
  if (fractionDigits === 1) return oneDecimalFormatter.format(value);
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: fractionDigits }).format(value);
}

export function formatKcal(value: number): string {
  return `${formatNumber(value, 0)} ${t.units.kcal}`;
}

export function formatKg(value: number): string {
  return `${formatNumber(value, 1)} ${t.units.kg}`;
}

export function formatGrams(value: number): string {
  return `${formatNumber(value, 0)} ${t.units.g}`;
}

export function formatSignedKcal(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 0)} ${t.units.kcal}`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${t.monthShort[month - 1] ?? ''} ${year}`;
}

export function formatDateShort(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${String(day ?? 0).padStart(2, '0')}/${String(month ?? 0).padStart(2, '0')}`;
}

export function formatWeekday(iso: string): string {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return t.dayShort[(date.getDay() + 6) % 7] ?? '';
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}${t.common.hoursShort} ${minutes}${t.common.minutesShort}`;
  return `${minutes}${t.common.minutesShort}`;
}

export function formatRest(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
