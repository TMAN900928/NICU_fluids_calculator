const milkData = {
  "Cow Milk": {
    carb: 4.6,
    protein: 3.4,
    kcal: 67,
    na: 23,
    k: 40,
    ca: 124,
    phos: 98
  },
  "Standard Formula": {
    carb: 7.5,
    protein: 1.5,
    kcal: 67,
    na: 6.4,
    k: 14,
    ca: 46,
    phos: 33
  },
  "Mature Breastmilk": {
    carb: 7.4,
    protein: 1.1,
    kcal: 70,
    na: 6.4,
    k: 15,
    ca: 35,
    phos: 15
  },
  "Preterm Formula": {
    carb: 8.6,
    protein: 2.0,
    kcal: 80,
    na: 14,
    k: 19,
    ca: 77,
    phos: 41
  },
  "Preterm Breastmilk": {
    carb: 6.4,
    protein: 2.7,
    kcal: 74,
    na: 17,
    k: 17,
    ca: 29,
    phos: 13
  }
};

// PN values are PER 100 mL
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

// IVD values are mmol/L
const ivdData = {
  "1/5NS": {
    na: 77,
    k: 0,
    cl: 77,
    ca: 0,
    mg: 0,
    acetate: 0
  },
  "HS": {
    na: 77,
    k: 0,
    cl: 77,
    ca: 0,
    mg: 0,
    acetate: 0
  },
  "NS": {
    na: 154,
    k: 0,
    cl: 154,
    ca: 0,
    mg: 0,
    acetate: 0
  },
  "3% Saline": {
    na: 513,
    k: 0,
    cl: 513,
    ca: 0,
    mg: 0,
    acetate: 0
  },
  "HM": {
    na: 131,
    k: 5,
    cl: 111,
    ca: 2,
    mg: 0,
    acetate: 0
  },
  "No Drip": {
    na: 0,
    k: 0,
    cl: 0,
    ca: 0,
    mg: 0,
    acetate: 0
  }
};

// Lipid 20% = 20 g per 100 mL
const lipidConcentration = 20;

// Lipid 20% gives approximately 2 kcal/mL
const lipidKcalPerMl = 2;

function getNumber(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function setValue(id, value, decimals = 1) {
  document.getElementById(id).value = value.toFixed(decimals);
}

function setHTML(id, html) {
  document.getElementById(id).innerHTML = html;
}

function calculate() {
  let weight = getNumber("weight");
  let targetFluid = getNumber("targetFluid");
  let dol = getNumber("dol");

  let feedingType = document.getElementById("feedingType").value;
  let milkType = document.getElementById("milkType").value;

  let feedVol = getNumber("feedVol");
  let feedInterval = getNumber("feedInterval");

  let pnType = document.getElementById("pnType").value;
  let proteinDose = getNumber("proteinDose");
  let pnRate = getNumber("pnRate");

  let lipidDose = getNumber("lipidDose");
  let lipidRate = getNumber("lipidRate");

  let ivdType = document.getElementById("ivdType").value;
  let dextrose = getNumber("dextrose");
  let ivdRate = getNumber("ivdRate");

  let warnings = [];

  if (weight <= 0) {
    setHTML("warning", "Please enter weight.");
    return;
  }

  if (targetFluid <= 0) {
    setHTML("warning", "Please enter target fluid.");
    return;
  }

  const milk = milkData[milkType];
  const pn = pnData[pnType];
  const ivd = ivdData[ivdType];

  if (!milk || !pn || !ivd) {
    setHTML("warning", "Please check selected milk, PN or IVD type.");
    return;
  }

  if (feedingType === "NBM") {
    feedVol = 0;
    feedInterval = 0;
    document.getElementById("feedVol").value = 0;
    document.getElementById("feedInterval").value = 0;
  }

  if (feedingType !== "NBM") {
    if (feedVol > 0 && feedInterval <= 0) {
      setHTML("warning", "Please enter feeding interval.");
      return;
    }
  }

  if (feedingType === "Full Feeding") {
    proteinDose = 0;
    pnRate = 0;
    lipidDose = 0;
    lipidRate = 0;
    ivdRate = 0;
    dextrose = 0;

    document.getElementById("proteinDose").value = 0;
    document.getElementById("pnRate").value = 0;
    document.getElementById("lipidDose").value = 0;
    document.getElementById("lipidRate").value = 0;
    document.getElementById("ivdRate").value = 0;
    document.getElementById("dextrose").value = 0;
  }

  if (ivdType === "No Drip") {
    ivdRate = 0;
    dextrose = 0;
    document.getElementById("ivdRate").value = 0;
    document.getElementById("dextrose").value = 0;
  }

  // PN dose-rate linking
  if (proteinDose > 0) {
    pnRate = (proteinDose * weight * 100) / (pn.protein * 24);
    setValue("pnRate", pnRate, 1);
  } else if (pnRate > 0) {
    proteinDose = (pn.protein * pnRate * 24) / (100 * weight);
    setValue("proteinDose", proteinDose, 1);
  }

  // Lipid dose-rate linking
  if (lipidDose > 0) {
    lipidRate = (lipidDose * weight * 100) / (lipidConcentration * 24);
    setValue("lipidRate", lipidRate, 1);
  } else if (lipidRate > 0) {
    lipidDose = (lipidConcentration * lipidRate * 24) / (100 * weight);
    setValue("lipidDose", lipidDose, 1);
  }

  // DOL safety reminders
  if (dol === 1 && proteinDose > 1) {
    warnings.push("Protein exceeds DOL 1 limit of 1 g/kg/day.");
  } else if (dol === 2 && proteinDose > 2) {
    warnings.push("Protein exceeds DOL 2 limit of 2 g/kg/day.");
  } else if (dol === 3 && proteinDose > 3) {
    warnings.push("Protein exceeds DOL 3 limit of 3 g/kg/day.");
  } else if (dol >= 4 && proteinDose > 4) {
    warnings.push("Protein exceeds DOL 4 onwards limit of 4 g/kg/day.");
  }

  if (dol === 1 && lipidDose > 1) {
    warnings.push("Lipid exceeds DOL 1 suggested limit of 1 g/kg/day.");
  } else if (dol === 2 && lipidDose > 2) {
    warnings.push("Lipid exceeds DOL 2 suggested limit of 2 g/kg/day.");
  } else if (dol >= 3 && lipidDose > 3) {
    warnings.push("Lipid exceeds DOL 3 onwards suggested limit of 3 g/kg/day.");
  }

  let totalFeedMl = 0;

  if (feedVol > 0 && feedInterval > 0) {
    totalFeedMl = feedVol * (24 / feedInterval);
  }

  let feedRate = totalFeedMl / 24;

  let feedFluid = totalFeedMl / weight;
  let pnFluid = (pnRate * 24) / weight;
  let lipidFluid = (lipidRate * 24) / weight;
  let ivdFluid = (ivdRate * 24) / weight;

  let originalTotalFluid = feedFluid + pnFluid + lipidFluid + ivdFluid;

  let originalIvdRate = ivdRate;
  let originalPnRate = pnRate;

  let cutIvdRate = 0;
  let cutPnRate = 0;
  let addOnRate = 0;
  let fluidMessage = "";

  // If total fluid exceeds target: reduce IVD first, then PN
  if (originalTotalFluid > targetFluid) {
    let excessMlDay = (originalTotalFluid - targetFluid) * weight;

    let ivdMlDay = ivdRate * 24;

    if (ivdMlDay >= excessMlDay) {
      ivdRate = ivdRate - (excessMlDay / 24);
      cutIvdRate = originalIvdRate - ivdRate;
    } else {
      excessMlDay = excessMlDay - ivdMlDay;
      ivdRate = 0;
      cutIvdRate = originalIvdRate;

      let pnMlDay = pnRate * 24;

      if (pnMlDay >= excessMlDay) {
        pnRate = pnRate - (excessMlDay / 24);
        cutPnRate = originalPnRate - pnRate;
      } else {
        pnRate = 0;
        cutPnRate = originalPnRate;
        warnings.push("Even after stopping IVD and PN, fluid remains above target. Review feeds/lipid/target.");
      }
    }

    setValue("ivdRate", ivdRate, 1);
    setValue("pnRate", pnRate, 1);

    proteinDose = (pn.protein * pnRate * 24) / (100 * weight);
    setValue("proteinDose", proteinDose, 1);

    fluidMessage =
      "Fluid exceeded target. Reduce IVD by " + cutIvdRate.toFixed(1) + " mL/hr" +
      (cutPnRate > 0 ? " and reduce PN by " + cutPnRate.toFixed(1) + " mL/hr." : ".");

  } else if (originalTotalFluid < targetFluid) {
    let deficitMlDay = (targetFluid - originalTotalFluid) * weight;
    addOnRate = deficitMlDay / 24;

    fluidMessage =
      "Fluid below target. Suggested add-on IVD rate: " + addOnRate.toFixed(1) + " mL/hr.";

  } else {
    fluidMessage = "Fluid target achieved.";
  }

  // Recalculate fluid after adjustment
  pnFluid = (pnRate * 24) / weight;
  lipidFluid = (lipidRate * 24) / weight;
  ivdFluid = (ivdRate * 24) / weight;

  let totalFluid = feedFluid + pnFluid + lipidFluid + ivdFluid;

  // Nutrition
  let feedProtein = (milk.protein * totalFeedMl / 100) / weight;

  // PN protein is per 100 mL
  let pnProtein = (pn.protein * (pnRate * 24) / 100) / weight;

  let totalProtein = feedProtein + pnProtein;

  let actualLipidDose = (lipidConcentration * lipidRate * 24) / (100 * weight);

  let feedCalories = (milk.kcal * totalFeedMl / 100) / weight;

  // PN calories are per 100 mL
  let pnCalories = (pn.kcal * (pnRate * 24) / 100) / weight;

  let lipidCalories = (lipidRate * 24 * lipidKcalPerMl) / weight;

  let totalCalories = feedCalories + pnCalories + lipidCalories;

  // GDR
  let feedGDR = (milk.carb * feedRate) / (weight * 6);
  let pnGDR = (pn.glucose * pnRate) / (weight * 6);
  let ivdGDR = (dextrose * ivdRate) / (weight * 6);
  let totalGDR = feedGDR + pnGDR + ivdGDR;

  // Electrolytes
  // Milk values are mmol/L or mg/L depending on table.
  // PN values are mmol/100 mL.
  // IVD values are mmol/L.
  let sodium = (
    ((milk.na / 1000) * totalFeedMl) +
    ((pn.na / 100) * (pnRate * 24)) +
    ((ivd.na / 1000) * (ivdRate * 24))
  ) / weight;

  let potassium = (
    ((milk.k / 1000) * totalFeedMl) +
    ((pn.k / 100) * (pnRate * 24)) +
    ((ivd.k / 1000) * (ivdRate * 24))
  ) / weight;

  let chloride = (
    ((pn.cl / 100) * (pnRate * 24)) +
    ((ivd.cl / 1000) * (ivdRate * 24))
  ) / weight;

  let calcium = (
    ((milk.ca / 1000) * totalFeedMl) +
    ((pn.ca / 100) * (pnRate * 24)) +
    ((ivd.ca / 1000) * (ivdRate * 24))
  ) / weight;

  let phosphate = (
    ((milk.phos / 1000) * totalFeedMl) +
    ((pn.phos / 100) * (pnRate * 24))
  ) / weight;

  let magnesium = (
    ((pn.mg / 100) * (pnRate * 24)) +
    ((ivd.mg / 1000) * (ivdRate * 24))
  ) / weight;

  let acetate = (
    ((pn.acetate / 100) * (pnRate * 24)) +
    ((ivd.acetate / 1000) * (ivdRate * 24))
  ) / weight;

  setHTML("totalFluidOut",
    "Total Fluid: " + totalFluid.toFixed(1) + " mL/kg/day" +
    "<br>Feeds: " + feedFluid.toFixed(1) +
    " | PN: " + pnFluid.toFixed(1) +
    " | Lipid: " + lipidFluid.toFixed(1) +
    " | IVD: " + ivdFluid.toFixed(1)
  );

  setHTML("gdrOut",
    "Total GDR: " + totalGDR.toFixed(1) + " mg/kg/min" +
    "<br>Feeding GDR: " + feedGDR.toFixed(1) +
    "<br>PN GDR: " + pnGDR.toFixed(1) +
    "<br>IVD GDR: " + ivdGDR.toFixed(1)
  );

  setHTML("caloriesOut",
    "Calories: " + totalCalories.toFixed(1) + " kcal/kg/day" +
    "<br>Feeds: " + feedCalories.toFixed(1) +
    " | PN: " + pnCalories.toFixed(1) +
    " | Lipid: " + lipidCalories.toFixed(1)
  );

  setHTML("proteinOut",
    "Protein: " + totalProtein.toFixed(1) + " g/kg/day" +
    "<br>Feeds: " + feedProtein.toFixed(1) +
    " | PN amino acid: " + pnProtein.toFixed(1)
  );

  setHTML("lipidOut",
    "Lipid: " + actualLipidDose.toFixed(1) + " g/kg/day"
  );

  setHTML("naOut", "Sodium: " + sodium.toFixed(2) + " mmol/kg/day");
  setHTML("kOut", "Potassium: " + potassium.toFixed(2) + " mmol/kg/day");
  setHTML("clOut", "Chloride: " + chloride.toFixed(2) + " mmol/kg/day");
  setHTML("caOut", "Calcium: " + calcium.toFixed(2) + " mmol/kg/day");
  setHTML("phosOut", "Phosphate: " + phosphate.toFixed(2) + " mmol/kg/day");
  setHTML("mgOut", "Magnesium: " + magnesium.toFixed(2) + " mmol/kg/day");
  setHTML("acetateOut", "Acetate: " + acetate.toFixed(2) + " mmol/kg/day");

  let warningText = fluidMessage;

  if (warnings.length > 0) {
    warningText += "<br><br>" + warnings.join("<br>");
  }

  setHTML("warning", warningText);
}
