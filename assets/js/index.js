const confirmedCases = document.querySelector("#confirmed");
const confirmedDeaths = document.querySelector("#death");
const confirmedRecovered = document.querySelector("#recovered");
const date = document.querySelector("#date");
const pizzaChart = document.querySelector("#pizza");
const barChart = document.querySelector("#barras");
const BASE_URL = "https://api.covid19api.com";

const handleDateFormatter = (date) => {
  const receivedDate = new Date(date);
  const year = receivedDate.getFullYear();
  const month = (receivedDate.getMonth() + 1).toString().padStart(2, "0");
  const day = receivedDate.getDate().toString().padStart(2, "0");
  const hours = receivedDate.getHours().toString().padStart(2, "0");
  const minute = receivedDate.getMinutes().toString().padStart(2, "0");
  const formattedDate = `${day}/${month}/${year} ${hours}:${minute}`;
  return formattedDate;
};

class CovidDataHandler {
  async fetchData(url) {
    const response = await axios.get(url);
    return response;
  }

  async getSummaryCovidData() {
    const summary = await this.fetchData(`${BASE_URL}/summary`);
    return summary;
  }

  async getSummaryCovidDataByCountry() {
    const countrySummary = await this.fetchData(`${BASE_URL}/countries`);
    return countrySummary;
  }

  async getCovidDataByCountry(country, initialDate, finalDate) {
    const covidDataByCountry = await this.fetchData(
      `${BASE_URL}/country/${country}?from=${initialDate}&to=${finalDate}`
    );
    return covidDataByCountry;
  }
}

const covidSummaryHandler = async () => {
  try {
    const handler = new CovidDataHandler();
    const summaryData = await (await handler.getSummaryCovidData()).data;

    const { Countries } = summaryData;
    const { Date } = summaryData;
    const { TotalConfirmed, TotalDeaths, TotalRecovered } = summaryData.Global;

    confirmedCases.innerHTML = TotalConfirmed.toLocaleString();
    confirmedDeaths.innerHTML = TotalDeaths.toLocaleString();
    confirmedRecovered.innerHTML = TotalRecovered.toLocaleString();

    date.innerHTML += handleDateFormatter(Date);

    renderPolarChart(TotalConfirmed, TotalDeaths, TotalRecovered);
    renderBarChart(Countries);
  } catch (err) {
    console.log(err.message);
  }
};

covidSummaryHandler();

const renderPolarChart = function (...elements) {
  const polarChartElements = [...elements];
  const data = {
    labels: ["Novos Confirmados", "Novos Recuperados", "Novos Mortes"],
    datasets: [
      {
        label: "Distribuição de novos casos",
        data: [...polarChartElements],
        backgroundColor: [
          "rgb(255, 43, 132)",
          "rgb(75, 19, 192)",
          "rgb(255, 205, 40)",
        ],
      },
    ],
  };
  const config = {
    type: "doughnut",
    data: data,
    options: {},
  };
  new Chart(pizzaChart, config);
};

const renderBarChart = function (elements) {
  const topTenDeadliestCountries = elements
    .sort((a, b) => b.TotalDeaths - a.TotalDeaths)
    .slice(0, 10);

  const deathsPerCountry = [];
  const countryLabels = [];
  topTenDeadliestCountries.map(({ Country, TotalDeaths }) => {
    deathsPerCountry.push(TotalDeaths);
    countryLabels.push(Country);
  });

  const data = {
    labels: [...countryLabels],
    datasets: [
      {
        label: "Total de mortes por país - Top 10",
        data: [...deathsPerCountry],
        backgroundColor: ["rgba(153, 102, 255)"],
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  new Chart(barChart, config);
};

export { CovidDataHandler, handleDateFormatter };
