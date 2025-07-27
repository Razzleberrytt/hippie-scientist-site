function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry = {};
    headers.forEach((h, i) => {
      entry[h.trim()] = values[i].trim();
    });
    return entry;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const jsonContainer = document.getElementById('json-data');
  const csvContainer = document.getElementById('csv-data');

  try {
    const [jsonRes, csvRes] = await Promise.all([
      fetch('data/herbs_consolidated.json'),
      fetch('data/herbs_enriched.csv')
    ]);

    const jsonData = await jsonRes.json();
    const csvText = await csvRes.text();
    const csvData = parseCSV(csvText);

    jsonContainer.innerHTML =
      '<h2 class="text-xl font-bold mb-2">Herbs from JSON</h2>' +
      '<ul class="list-disc list-inside">' +
      jsonData.map(item => `<li>${item.name} - ${item.property}</li>`).join('') +
      '</ul>';

    csvContainer.innerHTML =
      '<h2 class="text-xl font-bold mb-2">Herbs from CSV</h2>' +
      '<ul class="list-disc list-inside">' +
      csvData.map(row => `<li>${row.Name} - ${row.Effect}</li>`).join('') +
      '</ul>';

  } catch (err) {
    jsonContainer.textContent = 'Error loading data.';
    csvContainer.textContent = 'Error loading data.';
    console.error(err);
  }
});
