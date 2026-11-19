"use strict";

var STORAGE_KEY = "leonida-legend-v1";
var DATA_URL = "data/trophies.json";

var trophies = [];
var state = loadState();
var filters = { search: "", grade: "all", kind: "all", hideEarned: false };

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, counts: {}, hideSpoilers: true };
    var parsed = JSON.parse(raw);
    return {
      earned: parsed.earned || {},
      counts: parsed.counts || {},
      hideSpoilers: parsed.hideSpoilers !== false
    };
  } catch (err) {
    return { earned: {}, counts: {}, hideSpoilers: true };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    /* storage full or unavailable: progress stays in memory for this session */
  }
}

function el(id) { return document.getElementById(id); }

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gradeLabel(grade) {
  if (grade === "platinum") return "Platinum";
  if (grade === "gold") return "Gold";
  if (grade === "silver") return "Silver";
  return "Bronze";
}

function gradeSymbol(grade) {
  if (grade === "platinum") return "P";
  if (grade === "gold") return "G";
  if (grade === "silver") return "S";
  return "B";
}

function kindLabel(kind) {
  if (kind === "story") return "Story";
  if (kind === "collectibles") return "Collectibles";
  if (kind === "activities") return "Activities";
  if (kind === "missable") return "Missable";
  return kind;
}

function isSpoilerHidden(trophy) {
  return state.hideSpoilers && trophy.hidden && trophy.kind === "story" && !state.earned[trophy.id];
}

function earnedCount() {
  return trophies.filter(function (t) { return state.earned[t.id]; }).length;
}

function renderProgress() {
  var earned = earnedCount();
  var total = trophies.length || 55;
  var pct = total ? Math.round((earned / total) * 100) : 0;
  el("earnedCount").textContent = String(earned);
  el("pctLabel").textContent = pct + "% to platinum";
  el("progressFill").style.width = pct + "%";
  el("progressBar").setAttribute("aria-valuenow", String(pct));
  var grades = ["platinum", "gold", "silver", "bronze"];
  el("gradeCounts").innerHTML = grades.map(function (g) {
    var totalG = trophies.filter(function (t) { return t.grade === g; }).length;
    var earnedG = trophies.filter(function (t) { return t.grade === g && state.earned[t.id]; }).length;
    return '<span><span class="dot ' + g + '"></span>' + gradeLabel(g) + ' <b>' + earnedG + '/' + totalG + '</b></span>';
  }).join("");

  document.querySelectorAll("#roadmapList li").forEach(function (li) {
    var ids = (li.getAttribute("data-stage-trophies") || "").split(",").map(function (s) { return Number(s); });
    var done = ids.length > 0 && ids.every(function (id) { return state.earned[id]; });
    var badge = li.querySelector(".stage-done");
    if (badge) badge.hidden = !done;
  });
}

function trophyMatches(trophy) {
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  if (filters.kind === "missable") {
    if (!trophy.missable) return false;
  } else if (filters.kind !== "all" && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.hideEarned && state.earned[trophy.id]) return false;
  if (filters.search) {
    var q = filters.search.toLowerCase();
    var hay = (trophy.name + " " + trophy.description + " " + trophy.guide).toLowerCase();
    if (hay.indexOf(q) === -1) return false;
  }
  return true;
}

function renderList() {
  var list = el("trophyList");
  var visible = trophies.filter(trophyMatches);
  el("resultLine").innerHTML = "Showing <b>" + visible.length + "</b> of <b>" + trophies.length + "</b> trophies. <b>" + earnedCount() + "</b> earned.";
  el("emptyState").hidden = visible.length !== 0;

  list.innerHTML = visible.map(function (trophy) {
    var earned = !!state.earned[trophy.id];
    var spoiler = isSpoilerHidden(trophy);
    var name = spoiler ? "Hidden Trophy" : trophy.name;
    var desc = spoiler
      ? "Hidden story trophy. Earn it on your PS5 to reveal its name and description."
      : trophy.description;
    var count = state.counts[trophy.id] || 0;
    var target = trophy.target;
    var counterHtml = "";
    if (target) {
      var reached = count >= target;
      counterHtml = '<div class="counter">' +
        '<label>Your count: <input type="number" min="0" max="' + target + '" value="' + count + '" data-count-for="' + trophy.id + '" aria-label="Your count for ' + escapeHtml(trophy.name) + '"></label>' +
        '<button type="button" data-add-one="' + trophy.id + '">Add 1</button>' +
        '<span>' + count + ' / ' + target.toLocaleString("en-US") + (reached ? " target reached, tick it off when it pops" : "") + '</span>' +
        '</div>';
    }
    var guideHtml;
    if (spoiler) {
      guideHtml = '<div class="spoiler-note">Spoilers are hidden. Turn off "Hide story spoilers" above, or tick this trophy as earned, to read its guide.</div>';
    } else {
      var sources = (trophy.sources || []).map(function (s) {
        return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a>';
      }).join("");
      guideHtml = '<p>' + escapeHtml(trophy.guide) + '</p>' +
        '<p class="sources">Sources: ' + sources + '</p>';
    }
    var missableHtml = trophy.missable
      ? '<div class="warn">Missable: this is the only confirmed missable trophy. Meditate at the Chapter 1 balcony spot before the chapter ends.</div>'
      : "";
    return '<li class="card' + (earned ? " earned" : "") + (trophy.missable ? " missable-card" : "") + '" data-id="' + trophy.id + '">' +
      '<div class="card-head">' +
      '<span class="medal ' + trophy.grade + '" title="' + gradeLabel(trophy.grade) + '">' + gradeSymbol(trophy.grade) + '</span>' +
      '<div class="card-main">' +
      '<h3>' + escapeHtml(name) + (trophy.hidden && !spoiler ? ' <span class="hidden-tag">(hidden on PSN)</span>' : "") + '</h3>' +
      '<p class="card-desc official">' + escapeHtml(desc) + '</p>' +
      '<div class="tags">' +
      '<span class="tag">' + gradeLabel(trophy.grade) + '</span>' +
      '<span class="tag kind-' + trophy.kind + '">' + kindLabel(trophy.kind) + '</span>' +
      (trophy.hidden ? '<span class="tag hidden-tag">Hidden</span>' : "") +
      (target ? '<span class="tag target-tag">Target: ' + target.toLocaleString("en-US") + '</span>' : "") +
      '</div>' +
      counterHtml +
      missableHtml +
      '<details class="guide"><summary>Guide and sources</summary>' + guideHtml + '</details>' +
      '</div>' +
      '<div class="earn"><label><input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? " checked" : "") + '> Earned</label></div>' +
      '</div>' +
      '</li>';
  }).join("");

  renderProgress();
}

function exportProgress() {
  var payload = {
    app: "leonida-legend",
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).filter(function (id) { return state.earned[id]; }).map(Number).sort(function (a, b) { return a - b; }),
    counts: state.counts,
    hideSpoilers: state.hideSpoilers
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "leonida-legend-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function importProgress(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(String(reader.result));
      var earnedIds = data.earned || data.trophies || [];
      var next = { earned: {}, counts: {}, hideSpoilers: state.hideSpoilers };
      if (Array.isArray(earnedIds)) {
        earnedIds.forEach(function (id) {
          var n = Number(id);
          if (trophies.some(function (t) { return t.id === n; })) next.earned[n] = true;
        });
      } else if (earnedIds && typeof earnedIds === "object") {
        Object.keys(earnedIds).forEach(function (id) {
          if (earnedIds[id]) next.earned[Number(id)] = true;
        });
      }
      if (data.counts && typeof data.counts === "object") {
        Object.keys(data.counts).forEach(function (id) {
          var n = Number(data.counts[id]);
          if (Number.isFinite(n) && n >= 0) next.counts[Number(id)] = n;
        });
      }
      if (typeof data.hideSpoilers === "boolean") next.hideSpoilers = data.hideSpoilers;
      state = next;
      saveState();
      syncControls();
      renderList();
    } catch (err) {
      alert("That file is not a valid Leonida Legend progress export.");
    }
  };
  reader.readAsText(file);
}

function syncControls() {
  el("spoilerToggle").checked = state.hideSpoilers;
  el("hideEarned").checked = filters.hideEarned;
}

function bindEvents() {
  el("search").addEventListener("input", function (e) {
    filters.search = e.target.value.trim();
    renderList();
  });
  el("gradeFilter").addEventListener("change", function (e) {
    filters.grade = e.target.value;
    renderList();
  });
  el("kindChips").addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    filters.kind = btn.getAttribute("data-kind");
    document.querySelectorAll("#kindChips .chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c === btn));
    });
    renderList();
  });
  el("hideEarned").addEventListener("change", function (e) {
    filters.hideEarned = e.target.checked;
    renderList();
  });
  el("spoilerToggle").addEventListener("change", function (e) {
    state.hideSpoilers = e.target.checked;
    saveState();
    renderList();
  });
  el("exportBtn").addEventListener("click", exportProgress);
  el("importBtn").addEventListener("click", function () { el("importFile").click(); });
  el("importFile").addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  el("resetBtn").addEventListener("click", function () {
    if (!window.confirm("Reset all progress? This clears every ticked trophy and counter.")) return;
    state = { earned: {}, counts: {}, hideSpoilers: state.hideSpoilers };
    saveState();
    renderList();
  });
  document.querySelectorAll("nav.tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("nav.tabs button").forEach(function (b) {
        b.setAttribute("aria-selected", String(b === btn));
      });
      var target = document.getElementById(btn.getAttribute("data-goto"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  el("trophyList").addEventListener("change", function (e) {
    var earnBox = e.target.closest("[data-earn]");
    if (earnBox) {
      var id = Number(earnBox.getAttribute("data-earn"));
      state.earned[id] = earnBox.checked;
      if (!earnBox.checked) delete state.earned[id];
      saveState();
      renderList();
      return;
    }
    var countInput = e.target.closest("[data-count-for]");
    if (countInput) {
      var cid = Number(countInput.getAttribute("data-count-for"));
      var value = Math.max(0, Number(countInput.value) || 0);
      var trophy = trophies.find(function (t) { return t.id === cid; });
      if (trophy && trophy.target) value = Math.min(value, trophy.target);
      state.counts[cid] = value;
      saveState();
      renderList();
    }
  });
  el("trophyList").addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add-one]");
    if (!addBtn) return;
    var id = Number(addBtn.getAttribute("data-add-one"));
    var trophy = trophies.find(function (t) { return t.id === id; });
    var current = state.counts[id] || 0;
    var next = trophy && trophy.target ? Math.min(current + 1, trophy.target) : current + 1;
    state.counts[id] = next;
    saveState();
    renderList();
  });
}

function init() {
  bindEvents();
  syncControls();
  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load trophy data");
      return res.json();
    })
    .then(function (data) {
      trophies = data.trophies || data;
      renderList();
    })
    .catch(function () {
      el("trophyList").innerHTML = '<li class="card"><p>Could not load the trophy data. Check that data/trophies.json is present next to this page.</p></li>';
    });
}

document.addEventListener("DOMContentLoaded", init);
