function main() {
  const scores = scoring();
  write(scores);
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

function scoring(): Record<string, Score> {
  const logsSheet = sheet("logs");
  const categoryRelationsSheet = sheet("category_relations");
  const categoriesSheet = sheet("categories");

  const logs = logsSheet.getDataRange().getValues();
  const categoryRelations: string[] = categoryRelationsSheet
    .getDataRange()
    .getValues();
  const [, ...categories] = categoriesSheet.getDataRange().getValues();

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
  const objCategoryRelations: Record<string, ObjCategoryRelations> = {};
  for (let i = 1; i < categoryRelations.length; i++) {
    const row = categoryRelations[i];
    const obj: ObjCategoryRelations = {
      countName: row[3],
      categoryName: row[2],
    };
    objCategoryRelations[row[1]] = obj;
  }

  const score = {} as Record<string, Score>;
  objLogs.forEach((l) => {
    Object.entries(objCategoryRelations).forEach(([key, value]) => {
      if (l[key] === undefined) {
        return;
      }
      if (l[value.countName] === undefined) {
        return;
      }
      const date = new Date(l.Timestamp).toLocaleDateString("ja-JP");
      if (!score[date]) {
        score[date] = {
          shoulder: 0,
          chest: 0,
          butt: 0,
          legs: 0,
          stomach: 0,
        };
      }
      if (value.categoryName in score[date]) {
        score[date][value.categoryName] += l[key] * l[value.countName];
      }
    });
  });
  return score;
}

function write(scores: Record<string, Score>) {
  const scoresSheet = sheet("scores");
  const targetRow = scoresSheet.getLastRow() + 1;
  const scoreArr = Object.entries(scores).map((entry) => [
    entry[0],
    ...Object.values(entry[1]),
  ]);
  const range = scoresSheet.getRange(
    targetRow,
    1,
    scoreArr.length,
    scoresSheet.Shift().length,
  );
  range.setValues(scoreArr);
}

export { main };
