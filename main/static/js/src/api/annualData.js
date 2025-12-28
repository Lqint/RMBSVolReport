export async function fetchAnnualData({ name, phone }) {
  const apiUrl = window.API_URL || "/api/get_annual_data";
  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ name, phone }),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.message || "Request failed");
  }
  return json;
}
