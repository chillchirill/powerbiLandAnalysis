async function getKPI(month, year) {
  try {
    const res = await fetch(
      `https://monitoring.land.gov.ua:10010/mis/api/v1/kpi-land-market?kpi_enum=land_market_average_price_per_ga&agg_period_code=month&report_month=${month}%2F01%2F${year}&locale=uk`
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } catch (err) {
    console.error(`❌ Error for ${month}/${year}:`, err.message);
    return null;
  }
}

async function run() {
  const results = [];

  for (let year = 2025; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {

      if (year === 2025 && month < 7) continue;
      if (year === 2026 && month > 3) break;

      console.log(`➡️ Fetching ${month}/${year}`);

      const data = await getKPI(month, year);

      if (data !== null) {
        results.push(data);
      }
    }
  }

  const finalJsonString = `[${results.join(",")}]`;

  return finalJsonString; // ← ВАЖЛИВО
}


run()
  .then(result => {
    console.log("✅ RESULT:");
    console.log(result);

    // якщо треба як об'єкт:
    const parsed = JSON.parse(result);
    console.log("📦 Parsed:", parsed);
  })
  .catch(err => {
    console.error("💥 Unhandled error:", err);
  });