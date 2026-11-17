const STORAGE_KEY =
  "sakurazaka-setlist-draft";

document.addEventListener(
  "DOMContentLoaded",
  init
);

async function init() {

  await loadSongs();

   bindEvents();

   populateSelects();

   initializeFilters();

   applyFilters();

  const restored = loadState();

  if (restored) {

    renderByCurrentScreen();

  } else {

    showScreen("settings");

    updateSongCount();

  }

}

async function loadSongs() {

  const response =
    await fetch("./data/songs.json");

  state.songs =
    await response.json();

  state.availableSongs =
    [...state.songs];

}

function bindEvents() {

  document
    .getElementById("start-draft-btn")
    .addEventListener(
      "click",
      startDraft
    );

  document
    .getElementById("pass-btn")
    .addEventListener(
      "click",
      passCandidates
    );

  document
    .getElementById("select-all-categories")
    .addEventListener(
      "click",
      selectAllCategories
    );

  document
    .getElementById("clear-all-categories")
    .addEventListener(
      "click",
      clearAllCategories
    );

  document
    .getElementById("select-all-releases")
    .addEventListener(
      "click",
      selectAllReleases
    );

  document
    .getElementById("clear-all-releases")
    .addEventListener(
      "click",
      clearAllReleases
    );

  document
  .getElementById(
    "add-mc-btn"
  )
  .addEventListener(
    "click",
    addMC
  );

  document
  .getElementById(
    "create-result-btn"
  )
  .addEventListener(
    "click",
    createResult
  );

  document
  .getElementById(
    "back-to-edit-btn"
  )
  .addEventListener(
    "click",
    backToEdit
  );

document
  .getElementById(
    "restart-btn"
  )
  .addEventListener(
    "click",
    restartApp
  );

document
  .getElementById(
    "save-image-btn"
  )
  .addEventListener(
    "click",
    saveAsImage
  );

}

function populateSelects() {

  fillSelect(
    "target-count",
    5,
    25,
    15
  );

  fillSelect(
    "candidate-count",
    1,
    15,
    5
  );

  fillSelect(
    "pass-count",
    0,
    15,
    3
  );

}

function fillSelect(
  id,
  min,
  max,
  selected
) {

  const select =
    document.getElementById(id);

  select.innerHTML = "";

  for (
    let i = min;
    i <= max;
    i++
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value = i;
    option.textContent = i;

    if (i === selected) {

      option.selected = true;

    }

    select.appendChild(option);

  }

}

function startDraft() {

  state.settings.targetCount =
    Number(
      document.getElementById(
        "target-count"
      ).value
    );

  state.settings.candidateCount =
    Number(
      document.getElementById(
        "candidate-count"
      ).value
    );

  state.settings.passCount =
    Number(
      document.getElementById(
        "pass-count"
      ).value
    );

  state.remainingPasses =
    state.settings.passCount;

  state.selectedSongIds = [];

  state.currentScreen =
    "draft";

  saveState();

  showScreen("draft");

  drawDraftScreen();

}

function drawDraftScreen() {

  generateCandidates();

  document
    .getElementById(
      "progress-text"
    )
    .textContent =
      `${state.selectedSongIds.length} / ${state.settings.targetCount} 曲`;

  document
    .getElementById(
      "pass-text"
    )
    .textContent =
      `残りパス：${state.remainingPasses}回`;

  document
    .getElementById(
      "pass-btn"
    )
    .disabled =
      state.remainingPasses <= 0;

  renderCandidates();

  updateSelectedSongs();

}

function generateCandidates() {

  const pool =
    state.availableSongs.filter(
      song =>
        !state.selectedSongIds.includes(
          song.id
        )
    );

  const candidateCount =
    Math.min(
      state.settings.candidateCount,
      pool.length
    );

  state.currentCandidates =
    shuffle(pool).slice(
      0,
      candidateCount
    );

}

function renderCandidates() {

  const container =
    document.getElementById(
      "candidate-list"
    );

  container.innerHTML = "";

  state.currentCandidates.forEach(
    song => {

      const card =
        document.createElement(
          "div"
        );

      card.className = "card";

      card.innerHTML = `
        <div class="song-title">
          ${song.title}
        </div>

        <div class="release">
          ${song.release}
        </div>

        <div class="badge ${getBadgeClass(song.category)}">
          ${formatCategory(song.category)}
        </div>

        <button
          class="select-song-btn"
        >
          選択
        </button>
      `;

      card
        .querySelector("button")
        .addEventListener(
          "click",
          () =>
            selectSong(song.id)
        );

      container.appendChild(card);

    }
  );

}

function selectSong(songId) {

  state.selectedSongIds.push(
    songId
  );

  saveState();

  if (
  state.selectedSongIds.length >=
  state.settings.targetCount
) {

  finishDraft();

  return;

}

  drawDraftScreen();

}

function updateSelectedSongs() {

  const songs =
    state.selectedSongIds.map(
      id =>
        state.songs.find(
          song =>
            song.id === id
        )
    );

  document
    .getElementById(
      "selected-summary"
    )
    .textContent =
      `選択済み楽曲（${songs.length}）`;

  document
    .getElementById(
      "selected-song-list"
    )
    .innerHTML =
      songs
        .map(
          song =>
            `<div>${song.title}</div>`
        )
        .join("");

}

function passCandidates() {

  if (
    state.remainingPasses <= 0
  ) {

    return;

  }

  state.remainingPasses--;

  saveState();

  drawDraftScreen();

}

function updateSongCount() {

  document
    .getElementById(
      "song-count"
    )
    .textContent =
      `対象楽曲数：${state.availableSongs.length}曲`;

  validateSettings();

}

function showScreen(
  screenName
) {

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(screen => {

      screen.classList.add(
        "hidden"
      );

    });

  document
    .getElementById(
      `${screenName}-screen`
    )
    .classList.remove(
      "hidden"
    );

}

function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}

function loadState() {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!data) {

    return false;

  }

  try {

    const parsed =
      JSON.parse(data);

    Object.assign(
      state,
      parsed
    );

    return true;

  } catch {

    return false;

  }

}

function renderByCurrentScreen() {

  showScreen(
    state.currentScreen
  );

  if (
    state.currentScreen ===
    "draft"
  ) {

    drawDraftScreen();

  }

  if (
    state.currentScreen ===
    "edit"
  ) {

    renderEditor();

  }

  if (
    state.currentScreen ===
    "result"
  ) {

    renderResult();

  }

}

function formatCategory(
  category
) {

  if (
    category === "なし"
  ) {

    return "通常C/W曲";

  }

  return category;

}

function getBadgeClass(category) {

  if (category === "表題曲") {
    return "badge-title";
  }

  if (category === "BACKS曲") {
    return "badge-backs";
  }

  if (category === "ユニット曲") {
    return "badge-unit";
  }

  if (
    category === "一期生曲" ||
    category === "二期生曲" ||
    category === "三期生曲" ||
    category === "四期生曲"
  ) {
    return "badge-generation";
  }

  if (category === "ソロ曲") {
    return "badge-solo";
  }

  return "badge-normal";

}

function shuffle(array) {

  const copied =
    [...array];

  for (
    let i = copied.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      copied[i],
      copied[j]
    ] = [
      copied[j],
      copied[i]
    ];

  }

  return copied;

}

// ======================
// Filter
// ======================

function initializeFilters() {

  const categories =
    [...new Set(
      state.songs.map(
        song => song.category
      )
    )];

  const releases =
    [...new Set(
      state.songs.map(
        song => song.release
      )
    )];

  state.filters.categories =
    [...categories];

  state.filters.releases =
    [...releases];

  renderCategoryFilters();

  renderReleaseFilters();

}

function renderCategoryFilters() {

  const container =
    document.getElementById(
      "category-filters"
    );

  container.innerHTML = "";

  const categories =
    [...new Set(
      state.songs.map(
        song => song.category
      )
    )];

  categories.forEach(category => {

    const label =
      document.createElement(
        "label"
      );

    label.innerHTML = `
      <input
        type="checkbox"
        value="${category}"
        checked
      >

      ${formatCategory(category)}
    `;

    label
      .querySelector("input")
      .addEventListener(
        "change",
        applyFilters
      );

    container.appendChild(label);

  });

}

function renderReleaseFilters() {

  const container =
    document.getElementById(
      "release-filters"
    );

  container.innerHTML = "";

  const releases =
    [...new Set(
      state.songs.map(
        song => song.release
      )
    )];

  releases.forEach(release => {

    const label =
      document.createElement(
        "label"
      );

    label.innerHTML = `
      <input
        type="checkbox"
        value="${release}"
        checked
      >

      ${release}
    `;

    label
      .querySelector("input")
      .addEventListener(
        "change",
        applyFilters
      );

    container.appendChild(label);

  });

}

function applyFilters() {

  state.filters.categories =
    [
      ...document
        .querySelectorAll(
          "#category-filters input:checked"
        )
    ]
      .map(input => input.value);

  state.filters.releases =
    [
      ...document
        .querySelectorAll(
          "#release-filters input:checked"
        )
    ]
      .map(input => input.value);

  state.availableSongs =
    state.songs.filter(song => {

      return (
        state.filters.categories.includes(
          song.category
        )
        &&
        state.filters.releases.includes(
          song.release
        )
      );

    });

  updateSongCount();

  validateSettings();

}

function validateSettings() {

  const targetCount =
    Number(
      document.getElementById(
        "target-count"
      ).value
    );

  const button =
    document.getElementById(
      "start-draft-btn"
    );

  const message =
    document.getElementById(
      "validation-message"
    );

  if (
    state.availableSongs.length <
    targetCount
  ) {

    message.textContent =
      "対象楽曲数が不足しています。フィルター設定または指名曲数を見直してください。";

    button.disabled = true;

    return;
  }

  message.textContent = "";

  button.disabled = false;

}

function selectAllCategories() {

  document
    .querySelectorAll(
      "#category-filters input"
    )
    .forEach(input => {

      input.checked = true;

    });

  applyFilters();

}

function clearAllCategories() {

  document
    .querySelectorAll(
      "#category-filters input"
    )
    .forEach(input => {

      input.checked = false;

    });

  applyFilters();

}

function selectAllReleases() {

  document
    .querySelectorAll(
      "#release-filters input"
    )
    .forEach(input => {

      input.checked = true;

    });

  applyFilters();

}

function clearAllReleases() {

  document
    .querySelectorAll(
      "#release-filters input"
    )
    .forEach(input => {

      input.checked = false;

    });

  applyFilters();

}

// ======================
// Draft End
// ======================

function finishDraft() {

  buildSetlistItems();

  state.currentScreen =
    "edit";

  saveState();

  showScreen("edit");

  renderEditor();

}

function buildSetlistItems() {

  state.setlistItems = [];

  state.setlistItems.push({
    type: "overture"
  });

  state.selectedSongIds.forEach(
    songId => {

      state.setlistItems.push({

        type: "song",

        songId

      });

    }
  );

  state.setlistItems.push({
    type: "mainEnd"
  });

}

function renderEditor() {

  const titleInput =
    document.getElementById(
      "live-title"
    );

  titleInput.value =
    state.liveTitle;

  const container =
    document.getElementById(
      "setlist-editor"
    );

  container.innerHTML = "";

  state.setlistItems.forEach(
    item => {

      container.appendChild(
        createEditorItem(item)
      );

    }
  );

  initializeSortable();

}

function createEditorItem(item) {

  const div =
    document.createElement(
      "div"
    );

  div.className =
  "setlist-item sortable-item";

  if (
    item.type === "overture"
  ) {

    div.dataset.type =
  "overture";

    div.classList.add(
  "fixed-item"
  );

    div.dataset.locked =
  "true";

    div.innerHTML =
  "<strong>00 Overture</strong>";

    return div;

  }

  if (
    item.type === "mainEnd"
  ) {

    div.dataset.type =
  "mainEnd";

    div.classList.add(
  "main-end-item"
   );

    div.innerHTML = `
  <span class="drag-handle">
    ☰
  </span>

  <strong>
    本編終了
  </strong>
`;

    return div;

  }

  if (
    item.type === "mc"
  ) {

　　div.classList.add(
  "mc-item"
　　);

    div.dataset.type =
  "mc";

    div.dataset.mcId =
  item.id;

    div.innerHTML = `
  <span class="drag-handle">
    ☰
  </span>

  <span>
    MC
  </span>

  <button
    data-id="${item.id}"
    class="delete-mc-btn"
  >
    ✕
  </button>
`;

    return div;

  }

  const song =
  state.songs.find(
    song =>
      song.id === item.songId
  );

div.dataset.type =
  "song";

div.dataset.songId =
  item.songId;

div.innerHTML = `
  <span class="drag-handle">
    ☰
  </span>

  <span>
    ${song.title}
  </span>
`;

  return div;

}

function addMC() {

  const count =
    state.setlistItems.filter(
      item =>
        item.type === "mc"
    ).length;

  if (count >= 5) {

    alert(
      "MCは5個までです"
    );

    return;

  }

  const index =
    state.setlistItems.findIndex(
      item =>
        item.type === "mainEnd"
    );

  state.setlistItems.splice(
    index,
    0,
    {
      type: "mc",
      id: crypto.randomUUID()
    }
  );

  saveState();

  renderEditor();

}

document.addEventListener(
  "click",
  event => {

    if (
      !event.target.classList.contains(
        "delete-mc-btn"
      )
    ) {
      return;
    }

    deleteMC(
      event.target.dataset.id
    );

  }
);

function deleteMC(id) {

  state.setlistItems =
    state.setlistItems.filter(
      item =>
        item.id !== id
    );

  saveState();

  renderEditor();

}

document.addEventListener(
  "input",
  event => {

    if (
      event.target.id !==
      "live-title"
    ) {
      return;
    }

    state.liveTitle =
      event.target.value;

    saveState();

  }
);

function createResult() {

  state.currentScreen =
    "result";

  saveState();

  showScreen("result");

  renderResult();

}

// ======================
// Result Screen
// ======================

function renderResult() {

  document
    .getElementById(
      "result-title"
    )
    .textContent =
      state.liveTitle ||
      "無題ライブ";

  document
    .getElementById(
      "result-setlist"
    )
    .innerHTML =
      buildResultHtml();

}

function buildResultHtml() {

  let number = 1;

  return state.setlistItems
    .map(item => {

      if (
        item.type === "overture"
      ) {

        return `
        <div>
         <strong>
          00 Overture
         </strong>
        </div>
        `;

      }

      if (
        item.type === "mainEnd"
      ) {

        return `
        <br>

         <div
           style="
            text-align:center;
            color:#777;
          "
       >
        ───── アンコール ─────
       </div>

       <br>
     `;


      }

      if (
        item.type === "mc"
      ) {

        return `
          <div>
            MC
          </div>
        `;

      }

      const song =
        state.songs.find(
          song =>
            song.id === item.songId
        );

      const current =
        String(number)
          .padStart(2, "0");

      number++;

      return `
       <div>
        <strong>
          ${current}
          ${song.title}
        </strong>
       </div>
      `;

    })
    .join("");

}

function backToEdit() {

  state.currentScreen =
    "edit";

  saveState();

  showScreen("edit");

  renderEditor();

}

function restartApp() {

  if (
    !confirm(
      "最初からやり直しますか？"
    )
  ) {
    return;
  }

  localStorage.removeItem(
    STORAGE_KEY
  );

  location.reload();

}

async function saveAsImage() {

  const element =
    document.getElementById(
      "export-area"
    );

  const canvas =
    await html2canvas(
      element,
      {
        backgroundColor:
          "#ffffff",
        scale: 2
      }
    );

  const link =
    document.createElement(
      "a"
    );

  link.download =
    "setlist.png";

  link.href =
    canvas.toDataURL(
      "image/png"
    );

  link.click();

}

function initializeSortable() {

  const container =
    document.getElementById(
      "setlist-editor"
    );

  if (
    !container
  ) {
    return;
  }

  if (
    container.sortableInstance
  ) {

    container.sortableInstance.destroy();

  }

  container.sortableInstance =
    Sortable.create(
      container,
      {

        animation: 150,

        handle: ".drag-handle",

        ghostClass:
          "sortable-ghost",

        filter:
          ".fixed-item",

        onMove(evt) {

          if (
            evt.dragged.dataset.locked
          ) {

            return false;

          }

          return true;

        },

        onEnd() {

          saveEditorOrder();

        }

      }
    );

}

function saveEditorOrder() {

  const elements =
    [
      ...document.querySelectorAll(
        "#setlist-editor .setlist-item"
      )
    ];

  const newItems = [];

  elements.forEach(
    element => {

      const type =
        element.dataset.type;

      if (
        type === "overture"
      ) {

        newItems.push({
          type: "overture"
        });

        return;

      }

      if (
        type === "mainEnd"
      ) {

        newItems.push({
          type: "mainEnd"
        });

        return;

      }

      if (
        type === "mc"
      ) {

        newItems.push({

          type: "mc",

          id:
            element.dataset.mcId

        });

        return;

      }

      if (
        type === "song"
      ) {

        newItems.push({

          type: "song",

          songId:
            Number(
              element.dataset.songId
            )

        });

      }

    }
  );

  state.setlistItems =
    newItems;

  saveState();

}