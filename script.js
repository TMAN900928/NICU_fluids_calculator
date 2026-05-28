const milkData = {
  "Cow Milk": { carb: 4.6, protein: 3.4, kcal: 67, na: 23, k: 40, ca: 124, phos: 98 },
  "Standard Formula": { carb: 7.5, protein: 1.5, kcal: 67, na: 6.4, k: 14, ca: 46, phos: 33 },
  "Mature Breastmilk": { carb: 7.4, protein: 1.1, kcal: 70, na: 6.4, k: 15, ca: 35, phos: 15 },
  "Preterm Formula": { carb: 8.6, protein: 2.0, kcal: 80, na: 14, k: 19, ca: 77, phos: 41 },
  "Preterm Breastmilk": { carb: 6.4, protein: 2.7, kcal: 74, na: 17, k: 17, ca: 29, phos: 13 }
};

const pnData = {
  "Type A Starter": {
    protein: 3.3,
    glucose: 10,
    na: 3,
    k: 0,
    phos: 1.5,
    ca: 1.4,
    mg: 0.25,
    cl: 0,
    acetate: 0,
    kcal: 53.2
  },

  "Type B D10% Without Acetate": {
    protein: 3.0,
    glucose: 10,
    na: 3,
    k: 2,
    phos: 1.5,
    ca: 0.15,
    mg: 0.22,
    cl: 2,
    acetate: 0,
    kcal: 52
  },

  "Type C D12.5% With Acetate": {
    protein: 3.8,
    glucose: 12.5,
    na: 4,
    k: 2.7,
    phos: 1.5,
    ca: 0.15,
    mg: 0.25,
    cl: 2.7,
    acetate: 1,
    kcal: 65.2
  }
};

const ivdData = {
  "QS": { na: 77, k: 0, cl: 77, ca: 0, mg: 0, acetate: 0 },
  "HS": { na: 77, k: 0, cl: 77, ca: 0, mg: 0, acetate: 0 },
  "NS": { na: 154, k: 0, cl: 154, ca: 0, mg: 0, acetate: 0 },
  "3% Saline": { na: 513, k: 0, cl: 513, ca: 0, mg: 0, acetate: 0 },
  "HM": { na: 131, k: 5, cl: 111, ca: 2, mg: 0, acetate: 0 },
  "No Drip": { na: 0, k: 0, cl: 0, ca: 0, mg: 0, acetate: 0 }
};

const lipidConcentration = 20;
const lipidKcalPerMl = 2;
const kclMmolPerGram = 13.3;
const pintMl = 500;

const expectedFluidByDol = {
  1: 60,
  2: 80,
  3: 100,
  4: 120,
  5: 150
};

function getRawValue(id) {
  return document.getElementById(id).value.trim();
}

function getNumber(id) {
  return parseFloat(getRawValue(id)) || 0;
}

function setHTML(id, html) {
  document.getElementById(id).innerHTML = html;
}

function setValue(id, value, decimals = 1) {
  if (!isNaN(value) && isFinite(value)) {
    document.getElementById(id).value = Number(value).toFixed(decimals);
  }
}

function isBlankOrZero(value) {
  return value === "" || Number(value) === 0;
}

function setWarningBox(messages, level = "neutral") {

  const box = document.getElementById("warningBox");

  if (messages.length === 0) {

    if (level === "green") {
      box.className = "warning-box green";
      box.innerHTML = "Validation passed.";
    }

    else {
      box.className = "warning-box neutral";
      box.innerHTML = "No validation performed yet.";
    }

    return;
  }

  box.className = "warning-box " + level;
  box.innerHTML = messages.join("<br><br>");
}

function updateExpectedFluid() {

  const dol = getNumber("dol");
  const tf = getNumber("targetFluid");

  const box =
    document.getElementById("expectedFluidBox");

  if (dol <= 0 || tf <= 0) {

    box.className = "status-box neutral";
    box.innerHTML =
      "Expected DOL fluid will appear here.";

    return;
  }

  let expected = 150;

  if (dol >= 1 && dol <= 5) {
    expected = expectedFluidByDol[dol];
  }

  const diff = Math.abs(tf - expected);

  if (diff <= 10) {
    box.className = "status-box green";
  }

  else if (diff <= 20) {
    box.className = "status-box yellow";
  }

  else {
    box.className = "status-box red";
  }

  box.innerHTML =
    "Expected TF for DOL " +
    dol +
    " ≈ " +
    expected +
    " mL/kg/day";
}

function toggleSections() {

  const feedingType =
    document.getElementById("feedingType").value;

  const pnSection =
    document.getElementById("pnSection");

  const ivdSection =
    document.getElementById("ivdSection");

  const milkTypeGroup =
    document.getElementById("milkTypeGroup");

  const feedVolumeGroup =
    document.getElementById("feedVolumeGroup");

  if (feedingType === "Full Feeding") {

    pnSection.classList.add("hidden");
    ivdSection.classList.add("hidden");

    milkTypeGroup.classList.remove("hidden");
    feedVolumeGroup.classList.add("hidden");
  }

  else if (feedingType === "NBM") {

    pnSection.classList.remove("hidden");
    ivdSection.classList.remove("hidden");

    milkTypeGroup.classList.add("hidden");
    feedVolumeGroup.classList.add("hidden");
  }

  else {

    pnSection.classList.remove("hidden");
    ivdSection.classList.remove("hidden");

    milkTypeGroup.classList.remove("hidden");
    feedVolumeGroup.classList.remove("hidden");
  }
}

function validateInputs() {

  let warnings = [];
  let redWarnings = [];

  const weight = getNumber("weight");
  const dol = getNumber("dol");
  const targetFluid = getNumber("targetFluid");

  const feedingType =
    document.getElementById("feedingType").value;

  const milkType =
    document.getElementById("milkType").value;

  const pnType =
    document.getElementById("pnType").value;

  const ivdType =
    document.getElementById("ivdType").value;

  const feedIntervalRaw =
    getRawValue("feedInterval");

  const feedVolRaw =
    getRawValue("feedVol");

  const pnRateRaw =
    getRawValue("pnRate");

  const lipidRateRaw =
    getRawValue("lipidRate");

  const ivdRateRaw =
    getRawValue("ivdRate");

  const dextroseRaw =
    getRawValue("dextrose");

  const kclRaw =
    getRawValue("kclPerPint");

  const ivdRate =
    getNumber("ivdRate");

  const kcl =
    getNumber("kclPerPint");

  if (weight <= 0)
    redWarnings.push("Please enter weight.");

  if (dol <= 0)
    redWarnings.push("Please enter Day of Life.");

  if (targetFluid <= 0)
    redWarnings.push("Please enter target fluid.");

  if (feedingType === "")
    redWarnings.push("Please select feeding type.");

  let expectedTf = 150;

  if (dol >= 1 && dol <= 5) {
    expectedTf = expectedFluidByDol[dol];
  }

  if (
    Math.abs(targetFluid - expectedTf) > 20
  ) {

    warnings.push(
      "Entered total fluid differs significantly from expected DOL fluid. Please review."
    );
  }

  if (feedingType === "Full Feeding") {

    if (milkType === "") {
      redWarnings.push(
        "Please select milk type for full feeding."
      );
    }

    if (feedIntervalRaw === "") {
      redWarnings.push(
        "Please enter feeding interval for full feeding."
      );
    }

    if (feedVolRaw !== "") {

      warnings.push(
        "For full feeding, feed volume should be left blank."
      );
    }

    if (
      !isBlankOrZero(pnRateRaw) ||
      !isBlankOrZero(lipidRateRaw) ||
      !isBlankOrZero(ivdRateRaw)
    ) {

      warnings.push(
        "For full feeding, PN/lipid/IVD should be blank or 0."
      );
    }
  }

  if (feedingType === "Increment Feeding") {

    if (milkType === "")
      redWarnings.push(
        "Please select milk type."
      );

    if (feedIntervalRaw === "")
      redWarnings.push(
        "Please enter feeding interval."
      );

    if (feedVolRaw === "")
      redWarnings.push(
        "Please enter feed volume."
      );

    if (pnRateRaw === "")
      redWarnings.push(
        "Please enter PN rate. Enter 0 if not using PN."
      );

    if (lipidRateRaw === "")
      redWarnings.push(
        "Please enter lipid rate. Enter 0 if not using lipid."
      );

    if (ivdRateRaw === "")
      redWarnings.push(
        "Please enter IVD rate. Enter 0 if not using IVD."
      );
  }

  if (feedingType === "NBM") {

    if (pnRateRaw === "")
      redWarnings.push(
        "Please enter PN rate. Enter 0 if not using PN."
      );

    if (lipidRateRaw === "")
      redWarnings.push(
        "Please enter lipid rate. Enter 0 if not using lipid."
      );

    if (ivdRateRaw === "")
      redWarnings.push(
        "Please enter IVD rate. Enter 0 if not using IVD."
      );
  }

  if (ivdRate > 0) {

    if (ivdType === "")
      redWarnings.push(
        "Please select IVD type."
      );

    if (ivdType === "No Drip")
      redWarnings.push(
        "IVD rate entered but drip type selected as No Drip."
      );

    if (dextroseRaw === "")
      redWarnings.push(
        "Please enter dextrose concentration."
      );

    if (kclRaw === "")
      redWarnings.push(
        "Please enter KCl per pint. Enter 0 if none added."
      );
  }

  if (feedIntervalRaw !== "") {

    const interval =
      getNumber("feedInterval");

    if (interval <= 0) {

      redWarnings.push(
        "Feeding interval must be >0."
      );
    }

    else if (24 % interval !== 0) {

      warnings.push(
        "Feeding interval must divide evenly into 24 hours."
      );
    }
  }

  if (kcl > 2) {

    warnings.push(
      "KCl concentration exceeds 2 g/pint. Please verify."
    );
  }

  if (
    dol > 1 &&
    pnType === "Type A Starter" &&
    feedingType !== "Full Feeding"
  ) {

    warnings.push(
      "Starter PN usually intended for within first 24 hours of life. Please review."
    );
  }

  return {
    warnings,
    redWarnings
  };
}

function calculate(showWarnings = false) {

  updateExpectedFluid();
  toggleSections();

  const validation =
    validateInputs();

  if (
    showWarnings &&
    validation.redWarnings.length > 0
  ) {

    setWarningBox(
      validation.redWarnings.concat(validation.warnings),
      "red"
    );

    return;
  }

  const weight = getNumber("weight");
  const dol = getNumber("dol");
  const targetFluid = getNumber("targetFluid");

  const feedingType =
    document.getElementById("feedingType").value;

  const milkType =
    document.getElementById("milkType").value;

  let feedVol =
    getNumber("feedVol");

  const feedInterval =
    getNumber("feedInterval");

  const pnType =
    document.getElementById("pnType").value;

  let proteinDose =
    getNumber("proteinDose");

  let pnRate =
    getNumber("pnRate");

  let lipidDose =
    getNumber("lipidDose");

  let lipidRate =
    getNumber("lipidRate");

  const ivdType =
    document.getElementById("ivdType").value;

  const dextrose =
    getNumber("dextrose");

  let ivdRate =
    getNumber("ivdRate");

  const kclPerPint =
    getNumber("kclPerPint");

  if (
    weight <= 0 ||
    targetFluid <= 0 ||
    feedingType === ""
  ) return;

  const milk =
    milkData[milkType] ||
    milkData["Mature Breastmilk"];

  const pn =
    pnData[pnType];

  const ivd =
    ivdData[ivdType] ||
    ivdData["No Drip"];

  if (feedingType === "Full Feeding") {

    if (feedInterval <= 0) return;

    const totalFeedPerDay =
      targetFluid * weight;

    const feedsPerDay =
      24 / feedInterval;

    feedVol =
      totalFeedPerDay / feedsPerDay;

    setValue("feedVol", feedVol);

    pnRate = 0;
    lipidRate = 0;
    ivdRate = 0;

    setValue("pnRate", 0);
    setValue("lipidRate", 0);
    setValue("ivdRate", 0);
  }

  if (proteinDose > 0) {

    pnRate =
      (proteinDose * weight * 100)
      /
      (pn.protein * 24);

    setValue("pnRate", pnRate);
  }

  else if (pnRate > 0) {

    proteinDose =
      (pn.protein * pnRate * 24)
      /
      (100 * weight);

    setValue("proteinDose", proteinDose);
  }

  if (lipidDose > 0) {

    lipidRate =
      (lipidDose * weight * 100)
      /
      (lipidConcentration * 24);

    setValue("lipidRate", lipidRate);
  }

  else if (lipidRate > 0) {

    lipidDose =
      (lipidConcentration * lipidRate * 24)
      /
      (100 * weight);

    setValue("lipidDose", lipidDose);
  }

  let totalFeedMl = 0;

  if (
    feedVol > 0 &&
    feedInterval > 0 &&
    feedingType !== "NBM"
  ) {

    totalFeedMl =
      feedVol * (24 / feedInterval);
  }

  const feedRate =
    totalFeedMl / 24;

  let feedFluid =
    totalFeedMl / weight;

  let pnFluid =
    (pnRate * 24) / weight;

  let lipidFluid =
    (lipidRate * 24) / weight;

  let ivdFluid =
    (ivdRate * 24) / weight;

  let totalFluid =
    feedFluid +
    pnFluid +
    lipidFluid +
    ivdFluid;

  let adjustmentMessages = [];

  if (
    feedingType !== "Full Feeding" &&
    totalFluid > targetFluid
  ) {

    let excessMlDay =
      (totalFluid - targetFluid)
      * weight;

    const originalIvdRate =
      ivdRate;

    const originalPnRate =
      pnRate;

    const ivdMlDay =
      ivdRate * 24;

    if (ivdMlDay >= excessMlDay) {

      ivdRate =
        ivdRate -
        (excessMlDay / 24);
    }

    else {

      excessMlDay -= ivdMlDay;

      ivdRate = 0;

      pnRate =
        Math.max(
          0,
          pnRate -
          (excessMlDay / 24)
        );
    }

    const cutIvd =
      originalIvdRate - ivdRate;

    const cutPn =
      originalPnRate - pnRate;

    setValue("ivdRate", ivdRate);
    setValue("pnRate", pnRate);

    proteinDose =
      (pn.protein * pnRate * 24)
      /
      (100 * weight);

    setValue("proteinDose", proteinDose);

    adjustmentMessages.push(
      "Fluid exceeded target. Reduce IVD by " +
      cutIvd.toFixed(1) +
      " mL/hr" +
      (cutPn > 0
        ? " and PN by " +
          cutPn.toFixed(1) +
          " mL/hr."
        : ".")
    );

    pnFluid =
      (pnRate * 24) / weight;

    ivdFluid =
      (ivdRate * 24) / weight;

    totalFluid =
      feedFluid +
      pnFluid +
      lipidFluid +
      ivdFluid;
  }

  else if (
    feedingType !== "Full Feeding" &&
    totalFluid < targetFluid
  ) {

    const deficitRate =
      ((targetFluid - totalFluid)
        * weight)
      / 24;

    adjustmentMessages.push(
      "Fluid below target. Suggested add-on IVD rate: " +
      deficitRate.toFixed(1) +
      " mL/hr."
    );
  }

  else if (
    feedingType === "Full Feeding"
  ) {

    adjustmentMessages.push(
      "Full feeding calculated. Give " +
      feedVol.toFixed(1) +
      " mL every " +
      feedInterval +
      " hourly."
    );
  }

  else {

    adjustmentMessages.push(
      "Fluid target achieved."
    );
  }

  const totalGDR =
    ((milk.carb * feedRate)
      /
      (weight * 6))
    +
    ((pn.glucose * pnRate)
      /
      (weight * 6))
    +
    ((dextrose * ivdRate)
      /
      (weight * 6));

  setHTML(
    "totalFluidOut",
    "<b>Total Fluid:</b> " +
    totalFluid.toFixed(1) +
    " mL/kg/day"
  );

  setHTML(
    "gdrOut",
    "<b>Total GDR:</b> " +
    totalGDR.toFixed(1) +
    " mg/kg/min"
  );

  setHTML(
    "summaryOut",
    adjustmentMessages.join("<br>")
  );

  if (showWarnings) {

    let safetyWarnings = [];

    if (totalGDR > 12)
      safetyWarnings.push(
        "GDR exceeds 12 mg/kg/min."
      );

    if (
      totalGDR < 4 &&
      totalGDR > 0
    )
      safetyWarnings.push(
        "GDR below 4 mg/kg/min."
      );

    const allWarnings =
      validation.warnings.concat(
        safetyWarnings,
        adjustmentMessages
      );

    if (allWarnings.length > 0) {

      setWarningBox(
        allWarnings,
        "yellow"
      );
    }

    else {

      setWarningBox([], "green");
    }
  }
}

function resetCalculator() {

  document
  .querySelectorAll("input")
  .forEach(input => {
    input.value = "";
  });

  document
  .querySelectorAll("select")
  .forEach(select => {
    select.selectedIndex = 0;
  });

  const outputIds = [
    "totalFluidOut",
    "gdrOut",
    "caloriesOut",
    "proteinOut",
    "lipidOut",
    "naOut",
    "kOut",
    "clOut",
    "caOut",
    "phosOut",
    "mgOut",
    "acetateOut"
  ];

  outputIds.forEach(id => {
    setHTML(id, "");
  });

  setHTML(
    "summaryOut",
    "Summary will appear after calculation."
  );

  const expectedBox =
    document.getElementById(
      "expectedFluidBox"
    );

  expectedBox.className =
    "status-box neutral";

  expectedBox.innerHTML =
    "Expected DOL fluid will appear here.";

  setWarningBox([], "neutral");

  toggleSections();
}

document
.querySelectorAll("input, select")
.forEach(el => {

  el.addEventListener(
    "input",
    () => calculate(false)
  );

  el.addEventListener(
    "change",
    () => calculate(false)
  );
});

toggleSections();
setWarningBox([], "neutral");
