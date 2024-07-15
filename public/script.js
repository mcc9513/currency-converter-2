document.addEventListener("DOMContentLoaded", () => {
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

  let favorites = [];

  function getCurrencies() {
    fetch(`${apiUrl}/currencies?apikey=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        const symbols = data.data;
        for (const [currency, name] of Object.entries(symbols)) {
          const option = document.createElement("option");
          option.value = currency;
          option.textContent = `${currency}`;
          baseCurrency.appendChild(option.cloneNode(true));
          targetCurrency.appendChild(option);
        }
      });
  }
  getCurrencies();

  document.getElementById("convert").addEventListener("click", () => {
    const base = baseCurrency.value;
    const target = targetCurrency.value;
    const amountValue = parseFloat(amount.value);

    if (!base || !target || isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter valid currencies and amount");
      return;
    }

    fetch(
      `${apiUrl}/latest?apikey=${apiKey}&base_currency=${base}&currencies=${target}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const rate = data.data[target];
        if (rate) {
          const convertedAmountValue = amountValue * rate;
          convertedAmount.textContent = `${convertedAmountValue.toFixed(
            2
          )} ${target}`;
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
      .then((response) => response.json())
      .then((data) => {
        const rate = data.data[date][target];
        historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${base} = ${rate} ${target}`;
      })
      .catch((error) =>
        console.error("Error fetching historical rates:", error)
      );
  });

  document.getElementById("save-favorite").addEventListener("click", () => {
    const base = baseCurrency.value;
    const target = targetCurrency.value;
    if (!base || !target) {
      alert("Please select valid currencies");
      return;
    }

    const favoritePair = `${base}/${target}`;
    if (!favorites.includes(favoritePair)) {
      favorites.push(favoritePair);
      saveFavoriteToServer(base, target);
      updateFavorites();
    }
  });

  function updateFavorites() {
    favoriteCurrencyPairs.innerHTML = "";
    favorites.forEach((pair) => {
      const button = document.createElement("button");
      button.textContent = pair;
      button.addEventListener("click", () => {
        const [base, target] = pair.split("/");
        baseCurrency.value = base;
        targetCurrency.value = target;
      });
      favoriteCurrencyPairs.appendChild(button);
    });
  }

  function saveFavoriteToServer(base, target) {
    fetch("/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base, target }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Favorite saved:", data);
      })
      .catch((error) => console.error("Error saving favorite:", error));
  }
  fetchFavorites();
  
  function fetchFavorites() {
    fetch("/favorites")
      .then((response) => response.json())
      .then((data) => {
        favorites = data.map(favorite => `${favorite.base}/${favorite.target}`);
        updateFavorites();
      })
      .catch((error) => console.error("Error fetching favorites:", error));
  }
});
