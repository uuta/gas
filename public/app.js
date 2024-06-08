let global = this;

"use strict";
(() => {
  // src/index.ts
  function main() {
    scoring();
  }
  function sheet(name) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    return spreadsheet.getSheetByName(name);
  }
  function scoring() {
    const logsSheet = sheet("logs");
    const scoresSheet = sheet("scores");
    const categoryRelationsSheet = sheet("category_relations");
    const categoriesSheet = sheet("categories");
    const logs = logsSheet.getDataRange().getValues();
    const categoryRelations = categoryRelationsSheet.getDataRange().getValues();
    const categories = categoriesSheet.getDataRange().getValues();
    const categoryRelationsHeader = categoryRelations.shift();
    const scoreHeader = scoresSheet.getDataRange().getValues().shift();
    categoryRelations.forEach(function(categoryRelation, i) {
      categories.forEach(function(category) {
        if (categoryRelation[2] === category[0]) {
          categoryRelations[i] = Array.from(
            /* @__PURE__ */ new Set([...categoryRelation, ...category])
          );
        }
      });
    });
    const logsHeaders = logs.shift();
    const objLogs = [];
    for (let i = 1; i < logs.length; i++) {
      const row = logs[i];
      const obj = {};
      for (let j = 0; j < logsHeaders.length; j++) {
        obj[logsHeaders[j]] = row[j];
      }
      objLogs.push(obj);
    }
    const categoryRelationsHeaders = logs.shift();
    const objCategoryRelations = {};
    for (let i = 1; i < categoryRelations.length; i++) {
      const row = categoryRelations[i];
      const obj = {
        countName: row[3],
        categoryName: row[2]
      };
      objCategoryRelations[row[1]] = obj;
    }
    const score = {};
    scoreHeader.forEach((row) => score[row] = 0);
    objLogs.forEach((l) => {
      Object.entries(objCategoryRelations).forEach(([key, value]) => {
        if (l[key] === void 0) {
          return;
        }
        if (l[value.countName] === void 0) {
          return;
        }
        score[value.categoryName] += l[key] * l[value.countName];
      });
    });
    Logger.log(score);
  }
})();
