const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;

  // GET all recipes
  if (method === "GET" && !event.queryStringParameters?.id) {
    try {
      let allRecords = [];
      let offset = null;

      do {
        const url = new URL(AIRTABLE_URL);
        url.searchParams.set("sort[0][field]", "Created");
        url.searchParams.set("sort[0][direction]", "desc");
        if (offset) url.searchParams.set("offset", offset);

        const res = await fetch(url.toString(), { headers });
        const data = await res.json();
        allRecords = allRecords.concat(data.records || []);
        offset = data.offset;
      } while (offset);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allRecords),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // GET single recipe by ID
  if (method === "GET" && event.queryStringParameters?.id) {
    const id = event.queryStringParameters.id;
    try {
      const res = await fetch(`${AIRTABLE_URL}/${id}`, { headers });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // POST - create new recipe
  if (method === "POST") {
    try {
      const body = JSON.parse(event.body);
      const res = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          records: [{ fields: body }],
        }),
      });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.records[0]),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // PATCH - update recipe
  if (method === "PATCH") {
    try {
      const body = JSON.parse(event.body);
      const { id, ...fields } = body;
      const res = await fetch(`${AIRTABLE_URL}/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // DELETE recipe
  if (method === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      const res = await fetch(`${AIRTABLE_URL}/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
