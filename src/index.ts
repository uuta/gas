function main() {
  scoring();
}

function sheet(name: string) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(name);
}

type ObjCategoryRelations = {
  countName: string;
  categoryName: string;
};

type Score = {
  shoulder: number;
  chest: number;
  butt: number;
  legs: number;
  stomach: number;
};

function scoring() {
  const logsSheet = sheet("logs");
  const scoresSheet = sheet("scores");
  const categoryRelationsSheet = sheet("category_relations");
  const categoriesSheet = sheet("categories");

  const logs = logsSheet.getDataRange().getValues();
  const categoryRelations = categoryRelationsSheet.getDataRange().getValues();
  const categories = categoriesSheet.getDataRange().getValues();
  const categoryRelationsHeader: string[] = categoryRelations.shift();
  const scoreHeader: string[] = scoresSheet.getDataRange().getValues().shift();

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
  const objLogs: Record<string, number>[] = [];
  for (let i = 1; i < logs.length; i++) {
    const row = logs[i];
    const obj: Record<string, number> = {};
    for (let j = 0; j < logsHeaders.length; j++) {
      obj[logsHeaders[j]] = row[j];
    }
    objLogs.push(obj);
  }

  // categoryRelations to objects
  const categoryRelationsHeaders = logs.shift();
  const objCategoryRelations: Record<string, ObjCategoryRelations> = {};
  for (let i = 1; i < categoryRelations.length; i++) {
    const row = categoryRelations[i];
    const obj: ObjCategoryRelations = {
      countName: row[3],
      categoryName: row[2],
    };
    objCategoryRelations[row[1]] = obj;
  }

  const score = {} as Score;
  scoreHeader.forEach((row) => (score[row] = 0));

  objLogs.forEach((l) => {
    Object.entries(objCategoryRelations).forEach(([key, value]) => {
      if (l[key] === undefined) {
        return;
      }
      if (l[value.countName] === undefined) {
        return;
      }
      score[value.categoryName] += l[key] * l[value.countName];
    });
  });
  Logger.log(score);
}

export { main };
