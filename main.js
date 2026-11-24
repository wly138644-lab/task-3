"use strict";

/* ========== الخطوة 2: كلاس Student مع التغليف وحارس الأمان ========== */
class Student {
  #name;
  #grade1;
  #grade2;
  #grade3;
  #attendance;

  constructor(name, grade1, grade2, grade3, attendance) {
    this.name = name;
    this.grade1 = grade1;
    this.grade2 = grade2;
    this.grade3 = grade3;
    this.attendance = attendance;
  }

  // دالة مساعدة خاصة: تتحقق من أن القيمة رقم بين 0 و 100
  static #validateScore(value, label) {
    if (value === null || value === undefined || String(value).trim() === "") {
      throw new Error(`حقل "${label}" فارغ، الرجاء إدخال قيمة.`);
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`حقل "${label}" يجب أن يكون رقماً صحيحاً.`);
    }
    if (num < 0 || num > 100) {
      throw new Error(`قيمة "${label}" يجب أن تكون بين 0 و 100.`);
    }
    return num;
  }

  get name() { return this.#name; }
  set name(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
      throw new Error('حقل "اسم الطالب" فارغ، الرجاء إدخال الاسم.');
    }
    this.#name = String(value).trim();
  }

  get grade1() { return this.#grade1; }
  set grade1(value) { this.#grade1 = Student.#validateScore(value, "درجة المادة 1"); }

  get grade2() { return this.#grade2; }
  set grade2(value) { this.#grade2 = Student.#validateScore(value, "درجة المادة 2"); }

  get grade3() { return this.#grade3; }
  set grade3(value) { this.#grade3 = Student.#validateScore(value, "درجة المادة 3"); }

  get attendance() { return this.#attendance; }
  set attendance(value) { this.#attendance = Student.#validateScore(value, "نسبة الحضور"); }

  get average() {
    return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
  }
}

/* ========== الخطوة 3: DOM وسلة الطلاب ========== */
const studentsList = [];

const nameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const addBtn = document.getElementById("addBtn");
const committeeBtn = document.getElementById("committeeBtn");
const errorBox = document.getElementById("errorBox");
const studentsBox = document.getElementById("studentsBox");
const reportBox = document.getElementById("reportBox");

// حماية من حقن HTML عند عرض الأسماء داخل القوالب
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (ch) => map[ch]);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}

function renderStudents() {
  if (studentsList.length === 0) {
    studentsBox.innerHTML = `<p class="text-secondary mb-0">لم تتم إضافة أي طالب بعد.</p>`;
    return;
  }
  studentsBox.innerHTML = studentsList
    .map((s, i) => `
      <div class="student-item">
        <span><strong>${i + 1}.</strong> ${escapeHtml(s.name)}</span>
        <span class="text-secondary small">المتوسط: ${s.average.toFixed(2)} — الحضور: ${s.attendance}%</span>
      </div>`)
    .join("");
}

addBtn.onclick = function () {
  try {
    const student = new Student(
      nameInput.value,
      grade1Input.value,
      grade2Input.value,
      grade3Input.value,
      attendanceInput.value
    );

    studentsList.push(student);
    renderStudents();
    clearError();

    nameInput.value = "";
    grade1Input.value = "";
    grade2Input.value = "";
    grade3Input.value = "";
    attendanceInput.value = "";
    nameInput.focus();
  } catch (error) {
    showError(error.message);
  }
};

/* ========== الخطوة 4: لجنة الرأفة ========== */
committeeBtn.onclick = function () {
  clearError();

  if (studentsList.length === 0) {
    reportBox.innerHTML = `<div class="alert alert-info mb-0">لا يوجد طلاب مضافون لمعالجتهم. أضف طلاباً أولاً.</div>`;
    return;
  }

  // Filter: المتوسط بين 40 و 49 (أي من 40 وحتى أقل من 50 حتى لا يسقط مثل 49.5)
  const struggling = studentsList.filter((s) => s.average >= 40 && s.average < 50);

  // Map: إضافة 5 درجات رأفة لكل طالب (دون تعديل الكائن الأصلي)
  const adjusted = struggling.map((s) => ({
    name: s.name,
    newAverage: s.average + 5
  }));

  // Reduce: مجموع المتوسطات الجديدة
  const total = adjusted.reduce((sum, s) => sum + s.newAverage, 0);

  // منع القسمة على صفر
  const overallAverage = adjusted.length > 0 ? total / adjusted.length : 0;

  if (adjusted.length === 0) {
    reportBox.innerHTML = `<div class="alert alert-success mb-0">لا يوجد طلاب متعثرون (متوسط بين 40 و 49)، لا حاجة لتدخل اللجنة.</div>`;
    return;
  }

  reportBox.innerHTML = `
    <div class="report-stat mb-3">
      <div>عدد الطلاب المتعثرين: <strong>${adjusted.length}</strong></div>
      <div>المتوسط العام بعد الرأفة: <strong>${overallAverage.toFixed(2)}</strong></div>
    </div>
    <ul class="list-group">
      ${adjusted
        .map((s) => `
          <li class="list-group-item d-flex justify-content-between">
            <span>${escapeHtml(s.name)}</span>
            <span class="text-success fw-semibold">${s.newAverage.toFixed(2)}</span>
          </li>`)
        .join("")}
    </ul>`;
};
