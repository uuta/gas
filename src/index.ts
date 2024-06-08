function main() {
  scoring();
}

function sheet(name: string) {
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

  categoryRelations.forEach(function (categoryRelation, i) {
    categories.forEach(function (category) {
      if (categoryRelation[2] === category[0]) {
        categoryRelations[i] = Array.from(
          new Set([...categoryRelation, ...category]),
        );
      }
    });
  });

  // logs to objects
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

  // categoryRelations to objects
  const categoryRelationsHeaders = logs.shift();
  const objCategoryRelations = {};
  for (let i = 1; i < categoryRelations.length; i++) {
    const row = categoryRelations[i];
    const obj = {
      countName: row[3],
      categoryName: row[2],
    };
    objCategoryRelations[row[1]] = obj;
  }

  const score = {};
  scoreHeader.forEach((row) => (score[row] = 0));
  Logger.log(score);

  objLogs.forEach((l) => {
    Object.entries(l).forEach(([key, value]) => {
      if (objCategoryRelations[key] === undefined) {
        return;
      }
    });
  });
}
