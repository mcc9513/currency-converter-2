document.addEventListener("DOMContentLoaded", () => { //runs code once the DOM is fully loaded
  const baseCurrency = document.getElementById("base-currency");
  const targetCurrency = document.getElementById("target-currency");
  const amount = document.getElementById("amount");
  const convertedAmount = document.getElementById("converted-amount");
  const historicalRatesContainer = document.getElementById(
    "historical-rates-container"
  );
  const favoriteCurrencyPairs = document.getElementById(
    "favorite-currency-pairs"
  );

  const apiKey = "fca_live_6jDYxBwjZ8QH8NysLkgHeokVkk679qOZNRNJKLIf";
  const apiUrl = "https://api.freecurrencyapi.com/v1";

  let favorites = []; //initialize an empty array to store favorite currency pairs

  function getCurrencies() {
    fetch(`${apiUrl}/currencies?apikey=${apiKey}`) //fetches the list of currencies from the API
      .then((response) => response.json()) //parses the response into a JSON object
      .then((data) => {
        const symbols = data.data; //extracts the symbols object from the data
        for (const [currency, name] of Object.entries(symbols)) { //Object.entries converts 'symbols' to an array of arrays(key-value pairs), the for loop iterates over larger array, [currency, name] assignment destructures each array into two variables
          const option = document.createElement("option"); //creates HTML element <option>
          option.value = currency;
          option.textContent = `${currency}`; //text content = symbol, leaves out name
          baseCurrency.appendChild(option.cloneNode(true)); //clones the option node and appends it to base currency element bc DOM elements can't be in two places at once
          targetCurrency.appendChild(option); //appends original option node to target currency element
        }
      });
  }
  getCurrencies(); //calls the function to populate the currency dropdowns

  document.getElementById("convert").addEventListener("click", () => { //event listener for convert button
    const base = baseCurrency.value; 
    const target = targetCurrency.value;
    const amountValue = parseFloat(amount.value); //parses amount to a floating point number(whole number with decimal)

    if (!base || !target || isNaN(amountValue) || amountValue <= 0) { //makes sure base and target are not falsy, and amount is a number greater than 0
      alert("Please enter valid currencies and amount");
      return; //exits the function if amounts dont meet the criteria
    }

    fetch(
      `${apiUrl}/latest?apikey=${apiKey}&base_currency=${base}&currencies=${target}`, //fetches the latest exchange rate from the API using template literals
      {
        method: "GET",
      }
    )
      .then((response) => response.json()) //returns a promise that resolves with parsed JSON object
      .then((data) => {
        const rate = data.data[target]; //extracts the exchange rate from the data object
        if (rate) {
          const convertedAmountValue = amountValue * rate; 
          convertedAmount.textContent = `${convertedAmountValue.toFixed(2)} ${target}`; //displays the converted amount to two decimal places
        } else {
          alert("Conversion rate not found.");
        }
      })
      .catch((error) => alert("Error: " + error.message));
  });

  document.getElementById("historical-rates").addEventListener("click", () => {
    const base = baseCurrency.value;
    const target = targetCurrency.value;
    // const date = document.getElementById("historical-date").value;
    const date = "2012-12-12";

    if (!base || !target || !date) {
      alert("Please enter valid currencies and date");
      return;
    }

    fetch(
      `${apiUrl}/historical?apikey=${apiKey}&base_currency=${base}&currencies=${target}&date=${date}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json()) //returns a promise that resolves with parsed JSON object
      .then((data) => {
        const rate = data.data[date][target]; //extracts the exchange rate from the data object
        historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${base} = ${rate} ${target}`; //displays the historical exchange rate
      })
      .catch((error) =>
        console.error("Error fetching historical rates:", error)
      );
  });

  document.getElementById("save-favorite").addEventListener("click", () => { // event listener for save favorite button
    const base = baseCurrency.value;
    const target = targetCurrency.value;
    if (!base || !target) {
      alert("Please select valid currencies");
      return;
    }

    const favoritePair = `${base}/${target}`; //combines base and target currencies into a single string 'USD/EUR'
    if (!favorites.includes(favoritePair)) { //if the favorite pair is not already in the favorites array, push
      favorites.push(favoritePair);
      saveFavoriteToServer(base, target); //saves the favorite pair to the server
      updateFavorites(); //updates the UI with the new favorite pair
    }
  });

  function updateFavorites() {
    favoriteCurrencyPairs.innerHTML = ""; //clears the favorite currency pairs container before repopulating
    favorites.forEach((pair) => { //iterates over the favorites array
      const button = document.createElement("button"); //makes each new favorite pair a button
      button.textContent = pair; //sets the button text to the favorite pair
      button.addEventListener("click", () => { 
        const [base, target] = pair.split("/"); //currency pair string is splt into base and target currencies when the button is clicked
        baseCurrency.value = base;
        targetCurrency.value = target;
      });
      favoriteCurrencyPairs.appendChild(button); //appends the button to the favorite currency pairs container
    });
  }

  function saveFavoriteToServer(base, target) { //sends a POST request to the server to save the favorite pair
    fetch("/favorites", { //fetches the favorites endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base, target }), //converts the base and target currencies to a JSON string
    })
      .then((response) => response.json()) //returns a promise that resolves with parsed JSON object
      .then((data) => {
        console.log("Favorite saved:", data); 
      })
      .catch((error) => console.error("Error saving favorite:", error));
  }
  fetchFavorites(); //calls the function to fetch favorites from the server
  
  function fetchFavorites() { //fetches the favorite pairs from the server
    fetch("/favorites")
      .then((response) => response.json()) //returns a promise that resolves with parsed JSON object
      .then((data) => {
        favorites = data.map(favorite => `${favorite.base}/${favorite.target}`);
        updateFavorites(); //updates the UI with the fetched favorites
      })
      .catch((error) => console.error("Error fetching favorites:", error));
  }
});
fetchFavorites(); //calls the function to fetch favorites from the server
  