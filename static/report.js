// ============================================================
//  report.js  —  ตรรกะหน้ารายงาน (ทำให้เสร็จแล้ว ★)
// ============================================================
const $ = (s) => document.querySelector(s);
async function api(url) { return (await fetch(url)).json(); }
function fillTable(tableSel, statusSel, r) {
  const t = $(tableSel), st = $(statusSel);
  const thead = t.querySelector("thead"), tbody = t.querySelector("tbody");
  thead.innerHTML = ""; tbody.innerHTML = "";
  if (!r.ok) { st.className = "status " + (r.todo ? "todo" : "err"); st.textContent = (r.todo ? "🚧 " : "⚠️ ") + r.error; return; }
  const rows = r.data || [];
  if (!rows.length) { st.className = "status"; st.textContent = "ไม่มีข้อมูล"; return; }
  st.textContent = "";
  const cols = Object.keys(rows[0]);
  thead.innerHTML = "<tr>" + cols.map(c => "<th>" + c + "</th>").join("") + "</tr>";
  tbody.innerHTML = rows.map(row => "<tr>" + cols.map(c => "<td>" + (row[c] ?? "—") + "</td>").join("") + "</tr>").join("");
}
async function loadSummary() {
  // report_summary() คืน dict {ชื่อการ์ด: ตัวเลข} → 1 คีย์ = 1 การ์ด
  const r = await api("/api/reports/summary");
  const box = $("#summary");
  if (!r.ok) { box.innerHTML = '<div style="grid-column:1/-1" class="status ' + (r.todo ? "todo" : "err") + '">' + (r.todo ? "🚧 " : "⚠️ ") + r.error + '</div>'; return; }
  box.innerHTML = Object.entries(r.data || {}).map(([label, num]) =>
    '<div class="metric"><div class="metric-num">' + (num ?? "—") + '</div><div class="metric-label">' + label + '</div></div>').join("");
}
async function loadAll() {
  loadSummary();
  // สร้างกล่องรายงานตามรายการ REPORTS ใน db.py
  const list = await api("/api/reports");
  for (const rep of (list.data || [])) {
    const id = "rep_" + rep.key.replace(/\W/g, "_");
    const sec = document.createElement("section");
    sec.className = "card";
    sec.innerHTML = '<h3>' + rep.title + '</h3>' +
      (rep.key === "class-equipment"
        ? '<label for="classEquipmentFilter">เลือกคลาส: </label><select class="report-filter" id="classEquipmentFilter"><option value="">ทุกคลาส</option></select>'
        : '') +
      '<div id="' + id + '_status" class="status"></div>' +
      '<div class="table-wrap"><table id="' + id + '_table"><thead></thead><tbody></tbody></table></div>';
    $("#reports").appendChild(sec);
    const reportUrl = "/api/reports/" + rep.key;
    if (rep.key === "class-equipment") {
      const classes = await api("/api/classes");
      if (!classes.ok) {
        fillTable("#" + id + "_table", "#" + id + "_status", classes);
        continue;
      }
      const filter = $("#classEquipmentFilter");
      for (const gymClass of classes.data || []) {
        const option = document.createElement("option");
        option.value = gymClass.class_id;
        option.textContent = gymClass.name;
        filter.appendChild(option);
      }
      filter.onchange = async () => {
        const params = new URLSearchParams();
        if (filter.value) params.set("class_id", filter.value);
        const query = params.toString();
        fillTable("#" + id + "_table", "#" + id + "_status",
          await api(reportUrl + (query ? "?" + query : "")));
      };
    }
    fillTable("#" + id + "_table", "#" + id + "_status", await api(reportUrl));
  }
}
loadAll();
