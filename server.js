//Подключаем необходимые модули
const express = require("express"); //библиотека (фреймворк) для создания веб-сервера
const fs = require("fs"); //модуль для работы с файловой системой
const path = require("path"); //модуль для работы с путями к файлам
const xml2js = require("xml2js"); // модуль для конвертации XML в JSON и обратно

//Создаем экземпляр веб-приложения
const app = express();
const PORT = 3000;

//указываем путь к данным
const xmlFilePath = path.join(__dirname, "Dat", "dat.xml");

//Используем встроенный middleware express.json() для разбора входящих запросов
app.use(express.json());

//Используем static для отдачи статичных файлов (html, css, js) из папки public
app.use(express.static("public"));

//API маршруты

//Маршрут для получения данных
app.get("/api/stocks", (req, res) => {
  //читаем xml
  fs.readFile(xmlFilePath, "utf8", (err, data) => {
    if (err) {
      //если ошибка чтения файла, тогда отправляем статус 500
      console.log("Ошибка чтения файла", err);
      return res.status(500).send("Не удалось обработать данные");
    }
    //создаем парсер для XML
    const parser = new xml2js.Parser();
    //Парсим XML данные в JSON
    parser.parseString(data, (err, result) => {
      if (err) {
        //если ошибка, тогда также отправляем статус 500
        console.log("Ошибка парсинга", err);
        return res.status(500).send("Не удалось обработать данные");
      }
      //Отправляем результат клиенту в JSON
      res.json(result.stocks.stock);
    });
  });
});

//Маршрут для добавления новой игры
app.post("/api/add-stock", (req, res) => {
  const newStock = req.body; //получаем данные новой игры из тела запроса
  //Простая валидация - проверяем, есть ли заголовок
  if (!newStock || !newStock.title) {
    return res
      .status(400)
      .send("Отсутствуют необходимые данные для добавления акции");
  }

  //читаем существующие данные
  fs.readFile(xmlFilePath, "utf8", (err, data) => {
    if (err) {
      console.log("Ощибка чтения XML файла для записи", err);
      return res.status(500).send("Не удалось получить доступ к данынм");
    }
    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.log("Ошибка парсинга ", err);
        return res.status(500).send("Не удалось обработать данные для записи");
      }
      //Добавляем новую акцию в массив акций
      //Убедимся массив stock существует
      if (!result.stocks.stock) {
        result.stoсks.stock = [];
      }
      result.stocks.stock.push(newStock);

      //Создаем  Builder для конвертации JSON обратно в xml
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      //Перезаписываме XML файл с новыми данными
      fs.writeFile(xmlFilePath, xml, "utf8", (err) => {
        if (err) {
          console.log("Ошибка записи в XML файл", err);
          return res.status(500).send("Не удалось сохранить новые данные");
        }
        //Отправляем успешный статус и сообщение
        res.status(201).send("Акция успешно добавлена!");
      });
    });
  });
});

//Запуск сервера

app.listen(PORT, () => {
  console.log(`Сервер запущен и работает на http://localhost:${PORT}`);
  console.log("Для остановки нажмите CTRL+C");
});

module.exports = app;
