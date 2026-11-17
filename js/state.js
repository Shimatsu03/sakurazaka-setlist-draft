// =========================
// Global State
// =========================

const state = {

  // 現在表示中の画面
  // settings
  // draft
  // edit
  // result
  currentScreen: "settings",

  // =========================
  // 設定画面
  // =========================

  settings: {

    // 指名曲数
    targetCount: 15,

    // 候補曲数
    candidateCount: 5,

    // パス回数
    passCount: 3

  },

  // =========================
  // フィルター
  // =========================

  filters: {

    // 選択中カテゴリ
    categories: [],

    // 選択中リリース
    releases: []

  },

  // =========================
  // 楽曲データ
  // =========================

  // songs.json読込結果
  songs: [],

  // フィルター適用後
  availableSongs: [],

  // ドラフト中の候補
  currentCandidates: [],

  // =========================
  // ドラフト画面
  // =========================

  // 選択済み楽曲ID
  selectedSongIds: [],

  // 残りパス数
  remainingPasses: 3,

  // =========================
  // 編集画面
  // =========================

  // ライブタイトル
  liveTitle: "",

  // 編集対象セットリスト
  setlistItems: []

};