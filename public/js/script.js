//Ждем, пока структура HTML документа будет загружена
document.addEventListener("DOMContentLoaded", () => {
  //Получаем ссылки на нужные элементы DOM
  const stockListContainer = document.getElementById("stock-list-container");
  const addStockForm = document.getElementById("add-stock-form");

  //Создаем функции для получения игр с сервера и отображения на странице
  const fetchAndDisplayStocks = async () => {
    try {
      //Отправляем GET запрос к API для поулчения списка игр
      const response = await fetch("/api/stocks");
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }
      //парсим ответ из JSON
      const stocks = await response.json();

      //Очистим контейнер перед обнволением данных
      stockListContainer.innerHTML = "";

      //Проверяем, есть ли игры в полученных данных
      if (stocks && stocks.length > 0) {
        //Проходимся по каждой акции
        stocks.forEach((stock) => {
          //Создаем новый div=элемент для карточки акции
          const stockCard = document.createElement("div");
          stockCard.className = "stock-card";

          //Заполняем карточку игры данынми из конкретного game
          stockCard.innerHTML = `
                        <img src="${stock.img[0]}" class="stock-image"/>
                        <h3>${stock.title[0]}</h3>
                        <p><strong>Дата выхода:</strong>${stock.release_date[0]}</p>
                        <p><strong>Категория:</strong>${stock.category[0]}</p>
                        <p><strong>Описание:</strong>${stock.description[0]}</p>
                    `;
          //Выводим созданную карточку в контейнер на страницу
          stockListContainer.appendChild(stockCard);
        });
      } else {
        //если игр нет, просто выводим сообщение
        stockListContainer.innerHTML = "<p>В базе акций нет</p>";
      }
    } catch (error) {
      //В случае ошибки, выводим ее в консоль и на страницу
      console.error("Ошибка при получении данных об акциях", error);
      stockListContainer.innerHTML =
        "<p>Не удалось загрузить данные. Проверьте, запущен ли сервер</p>";
    }
  };
  /**
   * Обработчик события отпарвки формы
   */
  addStockForm.addEventListener("submit", async (event) => {
    //предотвращаем стандартное поведение формы (перезагрузка страницы)
    event.preventDefault();

    //Собираем данные из полей формы в объект
    const newStock = {
      img: document.getElementById("img").value,
      title: document.getElementById("title").value,
      release_date: document.getElementById("release_date").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
    };

    try {
      //Отпарвляем POST запрос на сервер для добавленият новой акции
      const response = await fetch("/api/add-stock", {
        method: "POST",
        headers: {
          "Content-type": "application/json", //Указываем, что в теле запроса - JSON
        },
        body: JSON.stringify(newStock), //преобразуем объект в JSON
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${await response.text()}`);
      }

      //Если акция успешно добавлена, то очищаем поле формы
      addStockForm.reset();

      //Обнровляем список акций на странице, чтбы увидеть новую запись
      fetchAndDisplayStocks();
    } catch (error) {
      //в случае ошибки выводим ее в консоль и показываем пользовател.
      console.error("Ошибка при добавлении акции", error);
      alert(`Не удалось добавить акцию. Ошибка: ${error.message}`);
    }
  });
  //Первоначальная загрузка и отображение акций при загрузке страницы
  fetchAndDisplayStocks();
});
