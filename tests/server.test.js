const request = require('supertest');
const app = require('../server'); // Import the Express app
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Mock the fs and xml2js modules to control their behavior during tests
jest.mock('fs');
jest.mock('xml2js');

const xmlFilePath = path.join(__dirname, '..', 'Dat', 'dat.xml');

describe('GET /api/stocks', () => {
  const mockXmlData = `<stocks><stock><title>Apple</title><value>170</value></stock></stocks>`;
  const mockJsonData = { stocks: { stock: [{ title: ['Apple'], value: ['170'] }] } };

  beforeEach(() => {
    // Reset mocks before each test
    fs.readFile.mockReset();
    xml2js.Parser.mockClear();
    xml2js.Builder.mockClear();
  });

  test('should return 200 and stock data on successful read and parse', async () => {
    // Mock fs.readFile to return successful XML data
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, mockXmlData);
    });

    // Mock xml2js.Parser().parseString to return successful JSON data
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(null, mockJsonData);
      }),
    }));

    const response = await request(app).get('/api/stocks');

    expect(response.statusCode).toBe(200);
    // Ensure the response body matches the expected stock data structure
    expect(response.body).toEqual(mockJsonData.stocks.stock);
    expect(fs.readFile).toHaveBeenCalledWith(xmlFilePath, 'utf8', expect.any(Function));
  });

  test('should return 500 if fs.readFile encounters an error', async () => {
    // Mock fs.readFile to simulate an error
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(new Error('File read error'), null);
    });

    const response = await request(app).get('/api/stocks');

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Не удалось обработать данные'); // Check the error message
  });

  test('should return 500 if xml2js.Parser().parseString encounters an error', async () => {
    // Mock fs.readFile to return valid XML data
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, mockXmlData);
    });

    // Mock xml2js.Parser().parseString to simulate a parsing error
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(new Error('XML parsing error'), null);
      }),
    }));

    const response = await request(app).get('/api/stocks');

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Не удалось обработать данные'); // Check the error message
  });
});

describe('POST /api/add-stock', () => {
  const existingXmlData = `<stocks><stock><title>Microsoft</title><value>300</value></stock></stocks>`;
  const existingJsonData = { stocks: { stock: [{ title: ['Microsoft'], value: ['300'] }] } };
  const newStock = { title: 'Tesla', value: '800' };
  // Expected JSON after adding new stock, ensuring xml2js parsing behavior
  const expectedJsonAfterAdd = {
    stocks: {
      stock: [
        { title: ['Microsoft'], value: ['300'] },
        { title: 'Tesla', value: '800' },
      ],
    },
  };
  // Expected XML output from xml2js.Builder().buildObject
  const expectedXmlOutput = `<stocks><stock><title>Microsoft</title><value>300</value></stock><stock><title>Tesla</title><value>800</value></stock></stocks>`;


  beforeEach(() => {
    fs.readFile.mockReset();
    fs.writeFile.mockReset();
    xml2js.Parser.mockClear();
    xml2js.Builder.mockClear();
  });

  test('should return 400 if new stock data is missing title', async () => {
    const response = await request(app).post('/api/add-stock').send({});

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Отсутствуют необходимые данные для добавления акции');
  });

  test('should return 201 and add stock successfully', async () => {
    // Mock fs.readFile for existing XML data
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, existingXmlData);
    });

    // Mock xml2js.Parser().parseString to return existing JSON data
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(null, existingJsonData);
      }),
    }));

    // Mock xml2js.Builder().buildObject to return the expected XML string
    xml2js.Builder.mockImplementation(() => ({
      buildObject: jest.fn((obj) => expectedXmlOutput),
    }));


    // Mock fs.writeFile to simulate successful write
    fs.writeFile.mockImplementationOnce((path, data, encoding, callback) => {
      callback(null);
    });

    const response = await request(app).post('/api/add-stock').send(newStock);

    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('Акция успешно добавлена!');
    expect(fs.readFile).toHaveBeenCalledWith(xmlFilePath, 'utf8', expect.any(Function));
    expect(xml2js.Builder().buildObject).toHaveBeenCalledWith(expectedJsonAfterAdd);
    expect(fs.writeFile).toHaveBeenCalledWith(xmlFilePath, expectedXmlOutput, 'utf8', expect.any(Function));
  });

  test('should handle adding stock when the "stock" array does not exist in XML', async () => {
    const emptyStocksXml = `<stocks></stocks>`;
    const emptyStocksJson = { stocks: {} }; // No 'stock' array
    const newStockForEmpty = { title: 'Google', value: '1500' };
    const expectedJsonAfterAddEmpty = {
      stocks: {
        stock: [
          { title: 'Google', value: '1500' },
        ],
      },
    };
    const expectedXmlOutputEmpty = `<stocks><stock><title>Google</title><value>1500</value></stock></stocks>`;

    // Mock fs.readFile for empty stocks XML
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, emptyStocksXml);
    });

    // Mock xml2js.Parser().parseString to return empty stocks JSON
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(null, emptyStocksJson);
      }),
    }));

    // Mock xml2js.Builder().buildObject to return the expected XML string
    xml2js.Builder.mockImplementation(() => ({
      buildObject: jest.fn((obj) => expectedXmlOutputEmpty),
    }));

    // Mock fs.writeFile to simulate successful write
    fs.writeFile.mockImplementationOnce((path, data, encoding, callback) => {
      callback(null);
    });

    const response = await request(app).post('/api/add-stock').send(newStockForEmpty);

    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('Акция успешно добавлена!');
    expect(xml2js.Builder().buildObject).toHaveBeenCalledWith(expectedJsonAfterAddEmpty);
    expect(fs.writeFile).toHaveBeenCalledWith(xmlFilePath, expectedXmlOutputEmpty, 'utf8', expect.any(Function));
  });


  test('should return 500 if fs.readFile encounters an error during post', async () => {
    // Mock fs.readFile to simulate an error
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(new Error('File read error for POST'), null);
    });

    const response = await request(app).post('/api/add-stock').send(newStock);

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Не удалось получить доступ к данынм');
  });

  test('should return 500 if xml2js.Parser().parseString encounters an error during post', async () => {
    // Mock fs.readFile to return valid XML data
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, existingXmlData);
    });

    // Mock xml2js.Parser().parseString to simulate a parsing error
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(new Error('XML parsing error for POST'), null);
      }),
    }));

    const response = await request(app).post('/api/add-stock').send(newStock);

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Не удалось обработать данные для записи');
  });

  test('should return 500 if fs.writeFile encounters an error', async () => {
    // Mock fs.readFile to return valid XML data
    fs.readFile.mockImplementationOnce((path, encoding, callback) => {
      callback(null, existingXmlData);
    });

    // Mock xml2js.Parser().parseString to return existing JSON data
    xml2js.Parser.mockImplementation(() => ({
      parseString: jest.fn((xml, callback) => {
        callback(null, existingJsonData);
      }),
    }));

    // Mock xml2js.Builder().buildObject
    xml2js.Builder.mockImplementation(() => ({
      buildObject: jest.fn((obj) => expectedXmlOutput),
    }));

    // Mock fs.writeFile to simulate an error
    fs.writeFile.mockImplementationOnce((path, data, encoding, callback) => {
      callback(new Error('File write error'), null);
    });

    const response = await request(app).post('/api/add-stock').send(newStock);

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Не удалось сохранить новые данные');
  });
});
