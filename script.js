const milkData = {
  "Cow Milk": {carb:4.6, protein:3.4, kcal:67, na:23, k:40, ca:124, phos:98},
  "Standard Formula": {carb:7.5, protein:1.5, kcal:67, na:6.4, k:14, ca:46, phos:33},
  "Mature Breastmilk": {carb:7.4, protein:1.1, kcal:70, na:6.4, k:15, ca:35, phos:15},
  "Preterm Formula": {carb:8.6, protein:2.0, kcal:80, na:14, k:19, ca:77, phos:41},
  "Preterm Breastmilk": {carb:6.4, protein:2.7, kcal:74, na:17, k:17, ca:29, phos:13}
};

const pnData = {
  "Type A": {protein:3.3, kcal:53.2, na:3, phos:1.5, ca:1.4, mg:0.25, cl:0, acetate:0, glucose:10},
  "Type B": {protein:3.0, kcal:52, na:3, phos:1.5, ca:0.15, mg:0.22, cl:2, acetate:0, glucose:10},
  "Type C": {protein:3.8, kcal:65.2, na:4, phos:1.5, ca:0.15, mg:0.25, cl:2.7, acetate:1, glucose:12.5}
};

const ivdData = {
  "1/5NS": {na:77, cl:77, k:0, ca:0},
  "HS": {na:77, cl:77, k:0, ca:0},
  "NS": {na:154, cl:154, k:0, ca:0},
  "3% Saline": {na:513, cl:513, k:0, ca:0},
  "HM": {na:131, cl:111, k:5, ca:2},
  "No Drip": {na:0, cl:0, k:0, ca:0}
};

// Lipid 20% = 20 g / 100 ml
const lipidConcentration = 20;

function calculate(){

  let weight = parseFloat(document.getElementById("weight").value) || 0;
  let targetFluid = parseFloat(document.getElementById("targetFluid").value) || 0;

  if(weight <= 0 || targetFluid <= 0){
    document.getElementById("warning").innerHTML = "Please enter weight and target fluid.";
    return;
  }

  let feedVol = parseFloat(document.getElementById("feedVol").value) || 0;
  let feedInterval = parseFloat(document.getElementById("feedInterval").value) || 0;

  let milkType = document.getElementById("milkType").value;
  let feedType = document.getElementById("feedingType").value;

  let pnType = document.getElementById("pnType").value;
  let proteinDose = parseFloat(document.getElementById("proteinDose").value) || 0;
  let pnRate = parseFloat(document.getElementById("pnRate").value) || 0;

  let lipidDose = parseFloat(document.getElementById("lipidDose").value) || 0;
  let lipidRate = parseFloat(document.getElementById("lipidRate").value) || 0;

  let ivdType = document.getElementById("ivdType").value;
  let ivdRate = parseFloat(document.getElementById("ivdRate").value) || 0;
  let dextrose = parseFloat(document.getElementById("dextrose").value) || 0;

  let milk = milkData[milkType];
  let pn = pnData[pnType];
  let ivd = ivdData[ivdType];

  if(feedType === "NBM"){
    feedVol = 0;
    feedInterval = 0;
  }

  if(feedType === "Full Feeding"){
    pnRate = 0;
    proteinDose = 0;
    lipidRate = 0;
    lipidDose = 0;
    ivdRate = 0;
    dextrose = 0;
  }

  if(ivdType === "No Drip"){
    ivdRate = 0;
    dextrose = 0;
  }

  // Convert PN intended protein dose to PN rate
  if(proteinDose > 0){
    pnRate = (proteinDose * weight * 100) / (pn.protein * 24);
    document.getElementById("pnRate").value = pnRate.toFixed(1);
  } else if(pnRate > 0){
    proteinDose = (pn.protein * pnRate * 24) / (100 * weight);
    document.getElementById("proteinDose").value = proteinDose.toFixed(1);
  }

  // Convert lipid intended dose to lipid rate
  if(lipidDose > 0){
    lipidRate = (lipidDose * weight * 100) / (lipidConcentration * 24);
    document.getElementById("lipidRate").value = lipidRate.toFixed(1);
  } else if(lipidRate > 0){
    lipidDose = (lipidConcentration * lipidRate * 24) / (100 * weight);
    document.getElementById("lipidDose").value = lipidDose.toFixed(1);
  }

  let totalFeedMl = 0;

  if(feedVol > 0 && feedInterval > 0){
    totalFeedMl = feedVol * (24 / feedInterval);
  }

  let feedRate = totalFeedMl / 24;

  let feedFluid = totalFeedMl / weight;
  let pnFluid = (pnRate * 24) / weight;
  let lipidFluid = (lipidRate * 24) / weight;
  let ivdFluid = (ivdRate * 24) / weight;

  let originalTotalFluid = feedFluid + pnFluid + lipidFluid + ivdFluid;

  let cutIvdRate = 0;
  let cutPnRate = 0;
  let addOnRate = 0;
  let adjustmentMessage = "";

  let totalFluid = originalTotalFluid;

  // If total fluid exceeds target, reduce IVD first, then PN
  if(originalTotalFluid > targetFluid){

    let excessMlKgDay = originalTotalFluid - targetFluid;
    let excessMlDay = excessMlKgDay * weight;

    let originalIvdRate = ivdRate;
    let originalPnRate = pnRate;

    let ivdMlDay = ivdRate * 24;

    if(ivdMlDay >= excessMlDay){
      ivdRate = ivdRate - (excessMlDay / 24);
      cutIvdRate = originalIvdRate - ivdRate;
    } else {
      excessMlDay = excessMlDay - ivdMlDay;
      ivdRate = 0;
      cutIvdRate = originalIvdRate;

      let pnMlDay = pnRate * 24;

      if(pnMlDay >= excessMlDay){
        pnRate = pnRate - (excessMlDay / 24);
        cutPnRate = originalPnRate - pnRate;
      } else {
        cutPnRate = originalPnRate;
        pnRate = 0;
      }
    }

    document.getElementById("ivdRate").value = ivdRate.toFixed(1);
    document.getElementById("pnRate").value = pnRate.toFixed(1);

    proteinDose = (pn.protein * pnRate * 24) / (100 * weight);
    document.getElementById("proteinDose").value = proteinDose.toFixed(1);

    totalFluid = targetFluid;

    adjustmentMessage =
      "Fluid exceeded target. Reduce IVD by " + cutIvdRate.toFixed(1) + " ml/hr" +
      (cutPnRate > 0 ? " and reduce PN by " + cutPnRate.toFixed(1) + " ml/hr." : ".");

  } else if(originalTotalFluid < targetFluid){

    let deficitMlKgDay = targetFluid - originalTotalFluid;
    addOnRate = (deficitMlKgDay * weight) / 24;

    adjustmentMessage =
      "Fluid below target. Suggested add-on IVD rate: " + addOnRate.toFixed(1) + " ml/hr.";

  } else {
    adjustmentMessage = "Fluid target achieved.";
  }

  // Recalculate after adjustment
  pnFluid = (pnRate * 24) / weight;
  lipidFluid = (lipidRate * 24) / weight;
  ivdFluid = (ivdRate * 24) / weight;
  totalFluid = feedFluid + pnFluid + lipidFluid + ivdFluid;

  let feedProtein = (milk.protein * totalFeedMl / 100) / weight;
  let pnProtein = (pn.protein * (pnRate * 24) / 100) / weight;
  let totalProtein = feedProtein + pnProtein;

  let feedCalories = (milk.kcal * totalFeedMl / 100) / weight;
  let pnCalories = (pn.kcal * (pnRate * 24) / 100) / weight;
  let actualLipidDose = (lipidConcentration * lipidRate * 24) / (100 * weight);
  let lipidCalories = actualLipidDose * 10;

  let totalCalories = feedCalories + pnCalories + lipidCalories;

  let feedGDR = (milk.carb * feedRate) / (weight * 6);
  let pnGDR = (pn.glucose * pnRate) / (weight * 6);
  let ivdGDR = (dextrose * ivdRate) / (weight * 6);
  let totalGDR = feedGDR + pnGDR + ivdGDR;

  let sodium = (
    ((milk.na / 1000) * totalFeedMl) +
    ((pn.na / 1000) * (pnRate * 24)) +
    ((ivd.na / 1000) * (ivdRate * 24))
  ) / weight;

  let potassium = (
    ((milk.k / 1000) * totalFeedMl) +
    ((ivd.k / 1000) * (ivdRate * 24))
  ) / weight;

  let chloride = (
    ((pn.cl / 1000) * (pnRate * 24)) +
    ((ivd.cl / 1000) * (ivdRate * 24))
  ) / weight;

  let calcium = (
    ((milk.ca / 1000) * totalFeedMl) +
    ((pn.ca / 1000) * (pnRate * 24)) +
    ((ivd.ca / 1000) * (ivdRate * 24))
  ) / weight;

  let phosphate = (
    ((milk.phos / 1000) * totalFeedMl) +
    ((pn.phos / 1000) * (pnRate * 24))
  ) / weight;

  let magnesium = (
    ((pn.mg / 1000) * (pnRate * 24))
  ) / weight;

  let acetate = (
    ((pn.acetate / 1000) * (pnRate * 24))
  ) / weight;

  document.getElementById("totalFluidOut").innerHTML =
    "Total Fluid: " + totalFluid.toFixed(1) + " ml/kg/day";

  document.getElementById("gdrOut").innerHTML =
    "Total GDR: " + totalGDR.toFixed(1) + " mg/kg/min " +
    "<br>Feeding GDR: " + feedGDR.toFixed(1) +
    "<br>PN GDR: " + pnGDR.toFixed(1) +
    "<br>IVD GDR: " + ivdGDR.toFixed(1);

  document.getElementById("caloriesOut").innerHTML =
    "Calories: " + totalCalories.toFixed(1) + " kcal/kg/day";

  document.getElementById("proteinOut").innerHTML =
    "Protein: " + totalProtein.toFixed(1) + " g/kg/day";

  document.getElementById("lipidOut").innerHTML =
    "Lipid: " + actualLipidDose.toFixed(1) + " g/kg/day";

  document.getElementById("naOut").innerHTML =
    "Sodium: " + sodium.toFixed(2) + " mmol/kg/day";

  document.getElementById("kOut").innerHTML =
    "Potassium: " + potassium.toFixed(2) + " mmol/kg/day";

  document.getElementById("clOut").innerHTML =
    "Chloride: " + chloride.toFixed(2) + " mmol/kg/day";

  document.getElementById("caOut").innerHTML =
    "Calcium: " + calcium.toFixed(2) + " mmol/kg/day";

  document.getElementById("phosOut").innerHTML =
    "Phosphate: " + phosphate.toFixed(2) + " mmol/kg/day";

  document.getElementById("mgOut").innerHTML =
    "Magnesium: " + magnesium.toFixed(2) + " mmol/kg/day";

  document.getElementById("acetateOut").innerHTML =
    "Acetate: " + acetate.toFixed(2) + " mmol/kg/day";

  document.getElementById("warning").innerHTML = adjustmentMessage;
}
