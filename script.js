
const form = document.getElementById("enrollmentForm");
const courseSelect = document.getElementById("course");
const majorGroup = document.getElementById("majorGroup");
const majorSelect = document.getElementById("major");
const successMessage = document.getElementById("successMessage");
const tableBody = document.getElementById("studentTableBody");
const recordCount = document.getElementById("recordCount");

const fieldRules = {
  studentId: { min: 5, label: "Student ID", required: true },
  prefix: { min: 2, label: "Prefix", required: false },
  firstName: { min: 3, label: "First Name", required: true },
  middleName: { min: 2, label: "Middle Name", required: false },
  lastName: { min: 2, label: "Last Name", required: true },
  suffix: { min: 2, label: "Suffix", required: false }
};

let studentCount = 0;

// Show the major field only when BSIT is selected.
function updateMajorField() {
  const isBSIT = courseSelect.value === "BSIT";

  majorGroup.hidden = !isBSIT;
  majorSelect.required = isBSIT;

  if (!isBSIT) {
    majorSelect.value = "";
    clearError("major");
  }
}

courseSelect.addEventListener("change", () => {
  updateMajorField();
  clearError("course");
  successMessage.hidden = true;
});

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + "Error");

  error.textContent = message;
  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + "Error");

  if (field && error) {
    error.textContent = "";
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
  }
}

function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  clearError(fieldId);

  const rule = fieldRules[fieldId];

  if (rule) {
    if (rule.required && !value) {
      showError(fieldId, `${rule.label} is required.`);
      return false;
    }

    if (value && value.length < rule.min) {
      showError(
        fieldId,
        `${rule.label} must be at least ${rule.min} characters.`
      );
      return false;
    }
  }

  if (fieldId === "email") {
    if (!value) {
      showError("email", "Email address is required.");
      return false;
    }

    // Basic email format check.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      showError("email", "Please enter a valid email address.");
      return false;
    }
  }

  if (fieldId === "course" && !value) {
    showError("course", "Please select a course.");
    return false;
  }

  if (fieldId === "yearLevel" && !value) {
    showError("yearLevel", "Please select a year level.");
    return false;
  }

  if (fieldId === "major" &&
      courseSelect.value === "BSIT" && !value) {
    showError("major", "Please select a BSIT major.");
    return false;
  }

  return true;
}

// Clear errors when the user edits a field.
Object.keys(fieldRules).forEach((fieldId) => {
  const field = document.getElementById(fieldId);

  field.addEventListener("input", () => {
    validateField(fieldId);
    successMessage.hidden = true;
  });
});

["email", "course", "yearLevel", "major"].forEach((fieldId) => {
  const field = document.getElementById(fieldId);

  field.addEventListener("change", () => {
    validateField(fieldId);
    successMessage.hidden = true;
  });

  if (fieldId === "email") {
    field.addEventListener("input", () => {
      validateField(fieldId);
      successMessage.hidden = true;
    });
  }
});

// Validate and display the submitted student.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  successMessage.hidden = true;

  const fieldsToValidate = [
    ...Object.keys(fieldRules),
    "email",
    "course",
    "yearLevel"
  ];

  if (courseSelect.value === "BSIT") {
    fieldsToValidate.push("major");
  }

  let isValid = true;

  fieldsToValidate.forEach((fieldId) => {
    if (!validateField(fieldId)) {
      isValid = false;
    }
  });

  if (!isValid) {
    const firstInvalid = form.querySelector(".invalid");

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return;
  }

  const data = Object.fromEntries(
    new FormData(form).entries()
  );

  // Prevent duplicate Student IDs in the current table.
  const existingIds = Array.from(
    tableBody.querySelectorAll("tr[data-student-id]")
  ).map((row) => row.dataset.studentId.toLowerCase());

  if (existingIds.includes(data.studentId.trim().toLowerCase())) {
    showError("studentId", "This Student ID is already enrolled.");
    document.getElementById("studentId").focus();
    return;
  }

  const fullName = [
    data.prefix.trim(),
    data.firstName.trim(),
    data.middleName.trim(),
    data.lastName.trim(),
    data.suffix.trim()
  ].filter(Boolean).join(" ");

  const major = data.course === "BSIT"
    ? data.major
    : "N/A";

  const values = [
    data.studentId.trim(),
    fullName,
    data.email.trim(),
    data.course,
    major,
    data.yearLevel
  ];

  const row = document.createElement("tr");
  row.dataset.studentId = data.studentId.trim();

  // Use textContent so submitted values are not interpreted as HTML.
  values.forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
  });

  const emptyRow = document.getElementById("emptyRow");

  if (emptyRow) {
    emptyRow.remove();
  }

  tableBody.appendChild(row);
  studentCount++;

  recordCount.textContent =
    `${studentCount} ${studentCount === 1 ? "record" : "records"}`;

  successMessage.textContent =
    `Enrollment submitted successfully for ${fullName}!`;

  successMessage.hidden = false;

  form.reset();
  updateMajorField();

  Object.keys(fieldRules).forEach(clearError);

  ["email", "course", "yearLevel", "major"].forEach(clearError);

  successMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

// Clear the form without leaving stale validation messages.
form.addEventListener("reset", () => {
  setTimeout(() => {
    Object.keys(fieldRules).forEach(clearError);

    ["email", "course", "yearLevel", "major"].forEach(clearError);

    successMessage.hidden = true;
    updateMajorField();
  }, 0);
});

updateMajorField();
