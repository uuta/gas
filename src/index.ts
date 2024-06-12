function main() {
  try {
    const objLogs = getObjLogs();
    const objCategoryRelations = getObjCategoryRelations();
    const scores = scoring({ objLogs, objCategoryRelations });
    write(scores);
  } catch (e) {
    console.log("Failed with error %s", e.message);
  }
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

function getObjLogs(): Record<string, number>[] {
  const logsSheet = sheet("logs");
  const { lastUpdatedAt, row } = getStatus();
  const wholeLogs = logsSheet
    .getRange(row, 1, logsSheet.getLastRow(), logsSheet.getLastColumn())
    .getValues();
  if (row !== 2 && lastUpdatedAt !== wholeLogs[0][0]) {
    throw new Error("previous processing refers to the different data");
  }
  const logs = wholeLogs.shift();

  // logs to objects
  const logsHeaders: string[] = logsSheet
    .getRange(1, 1, 1, logsSheet.getLastColumn())
    .getValues()[0];
  const objLogs: Record<string, number>[] = [];
  for (let i = 1; i < logs.length; i++) {
    const row = logs[i];
    const obj: Record<string, number> = {};
    for (let j = 0; j < logsHeaders.length; j++) {
      obj[logsHeaders[j]] = row[j];
    }
    objLogs.push(obj);
  }
  return objLogs;
}

function scoring({
  objLogs,
  objCategoryRelations,
}: {
  objLogs: Record<string, number>[];
  objCategoryRelations: Record<string, ObjCategoryRelations>;
}): Record<string, Score> {
  const scoresSheet = sheet("scores");
  const scores: string[] = scoresSheet.getDataRange().getValues();
  const [, ...scoreRows] = scores;
  const { lastUpdatedAt } = getStatus();
  const score = {} as Record<string, Score>;
  scoreRows.forEach((row) => {
    const rowDate = new Date(row[0]).toLocaleDateString("UTC");
    if (lastUpdatedAt === undefined) {
      score[rowDate] = {
        shoulder: Number(row[1]),
        chest: Number(row[2]),
        butt: Number(row[3]),
        legs: Number(row[4]),
        stomach: Number(row[5]),
      };
      return;
    }
    const lastUpdatedAtDate = new Date(lastUpdatedAt).toLocaleDateString("UTC");
    if (rowDate >= lastUpdatedAtDate) {
      score[rowDate] = {
        shoulder: Number(row[1]),
        chest: Number(row[2]),
        butt: Number(row[3]),
        legs: Number(row[4]),
        stomach: Number(row[5]),
      };
    }
  });
  objLogs.forEach((l) => {
    Object.entries(objCategoryRelations).forEach(([key, value]) => {
      if (l[key] === undefined) {
        return;
      }
      if (l[value.countName] === undefined) {
        return;
      }
      const date = new Date(l.Timestamp).toLocaleDateString("UTC");
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

type Status = {
  lastUpdatedAt?: string;
  row: number;
};

function getObjCategoryRelations(): Record<string, ObjCategoryRelations> {
  const categoryRelationsSheet = sheet("category_relations");
  const categoriesSheet = sheet("categories");
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
  return objCategoryRelations;
}

function getStatus(): Status {
  const statusSheet = sheet("status");
  const status: string[][] = statusSheet.getDataRange().getValues();
  if (status[1] === undefined) {
    return {
      row: 2,
    };
  }
  return {
    lastUpdatedAt: status[1][0],
    row: Number(status[1][1]),
  };
}

// TODO: update status after writing
function setStatus(status: Status) {
  const statusSheet = sheet("status");
  const range = statusSheet.getRange(2, 1, 2, 1);
  range.setValues([[status.lastUpdatedAt, status.row]]);
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
