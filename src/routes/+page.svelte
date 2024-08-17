<script lang="ts">
  import { onMount } from "svelte";

  let pm10: string = "Cargando...";
  let pm25: string = "Cargando...";
  let aqiLevelPm10: string = "";
  let aqiColorPm10: string = "";
  let aqiLevelPm25: string = "";
  let aqiColorPm25: string = "";

  const token: string = "00:80:A3:FB:0D:A3";
  const macAddr: string = "00:80:A3:FB:0D:A3";
  const windDirection: string = "SE";
  const pm1: number = 7.081;
  const pm25Value: number = 7.594;
  const pm4: number = 7.094;
  const pm10Value: number = 7.594;
  const voltage: number = 11.988;
  const current: number = 0.066;

  let datetimeNode: string;

  function updateDatetime(): void {
    datetimeNode = new Date().toISOString();
  }

  let latitude: string = "-2.15";
  let longitude: string = "-79.95";

  interface Parameter {
    parameter: string;
    value: string | number;
    unit: string;
  }

  let parameters: Parameter[] = [
    { parameter: "vaneAngle", value: 110, unit: "deg" },
    { parameter: "windSpeed", value: "1.45", unit: "kmh" },
    { parameter: "noiseLevel", value: 30.1, unit: "db" },
    { parameter: "temperature", value: 26.405, unit: "celsius" },
    { parameter: "relHumidity", value: 74.165, unit: "%" },
  ];

  function determineAQI(value: number): { level: string; color: string } {
    if (value <= 50) return { level: "Buena", color: "green" };
    if (value <= 100) return { level: "Moderada", color: "yellow" };
    if (value <= 150)
      return { level: "Dañina para grupos sensibles", color: "orange" };
    if (value <= 200) return { level: "Dañina a la salud", color: "red" };
    if (value <= 300)
      return { level: "Muy dañina a la salud", color: "purple" };
    return { level: "Peligrosa", color: "brown" };
  }

  let fetchUrl: string = "https://8507-35-201-211-225.ngrok-free.app";

  async function getPrediction(): Promise<void> {
    try {
      updateDatetime();

      const response = await fetch(fetchUrl + "/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          macAddr,
          datetimeNode,
          latitude,
          longitude,
          data: [
            ...parameters,
            { parameter: "windDirection", value: windDirection, unit: "na" },
            { parameter: "pm1", value: pm1, unit: "ug/m3" },
            { parameter: "pm2.5", value: pm25Value, unit: "ug/m3" },
            { parameter: "pm4", value: pm4, unit: "ug/m3" },
            { parameter: "pm10", value: pm10Value, unit: "ug/m3" },
            { parameter: "voltage", value: voltage, unit: "v" },
            { parameter: "current", value: current, unit: "amps" },
          ],
          msgCode: 192,
          msg: "info - ok",
        }),
      });
      const data = await response.json();
      pm10 = data.pm10;
      pm25 = data.pm25;

      const aqiPm10 = determineAQI(parseFloat(pm10));
      const aqiPm25 = determineAQI(parseFloat(pm25));

      aqiLevelPm10 = aqiPm10.level;
      aqiColorPm10 = aqiPm10.color;

      aqiLevelPm25 = aqiPm25.level;
      aqiColorPm25 = aqiPm25.color;
    } catch (error) {
      console.error("Error al obtener la predicción:", error);
      pm10 = "Error";
      pm25 = "Error";
    }
  }

  onMount((): void => {
    updateDatetime();
    getPrediction();
  });
</script>

<main
  class="bg-gradient-to-br from-blue-500 to-indigo-700 text-white min-h-screen"
>
  <!-- Hero Section -->
  <section class="container mx-auto px-4 py-20 text-center">
    <h1 class="text-5xl font-bold mb-4">Predicción de Calidad del Aire</h1>
    <p class="text-xl mb-8">Utilizando Random Forest</p>
    <a
      href="#prediction"
      class="bg-white text-blue-700 font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300"
    >
      Probar la predicción
    </a>
  </section>

  <!-- Model Training Section -->
  <section class="bg-white text-gray-800 py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">
        Entrenamiento del Modelo
      </h2>
      <div class="flex flex-wrap items-center">
        <div class="w-full md:w-1/2 mb-8 md:mb-0">
          <img
            src="/src/assets/primera.png"
            alt="Entrenamiento del modelo"
            class="rounded-lg shadow-lg"
          />
          <!-- <img src="/src/assets/tercero.png" alt="Resultado de entrenamiento" class="rounded-lg shadow-lg" /> -->
        </div>
        <div class="w-full md:w-1/2 md:pl-8">
          <h3 class="text-2xl font-bold mb-4">Proceso de Entrenamiento</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>Recopilación de datos históricos de calidad del aire</li>
            <li>Preprocesamiento y limpieza de datos</li>
            <li>Selección de características relevantes</li>
            <li>Entrenamiento del modelo Random Forest</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="container mx-auto px-4 mt-10">
      <h2 class="text-3xl font-bold mb-8 text-center">Resultados</h2>
      <div class="flex flex-wrap items-center">
        <div class="w-full md:w-1/2">
          <ul class="list-disc list-inside space-y-2">
            <li>
              PM2.5 - RMSE: 0.008: Indica que, en promedio, las predicciones del
              modelo para PM2.5 están desviadas en 0.008 unidades de la
              realidad.
            </li>
            <li>
              PM10 - RMSE: 0.037: Similar al anterior, pero para PM10, la
              desviación promedio es de 0.037 unidades.
            </li>
            <li>
              PM2.5 - MAE: 0.000: Esto sugiere que, en promedio, el error
              absoluto de las predicciones para PM2.5 es prácticamente cero.
            </li>
            <li>
              PM10 - MAE: 0.001: Indica un error absoluto promedio muy bajo para
              las predicciones de PM10.
            </li>
          </ul>
        </div>
        <div class="w-full md:w-1/2">
          <img
            src="/src/assets/tercero.png"
            alt="Resultado de entrenamiento"
            class="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Model Architecture Section -->
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">
        Arquitectura del Modelo
      </h2>
      <div class="flex flex-wrap items-center">
        <div class="w-full md:w-1/2 md:pr-8 mb-8 md:mb-0">
          <h3 class="text-2xl font-bold mb-4">Random Forest</h3>
          <p class="mb-4">
            Nuestro modelo utiliza la arquitectura Random Forest, que combina
            múltiples árboles de decisión para realizar predicciones robustas y
            precisas.
          </p>
          <ul class="list-disc list-inside space-y-2">
            <li>Conjunto de árboles de decisión</li>
            <li>Selección aleatoria de características</li>
            <li>Votación mayoritaria para la predicción final</li>
            <li>Alta capacidad para manejar relaciones no lineales</li>
          </ul>
        </div>
        <div class="w-full md:w-1/2">
          <img
            src="/src/assets/segunda.png"
            alt="Arquitectura del modelo"
            class="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Why Random Forest Section -->
  <section class="bg-white text-gray-800 py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">
        ¿Por qué Random Forest para Predecir la Calidad del Aire?
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-blue-100 p-6 rounded-lg shadow">
          <h3 class="text-xl font-bold mb-4">
            Manejo de Relaciones No Lineales
          </h3>
          <p>
            Captura relaciones complejas entre variables como temperatura,
            humedad, viento y contaminantes.
          </p>
        </div>
        <div class="bg-green-100 p-6 rounded-lg shadow">
          <h3 class="text-xl font-bold mb-4">Robustez ante Outliers</h3>
          <p>
            Menos sensible a valores extremos, lo que lo hace ideal para datos
            de calidad del aire que pueden contener anomalías.
          </p>
        </div>
        <div class="bg-yellow-100 p-6 rounded-lg shadow">
          <h3 class="text-xl font-bold mb-4">
            Importancia de las Características
          </h3>
          <p>
            Proporciona una medida de la importancia de cada variable,
            permitiendo una mejor comprensión del fenómeno.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Prediction Section -->
  <section id="prediction" class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">
        Realiza una Predicción
      </h2>
      <div class="flex flex-wrap -mx-4">
        <!-- Form -->
        <div class="w-full md:w-1/2 px-4 mb-8 md:mb-0">
          <div
            class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 shadow-lg"
          >
            <h3 class="text-2xl font-bold mb-4">Modificar Parámetros</h3>
            <form on:submit|preventDefault={getPrediction}>
              <div class="mb-4">
                <label class="block text-lg font-bold mb-2" for="fetchUrl"
                  >NgRok url:</label
                >
                <input
                  type="text"
                  id="fetchUrl"
                  bind:value={fetchUrl}
                  class="w-full px-3 py-2 rounded bg-gray-100 text-black"
                />
              </div>
              {#each parameters as param, i}
                <div class="mb-4">
                  <label
                    class="block text-lg font-bold mb-2"
                    for={param.parameter}>{param.parameter}:</label
                  >
                  <input
                    type="text"
                    id={param.parameter}
                    bind:value={param.value}
                    class="w-full px-3 py-2 rounded bg-gray-100 text-black"
                  />
                </div>
              {/each}
              <button
                type="submit"
                class="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              >
                Obtener Predicción
              </button>
            </form>
          </div>
        </div>

        <!-- Results -->
        <div class="w-full md:w-1/2 px-4">
          <div
            class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 shadow-lg"
          >
            <h3 class="text-2xl font-bold mb-4">Resultados de la Predicción</h3>
            <div class="mb-6">
              <p class="text-2xl font-bold">PM1.0:</p>
              <p class="text-4xl font-bold">{pm10}</p>
              <p class="text-lg font-bold" style="color:{aqiColorPm10}">
                ICA: {aqiLevelPm10}
              </p>
            </div>
            <div>
              <p class="text-2xl font-bold">PM2.5:</p>
              <p class="text-4xl font-bold">{pm25}</p>
              <p class="text-lg font-bold" style="color:{aqiColorPm25}">
                ICA: {aqiLevelPm25}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- AQI Legend -->
  <section class="py-10 bg-gray-100">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-4 text-center text-gray-800">
        Leyenda del Índice de Calidad del Aire (ICA)
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-green-100 p-4 rounded-lg text-center">
          <p class="font-bold text-green-700">Buena</p>
          <p class="text-sm text-gray-600">0–50</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg text-center">
          <p class="font-bold text-yellow-700">Moderada</p>
          <p class="text-sm text-gray-600">51–100</p>
        </div>
        <div class="bg-orange-100 p-4 rounded-lg text-center">
          <p class="font-bold text-orange-700">Dañina para grupos sensibles</p>
          <p class="text-sm text-gray-600">101–150</p>
        </div>
        <div class="bg-red-100 p-4 rounded-lg text-center">
          <p class="font-bold text-red-700">Dañina a la salud</p>
          <p class="text-sm text-gray-600">151–200</p>
        </div>
        <div class="bg-purple-100 p-4 rounded-lg text-center">
          <p class="font-bold text-purple-700">Muy dañina a la salud</p>
          <p class="text-sm text-gray-600">201–300</p>
        </div>
        <div class="bg-brown-100 p-4 rounded-lg text-center">
          <p class="font-bold text-yellow-900">Peligrosa</p>
          <p class="text-sm text-gray-600">Más de 300</p>
        </div>
      </div>
    </div>
  </section>
</main>
