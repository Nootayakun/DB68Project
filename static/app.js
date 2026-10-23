// ============================================================
//  app.js  —  ตรรกะหน้าเว็บ (ทำให้เสร็จแล้ว ★ นิสิตไม่ต้องแก้)
//  ปรับช่องค้นหา/ฟอร์มได้ที่ตัวแปร ENTITIES ด้านล่าง
// ============================================================
// ฟอร์มการจองรับชื่อคลาส แล้วจับคู่เป็น class_id ก่อนส่งให้ API
const ENTITIES = {
  "members": {
    "label": "สมาชิก",
    "api": "/api/members",
    "idKey": "member_id",
    "search": [
      {
        "key": "name",
        "label": "ชื่อ",
        "type": "text"
      },
      {
        "key": "gender",
        "label": "เพศ",
        "type": "select",
        "options": [
          "",
          "Male",
          "Female"
        ]
      },
      {
        "key": "package_type",
        "label": "แพ็กเกจ",
        "type": "select",
        "options": [
          "",
          "basic",
          "premium"
        ]
      }
    ],
    "form": [
      {
        "key": "name",
        "label": "ชื่อ",
        "type": "text"
      },
      {
        "key": "gender",
        "label": "เพศ",
        "type": "select",
        "options": [
          "Male",
          "Female"
        ]
      },
      {
        "key": "join_date",
        "label": "วันที่สมัคร",
        "type": "date"
      },
      {
        "key": "package_type",
        "label": "แพ็กเกจ",
        "type": "select",
        "options": [
          "basic",
          "premium"
        ]
      }
    ]
  },
  "classes": {
    "label": "คลาสเรียน",
    "api": "/api/classes",
    "idKey": "class_id",
    "search": [
      {
        "key": "name",
        "label": "ชื่อคลาส",
        "type": "text"
      },
      {
        "key": "room",
        "label": "ห้อง",
        "type": "text"
      },
      {
        "key": "trainer_id",
        "label": "เทรนเนอร์",
        "type": "select",
        "optionsFrom": {
          "api": "/api/trainers",
          "value": "trainer_id",
          "label": "name"
        }
      }
    ],
    "form": [
      {
        "key": "name",
        "label": "ชื่อคลาส",
        "type": "text"
      },
      {
        "key": "trainer_id",
        "label": "เทรนเนอร์",
        "type": "select",
        "required": true,
        "optionsFrom": {
          "api": "/api/trainers",
          "value": "trainer_id",
          "label": "name"
        }
      },
      {
        "key": "room",
        "label": "ห้อง",
        "type": "text"
      },
      {
        "key": "capacity",
        "label": "จำนวนรับ",
        "type": "number"
      },
      {
        "key": "schedule_time",
        "label": "วันและเวลาเรียน (พิมพ์เวลา เช่น 15:00)",
        "type": "datetime-manual",
        "required": true
      }
    ]
  },
  "bookings": {
    "label": "การจอง",
    "api": "/api/bookings",
    "idKey": "booking_id",
    "search": [
      {
        "key": "member_id",
        "label": "รหัสสมาชิก",
        "type": "number"
      },
      {
        "key": "class_id",
        "label": "รหัสคลาส",
        "type": "number"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          "",
          "booked",
          "cancelled"
        ]
      }
    ],
    "form": [
      {
        "key": "member_id",
        "label": "รหัสสมาชิก",
        "type": "number"
      },
      {
        "key": "equip_id",
        "label": "เลือกอุปกรณ์ (ไม่บังคับ)",
        "type": "select",
        "filterOnly": true,
        "includeEmpty": true,
        "placeholder": "-- ทุกอุปกรณ์ --",
        "optionsFrom": {
          "api": "/api/equipment-options",
          "value": "equip_id",
          "label": "name"
        }
      },
      {
        "key": "class_name",
        "label": "ชื่อคลาส",
        "type": "text",
        "required": true
      },
      {
        "key": "book_date",
        "label": "วันที่จอง",
        "type": "date"
      },
      {
        "key": "status",
        "label": "สถานะ",
        "type": "select",
        "options": [
          "booked",
          "cancelled"
        ]
      }
    ]
  },
  "trainers": {
    "label": "เทรนเนอร์",
    "api": "/api/trainers",
    "idKey": "trainer_id",
    "search": [
      {
        "key": "name",
        "label": "ชื่อเทรนเนอร์",
        "type": "text"
      },
      {
        "key": "specialty",
        "label": "ความเชี่ยวชาญ",
        "type": "select",
        "uniqueOptions": true,
        "optionsFrom": {
          "api": "/api/trainers",
          "value": "specialty",
          "label": "specialty"
        }
      }
    ],
    "form": [
      {
        "key": "name",
        "label": "ชื่อเทรนเนอร์",
        "type": "text"
      },
      {
        "key": "specialty",
        "label": "ความเชี่ยวชาญ",
        "type": "text"
      },
      {
        "key": "phone",
        "label": "เบอร์โทรศัพท์",
        "type": "tel"
      }
    ]
  },
  "payments": {
    "label": "ชำระเงิน",
    "api": "/api/payments",
    "idKey": "payment_id",
    "search": [
      {
        "key": "member_id",
        "label": "สมาชิก",
        "type": "select",
        "optionsFrom": {
          "api": "/api/members",
          "value": "member_id",
          "label": "name"
        }
      },
      {
        "key": "payment_method",
        "label": "วิธีชำระ",
        "type": "select",
        "options": [
          {
            "value": "",
            "label": "ทั้งหมด"
          },
          {
            "value": "cash",
            "label": "เงินสด"
          },
          {
            "value": "transfer",
            "label": "โอนเงิน"
          },
          {
            "value": "card",
            "label": "บัตร"
          }
        ]
      }
    ],
    "form": [
      {
        "key": "member_id",
        "label": "สมาชิก",
        "type": "select",
        "optionsFrom": {
          "api": "/api/members",
          "value": "member_id",
          "label": "name"
        }
      },
      {
        "key": "amount",
        "label": "จำนวนเงิน",
        "type": "number"
      },
      {
        "key": "payment_method",
        "label": "วิธีชำระ",
        "type": "select",
        "options": [
          {
            "value": "cash",
            "label": "เงินสด"
          },
          {
            "value": "transfer",
            "label": "โอนเงิน"
          },
          {
            "value": "card",
            "label": "บัตร"
          }
        ]
      },
      {
        "key": "paid_at",
        "label": "วันที่ชำระ",
        "type": "date"
      },
      {
        "key": "note",
        "label": "หมายเหตุ",
        "type": "text"
      }
    ]
  }
};

const COLUMN_LABELS = {
  member_id: "รหัสสมาชิก",
  trainer_id: "รหัสเทรนเนอร์",
  name: "ชื่อ",
  trainer_name: "ชื่อเทรนเนอร์",
  gender: "เพศ",
  specialty: "ความเชี่ยวชาญ",
  phone: "เบอร์โทรศัพท์",
  join_date: "วันที่สมัคร",
  package_type: "แพ็กเกจ",
  class_id: "รหัสคลาส",
  trainer_id: "รหัสเทรนเนอร์",
  room: "ห้อง",
  capacity: "จำนวนรับ",
  schedule_time: "เวลาเรียน",
  seats_left: "ที่นั่งคงเหลือ",
  booking_id: "รหัสการจอง",
  book_date: "วันที่จอง",
  member_name: "ชื่อสมาชิก",
  class_name: "ชื่อคลาส",
  status: "สถานะ",
  payment_id: "รหัสชำระเงิน",
  amount: "จำนวนเงิน",
  payment_method: "วิธีชำระ",
  cash: "เงินสด",
  transfer: "โอนเงิน",
  card: "บัตร",
  paid_at: "วันที่ชำระ",
  note: "หมายเหตุ"
};

let current = Object.keys(ENTITIES)[0];
let editingId = null;
let bookingClasses = [];
const $ = (s) => document.querySelector(s);
function setStatus(el, msg, cls = "") { el.className = "status " + cls; el.textContent = msg; }
async function api(url, opts) { const res = await fetch(url, opts); return res.json(); }

function fieldHtml(f, prefix, value = "") {
  if (f.type === "heading") return '<div class="form-section">' + f.label + '</div>';
  let input;
  if (f.type === "datetime-manual") {
    const normalizedValue = String(value ?? "").replace("T", " ");
    const dateValue = normalizedValue ? normalizedValue.slice(0, 10) : "";
    const timeValue = normalizedValue.length >= 16 ? normalizedValue.slice(11, 16) : "";
    input = '<input id="' + prefix + f.key + '_date" type="date" value="' + dateValue + '"' +
      (f.required ? " required" : "") + '> ' +
      '<input id="' + prefix + f.key + '_time" type="text" value="' + timeValue +
      '" placeholder="เช่น 15:00" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" maxlength="5"' +
      (f.required ? " required" : "") + '>';
  } else if (f.type === "select") {
    // options เป็นข้อความ "a" หรือ {value, label} ก็ได้
    input = '<select id="' + prefix + f.key + '"' + (f.required ? " required" : "") + '>' +
      f.options.map(o => {
        const v = typeof o === "object" ? o.value : o;
        const t = typeof o === "object" ? o.label : (o || "ทั้งหมด");
        return '<option value="' + v + '"' + (String(v) === String(value ?? "") ? " selected" : "") + '>' + t + '</option>';
      }).join("") + '</select>';
  } else {
    let inputValue = value ?? "";
    if (f.type === "date" && value) inputValue = String(value).slice(0, 10);
    if (f.type === "datetime-local" && value) inputValue = String(value).replace(" ", "T").slice(0, 16);
    input = '<input id="' + prefix + f.key + '" type="' + f.type + '"' +
      (f.required ? " required" : "") + ' value="' + inputValue + '">';
  }
  return '<div class="field"><label>' + f.label + '</label>' + input + '</div>';
}
// ช่อง select ที่มี optionsFrom → ดึงตัวเลือกจาก API (เช่น รายชื่อหมวดหมู่จากฐานข้อมูล)
async function loadOptions(fields, forSearch) {
  for (const f of fields.filter(f => f.optionsFrom)) {
    const src = f.optionsFrom, r = await api(src.api);
    f.options = r.ok ? (r.data || []).map(row => ({ value: row[src.value], label: row[src.label] }))
                     : [{ value: "", label: (r.todo ? "🚧 " : "⚠️ ") + r.error }];
    if (r.ok && f.uniqueOptions) {
      const seen = new Set();
      f.options = f.options.filter(option => {
        if (option.value == null || option.value === "" || seen.has(String(option.value))) return false;
        seen.add(String(option.value));
        return true;
      });
    }
    if (forSearch && r.ok) f.options.unshift({ value: "", label: "ทั้งหมด" });
    else if (f.required && r.ok) f.options.unshift({ value: "", label: f.placeholder || "-- เลือก --" });
    else if (f.includeEmpty && r.ok) f.options.unshift({ value: "", label: f.placeholder || "ไม่ระบุ" });
  }
}
// ช่องในฟอร์มที่ใช้อยู่ตอนนี้ (ช่อง editOnly แสดงเฉพาะตอนแก้ไข)
function formFields() { return ENTITIES[current].form.filter(f => !f.editOnly || editingId !== null); }
async function buildSearch() {
  const cfg = ENTITIES[current];
  await loadOptions(cfg.search, true);
  if (cfg !== ENTITIES[current]) return;   // ผู้ใช้เปลี่ยนแท็บระหว่างรอ
  $("#searchTitle").textContent = cfg.label;
  $("#searchFields").innerHTML = cfg.search.map(f => fieldHtml(f, "s_")).join("");
}
async function doSearch() {
  const cfg = ENTITIES[current];
  const params = new URLSearchParams();
  cfg.search.forEach(f => { const v = $("#s_" + f.key).value; if (v) params.append(f.key, v); });
  setStatus($("#status"), "กำลังค้นหา...");
  renderTable(await api(cfg.api + "?" + params.toString()));
}
function renderTable(r) {
  const head = $("#tableHead"), body = $("#tableBody"), st = $("#status");
  head.innerHTML = ""; body.innerHTML = "";
  if (!r.ok) { setStatus(st, (r.todo ? "🚧 " : "⚠️ ") + r.error, r.todo ? "todo" : "err"); return; }
  const rows = r.data || [];
  if (rows.length === 0) { setStatus(st, "ไม่พบข้อมูล"); return; }
  setStatus(st, "พบ " + rows.length + " รายการ");
  const cols = Object.keys(rows[0]);
  head.innerHTML = cols.map(c => "<th>" + (COLUMN_LABELS[c] || c) + "</th>").join("") + "<th>จัดการ</th>";
  body.innerHTML = rows.map(row => {
    const id = row[ENTITIES[current].idKey];
    return "<tr>" + cols.map(c => {
      const value = c === "payment_method"
        ? ({ cash: "เงินสด", transfer: "โอนเงิน", card: "บัตร" }[row[c]] || row[c])
        : row[c];
      return "<td>" + (value ?? "—") + "</td>";
    }).join("") +
      '<td><button class="btn sm" onclick="editRow(' + id + ')">แก้ไข</button> ' +
      '<button class="btn sm del" onclick="deleteRow(' + id + ')">ลบ</button></td></tr>';
  }).join("");
}
async function openForm(title, data = {}) {
  await loadOptions(formFields(), false);
  $("#modalTitle").textContent = title;
  $("#formFields").innerHTML = formFields().map(f => fieldHtml(f, "f_", data[f.key])).join("");
  $("#modal").classList.remove("hidden");
  if (current === "bookings") {
    $("#f_equip_id").addEventListener("change", () => loadBookingClasses());
    await loadBookingClasses();
    const existingClass = bookingClasses.find(gymClass => String(gymClass.class_id) === String(data.class_id));
    if (existingClass) $("#f_class_name").value = existingClass.name;
  }
}
async function loadBookingClasses() {
  const params = new URLSearchParams();
  const equipmentId = $("#f_equip_id").value;
  if (equipmentId) params.set("equip_id", equipmentId);
  const query = params.toString();
  const result = await api("/api/classes" + (query ? "?" + query : ""));
  if (!result.ok) {
    alert((result.todo ? "🚧 " : "⚠️ ") + result.error);
    bookingClasses = [];
    return null;
  }
  bookingClasses = result.data || [];
  return bookingClasses;
}
function collectForm() {
  const d = {};
  formFields().filter(f => f.key && !f.filterOnly).forEach(f => {
    let value;
    if (f.type === "datetime-manual") {
      const date = $("#f_" + f.key + "_date");
      const time = $("#f_" + f.key + "_time");
      if (!date.checkValidity() || !time.checkValidity()) {
        date.reportValidity();
        time.reportValidity();
        return;
      }
      value = date.value && time.value ? date.value + " " + time.value + ":00" : "";
    } else {
      value = $("#f_" + f.key).value;
    }
    d[f.key] = value;
  });
  if (formFields().some(f => f.type === "datetime-manual") && !d.schedule_time) return null;
  return d;
}
async function editRow(id) {
  const cfg = ENTITIES[current];
  const r = await api(cfg.api + "/" + id);
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  editingId = id; openForm("แก้ไขข้อมูล", r.data);
}
async function deleteRow(id) {
  if (!confirm("ยืนยันการลบ?")) return;
  const r = await api(ENTITIES[current].api + "/" + id, { method: "DELETE" });
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  doSearch();
}
async function save() {
  const cfg = ENTITIES[current], data = collectForm();
  if (!data) return;
  if (current === "bookings") {
    const classes = await loadBookingClasses();
    if (!classes) return;
    const className = data.class_name.trim().toLocaleLowerCase();
    const matches = classes.filter(gymClass =>
      String(gymClass.name).trim().toLocaleLowerCase() === className
    );
    if (matches.length === 0) {
      alert("ไม่พบคลาสชื่อนี้ กรุณาพิมพ์ชื่อคลาสให้ตรงกับชื่อในระบบ");
      return;
    }
    if (matches.length > 1) {
      alert("มีคลาสชื่อนี้หลายรายการ กรุณาเปลี่ยนชื่อคลาสให้ไม่ซ้ำในเมนูคลาสเรียนก่อนจอง");
      return;
    }
    data.class_id = matches[0].class_id;
    delete data.class_name;
  }
  const opts = { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  const r = await api(editingId ? cfg.api + "/" + editingId : cfg.api, opts);
  if (!r.ok) { alert((r.todo ? "🚧 " : "⚠️ ") + r.error); return; }
  $("#modal").classList.add("hidden"); doSearch();
}
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); current = t.dataset.entity;
  buildSearch(); $("#tableHead").innerHTML = ""; $("#tableBody").innerHTML = "";
  setStatus($("#status"), 'กด "ค้นหา" เพื่อแสดงข้อมูล');
}));
$("#btnSearch").onclick = doSearch;
$("#btnClear").onclick = () => buildSearch();
$("#btnAdd").onclick = () => { editingId = null; openForm("เพิ่มข้อมูลใหม่"); };
$("#btnSave").onclick = save;
$("#btnCancel").onclick = () => $("#modal").classList.add("hidden");
buildSearch();
setStatus($("#status"), 'กด "ค้นหา" เพื่อแสดงข้อมูล');
