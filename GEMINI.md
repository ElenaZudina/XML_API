# Project Overview

This is a Node.js web server application built with Express. It serves static files from the `public` directory and provides a simple API for managing stock data stored in an XML file (`Dat/dat.xml`). The application uses `xml2js` for converting between XML and JSON formats.

## Main Features:
*   Serves static web content (HTML, CSS, JavaScript) from the `public` folder.
*   `GET /api/stocks`: Retrieves stock data from `Dat/dat.xml`, converts it to JSON, and returns it to the client.
*   `POST /api/add-stock`: Accepts new stock data as JSON, appends it to `Dat/dat.xml`, and saves the updated XML file.

## Technologies Used:
*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **xml2js**: A JavaScript XML parser and builder.

## Building and Running

To set up and run this project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
    This command will install all the necessary packages listed in `package.json`.

2.  **Run the Server:**
    ```bash
    node server.js
    ```
    The server will start and listen on `http://localhost:3000`. You will see a message in the console indicating that the server is running.

## Development Conventions

*   **Server Entry Point:** The main server logic resides in `server.js`.
*   **Static Assets:** All public-facing static assets (HTML, CSS, JavaScript, images) are located in the `public` directory.
*   **Data Storage:** Stock data is stored in XML format in `Dat/dat.xml`.
*   **API Endpoints:**
    *   `/api/stocks` for fetching stock data.
    *   `/api/add-stock` for adding new stock data.
*   **Error Handling:** Basic error logging and 500 status responses are implemented for file and parsing errors.

## Testing

The `package.json` indicates that `jest` is configured for testing, but no specific test files were analyzed. To run tests:

```bash
npm test
```
