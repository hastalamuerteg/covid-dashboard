import { CovidDataHandler, handleDateFormatter } from "../js/index.js";

const totalConfirmedCases = document.querySelector("#kpiconfirmed");
const totalDeathsCases = document.querySelector("#kpideaths");
const totalRecoveredCases = document.querySelector("#kpirecovered");

const comboCountry = document.querySelector("#cmbCountry");
const comboData = document.querySelector("#cmbData");
const startDate = document.querySelector("#date_start");
const finalDate = document.querySelector("#date_end");

const btnFilter = document.querySelector("#filtro");
const lineChart = document.querySelector("#linhas");

const handleCasesDashboard = function (...data) {
  const { TotalConfirmed, TotalDeaths, TotalRecovered } = data[0];
  totalConfirmedCases.innerHTML = TotalConfirmed.toLocaleString();
  totalDeathsCases.innerHTML = TotalDeaths.toLocaleString();
  totalRecoveredCases.innerHTML = TotalRecovered.toLocaleString();
};

const populateCountryOptions = (countries) => {
  const countryList = countries.map((country) => country.Slug);
  countryList.forEach((countrySlug) => {
    const option = document.createElement("option");
    option.innerHTML = countrySlug;
    comboCountry.appendChild(option);
  });
};

const handleCovidDataByCountry = async function () {
  const byCountryCovidDataHandler = new CovidDataHandler();
  const countriesData = await (
    await byCountryCovidDataHandler.getSummaryCovidData()
  ).data;
  const countriesSlugs = countriesData.Countries.map((country) => country);

  populateCountryOptions(countriesSlugs);
};

handleCovidDataByCountry();

const filterDataByCountry = async function () {
  const choosenStartDate = startDate.value;
  const choosenFinalDate = finalDate.value;
  const choosenCountry = comboCountry.value;

  let filteredConfirmedCases = [];
  let filteredDeathsCases = [];
  let filteredRecoveredCases = [];
  let filteredDates = [];

  const filterData = new CovidDataHandler();
  const filteredData = await (
    await filterData.getCovidDataByCountry(
      choosenCountry,
      `${choosenStartDate}T00:00:00Z`,
      `${choosenFinalDate}T23:59:59Z`
    )
  ).data;

  filteredData.forEach(({ Confirmed, Deaths, Recovered, Date }) => {
    filteredConfirmedCases.push(Confirmed);
    filteredDeathsCases.push(Deaths);
    filteredRecoveredCases.push(Recovered);
    filteredDates.push(Date);
  });

  let totalFilteredConfirmed = filteredConfirmedCases.reduce(
    (acc, cur) => (acc = cur - acc)
  );
  let totalFilteredDeaths = filteredDeathsCases.reduce(
    (acc, cur) => (acc = cur - acc)
  );
  let totalFilteredRecovered = filteredRecoveredCases.reduce(
    (acc, cur) => (acc = cur - acc)
  );
  let totalFormattedDates = filteredDates.map((date) =>
    handleDateFormatter(date)
  );

  handleCasesDashboard({
    TotalConfirmed: totalFilteredConfirmed,
    TotalDeaths: totalFilteredDeaths,
    TotalRecovered: totalFilteredRecovered,
  });

  renderLineChart(
    filteredConfirmedCases,
    filteredDeathsCases,
    filteredRecoveredCases,
    totalFormattedDates
  );
};

btnFilter.addEventListener("click", filterDataByCountry);

const renderLineChart = function (...chartData) {
  let currentChartData;
  if (comboData.value === "Confirmed") {
    currentChartData = [...chartData[0]];
  } else if (comboData.value === "Deaths") {
    currentChartData = [...chartData[1]];
  } else {
    currentChartData = [...chartData[2]];
  }

  console.log(currentChartData);
  console.log(
    (
      currentChartData.reduce((acc, cur) => acc + cur) / currentChartData.length
    ).toLocaleString()
  );
  const dates = [...chartData[3]];
  const labels = [...dates];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Curva diária do Covid-19",
        data: [...currentChartData],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
  };

  new Chart(lineChart, config);
};
