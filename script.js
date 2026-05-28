const milkData = {
  "Cow Milk": { carb: 4.6, protein: 3.4, kcal: 67, na: 23, k: 40, ca: 124, phos: 98 },
  "Standard Formula": { carb: 7.5, protein: 1.5, kcal: 67, na: 6.4, k: 14, ca: 46, phos: 33 },
  "Mature Breastmilk": { carb: 7.4, protein: 1.1, kcal: 70, na: 6.4, k: 15, ca: 35, phos: 15 },
  "Preterm Formula": { carb: 8.6, protein: 2.0, kcal: 80, na: 14, k: 19, ca: 77, phos: 41 },
  "Preterm Breastmilk": { carb: 6.4, protein: 2.7, kcal: 74, na: 17, k: 17, ca: 29, phos: 13 }
};

const pnData = {
  "Type A": {
    name: "Starter",
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

  "Type B": {
    name: "Without Acetate",
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

  "Type C": {
    name: "With Acetate",
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
  "1/5NS": { na: 77, k: 0, cl: 77, ca: 0, mg: 0, acetate: 0 },
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

function getRawValue(id){
  return document.getElementById(id).value.trim();
}

function getNumber(id){
  return parseFloat(document.getElementById(id).value) || 0;
}

function setHTML(id, html){
  document.getElementById(id).innerHTML = html;
}

function setValue(id, value, decimals = 1){
  document.getElementById(id).value = Number(value).toFixed(decimals);
}

function setWarningBox(messages, level="neutral"){

  const box = document.getElementById("warningBox");

  if(messages.length === 0){
    box.className = "warning-box green";
    box.innerHTML = "Validation passed.";
    return;
  }

  box.className = "warning-box " + level;

  box.innerHTML = messages.join("<br><br>");
}

function updateExpectedFluid(){

  const dol = getNumber("dol");
  const tf = getNumber("targetFluid");

  let expected = 150;

  if(dol >=1 && dol <=5){
    expected = expectedFluidByDol[dol];
  }

  const diff = Math.abs(tf - expected);

  let box = document.getElementById("expectedFluidBox");

  if(diff <= 10){
    box.className = "status-box green";
  }
  else if(diff <= 20){
    box.className = "status-box yellow";
  }
  else{
    box.className = "status-box red";
  }

  box.innerHTML =
    "Expected TF for DOL " + dol +
    " ≈ " + expected +
    " mL/kg/day";
}

function toggleSections(){

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

  if(feedingType === "Full Feeding"){

    pnSection.classList.add("hidden");
    ivdSection.classList.add("hidden");

    milkTypeGroup.classList.remove("hidden");
    feedVolumeGroup.classList.add("hidden");
  }

  else if(feedingType === "NBM"){

    pnSection.classList.remove("hidden");
    ivdSection.classList.remove("hidden");

    milkTypeGroup.classList.add("hidden");
    feedVolumeGroup.classList.add("hidden");
  }

  else{

    pnSection.classList.remove("hidden");
    ivdSection.classList.remove("hidden");

    milkTypeGroup.classList.remove("hidden");
    feedVolumeGroup.classList.remove("hidden");
  }
}

function validateInputs(){

  let warnings = [];
  let redWarnings = [];

  const feedingType =
    document.getElementById("feedingType").value;

  const milkType =
    document.getElementById("milkType").value;

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

  const ivdType =
    document.getElementById("ivdType").value;

  const ivdRate = getNumber("ivdRate");
  const kcl = getNumber("kclPerPint");

  const dol = getNumber("dol");
  const tf = getNumber("targetFluid");

  let expectedTf = 150;

  if(dol >=1 && dol <=5){
    expectedTf = expectedFluidByDol[dol];
  }

  const diffTf = Math.abs(tf - expectedTf);

  if(diffTf > 20){
    warnings.push(
      "Entered total fluid differs significantly from expected DOL fluid. Please review."
    );
  }

  if(feedingType === "Full Feeding"){

    if(milkType === ""){
      redWarnings.push(
        "Please select milk type for full feeding."
      );
    }

    if(feedIntervalRaw === ""){
      redWarnings.push(
        "Please enter feeding interval for full feeding."
      );
    }

    if(feedVolRaw !== ""){
      warnings.push(
        "For full feeding, feed volume should be left blank."
      );
    }

    if(
      pnRateRaw !== "" ||
      lipidRateRaw !== "" ||
      ivdRateRaw !== ""
    ){
      warnings.push(
        "For full feeding, PN and IVD inputs should be left blank or 0."
      );
    }
  }

  if(feedingType === "Increment Feeding"){

    if(milkType === ""){
      redWarnings.push(
        "Please select milk type."
      );
    }

    if(feedIntervalRaw === ""){
      redWarnings.push(
        "Please enter feeding interval."
      );
    }

    if(pnRateRaw === ""){
      redWarnings.push(
        "Please enter PN rate. Enter 0 if not using PN."
      );
    }

    if(lipidRateRaw === ""){
      redWarnings.push(
        "Please enter lipid rate. Enter 0 if not using lipid."
      );
    }

    if(ivdRateRaw === ""){
      redWarnings.push(
        "Please enter IVD rate. Enter 0 if not using IVD."
      );
    }
  }

  if(feedingType === "NBM"){

    if(pnRateRaw === ""){
      redWarnings.push(
        "Please enter PN rate. Enter 0 if not using PN."
      );
    }

    if(lipidRateRaw === ""){
      redWarnings.push(
        "Please enter lipid rate. Enter 0 if not using lipid."
      );
    }

    if(ivdRateRaw === ""){
      redWarnings.push(
        "Please enter IVD rate. Enter 0 if not using IVD."
      );
    }
  }

  if(ivdRate > 0){

    if(ivdType === ""){
      redWarnings.push(
        "Please select IVD type."
      );
    }

    if(dextroseRaw === ""){
      redWarnings.push(
        "Please enter dextrose concentration."
      );
    }

    if(kclRaw === ""){
      redWarnings.push(
        "Please enter KCl per pint. Enter 0 if no KCl added."
      );
    }
  }

  if(feedIntervalRaw !== ""){

    const interval =
      getNumber("feedInterval");

    if(24 % interval !== 0){
      warnings.push(
        "Feeding interval must divide evenly into 24 hours."
      );
    }
  }

  if(kcl > 2){

    warnings.push(
      "KCl concentration exceeds 2 g/pint. Please verify."
    );
  }

  const pnType =
    document.getElementById("pnType").value;

  if(dol > 1 && pnType === "Type A"){

    warnings.push(
      "Starter PN usually intended for within first 24 hours of life. Please review."
    );
  }

  return {
    warnings,
    redWarnings
  };
}

function calculate(showWarnings=false){

  updateExpectedFluid();
  toggleSections();

  const validation = validateInputs();

  if(showWarnings){

    if(validation.redWarnings.length > 0){

      setWarningBox(
        validation.redWarnings.concat(validation.warnings),
        "red"
      );

      return;
    }

    else if(validation.warnings.length > 0){

      setWarningBox(
        validation.warnings,
        "yellow"
      );
    }

    else{
      setWarningBox([], "green");
    }
  }

  const weight = getNumber("weight");
  const dol = getNumber("dol");
  const targetFluid = getNumber("targetFluid");

  const feedingType =
    document.getElementById("feedingType").value;

  const milkType =
    document.getElementById("milkType").value;

  let feedVol = getNumber("feedVol");
  const feedInterval = getNumber("feedInterval");

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

  if(weight <=0 || targetFluid <=0){
    return;
  }

  const milk =
    milkData[milkType] ||
    milkData["Mature Breastmilk"];

  const pn =
    pnData[pnType];

  const ivd =
    ivdData[ivdType] ||
    ivdData["No Drip"];

  if(feedingType === "Full Feeding"){

    const totalFeedPerDay =
      targetFluid * weight;

    const feedsPerDay =
      24 / feedInterval;

    feedVol =
      totalFeedPerDay / feedsPerDay;

    setValue("feedVol", feedVol, 1);

    pnRate = 0;
    lipidRate = 0;
    ivdRate = 0;
  }

  if(proteinDose > 0){

    pnRate =
      (proteinDose * weight * 100)
      /
      (pn.protein * 24);

    setValue("pnRate", pnRate);
  }

  else if(pnRate > 0){

    proteinDose =
      (pn.protein * pnRate * 24)
      /
      (100 * weight);

    setValue("proteinDose", proteinDose);
  }

  if(lipidDose > 0){

    lipidRate =
      (lipidDose * weight * 100)
      /
      (lipidConcentration * 24);

    setValue("lipidRate", lipidRate);
  }

  else if(lipidRate > 0){

    lipidDose =
      (lipidConcentration * lipidRate * 24)
      /
      (100 * weight);

    setValue("lipidDose", lipidDose);
  }

  const totalFeedMl =
    feedVol * (24 / feedInterval || 0);

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

  if(
    feedingType !== "Full Feeding"
    &&
    totalFluid > targetFluid
  ){

    let excessMlDay =
      (totalFluid - targetFluid)
      * weight;

    const ivdMlDay =
      ivdRate * 24;

    if(ivdMlDay >= excessMlDay){

      ivdRate =
        ivdRate -
        (excessMlDay / 24);
    }

    else{

      excessMlDay =
        excessMlDay - ivdMlDay;

      ivdRate = 0;

      pnRate =
        Math.max(
          0,
          pnRate -
          (excessMlDay / 24)
        );
    }

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

  const feedProtein =
    (milk.protein * totalFeedMl / 100)
    / weight;

  const pnProtein =
    (pn.protein * (pnRate * 24) / 100)
    / weight;

  const totalProtein =
    feedProtein + pnProtein;

  const actualLipidDose =
    (lipidConcentration * lipidRate * 24)
    /
    (100 * weight);

  const feedCalories =
    (milk.kcal * totalFeedMl / 100)
    / weight;

  const pnCalories =
    (pn.kcal * (pnRate * 24) / 100)
    / weight;

  const lipidCalories =
    (lipidRate * 24 * lipidKcalPerMl)
    / weight;

  const totalCalories =
    feedCalories +
    pnCalories +
    lipidCalories;

  const feedGDR =
    (milk.carb * feedRate)
    /
    (weight * 6);

  const pnGDR =
    (pn.glucose * pnRate)
    /
    (weight * 6);

  const ivdGDR =
    (dextrose * ivdRate)
    /
    (weight * 6);

  const totalGDR =
    feedGDR +
    pnGDR +
    ivdGDR;

  const kclMmolPerMl =
    (kclPerPint * kclMmolPerGram)
    /
    pintMl;

  const kclMmolPerDay =
    kclMmolPerMl *
    ivdRate *
    24;

  const kclMmolKgDay =
    kclMmolPerDay / weight;

  const sodium = (
    ((milk.na / 1000) * totalFeedMl) +
    ((pn.na / 100) * (pnRate * 24)) +
    ((ivd.na / 1000) * (ivdRate * 24))
  ) / weight;

  const potassium = (
    ((milk.k / 1000) * totalFeedMl) +
    ((pn.k / 100) * (pnRate * 24)) +
    ((ivd.k / 1000) * (ivdRate * 24))
  ) / weight
  +
  kclMmolKgDay;

  const chloride = (
    ((pn.cl / 100) * (pnRate * 24)) +
    ((ivd.cl / 1000) * (ivdRate * 24))
  ) / weight;

  const calcium = (
    ((milk.ca / 1000) * totalFeedMl) +
    ((pn.ca / 100) * (pnRate * 24))
  ) / weight;

  const phosphate = (
    ((milk.phos / 1000) * totalFeedMl) +
    ((pn.phos / 100) * (pnRate * 24))
  ) / weight;

  const magnesium = (
    ((pn.mg / 100) * (pnRate * 24))
  ) / weight;

  const acetate = (
    ((pn.acetate / 100) * (pnRate * 24))
  ) / weight;

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
    "caloriesOut",
    "<b>Total Calories:</b> " +
    totalCalories.toFixed(1) +
    " kcal/kg/day"
  );

  setHTML(
    "proteinOut",
    "<b>Total Protein:</b> " +
    totalProtein.toFixed(1) +
    " g/kg/day"
  );

  setHTML(
    "lipidOut",
    "<b>Lipid:</b> " +
    actualLipidDose.toFixed(1) +
    " g/kg/day"
  );

  setHTML(
    "naOut",
    "Sodium: " +
    sodium.toFixed(2) +
    " mmol/kg/day"
  );

  setHTML(
    "kOut",
    "Potassium: " +
    potassium.toFixed(2) +
    " mmol/kg/day" +
    "<br>Added KCl contribution: " +
    kclMmolKgDay.toFixed(2)
  );

  setHTML(
    "clOut",
    "Chloride: " +
    chloride.toFixed(2) +
    " mmol/kg/day"
  );

  setHTML(
    "caOut",
    "Calcium: " +
    calcium.toFixed(2) +
    " mmol/kg/day"
  );

  setHTML(
    "phosOut",
    "Phosphate: " +
    phosphate.toFixed(2) +
    " mmol/kg/day"
  );

  setHTML(
    "mgOut",
    "Magnesium: " +
    magnesium.toFixed(2) +
    " mmol/kg/day"
  );

  setHTML(
    "acetateOut",
    "Acetate: " +
    acetate.toFixed(2) +
    " mmol/kg/day"
  );

  let summary = `
    <b>DOL:</b> ${dol}<br>
    <b>Weight:</b> ${weight} kg<br>
    <b>Target Fluid:</b> ${targetFluid} mL/kg/day<br><br>

    <b>Feeding:</b><br>
    ${feedingType}<br>
    ${milkType}<br>
    ${feedVol.toFixed(1)} mL every ${feedInterval} hourly<br><br>

    <b>PN:</b><br>
    ${pnType} at ${pnRate.toFixed(1)} mL/hr<br><br>

    <b>Lipid:</b><br>
    ${lipidRate.toFixed(1)} mL/hr<br><br>

    <b>IVD:</b><br>
    ${ivdType}<br>
    D${dextrose}<br>
    ${ivdRate.toFixed(1)} mL/hr<br>
    KCl ${kclPerPint} g/pint<br><br>

    <b>Total GDR:</b>
    ${totalGDR.toFixed(1)} mg/kg/min
  `;

  document.getElementById("summaryOut")
    .innerHTML = summary;

  if(showWarnings){

    let safetyWarnings = [];

    if(totalGDR > 12){
      safetyWarnings.push(
        "GDR exceeds 12 mg/kg/min."
      );
    }

    if(totalGDR < 4){
      safetyWarnings.push(
        "GDR below 4 mg/kg/min."
      );
    }

    if(sodium > 6){
      safetyWarnings.push(
        "Sodium delivery exceeds 6 mmol/kg/day."
      );
    }

    if(potassium > 4){
      safetyWarnings.push(
        "Potassium delivery exceeds 4 mmol/kg/day."
      );
    }

    if(calcium > 2){
      safetyWarnings.push(
        "Calcium delivery exceeds 2 mmol/kg/day."
      );
    }

    if(phosphate > 2){
      safetyWarnings.push(
        "Phosphate delivery exceeds 2 mmol/kg/day."
      );
    }

    if(magnesium > 0.5){
      safetyWarnings.push(
        "Magnesium delivery exceeds 0.5 mmol/kg/day."
      );
    }

    if(chloride > 6){
      safetyWarnings.push(
        "Chloride delivery exceeds 6 mmol/kg/day."
      );
    }

    if(safetyWarnings.length > 0){

      setWarningBox(
        safetyWarnings,
        "yellow"
      );
    }
  }
}

function resetCalculator(){

  const inputs =
    document.querySelectorAll("input");

  inputs.forEach(input=>{
    input.value = "";
  });

  const selects =
    document.querySelectorAll("select");

  selects.forEach(select=>{
    select.selectedIndex = 0;
  });

  setHTML(
    "summaryOut",
    "Summary will appear after calculation."
  );

  setWarningBox([], "neutral");

  calculate();
}

document
.querySelectorAll("input, select")
.forEach(el=>{

  el.addEventListener("input", ()=>{

    calculate(false);
  });

  el.addEventListener("change", ()=>{

    calculate(false);
  });
});

calculate(false);
