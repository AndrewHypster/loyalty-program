import { google } from "googleapis";

const find = async ({ sheets, range, element }) => {
  // 1. Читаємо заголовки (перший рядок)
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: range + "1:1",
  });
  const headers = headerResp.data.values?.[0] || [];

  // 2. Читаємо першу колонку (крім заголовка)
  const colResp = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: range + "A2:A",
  });
  const firstCol = colResp.data.values?.flat() || [];

  // 3. Знаходимо індекс рядка
  const rowIndex = firstCol.indexOf(element);
  if (rowIndex === -1) return { found: false, row: null };

  // 4. Читаємо увесь рядок, що співпадає
  const rowResp = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${range}${rowIndex + 2}:${rowIndex + 2}`, // +2 через заголовок і 0-based індекс
  });
  const rowValues = rowResp.data.values?.[0] || [];

  // 5. Формуємо об’єкт
  const rowObj = {};
  headers.forEach((header, i) => {
    rowObj[header] = rowValues[i] !== undefined ? rowValues[i] : null;
  });
  rowObj["index"] = rowIndex + 2;

  return rowObj;
};

export async function POST(req) {
  const body = await req.json();

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({
      auth,
      version: "v4",
    });

    if (body.action === "ADD_USER" && body.email && body.password) {
      const user = find({ sheets, range: "users!", element: body.email });

      if (user)
        return new Response(
          JSON.stringify({ success: false, msg: "Касир вже є" }),
          {
            status: 200,
          }
        );

      const res = sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "clients!A1:B1",
        valueInputOption: "RAW",
        requestBody: {
          values: [[body.email, body.password]],
        },
      });

      return new Response(
        JSON.stringify({ success: true, msg: "Касира додано" }),
        {
          status: 200,
        }
      );
    } else if (body.action === "DEL_USER" && body.email) {
      const user = find({ sheets, range: "users!", element: body.email });

      const sheet = spreadsheet.data.sheets.find(
        (s) => s.properties.title === "users"
      );

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  dimension: "ROWS",
                  startIndex: user.index - 1, // API 0-based
                  endIndex: user.index, // не включно
                },
              },
            },
          ],
        },
      });

      return new Response(
        JSON.stringify({ success: true, msg: "Видалено касира" }),
        {
          status: 200,
        }
      );
    } else if (body.action === "FIND_USER" && body.email) {
      const user = await find({
        sheets,
        range: "users!",
        element: body.email,
      });

      return new Response(JSON.stringify(user), {
        status: 200,
      });
    }
    // --------------------------------------------------------------------- //
    else if (body.action === "ADD_CLIENT" && body.phone && body.bonus) {
      const client = await find({
        sheets,
        range: "clients!",
        element: body.phone,
      });

      if (client.phone)
        return new Response(
          JSON.stringify({ success: false, msg: "Клієнт вже є" }),
          {
            status: 200,
          }
        );

      const res = sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "clients!A1:B1",
        valueInputOption: "RAW",
        requestBody: {
          values: [[body.phone, body.bonus]],
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          msg: "Клієнта додано",
          phone: body.phone,
          bonus: body.bonus,
        }),
        {
          status: 200,
        }
      );
    } else if (body.action === "FIND_CLIENT" && body.phone) {
      const client = await find({
        sheets,
        range: "clients!",
        element: body.phone,
      });

      if (client.phone) {
        return new Response(JSON.stringify({ success: true, client }), {
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({ success: false }), {
          status: 200,
        });
      }
    } else if (body.action === "CHANGE_CLIENT" && body.phone & body.bonus) {
      const client = await find({
        sheets,
        range: "clients!",
        element: body.phone,
      });
      console.log(client, "CLIENT");

      if (!client)
        return new Response(
          JSON.stringify({ success: false, msg: "Клієнта такого нема" }),
          {
            status: 200,
          }
        );

      const range = `clients!B${client.index}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        valueInputOption: "RAW", // "USER_ENTERED" якщо хочеш, щоб форматування працювало
        requestBody: {
          values: [[body.bonus]],
        },
      });

      return new Response(
        JSON.stringify({ success: true, msg: "Бонуси змінено" }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Google Sheets API error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
