const fs = require("fs/promises");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "ukraine_gaprice.json");
const OUTPUT_FILE = path.join(__dirname, "ukraine_gaprice_transformed.json");

// Мапа перекладу територій для Power BI
const territoryMap = {
  "Україна": "Ukraine",
  "Вінницька область": "Vinnytsia Oblast, Ukraine",
  "Волинська область": "Volyn Oblast, Ukraine",
  "Дніпропетровська область": "Dnipropetrovsk Oblast, Ukraine",
  "Донецька область": "Donetsk Oblast, Ukraine",
  "Житомирська область": "Zhytomyr Oblast, Ukraine",
  "Закарпатська область": "Zakarpattia Oblast, Ukraine",
  "Запорізька область": "Zaporizhzhia Oblast, Ukraine",
  "Івано-Франківська область": "Ivano-Frankivsk Oblast, Ukraine",
  "Київська область": "Kyiv Oblast, Ukraine",
  "Кіровоградська область": "Kirovohrad Oblast, Ukraine",
  "Луганська область": "Luhansk Oblast, Ukraine",
  "Львівська область": "Lviv Oblast, Ukraine",
  "Миколаївська область": "Mykolaiv Oblast, Ukraine",
  "Одеська область": "Odesa Oblast, Ukraine",
  "Полтавська область": "Poltava Oblast, Ukraine",
  "Рівненська область": "Rivne Oblast, Ukraine",
  "Сумська область": "Sumy Oblast, Ukraine",
  "Тернопільська область": "Ternopil Oblast, Ukraine",
  "Харківська область": "Kharkiv Oblast, Ukraine",
  "Херсонська область": "Kherson Oblast, Ukraine",
  "Хмельницька область": "Khmelnytskyi Oblast, Ukraine",
  "Черкаська область": "Cherkasy Oblast, Ukraine",
  "Чернівецька область": "Chernivtsi Oblast, Ukraine",
  "Чернігівська область": "Chernihiv Oblast, Ukraine",
  "м. Київ": "Kyiv, Ukraine"
};

function getMonthYearByIndex(index) {
  const startMonth = 7; // липень
  const startYear = 2021;

  const absoluteMonthIndex = (startMonth - 1) + index;
  const year = startYear + Math.floor(absoluteMonthIndex / 12);
  const month = (absoluteMonthIndex % 12) + 1;

  return { month, year };
}

async function main() {
  try {
    const raw = await fs.readFile(INPUT_FILE, "utf8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error("Очікувався масив у корені JSON");
    }

    const transformed = data.map((item, index) => {
      const { month, year } = getMonthYearByIndex(index);

      const newMeasurements = Array.isArray(item.measurements)
        ? item.measurements.map((m) => ({
            ...m,
            month,
            year,
            territory_en: territoryMap[m.territory] || m.territory
          }))
        : [];

      return {
        ...item,
        month,
        year,
        measurements: newMeasurements
      };
    });

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(transformed, null, 2), "utf8");

    console.log(`Готово. Записано у файл: ${OUTPUT_FILE}`);
    console.log(`Оброблено елементів верхнього масиву: ${transformed.length}`);
  } catch (error) {
    console.error("Помилка:", error);
    process.exit(1);
  }
}

main();