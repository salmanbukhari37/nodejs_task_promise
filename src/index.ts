import * as http from "http";
import { URL } from "url";
import { fetchTitle } from "./fetchTitle";
import dotenv from "dotenv";
import { ServerMessages } from "./enums/messages"; // Import the message enum
import { TitleResult } from "./interfaces/TitleResult";

// Load environment variables from .env file
dotenv.config();

// Get the port from environment variables, defaulting to 3000 if not set
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "", `http://${req.headers.host}`);

  const pathname = reqUrl.pathname.replace(/\/$/, ""); // Removes trailing slash

  if (pathname === "/I/want/title") {
    const addresses = reqUrl.searchParams.getAll("address");

    if (addresses.length === 0) {
      // No addresses provided
      res.writeHead(400, { "Content-Type": "text/html" });
      res.write("<html><head></head><body>");
      res.write(`<h1>${ServerMessages.NO_ADDRESSES_PROVIDED}</h1>`); // Use the enum message
      res.write(
        "<p>Please provide at least one address in the query parameters.</p>"
      );
      res.write("</body></html>");
      res.end();
    } else {
      try {
        // Use Promise.all to fetch all titles in parallel
        const results: TitleResult[] = await Promise.all(
          addresses.map((address) => fetchTitle(address))
        );

        // Filter out null results (if needed)
        const filteredResults = results.filter((result) => result !== null);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<html><head></head><body>");
        res.write(`<h1>${ServerMessages.FETCH_TITLES}</h1>`); // Use the enum message
        res.write("<ul>");
        filteredResults.forEach((result) => {
          res.write(`<li>${result.address} - "${result.title}"</li>`);
        });
        res.write("</ul></body></html>");
        res.end();
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(ServerMessages.SERVER_ERROR); // Use the enum message
      }
    }
  } else {
    // Return 404 for all other routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end(ServerMessages.NOT_FOUND); // Use the enum message
  }
});

// Use the port from the .env file
server.listen(PORT, () => {
  console.log(`${ServerMessages.SERVER_RUNNING} http://localhost:${PORT}/`); // Use the enum message
});
