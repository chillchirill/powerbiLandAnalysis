const fs = require("fs/promises");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "ukraine_gaprice_transformed.json");
const MEASUREMENTS_FILE = path.join(__dirname, "measurements.csv");
const TOTALS_FILE = path.join(__dirname, "totals.csv");

// --- helper: екранування CSV ---
function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// --- convert array -> CSV ---
function toCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);

  const rows = data.map(row =>
    headers.map(h => escapeCSV(row[h])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

async function main() {
  try {
    const raw = await fs.readFile(INPUT_FILE, "utf8");
    const data = JSON.parse(raw);

    const measurements = [];
    const totals = [];

    for (const item of data) {
      const { month, year } = item;

      // --- measurements ---
      if (Array.isArray(item.measurements)) {
        for (const m of item.measurements) {
          measurements.push({
            kpi_enum: m.kpi_enum,
            territory: m.territory,
            territory_code: m.territory_code,
            group: m.group,
            value: m.value,
            cnt_cost_not_null: m.cnt_cost_not_null,
            layer: m.layer,
            value_data: m.value_data,
            value_data_prev: m.value_data_prev,
            month: m.month ?? month,
            year: m.year ?? year,
            territory_en: m.territory_en
          });
        }
      }

      // --- totals ---
      if (item.totals) {
        totals.push({
          kpi_enum: item.totals.kpi_enum,
          agg_date_left_bound: item.totals.agg_date_left_bound,
          territory: item.totals.territory,
          territory_code: item.totals.territory_code,
          null_value_cnt: item.totals.null_value_cnt,
          not_null_value_cnt: item.totals.not_null_value_cnt,
          total_cnt: item.totals.total_cnt,
          min_value: item.totals.min_value,
          max_value: item.totals.max_value,
          median_value: item.totals.median_value,
          avg_value: item.totals.avg_value,
          sum_area: item.totals.sum_area,
          avg_cost_per_one_ha: item.totals.avg_cost_per_one_ha,
          month,
          year
        });
      }
    }

    // --- write CSV ---
    await fs.writeFile(MEASUREMENTS_FILE, toCSV(measurements), "utf8");
    await fs.writeFile(TOTALS_FILE, toCSV(totals), "utf8");

    console.log("Готово:");
    console.log(`Measurements -> ${MEASUREMENTS_FILE} (${measurements.length})`);
    console.log(`Totals -> ${TOTALS_FILE} (${totals.length})`);

  } catch (err) {
    console.error("Помилка:", err);
    process.exit(1);
  }
}

main();