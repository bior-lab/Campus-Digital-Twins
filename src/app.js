const campusBounds = [
  [103.7678, 1.2898],
  [103.7873, 1.309],
];

const campusOverview = {
  zoom: 15.58,
  pitch: 55,
  bearing: -24,
};

// Public Mapbox token is assembled from config parts, matching the BIOR
// Urban-Digital-Twins frontend pattern. URL/localStorage overrides still work.
const mapboxSiteConfig = window.NUS_EMIS_CONFIG || {};
const defaultMapboxPublicToken =
  window.NUS_EMIS_MAPBOX_TOKEN ||
  mapboxSiteConfig.mapboxAccessToken ||
  (Array.isArray(mapboxSiteConfig.mapboxAccessTokenParts)
    ? mapboxSiteConfig.mapboxAccessTokenParts.join("")
    : "");

const apiBuildingAliases = {
  "T-LAB": "TLAB",
  VENTUS: "Ventus",
};

function apiBuildingCode(buildingCode) {
  return apiBuildingAliases[buildingCode] || buildingCode;
}

function frontendBuildingCode(buildingCode) {
  return buildingCode === "TLAB" ? "T-LAB" : buildingCode;
}

const buildingMetricCapabilities = {
  CELS: ["electricity", "cooling"],
  COM3: ["electricity", "cooling"],
  E3: ["pv"],
  E3A: ["electricity", "cooling"],
  E6: ["electricity", "cooling"],
  E7: ["electricity", "cooling"],
  E8: ["electricity", "cooling"],
  MD1: ["electricity", "cooling"],
  MD2: ["electricity", "cooling"],
  MD6: ["electricity", "cooling"],
  S1A: ["electricity", "cooling"],
  S9: ["electricity", "cooling"],
  SDE1: ["cooling"],
  SDE2: ["cooling"],
  SDE3: ["cooling", "pv"],
  SDE4: ["cooling", "pv", "co2", "temperature", "humidity", "airflow"],
  "T-LAB": ["electricity", "cooling"],
  VENTUS: ["electricity", "cooling"],
};

const pvHistoryPoints = {
  E3: ["E3 M1_hourly_generation"],
  SDE3: ["SDE3 M1_hourly_generation", "SDE3 M2_hourly_generation"],
  SDE4: ["SDE4 solar_m1_hourly_energy", "SDE4 solar_m2_hourly_energy"],
};

const realtimeConfig = {
  baseUrl: "https://buildingdt.org/realtime/latest",
  liveBuildings: [
    { code: "CELS" },
    { code: "COM3" },
    { code: "E3" },
    { code: "E3A" },
    { code: "E6" },
    { code: "E7" },
    { code: "E8" },
    { code: "MD1" },
    { code: "MD2" },
    { code: "MD6" },
    { code: "S1A" },
    { code: "S9" },
    { code: "SDE1" },
    { code: "SDE2" },
    { code: "SDE3" },
    { code: "SDE4" },
    { code: "T-LAB", requestCode: "TLAB" },
    { code: "VENTUS" },
  ],
  refreshMs: 60_000,
};

const nemsMarketConfig = {
  endpoint: mapboxSiteConfig.nemsRealtimeEndpoint || "/api/nems/realtime",
  tableEndpoint: mapboxSiteConfig.nemsTableEndpoint || "/api/nems/table",
  refreshMs: Number(mapboxSiteConfig.nemsRefreshMs) || 300_000,
};

const nemsMarketProducts = {
  "10": {
    title: "Real-time Energy Prices and Demand",
    subtitle: "Provisional half-hourly market information",
    kind: "market",
    table: true,
    cadence: "Every half-hour",
  },
  "12": {
    title: "72-period Energy Prices and Demand",
    subtitle: "Latest 72 half-hour trading periods",
    kind: "market",
    table: true,
    cadence: "Every half-hour",
  },
  "14": {
    title: "7-day Energy Prices and Demand (Period-based)",
    subtitle: "Seven days of half-hour trading periods",
    kind: "market",
    table: false,
    cadence: "Daily after market day",
    metricLabels: ["7-day Average USEP", "7-day Average Demand", "7-day Average Solar", "VCP"],
  },
  "17": {
    title: "7-day Energy Prices (Daily Average-Min-Max)",
    subtitle: "Daily average, minimum and maximum USEP",
    kind: "range",
    table: false,
    axisTitle: "Price ($/MWh)",
    accent: "price",
    cadence: "Daily",
  },
  "18": {
    title: "7-day Demand (Daily Average-Min-Max)",
    subtitle: "Daily average, minimum and maximum demand",
    kind: "range",
    table: false,
    axisTitle: "Demand (MW)",
    accent: "demand",
    cadence: "Daily",
  },
  "19": {
    title: "7-day Solar Forecast (Average-Min-Max)",
    subtitle: "Daily average, minimum and maximum solar forecast",
    kind: "range",
    table: false,
    axisTitle: "Solar (MW)",
    accent: "solar",
    cadence: "Daily",
    metricLabels: ["7-day Average Solar"],
  },
};

const historyConfig = {
  meterBaseUrl: "https://buildingdt.org/realtime/range",
  beehubBaseUrl: "https://buildingdt.org/realtime/beehub/range",
  metrics: [
    {
      key: "electricity",
      point: (building) => `${apiBuildingCode(building)} hourly_electrical_consumption`,
      label: "Electricity",
      metric: "Electricity demand",
      unit: "kWh/h",
      range: "-7d",
      bucket: "hour",
      chart: "bar",
      source: "meter",
      color: "#2f80a0",
    },
    {
      key: "cooling",
      point: (building) => `${apiBuildingCode(building)} hourly_cooling_consumption`,
      label: "Cooling",
      metric: "Cooling energy",
      unit: "kWh/h",
      range: "-7d",
      bucket: "hour",
      chart: "bar",
      source: "meter",
      color: "#5b6f7a",
    },
    {
      key: "pv",
      points: (building) => pvHistoryPoints[building] || [],
      label: "PV generation",
      metric: "PV hourly generation",
      unit: "kWh/h",
      range: "-7d",
      bucket: "hour",
      chart: "bar",
      source: "meter",
      color: "#d88a21",
    },
    {
      key: "co2",
      point: (building) => `${building} Beehub CO2`,
      label: "CO2",
      metric: "Indoor air quality",
      unit: "ppm",
      range: "-7d",
      bucket: "hour",
      chart: "line",
      source: "beehub",
      color: "#287c6f",
    },
    {
      key: "temperature",
      point: (building) => `${building} Beehub Temperature`,
      label: "Temperature",
      metric: "Thermal condition",
      unit: "degC",
      range: "-7d",
      bucket: "hour",
      chart: "line",
      source: "beehub",
      color: "#b43b34",
    },
    {
      key: "humidity",
      point: (building) => `${building} Beehub Humidity`,
      label: "Humidity",
      metric: "Indoor humidity",
      unit: "%",
      range: "-7d",
      bucket: "hour",
      chart: "line",
      source: "beehub",
      color: "#1f5fbf",
    },
    {
      key: "airflow",
      point: (building) => `${building} Beehub VAV-L3-01 Airflow`,
      label: "Airflow",
      metric: "VAV L3-01 airflow",
      unit: "L/s",
      range: "-24h",
      bucket: "hour",
      chart: "line",
      source: "beehub",
      color: "#ef7c00",
    },
  ],
};

const buildingMetricMeta = {
  electricity: { label: "Electricity", title: "Electricity consumption", unit: "kWh" },
  cooling: { label: "Cooling load", title: "Cooling load", unit: "kWh" },
  pv: { label: "PV generation", title: "PV generation", unit: "kWh" },
};

const buildingModelDefinitions = {
  SDE4: { color: "#1769aa", coverage: "Partial" },
  SDE3: { color: "#7c5cc4", coverage: "Partial" },
  SDE2: { color: "#5d7f9d", coverage: "Partial" },
  SDE1: { color: "#7895ad", coverage: "Partial" },
  E3A: { color: "#386fa4", coverage: "Mapped" },
  "T-LAB": { color: "#586b7b", coverage: "Mapped" },
  E8: { color: "#c66f00", coverage: "Mapped" },
  E6: { color: "#187c70", coverage: "Mapped" },
  COM3: { color: "#3f7d6b", coverage: "Mapped" },
  S9: { color: "#6f5c8f", coverage: "Mapped" },
  CELS: { color: "#a24747", coverage: "Mapped" },
  MD1: { color: "#b05278", coverage: "Mapped" },
  MD2: { color: "#c06c84", coverage: "Mapped" },
  MD6: { color: "#8f4c6b", coverage: "Mapped" },
  S1A: { color: "#8270aa", coverage: "Mapped" },
  VENTUS: { color: "#4c7f9c", coverage: "Mapped" },
};

const buildingPerformanceModel = Object.fromEntries(
  Object.entries(buildingModelDefinitions).map(([building, definition]) => [building, {
    ...definition,
    updated: "Awaiting history",
    electricity: null,
    cooling: null,
    pv: null,
  }]),
);

const buildingHistoryPointMap = Object.fromEntries(
  Object.keys(buildingModelDefinitions).map((building) => {
    const apiCode = apiBuildingCode(building);
    const capabilities = buildingMetricCapabilities[building] || [];
    const points = {};
    if (capabilities.includes("electricity")) points.electricity = `${apiCode} Total Hourly Electrical Consumption`;
    if (capabilities.includes("cooling")) {
      // SDE3's current canonical stream is misclassified under E3 upstream.
      // Keep its own historical series; never silently attribute another building's stream.
      points.cooling = building === "SDE3" ? "SDE3 hourly_cooling_consumption"
        : /^SDE/.test(building) ? `${apiCode} Total Cooling Hourly Consumption`
          : `${apiCode} Total Hourly Cooling Consumption`;
    }
    if (capabilities.includes("pv")) points.pv = pvHistoryPoints[building] || [];
    return [building, points];
  }),
);

const marketRealtimeValues = [
  80.2, 84.9, 77.6, 75.1, 83.8, 89.2, 101.4, 113.6, 125.9, 138.3, 153.1, 183.8,
  217.6, 206.3, 169.2, 144.1, 134.8, 131.9, 140.6, 149.4, 156.8, 164.2, 171.5, 158.7,
  153.6, 148.1, 161.4, 178.2, 202.4, 224.6, 263.2, 287.1, 255.8, 218.4, 214.19, 169.3,
  163.5, 174.1, 184.8, 195.2, 205.6, 217.4, 231.2, 220.7, 229.8, 216.3, 226.9, 238.7,
];

const marketIntervalConfig = {
  realtime: {
    title: "Real-time Energy Prices and Demand",
    subtitle: "Half-hour trading periods · 17 Jul 2026",
    note: "Past and published periods",
    values: marketRealtimeValues,
    tickIndexes: [0, 12, 24, 36, 47],
    tickLabels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    tooltipLabel: (index) => {
      const minutes = index * 30;
      return `Period ${index + 1} · ${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    },
  },
  "72-periods": {
    title: "72-Period Price Trend",
    subtitle: "Latest 36 hours · half-hour trading periods",
    note: "Rolling 72-period market window",
    values: Array.from({ length: 72 }, (_, index) => {
      const base = marketRealtimeValues[(index + 24) % marketRealtimeValues.length];
      return Number((base * (0.91 + 0.08 * Math.sin(index / 6))).toFixed(2));
    }),
    tickIndexes: [0, 18, 36, 54, 71],
    tickLabels: ["16 Jul 02:00", "16 Jul 11:00", "16 Jul 20:00", "17 Jul 05:00", "17 Jul 13:30"],
    tooltipLabel: (index) => `Rolling period ${index + 1} of 72`,
  },
  "7-days": {
    title: "7-Day Daily Average USEP",
    subtitle: "Daily average, minimum and peak context",
    note: "Daily averages · provisional values",
    values: [132.8, 126.4, 141.6, 138.2, 150.7, 145.9, 121.4],
    tickIndexes: [0, 1, 2, 3, 4, 5, 6],
    tickLabels: ["11 Jul", "12 Jul", "13 Jul", "14 Jul", "15 Jul", "16 Jul", "17 Jul"],
    tooltipLabel: (index) => `${11 + index} Jul 2026 · daily average`,
  },
};

const aiHealthConfig = {
  building: "SDE4",
  weatherUrl: "https://api.open-meteo.com/v1/forecast",
  weather: {
    latitude: 1.2966,
    longitude: 103.7764,
  },
  clusterColors: {
    normal: "#287c6f",
    weather: "#1f5fbf",
    mildHigh: "#b43b34",
    afterHours: "#d88a21",
    standby: "#7b8d99",
  },
};

const weatherDashboardConfig = {
  url: "https://api.open-meteo.com/v1/forecast",
  archiveUrl: "https://archive-api.open-meteo.com/v1/archive",
  latitude: 1.2966,
  longitude: 103.7764,
  timezone: "Asia/Singapore",
};

const brickGraphConfig = {
  places: ["SDE4"],
  graphs: {
    SDE4: {
      label: "SDE4",
      subtitle: "Operational Brick seed graph",
      sourceSummary: "Floorplans, ACMV schematics, schedules, and public realtime endpoint",
      sources: [
        "SDE4data/0_Floorplans: L1-L6 and roof PDFs",
        "SDE4data/1_ACMV: air loop, chilled water loop, and ACMV plans",
        "SDE4data/Schedules: GFA and architectural schedules",
        "buildingdt.org realtime API: current public live points",
      ],
      lanes: [
        {
          key: "place",
          label: "Place",
          nodes: [
            {
              id: "sde4",
              title: "SDE4",
              kind: "Building",
              brickClass: "brick:Building",
              status: "Seed",
              description: "Main SDE4 building node. This should remain the root of the operational graph.",
              source: "Floorplans and NUS focus building registry",
            },
            {
              id: "sde4-floors",
              title: "L1-L6 + Roof",
              kind: "Location set",
              brickClass: "brick:Floor",
              status: "Seed",
              description: "Floor context from SDE4 floorplan PDFs. Use for equipment location and future zone mapping.",
              source: "SDE4_L1.pdf through SDE4_Roof.pdf",
            },
          ],
        },
        {
          key: "systems",
          label: "Systems",
          nodes: [
            {
              id: "airside-system",
              title: "Airside ACMV",
              kind: "System",
              brickClass: "brick:Air_System",
              status: "Seed",
              description: "PAHU, FCU/PFCU, VAV, FAF and room-serving air path.",
              source: "@air loops.pdf and ACMV floor plans",
            },
            {
              id: "chw-system",
              title: "Chilled water",
              kind: "System",
              brickClass: "brick:Chilled_Water_System",
              status: "Seed",
              description: "CHWS/CHWR loop with BTU metering and cooling coils.",
              source: "@chilled water and refrigerant loops .pdf",
            },
            {
              id: "pv-system",
              title: "PV / electrical",
              kind: "System",
              brickClass: "brick:Electrical_System",
              status: "Live mapped",
              description: "PV hourly generation is calculated from the standardized M1 and M2 energy streams.",
              source: "Public realtime endpoint",
            },
            {
              id: "indoor-system",
              title: "Indoor sensing",
              kind: "System",
              brickClass: "brick:Zone_Air_Temperature_System",
              status: "Live mapped",
              description: "Beehub indoor environmental points and VAV airflow points.",
              source: "Public realtime endpoint",
            },
            {
              id: "water-system",
              title: "Water",
              kind: "System",
              brickClass: "brick:Water_System",
              status: "Planned",
              description: "Water stays as a placeholder until PI point mapping is validated and exposed through FastAPI.",
              source: "PI candidate discovery, not public realtime yet",
            },
          ],
        },
        {
          key: "equipment",
          label: "Equipment",
          nodes: [
            {
              id: "pahu-group",
              title: "PAHU-L2-01 / L5-01 / L6-01",
              kind: "Primary air handling",
              brickClass: "brick:AHU",
              status: "Candidate",
              description: "PAHU equipment candidates extracted from SDE4 ACMV air loop and floor plans.",
              source: "@air loops.pdf; ACMV L2/L5/L6 plans",
            },
            {
              id: "vav-group",
              title: "VAV boxes",
              kind: "Terminal units",
              brickClass: "brick:Variable_Air_Volume_Box",
              status: "Partial live",
              description: "VAVs appear on L2-L6. Current public live airflow points cover VAV-L3-01/02/03.",
              source: "ACMV floor plans and public realtime endpoint",
              pointNames: [
                "SDE4 Beehub VAV-L3-01 Airflow",
                "SDE4 Beehub VAV-L3-02 Airflow",
                "SDE4 Beehub VAV-L3-03 Airflow",
              ],
            },
            {
              id: "fcu-group",
              title: "FCU / PFCU",
              kind: "Fan coil units",
              brickClass: "brick:Fan_Coil_Unit",
              status: "Candidate",
              description: "FCU and PFCU candidates are present in the air loop and ACMV floor plans.",
              source: "@air loops.pdf and ACMV floor plans",
            },
            {
              id: "faf-group",
              title: "Fresh air fans",
              kind: "Fans",
              brickClass: "brick:Fan",
              status: "Candidate",
              description: "FAF equipment appears across L1, L2, L4, L5, and L6 plans.",
              source: "ACMV floor plans",
            },
            {
              id: "btu-meter",
              title: "Cooling BTU meter",
              kind: "Thermal meter",
              brickClass: "brick:Thermal_Energy_Meter",
              status: "Live mapped",
              description: "Main public cooling hourly stream is attached here.",
              source: "@chilled water and refrigerant loops .pdf; public realtime endpoint",
              metricKey: "cooling",
              pointNames: ["SDE4 hourly_cooling_consumption"],
            },
            {
              id: "pv-meter",
              title: "PV generation meters",
              kind: "Electrical meters",
              brickClass: "brick:Electrical_Meter",
              status: "Live mapped",
              description: "The standardized M1 and M2 hourly energy points are combined for the dashboard PV total.",
              source: "Public realtime endpoint",
              metricKey: "pv",
              pointNames: [
                "SDE4 hourly_all_consumption",
                "SDE4 solar_m1_hourly_energy",
                "SDE4 solar_m2_hourly_energy",
              ],
            },
            {
              id: "beehub-sensors",
              title: "Beehub sensor group",
              kind: "Sensor equipment",
              brickClass: "brick:Equipment",
              status: "Live mapped",
              description: "Indoor CO2, temperature, humidity, thermostat setpoint, and VAV airflow points.",
              source: "Public realtime endpoint",
              pointNames: [
                "SDE4 Beehub CO2",
                "SDE4 Beehub Temperature",
                "SDE4 Beehub Humidity",
                "SDE4 Beehub VAV-L3-01 Airflow",
              ],
            },
          ],
        },
        {
          key: "points",
          label: "Points",
          nodes: [
            {
              id: "cooling-point",
              title: "Cooling hourly",
              kind: "Point",
              brickClass: "brick:Energy_Sensor",
              status: "Live",
              description: "Standardized SDE4 hourly cooling energy point.",
              source: "Public realtime endpoint",
              metricKey: "cooling",
              pointNames: ["SDE4 hourly_cooling_consumption"],
            },
            {
              id: "pv-all-point",
              title: "PV hourly total",
              kind: "Point",
              brickClass: "brick:Energy_Sensor",
              status: "Live",
              description: "Published total aligned with the standardized SDE4 PV module streams.",
              source: "Public realtime endpoint",
              metricKey: "pv",
              pointNames: ["SDE4 hourly_all_consumption"],
            },
            {
              id: "pv-module-points",
              title: "PV M1 / M2 hourly",
              kind: "Point set",
              brickClass: "brick:Energy_Sensor",
              status: "Breakdown",
              description: "Standardized module-level PV energy points combined by the dashboard.",
              source: "Public realtime endpoint",
              pointNames: [
                "SDE4 solar_m1_hourly_energy",
                "SDE4 solar_m2_hourly_energy",
              ],
            },
            {
              id: "indoor-points",
              title: "CO2 / temp / humidity",
              kind: "Point set",
              brickClass: "brick:Point",
              status: "Live",
              description: "Beehub indoor environmental history points.",
              source: "Public realtime endpoint",
              pointNames: [
                "SDE4 Beehub CO2",
                "SDE4 Beehub Temperature",
                "SDE4 Beehub Humidity",
              ],
            },
            {
              id: "vav-airflow-points",
              title: "VAV L3 airflow",
              kind: "Point set",
              brickClass: "brick:Air_Flow_Sensor",
              status: "Live",
              description: "VAV-L3-01/02/03 airflow points. These are the first equipment-linked airflow leaves.",
              source: "Public realtime endpoint",
              metricKey: "airflow",
              pointNames: [
                "SDE4 Beehub VAV-L3-01 Airflow",
                "SDE4 Beehub VAV-L3-02 Airflow",
                "SDE4 Beehub VAV-L3-03 Airflow",
              ],
            },
            {
              id: "pv-raw-power-points",
              title: "PV raw power",
              kind: "Point set",
              brickClass: "brick:Power_Sensor",
              status: "Reference only",
              description: "PV_System.Total_kW points remain visible as raw inverter/panel power references, not the primary generation KPI.",
              source: "Public realtime endpoint",
              pointNames: [
                "SDE4 PV_System.Total_kW_DB-PV-1-1_&_2-1",
                "SDE4 PV_System.Total_kW_DB-PV-1-2_&_2-2",
              ],
            },
          ],
        },
      ],
      relations: [
        { from: "sde4", predicate: "hasPart", to: "sde4-floors" },
        { from: "sde4", predicate: "hasSystem", to: "airside-system" },
        { from: "sde4", predicate: "hasSystem", to: "chw-system" },
        { from: "sde4", predicate: "hasSystem", to: "pv-system" },
        { from: "sde4", predicate: "hasSystem", to: "indoor-system" },
        { from: "airside-system", predicate: "hasPart", to: "pahu-group" },
        { from: "airside-system", predicate: "hasPart", to: "vav-group" },
        { from: "airside-system", predicate: "hasPart", to: "fcu-group" },
        { from: "airside-system", predicate: "hasPart", to: "faf-group" },
        { from: "chw-system", predicate: "hasPoint", to: "cooling-point" },
        { from: "chw-system", predicate: "hasPart", to: "btu-meter" },
        { from: "pv-system", predicate: "hasPart", to: "pv-meter" },
        { from: "pv-meter", predicate: "hasPoint", to: "pv-all-point" },
        { from: "pv-meter", predicate: "hasPoint", to: "pv-module-points" },
        { from: "pv-meter", predicate: "hasPoint", to: "pv-raw-power-points" },
        { from: "indoor-system", predicate: "hasPart", to: "beehub-sensors" },
        { from: "beehub-sensors", predicate: "hasPoint", to: "indoor-points" },
        { from: "vav-group", predicate: "hasPoint", to: "vav-airflow-points" },
      ],
    },
  },
};

const mapboxEuiLayer = {
  sourceId: "mapbox-eui-buildings",
  sourceUrl: "mapbox://nus-bior.7xmymq8g",
  sourceLayer: "07_buildings_energy_weekly_re-1cntpw",
};

const metricConfig = {
  electricity: {
    label: "Electricity demand",
    field: "electricity_metric",
    unit: "kWh/h",
    steps: [80, 240, 440, 700],
  },
  cooling: {
    label: "Cooling energy",
    field: "cooling_metric",
    unit: "kWh/h",
    steps: [40, 150, 280, 460],
  },
  water: {
    label: "Water use",
    field: "water_metric",
    unit: "m3",
    steps: [2, 8, 16, 28],
  },
  pv: {
    label: "PV generation",
    field: "pv_metric",
    unit: "kWh/h",
    steps: [0, 15, 35, 70],
  },
  eui: {
    label: "Energy use intensity",
    field: "eui",
    unit: "kWh/m2-yr",
    steps: [100, 170, 240, 310],
  },
};

const colorModeConfig = {
  type: { label: "Campus districts" },
  eui: { label: "EUI 2023" },
  height: { label: "Building height" },
  live: { label: "Data coverage" },
  electricity: { label: "Electricity demand" },
  cooling: { label: "Cooling energy" },
  pv: { label: "PV generation" },
};

const focusBuildings = [
  { sourceId: "way/628774809", code: "SDE4", name: "SDE4" },
  { sourceId: "way/503403831", code: "VENTUS", name: "Ventus" },
  { sourceId: "way/140079084", code: "SDE3", name: "SDE3" },
  { sourceId: "way/139974054", code: "E3A", name: "E3A" },
  { sourceId: "way/139957953", code: "T-LAB", name: "E5A / T-Lab" },
  { sourceId: "way/139959807", code: "E8", name: "E8" },
  { sourceId: "way/139959760", code: "E6", name: "E6" },
  { sourceId: "way/140078777", code: "SDE1", name: "SDE1" },
  { sourceId: "way/140078560", code: "SDE2", name: "SDE2" },
  { sourceId: "relation/15780831", code: "COM3", name: "COM3" },
  { sourceId: "way/141905556", code: "S1A", name: "Lee Wee Kheng Building (S1A/LT 32)" },
  { sourceId: "way/141906130", code: "S9", name: "S9 - Wet Science Building" },
  { sourceId: "way/141913023", code: "CELS", name: "Centre for Life Sciences" },
  { sourceId: "way/141912739", code: "MD1", name: "MD1 - Tahir Foundation Building" },
  { sourceId: "way/141912951", code: "MD2", name: "MD2" },
  { sourceId: "way/141912974", code: "MD6", name: "MD6" },
];

const focusBuildingBySourceId = new Map(focusBuildings.map((building) => [building.sourceId, building]));
const focusSourceIdSet = new Set(focusBuildings.map((building) => building.sourceId));
const priorityBuildingCodes = new Set(focusBuildings.map((building) => building.code));

const focusRegions = [
  {
    id: "design-engineering",
    label: "Design and Engineering",
    codes: ["SDE4", "VENTUS", "SDE3", "E3A", "T-LAB", "E8", "E6", "SDE1", "SDE2"],
    color: "#3478f6",
  },
  {
    id: "computing",
    label: "Computing",
    codes: ["COM3"],
    color: "#12b8a6",
  },
  {
    id: "science",
    label: "Science",
    codes: ["S1A", "S9"],
    color: "#9656ed",
  },
  {
    id: "medicine",
    label: "Medicine",
    codes: ["CELS", "MD1", "MD2", "MD6"],
    color: "#f16b86",
  },
];

const requestedWorkspace = new URLSearchParams(window.location.search).get("tab");
const initialWorkspace = ["overview", "buildings", "market", "weather", "guide"].includes(requestedWorkspace)
  ? requestedWorkspace
  : "overview";
const requestedBuildingPeriod = new URLSearchParams(window.location.search).get("period");
const initialBuildingPeriod = ["monthly", "yearly"].includes(requestedBuildingPeriod) ? requestedBuildingPeriod : "yearly";

const state = {
  map: null,
  data: null,
  displayFeatures: [],
  pointData: null,
  zoneData: null,
  regionAreaData: null,
  sourceFeatureById: new Map(),
  displayFeatureBySourceId: new Map(),
  metric: "type",
  selectedId: null,
  activeTab: initialWorkspace,
  activeExternalDataset: "electricity-consumption",
  externalPanelOpen: false,
  externalData: {},
  searchTerm: "",
  realtimeByBuilding: {},
  historyCache: new Map(),
  aiHealthCache: null,
  aiHealthLoading: false,
  aiAgentMessages: [],
  activeRealtimeBuilding: "SDE4",
  activeHistoryKey: "electricity",
  activeBrickBuilding: "SDE4",
  activeBrickNodeId: "sde4",
  activeMapboxToken: "",
  activeMapboxTokenSource: "default",
  mapAuthFallbackInProgress: false,
  mapTokenIssue: "",
  mapClickHandler: null,
  refreshTimer: null,
  selectedComparisonBuildings: new Set(["E3A"]),
  buildingPeriods: { electricity: initialBuildingPeriod, cooling: initialBuildingPeriod, pv: initialBuildingPeriod },
  activeMarketView: "chart",
  activeMarketInterval: "realtime",
  activeNemsProduct: "10",
  activeNemsView: "chart",
  nemsMarketData: null,
  nemsProductCache: new Map(),
  nemsTableCache: new Map(),
  nemsRefreshTimer: null,
  nemsLoading: false,
  activeWeatherPeriod: "7d",
  weatherPeriods: { thermal: "7d", heat: "7d", wind: "7d" },
  weatherData: null,
  weatherLoadPromise: null,
  weatherYearData: null,
  weatherYearPromise: null,
  weatherYearError: "",
  buildingHistoryLoaded: new Map(),
  buildingHistoryPending: new Map(),
};

window.__nusCampusEmis = state;

const els = {
  tokenPanel: document.getElementById("tokenPanel"),
  tokenForm: document.getElementById("tokenForm"),
  tokenInput: document.getElementById("tokenInput"),
  tokenError: document.getElementById("tokenError"),
  resetToken: document.getElementById("resetToken"),
  campusView: document.getElementById("campusView"),
  mapRealtimeView: document.getElementById("mapRealtimeView"),
  mapBrickView: document.getElementById("mapBrickView"),
  realtimeStatusDot: document.getElementById("realtimeStatusDot"),
  realtimeStatusText: document.getElementById("realtimeStatusText"),
  tabButtons: document.querySelectorAll("[data-tab]"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  workspaceViews: document.querySelectorAll("[data-workspace]"),
  mapStage: document.querySelector(".map-stage"),
  metricButtons: document.querySelectorAll("[data-metric]"),
  toggleBuildings: document.getElementById("toggleBuildings"),
  toggleLabels: document.getElementById("toggleLabels"),
  toggleEuiLayer: document.getElementById("toggleEuiLayer"),
  buildingSelect: document.getElementById("buildingSelect"),
  buildingPeriodButtons: document.querySelectorAll("[data-building-period]"),
  buildingWorkspaceSubtitle: document.getElementById("buildingWorkspaceSubtitle"),
  buildingCharts: document.querySelectorAll("[data-building-chart]"),
  summaryElectricity: document.getElementById("summaryElectricity"),
  summaryCooling: document.getElementById("summaryCooling"),
  summaryWater: document.getElementById("summaryWater"),
  summaryPv: document.getElementById("summaryPv"),
  overviewCoverage: document.getElementById("overviewCoverage"),
  overviewUpdated: document.getElementById("overviewUpdated"),
  overviewBuildingPerformance: document.getElementById("overviewBuildingPerformance"),
  marketHeatmap: document.getElementById("marketHeatmap"),
  marketViewButtons: document.querySelectorAll("[data-market-view]"),
  marketViewPanels: document.querySelectorAll("[data-market-view-panel]"),
  marketIntervalButtons: document.querySelectorAll("[data-market-interval]"),
  marketChartTitle: document.getElementById("marketChartTitle"),
  marketChartSubtitle: document.getElementById("marketChartSubtitle"),
  marketSeriesNote: document.getElementById("marketSeriesNote"),
  marketChartInteractive: document.getElementById("marketChartInteractive"),
  nemsSourceStatus: document.getElementById("nemsSourceStatus"),
  nemsMarketBody: document.getElementById("nemsMarketBody"),
  nemsRefresh: document.getElementById("nemsRefresh"),
  nemsProductSelect: document.getElementById("nemsProductSelect"),
  nemsUpdateCadence: document.getElementById("nemsUpdateCadence"),
  nemsMarketTitle: document.getElementById("nemsMarketTitle"),
  nemsMarketSubtitle: document.getElementById("nemsMarketSubtitle"),
  nemsViewToggle: document.getElementById("nemsViewToggle"),
  nemsViewButtons: document.querySelectorAll("[data-nems-view]"),
  weatherSourceStatus: document.getElementById("weatherSourceStatus"),
  weatherUpdated: document.getElementById("weatherUpdated"),
  weatherPeriodButtons: document.querySelectorAll("[data-weather-period]"),
  weatherTemperature: document.getElementById("weatherTemperature"),
  weatherTemperatureMeta: document.getElementById("weatherTemperatureMeta"),
  weatherHumidity: document.getElementById("weatherHumidity"),
  weatherHumidityMeta: document.getElementById("weatherHumidityMeta"),
  weatherHeatStress: document.getElementById("weatherHeatStress"),
  weatherHeatStressMeta: document.getElementById("weatherHeatStressMeta"),
  weatherWind: document.getElementById("weatherWind"),
  weatherWindMeta: document.getElementById("weatherWindMeta"),
  weatherChartSubtitle: document.getElementById("weatherChartSubtitle"),
  weatherChartTitle: document.getElementById("weatherChartTitle"),
  weatherThermalChart: document.getElementById("weatherThermalChart"),
  weatherHeatSubtitle: document.getElementById("weatherHeatSubtitle"),
  weatherHeatTitle: document.getElementById("weatherHeatTitle"),
  weatherHeatChart: document.getElementById("weatherHeatChart"),
  weatherWindTitle: document.getElementById("weatherWindTitle"),
  weatherWindSubtitle: document.getElementById("weatherWindSubtitle"),
  weatherWindChart: document.getElementById("weatherWindChart"),
  weatherForecast: document.getElementById("weatherForecast"),
  regionList: document.getElementById("regionList"),
  aiBriefList: document.getElementById("aiBriefList"),
  aiInsightList: document.getElementById("aiInsightList"),
  aiHealthRefresh: document.getElementById("aiHealthRefresh"),
  aiHealthKpis: document.getElementById("aiHealthKpis"),
  aiClusterMeta: document.getElementById("aiClusterMeta"),
  aiClusterChart: document.getElementById("aiClusterChart"),
  aiRegimeTimeline: document.getElementById("aiRegimeTimeline"),
  aiLlmSummary: document.getElementById("aiLlmSummary"),
  aiAgentStatus: document.getElementById("aiAgentStatus"),
  aiAgentMessages: document.getElementById("aiAgentMessages"),
  aiAgentSuggestions: document.getElementById("aiAgentSuggestions"),
  aiAgentPromptForm: document.getElementById("aiAgentPromptForm"),
  aiAgentPromptInput: document.getElementById("aiAgentPromptInput"),
  externalDataButtons: document.querySelectorAll("[data-external]"),
  externalContextPanel: document.getElementById("externalContextPanel"),
  externalContextClose: document.getElementById("externalContextClose"),
  externalVizPanel: document.getElementById("externalVizPanel"),
  trendModal: document.getElementById("trendModal"),
  trendClose: document.getElementById("trendClose"),
  trendModalEyebrow: document.getElementById("trendModalEyebrow"),
  trendModalTitle: document.getElementById("trendModalTitle"),
  trendModalSubtitle: document.getElementById("trendModalSubtitle"),
  trendPlaceSelect: document.getElementById("trendPlaceSelect"),
  trendPlaceMeta: document.getElementById("trendPlaceMeta"),
  trendLiveMeters: document.getElementById("trendLiveMeters"),
  trendTabs: document.getElementById("trendTabs"),
  trendStatus: document.getElementById("trendStatus"),
  trendKpis: document.getElementById("trendKpis"),
  trendChart: document.getElementById("trendChart"),
  trendNarrative: document.getElementById("trendNarrative"),
  brickModal: document.getElementById("brickModal"),
  brickClose: document.getElementById("brickClose"),
  brickModalEyebrow: document.getElementById("brickModalEyebrow"),
  brickModalTitle: document.getElementById("brickModalTitle"),
  brickModalSubtitle: document.getElementById("brickModalSubtitle"),
  brickPlaceSelect: document.getElementById("brickPlaceSelect"),
  brickPlaceMeta: document.getElementById("brickPlaceMeta"),
  brickSummary: document.getElementById("brickSummary"),
  brickGraph: document.getElementById("brickGraph"),
  brickRelations: document.getElementById("brickRelations"),
  brickInspector: document.getElementById("brickInspector"),
  legendTitle: document.getElementById("legendTitle"),
  legendItems: document.getElementById("legendItems"),
  legendScale: document.getElementById("legendScale"),
  legendLabels: document.getElementById("legendLabels"),
};

function getInitialMapboxToken() {
  const urlToken = new URLSearchParams(window.location.search).get("mapbox_token");
  if (urlToken) {
    localStorage.setItem("nus-emis-mapbox-token", urlToken);
    return { token: urlToken, source: "url" };
  }
  const savedToken = localStorage.getItem("nus-emis-mapbox-token");
  if (savedToken) return { token: savedToken, source: "stored" };
  if (defaultMapboxPublicToken) return { token: defaultMapboxPublicToken, source: "default" };
  return { token: "", source: "missing" };
}

function isDefaultMapboxToken(token) {
  return Boolean(defaultMapboxPublicToken) && token === defaultMapboxPublicToken;
}

function setTokenError(message = "") {
  if (!els.tokenError) return;
  els.tokenError.textContent = message;
  els.tokenError.classList.toggle("hidden", !message);
}

function showTokenPanel(message = "") {
  state.mapTokenIssue = message;
  setTokenError(message);
  els.tokenPanel.classList.toggle("hidden", state.activeTab !== "overview");
}

function hideTokenPanel() {
  state.mapTokenIssue = "";
  setTokenError("");
  els.tokenPanel.classList.add("hidden");
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "-";
  if (!Number.isFinite(Number(value))) return "-";
  return new Intl.NumberFormat("en-SG", { maximumFractionDigits: digits }).format(Number(value));
}

function formatMetric(value, unit, digits = 1) {
  if (value === null || value === undefined || value === "") return "No data";
  if (!Number.isFinite(Number(value))) return "No data";
  return `${formatNumber(value, digits)} ${unit}`;
}

function formatPvMetric(value, unit = "kW", digits = 2) {
  return formatMetric(value, unit, digits);
}

function formatLivePvMetric(value) {
  return formatMetric(value, "kWh/h", 1);
}

function formatTimestamp(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setRealtimeStatus(status, text) {
  els.realtimeStatusDot.className = `status-dot ${status}`;
  els.realtimeStatusText.textContent = text;
}

function metricValueExpression(metric) {
  return ["to-number", ["get", metricConfig[metric].field], 0];
}

function colorExpression(metric) {
  const steps = metricConfig[metric].steps;
  if (metric === "pv") {
    return [
      "interpolate",
      ["linear"],
      metricValueExpression(metric),
      steps[0],
      "#e8eef3",
      steps[1],
      "#f6c766",
      steps[2],
      "#ef7c00",
      steps[3],
      "#9d4b00",
    ];
  }
  if (metric === "water") {
    return [
      "interpolate",
      ["linear"],
      metricValueExpression(metric),
      steps[0],
      "#edf4fa",
      steps[1],
      "#8dbfdf",
      steps[2],
      "#3f83b8",
      steps[3],
      "#14527e",
    ];
  }
  return [
    "interpolate",
    ["linear"],
    metricValueExpression(metric),
    steps[0],
    "#dcefee",
    steps[1],
    "#72b7b2",
    steps[2],
    "#e5aa49",
    steps[3],
    "#b43b34",
  ];
}

function buildingModelColorExpression() {
  const expression = ["match", ["get", "source_id"]];
  focusRegions.forEach((region) => {
    const ids = focusBuildings.filter((building) => region.codes.includes(building.code)).map((building) => building.sourceId);
    expression.push(ids, region.color);
  });
  expression.push("#cbd4da");
  return expression;
}

function updateMapBuildingHighlight() {
  if (!state.map?.getLayer("buildings-extrusion")) return;
  const selected = state.mapSelectedSourceId || "";
  const hovered = state.mapHoveredSourceId || "";
  const base = buildingModelColorExpression();
  if (state.metric === "type") {
    const color = ["case", ["==", ["get", "source_id"], selected], "#ef7c00",
      ["==", ["get", "source_id"], hovered], "#5bcdf2", base];
    state.map.setPaintProperty("buildings-fill", "fill-color", color);
    state.map.setPaintProperty("buildings-extrusion", "fill-extrusion-color", color);
  }
}

function showMapBuildingCard(feature, pinned = false, lngLat = null) {
  const props = feature.properties;
  const focus = focusBuildingBySourceId.get(props.source_id);
  if (!focus) return;
  const region = focusRegions.find((item) => item.codes.includes(focus.code));
  const live = state.realtimeByBuilding[focus.code];
  const streams = [["Electricity", live?.electricityHourlyKwh], ["Cooling", live?.coolingHourlyKwh], ["PV", live?.pvKw]]
    .filter(([, value]) => value !== null && value !== undefined && Number.isFinite(Number(value)))
    .map(([label]) => label);
  state.mapBuildingPopup?.remove();
  const card = document.createElement("div");
  card.className = "campus-building-card";
  card.innerHTML = `<span class="campus-building-region" style="--region-color:${region.color}">${escapeHtml(region.label)}</span>
    <strong>${escapeHtml(focus.code)}</strong>
    ${focus.name !== focus.code ? `<span>${escapeHtml(focus.name)}</span>` : ""}
    <p>${streams.length ? `Available data · ${streams.join(" · ")}` : "No reported data"}</p>
    ${pinned ? '<button type="button">View building analysis →</button>' : '<small>Click building to explore</small>'}`;
  if (pinned) card.querySelector("button").addEventListener("click", () => {
    state.mapBuildingPopup?.remove();
    selectBuilding(feature);
  });
  const popup = new mapboxgl.Popup({ closeButton: pinned, closeOnClick: false, offset: 18, maxWidth: "270px", className: pinned ? "campus-building-popup" : "campus-building-popup is-hover" })
    .setLngLat(lngLat || feature.geometry.coordinates).setDOMContent(card).addTo(state.map);
  state.mapBuildingPopup = popup;
  if (pinned) popup.on("close", () => {
    state.mapSelectedSourceId = null;
    updateMapBuildingHighlight();
  });
}

function euiColorExpression() {
  return [
    "interpolate",
    ["linear"],
    ["to-number", ["get", "eui_2023"], 0],
    80,
    "#dcefee",
    160,
    "#72b7b2",
    260,
    "#e5aa49",
    380,
    "#b43b34",
  ];
}

function heightColorExpression() {
  return [
    "interpolate",
    ["linear"],
    ["to-number", ["get", "height_m"], 0],
    4,
    "#dcefee",
    20,
    "#72b7b2",
    50,
    "#e5aa49",
    90,
    "#b43b34",
  ];
}

function liveMappingColorExpression() {
  const liveSourceIds = (state.data?.features || [])
    .filter((feature) => feature.properties.has_realtime)
    .map((feature) => feature.properties.source_id)
    .filter(Boolean);
  if (!liveSourceIds.length) return "#6f8d9c";
  return ["match", ["get", "source_id"], liveSourceIds, "#003d7c", "#6f8d9c"];
}

function statusClass(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return "";
  if (value >= 0.7) return "warning";
  if (value <= 0.35) return "good";
  return "";
}

function statusText(score, hasLiveData = false) {
  if (hasLiveData) return "Live";
  const value = Number(score);
  if (!Number.isFinite(value)) return "Catalogued";
  if (value >= 0.7) return "Flag";
  if (value <= 0.35) return "Normal";
  return "Watch";
}

function buildingStatusColorExpression() {
  return [
    "case",
    ["==", ["get", "has_realtime"], true],
    "#003d7c",
    [">=", ["to-number", ["get", "anomaly_score"], 0], 0.7],
    "#b43b34",
    [">=", ["to-number", ["get", "anomaly_score"], 0], 0.45],
    "#e5aa49",
    "#287c6f",
  ];
}

function featureCenter(feature) {
  if (feature.geometry.type === "Point") return feature.geometry.coordinates;
  const ring = feature.geometry.coordinates[0];
  const bounds = ring.reduce(
    (box, coordinate) => box.extend(coordinate),
    new mapboxgl.LngLatBounds(ring[0], ring[0]),
  );
  return bounds.getCenter().toArray();
}

function campusBoundaryFeature() {
  const [[west, south], [east, north]] = campusBounds;
  return {
    type: "Feature",
    properties: { name: "NUS campus focus area" },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  };
}

function campusSourceIds() {
  const catalogIds = (state.data?.features || [])
    .map((feature) => feature.properties.source_id)
    .filter(Boolean);
  const ids = catalogIds.length ? catalogIds : focusBuildings.map((building) => building.sourceId);
  return Array.from(new Set(ids));
}

function campusSourceFilter() {
  const ids = campusSourceIds();
  if (!ids.length) return ["==", ["get", "source_id"], ""];
  return ["match", ["get", "source_id"], ids, true, false];
}

function campusFocusBounds() {
  const features = state.pointData?.features || [];
  if (!features.length) return new mapboxgl.LngLatBounds(campusBounds[0], campusBounds[1]);
  return features.reduce(
    (bounds, feature) => bounds.extend(feature.geometry.coordinates),
    new mapboxgl.LngLatBounds(features[0].geometry.coordinates, features[0].geometry.coordinates),
  );
}

function catalogFeatureBySourceId(sourceId) {
  return state.sourceFeatureById.get(String(sourceId || ""));
}

function displayFeatureBySourceId(sourceId) {
  return state.displayFeatureBySourceId.get(String(sourceId || ""));
}

function mergeCatalogAndMapbox(catalogFeature, mapboxProps = {}) {
  if (!catalogFeature) return null;
  return {
    ...catalogFeature,
    properties: {
      ...catalogFeature.properties,
      mapbox_building_type: mapboxProps.building_type || "",
      mapbox_height_m: mapboxProps.height_m ?? null,
      mapbox_eui_2023: mapboxProps.eui_2023 ?? null,
      mapbox_gfa_m2: mapboxProps.gfa_m2 ?? null,
      mapbox_footprint_m2: mapboxProps.footprint_m2 ?? null,
    },
  };
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function groupShortName(groupName, fallbackShortName) {
  const lookup = new Map([
    ["Kent Ridge Hall", "KRH"],
    ["Sheares Hall", "SH"],
    ["Temasek Hall", "TH"],
    ["Raffles Hall", "RH"],
    ["Eusoff Hall", "EH"],
    ["King Edward VII Hall", "KEVII"],
    ["Ridge View Residential College", "RVRC"],
    ["PGP Residence 1", "PGP1"],
    ["PGP Residence 2", "PGP2"],
    ["PGP Residence 3", "PGP3"],
    ["PGR Graduate Student", "PGR"],
    ["Helix House", "HH"],
    ["Pioneer House", "PH"],
    ["LightHouse", "LH"],
    ["Cendana College", "Cendana"],
    ["Elm College", "Elm"],
    ["Saga College", "Saga"],
    ["UTown Residence", "UTR"],
    ["University Hall", "UHALL"],
    ["Greenhouse", "GH"],
  ]);
  return lookup.get(groupName) || fallbackShortName || groupName.slice(0, 10);
}

function compactMapLabel(groupName, shortName) {
  const lookup = new Map([
    ["Cendana College", "CEN"],
    ["Cinnamon College", "CIN"],
    ["Elm College", "ELM"],
    ["Saga College", "SAGA"],
    ["Yale-NUS College", "YNC"],
    ["College of Alice & Peter Tan", "CAPT"],
    ["Kent Ridge Guild House", "KRGH"],
    ["Stephen Riady Centre", "SRC"],
    ["Education Resource Centre", "ERC"],
    ["University Sports Centre", "USC"],
    ["University Health Centre", "UHC"],
    ["Central Library", "CLB"],
    ["Central Library Annexe", "CLBA"],
    ["Medicine + Science Library", "MSL"],
    ["Centre for Life Sciences", "CELS"],
    ["Centre for English Language Communication", "CELC"],
    ["Techno Edge", "TE"],
    ["Create Tower", "CRT"],
    ["Create", "CRT"],
    ["Ventus", "VEN"],
    ["Greenhouse", "GH"],
    ["King Edward VII Hall", "KE7"],
  ]);
  if (lookup.has(groupName)) return lookup.get(groupName);
  const value = String(shortName || groupName || "").replace(/\s+/g, "");
  if (value.length <= 4) return value;
  const letters = value.replace(/[^A-Za-z0-9]/g, "");
  return letters.length <= 4 ? letters : letters.slice(0, 4).toUpperCase();
}

function buildingGroupName(name) {
  const text = String(name || "").trim();
  const replacements = [
    [/^Sheares Block [A-Z].*/i, "Sheares Hall"],
    [/^Kent Ridge Hall Block [A-Z].*/i, "Kent Ridge Hall"],
    [/^Temasek Hall Block .*/i, "Temasek Hall"],
    [/^Raffles Hall Block .*/i, "Raffles Hall"],
    [/^Raffles Hall \(Block .*/i, "Raffles Hall"],
    [/^Eusoff Hall Block .*/i, "Eusoff Hall"],
    [/^King Edward VII Hall Block .*/i, "King Edward VII Hall"],
    [/^King Edward VII Hall Communal Hall.*/i, "King Edward VII Hall"],
    [/^Ridge View Residential College Block .*/i, "Ridge View Residential College"],
    [/^PGP Residence 1 Block .*/i, "PGP Residence 1"],
    [/^PGP Residence 2 Block .*/i, "PGP Residence 2"],
    [/^PGP Residence 3 Block .*/i, "PGP Residence 3"],
    [/^PGR Graduate Student Block .*/i, "PGR Graduate Student"],
    [/^Helix House Block .*/i, "Helix House"],
    [/^Pioneer House Block .*/i, "Pioneer House"],
    [/^LightHouse Block .*/i, "LightHouse"],
    [/^UTown Residence (North|South) Tower.*/i, "UTown Residence"],
    [/^University Hall \(.*\)/i, "University Hall"],
  ];
  const matched = replacements.find(([pattern]) => pattern.test(text));
  if (matched) return matched[1];
  return text;
}

function buildingGroupKey(feature, groupName) {
  const knownParentGroups = new Set([
    "Kent Ridge Hall",
    "Sheares Hall",
    "Temasek Hall",
    "Raffles Hall",
    "Eusoff Hall",
    "King Edward VII Hall",
    "Ridge View Residential College",
    "PGP Residence 1",
    "PGP Residence 2",
    "PGP Residence 3",
    "PGR Graduate Student",
    "Helix House",
    "Pioneer House",
    "LightHouse",
    "UTown Residence",
    "University Hall",
  ]);
  if (knownParentGroups.has(groupName)) return `group-${slug(groupName)}`;
  return `group-${slug(groupName)}-${slug(feature.properties.zone)}`;
}

function childDisplayName(parentName, childName) {
  const name = String(childName || "");
  if (name === parentName) return "Main";
  if (parentName === "Sheares Hall") return name.replace(/^Sheares\s+/i, "");
  if (parentName === "PGR Graduate Student") return name.replace(/^PGR Graduate Student\s+/i, "");
  if (name.startsWith(parentName)) return name.slice(parentName.length).trim().replace(/^\(|\)$/g, "") || "Main";
  return name;
}

function firstFinite(values) {
  return values.map(Number).find(Number.isFinite) ?? null;
}

function sumFinite(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return numeric.reduce((total, value) => total + value, 0);
}

function maxFinite(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return Math.max(...numeric);
}

function averageFinite(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return numeric.reduce((total, value) => total + value, 0) / numeric.length;
}

function representativeFeature(features, groupName) {
  return (
    features.find((feature) => feature.properties.name === groupName) ||
    features.find((feature) => !/Block/i.test(feature.properties.name || "")) ||
    features[0]
  );
}

function buildDisplayFeatures(features) {
  const groups = new Map();
  features.filter((feature) => focusSourceIdSet.has(feature.properties.source_id)).forEach((feature) => {
    const groupName = buildingGroupName(feature.properties.name);
    const key = buildingGroupKey(feature, groupName) || feature.properties.id;
    if (!groups.has(key)) groups.set(key, { groupName, features: [] });
    groups.get(key).features.push(feature);
  });

  return Array.from(groups.values()).map(({ groupName, features }) => {
    const representative = representativeFeature(features, groupName);
    const props = representative.properties;
    const focus = focusBuildingBySourceId.get(props.source_id);
    const displayName = focus?.name || groupName;
    const displayCode = focus?.code || groupShortName(groupName, props.short_name);
    const childLabels = features.map((feature) => childDisplayName(groupName, feature.properties.name));
    const distinctChildLabels = Array.from(new Set(childLabels)).filter(Boolean);
    const childSummary =
      features.length > 1 && distinctChildLabels.length === 1 && distinctChildLabels[0] === "Main"
        ? `${features.length} footprints`
        : distinctChildLabels.join(", ");
    const coordinates =
      features.length > 1 && !features.some((feature) => feature.properties.name === groupName)
        ? [
            averageFinite(features.map((feature) => feature.geometry.coordinates[0])),
            averageFinite(features.map((feature) => feature.geometry.coordinates[1])),
          ]
        : representative.geometry.coordinates;
    const sourceIds = features.map((feature) => feature.properties.source_id).filter(Boolean);
    const hasRealtime = features.some((feature) => feature.properties.has_realtime);
    const displayProps = {
      ...props,
      id: `display-${slug(displayCode) || props.id}`,
      name: displayName,
      short_name: displayCode,
      region_color: focusRegions.find((region) => region.codes.includes(displayCode))?.color || "#64748b",
      source_id: props.source_id,
      source_ids: sourceIds.join(","),
      child_count: features.length,
      child_names: features.map((feature) => feature.properties.name).join("; "),
      child_summary: childSummary,
      has_realtime: hasRealtime,
      area_m2: sumFinite(features.map((feature) => feature.properties.area_m2)),
      load_kw: sumFinite(features.map((feature) => feature.properties.load_kw)),
      cooling_kw: sumFinite(features.map((feature) => feature.properties.cooling_kw)),
      water_m3_today: sumFinite(features.map((feature) => feature.properties.water_m3_today)),
      solar_kw: sumFinite(features.map((feature) => feature.properties.solar_kw)),
      eui: averageFinite(features.map((feature) => feature.properties.eui)),
      anomaly_score: maxFinite(features.map((feature) => feature.properties.anomaly_score)),
      forecast_peak_kw: sumFinite(features.map((feature) => feature.properties.forecast_peak_kw)),
      grouped_marker: features.length > 1,
      ai_summary:
        features.length > 1
          ? `${displayName} contains ${features.length} mapped footprints.`
          : props.ai_summary,
      suggested_action:
        features.length > 1
          ? `Block details are listed in the building tab: ${childSummary}.`
          : props.suggested_action,
    };
    displayProps.map_label = displayCode;

    return {
      type: "Feature",
      properties: {
        ...displayProps,
        label_priority: isPriorityBuilding(displayProps),
        label_rank: labelRank(displayProps),
      },
      geometry: {
        type: "Point",
        coordinates,
      },
    };
  });
}

function isPriorityBuilding(props) {
  const shortName = String(props.short_name || "");
  if (props.has_realtime) return true;
  if (priorityBuildingCodes.has(shortName)) return true;
  return /Central Library|University Sports Centre|Stephen Riady Centre|University Health Centre|Yusof Ishak House/i.test(
    props.name || "",
  );
}

function labelRank(props) {
  if (props.has_realtime) return 0;
  if (priorityBuildingCodes.has(String(props.short_name || ""))) return 1;
  if (props.has_model_assets) return 2;
  return 5;
}

function featuresForRegionCodes(codes, features = state.displayFeatures) {
  const codeSet = new Set(codes.map((code) => String(code || "")));
  return (features || []).filter((feature) => codeSet.has(String(feature.properties.short_name || "")));
}

function buildZonePointData(features) {
  return {
    type: "FeatureCollection",
    features: focusRegions.map((region) => {
      const regionFeatures = featuresForRegionCodes(region.codes, features);
      const count = regionFeatures.length || region.codes.length;
      const coordinates =
        regionFeatures.length > 0
          ? regionFeatures.reduce(
              (sum, feature) => {
                sum[0] += Number(feature.geometry.coordinates[0]);
                sum[1] += Number(feature.geometry.coordinates[1]);
                return sum;
              },
              [0, 0],
            ).map((value) => value / regionFeatures.length)
          : null;
      const fallbackCenter = features.reduce(
        (sum, feature) => {
          sum[0] += Number(feature.geometry.coordinates[0]);
          sum[1] += Number(feature.geometry.coordinates[1]);
          return sum;
        },
        [0, 0],
      );
      const center = coordinates || [
        fallbackCenter[0] / Math.max(features.length, 1),
        fallbackCenter[1] / Math.max(features.length, 1),
      ];
      return {
        type: "Feature",
        properties: {
          id: region.id,
          zone: region.label,
          count,
          codes: region.codes.join(","),
          label: `${region.label} (${count})`,
          color: region.color,
        },
        geometry: {
          type: "Point",
          coordinates: center,
        },
      };
    }),
  };
}

function ellipsePolygon(center, radiusLng, radiusLat, steps = 72) {
  const coordinates = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = (Math.PI * 2 * index) / steps;
    coordinates.push([center[0] + Math.cos(angle) * radiusLng, center[1] + Math.sin(angle) * radiusLat]);
  }
  return coordinates;
}

function buildRegionAreaData(features) {
  return {
    type: "FeatureCollection",
    features: focusRegions
      .map((region) => {
        const regionFeatures = featuresForRegionCodes(region.codes, features);
        if (!regionFeatures.length) return null;
        const lngs = regionFeatures.map((feature) => Number(feature.geometry.coordinates[0])).filter(Number.isFinite);
        const lats = regionFeatures.map((feature) => Number(feature.geometry.coordinates[1])).filter(Number.isFinite);
        if (!lngs.length || !lats.length) return null;
        const west = Math.min(...lngs);
        const east = Math.max(...lngs);
        const south = Math.min(...lats);
        const north = Math.max(...lats);
        const center = [(west + east) / 2, (south + north) / 2];
        const radiusLng = Math.max((east - west) / 2 + 0.0005, 0.00115);
        const radiusLat = Math.max((north - south) / 2 + 0.00045, 0.00085);
        return {
          type: "Feature",
          properties: {
            id: `${region.id}-area`,
            label: region.label,
            count: regionFeatures.length,
            color: region.color,
          },
          geometry: {
            type: "Polygon",
            coordinates: [ellipsePolygon(center, radiusLng, radiusLat)],
          },
        };
      })
      .filter(Boolean),
  };
}

function normalizeRealtimePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function average(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function sum(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return numeric.reduce((total, value) => total + value, 0);
}

function classifyRealtimePoints(points) {
  const byName = (pattern) => points.filter((item) => pattern.test(item.point || ""));
  const standardizedElectricity = byName(/ hourly_electrical_consumption$/i);
  const legacyElectricity = byName(/Calculated Building Electrical Consumption|Total Hourly Electrical Consumption|Electrical.*Consumption|Power_Meters/i);
  const standardizedCooling = byName(/ hourly_cooling_consumption$/i);
  const legacyCooling = byName(/Total Cooling Hourly Consumption|Total Hourly Cooling Consumption|BTU/i);
  const totalEnergyPoints = byName(/ hourly_all_consumption$/i);
  const allWater = byName(/Water|Volume/i);
  const standardizedPvComponents = byName(/(?: M[12]_hourly_generation| solar_m[12]_hourly_energy)$/i);
  const legacyPvAll = byName(/Act_E-Recv_.*_ALL_Hourly_kWh/i);
  const legacyPvComponents = byName(/Act_E-Recv_.*_M[12]_Hourly_kWh/i);
  const pvInverterPower = byName(/PV_System.*Total_kW/i);
  const temp = byName(/Temperature$/i);
  const humidity = byName(/Humidity$/i);
  const co2 = byName(/CO2$/i);
  const airflow = byName(/Airflow$/i);
  const updateTime = points
    .map((item) => item.time)
    .filter(Boolean)
    .sort()
    .at(-1);

  const electricityPoints = standardizedElectricity.length ? standardizedElectricity : legacyElectricity;
  const coolingPoints = standardizedCooling.length ? standardizedCooling : legacyCooling;
  const pvComponentPoints = standardizedPvComponents.length ? standardizedPvComponents : legacyPvComponents;
  const pvPrimaryPoint = legacyPvAll[0] || null;
  const pvPoints = standardizedPvComponents.length
    ? standardizedPvComponents
    : pvPrimaryPoint
      ? [pvPrimaryPoint]
      : pvComponentPoints.length
        ? pvComponentPoints
        : pvInverterPower;
  const electricityValue = sum(electricityPoints.map((item) => item.value));
  const coolingValue = sum(coolingPoints.map((item) => item.value));
  const waterValue = sum(allWater.map((item) => item.value));
  const pvGeneration = pvPrimaryPoint && !standardizedPvComponents.length
    ? Number(pvPrimaryPoint.value)
    : sum(pvPoints.map((item) => item.value));

  return {
    points,
    updateTime,
    electricityHourlyKwh: Number.isFinite(electricityValue) ? electricityValue : null,
    coolingHourlyKwh: Number.isFinite(coolingValue) ? coolingValue : null,
    totalEnergyHourlyKwh: sum(totalEnergyPoints.map((item) => item.value)),
    waterM3: Number.isFinite(waterValue) ? waterValue : null,
    pvKw: Number.isFinite(pvGeneration) ? pvGeneration : null,
    pvUnit: "kWh/h",
    pvPrimaryPoint,
    electricityPoints,
    coolingPoints,
    waterPoints: allWater,
    pvPoints,
    pvComponentPoints,
    pvInverterPowerPoints: pvInverterPower,
    indoorTemperatureC: average(temp.map((item) => item.value)),
    indoorHumidityPct: average(humidity.map((item) => item.value)),
    indoorCo2Ppm: average(co2.map((item) => item.value)),
    airflow: sum(airflow.map((item) => item.value)),
  };
}

function applyRealtimeToFeature(feature) {
  const props = feature.properties;
  const focusCode = focusBuildingBySourceId.get(props.source_id)?.code;
  const live = state.realtimeByBuilding[focusCode]
    || state.realtimeByBuilding[String(props.short_name || "").toUpperCase()]
    || state.realtimeByBuilding[String(props.id || "").toUpperCase()];
  props.has_realtime = Boolean(live);
  props.electricity_metric = live?.electricityHourlyKwh ?? props.load_kw ?? 0;
  props.cooling_metric = live?.coolingHourlyKwh ?? props.cooling_kw ?? 0;
  props.water_metric = live?.waterM3 ?? props.water_m3_today ?? 0;
  props.pv_metric = live?.pvKw ?? props.solar_kw ?? 0;
  props.latest_update = live?.updateTime || "";
  props.live_temperature_c = live?.indoorTemperatureC ?? null;
  props.live_humidity_pct = live?.indoorHumidityPct ?? null;
  props.live_co2_ppm = live?.indoorCo2Ppm ?? null;
  props.live_airflow = live?.airflow ?? null;
  return feature;
}

function refreshDerivedData() {
  state.data.features = state.data.features.map(applyRealtimeToFeature);
  state.sourceFeatureById = new Map(
    state.data.features
      .map((feature) => [feature.properties.source_id, feature])
      .filter(([sourceId]) => Boolean(sourceId)),
  );
  state.displayFeatures = buildDisplayFeatures(state.data.features);
  state.displayFeatureBySourceId = new Map();
  state.displayFeatures.forEach((feature) => {
    String(feature.properties.source_ids || feature.properties.source_id || "")
      .split(",")
      .filter(Boolean)
      .forEach((sourceId) => state.displayFeatureBySourceId.set(sourceId, feature));
  });
  state.pointData = {
    type: "FeatureCollection",
    features: state.displayFeatures.map((feature) => ({
      type: "Feature",
      properties: {
        ...feature.properties,
        label_priority: isPriorityBuilding(feature.properties),
        label_rank: labelRank(feature.properties),
      },
      geometry: {
        type: "Point",
        coordinates: featureCenter(feature),
      },
    })),
  };
  state.zoneData = buildZonePointData(state.displayFeatures);
  state.regionAreaData = buildRegionAreaData(state.displayFeatures);
}

async function loadRealtime() {
  setRealtimeStatus("", "Realtime API loading");
  const response = await fetch(`${realtimeConfig.baseUrl}?building=`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Realtime API: HTTP ${response.status}`);
  const points = normalizeRealtimePayload(await response.json());
  const configuredBuildings = new Set(realtimeConfig.liveBuildings.map((entry) => (
    typeof entry === "string" ? entry : entry.code
  )));
  const grouped = new Map();
  points.forEach((point) => {
    const apiCode = String(point.building || "").trim().toUpperCase();
    const building = frontendBuildingCode(apiCode);
    if (!building || !configuredBuildings.has(building)) return;
    if (!grouped.has(building)) grouped.set(building, []);
    grouped.get(building).push(point);
  });

  state.realtimeByBuilding = {};
  grouped.forEach((buildingPoints, building) => {
    const classified = classifyRealtimePoints(buildingPoints);
    state.realtimeByBuilding[building] = classified;
    if (buildingPerformanceModel[building] && classified.updateTime) {
      buildingPerformanceModel[building].updated = formatTimestamp(classified.updateTime);
    }
  });
  const liveCount = [...grouped.keys()].filter((code) => priorityBuildingCodes.has(code)).length;

  if (liveCount > 0) setRealtimeStatus("live", `${liveCount} building live`);
  else setRealtimeStatus("error", "Realtime API unavailable");

  refreshDerivedData();
  updateMapData();
  updateSummary();
  if (!els.trendModal?.classList.contains("hidden")) renderTrendLiveMeters();
  if (!els.brickModal?.classList.contains("hidden")) renderBrickGraph();
  renderBuildingList();
  if (state.selectedId) {
    const selected = state.displayFeatures.find((feature) => feature.properties.id === state.selectedId);
    if (selected) selectBuilding(selected, { activate: false });
  }
}

function updateMapData() {
  if (!state.map) return;
  if (state.map.getSource("building-points")) state.map.getSource("building-points").setData(state.pointData);
  if (state.map.getSource("zone-points")) state.map.getSource("zone-points").setData(state.zoneData);
  if (state.map.getSource("region-areas")) state.map.getSource("region-areas").setData(state.regionAreaData);
}

async function loadData() {
  let response = await fetch("data/processed/nus-campus-buildings.geojson");
  if (!response.ok) response = await fetch("data/processed/nus-campus-buildings.sample.geojson");
  if (!response.ok) throw new Error("Unable to load campus building registry GeoJSON.");
  state.data = await response.json();
  await loadExternalData();
  refreshDerivedData();
  updateSummary();
  renderBuildingList();
  const defaultBuilding = state.displayFeatures.find((feature) => String(feature.properties.short_name || "").toUpperCase() === "E3A");
  if (defaultBuilding) selectBuilding(defaultBuilding, { activate: false });
  renderExternalDataPanel(state.activeExternalDataset, { open: false });
  await loadBuildingPerformanceHistory();
}

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

async function loadExternalData() {
  const [electricity, systemDemand, solarPv] = await Promise.all([
    loadJson("data/external/ema/electricity-annual.json"),
    loadJson("data/external/ema/system-demand-context.json"),
    loadJson("data/external/ema/solar-pv-regional.json"),
  ]);
  state.externalData = {
    "electricity-consumption": electricity,
    "system-demand": systemDemand,
    "solar-pv-deployment": solarPv,
  };
}

function visibleFeatures() {
  if (!state.displayFeatures) return [];
  const search = state.searchTerm.toLowerCase();
  return state.displayFeatures.filter((feature) => {
    const props = feature.properties;
    const name = String(props.name || "").toLowerCase();
    const shortName = String(props.short_name || "").toLowerCase();
    const zone = String(props.zone || "").toLowerCase();
    const type = String(props.type || "").toLowerCase();
    const childNames = String(props.child_names || "").toLowerCase();
    return (
      !search ||
      name.includes(search) ||
      shortName.includes(search) ||
      zone.includes(search) ||
      type.includes(search) ||
      childNames.includes(search)
    );
  });
}

function liveBuildingCodes() {
  return Object.keys(state.realtimeByBuilding).filter((code) => (
    state.realtimeByBuilding[code] && priorityBuildingCodes.has(code)
  ));
}

function sumLiveMetric(accessor) {
  const values = liveBuildingCodes()
    .map((code) => accessor(state.realtimeByBuilding[code], code))
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map((value) => Number(value))
    .filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0);
}

function liveCoverageText() {
  const liveCodes = liveBuildingCodes();
  const liveCount = liveCodes.length;
  if (!liveCount) return "No live endpoints";
  if (liveCount === 1) return `${liveCodes[0]} live source • 1/${focusBuildings.length} buildings`;
  return `${liveCount}/${focusBuildings.length} buildings live`;
}

function renderOverviewBuildingPerformance() {
  if (!els.overviewBuildingPerformance) return;
  const priorityCodes = ["SDE4", "SDE3", "SDE2", "E6", "E8", "T-LAB", "COM3", "S1A"];
  els.overviewBuildingPerformance.innerHTML = priorityCodes
    .map((code) => {
      const live = state.realtimeByBuilding[code];
      const hasElectricity = Number.isFinite(Number(live?.electricityHourlyKwh));
      const hasCooling = Number.isFinite(Number(live?.coolingHourlyKwh));
      const hasPv = Number.isFinite(Number(live?.pvKw));
      const streamCount = [hasElectricity, hasCooling, hasPv].filter(Boolean).length;
      const status = streamCount === 3 ? "Complete" : streamCount > 0 ? "Mapped" : "Pending";
      const tone = streamCount === 3 ? "good" : streamCount > 0 ? "partial" : "";
      const coverage = streamCount === 3 ? 100 : streamCount === 2 ? 76 : streamCount === 1 ? 48 : 20;
      const streams = [hasElectricity && "Electricity", hasCooling && "Cooling", hasPv && "PV"].filter(Boolean);
      return `
        <button type="button" class="performance-row" data-performance-building="${code}">
          <strong>${code}</strong>
          <span class="performance-meter"><i style="width:${coverage}%"></i><small>${streams.join(" · ") || "Mapping in progress"}</small></span>
          <span class="tag ${tone}">${status}</span>
        </button>
      `;
    })
    .join("");
}

function updateSummary() {
  const electricity = sumLiveMetric((live) => live.electricityHourlyKwh);
  const cooling = sumLiveMetric((live) => live.coolingHourlyKwh);
  const water = sumLiveMetric((live) => live.waterM3);
  const pv = sumLiveMetric((live) => live.pvKw);
  if (els.overviewCoverage) els.overviewCoverage.textContent = liveCoverageText();
  if (els.summaryElectricity) els.summaryElectricity.textContent = electricity === null ? "No data" : formatMetric(electricity, "kWh/h", 1);
  if (els.summaryCooling) els.summaryCooling.textContent = cooling === null ? "-" : formatMetric(cooling, "kWh/h", 1);
  if (els.summaryWater) els.summaryWater.textContent = water === null ? "Pending" : formatMetric(water, "m3", 1);
  if (els.summaryPv) els.summaryPv.textContent = pv === null ? "-" : formatLivePvMetric(pv);
  const latestUpdate = liveBuildingCodes()
    .map((code) => state.realtimeByBuilding[code]?.updateTime)
    .filter(Boolean)
    .sort()
    .at(-1);
  if (els.overviewUpdated) {
    els.overviewUpdated.textContent = latestUpdate
      ? new Intl.DateTimeFormat("en-SG", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" }).format(new Date(latestUpdate))
      : "Awaiting data";
  }
  renderOverviewBuildingPerformance();
  renderAiInsights();
  renderRegionList();
}

function activateTab(tabName) {
  if (tabName === "market") tabName = "weather";
  state.mapBuildingPopup?.remove();
  state.mapHoveredSourceId = null;
  updateMapBuildingHighlight();
  closeTrendModal();
  closeBrickModal();
  setExternalPanelOpen(false);
  state.activeTab = tabName;
  els.tabButtons.forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.tabPanels.forEach((panel) => {
    const active = panel.dataset.tabPanel === tabName;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
  els.workspaceViews.forEach((view) => {
    const active = view.dataset.workspace === tabName;
    view.classList.toggle("active", active);
    view.hidden = !active;
  });
  if (els.mapStage) els.mapStage.dataset.activeWorkspace = tabName;
  if (tabName === "buildings") window.requestAnimationFrame(renderBuildingLocationMap);
  if (tabName === "overview") {
    if (state.mapTokenIssue) {
      setTokenError(state.mapTokenIssue);
      els.tokenPanel.classList.remove("hidden");
    }
    window.setTimeout(() => state.map?.resize(), 0);
  } else {
    els.tokenPanel.classList.add("hidden");
  }
  if (tabName === "weather") loadWeatherDashboard();
}

function zoomToRegionCodes(codes) {
  const regionFeatures = featuresForRegionCodes(codes);
  if (!regionFeatures.length || !state.map) return;
  const zoneBounds = regionFeatures.reduce(
    (bounds, item) => bounds.extend(item.geometry.coordinates),
    new mapboxgl.LngLatBounds(regionFeatures[0].geometry.coordinates, regionFeatures[0].geometry.coordinates),
  );
  state.map.fitBounds(zoneBounds, {
    padding: { top: 100, right: 120, bottom: 100, left: 120 },
    maxZoom: 17.1,
    pitch: 52,
    bearing: -24,
    duration: 700,
  });
}

function renderRegionList() {
  if (!els.regionList) return;
  els.regionList.innerHTML = "";
  focusRegions.forEach((region) => {
    const features = featuresForRegionCodes(region.codes);
    const liveCount = features.filter((feature) => feature.properties.has_realtime).length;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "region-card";
    card.innerHTML = `
      <span style="--region-color:${region.color}">${features.length || region.codes.length}</span>
      <div>
        <strong>${region.label}</strong>
        <small>${region.codes.join(", ")}</small>
      </div>
      <em>${liveCount} live</em>
    `;
    card.addEventListener("click", () => zoomToRegionCodes(region.codes));
    els.regionList.appendChild(card);
  });
}

function aiInsightItems() {
  const liveCodes = liveBuildingCodes();
  const liveCount = liveCodes.length;
  const liveList = liveCodes.length ? liveCodes.join(", ") : "none";
  const waterMappedCodes = liveCodes.filter((code) => {
    const value = state.realtimeByBuilding[code]?.waterM3;
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  });
  const liveCooling = sumLiveMetric((live) => live.coolingHourlyKwh);
  const livePv = sumLiveMetric((live) => live.pvKw);
  const items = [
    {
      severity: liveCount ? "normal" : "warning",
      title: `${liveCount} of ${focusBuildings.length} focus buildings live`,
      evidence: `Current public realtime coverage includes: ${liveList}.`,
      action: "Use the PI Web API point discovery workflow to map additional building codes before campus-wide AI fault detection.",
      confidence: "High",
    },
  ];

  if (liveCount) {
    items.push({
      severity: waterMappedCodes.length ? "normal" : "warning",
      title: waterMappedCodes.length ? "Water stream is mapped for live buildings" : "Water PI points are not mapped to public realtime yet",
      evidence: waterMappedCodes.length
        ? `Water values are available for: ${waterMappedCodes.join(", ")}.`
        : `Live buildings without public water values: ${liveCodes.join(", ")}.`,
      action: "Validate main potable, NEWater, and submeter candidates in PI before exposing a water metric through the API.",
      confidence: "High",
    });
    items.push({
      severity: "normal",
      title: "Live cooling and PV generation streams are partially mapped",
      evidence: `Coverage ${liveList}; cooling ${formatMetric(liveCooling, "kWh/h", 1)}; PV generation ${formatLivePvMetric(livePv)}.`,
      action: "Use the ALL hourly PV generation point as the primary series; keep M1 and M2 for meter-level breakdown.",
      confidence: "Medium",
    });
  }

  items.push({
    severity: "info",
    title: "EMA data should be used as external context",
    evidence: "EMA public data is national, market, sector, or planning-area level; it is not NUS building-level metering.",
    action: "Keep EMA datasets in a separate context layer for benchmarking, peak-period annotation, and policy baselines.",
    confidence: "High",
  });

  return items;
}

function renderAiInsights() {
  const items = aiInsightItems();
  const render = (target, limit = items.length) => {
    if (!target) return;
    target.innerHTML = items
      .slice(0, limit)
      .map(
        (item) => `
          <article class="ai-item ${item.severity}">
            <div>
              <strong>${item.title}</strong>
              <p>${item.evidence}</p>
              <small>${item.action}</small>
            </div>
            <span>${item.confidence}</span>
          </article>
        `,
      )
      .join("");
  };
  render(els.aiBriefList, 2);
  render(els.aiInsightList);
}

function aiClusterConfig(cluster) {
  const configs = {
    normal: {
      label: "Normal coupling",
      color: aiHealthConfig.clusterColors.normal,
      description: "Cooling tracks the current weather load within the expected band.",
    },
    weather: {
      label: "Weather-driven load",
      color: aiHealthConfig.clusterColors.weather,
      description: "High cooling coincides with high outdoor temperature or humidity.",
    },
    mildHigh: {
      label: "High cooling, mild weather",
      color: aiHealthConfig.clusterColors.mildHigh,
      description: "Cooling is high while weather load is moderate. This is the strongest health-monitoring candidate.",
    },
    afterHours: {
      label: "After-hours cooling",
      color: aiHealthConfig.clusterColors.afterHours,
      description: "Cooling is material during late evening, night, or weekend hours.",
    },
    standby: {
      label: "Low / standby",
      color: aiHealthConfig.clusterColors.standby,
      description: "Cooling is low relative to the recent SDE4 distribution.",
    },
  };
  return configs[cluster] || configs.normal;
}

function quantile(values, q) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function pearsonCorrelation(rows, xAccessor, yAccessor) {
  const pairs = rows
    .map((row) => [Number(xAccessor(row)), Number(yAccessor(row))])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 3) return null;
  const meanX = average(pairs.map(([x]) => x));
  const meanY = average(pairs.map(([, y]) => y));
  const numerator = pairs.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0);
  const xDenominator = Math.sqrt(pairs.reduce((total, [x]) => total + (x - meanX) ** 2, 0));
  const yDenominator = Math.sqrt(pairs.reduce((total, [, y]) => total + (y - meanY) ** 2, 0));
  if (!xDenominator || !yDenominator) return null;
  return numerator / (xDenominator * yDenominator);
}

function linearFit(rows, xAccessor, yAccessor) {
  const pairs = rows
    .map((row) => [Number(xAccessor(row)), Number(yAccessor(row))])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 3) return { slope: 0, intercept: average(pairs.map(([, y]) => y)) || 0 };
  const meanX = average(pairs.map(([x]) => x));
  const meanY = average(pairs.map(([, y]) => y));
  const denominator = pairs.reduce((total, [x]) => total + (x - meanX) ** 2, 0);
  if (!denominator) return { slope: 0, intercept: meanY };
  const slope = pairs.reduce((total, [x, y]) => total + (x - meanX) * (y - meanY), 0) / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

function singaporeDateFromWeatherTime(value) {
  if (!value) return null;
  const localValue = value.includes("+") || value.endsWith("Z") ? value : `${value}:00+08:00`;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function weatherProxy(timestamp) {
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  const hour = date.getUTCHours();
  const dayFactor = Math.sin(((hour - 8) / 24) * Math.PI * 2);
  const tempC = 28.1 + 2.4 * Math.max(0, dayFactor) + 0.5 * Math.sin((date.getUTCDate() / 31) * Math.PI * 2);
  const humidityPct = 78 - 12 * Math.max(0, dayFactor);
  return {
    tempC,
    humidityPct,
    source: "weather proxy",
  };
}

function weatherLoadIndex(tempC, humidityPct) {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct)) return null;
  return tempC + Math.max(0, humidityPct - 60) * 0.08;
}

async function loadWeatherRows() {
  const params = new URLSearchParams({
    latitude: String(aiHealthConfig.weather.latitude),
    longitude: String(aiHealthConfig.weather.longitude),
    hourly: "temperature_2m,relative_humidity_2m",
    past_days: "7",
    forecast_days: "1",
    timezone: "Asia/Singapore",
  });
  const response = await fetch(`${aiHealthConfig.weatherUrl}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`weather HTTP ${response.status}`);
  const payload = await response.json();
  const times = payload?.hourly?.time || [];
  const temps = payload?.hourly?.temperature_2m || [];
  const humidity = payload?.hourly?.relative_humidity_2m || [];
  const rows = times
    .map((time, index) => {
      const date = singaporeDateFromWeatherTime(time);
      if (!date) return null;
      return {
        time,
        timestamp: date.getTime(),
        label: singaporeBucket(date, "hour").label,
        tempC: Number(temps[index]),
        humidityPct: Number(humidity[index]),
        source: "Open-Meteo",
      };
    })
    .filter((row) => row && Number.isFinite(row.tempC) && Number.isFinite(row.humidityPct));
  return new Map(rows.map((row) => [row.label, row]));
}

function classifyAiHealthRows(rows) {
  const coolingValues = rows.map((row) => row.coolingKwh).filter(Number.isFinite);
  const weatherValues = rows.map((row) => row.weatherIndex).filter(Number.isFinite);
  const q40 = quantile(coolingValues, 0.4) ?? 0;
  const q75 = quantile(coolingValues, 0.75) ?? q40;
  const q9 = quantile(coolingValues, 0.9) ?? q75;
  const weatherMedian = quantile(weatherValues, 0.5) ?? 0;
  const fit = linearFit(rows, (row) => row.weatherIndex, (row) => row.coolingKwh);
  const residuals = rows.map((row) => row.coolingKwh - (fit.intercept + fit.slope * row.weatherIndex));
  const residualQ9 = quantile(residuals.map(Math.abs), 0.9) || 1;

  return rows.map((row) => {
    const date = new Date(row.timestamp + 8 * 60 * 60 * 1000);
    const hour = date.getUTCHours();
    const day = date.getUTCDay();
    const afterHours = hour < 7 || hour >= 20 || day === 0 || day === 6;
    const expected = fit.intercept + fit.slope * row.weatherIndex;
    const residual = row.coolingKwh - expected;
    let cluster = "normal";
    if (row.coolingKwh <= q40) cluster = "standby";
    else if (afterHours && row.coolingKwh >= q75) cluster = "afterHours";
    else if (row.coolingKwh >= q9 && row.weatherIndex <= weatherMedian + 0.4) cluster = "mildHigh";
    else if (row.coolingKwh >= q75 && row.weatherIndex > weatherMedian) cluster = "weather";
    const outlierScore = Math.max(0, Math.min(100, (residual / residualQ9) * 70));
    return {
      ...row,
      expectedCooling: expected,
      residual,
      cluster,
      outlierScore,
    };
  });
}

async function buildAiHealthModel(force = false) {
  if (state.aiHealthCache && !force) return state.aiHealthCache;
  const definition = historyPointByKey("cooling", aiHealthConfig.building);
  const rawCooling = await loadHistory(definition);
  const coolingRows = aggregateHistory(rawCooling, "hour").slice(-168);
  let weatherRows = new Map();
  let weatherSource = "weather proxy";
  try {
    weatherRows = await loadWeatherRows();
    weatherSource = "Open-Meteo";
  } catch (error) {
    console.warn("Weather context unavailable; using proxy.", error);
  }
  const rows = coolingRows.map((row) => {
    const weather = weatherRows.get(row.label) || weatherProxy(row.timestamp);
    return {
      timestamp: row.timestamp,
      label: row.label,
      coolingKwh: row.value,
      tempC: weather.tempC,
      humidityPct: weather.humidityPct,
      weatherIndex: weatherLoadIndex(weather.tempC, weather.humidityPct),
      sampleCount: row.count,
      weatherSource: weather.source,
    };
  }).filter((row) => Number.isFinite(row.coolingKwh) && Number.isFinite(row.weatherIndex));
  const classifiedRows = classifyAiHealthRows(rows);
  const current = classifiedRows.at(-1) || null;
  const clusterCounts = classifiedRows.reduce((counts, row) => {
    counts[row.cluster] = (counts[row.cluster] || 0) + 1;
    return counts;
  }, {});
  const coupling = pearsonCorrelation(classifiedRows, (row) => row.weatherIndex, (row) => row.coolingKwh);
  const model = {
    building: aiHealthConfig.building,
    rows: classifiedRows,
    current,
    clusterCounts,
    coupling,
    weatherSource,
    rawCoolingCount: rawCooling.length,
  };
  state.aiHealthCache = model;
  return model;
}

function couplingLabel(value) {
  if (!Number.isFinite(value)) return "Pending";
  const abs = Math.abs(value);
  if (abs >= 0.65) return "Strong";
  if (abs >= 0.35) return "Moderate";
  return "Weak";
}

function aiHealthClusterLabel(cluster) {
  return aiClusterConfig(cluster).label;
}

function renderAiHealthKpis(model) {
  if (!els.aiHealthKpis) return;
  const current = model.current;
  const currentCluster = current ? aiClusterConfig(current.cluster) : aiClusterConfig("normal");
  const outlierScore = current ? Math.round(current.outlierScore) : 0;
  const coolingValue = current ? formatMetric(current.coolingKwh, "kWh/h", 1) : "-";
  const weatherText = current ? `${formatNumber(current.tempC, 1)} degC / ${formatNumber(current.humidityPct, 0)}% RH` : "-";
  const rowsText = `${model.rows.length} hourly points`;
  els.aiHealthKpis.innerHTML = [
    ["Current regime", currentCluster.label, currentCluster.description],
    ["Cooling now", coolingValue, weatherText],
    ["Outlier score", `${outlierScore}/100`, "Residual against weather-normalized baseline"],
    ["Weather coupling", couplingLabel(model.coupling), `r = ${formatNumber(model.coupling, 2)} · ${model.weatherSource}`],
    ["Coverage", rowsText, `${model.rawCoolingCount.toLocaleString()} raw cooling samples`],
  ].map(([label, value, note]) => `
    <div class="ai-health-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `).join("");
}

function focusRegionForCode(code) {
  return focusRegions.find((region) => region.codes.includes(code))?.label || "Focus building";
}

function renderAiClusterChart(model) {
  if (!els.aiClusterChart) return;
  const liveCodes = liveBuildingCodes();
  const currentConfig = model.current ? aiClusterConfig(model.current.cluster) : aiClusterConfig("normal");
  const rows = focusBuildings
    .map((building, index) => {
      const live = state.realtimeByBuilding[building.code];
      const isHealthBuilding = building.code === model.building;
      const status = live
        ? isHealthBuilding && model.current
          ? currentConfig.label
          : "Live endpoint mapped"
        : "Mapping pending";
      const value = live ? `${formatMetric(live.coolingHourlyKwh, "kWh/h", 1)} cooling` : "No public live endpoint";
      const note = live
        ? `${live.points.length} points · PV ${formatLivePvMetric(live.pvKw)} · updated ${formatTimestamp(live.updateTime)}`
        : `${focusRegionForCode(building.code)} · BAS channel mapping needed`;
      return {
        building,
        index,
        live,
        status,
        value,
        note,
        width: live ? 100 : 7,
        color: live ? (isHealthBuilding ? currentConfig.color : aiHealthConfig.clusterColors.normal) : "#cbd5df",
      };
    })
    .sort((a, b) => Number(Boolean(b.live)) - Number(Boolean(a.live)) || a.index - b.index);
  const liveCount = liveCodes.length;
  if (els.aiClusterMeta) els.aiClusterMeta.textContent = `${liveCount}/${focusBuildings.length} focus buildings live`;
  els.aiClusterChart.innerHTML = `
    <div class="ai-live-dashboard" role="list" aria-label="Focus building live health status">
      ${rows.map((row) => `
        <div class="ai-live-row ${row.live ? "is-live" : "is-pending"}" role="listitem">
          <div class="ai-live-name">
            <strong>${escapeHtml(row.building.code)}</strong>
            <span>${escapeHtml(row.building.name)}</span>
          </div>
          <div class="ai-live-track" title="${escapeHtml(row.note)}">
            <i style="--bar-width:${row.width}%; --bar-color:${row.color};"></i>
            <span>${escapeHtml(row.status)}</span>
          </div>
          <div class="ai-live-value">
            <strong>${escapeHtml(row.value)}</strong>
            <span>${escapeHtml(row.note)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAiRegimeTimeline(model) {
  if (!els.aiRegimeTimeline) return;
  if (!model.rows.length) {
    els.aiRegimeTimeline.innerHTML = '<p class="empty-note">Diagnostic evidence is waiting for clustering output.</p>';
    return;
  }
  const total = model.rows.length || 1;
  const current = model.current;
  const currentConfig = current ? aiClusterConfig(current.cluster) : aiClusterConfig("normal");
  const clusters = ["normal", "weather", "mildHigh", "afterHours", "standby"];
  const rows = clusters.map((cluster) => {
    const config = aiClusterConfig(cluster);
    const count = model.clusterCounts[cluster] || 0;
    return {
      cluster,
      label: config.label,
      color: config.color,
      count,
      pct: Math.max(count ? 3 : 0, (count / total) * 100),
      description: config.description,
    };
  });
  els.aiRegimeTimeline.innerHTML = `
    <div class="ai-evidence-summary">
      <strong>${escapeHtml(currentConfig.label)}</strong>
      <span>${total} hourly samples · current score ${current ? Math.round(current.outlierScore) : 0}/100 · ${escapeHtml(model.weatherSource)}</span>
    </div>
    <div class="ai-evidence-bars" role="list" aria-label="SDE4 diagnostic evidence by regime">
      ${rows.map((row) => `
        <div class="ai-evidence-row ${current?.cluster === row.cluster ? "is-current" : ""}" role="listitem" title="${escapeHtml(row.description)}">
          <div class="ai-evidence-label">
            <i style="--cluster-color:${row.color};"></i>
            <span>${escapeHtml(row.label)}</span>
          </div>
          <div class="ai-evidence-track">
            <b style="--bar-width:${row.pct}%; --bar-color:${row.color};"></b>
          </div>
          <strong>${row.count} h</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAiLlmSummary(model) {
  if (!els.aiLlmSummary) return;
  const current = model.current;
  const currentConfig = current ? aiClusterConfig(current.cluster) : aiClusterConfig("normal");
  const mildHighCount = model.clusterCounts.mildHigh || 0;
  const afterHoursCount = model.clusterCounts.afterHours || 0;
  const weatherCount = model.clusterCounts.weather || 0;
  const outlierScore = current ? Math.round(current.outlierScore) : 0;
  const nextAction = current?.cluster === "mildHigh"
    ? "Check chilled-water valve behavior, AHU/PAHU schedules, and occupancy assumptions for this period."
    : current?.cluster === "afterHours"
      ? "Check operating schedule, event bookings, and after-hours ventilation commands."
      : "Use this as the baseline evidence bundle before escalating to fault diagnosis.";
  els.aiLlmSummary.innerHTML = `
    <div>
      <p class="eyebrow">LLM Chart Brief</p>
      <h3>${escapeHtml(currentConfig.label)}</h3>
      <p>The dashboard packages focus-building live coverage, SDE4 cooling, outdoor weather context, regime assignment, residual score, and evidence counts into a prompt-ready health-monitoring summary.</p>
    </div>
    <ul>
      <li>Current cooling regime: <strong>${escapeHtml(currentConfig.label)}</strong>; outlier score <strong>${outlierScore}/100</strong>.</li>
      <li>Last 7 days include <strong>${mildHighCount}</strong> mild-weather high-cooling hours, <strong>${afterHoursCount}</strong> after-hours cooling hours, and <strong>${weatherCount}</strong> weather-driven hours.</li>
      <li>Weather-cooling coupling is <strong>${escapeHtml(couplingLabel(model.coupling))}</strong> using <strong>${escapeHtml(model.weatherSource)}</strong> weather context.</li>
      <li>${escapeHtml(nextAction)}</li>
    </ul>
  `;
}

function aiAgentModelContext(model = state.aiHealthCache) {
  const current = model?.current;
  const clusterConfig = current ? aiClusterConfig(current.cluster) : aiClusterConfig("normal");
  return {
    model,
    current,
    clusterConfig,
    outlierScore: current ? Math.round(current.outlierScore) : 0,
    cooling: current ? formatMetric(current.coolingKwh, "kWh/h", 1) : "-",
    weather: current ? `${formatNumber(current.tempC, 1)} degC, ${formatNumber(current.humidityPct, 0)}% RH` : "-",
    coupling: model ? couplingLabel(model.coupling) : "Pending",
    couplingValue: model ? formatNumber(model.coupling, 2) : "-",
    mildHighCount: model?.clusterCounts?.mildHigh || 0,
    afterHoursCount: model?.clusterCounts?.afterHours || 0,
    weatherCount: model?.clusterCounts?.weather || 0,
  };
}

function defaultAiAgentMessage(model = state.aiHealthCache) {
  if (!model?.current) {
    return "SDE4 cooling health evidence is still loading.";
  }
  const context = aiAgentModelContext(model);
  return `Current SDE4 regime is ${context.clusterConfig.label}. Cooling is ${context.cooling} under ${context.weather}; residual outlier score is ${context.outlierScore}/100.`;
}

function aiAgentReply(prompt) {
  const context = aiAgentModelContext();
  if (!context.model?.current) return "I need the SDE4 cooling-health model to finish loading before giving an evidence-based answer.";
  const normalized = prompt.toLowerCase();
  if (/regime|current|explain|状态|当前/.test(normalized)) {
    return `${context.clusterConfig.label}: ${context.clusterConfig.description} Current cooling is ${context.cooling}, weather context is ${context.weather}, and the outlier score is ${context.outlierScore}/100.`;
  }
  if (/check|first|action|检查|建议|排查/.test(normalized)) {
    if (context.current.cluster === "mildHigh") {
      return "First checks: chilled-water valve position, PAHU/AHU schedule, VAV airflow commands, and whether the zone is in after-hours operation. The key evidence is high cooling under mild weather.";
    }
    if (context.current.cluster === "afterHours") {
      return "First checks: operating schedule, event booking, occupancy override, and nighttime ventilation command. The key evidence is material cooling during after-hours periods.";
    }
    return "First checks: confirm cooling meter freshness, compare current point with the weather-normalized baseline, then inspect the Brick chain Chilled water -> Cooling BTU meter -> Cooling hourly.";
  }
  if (/weather|coupling|temperature|humidity|天气|气象/.test(normalized)) {
    return `Weather coupling is ${context.coupling} with r = ${context.couplingValue}. The model uses ${context.model.weatherSource}; the current weather context is ${context.weather}.`;
  }
  if (/gap|confidence|data|coverage|缺|置信/.test(normalized)) {
    return `Current limits: only ${context.model.building} has public realtime coverage; water is not mapped; equipment-level BAS point mapping is partial. The clustering uses ${context.model.rows.length} hourly cooling points and ${context.model.weatherSource} weather context.`;
  }
  return `I would treat this as a cooling-health question. Current regime: ${context.clusterConfig.label}; outlier score ${context.outlierScore}/100; evidence counts include ${context.mildHighCount} mild-weather high-cooling hours and ${context.afterHoursCount} after-hours cooling hours.`;
}

function renderAiAgentWindow(model = state.aiHealthCache) {
  if (!els.aiAgentMessages) return;
  if (els.aiAgentStatus) {
    els.aiAgentStatus.textContent = model?.weatherSource ? `${model.building} · ${model.weatherSource}` : "Evidence agent";
  }
  const messages = [
    { role: "agent", text: defaultAiAgentMessage(model) },
    ...state.aiAgentMessages,
  ];
  els.aiAgentMessages.innerHTML = messages
    .map((message) => `
      <div class="ai-agent-message ${message.role}">
        <span>${message.role === "user" ? "You" : "Agent"}</span>
        <p>${escapeHtml(message.text)}</p>
      </div>
    `)
    .join("");
  els.aiAgentMessages.scrollTop = els.aiAgentMessages.scrollHeight;
}

function submitAiAgentPrompt(prompt) {
  const text = String(prompt || "").trim();
  if (!text) return;
  state.aiAgentMessages.push({ role: "user", text });
  state.aiAgentMessages.push({ role: "agent", text: aiAgentReply(text) });
  if (state.aiAgentMessages.length > 10) state.aiAgentMessages = state.aiAgentMessages.slice(-10);
  renderAiAgentWindow();
}

function setAiHealthLoading(message) {
  if (els.aiHealthKpis) {
    els.aiHealthKpis.innerHTML = `<div class="ai-health-loading">${escapeHtml(message)}</div>`;
  }
  if (els.aiClusterChart) els.aiClusterChart.innerHTML = "";
  if (els.aiRegimeTimeline) els.aiRegimeTimeline.innerHTML = "";
  if (els.aiLlmSummary) els.aiLlmSummary.innerHTML = "";
  if (els.aiAgentMessages) {
    els.aiAgentMessages.innerHTML = `
      <div class="ai-agent-message agent">
        <span>Agent</span>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
}

async function renderAiHealthMonitor({ force = false } = {}) {
  if (!els.aiHealthKpis || state.aiHealthLoading) return;
  state.aiHealthLoading = true;
  setAiHealthLoading("Loading SDE4 cooling history and weather context...");
  try {
    const model = await buildAiHealthModel(force);
    renderAiHealthKpis(model);
    renderAiClusterChart(model);
    renderAiRegimeTimeline(model);
    renderAiLlmSummary(model);
    renderAiAgentWindow(model);
  } catch (error) {
    console.error(error);
    setAiHealthLoading(`AI health monitor unavailable: ${error.message}`);
  } finally {
    state.aiHealthLoading = false;
  }
}

function setExternalButtonState(datasetId) {
  els.externalDataButtons.forEach((button) => {
    const active = button.dataset.external === datasetId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setExternalPanelOpen(open) {
  state.externalPanelOpen = open;
  els.externalContextPanel?.classList.toggle("hidden", !open);
}

function valueRange(seriesValues) {
  const values = seriesValues.map(Number).filter(Number.isFinite);
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

function linePath(values, yAccessor, width = 330, height = 148) {
  const padding = { left: 14, right: 14, top: 14, bottom: 18 };
  const [min, max] = valueRange(values.map(yAccessor));
  const span = max - min || 1;
  return values
    .map((item, index) => {
      const x = padding.left + (index / Math.max(values.length - 1, 1)) * (width - padding.left - padding.right);
      const y = height - padding.bottom - ((yAccessor(item) - min) / span) * (height - padding.top - padding.bottom);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function lineChartSvg(series) {
  const width = 330;
  const height = 148;
  const grid = [36, 72, 108]
    .map((y) => `<line x1="14" y1="${y}" x2="316" y2="${y}" />`)
    .join("");
  const paths = series
    .map(
      (item) =>
        `<path d="${linePath(item.values, item.y)}" fill="none" stroke="${item.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
    )
    .join("");
  const legend = series
    .map((item, index) => `<span><i style="background:${item.color}"></i>${item.name}</span>`)
    .join("");
  return `
    <div class="chart-card">
      <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="External energy trend">
        <g class="chart-grid">${grid}</g>
        ${paths}
      </svg>
      <div class="chart-legend">${legend}</div>
    </div>
  `;
}

function barChartSvg(values, labelAccessor, valueAccessor, color = "#003d7c") {
  const max = Math.max(...values.map(valueAccessor).filter(Number.isFinite), 1);
  return `
    <div class="bar-chart">
      ${values
        .map((item) => {
          const value = valueAccessor(item);
          const width = Math.max((value / max) * 100, 1);
          return `
            <div class="bar-row">
              <span>${labelAccessor(item)}</span>
              <div><i style="width:${width.toFixed(1)}%; background:${color}"></i></div>
              <strong>${formatNumber(value, 0)}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function externalKpi(label, value, note = "") {
  return `
    <div class="external-kpi">
      <span>${label}</span>
      <strong>${value}</strong>
      ${note ? `<small>${note}</small>` : ""}
    </div>
  `;
}

function externalDatasetView(datasetId) {
  const data = state.externalData[datasetId];
  if (!data) {
    return {
      title: "External data unavailable",
      body: '<p class="empty-note">EMA/data.gov.sg files have not loaded.</p>',
    };
  }
  const meta = {
    source: data.source,
    sourceUrl: data.source_url,
    retrievedAt: data.retrieved_at,
  };

  if (datasetId === "electricity-consumption") {
    const generation = data.series.find((item) => item.name === "Electricity Generation")?.values || [];
    const consumption = data.series.find((item) => item.name === "Electricity Consumption")?.values || [];
    return {
      title: "Electricity consumption",
      ...meta,
      body: `
        <div class="external-kpis">
          ${externalKpi("Latest consumption", `${formatNumber(data.summary.latest_consumption_gwh, 1)} GWh`, `${data.summary.latest_consumption_year || data.summary.latest_year}`)}
          ${externalKpi("YoY change", `${formatNumber(data.summary.yoy_consumption_pct, 2)}%`, "national")}
          ${externalKpi("Generation", `${formatNumber(data.summary.latest_generation_gwh, 1)} GWh`, `${data.summary.latest_generation_year || data.summary.latest_year}`)}
        </div>
        ${lineChartSvg([
          { name: "Generation", color: "#003d7c", values: generation, y: (item) => item.value_gwh },
          { name: "Consumption", color: "#ef7c00", values: consumption, y: (item) => item.value_gwh },
        ])}
        <p class="external-note">Use this as national baseline context for campus energy narratives. It should not replace NUS PI meter values.</p>
      `,
    };
  }

  if (datasetId === "system-demand") {
    const values = data.values || [];
    return {
      title: "System demand context",
      ...meta,
      body: `
        <div class="external-kpis">
          ${externalKpi("Latest period", data.summary.latest_period)}
          ${externalKpi("Generation proxy", `${formatNumber(data.summary.latest_generation_gwh, 1)} GWh`, "monthly")}
          ${externalKpi("MoM change", `${formatNumber(data.summary.mom_generation_pct, 2)}%`, "proxy")}
        </div>
        ${barChartSvg(values, (item) => item.period, (item) => item.value_gwh, "#287c6f")}
        <p class="external-note">${data.note}</p>
      `,
    };
  }

  const annual = data.annual || [];
  const regionValues = (data.latest_by_region || [])
    .slice()
    .sort((a, b) => b.installed_capacity_kwac - a.installed_capacity_kwac)
    .slice(0, 5);
  return {
    title: "Solar PV deployment",
    ...meta,
    body: `
      <div class="external-kpis">
        ${externalKpi("Installed capacity", `${formatNumber(data.summary.latest_installed_capacity_kwac / 1000, 1)} MWac`, `${data.summary.latest_year}`)}
        ${externalKpi("YoY change", `${formatNumber(data.summary.yoy_capacity_pct, 2)}%`, "capacity")}
        ${externalKpi("Installations", formatNumber(data.summary.latest_installations, 0), `${data.summary.latest_year}`)}
      </div>
      ${lineChartSvg([{ name: "Installed capacity", color: "#ef7c00", values: annual, y: (item) => item.installed_capacity_kwac }])}
      <h4 class="external-subtitle">Top planning regions</h4>
      ${barChartSvg(regionValues, (item) => item.region, (item) => item.installed_capacity_kwac / 1000, "#ef7c00")}
      <p class="external-note">Use this as PV deployment benchmark. NUS PV output still comes from the building-level PI/FastAPI pipeline.</p>
    `,
  };
}

function renderExternalDataPanel(datasetId = state.activeExternalDataset, options = {}) {
  if (!els.externalVizPanel) return;
  const { open = true } = options;
  state.activeExternalDataset = datasetId;
  setExternalButtonState(datasetId);
  const view = externalDatasetView(datasetId);
  const sourceMeta = view.source
    ? `<div class="external-source">
        <span>${view.source}</span>
        ${view.sourceUrl ? `<a href="${view.sourceUrl}" target="_blank" rel="noreferrer">Source</a>` : ""}
        ${view.retrievedAt ? `<small>Retrieved ${formatTimestamp(view.retrievedAt)}</small>` : ""}
      </div>`
    : "";
  els.externalVizPanel.innerHTML = `
    <article class="external-viz-card">
      <header>
        <div>
          <p class="eyebrow">External data</p>
          <h3>${view.title}</h3>
        </div>
        ${sourceMeta}
      </header>
      ${view.body}
    </article>
  `;
  setExternalPanelOpen(open);
}

function selectedBuildingCodes() {
  return [...state.selectedComparisonBuildings];
}

function formatEnergyTotal(value) {
  if (!Number.isFinite(value)) return "Not mapped";
  return `${Math.round(value).toLocaleString("en-SG")} kWh`;
}

function formatEnergyCompact(value) {
  if (!Number.isFinite(value)) return "No data";
  if (Math.abs(value) >= 1000) {
    const digits = Math.abs(value) >= 100_000 ? 0 : 1;
    return `${(value / 1000).toLocaleString("en-SG", { minimumFractionDigits: digits, maximumFractionDigits: digits })} MWh`;
  }
  return `${Math.round(value).toLocaleString("en-SG")} kWh`;
}

function niceChartStep(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const fraction = value / power;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return niceFraction * power;
}

function buildingDateLabels(count) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getTime() - (count - index - 1) * 86_400_000);
    return date.toISOString().slice(0, 10);
  });
}

function formatBuildingChartDate(value, includeWeekday = false) {
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-SG", {
    ...(includeWeekday ? { weekday: "short" } : {}),
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatBuildingChartLabel(value, period, includeWeekday = false) {
  if (period === "yearly") {
    const date = new Date(`${value}-01T00:00:00+08:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-SG", {
      month: includeWeekday ? "long" : "short",
      ...(includeWeekday ? { year: "numeric" } : {}),
    }).format(date);
  }
  return formatBuildingChartDate(value, includeWeekday);
}

function aggregateHistoryBySingaporeDay(rows, context) {
  return window.NUSBuildingHistory.aggregate(rows, Date.now(), context);
}

async function loadBuildingPerformanceHistory(buildingCodes = selectedBuildingCodes()) {
  await Promise.all(["electricity", "cooling", "pv"].map(metric => loadBuildingMetricHistory(buildingCodes, metric)));
}

async function loadBuildingMetricHistory(buildingCodes, metric) {
  await Promise.all([...new Set(buildingCodes)].map(async (building) => {
    const definition = buildingHistoryPointMap[building]?.[metric];
    if (!definition) return;
    const historyKey = `${building}:${metric}`;
    if (Date.now() - (state.buildingHistoryLoaded.get(historyKey) || 0) < 15 * 60_000) return;
    if (state.buildingHistoryPending.has(historyKey)) return state.buildingHistoryPending.get(historyKey);
    const points = Array.isArray(definition) ? definition : [definition];
    if (!points.length) return;
    const request = (async () => {
      const rowSets = await Promise.all(points.map(async (point) => {
        const params = new URLSearchParams({ building: apiBuildingCode(building), point, start: "-365d", stop: "now()", limit: "20000" });
        const response = await fetch(`${historyConfig.meterBaseUrl}?${params}`, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`History HTTP ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload?.points)) throw new Error("Invalid history response");
        return payload.points;
      }));
      const rows = window.NUSBuildingHistory.combineComponents(rowSets);
      const aggregated = aggregateHistoryBySingaporeDay(rows, { building, metric });
      buildingPerformanceModel[building][metric] = aggregated;
      state.buildingHistoryLoaded.set(historyKey, Date.now());
      if (aggregated?.latest) buildingPerformanceModel[building].updated = formatTimestamp(aggregated.latest);
    })().catch(() => {
      // Do not retain a stale chart after a failed refresh or substitute fabricated values.
      buildingPerformanceModel[building][metric] = null;
      state.buildingHistoryLoaded.delete(historyKey);
    }).finally(() => {
      state.buildingHistoryPending.delete(historyKey);
      renderBuildingAnalytics();
    });
    state.buildingHistoryPending.set(historyKey, request);
    renderBuildingAnalytics();
    return request;
  }));
}

function bindBuildingChartInteraction({ chart, width, plot, labels, series, xFor, yFor, period }) {
  const frame = chart.querySelector(".building-chart-frame");
  if (!frame) return;
  const tooltip = frame.querySelector(".building-chart-tooltip");
  const crosshair = frame.querySelector(".building-hover-line");
  const hoverDots = frame.querySelectorAll(".building-hover-dot");
  const hits = frame.querySelectorAll("[data-building-chart-index]");

  const hide = () => {
    tooltip.hidden = true;
    crosshair.hidden = true;
    hoverDots.forEach((dot) => { dot.hidden = true; });
  };

  const show = (index) => {
    const x = xFor(index);
    crosshair.setAttribute("x1", x);
    crosshair.setAttribute("x2", x);
    crosshair.hidden = false;
    hoverDots.forEach((dot) => {
      const item = series.find((entry) => entry.code === dot.dataset.seriesCode);
      const value = item?.values[index];
      if (!Number.isFinite(value)) {
        dot.hidden = true;
        return;
      }
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", yFor(value));
      dot.hidden = false;
    });

    const rows = series.map((item) => {
      const value = item.values[index];
      const compact = formatEnergyCompact(value);
      const exact = compact.includes("MWh") ? `<small>${Math.round(value).toLocaleString("en-SG")} kWh</small>` : "";
      const correctedCount = (item.corrections || []).filter(correction => correction.date.startsWith(labels[index])).length;
      const correctionNote = correctedCount ? `<small>${item.code}: ${correctedCount} invalid hourly reading${correctedCount === 1 ? "" : "s"} counted as 0 kWh.</small>` : "";
      return `<div><span><i style="--series:${item.model.color}"></i>${item.code}</span><strong>${compact}${exact}</strong></div>${correctionNote}`;
    }).join("");
    tooltip.innerHTML = `<header>${formatBuildingChartLabel(labels[index], period, true)}</header>${rows}`;
    tooltip.hidden = false;

    const pixelX = (x / width) * frame.clientWidth;
    const tooltipHalf = Math.min(145, frame.clientWidth / 3);
    const left = Math.max(tooltipHalf, Math.min(frame.clientWidth - tooltipHalf, pixelX));
    tooltip.style.left = `${left}px`;
    tooltip.classList.toggle("align-right", pixelX > frame.clientWidth * 0.72);
  };

  hits.forEach((hit) => {
    const index = Number(hit.dataset.buildingChartIndex);
    hit.addEventListener("pointerenter", () => show(index));
    hit.addEventListener("pointermove", () => show(index));
    hit.addEventListener("focus", () => show(index));
    hit.addEventListener("blur", hide);
  });
  frame.addEventListener("pointerleave", hide);
}

function renderBuildingLocationMap() {
  const codes = selectedBuildingCodes();
  document.getElementById("buildingMapSelection").textContent = `Selected building · ${codes.join(", ")}`;
  if (state.activeTab !== "buildings" || !state.data || !state.activeMapboxToken || typeof mapboxgl === "undefined") return;
  if (!state.buildingMap) {
    const map = new mapboxgl.Map({
      container: "buildingAnalysisMap",
      accessToken: state.activeMapboxToken,
      style: "mapbox://styles/mapbox/light-v11",
      center: [103.776, 1.2987], zoom: 15.5,
      attributionControl: true,
    });
    state.buildingMap = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.scrollZoom.disable();
    map.on("load", () => {
      map.addSource("analysis-buildings", { type: "vector", url: mapboxEuiLayer.sourceUrl });
      map.addLayer({ id: "analysis-building-fill", type: "fill", source: "analysis-buildings",
        "source-layer": mapboxEuiLayer.sourceLayer, filter: campusSourceFilter(),
        paint: { "fill-color": "#aebecb", "fill-opacity": 0.65 } });
      map.addLayer({ id: "analysis-building-outline", type: "line", source: "analysis-buildings",
        "source-layer": mapboxEuiLayer.sourceLayer, filter: campusSourceFilter(),
        paint: { "line-color": "#8298a9", "line-width": 1 } });
      renderBuildingLocationMap();
    });
    return;
  }
  const map = state.buildingMap;
  map.resize();
  if (!map.getLayer("analysis-building-fill")) return;
  const features = state.displayFeatures.filter(feature => codes.includes(String(feature.properties.short_name).toUpperCase()));
  const ids = features.map(feature => feature.properties.source_id).filter(Boolean);
  const selected = ["in", ["get", "source_id"], ["literal", ids]];
  map.setPaintProperty("analysis-building-fill", "fill-color", ["case", selected, "#ef7c00", "#aebecb"]);
  map.setPaintProperty("analysis-building-outline", "line-color", ["case", selected, "#a74e00", "#8298a9"]);
  map.setPaintProperty("analysis-building-outline", "line-width", ["case", selected, 3, 1]);
  state.buildingMapMarkers?.forEach(marker => marker.remove());
  state.buildingMapMarkers = features.filter(feature => feature.geometry.type === "Point").map(feature => {
    const label = document.createElement("span");
    label.className = "building-map-label";
    label.textContent = feature.properties.short_name;
    return new mapboxgl.Marker({ element: label, anchor: "bottom", offset: [0, -12] })
      .setLngLat(feature.geometry.coordinates).addTo(map);
  });
  const point = features.find(feature => feature.geometry.type === "Point");
  if (point) map.easeTo({ center: point.geometry.coordinates, zoom: 16.5, duration: 450 });
}

function renderBuildingAnalytics() {
  renderBuildingLocationMap();
  els.buildingWorkspaceSubtitle.textContent = `Energy analysis · ${selectedBuildingCodes().join(", ")}`;
  els.buildingCharts.forEach(card => renderBuildingMetricChart(card));
}

function renderBuildingMetricChart(card) {
  const metricKey = card.dataset.buildingChart;
  const metric = buildingMetricMeta[metricKey];
  const period = state.buildingPeriods[metricKey];
  const els = {
    buildingPerformanceChart: card.querySelector("[data-chart-plot]"),
    buildingChartTitle: card.querySelector("[data-chart-title]"),
    buildingChartSubtitle: card.querySelector("[data-chart-subtitle]"),
    buildingChartKpis: card.querySelector("[data-chart-kpis]"),
    buildingPeriodButtons: card.querySelectorAll("[data-building-period]"),
  };
  const codes = selectedBuildingCodes();
  const periodLabel = period === "yearly" ? "Yearly" : "Monthly";
  const activeData = buildingPerformanceModel[codes[0]]?.[metricKey];
  const chosenMonth = activeData?.monthlyMonth;
  const monthLabel = chosenMonth ? formatBuildingChartLabel(chosenMonth, "yearly", true) : "No reporting month";
  const spanLabel = period === "yearly" ? "Year to date" : monthLabel;
  const labelKey = `${period}Labels`;
  const selectedSeries = codes
    .map((code) => {
      const model = buildingPerformanceModel[code];
      const metricData = model?.[metricKey];
      const month = metricData?.monthProfiles?.[chosenMonth];
      return { code, model, values: period === "monthly" ? month?.values : metricData?.[period], labels: period === "monthly" ? month?.labels : metricData?.[labelKey], sourceStart: metricData?.sourceStart, latest: metricData?.latest, corrections: metricData?.corrections };
    })
    .filter((item) => Array.isArray(item.values));
  const series = selectedSeries.filter((item) => item.values.some((value) => Number.isFinite(value)));
  const unavailable = codes.filter((code) => !series.some((item) => item.code === code));
  const pointCount = Math.max(0, ...series.map((item) => item.values.length));
  const labels = series.find((item) => Array.isArray(item.labels) && item.labels.length === pointCount)?.labels || buildingDateLabels(pointCount);
  const sourceStart = selectedSeries
    .map((item) => item.sourceStart)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0];

  els.buildingPeriodButtons.forEach((button) => {
    const active = button.dataset.buildingPeriod === period;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.buildingChartTitle.textContent = metric.label;

  const totalFinite = (values) => values.filter((value) => Number.isFinite(value)).reduce((total, value) => total + value, 0);
  const totals = series.map((item) => ({ ...item, total: totalFinite(item.values) }));
  const periodTotal = totalFinite(totals.map((item) => item.total));
  const portfolioValues = Array.from({ length: pointCount }, (_, index) => {
    const values = series.map((item) => item.values[index]).filter((value) => Number.isFinite(value));
    return values.length ? totalFinite(values) : null;
  });
  const availablePortfolioValues = portfolioValues.filter((value) => Number.isFinite(value));
  const averageValue = availablePortfolioValues.length ? totalFinite(availablePortfolioValues) / availablePortfolioValues.length : null;
  const peakValue = availablePortfolioValues.length ? Math.max(...availablePortfolioValues) : null;
  const peakIndex = Number.isFinite(peakValue) ? portfolioValues.indexOf(peakValue) : -1;
  const chartValues = series.flatMap((item) => item.values).filter((value) => Number.isFinite(value));
  const chartRawMax = chartValues.length ? Math.max(...chartValues) : 0;
  const chartDivisor = metric.unit === "kWh" && chartRawMax >= 1000 ? 1000 : 1;
  const chartUnit = chartDivisor === 1000 ? "MWh" : metric.unit;
  const sourceEnd = selectedSeries.map(item => item.latest).filter(Boolean).sort().at(-1);
  const coverageNote = period === "yearly" && sourceStart ? ` · reported ${formatTimestamp(sourceStart).split(",")[0]}–${formatTimestamp(sourceEnd).split(",")[0]}`
    : period === "monthly" && activeData?.monthProfiles?.[chosenMonth] ? ` · ${activeData.monthProfiles[chosenMonth].reportedDays}/${labels.length} days reported${activeData.monthProfiles[chosenMonth].partialDays ? " · partial daily totals" : ""}` : "";

  els.buildingChartSubtitle.textContent = `${spanLabel} · ${period === "yearly" ? "monthly" : "daily"} totals · ${chartUnit}${coverageNote} · hover to inspect`;
  els.buildingChartKpis.innerHTML = `
    <div><span>Reported energy</span><strong>${series.length ? formatEnergyCompact(periodTotal) : "--"}</strong><small>${periodLabel.toLowerCase()} selected total</small></div>
    <div><span>${period === "yearly" ? "Monthly" : "Daily"} average</span><strong>${Number.isFinite(averageValue) ? formatEnergyCompact(averageValue) : "--"}</strong><small>available reporting periods</small></div>
    <div><span>Peak ${period === "yearly" ? "month" : "day"}</span><strong>${Number.isFinite(peakValue) ? formatEnergyCompact(peakValue) : "--"}</strong><small>${peakIndex >= 0 ? formatBuildingChartLabel(labels[peakIndex], period, true) : "No reported data"}</small></div>
    <div><span>Series available</span><strong>${series.length} / ${codes.length}</strong><small>${unavailable.length ? `${unavailable.join(", ")} unavailable` : "all selected streams"}</small></div>
  `;

  els.buildingChartKpis.hidden = !series.length;
  if (!series.length && codes.some(code => state.buildingHistoryPending.has(`${code}:${metricKey}`))) {
    els.buildingPerformanceChart.innerHTML = '<div class="building-chart-empty" role="status"><strong>Loading reported data…</strong></div>';
  } else if (!series.length) {
    els.buildingPerformanceChart.innerHTML = '<div class="building-chart-empty"><strong>No reported data</strong><p>The selected buildings do not expose usable values for this metric and period.</p></div>';
  } else {
    const width = Math.max(560, Math.round(els.buildingPerformanceChart.clientWidth) - 28);
    const height = 350;
    const plot = { left: 82, right: 26, top: 24, bottom: 62 };
    const plotWidth = width - plot.left - plot.right;
    const plotHeight = height - plot.top - plot.bottom;
    const scaledMax = chartRawMax / chartDivisor;
    const step = niceChartStep(scaledMax / 4);
    const axisMax = Math.max(step * 4, Math.ceil(scaledMax / step) * step);
    const xFor = (index) => period === "yearly"
      ? plot.left + ((index + 0.5) / Math.max(pointCount, 1)) * plotWidth
      : plot.left + (index / Math.max(pointCount - 1, 1)) * plotWidth;
    const yFor = (value) => plot.top + (1 - (value / chartDivisor) / axisMax) * plotHeight;
    const grid = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      const y = plot.top + ratio * plotHeight;
      const value = axisMax * (1 - ratio);
      const label = value.toLocaleString("en-SG", { maximumFractionDigits: chartUnit === "MWh" ? 1 : 0 });
      return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text x="${plot.left - 14}" y="${y + 4}" text-anchor="end">${label}</text>`;
    }).join("");
    const allTickIndexes = Array.from({ length: pointCount }, (_, index) => index);
    const tickStep = period === "monthly" ? Math.max(1, Math.ceil(Math.max(pointCount - 1, 1) / 5)) : 1;
    const tickIndexes = period === "monthly"
      ? [...new Set([...allTickIndexes.filter((index) => index % tickStep === 0), pointCount - 1])]
      : allTickIndexes;
    const ticks = tickIndexes.filter((index) => index < pointCount).map((index) => {
      const date = new Date(`${labels[index]}T00:00:00+08:00`);
      const weekday = period === "weekly" ? new Intl.DateTimeFormat("en-SG", { weekday: "short" }).format(date) : "";
      return `<text x="${xFor(index)}" y="${height - 30}" text-anchor="middle"><tspan x="${xFor(index)}">${period === "weekly" ? weekday : formatBuildingChartLabel(labels[index], period)}</tspan>${period === "weekly" ? `<tspan x="${xFor(index)}" dy="14">${formatBuildingChartDate(labels[index])}</tspan>` : ""}</text>`;
    }).join("");
    const lines = period === "yearly" ? "" : series.map(({ model, values }) => {
      const segments = [];
      let active = [];
      values.forEach((value, index) => {
        if (Number.isFinite(value)) active.push(`${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`);
        else if (active.length) { segments.push(active); active = []; }
      });
      if (active.length) segments.push(active);
      const paths = segments.map((points) => `<polyline points="${points.join(" ")}"></polyline>`).join("");
      const circles = values.map((value, index) => Number.isFinite(value) ? `<circle cx="${xFor(index).toFixed(1)}" cy="${yFor(value).toFixed(1)}" r="2.5"></circle>` : "").join("");
      return `<g class="generated-series" style="--series:${model.color}">${paths}${circles}</g>`;
    }).join("");
    const bars = period !== "yearly" ? "" : series.map(({ code, model, values }, seriesIndex) => {
      const groupWidth = Math.min(92, (plotWidth / Math.max(pointCount, 1)) * 0.72);
      const barWidth = Math.max(4, groupWidth / Math.max(series.length, 1));
      return values.map((value, index) => {
        if (!Number.isFinite(value)) return "";
        const x = xFor(index) - groupWidth / 2 + seriesIndex * barWidth + 1;
        const y = yFor(value);
        return `<rect class="generated-bar" data-series-code="${code}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(2, barWidth - 2).toFixed(1)}" height="${Math.max(1, height - plot.bottom - y).toFixed(1)}" rx="1"></rect>`;
      }).join("");
    }).map((rects, index) => `<g class="generated-series generated-bars" style="--series:${series[index].model.color}">${rects}</g>`).join("");
    const hoverDots = series.map(({ code, model }) => `<circle class="building-hover-dot" data-series-code="${code}" style="--series:${model.color}" r="5" hidden></circle>`).join("");
    const hits = Array.from({ length: pointCount }, (_, index) => {
      const start = index === 0 ? plot.left : (xFor(index - 1) + xFor(index)) / 2;
      const end = index === pointCount - 1 ? width - plot.right : (xFor(index) + xFor(index + 1)) / 2;
      return `<rect class="building-chart-hit" data-building-chart-index="${index}" x="${start}" y="${plot.top}" width="${end - start}" height="${plotHeight}" tabindex="0" aria-label="Inspect ${formatBuildingChartLabel(labels[index], period, true)}"></rect>`;
    }).join("");
    els.buildingPerformanceChart.innerHTML = `
      <div class="building-chart-frame" style="aspect-ratio:${width}/${height}">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${periodLabel} ${metric.label} comparison">
          <text class="generated-unit" x="${plot.left}" y="13">${chartUnit} per ${period === "yearly" ? "month" : "day"}</text>
          <g class="generated-grid">${grid}</g>
          <g class="generated-axis">${ticks}</g>
          ${lines}
          ${bars}
          <line class="building-hover-line" y1="${plot.top}" y2="${height - plot.bottom}" hidden></line>
          ${hoverDots}
          <g class="building-chart-hits">${hits}</g>
        </svg>
        <div class="building-chart-tooltip" role="status" hidden></div>
      </div>
    `;
    bindBuildingChartInteraction({ chart: els.buildingPerformanceChart, width, plot, labels, series, xFor, yFor, period });
  }

}

function setMarketView(view) {
  state.activeMarketView = view;
  els.marketViewButtons.forEach((button) => {
    const active = button.dataset.marketView === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.marketViewPanels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.marketViewPanel !== view));
}

function renderBuildingList() {
  const selectedCode = [...state.selectedComparisonBuildings][0];
  const features = visibleFeatures().slice().sort((a, b) =>
    String(a.properties.short_name).localeCompare(String(b.properties.short_name)));
  const focusedCode = els.buildingSelect.contains(document.activeElement) ? document.activeElement.value : null;
  els.buildingSelect.replaceChildren();
  const seen = new Set();
  const groups = new Map();
  const areaNames = { "design-engineering": "Engineering Area", computing: "Computing Area", science: "Science Area", medicine: "Medicine Area" };
  const areaFor = (props) => {
    const code = String(props.short_name || "").toUpperCase();
    const region = focusRegions.find(region => region.codes.some(item => item.toUpperCase() === code));
    return region ? areaNames[region.id] : (props.zone || "Other Buildings");
  };
  const areaOrder = Object.values(areaNames);
  const areaRank = (area) => areaOrder.includes(area) ? areaOrder.indexOf(area) : areaOrder.length;
  features.sort((a, b) => areaRank(areaFor(a.properties)) - areaRank(areaFor(b.properties))
    || areaFor(a.properties).localeCompare(areaFor(b.properties))
    || String(a.properties.short_name).localeCompare(String(b.properties.short_name), undefined, { numeric: true }));
  features.forEach(({ properties: props }) => {
    const code = String(props.short_name || "").toUpperCase();
    if (!code || seen.has(code)) return;
    seen.add(code);
    const label = document.createElement("label");
    label.className = "building-radio-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "selected-building";
    input.value = code;
    input.checked = code === selectedCode;
    const text = document.createElement("span");
    text.textContent = String(props.name).toUpperCase() === code ? code : `${code} — ${props.name}`;
    label.append(input, text);
    const area = areaFor(props);
    if (!groups.has(area)) {
      const group = document.createElement("fieldset");
      group.className = "building-area-group";
      const heading = document.createElement("legend");
      heading.textContent = area;
      group.appendChild(heading);
      groups.set(area, group);
      els.buildingSelect.appendChild(group);
    }
    groups.get(area).appendChild(label);
  });
  if (focusedCode) {
    [...els.buildingSelect.querySelectorAll("input")].find(input => input.value === focusedCode)?.focus({ preventScroll: true });
  }
}

function realtimePlaceLabel(buildingCode) {
  const focus = focusBuildings.find((item) => item.code === buildingCode);
  if (!focus || focus.name === buildingCode) return buildingCode;
  return `${buildingCode} - ${focus.name}`;
}

function historyDefinitionsForPlace(buildingCode = state.activeRealtimeBuilding) {
  const capabilities = buildingMetricCapabilities[buildingCode] || [];
  return historyConfig.metrics.map((template) => {
    const point = typeof template.point === "function" ? template.point(buildingCode) : template.point;
    const points = typeof template.points === "function" ? template.points(buildingCode) : template.points;
    const componentPoints = typeof template.componentPoints === "function" ? template.componentPoints(buildingCode) : template.componentPoints;
    return {
      ...template,
      building: buildingCode,
      point,
      points,
      componentPoints,
    };
  }).filter((definition) => capabilities.includes(definition.key));
}

function historyPointByKey(key, buildingCode = state.activeRealtimeBuilding) {
  const definitions = historyDefinitionsForPlace(buildingCode);
  return definitions.find((item) => item.key === key) || definitions[0];
}

function historyPointByName(pointName, buildingCode = state.activeRealtimeBuilding) {
  return historyDefinitionsForPlace(buildingCode).find((item) => {
    const pointNames = [...(item.points || [item.point]), ...(item.componentPoints || [])];
    return pointNames.includes(pointName);
  });
}

function historyCacheKey(definition) {
  const pointKey = (definition.points || [definition.point]).join(",");
  return `${definition.source}|${definition.building}|${definition.key}|${pointKey}|${definition.range}`;
}

function historyUrl(definition, pointName) {
  const params = new URLSearchParams({
    point: pointName,
    start: definition.range,
    stop: "now()",
    limit: "50000",
  });
  if (definition.source === "meter") params.set("building", apiBuildingCode(definition.building));
  const baseUrl = definition.source === "meter" ? historyConfig.meterBaseUrl : historyConfig.beehubBaseUrl;
  return `${baseUrl}?${params.toString()}`;
}

function normalizeHistoryPayload(payload) {
  const rows = Array.isArray(payload?.points) ? payload.points : [];
  return rows
    .map((row) => ({
      time: row.t || row.time || row.timestamp,
      value: Number(row.v ?? row.value),
    }))
    .filter((row) => row.time && Number.isFinite(row.value))
    .sort((a, b) => new Date(a.time) - new Date(b.time));
}

async function loadHistoryPoint(definition, pointName) {
  const response = await fetch(historyUrl(definition, pointName), { cache: "no-store" });
  if (!response.ok) throw new Error(`${pointName}: HTTP ${response.status}`);
  const payload = await response.json();
  return normalizeHistoryPayload(payload);
}

function combineHistoryRows(rowSets, method = "sum") {
  const groups = new Map();
  rowSets.flat().forEach((row) => {
    if (!groups.has(row.time)) groups.set(row.time, []);
    groups.get(row.time).push(row.value);
  });
  return Array.from(groups.entries())
    .map(([time, values]) => ({
      time,
      value: method === "average" ? average(values) : sum(values),
    }))
    .filter((row) => row.time && Number.isFinite(row.value))
    .sort((a, b) => new Date(a.time) - new Date(b.time));
}

function normalizeHistorySign(rows, definition) {
  if (!definition.absolute) return rows;
  return rows.map((row) => ({
    ...row,
    value: Math.abs(row.value),
  }));
}

async function loadHistory(definition) {
  const key = historyCacheKey(definition);
  if (state.historyCache.has(key)) return state.historyCache.get(key);
  const pointNames = definition.points || [definition.point];
  const results = await Promise.allSettled(pointNames.map((pointName) => loadHistoryPoint(definition, pointName)));
  const rowSets = results
    .filter((result) => result.status === "fulfilled" && result.value.length)
    .map((result) => result.value);
  if (!rowSets.length) {
    const failed = results.find((result) => result.status === "rejected");
    throw new Error(failed?.reason?.message || `${definition.label}: no history data`);
  }
  const combinedRows = rowSets.length === 1 ? rowSets[0] : combineHistoryRows(rowSets, definition.combine || "sum");
  const rows = normalizeHistorySign(combinedRows, definition);
  state.historyCache.set(key, rows);
  return rows;
}

function singaporeBucket(date, bucket) {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const hour = bucket === "day" ? 0 : shifted.getUTCHours();
  const key = bucket === "day"
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:00`;
  return {
    key,
    timestamp: Date.UTC(year, month, day, hour) - 8 * 60 * 60 * 1000,
  };
}

function aggregateHistory(rows, bucket = "hour") {
  const groups = new Map();
  rows.forEach((row) => {
    const date = new Date(row.time);
    if (Number.isNaN(date.getTime())) return;
    const bucketInfo = singaporeBucket(date, bucket);
    if (!groups.has(bucketInfo.key)) {
      groups.set(bucketInfo.key, { label: bucketInfo.key, timestamp: bucketInfo.timestamp, values: [] });
    }
    groups.get(bucketInfo.key).values.push(row.value);
  });
  return Array.from(groups.values())
    .map((group) => ({
      label: group.label,
      timestamp: group.timestamp,
      value: average(group.values),
      count: group.values.length,
    }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function historyDigits(definition) {
  if (definition.unit === "ppm" || definition.unit === "L/s") return 0;
  if (definition.key === "pv") return 1;
  return 1;
}

function formatHistoryValue(value, definition) {
  return formatMetric(value, definition.unit, historyDigits(definition));
}

function historyTooltipTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(date);
}

function chartTooltipLabel(row, definition) {
  return `${historyTooltipTime(row.timestamp)} - ${formatHistoryValue(row.value, definition)}`;
}

function historyDisplayTime(timestamp, definition) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  const options = definition.range === "-24h"
    ? { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" }
    : { month: "short", day: "numeric", hour: "2-digit", timeZone: "Asia/Singapore" };
  return new Intl.DateTimeFormat("en-SG", options).format(date);
}

function summarizeHistory(rawRows, aggregatedRows) {
  const values = rawRows.map((row) => row.value).filter(Number.isFinite);
  const latest = rawRows.at(-1);
  const peak = aggregatedRows.reduce((best, row) => (!best || row.value > best.value ? row : best), null);
  const low = aggregatedRows.reduce((best, row) => (!best || row.value < best.value ? row : best), null);
  return {
    latest: latest?.value ?? null,
    average: average(values),
    peak,
    low,
    rawCount: rawRows.length,
    bucketCount: aggregatedRows.length,
  };
}

function chartDomain(values) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const padding = (max - min) * 0.08;
  return { min: min - padding, max: max + padding };
}

function chartY(value, domain, top, height) {
  return top + ((domain.max - value) / (domain.max - domain.min)) * height;
}

function chartX(index, count, left, width) {
  if (count <= 1) return left;
  return left + (index / (count - 1)) * width;
}

function renderLineChart(rows, definition) {
  const width = 760;
  const height = 310;
  const left = 58;
  const right = 18;
  const top = 24;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = rows.map((row) => row.value);
  const domain = chartDomain(values);
  const points = rows.map((row, index) => {
    const x = chartX(index, rows.length, left, plotWidth);
    const y = chartY(row.value, domain, top, plotHeight);
    return { x, y, row };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const baseline = top + plotHeight;
  const area = points.length
    ? `M${points[0].x.toFixed(1)},${baseline} ${points.map((point) => `L${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ")} L${points.at(-1).x.toFixed(1)},${baseline} Z`
    : "";
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = top + plotHeight * ratio;
    const value = domain.max - (domain.max - domain.min) * ratio;
    return `<line class="grid-line" x1="${left}" y1="${y}" x2="${left + plotWidth}" y2="${y}"></line><text class="chart-label" x="8" y="${y + 4}">${formatNumber(value, historyDigits(definition))}</text>`;
  }).join("");
  const labelIndexes = [0, Math.floor(rows.length / 2), rows.length - 1].filter((index, pos, arr) => index >= 0 && arr.indexOf(index) === pos);
  const xLabels = labelIndexes.map((index) => {
    const x = chartX(index, rows.length, left, plotWidth);
    return `<text class="chart-label" x="${x}" y="${height - 12}" text-anchor="middle">${historyDisplayTime(rows[index].timestamp, definition)}</text>`;
  }).join("");
  const hitWidth = Math.max(12, plotWidth / Math.max(rows.length, 1));
  const hoverTargets = points.map((point) => {
    const tooltip = chartTooltipLabel(point.row, definition);
    const x = Math.max(left, point.x - hitWidth / 2);
    const width = Math.min(hitWidth, left + plotWidth - x);
    return `
      <g class="chart-hit" tabindex="0" data-tooltip="${escapeHtml(tooltip)}">
        <title>${escapeHtml(tooltip)}</title>
        <rect class="chart-hover-zone" x="${x.toFixed(1)}" y="${top}" width="${width.toFixed(1)}" height="${plotHeight}"></rect>
        <circle class="chart-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" stroke="${definition.color}"></circle>
      </g>
    `;
  }).join("");
  return `
    <div class="trend-chart-frame">
      <div class="chart-tooltip hidden"></div>
      <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(definition.label)} trend chart">
        ${grid}
        <line class="axis" x1="${left}" y1="${baseline}" x2="${left + plotWidth}" y2="${baseline}"></line>
        <path class="chart-area" d="${area}" fill="${definition.color}"></path>
        <path class="chart-line" d="${path}" stroke="${definition.color}"></path>
        ${hoverTargets}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderBarChart(rows, definition) {
  const width = 760;
  const height = 310;
  const left = 50;
  const right = 18;
  const top = 24;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = rows.map((row) => row.value);
  const domain = { min: 0, max: Math.max(...values, 1) * 1.08 };
  const gap = 3;
  const slotWidth = plotWidth / Math.max(rows.length, 1);
  const barWidth = Math.max(3, slotWidth - gap);
  const baseline = top + plotHeight;
  const bars = rows.map((row, index) => {
    const x = left + index * slotWidth + gap / 2;
    const y = chartY(row.value, domain, top, plotHeight);
    return `<rect class="chart-bar" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${(baseline - y).toFixed(1)}" fill="${definition.color}"></rect>`;
  }).join("");
  const hoverTargets = rows.map((row, index) => {
    const x = left + index * slotWidth + gap / 2;
    const y = chartY(row.value, domain, top, plotHeight);
    const tooltip = chartTooltipLabel(row, definition);
    return `
      <g class="chart-hit" tabindex="0" data-tooltip="${escapeHtml(tooltip)}">
        <title>${escapeHtml(tooltip)}</title>
        <rect class="chart-hover-bar" x="${x.toFixed(1)}" y="${top}" width="${barWidth.toFixed(1)}" height="${plotHeight}"></rect>
        <circle class="chart-point" cx="${(x + barWidth / 2).toFixed(1)}" cy="${y.toFixed(1)}" r="4" stroke="${definition.color}"></circle>
      </g>
    `;
  }).join("");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = top + plotHeight * ratio;
    const value = domain.max - (domain.max - domain.min) * ratio;
    return `<line class="grid-line" x1="${left}" y1="${y}" x2="${left + plotWidth}" y2="${y}"></line><text class="chart-label" x="8" y="${y + 4}">${formatNumber(value, historyDigits(definition))}</text>`;
  }).join("");
  const labelIndexes = [0, Math.floor(rows.length / 2), rows.length - 1].filter((index, pos, arr) => index >= 0 && arr.indexOf(index) === pos);
  const xLabels = labelIndexes.map((index) => {
    const x = left + index * slotWidth + slotWidth / 2;
    return `<text class="chart-label" x="${x}" y="${height - 12}" text-anchor="middle">${historyDisplayTime(rows[index].timestamp, definition)}</text>`;
  }).join("");
  return `
    <div class="trend-chart-frame">
      <div class="chart-tooltip hidden"></div>
      <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(definition.label)} bar chart">
        ${grid}
        <line class="axis" x1="${left}" y1="${baseline}" x2="${left + plotWidth}" y2="${baseline}"></line>
        ${bars}
        ${hoverTargets}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderTrendPlaceSelector() {
  if (!els.trendPlaceSelect) return;
  const places = realtimeConfig.liveBuildings.map((entry) => (typeof entry === "string" ? entry : entry.code));
  if (!places.includes(state.activeRealtimeBuilding)) state.activeRealtimeBuilding = places[0] || "SDE4";
  els.trendPlaceSelect.innerHTML = places
    .map((building) => `<option value="${escapeHtml(building)}">${escapeHtml(realtimePlaceLabel(building))}</option>`)
    .join("");
  els.trendPlaceSelect.value = state.activeRealtimeBuilding;
  const live = state.realtimeByBuilding[state.activeRealtimeBuilding];
  if (els.trendPlaceMeta) {
    els.trendPlaceMeta.textContent = live
      ? `${live.points.length} realtime points · updated ${formatTimestamp(live.updateTime)}`
      : "Realtime endpoint not loaded for this place";
  }
}

function renderTrendTabs(activeKey) {
  if (!els.trendTabs) return;
  els.trendTabs.innerHTML = historyDefinitionsForPlace(state.activeRealtimeBuilding)
    .map((definition) => `
      <button type="button" class="${definition.key === activeKey ? "active" : ""}" data-history-key="${definition.key}">
        <strong>${escapeHtml(definition.label)}</strong>
        <span>${escapeHtml(definition.range === "-24h" ? "Last 24 hours" : "Last 7 days")}</span>
      </button>
    `)
    .join("");
}

function renderTrendKpis(summary, definition) {
  els.trendKpis.innerHTML = `
    <div class="trend-kpi">
      <span>Latest</span>
      <strong>${formatHistoryValue(summary.latest, definition)}</strong>
      <small>most recent sample</small>
    </div>
    <div class="trend-kpi">
      <span>Mean</span>
      <strong>${formatHistoryValue(summary.average, definition)}</strong>
      <small>${summary.rawCount.toLocaleString()} raw samples</small>
    </div>
    <div class="trend-kpi">
      <span>Peak</span>
      <strong>${formatHistoryValue(summary.peak?.value, definition)}</strong>
      <small>${summary.peak ? historyDisplayTime(summary.peak.timestamp, definition) : "-"}</small>
    </div>
    <div class="trend-kpi">
      <span>Low</span>
      <strong>${formatHistoryValue(summary.low?.value, definition)}</strong>
      <small>${summary.low ? historyDisplayTime(summary.low.timestamp, definition) : "-"}</small>
    </div>
  `;
}

function renderTrendLiveMeters() {
  if (!els.trendLiveMeters) return;
  const live = state.realtimeByBuilding[state.activeRealtimeBuilding];
  if (!live) {
    els.trendLiveMeters.innerHTML = `
      <div class="trend-live-card">
        <span>Live meter snapshot</span>
        <strong>Waiting</strong>
        <small>${escapeHtml(state.activeRealtimeBuilding)} realtime endpoint has not returned data yet.</small>
      </div>
    `;
    return;
  }

  els.trendLiveMeters.innerHTML = liveMeterSummaryCards(live)
    .map((card) => `
      <div class="trend-live-card">
        <span>${escapeHtml(card.label)}</span>
        <strong>${card.value}</strong>
        <small>${escapeHtml(card.note)}</small>
      </div>
    `)
    .join("");
}

function bindChartTooltip() {
  const frame = els.trendChart.querySelector(".trend-chart-frame");
  const tooltip = els.trendChart.querySelector(".chart-tooltip");
  if (!frame || !tooltip) return;

  const hideTooltip = () => {
    tooltip.classList.add("hidden");
  };

  const showTooltip = (event, target) => {
    const text = target.dataset.tooltip;
    if (!text) return;
    const frameRect = frame.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const clientX = event.clientX || targetRect.left + targetRect.width / 2;
    const clientY = event.clientY || targetRect.top + targetRect.height / 2;
    tooltip.textContent = text;
    tooltip.classList.remove("hidden");

    const maxLeft = Math.max(10, frameRect.width - tooltip.offsetWidth - 10);
    const maxTop = Math.max(10, frameRect.height - tooltip.offsetHeight - 10);
    const left = Math.min(Math.max(10, clientX - frameRect.left + 14), maxLeft);
    const top = Math.min(Math.max(10, clientY - frameRect.top - tooltip.offsetHeight - 12), maxTop);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  els.trendChart.querySelectorAll(".chart-hit").forEach((target) => {
    target.addEventListener("pointerenter", (event) => showTooltip(event, target));
    target.addEventListener("pointermove", (event) => showTooltip(event, target));
    target.addEventListener("pointerleave", hideTooltip);
    target.addEventListener("focus", (event) => showTooltip(event, target));
    target.addEventListener("blur", hideTooltip);
  });
}

function trendNarrative(summary, definition) {
  const bucketText = definition.bucket === "hour" ? "hourly means" : "daily means";
  return `${definition.metric}: ${summary.rawCount.toLocaleString()} raw samples are aggregated into ${summary.bucketCount.toLocaleString()} ${bucketText}. Latest value is ${formatHistoryValue(summary.latest, definition)}; peak aggregated value is ${formatHistoryValue(summary.peak?.value, definition)}.`;
}

async function renderTrendChart(key = state.activeHistoryKey) {
  const definition = historyPointByKey(key);
  state.activeHistoryKey = definition.key;
  renderTrendPlaceSelector();
  renderTrendLiveMeters();
  renderTrendTabs(definition.key);
  if (els.trendModalEyebrow) els.trendModalEyebrow.textContent = "Realtime Analytics";
  els.trendModalTitle.textContent = `${definition.label} trend`;
  els.trendModalSubtitle.textContent = `${realtimePlaceLabel(definition.building)} · ${definition.metric} · ${definition.range === "-24h" ? "last 24 hours" : "last 7 days"} · ${definition.bucket} aggregation`;
  els.trendStatus.textContent = "Loading history data...";
  els.trendKpis.innerHTML = "";
  els.trendChart.innerHTML = "";
  els.trendNarrative.textContent = "";
  try {
    const rawRows = await loadHistory(definition);
    const aggregatedRows = aggregateHistory(rawRows, definition.bucket);
    const summary = summarizeHistory(rawRows, aggregatedRows);
    renderTrendKpis(summary, definition);
    els.trendChart.innerHTML = definition.chart === "bar"
      ? renderBarChart(aggregatedRows, definition)
      : renderLineChart(aggregatedRows, definition);
    bindChartTooltip();
    els.trendStatus.textContent = `${aggregatedRows.length.toLocaleString()} aggregated points loaded from ${rawRows.length.toLocaleString()} raw samples.`;
    els.trendNarrative.textContent = trendNarrative(summary, definition);
  } catch (error) {
    els.trendStatus.textContent = `History data unavailable: ${error.message}`;
    els.trendChart.innerHTML = '<p class="empty-note">This point does not currently expose history from the public endpoint.</p>';
  }
}

function openTrendModal(key = state.activeHistoryKey || "electricity") {
  if (!els.trendModal) return;
  closeBrickModal();
  els.trendModal.classList.remove("hidden");
  els.mapRealtimeView?.classList.add("active");
  els.mapRealtimeView?.setAttribute("aria-pressed", "true");
  renderTrendChart(key);
}

function closeTrendModal() {
  els.trendModal?.classList.add("hidden");
  els.mapRealtimeView?.classList.remove("active");
  els.mapRealtimeView?.setAttribute("aria-pressed", "false");
}

function liveMeterSummaryCards(live) {
  const pvComponentCount = live.pvComponentPoints?.length || 0;
  return [
    {
      label: "Electricity demand",
      value: formatMetric(live.electricityHourlyKwh, "kWh/h", 1),
      note: live.electricityHourlyKwh === null ? "not exposed by public endpoint" : "live hourly meter",
    },
    {
      label: "Cooling",
      value: formatMetric(live.coolingHourlyKwh, "kWh/h", 1),
      note: "live cooling stream",
    },
    {
      label: "PV generation",
      value: formatLivePvMetric(live.pvKw),
      note: live.pvKw === null
        ? "not mapped for this building"
        : pvComponentCount
          ? `${pvComponentCount} standardized PV streams combined`
          : "live hourly generation meter",
    },
  ];
}

function liveMetricValue(live, definition) {
  if (!live) return null;
  if (definition.key === "electricity") return live.electricityHourlyKwh;
  if (definition.key === "cooling") return live.coolingHourlyKwh;
  if (definition.key === "pv") return live.pvKw;
  if (definition.key === "co2") return live.indoorCo2Ppm;
  if (definition.key === "temperature") return live.indoorTemperatureC;
  if (definition.key === "humidity") return live.indoorHumidityPct;
  if (definition.key === "airflow") return live.airflow;
  const pointNames = definition.points || [definition.point];
  const latest = live.points.find((point) => pointNames.includes(point.point));
  return latest ? Number(latest.value) : null;
}

function brickGraphForPlace(buildingCode = state.activeBrickBuilding) {
  return brickGraphConfig.graphs[buildingCode] || brickGraphConfig.graphs.SDE4;
}

function brickAllNodes(graph = brickGraphForPlace()) {
  return graph.lanes.flatMap((lane) => lane.nodes);
}

function brickNodeById(nodeId, graph = brickGraphForPlace()) {
  return brickAllNodes(graph).find((node) => node.id === nodeId) || brickAllNodes(graph)[0];
}

function brickNodeTitle(nodeId, graph = brickGraphForPlace()) {
  return brickNodeById(nodeId, graph)?.title || nodeId;
}

function brickNodeMatches(node, live) {
  if (!node?.pointNames?.length || !live?.points?.length) return [];
  const pointSet = new Set(node.pointNames);
  return live.points.filter((point) => pointSet.has(point.point));
}

function brickNodeLiveValue(node, live) {
  if (!node || !live) return "";
  if (node.metricKey) {
    const definition = historyPointByKey(node.metricKey, state.activeBrickBuilding);
    const value = liveMetricValue(live, definition);
    return formatHistoryValue(value, definition);
  }
  const matches = brickNodeMatches(node, live);
  if (matches.length === 1) return formatNumber(matches[0].value, 1);
  if (matches.length > 1) return `${matches.length} live points`;
  return "";
}

function brickStatusClass(status = "") {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function brickNodeTypeClass(node) {
  const kind = String(node?.kind || "").toLowerCase();
  if (kind.includes("building") || kind.includes("location")) return "place";
  if (kind.includes("system")) return "system";
  if (kind.includes("point")) return "point";
  return "equipment";
}

function brickNodeRadius(node) {
  const type = brickNodeTypeClass(node);
  if (type === "place") return node.id === "sde4" ? 38 : 34;
  if (type === "system") return 34;
  if (type === "equipment") return 32;
  return 30;
}

function truncateSvgText(value, max = 24) {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

function svgTextLines(value, maxLineLength = 16, maxLines = 2) {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLineLength) {
      current = candidate;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  if (!lines.length) lines.push(String(value || ""));
  const trimmed = lines.slice(0, maxLines);
  if (lines.length > maxLines) trimmed[trimmed.length - 1] = truncateSvgText(trimmed[trimmed.length - 1], maxLineLength);
  return trimmed;
}

function brickNodeLayout(graph) {
  const laneX = {
    place: 120,
    systems: 390,
    equipment: 730,
    points: 1080,
  };
  const viewBox = { width: 1240, height: 700 };
  const layout = new Map();
  graph.lanes.forEach((lane) => {
    const nodes = lane.nodes;
    const top = nodes.length > 5 ? 72 : 128;
    const bottom = nodes.length > 5 ? 615 : 575;
    const step = nodes.length > 1 ? (bottom - top) / (nodes.length - 1) : 0;
    nodes.forEach((node, index) => {
      layout.set(node.id, {
        node,
        lane: lane.key,
        x: laneX[lane.key],
        y: nodes.length > 1 ? top + step * index : viewBox.height / 2,
        radius: brickNodeRadius(node),
      });
    });
  });
  return { layout, viewBox };
}

function renderBrickNetworkNode(item, live) {
  const { node, x, y, radius } = item;
  const typeClass = brickNodeTypeClass(node);
  const statusClass = brickStatusClass(node.status);
  const matches = brickNodeMatches(node, live);
  const liveValue = brickNodeLiveValue(node, live);
  const titleLines = svgTextLines(node.title, typeClass === "point" ? 14 : 16, 2);
  const subtitle = liveValue || node.kind;
  const isActive = node.id === state.activeBrickNodeId;
  const titleStart = y - (titleLines.length > 1 ? 11 : 4);
  const subtitleY = y + (titleLines.length > 1 ? 24 : 18);
  const titleMarkup = titleLines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : 15}">${escapeHtml(line)}</tspan>`)
    .join("");
  const countText = node.pointNames?.length ? `${matches.length}/${node.pointNames.length} live` : "";
  return `
    <g class="brick-network-node ${typeClass} ${statusClass} ${isActive ? "active" : ""}" data-brick-node="${escapeHtml(node.id)}" tabindex="0" role="button" aria-label="${escapeHtml(node.title)}">
      <title>${escapeHtml(`${node.title} · ${node.brickClass}`)}</title>
      <circle class="brick-node-halo" cx="${x}" cy="${y}" r="${radius + 9}"></circle>
      <circle class="brick-node-core" cx="${x}" cy="${y}" r="${radius}"></circle>
      <text class="brick-node-title" x="${x}" y="${titleStart}" text-anchor="middle">${titleMarkup}</text>
      <text class="brick-node-subtitle" x="${x}" y="${subtitleY}" text-anchor="middle">${escapeHtml(truncateSvgText(subtitle, 18))}</text>
      ${countText ? `<text class="brick-node-count" x="${x}" y="${y + radius + 18}" text-anchor="middle">${escapeHtml(countText)}</text>` : ""}
    </g>
  `;
}

function renderBrickNetworkEdges(graph, layout) {
  return graph.relations
    .map((relation) => {
      const from = layout.get(relation.from);
      const to = layout.get(relation.to);
      if (!from || !to) return "";
      const active = relation.from === state.activeBrickNodeId || relation.to === state.activeBrickNodeId;
      const startX = from.x + from.radius;
      const endX = to.x - to.radius;
      const controlOffset = Math.max(70, Math.abs(endX - startX) * 0.45);
      const path = `M ${startX} ${from.y} C ${startX + controlOffset} ${from.y}, ${endX - controlOffset} ${to.y}, ${endX} ${to.y}`;
      const midX = (startX + endX) / 2;
      const midY = (from.y + to.y) / 2;
      return `
        <g class="brick-network-edge ${active ? "active" : ""}">
          <title>${escapeHtml(`${brickNodeTitle(relation.from, graph)} ${relation.predicate} ${brickNodeTitle(relation.to, graph)}`)}</title>
          <path d="${path}"></path>
          ${active ? `<text x="${midX}" y="${midY - 6}" text-anchor="middle">${escapeHtml(relation.predicate)}</text>` : ""}
        </g>
      `;
    })
    .join("");
}

function renderBrickNetwork(graph, live) {
  const { layout, viewBox } = brickNodeLayout(graph);
  const laneLabels = graph.lanes
    .map((lane) => {
      const first = layout.get(lane.nodes[0]?.id);
      if (!first) return "";
      return `<text class="brick-network-lane-label" x="${first.x}" y="28" text-anchor="middle">${escapeHtml(lane.label)}</text>`;
    })
    .join("");
  const edges = renderBrickNetworkEdges(graph, layout);
  const nodes = Array.from(layout.values()).map((item) => renderBrickNetworkNode(item, live)).join("");
  return `
    <svg class="brick-network-svg" viewBox="0 0 ${viewBox.width} ${viewBox.height}" role="img" aria-label="${escapeHtml(graph.label)} Brick node graph">
      <defs>
        <marker id="brickArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z"></path>
        </marker>
      </defs>
      <rect class="brick-network-bg" x="0" y="0" width="${viewBox.width}" height="${viewBox.height}" rx="10"></rect>
      ${laneLabels}
      <g class="brick-network-edges">${edges}</g>
      <g class="brick-network-nodes">${nodes}</g>
    </svg>
  `;
}

function renderBrickPlaceSelector(graph) {
  if (!els.brickPlaceSelect) return;
  els.brickPlaceSelect.innerHTML = brickGraphConfig.places
    .map((building) => `<option value="${escapeHtml(building)}">${escapeHtml(realtimePlaceLabel(building))}</option>`)
    .join("");
  els.brickPlaceSelect.value = state.activeBrickBuilding;
  const live = state.realtimeByBuilding[state.activeBrickBuilding];
  els.brickPlaceMeta.textContent = live
    ? `${live.points.length} public realtime points attached · updated ${formatTimestamp(live.updateTime)}`
    : "Seed graph loaded · waiting for public realtime endpoint";
  els.brickModalEyebrow.textContent = "Brick Model";
  els.brickModalTitle.textContent = `${graph.label} operational graph`;
  els.brickModalSubtitle.textContent = graph.sourceSummary;
}

function renderBrickSummary(graph, live) {
  const systemCount = graph.lanes.find((lane) => lane.key === "systems")?.nodes.length || 0;
  const equipmentCount = graph.lanes.find((lane) => lane.key === "equipment")?.nodes.length || 0;
  const pointNames = new Set(brickAllNodes(graph).flatMap((node) => node.pointNames || []));
  const attachedCount = live?.points.filter((point) => pointNames.has(point.point)).length || 0;
  els.brickSummary.innerHTML = [
    ["Systems", systemCount, "airside, chilled water, PV, indoor, water placeholder"],
    ["Equipment candidates", equipmentCount, "PAHU, VAV, FCU/PFCU, FAF, BTU, PV meters"],
    ["Live points attached", attachedCount, `${live?.points.length || 0} public points currently returned`],
    ["Evidence sources", graph.sources.length, "floorplans, ACMV drawings, schedules, realtime API"],
  ].map(([label, value, note]) => `
    <div class="brick-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `).join("");
}

function renderBrickRelations(graph) {
  els.brickRelations.innerHTML = graph.relations
    .map((relation) => `
      <span>
        <strong>${escapeHtml(brickNodeTitle(relation.from, graph))}</strong>
        ${escapeHtml(relation.predicate)}
        <strong>${escapeHtml(brickNodeTitle(relation.to, graph))}</strong>
      </span>
    `)
    .join("");
}

function renderBrickInspector(graph, live) {
  const node = brickNodeById(state.activeBrickNodeId, graph);
  const matches = brickNodeMatches(node, live);
  const related = graph.relations.filter((relation) => relation.from === node.id || relation.to === node.id);
  const liveValue = brickNodeLiveValue(node, live);
  els.brickInspector.innerHTML = `
    <div class="brick-inspector-header">
      <span class="brick-status ${brickStatusClass(node.status)}">${escapeHtml(node.status)}</span>
      <h3>${escapeHtml(node.title)}</h3>
      <p>${escapeHtml(node.kind)} · ${escapeHtml(node.brickClass)}</p>
    </div>
    <dl class="brick-detail-list">
      <div>
        <dt>Source</dt>
        <dd>${escapeHtml(node.source)}</dd>
      </div>
      <div>
        <dt>Description</dt>
        <dd>${escapeHtml(node.description)}</dd>
      </div>
      <div>
        <dt>Live value</dt>
        <dd>${escapeHtml(liveValue || "No direct live value")}</dd>
      </div>
    </dl>
    <div class="brick-inspector-section">
      <h4>Attached points</h4>
      ${
        node.pointNames?.length
          ? node.pointNames.map((pointName) => {
              const point = matches.find((item) => item.point === pointName);
              const definition = historyPointByName(pointName, state.activeBrickBuilding);
              const value = point
                ? definition
                  ? formatHistoryValue(point.value, definition)
                  : formatNumber(point.value, 2)
                : "not live";
              return `<p><strong>${escapeHtml(pointName)}</strong><span>${escapeHtml(value)}</span></p>`;
            }).join("")
          : '<p class="empty-note">No direct point attachment in the seed graph.</p>'
      }
    </div>
    <div class="brick-inspector-section">
      <h4>Relations</h4>
      ${
        related.length
          ? related.map((relation) => `
              <p>
                <strong>${escapeHtml(brickNodeTitle(relation.from, graph))}</strong>
                <span>${escapeHtml(relation.predicate)} ${escapeHtml(brickNodeTitle(relation.to, graph))}</span>
              </p>
            `).join("")
          : '<p class="empty-note">No relations listed for this seed node.</p>'
      }
    </div>
  `;
}

function renderBrickGraph() {
  if (!els.brickGraph) return;
  const graph = brickGraphForPlace();
  const live = state.realtimeByBuilding[state.activeBrickBuilding];
  const nodeIds = new Set(brickAllNodes(graph).map((node) => node.id));
  if (!nodeIds.has(state.activeBrickNodeId)) state.activeBrickNodeId = "sde4";

  renderBrickPlaceSelector(graph);
  renderBrickSummary(graph, live);
  els.brickGraph.innerHTML = renderBrickNetwork(graph, live);

  renderBrickRelations(graph);
  renderBrickInspector(graph, live);
}

function openBrickModal() {
  if (!els.brickModal) return;
  closeTrendModal();
  els.brickModal.classList.remove("hidden");
  els.mapBrickView?.classList.add("active");
  els.mapBrickView?.setAttribute("aria-pressed", "true");
  renderBrickGraph();
}

function closeBrickModal() {
  els.brickModal?.classList.add("hidden");
  els.mapBrickView?.classList.remove("active");
  els.mapBrickView?.setAttribute("aria-pressed", "false");
}

function selectBuilding(feature, options = {}) {
  const props = feature.properties;
  const buildingCode = String(props.short_name || "").toUpperCase();
  const live = state.realtimeByBuilding[buildingCode];
  if (options.activate !== false) activateTab("buildings");
  state.selectedId = props.id;
  if (live) state.activeRealtimeBuilding = buildingCode;
  const changed = !state.selectedComparisonBuildings.has(buildingCode);
  state.selectedComparisonBuildings = new Set([buildingCode]);
  renderBuildingList();
  renderBuildingAnalytics();
  if (changed && buildingPerformanceModel[buildingCode]) {
    loadBuildingPerformanceHistory([buildingCode]).catch((error) => console.error(error));
  }

}

function zoomToFeature(feature, maxZoom = 16.5) {
  if (!state.map) return;
  if (feature.geometry.type === "Point") {
    state.map.easeTo({
      center: feature.geometry.coordinates,
      zoom: maxZoom,
      pitch: 54,
      bearing: -24,
      duration: 700,
    });
    return;
  }
  const coordinates = feature.geometry.coordinates[0];
  const bounds = coordinates.reduce(
    (box, coordinate) => box.extend(coordinate),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
  );
  state.map.fitBounds(bounds, {
    padding: 120,
    maxZoom,
    duration: 700,
  });
}

function applySearchFilter() {
  if (!state.map?.getLayer("building-marker-halo")) return;
  const search = state.searchTerm.toLowerCase();
  const searchFilter = search
    ? [
        "any",
        [">=", ["index-of", search, ["downcase", ["get", "name"]]], 0],
        [">=", ["index-of", search, ["downcase", ["get", "short_name"]]], 0],
        [">=", ["index-of", search, ["downcase", ["get", "zone"]]], 0],
        [">=", ["index-of", search, ["downcase", ["get", "type"]]], 0],
        [">=", ["index-of", search, ["downcase", ["get", "child_names"]]], 0],
      ]
    : null;

  const priorityFilter = ["==", ["get", "label_priority"], true];
  const layerBaseFilters = {
    "priority-marker-halo": priorityFilter,
    "priority-marker-dot": priorityFilter,
    "priority-marker-label": priorityFilter,
  };
  const combineFilter = (baseFilter) => {
    if (baseFilter && searchFilter) return ["all", baseFilter, searchFilter];
    return baseFilter || searchFilter || null;
  };

  [
    "priority-marker-halo",
    "priority-marker-dot",
    "priority-marker-label",
    "building-marker-halo",
    "building-marker-dot",
    "building-marker-label",
    "building-name-label",
  ].forEach((layer) => {
    if (!state.map.getLayer(layer)) return;
    state.map.setFilter(layer, combineFilter(layerBaseFilters[layer]));
  });
}

function setLayerVisibility(layerIds, visible) {
  layerIds.forEach((id) => {
    if (state.map?.getLayer(id)) state.map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  });
}

function addMapboxEuiLayer() {
  state.map.addSource(mapboxEuiLayer.sourceId, {
    type: "vector",
    url: mapboxEuiLayer.sourceUrl,
  });
  state.map.addLayer({
    id: "eui-context-fill",
    type: "fill",
    source: mapboxEuiLayer.sourceId,
    "source-layer": mapboxEuiLayer.sourceLayer,
    filter: campusSourceFilter(),
    layout: { visibility: els.toggleEuiLayer.checked ? "visible" : "none" },
    paint: {
      "fill-color": euiColorExpression(),
      "fill-opacity": 0.42,
    },
  });
  state.map.addLayer({
    id: "eui-context-outline",
    type: "line",
    source: mapboxEuiLayer.sourceId,
    "source-layer": mapboxEuiLayer.sourceLayer,
    filter: campusSourceFilter(),
    layout: { visibility: els.toggleEuiLayer.checked ? "visible" : "none" },
    paint: {
      "line-color": "#38424d",
      "line-opacity": 0.22,
      "line-width": 0.5,
    },
  });
}

function addMapLayers() {
  addMapboxEuiLayer();

  state.map.addSource("campus-boundary", {
    type: "geojson",
    data: campusBoundaryFeature(),
  });
  state.map.addSource("building-points", {
    type: "geojson",
    data: state.pointData,
  });
  state.map.addSource("zone-points", {
    type: "geojson",
    data: state.zoneData,
  });
  state.map.addSource("region-areas", {
    type: "geojson",
    data: state.regionAreaData,
  });
  state.map.addLayer({
    id: "campus-boundary-fill",
    type: "fill",
    source: "campus-boundary",
    paint: {
      "fill-color": "#eef3f6",
      "fill-opacity": 0,
    },
  });
  state.map.addLayer({
    id: "campus-boundary-line",
    type: "line",
    source: "campus-boundary",
    paint: {
      "line-color": "#003d7c",
      "line-opacity": 0.12,
      "line-width": 1.4,
      "line-dasharray": [2, 2],
    },
  });
  state.map.addLayer({
    id: "region-area-fill",
    type: "fill",
    source: "region-areas",
    maxzoom: 15.8,
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13.8, 0.1, 15.8, 0.18],
    },
  });
  state.map.addLayer({
    id: "region-area-outline",
    type: "line",
    source: "region-areas",
    maxzoom: 15.8,
    paint: {
      "line-color": ["get", "color"],
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 13.8, 0.35, 15.8, 0.75],
      "line-width": ["interpolate", ["linear"], ["zoom"], 13.8, 1.1, 15.8, 2.3],
      "line-dasharray": [2, 1.2],
    },
  });
  state.map.addLayer({
    id: "buildings-fill",
    type: "fill",
    source: mapboxEuiLayer.sourceId,
    "source-layer": mapboxEuiLayer.sourceLayer,
    filter: campusSourceFilter(),
    paint: {
      "fill-color": buildingModelColorExpression(),
      "fill-opacity": 0.9,
    },
  });
  state.map.addLayer({
    id: "buildings-outline",
    type: "line",
    source: mapboxEuiLayer.sourceId,
    "source-layer": mapboxEuiLayer.sourceLayer,
    filter: campusSourceFilter(),
    paint: {
      "line-color": "#899ba7",
      "line-opacity": 0.3,
      "line-width": 0.7,
    },
  });
  state.map.addLayer({
    id: "buildings-extrusion",
    type: "fill-extrusion",
    source: mapboxEuiLayer.sourceId,
    "source-layer": mapboxEuiLayer.sourceLayer,
    filter: campusSourceFilter(),
    minzoom: 13,
    paint: {
      "fill-extrusion-color": buildingModelColorExpression(),
      "fill-extrusion-height": ["max", ["to-number", ["get", "height_m"], 6], 4],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.94,
    },
  });
  state.map.addLayer({
    id: "zone-marker-outer",
    type: "circle",
    source: "zone-points",
    maxzoom: 15.65,
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 13.5, 22, 15.65, 38],
      "circle-opacity": 0.15,
    },
  });
  state.map.addLayer({
    id: "zone-marker-middle",
    type: "circle",
    source: "zone-points",
    maxzoom: 15.65,
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 13.5, 16, 15.65, 27],
      "circle-opacity": 0.28,
    },
  });
  state.map.addLayer({
    id: "zone-marker-halo",
    type: "circle",
    source: "zone-points",
    maxzoom: 15.65,
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 13.5, 11, 15.65, 15],
      "circle-opacity": 0.96,
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0.92,
    },
  });
  state.map.addLayer({
    id: "zone-marker-dot",
    type: "circle",
    source: "zone-points",
    maxzoom: 15.65,
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 13.5, 6, 15.65, 9],
    },
  });
  state.map.addLayer({
    id: "zone-count-label",
    type: "symbol",
    source: "zone-points",
    maxzoom: 15.65,
    layout: {
      "text-field": ["to-string", ["get", "count"]],
      "text-size": ["interpolate", ["linear"], ["zoom"], 13.5, 10, 15.65, 12],
      "text-anchor": "center",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": ["get", "color"],
      "text-halo-width": 0.5,
    },
  });
  state.map.addLayer({
    id: "zone-label",
    type: "symbol",
    source: "zone-points",
    maxzoom: 15.65,
    layout: {
      "text-field": ["get", "label"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 13.5, 10, 15.65, 12],
      "text-anchor": "top",
      "text-offset": [0, 1.55],
      "text-max-width": 14,
      "text-allow-overlap": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#17202a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.7,
    },
  });
  state.map.addLayer({
    id: "priority-marker-halo",
    type: "circle",
    source: "building-points",
    minzoom: 15.35,
    maxzoom: 15.8,
    filter: ["==", ["get", "label_priority"], true],
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 15.35, 10, 15.8, 13],
      "circle-opacity": 0,
      "circle-stroke-color": buildingStatusColorExpression(),
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0,
    },
  });
  state.map.addLayer({
    id: "priority-marker-dot",
    type: "circle",
    source: "building-points",
    minzoom: 15.35,
    maxzoom: 15.8,
    filter: ["==", ["get", "label_priority"], true],
    paint: {
      "circle-color": buildingStatusColorExpression(),
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 15.35, 5, 15.8, 7],
      "circle-opacity": 0,
    },
  });
  state.map.addLayer({
    id: "priority-marker-label",
    type: "symbol",
    source: "building-points",
    minzoom: 15.35,
    maxzoom: 15.8,
    filter: ["==", ["get", "label_priority"], true],
    layout: {
      "text-field": ["get", "map_label"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 15.35, 9, 15.8, 10],
      "text-anchor": "center",
      "text-allow-overlap": false,
      "text-optional": true,
      "symbol-sort-key": ["get", "label_rank"],
    },
    paint: {
      "text-color": "#143c54",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.8,
    },
  });
  state.map.addLayer({
    id: "building-marker-halo",
    type: "circle",
    source: "building-points",
    minzoom: 15.8,
    paint: {
      "circle-color": "#ffffff",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 15.8, 9, 17, 13],
      "circle-opacity": 0,
      "circle-stroke-color": buildingStatusColorExpression(),
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0,
    },
  });
  state.map.addLayer({
    id: "building-marker-dot",
    type: "circle",
    source: "building-points",
    minzoom: 15.8,
    paint: {
      "circle-color": buildingStatusColorExpression(),
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 15.8, 5, 17, 8],
      "circle-opacity": 0,
    },
  });
  state.map.addLayer({
    id: "building-marker-label",
    type: "symbol",
    source: "building-points",
    minzoom: 15.8,
    layout: {
      "text-field": ["get", "map_label"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 15.8, 11, 17, 13],
      "text-anchor": "center",
      "text-allow-overlap": false,
      "text-optional": true,
      "symbol-sort-key": ["get", "label_rank"],
    },
    paint: {
      "text-color": "#143c54",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 15.8, 0, 16.15, 1],
    },
  });
  state.map.addLayer({
    id: "building-name-label",
    type: "symbol",
    source: "building-points",
    minzoom: 24,
    layout: {
      "text-field": ["get", "name"],
      "text-size": 11,
      "text-anchor": "top",
      "text-offset": [0, 1.35],
      "text-max-width": 12,
      "text-allow-overlap": false,
      "text-optional": true,
      "symbol-sort-key": ["get", "label_rank"],
    },
    paint: {
      "text-color": "#17202a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.5,
      "text-opacity": ["step", ["zoom"], 0, 17.35, 1],
    },
  });

  // Cross-fade the overview regions into individual building labels.
  ["region-area-fill", "region-area-outline"].forEach((id) => state.map.setLayerZoomRange(id, 0, 16.25));
  state.map.setPaintProperty("region-area-fill", "fill-opacity", ["interpolate", ["linear"], ["zoom"], 14, 0.07, 15.5, 0.09, 16.2, 0]);
  state.map.setPaintProperty("region-area-outline", "line-opacity", ["interpolate", ["linear"], ["zoom"], 14, 0.25, 15.5, 0.4, 16.2, 0]);
  const zoneFade = ["interpolate", ["linear"], ["zoom"], 15.55, 1, 15.95, 0];
  ["zone-marker-outer", "zone-marker-middle", "zone-marker-halo", "zone-marker-dot", "zone-count-label", "zone-label"].forEach((id) => {
    state.map.setLayerZoomRange(id, 0, 16);
    const isText = id === "zone-count-label" || id === "zone-label";
    state.map.setPaintProperty(id, isText ? "text-opacity" : "circle-opacity", zoneFade);
  });
  state.map.setPaintProperty("zone-marker-outer", "circle-opacity", 0);
  state.map.setPaintProperty("zone-marker-middle", "circle-opacity", ["interpolate", ["linear"], ["zoom"], 15.55, 0.1, 15.95, 0]);
  state.map.setPaintProperty("zone-marker-halo", "circle-stroke-opacity", zoneFade);
  // Individual labels enter with the close-up layer, after district counts fade.
  state.map.setPaintProperty("priority-marker-label", "text-opacity", 0);

  state.map.on("mousemove", (event) => {
    if (state.activeTab !== "overview" || state.mapSelectedSourceId || state.map.getZoom() < 15.8) return;
    const hit = state.map.queryRenderedFeatures(event.point, { layers: ["building-marker-label", "buildings-extrusion", "buildings-fill"] })
      .find((item) => focusBuildingBySourceId.has(item.properties.source_id));
    const sourceId = hit?.properties.source_id || null;
    if (sourceId === state.mapHoveredSourceId) return;
    state.mapHoveredSourceId = sourceId;
    state.map.getCanvas().style.cursor = sourceId ? "pointer" : "";
    updateMapBuildingHighlight();
    const feature = sourceId && displayFeatureBySourceId(sourceId);
    if (feature) showMapBuildingCard(feature, false, event.lngLat);
    else state.mapBuildingPopup?.remove();
  });
  const clearHover = () => {
    if (state.mapSelectedSourceId) return;
    state.mapHoveredSourceId = null;
    state.mapBuildingPopup?.remove();
    updateMapBuildingHighlight();
  };
  state.map.getCanvas().addEventListener("mouseleave", clearHover);
  state.map.on("movestart", clearHover);

  state.map.on("mouseenter", "buildings-fill", () => {
    state.map.getCanvas().style.cursor = "pointer";
  });
  state.map.on("mouseleave", "buildings-fill", () => {
    state.map.getCanvas().style.cursor = "";
  });

  [
    "priority-marker-halo",
    "priority-marker-dot",
    "priority-marker-label",
    "building-marker-halo",
    "building-marker-dot",
    "building-marker-label",
  ].forEach((layer) => {
    state.map.on("mouseenter", layer, () => {
      state.map.getCanvas().style.cursor = "pointer";
    });
    state.map.on("mouseleave", layer, () => {
      state.map.getCanvas().style.cursor = "";
    });
  });

  ["region-area-fill", "region-area-outline"].forEach((layer) => {
    state.map.on("mouseenter", layer, () => {
      state.map.getCanvas().style.cursor = "pointer";
    });
    state.map.on("mouseleave", layer, () => {
      state.map.getCanvas().style.cursor = "";
    });
  });

  [
    "zone-marker-outer",
    "zone-marker-middle",
    "zone-marker-halo",
    "zone-marker-dot",
    "zone-count-label",
    "zone-label",
  ].forEach((layer) => {
    state.map.on("mouseenter", layer, () => {
      state.map.getCanvas().style.cursor = "pointer";
    });
    state.map.on("mouseleave", layer, () => {
      state.map.getCanvas().style.cursor = "";
    });
  });

  const zoneClickLayers = [
    "zone-marker-outer",
    "zone-marker-middle",
    "zone-marker-halo",
    "zone-marker-dot",
    "zone-count-label",
    "zone-label",
  ];
  const buildingMarkerClickLayers = [
    "priority-marker-halo",
    "priority-marker-dot",
    "priority-marker-label",
    "building-marker-halo",
    "building-marker-dot",
    "building-marker-label",
  ];
  const regionClickLayers = ["region-area-fill", "region-area-outline"];

  if (state.mapClickHandler) state.map.off("click", state.mapClickHandler);
  state.mapClickHandler = (event) => {
    const zoneFeature = state.map.queryRenderedFeatures(event.point, { layers: zoneClickLayers })[0];
    if (zoneFeature) {
      const regionCodes = String(zoneFeature.properties.codes || "")
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean);
      zoomToRegionCodes(regionCodes);
      return;
    }

    const markerFeature = state.map.queryRenderedFeatures(event.point, { layers: buildingMarkerClickLayers })[0];
    if (markerFeature) {
      const sourceFeature =
        state.data.features.find((item) => item.properties.id === markerFeature.properties.id) || markerFeature;
      const display = displayFeatureBySourceId(sourceFeature.properties.source_id) || sourceFeature;
      showMapBuildingCard(display, true, event.lngLat);
      state.mapSelectedSourceId = display.properties.source_id;
      state.mapHoveredSourceId = null;
      updateMapBuildingHighlight();
      return;
    }

    const mapboxFeature = state.map.queryRenderedFeatures(event.point, { layers: ["buildings-extrusion", "buildings-fill"] })[0];
    if (mapboxFeature) {
      const displayFeature = displayFeatureBySourceId(mapboxFeature.properties.source_id);
      if (displayFeature) {
        showMapBuildingCard(displayFeature, true, event.lngLat);
        state.mapSelectedSourceId = displayFeature.properties.source_id;
        state.mapHoveredSourceId = null;
        updateMapBuildingHighlight();
      } else {
        state.mapBuildingPopup?.remove();
      }
      return;
    }

    const regionFeature = state.map.queryRenderedFeatures(event.point, { layers: regionClickLayers })[0];
    if (regionFeature) {
      const region = focusRegions.find((item) => item.label === regionFeature.properties.label);
      if (region) zoomToRegionCodes(region.codes);
    } else {
      state.mapBuildingPopup?.remove();
    }
  };
  state.map.on("click", state.mapClickHandler);
}

function renderLegend(metric) {
  els.legendTitle.textContent = colorModeConfig[metric].label;
  if (metric === "type") {
    els.legendScale.classList.add("hidden");
    els.legendLabels.classList.add("hidden");
    els.legendItems.classList.remove("hidden");
    els.legendTitle.textContent = "Campus districts";
    els.legendItems.innerHTML = [...focusRegions.map((region) => [region.color, region.label]), ["#cbd4da", "Other campus buildings"], ["#ef7c00", "Selected building"]]
      .map(([color, label]) => `<span><i style="background:${color}"></i>${label}</span>`)
      .join("");
    return;
  }
  if (metric === "live") {
    els.legendScale.classList.add("hidden");
    els.legendLabels.classList.add("hidden");
    els.legendItems.classList.remove("hidden");
    els.legendItems.innerHTML = `
      <span><i style="background:#003d7c"></i>Live endpoint mapped</span>
      <span><i style="background:#6f8d9c"></i>Catalogued building</span>
    `;
    return;
  }
  els.legendItems.classList.add("hidden");
  els.legendScale.classList.remove("hidden");
  els.legendLabels.classList.remove("hidden");
  els.legendLabels.firstElementChild.textContent = metric === "height" ? "Low" : "Low";
  els.legendLabels.lastElementChild.textContent = metric === "height" ? "High" : "High";
}

function updateMetric(metric) {
  state.metric = metric;
  renderLegend(metric);
  els.metricButtons.forEach((button) => {
    const active = button.dataset.metric === metric;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (!state.map?.getLayer("buildings-fill")) return;
  const colorByMode = {
    type: buildingModelColorExpression(),
    eui: euiColorExpression(),
    height: heightColorExpression(),
    live: liveMappingColorExpression(),
    electricity: colorExpression("electricity"),
    cooling: colorExpression("cooling"),
    pv: colorExpression("pv"),
  };
  const buildingColor = colorByMode[metric] || buildingModelColorExpression();
  state.map.setPaintProperty("buildings-fill", "fill-color", buildingColor);
  state.map.setPaintProperty("buildings-extrusion", "fill-extrusion-color", buildingColor);
  state.map.setPaintProperty("buildings-extrusion", "fill-extrusion-height", ["max", ["to-number", ["get", "height_m"], 6], 4]);
  updateMapBuildingHighlight();
}

function fitCampus() {
  els.toggleEuiLayer.checked = false;
  setLayerVisibility(["eui-context-fill", "eui-context-outline"], false);
  if (!state.map) return;
  const bounds = campusFocusBounds();
  state.map.fitBounds(bounds, {
    padding: { top: 22, right: 28, bottom: 22, left: 28 },
    maxZoom: campusOverview.zoom,
    duration: 700,
    pitch: campusOverview.pitch,
    bearing: campusOverview.bearing,
  });
  state.map.once("moveend", () => {
    if (!state.map) return;
    const currentZoom = state.map.getZoom();
    if (currentZoom < campusOverview.zoom - 0.02) {
      state.map.easeTo({
        center: bounds.getCenter(),
        zoom: campusOverview.zoom,
        pitch: campusOverview.pitch,
        bearing: campusOverview.bearing,
        duration: 280,
      });
    }
  });
}

function nemsSeries(record, label) {
  const series = record?.datasets?.find((item) => item.label === label);
  return Array.isArray(series?.data)
    ? series.data.map((value) => Number(value)).map((value) => (Number.isFinite(value) ? value : 0))
    : [];
}

function nemsPolyline(values, xFor, yFor, start = 0, end = values.length - 1) {
  return values
    .slice(start, end + 1)
    .map((value, offset) => `${xFor(start + offset).toFixed(1)},${yFor(value).toFixed(1)}`)
    .join(" ");
}

function nemsAreaPath(values, xFor, yFor, baseline) {
  if (!values.length) return "";
  const points = values.map((value, index) => `L${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`).join(" ");
  return `M${xFor(0).toFixed(1)},${baseline.toFixed(1)} ${points} L${xFor(values.length - 1).toFixed(1)},${baseline.toFixed(1)} Z`;
}

function nemsBandPath(lower, upper, xFor, lowerY, upperY) {
  if (!lower.length || lower.length !== upper.length) return "";
  const top = upper.map((value, index) => `${index ? "L" : "M"}${xFor(index).toFixed(1)},${upperY(value).toFixed(1)}`).join(" ");
  const bottom = lower.slice().reverse().map((value, reverseIndex) => {
    const index = lower.length - 1 - reverseIndex;
    return `L${xFor(index).toFixed(1)},${lowerY(value).toFixed(1)}`;
  }).join(" ");
  return `${top} ${bottom} Z`;
}

function nemsMetricColor(metric, index) {
  const colorsByClass = {
    "color-usep": "#187c70",
    "color-demand": "#386fa4",
    "color-solar": "#c66f00",
    "color-bvp": "#7c5cc4",
  };
  return colorsByClass[metric?.textcolor] || ["#187c70", "#386fa4", "#c66f00", "#7c5cc4"][index % 4];
}

function renderNemsMetrics(record, product) {
  const currentMetrics = Array.isArray(record.current) ? record.current : [];
  const html = currentMetrics.map((metric, index) => {
    const label = product.metricLabels?.[index] || metric.label || `Metric ${index + 1}`;
    const color = nemsMetricColor(metric, index);
    const symbol = metric.symbol || "";
    const value = metric.value ?? "--";
    const denom = String(metric.denom || "");
    const help = label === "VCP"
      ? "This reflects the vesting contract price for the current tariff quarter."
      : `This reflects ${label.toLowerCase()} for the selected NEMS data product.`;
    return `<div class="nems-current-metric" style="--metric-color:${color}"><div class="nems-metric-label" title="${escapeHtml(help)}"><i aria-hidden="true"></i>${escapeHtml(label)}</div><div class="nems-metric-value">${escapeHtml(symbol)}${escapeHtml(value)}</div><small class="nems-metric-unit">${escapeHtml(denom)}</small></div>`;
  }).join("");
  return `<div class="nems-current-grid metrics-${Math.min(Math.max(currentMetrics.length, 1), 4)}" aria-label="Current Singapore market values">${html}</div>`;
}

function renderNemsMarket(record, product) {
  if (!els.nemsMarketBody) return;
  const labels = Array.isArray(record.labels) ? record.labels : [];
  const usep = nemsSeries(record, "USEP");
  const demand = nemsSeries(record, "Demand");
  const solarTotal = nemsSeries(record, "Solar");
  const vcp = nemsSeries(record, "VCP");
  const pointCount = Math.min(labels.length, usep.length, demand.length, solarTotal.length, vcp.length);
  if (!pointCount) throw new Error("The NEMS response did not include chart data.");

  const series = {
    usep: usep.slice(0, pointCount),
    demand: demand.slice(0, pointCount),
    solarTotal: solarTotal.slice(0, pointCount),
    vcp: vcp.slice(0, pointCount),
  };
  const solar = series.solarTotal.map((value, index) => Math.max(0, value - series.demand[index]));
  const hasForecast = Boolean(record.forecast);
  const currentPeriod = hasForecast
    ? Math.min(Math.max(Number.parseInt(String(record.forecast).split(",")[0], 10) || 1, 1), pointCount)
    : pointCount;
  const currentIndex = currentPeriod - 1;
  const width = Math.max(640, Math.round(els.nemsMarketBody.clientWidth) - 28);
  const height = 350;
  const plot = { left: 76, right: 78, top: 24, bottom: 52 };
  const plotWidth = width - plot.left - plot.right;
  const baseline = height - plot.bottom;
  const priceMax = Math.max(1000, Math.ceil(Math.max(...series.usep, ...series.vcp) * 1.12 / 500) * 500);
  const demandFloor = Math.max(0, Math.floor(Math.min(...series.demand) * 0.96 / 500) * 500);
  const demandCeil = Math.max(demandFloor + 1000, Math.ceil(Math.max(...series.solarTotal) * 1.04 / 500) * 500);
  const xFor = (index) => plot.left + (index / Math.max(pointCount - 1, 1)) * plotWidth;
  const priceY = (value) => plot.top + (1 - value / priceMax) * (baseline - plot.top);
  const demandY = (value) => plot.top + (1 - (value - demandFloor) / (demandCeil - demandFloor)) * (baseline - plot.top);
  const currentX = xFor(currentIndex);

  const priceTicks = Array.from({ length: 5 }, (_, index) => priceMax * (1 - index / 4));
  const demandTicks = Array.from({ length: 5 }, (_, index) => demandCeil - (demandCeil - demandFloor) * index / 4);
  const grid = priceTicks.map((value, index) => {
    const y = plot.top + index / 4 * (baseline - plot.top);
    return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text class="nems-axis-label" x="${plot.left - 14}" y="${y + 4}" text-anchor="end">${formatNumber(value, 0)}</text><text class="nems-axis-label" x="${width - plot.right + 14}" y="${y + 4}">${formatNumber(demandTicks[index], 0)}</text>`;
  }).join("");
  const xTickIndexes = pointCount > 100
    ? Array.from({ length: 7 }, (_, index) => index * 48).filter((index) => index < pointCount)
    : pointCount > 48
      ? [0, 12, 24, 36, 48, 60, pointCount - 1]
      : [0, 6, 12, 18, 24, 30, 36, 42, pointCount - 1];
  const xTicks = xTickIndexes.map((index) => {
    const label = String(labels[index] || "");
    const tickLabel = pointCount > 100
      ? label.slice(0, 6)
      : pointCount > 48
        ? `${label.slice(0, 6)}, ${label.match(/\d{2}:\d{2}/)?.[0] || ""}`
        : label.match(/\d{2}:\d{2}/)?.[0] || label;
    return `<text class="nems-axis-label" x="${xFor(index)}" y="${height - 20}" text-anchor="middle">${escapeHtml(tickLabel)}</text>`;
  }).join("");
  const currentEnd = Math.min(currentIndex + 1, pointCount - 1);
  const hits = labels.map((label, index) => {
    const start = index === 0 ? plot.left : (xFor(index - 1) + xFor(index)) / 2;
    const end = index === pointCount - 1 ? width - plot.right : (xFor(index) + xFor(index + 1)) / 2;
    return `<rect class="nems-chart-hit" data-nems-index="${index}" x="${start}" y="${plot.top}" width="${end - start}" height="${baseline - plot.top}" tabindex="0" aria-label="Inspect ${escapeHtml(label)}"></rect>`;
  }).join("");

  els.nemsMarketBody.innerHTML = `
    ${renderNemsMetrics(record, product)}
    <div class="nems-chart-frame" id="nemsChartFrame">
      <svg class="nems-market-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(product.title)}">
        <defs>
          <linearGradient id="nemsUsepFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#187c70" stop-opacity=".13"/><stop offset="1" stop-color="#ffffff" stop-opacity=".12"/></linearGradient>
          <linearGradient id="nemsDemandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#386fa4" stop-opacity=".10"/><stop offset="1" stop-color="#ffffff" stop-opacity=".12"/></linearGradient>
          <linearGradient id="nemsSolarFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c66f00" stop-opacity=".12"/><stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>
        </defs>
        <g class="nems-grid">${grid}</g>
        <text class="nems-axis-title" x="18" y="${(plot.top + baseline) / 2}" transform="rotate(-90 18 ${(plot.top + baseline) / 2})" text-anchor="middle">Price ($/MWh)</text>
        <text class="nems-axis-title" x="${width - 17}" y="${(plot.top + baseline) / 2}" transform="rotate(90 ${width - 17} ${(plot.top + baseline) / 2})" text-anchor="middle">Demand (MW)</text>
        <path class="nems-area nems-usep-area" d="${nemsAreaPath(series.usep, xFor, priceY, baseline)}"></path>
        <path class="nems-area nems-demand-area" d="${nemsAreaPath(series.demand, xFor, demandY, baseline)}"></path>
        <path class="nems-area nems-solar-area" d="${nemsBandPath(series.demand, series.solarTotal, xFor, demandY, demandY)}"></path>
        <polyline class="nems-line nems-usep-line" points="${nemsPolyline(series.usep, xFor, priceY, 0, currentEnd)}"></polyline>
        ${hasForecast ? `<polyline class="nems-line nems-usep-line future" points="${nemsPolyline(series.usep, xFor, priceY, currentIndex, pointCount - 1)}"></polyline>` : ""}
        <polyline class="nems-line nems-demand-line" points="${nemsPolyline(series.demand, xFor, demandY, 0, currentEnd)}"></polyline>
        ${hasForecast ? `<polyline class="nems-line nems-demand-line future" points="${nemsPolyline(series.demand, xFor, demandY, currentIndex, pointCount - 1)}"></polyline>` : ""}
        <polyline class="nems-line nems-solar-line" points="${nemsPolyline(series.solarTotal, xFor, demandY, 0, currentEnd)}"></polyline>
        ${hasForecast ? `<polyline class="nems-line nems-solar-line future" points="${nemsPolyline(series.solarTotal, xFor, demandY, currentIndex, pointCount - 1)}"></polyline>` : ""}
        <polyline class="nems-line nems-vcp-line" points="${nemsPolyline(series.vcp, xFor, priceY)}"></polyline>
        ${hasForecast ? `<line class="nems-current-line" x1="${currentX}" x2="${currentX}" y1="${plot.top}" y2="${baseline}"></line>` : ""}
        <g>${xTicks}</g>
        <line class="nems-hover-line" y1="${plot.top}" y2="${baseline}" hidden></line>
        <g>${hits}</g>
      </svg>
      <div class="nems-chart-tooltip" role="status" hidden></div>
    </div>
    ${hasForecast ? '<div class="nems-state-legend" aria-label="Market data state"><span><i class="past"></i>Past</span><span><i class="current"></i>Current</span><span><i class="future"></i>Future</span></div>' : ""}
    <div class="nems-chart-footer">${record.currentdate ? `<strong>Current period: ${escapeHtml(record.currentdate)}</strong>` : ""}<strong>Updated: ${escapeHtml(record.lastupdate || "--")}</strong></div>
    <p class="nems-provisional-note">Real-time prices displayed are provisional.</p>
  `;
  bindNemsMarketInteraction({ labels: labels.slice(0, pointCount), series, solar, currentIndex, xFor, width, plot });
}

function renderNemsRange(record, product) {
  if (!els.nemsMarketBody) return;
  const labels = Array.isArray(record.labels) ? record.labels : [];
  const minimum = nemsSeries(record, "Min");
  const maximum = nemsSeries(record, "Max");
  const averageValues = nemsSeries(record, "Average");
  const pointCount = Math.min(labels.length, minimum.length, maximum.length, averageValues.length);
  if (!pointCount) throw new Error("The NEMS response did not include daily range data.");
  const series = {
    minimum: minimum.slice(0, pointCount),
    maximum: maximum.slice(0, pointCount),
    average: averageValues.slice(0, pointCount),
  };
  const width = Math.max(640, Math.round(els.nemsMarketBody.clientWidth) - 28);
  const height = 350;
  const plot = { left: 76, right: 30, top: 24, bottom: 52 };
  const plotWidth = width - plot.left - plot.right;
  const baseline = height - plot.bottom;
  const rawMax = Math.max(...series.maximum, ...series.average, 1) * 1.1;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const step = magnitude >= 1000 ? magnitude / 2 : magnitude / 10;
  const yMax = Math.ceil(rawMax / step) * step;
  const xFor = (index) => plot.left + (index / Math.max(pointCount - 1, 1)) * plotWidth;
  const yFor = (value) => plot.top + (1 - value / yMax) * (baseline - plot.top);
  const averageColor = "#187c70";
  const bandColor = "#187c70";
  const grid = Array.from({ length: 6 }, (_, index) => {
    const y = plot.top + index / 5 * (baseline - plot.top);
    const value = yMax * (1 - index / 5);
    return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text class="nems-axis-label" x="${plot.left - 14}" y="${y + 4}" text-anchor="end">${formatNumber(value, 0)}</text>`;
  }).join("");
  const xTicks = labels.slice(0, pointCount).map((label, index) => `<text class="nems-axis-label" x="${xFor(index)}" y="${height - 20}" text-anchor="middle">${escapeHtml(label)}</text>`).join("");
  const averagePoints = nemsPolyline(series.average, xFor, yFor);
  const circles = series.average.map((value, index) => `<circle class="nems-range-point" cx="${xFor(index)}" cy="${yFor(value)}" r="3"></circle>`).join("");
  const hits = labels.slice(0, pointCount).map((label, index) => {
    const start = index === 0 ? plot.left : (xFor(index - 1) + xFor(index)) / 2;
    const end = index === pointCount - 1 ? width - plot.right : (xFor(index) + xFor(index + 1)) / 2;
    return `<rect class="nems-chart-hit" data-nems-range-index="${index}" x="${start}" y="${plot.top}" width="${end - start}" height="${baseline - plot.top}" tabindex="0" aria-label="Inspect ${escapeHtml(label)}"></rect>`;
  }).join("");
  els.nemsMarketBody.innerHTML = `
    ${renderNemsMetrics(record, product)}
    <div class="nems-chart-frame" id="nemsChartFrame">
      <svg class="nems-market-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(product.title)}">
        <g class="nems-grid">${grid}</g>
        <text class="nems-axis-title" x="18" y="${(plot.top + baseline) / 2}" transform="rotate(-90 18 ${(plot.top + baseline) / 2})" text-anchor="middle">${escapeHtml(product.axisTitle)}</text>
        <path class="nems-range-band" style="--range-band:${bandColor}" d="${nemsBandPath(series.minimum, series.maximum, xFor, yFor, yFor)}"></path>
        <polyline class="nems-range-average" style="--range-average:${averageColor}" points="${averagePoints}"></polyline>
        <g style="--range-average:${averageColor}">${circles}</g>
        <g>${xTicks}</g>
        <line class="nems-hover-line" y1="${plot.top}" y2="${baseline}" hidden></line>
        <g>${hits}</g>
      </svg>
      <div class="nems-chart-tooltip" role="status" hidden></div>
    </div>
    <div class="nems-range-legend"><span><i class="average" style="--range-average:${averageColor}"></i>Average</span><span><i class="range" style="--range-band:${bandColor}"></i>Min/Max</span></div>
    <div class="nems-chart-footer"><strong>Updated: ${escapeHtml(record.lastupdate || "--")}</strong></div>
    <p class="nems-provisional-note">EMC / NEMS market information · values may be revised.</p>
  `;
  bindNemsRangeInteraction({ labels: labels.slice(0, pointCount), series, xFor, width });
}

function bindNemsRangeInteraction({ labels, series, xFor, width }) {
  const frame = document.getElementById("nemsChartFrame");
  const hoverLine = frame?.querySelector(".nems-hover-line");
  const tooltip = frame?.querySelector(".nems-chart-tooltip");
  const hits = frame?.querySelectorAll("[data-nems-range-index]") || [];
  if (!frame || !hoverLine || !tooltip) return;
  const show = (index) => {
    const safeIndex = Math.min(Math.max(index, 0), labels.length - 1);
    const x = xFor(safeIndex);
    hoverLine.setAttribute("x1", x);
    hoverLine.setAttribute("x2", x);
    hoverLine.hidden = false;
    tooltip.hidden = false;
    tooltip.style.left = `${Math.min(Math.max(x / width * 100, 12), 86)}%`;
    tooltip.style.top = "37%";
    tooltip.innerHTML = `<strong>${escapeHtml(labels[safeIndex])}</strong><span>Minimum: ${formatNumber(series.minimum[safeIndex], 2)}</span><span>Maximum: ${formatNumber(series.maximum[safeIndex], 2)}</span><span>Average: ${formatNumber(series.average[safeIndex], 2)}</span>`;
  };
  hits.forEach((hit) => {
    const index = Number(hit.dataset.nemsRangeIndex);
    hit.addEventListener("pointerenter", () => show(index));
    hit.addEventListener("focus", () => show(index));
  });
  const hide = () => { tooltip.hidden = true; hoverLine.hidden = true; };
  frame.addEventListener("pointerleave", hide);
  frame.addEventListener("focusout", hide);
}

function renderNemsTable(record, chartRecord) {
  if (!els.nemsMarketBody) return;
  const headers = Array.isArray(record.labels) ? record.labels : [];
  const rows = Array.isArray(record.datasets) ? record.datasets : [];
  const headerHtml = headers.map((header) => `<th>${escapeHtml(String(header).replace(/<br\s*\/?\s*>/gi, " "))}</th>`).join("");
  const bodyHtml = rows.map((row) => `<tr class="nems-table-${escapeHtml(row.tag || "past")}">${(row.columns || []).map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("");
  els.nemsMarketBody.innerHTML = `
    ${renderNemsMetrics(chartRecord, nemsMarketProducts[state.activeNemsProduct])}
    <div class="nems-table-scroll" tabindex="0">
      <table class="nems-market-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
    </div>
    <div class="nems-table-state-key"><span><i class="past"></i>Past</span><span><i class="current"></i>Current</span><span><i class="future"></i>Future</span></div>
    <div class="nems-chart-footer"><strong>Updated: ${escapeHtml(chartRecord.lastupdate || "--")}</strong></div>
    <p class="nems-provisional-note">Real-time prices displayed are provisional.</p>
  `;
  const scroller = els.nemsMarketBody.querySelector(".nems-table-scroll");
  const currentRow = els.nemsMarketBody.querySelector(".nems-table-current");
  if (scroller && currentRow) {
    scroller.scrollTop = Math.max(0, currentRow.offsetTop - scroller.clientHeight / 2);
  }
}

function bindNemsMarketInteraction({ labels, series, solar, currentIndex, xFor, width, plot }) {
  const frame = document.getElementById("nemsChartFrame");
  const hoverLine = frame?.querySelector(".nems-hover-line");
  const tooltip = frame?.querySelector(".nems-chart-tooltip");
  const hits = frame?.querySelectorAll("[data-nems-index]") || [];
  if (!frame || !hoverLine || !tooltip) return;
  const show = (index) => {
    const safeIndex = Math.min(Math.max(index, 0), labels.length - 1);
    const xPercent = xFor(safeIndex) / width * 100;
    hoverLine.setAttribute("x1", xFor(safeIndex));
    hoverLine.setAttribute("x2", xFor(safeIndex));
    hoverLine.hidden = false;
    tooltip.hidden = false;
    tooltip.style.left = `${Math.min(Math.max(xPercent, 12), 82)}%`;
    tooltip.style.top = safeIndex > currentIndex ? "46%" : "34%";
    tooltip.innerHTML = `<strong>${escapeHtml(labels[safeIndex])}</strong><span><i style="--tip:#187c70"></i>USEP: ${formatNumber(series.usep[safeIndex], 2)}</span><span><i style="--tip:#386fa4"></i>Demand: ${formatNumber(series.demand[safeIndex], 0)}</span><span><i style="--tip:#c66f00"></i>Solar: ${formatNumber(solar[safeIndex], 0)}</span><span><i style="--tip:#7c5cc4"></i>VCP: ${formatNumber(series.vcp[safeIndex], 2)}</span>`;
  };
  hits.forEach((hit) => {
    const index = Number(hit.dataset.nemsIndex);
    hit.addEventListener("pointerenter", () => show(index));
    hit.addEventListener("focus", () => show(index));
  });
  const hide = () => { tooltip.hidden = true; hoverLine.hidden = true; };
  frame.addEventListener("pointerleave", hide);
  frame.addEventListener("focusout", hide);
}

function updateNemsSourceStatus(status, text) {
  if (!els.nemsSourceStatus) return;
  els.nemsSourceStatus.innerHTML = `<span class="status-dot ${status}"></span>${escapeHtml(text)}`;
}

function setNemsView(view) {
  const product = nemsMarketProducts[state.activeNemsProduct] || nemsMarketProducts["10"];
  state.activeNemsView = product.table && view === "table" ? "table" : "chart";
  els.nemsViewButtons.forEach((button) => {
    const active = button.dataset.nemsView === state.activeNemsView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (els.nemsViewToggle) els.nemsViewToggle.hidden = !product.table;
}

function renderActiveNemsChart(record) {
  const product = nemsMarketProducts[state.activeNemsProduct] || nemsMarketProducts["10"];
  if (product.kind === "range") renderNemsRange(record, product);
  else renderNemsMarket(record, product);
}

async function loadNemsTable() {
  const productValue = state.activeNemsProduct;
  const product = nemsMarketProducts[productValue] || nemsMarketProducts["10"];
  if (!product.table) {
    setNemsView("chart");
    renderActiveNemsChart(state.nemsProductCache.get(productValue));
    return;
  }
  const chartRecord = state.nemsProductCache.get(productValue);
  const cached = state.nemsTableCache.get(productValue);
  if (cached) {
    renderNemsTable(cached, chartRecord);
    return;
  }
  els.nemsMarketBody.innerHTML = '<div class="nems-loading-state"><span class="status-dot loading"></span>Loading the NEMS market table…</div>';
  const separator = nemsMarketConfig.tableEndpoint.includes("?") ? "&" : "?";
  const response = await fetch(`${nemsMarketConfig.tableEndpoint}${separator}value=${productValue}&t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`NEMS table endpoint returned HTTP ${response.status}.`);
  const payload = await response.json();
  const tableRecord = payload?.data?.data?.[0];
  if (!payload?.success || !tableRecord) throw new Error(payload?.data?.message || "The NEMS table response was empty.");
  state.nemsTableCache.set(productValue, tableRecord);
  if (state.activeNemsProduct !== productValue || state.activeNemsView !== "table") return;
  renderNemsTable(tableRecord, chartRecord);
}

async function loadNemsMarket({ force = false } = {}) {
  if (!els.nemsMarketBody || state.nemsLoading) return;
  const productValue = state.activeNemsProduct;
  const product = nemsMarketProducts[productValue] || nemsMarketProducts["10"];
  state.nemsLoading = true;
  els.nemsRefresh?.setAttribute("disabled", "");
  if (els.nemsMarketTitle) els.nemsMarketTitle.textContent = product.title;
  if (els.nemsMarketSubtitle) els.nemsMarketSubtitle.textContent = product.subtitle;
  if (els.nemsUpdateCadence) els.nemsUpdateCadence.textContent = product.cadence || "According to NEMS publication schedule";
  setNemsView(state.activeNemsView);
  updateNemsSourceStatus("loading", "Connecting to EMC / NEMS");
  try {
    let upstreamStale = false;
    let record = !force ? state.nemsProductCache.get(productValue) : null;
    if (!record) {
      const separator = nemsMarketConfig.endpoint.includes("?") ? "&" : "?";
      const response = await fetch(`${nemsMarketConfig.endpoint}${separator}value=${productValue}&t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`NEMS endpoint returned HTTP ${response.status}.`);
      upstreamStale = response.headers.get("X-NEMS-Data-Stale") === "true";
      const payload = await response.json();
      record = payload?.data?.data?.[0];
      if (!payload?.success || !record) throw new Error(payload?.data?.message || "The NEMS response was empty.");
      state.nemsProductCache.set(productValue, record);
      if (force) state.nemsTableCache.delete(productValue);
    }
    if (state.activeNemsProduct !== productValue) return;
    state.nemsMarketData = record;
    if (state.activeNemsView === "table" && product.table) await loadNemsTable();
    else renderActiveNemsChart(record);
    if (state.activeNemsProduct !== productValue) return;
    updateNemsSourceStatus(
      upstreamStale ? "partial" : "live",
      upstreamStale ? `NEMS interruption · cached ${record.lastupdate || "data"}` : `NEMS · updated ${record.lastupdate || "now"}`,
    );
  } catch (error) {
    console.error("NEMS market data unavailable", error);
    if (state.activeNemsProduct !== productValue) return;
    updateNemsSourceStatus("partial", "NEMS feed unavailable");
    const fallback = state.nemsProductCache.get(productValue);
    if (fallback) renderActiveNemsChart(fallback);
    else {
      els.nemsMarketBody.innerHTML = `<div class="nems-error-state"><strong>Market data is unavailable.</strong><span>${escapeHtml(error.message || "Could not reach the EMC / NEMS feed.")}</span><button type="button" data-nems-retry>Try again</button></div>`;
      els.nemsMarketBody.querySelector("[data-nems-retry]")?.addEventListener("click", () => loadNemsMarket({ force: true }));
    }
  } finally {
    state.nemsLoading = false;
    els.nemsRefresh?.removeAttribute("disabled");
    if (state.activeNemsProduct !== productValue) loadNemsMarket();
  }
}

async function selectNemsProduct(value) {
  if (!nemsMarketProducts[value]) return;
  state.activeNemsProduct = value;
  state.activeNemsView = "chart";
  if (els.nemsProductSelect) els.nemsProductSelect.value = value;
  els.nemsMarketBody.innerHTML = '<div class="nems-loading-state"><span class="status-dot loading"></span>Loading the selected NEMS data product…</div>';
  await loadNemsMarket();
}

function scheduleNemsMarketRefresh() {
  if (!els.nemsMarketBody) return;
  window.clearTimeout(state.nemsRefreshTimer);
  const now = new Date();
  const next = new Date(now);
  if (now.getMinutes() < 2) next.setMinutes(2, 15, 0);
  else if (now.getMinutes() < 32) next.setMinutes(32, 15, 0);
  else {
    next.setHours(now.getHours() + 1);
    next.setMinutes(2, 15, 0);
  }
  const minimumDelay = Math.max(nemsMarketConfig.refreshMs, 300_000);
  const delay = Math.max(minimumDelay, next.getTime() - now.getTime());
  state.nemsRefreshTimer = window.setTimeout(async () => {
    await loadNemsMarket({ force: true });
    scheduleNemsMarketRefresh();
  }, delay);
}

function renderMarketHeatmap() {
  if (!els.marketHeatmap) return;
  const labels = ["P1", "P9", "P17", "P25", "P33", "P41"];
  const levels = [2, 1, 3, 4, 1, 2, 3, 1, 2, 4, 1, 2, 3, 4, 1, 2, 3, 2, 1, 3, 4, 2, 1, 3, 2, 4, 1, 2];
  els.marketHeatmap.innerHTML = labels
    .map((label, row) => {
      const cells = Array.from({ length: 14 }, (_, column) => {
        const level = levels[(row * 7 + column * 3) % levels.length];
        return `<i data-level="${level}" title="${label} · day ${column + 1}"></i>`;
      }).join("");
      return `<span>${label}</span><div>${cells}</div>`;
    })
    .join("");
}

function renderMarketInterval(interval = state.activeMarketInterval) {
  const config = marketIntervalConfig[interval] || marketIntervalConfig.realtime;
  state.activeMarketInterval = interval;
  els.marketIntervalButtons.forEach((button) => {
    const active = button.dataset.marketInterval === interval;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.marketChartTitle.textContent = config.title;
  els.marketChartSubtitle.textContent = config.subtitle;
  els.marketSeriesNote.textContent = config.note;
  setMarketView("chart");

  const width = 1000;
  const height = 300;
  const plot = { left: 66, right: 22, top: 30, bottom: 42 };
  const values = config.values;
  const maxValue = Math.max(50, Math.ceil(Math.max(...values, 1) / 50) * 50);
  const xFor = (index) => plot.left + (index / Math.max(values.length - 1, 1)) * (width - plot.left - plot.right);
  const yFor = (value) => plot.top + (1 - value / maxValue) * (height - plot.top - plot.bottom);
  const grid = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const y = plot.top + ratio * (height - plot.top - plot.bottom);
    const value = Math.round(maxValue * (1 - ratio));
    return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text x="${plot.left - 16}" y="${y + 4}" text-anchor="end">${value}</text>`;
  }).join("");
  const points = values.map((value, index) => `${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`).join(" ");
  const baseline = height - plot.bottom;
  const areaPath = `M${xFor(0).toFixed(1)},${baseline} L${points.replaceAll(" ", " L")} L${xFor(values.length - 1).toFixed(1)},${baseline} Z`;
  const averageValue = average(values) || 0;
  const averageY = yFor(averageValue);
  const ticks = config.tickIndexes.map((index, tickIndex) => `<text x="${xFor(index)}" y="${height - 13}" text-anchor="middle">${config.tickLabels[tickIndex]}</text>`).join("");
  els.marketChartInteractive.innerHTML = `
    <svg class="engineering-chart market-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${escapeHtml(config.title)}">
      <g class="chart-gridlines market-generated-grid">${grid}</g>
      <path class="chart-area amber" d="${areaPath}"></path>
      <polyline class="chart-line amber" points="${points}"></polyline>
      <line class="average-line" x1="${plot.left}" x2="${width - plot.right}" y1="${averageY}" y2="${averageY}"></line>
      <g class="chart-axis">${ticks}</g>
    </svg>
    <div class="market-crosshair"></div>
    <div class="market-tooltip"><strong>-- S$/MWh</strong><span>--</span><small>--</small></div>
  `;
  bindMarketChartInteraction(config, interval === "realtime" ? 34 : values.length - 1);
}

function bindMarketChartInteraction(config, initialIndex) {
  const frame = els.marketChartInteractive;
  const crosshair = frame?.querySelector(".market-crosshair");
  const tooltip = frame?.querySelector(".market-tooltip");
  if (!frame || !crosshair || !tooltip) return;
  const values = config.values;
  const update = (ratio) => {
    const clamped = Math.min(Math.max(ratio, 0.02), 0.98);
    const index = Math.round(clamped * (values.length - 1));
    const value = values[index];
    crosshair.style.left = `${(clamped * 100).toFixed(1)}%`;
    tooltip.style.left = `${Math.min(Math.max(clamped * 100 + (clamped > 0.72 ? -18 : 1), 3), 82)}%`;
    tooltip.querySelector("strong").textContent = `${formatNumber(value, 1)} S$/MWh`;
    tooltip.querySelector("span").textContent = config.tooltipLabel(index);
    tooltip.querySelector("small").textContent = `${formatNumber(value / 10, 2)} cents/kWh · provisional`;
  };
  frame.addEventListener("pointermove", (event) => {
    const bounds = frame.getBoundingClientRect();
    update((event.clientX - bounds.left) / bounds.width);
  });
  const initialRatio = initialIndex / Math.max(values.length - 1, 1);
  frame.addEventListener("pointerleave", () => update(initialRatio));
  update(initialRatio);
}

function singaporeWeatherDate(value) {
  if (!value) return null;
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}:00+08:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function compassDirection(degrees) {
  if (!Number.isFinite(degrees)) return "--";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(((degrees % 360) + 360) % 360 / 45) % directions.length];
}

function estimatedWbgt(tempC, wetBulbC) {
  if (!Number.isFinite(tempC) || !Number.isFinite(wetBulbC)) return null;
  return 0.7 * wetBulbC + 0.3 * tempC;
}

function weatherCodeLabel(code) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Haze / fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Variable";
}

function weatherPeriodLabel(period) {
  return period === "24h" ? "Last 24 hours" : period === "30d" ? "Last 30 days" : "Last 7 days";
}

function weatherAxisLabel(date, period, detailed = false) {
  if (!(date instanceof Date)) return "--";
  if (period === "yearly") {
    return new Intl.DateTimeFormat("en-SG", { month: "short", ...(detailed ? { year: "numeric" } : {}), timeZone: "Asia/Singapore" }).format(date);
  }
  if (period === "24h") {
    return new Intl.DateTimeFormat("en-SG", { hour: "2-digit", minute: detailed ? "2-digit" : undefined, hour12: false, timeZone: "Asia/Singapore" }).format(date);
  }
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    ...(detailed && period !== "30d" ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
    timeZone: "Asia/Singapore",
  }).format(date);
}

function aggregateDailyWeather(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Singapore" }).format(row.time);
    const group = groups.get(key) || [];
    group.push(row);
    groups.set(key, group);
  });
  return [...groups.values()].map((group) => ({
    time: group[Math.floor(group.length / 2)].time,
    tempC: average(group.map((row) => row.tempC)),
    humidityPct: average(group.map((row) => row.humidityPct)),
    wetBulbC: average(group.map((row) => row.wetBulbC)),
    windDirection: circularDirectionMean(group.map((row) => row.windDirection)),
    weatherCode: group[Math.floor(group.length / 2)].weatherCode,
  }));
}

function circularDirectionMean(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  const vectors = valid.reduce((sum, value) => {
    const radians = (((value % 360) + 360) % 360) * Math.PI / 180;
    return { x: sum.x + Math.cos(radians), y: sum.y + Math.sin(radians) };
  }, { x: 0, y: 0 });
  if (Math.hypot(vectors.x, vectors.y) < 1e-9) return null;
  return ((Math.atan2(vectors.y, vectors.x) * 180 / Math.PI) + 360) % 360;
}

function weatherRowsForPeriod(data, period = state.activeWeatherPeriod) {
  const hours = period === "24h" ? 24 : period === "30d" ? 24 * 30 : 24 * 7;
  const cutoff = data.currentTime.getTime() - hours * 3_600_000;
  const filtered = data.history.filter((row) => row.time.getTime() >= cutoff && row.time <= data.currentTime);
  if (period === "30d") return aggregateDailyWeather(filtered).slice(-30);
  if (period === "7d") return filtered.filter((_, index) => index % 3 === 0 || index === filtered.length - 1);
  return filtered;
}

async function loadWeatherYear() {
  if (state.weatherYearPromise) return state.weatherYearPromise;
  state.weatherYearError = "";
  state.weatherYearPromise = (async () => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const year = today.slice(0, 4);
    // ERA5 archives have a five-day delay; exclude incomplete days.
    const end = new Date(`${today}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 6);
    const endDate = end.toISOString().slice(0, 10);
    if (endDate < `${year}-01-01`) throw new Error("This year's historical data is not published yet.");
    const params = new URLSearchParams({
      latitude: String(weatherDashboardConfig.latitude), longitude: String(weatherDashboardConfig.longitude),
      timezone: weatherDashboardConfig.timezone, start_date: `${year}-01-01`, end_date: endDate,
      daily: "temperature_2m_mean,relative_humidity_2m_mean,wet_bulb_temperature_2m_mean,wind_direction_10m_dominant", models: "era5",
    });
    const response = await fetch(`${weatherDashboardConfig.archiveUrl}?${params}`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Historical weather returned HTTP ${response.status}.`);
    const payload = await response.json();
    const groups = new Map();
    let lastDate = "";
    (payload.daily?.time || []).forEach((date, index) => {
      const tempC = payload.daily.temperature_2m_mean?.[index];
      const humidityPct = payload.daily.relative_humidity_2m_mean?.[index];
      const wetBulbC = payload.daily.wet_bulb_temperature_2m_mean?.[index];
      const windDirection = payload.daily.wind_direction_10m_dominant?.[index];
      if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct)) return;
      const key = date.slice(0, 7);
      const group = groups.get(key) || [];
      group.push({ tempC, humidityPct, wetBulbC, windDirection });
      groups.set(key, group);
      lastDate = date;
    });
    const rows = [...groups.entries()].map(([month, days]) => ({
      time: singaporeWeatherDate(`${month}-01T12:00`),
      tempC: average(days.map((day) => day.tempC)),
      humidityPct: average(days.map((day) => day.humidityPct)),
      wetBulbC: average(days.map((day) => day.wetBulbC).filter(Number.isFinite)),
      windDirection: circularDirectionMean(days.map((day) => day.windDirection)),
      sampleDays: days.length,
      partial: days.length < new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate(),
    }));
    if (!rows.length) throw new Error("No historical observations are available for this year.");
    state.weatherYearData = { year, lastDate, rows };
  })().catch((error) => {
    state.weatherYearError = error.message || "Historical data is temporarily unavailable.";
  }).finally(() => {
    state.weatherYearPromise = null;
    renderWeatherPeriodChart();
  });
  return state.weatherYearPromise;
}

function renderWeatherPeriodChart() {
  if (window.NUSStationWeather.isActive()) return window.NUSStationWeather.render();
  const charts = [
    ["thermal", els.weatherChartTitle, els.weatherChartSubtitle, els.weatherThermalChart, renderWeatherThermalChart, "Thermal conditions"],
    ["heat", els.weatherHeatTitle, els.weatherHeatSubtitle, els.weatherHeatChart, renderWeatherHeatChart, "Estimated WBGT"],
    ["wind", els.weatherWindTitle, els.weatherWindSubtitle, els.weatherWindChart, renderWeatherWindChart, "Wind direction"],
  ];
  charts.forEach(([key, title, subtitle, frame, render, label]) => {
    const period = state.weatherPeriods[key];
    const name = period === "yearly" ? "Yearly" : period === "30d" ? "Monthly" : "Weekly";
    title.textContent = `${label} · ${name}`;
    frame.closest("article").querySelectorAll("[data-weather-period]").forEach(button => {
      const active = button.dataset.weatherPeriod === period;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (period === "yearly") {
      const archive = state.weatherYearData;
      subtitle.textContent = archive
        ? `Jan–${weatherAxisLabel(archive.rows.at(-1).time, period)} ${archive.year} · ${archive.rows.length} monthly averages · year to date`
        : "Year to date · one point per month";
      if (archive) render(archive.rows, period);
      else if (state.weatherYearError) {
        frame.innerHTML = `<div class="weather-empty"><strong>Historical weather unavailable</strong><span>${escapeHtml(state.weatherYearError)}</span></div><button type="button" class="nems-refresh" data-weather-year-retry>Try again</button>`;
        frame.querySelector("[data-weather-year-retry]").addEventListener("click", () => { loadWeatherYear(); renderWeatherPeriodChart(); });
      } else frame.innerHTML = '<div class="weather-loading">Loading this year’s historical weather…</div>';
      return;
    }
    if (!state.weatherData) return;
    const rows = weatherRowsForPeriod(state.weatherData, period);
    const aggregation = period === "30d" ? `${rows.length} daily averages` : "one point every 3 hours";
    const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
    const dates = rows.length ? dateFormat.formatRange(rows[0].time, rows.at(-1).time) : "No data";
    subtitle.textContent = `${dates} · ${aggregation} · ${weatherPeriodLabel(period).toLowerCase()}`;
    render(rows, period);
  });
}

function weatherDeltaText(current, previous, unit, digits = 1) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return "No comparison available";
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return `Stable vs 24h · ${unit}`;
  return `${delta > 0 ? "Up" : "Down"} ${formatNumber(Math.abs(delta), digits)}${unit} vs 24h`;
}

function weatherHeatLevel(value) {
  if (!Number.isFinite(value)) return { label: "Unavailable", className: "" };
  if (value < 27) return { label: "Low", className: "good" };
  if (value < 30) return { label: "Elevated", className: "partial" };
  return { label: "High", className: "high" };
}

async function loadWeatherDashboard({ force = false } = {}) {
  if (window.NUSStationWeather.isActive()) return window.NUSStationWeather.load(state.activeWeatherPeriod, force);
  if (state.weatherData && !force) {
    renderWeatherDashboard();
    return state.weatherData;
  }
  if (state.weatherLoadPromise && !force) return state.weatherLoadPromise;
  if (els.weatherSourceStatus) els.weatherSourceStatus.innerHTML = '<span class="status-dot loading"></span>Loading weather source';

  state.weatherLoadPromise = (async () => {
    const params = new URLSearchParams({
      latitude: String(weatherDashboardConfig.latitude),
      longitude: String(weatherDashboardConfig.longitude),
      timezone: weatherDashboardConfig.timezone,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_direction_10m",
      hourly: "temperature_2m,relative_humidity_2m,wet_bulb_temperature_2m,wind_direction_10m,weather_code",
      past_days: "30",
      forecast_days: "2",
    });
    const response = await fetch(`${weatherDashboardConfig.url}?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
    const payload = await response.json();
    const currentTime = singaporeWeatherDate(payload.current?.time) || new Date();
    const times = payload.hourly?.time || [];
    const rows = times.map((time, index) => ({
      time: singaporeWeatherDate(time),
      tempC: Number(payload.hourly?.temperature_2m?.[index]),
      humidityPct: Number(payload.hourly?.relative_humidity_2m?.[index]),
      wetBulbC: Number(payload.hourly?.wet_bulb_temperature_2m?.[index]),
      windDirection: Number(payload.hourly?.wind_direction_10m?.[index]),
      weatherCode: Number(payload.hourly?.weather_code?.[index]),
    })).filter((row) => row.time && Number.isFinite(row.tempC) && Number.isFinite(row.humidityPct));
    const nearest = [...rows].sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime))[0];
    const current = {
      time: currentTime,
      tempC: Number(payload.current?.temperature_2m),
      humidityPct: Number(payload.current?.relative_humidity_2m),
      apparentTempC: Number(payload.current?.apparent_temperature),
      windDirection: Number(payload.current?.wind_direction_10m),
      wetBulbC: nearest?.wetBulbC,
    };
    current.wbgtC = estimatedWbgt(current.tempC, current.wetBulbC);
    state.weatherData = {
      current,
      currentTime,
      history: rows.filter((row) => row.time <= currentTime),
      forecast: rows.filter((row) => row.time > currentTime).slice(0, 24),
    };
    renderWeatherDashboard();
    return state.weatherData;
  })().catch((error) => {
    console.error(error);
    if (window.NUSStationWeather.isActive()) return null;
    if (els.weatherSourceStatus) els.weatherSourceStatus.innerHTML = '<span class="status-dot error"></span>Weather source unavailable';
    if (els.weatherUpdated) els.weatherUpdated.textContent = "Retry on next visit";
    [els.weatherThermalChart, els.weatherHeatChart, els.weatherWindChart, els.weatherForecast].forEach((element) => {
      if (element) element.innerHTML = '<div class="weather-empty"><strong>Weather data unavailable</strong><span>The public source did not return a valid response.</span></div>';
    });
    return null;
  }).finally(() => {
    state.weatherLoadPromise = null;
  });
  return state.weatherLoadPromise;
}

function renderWeatherThermalChart(rows, period) {
  if (!els.weatherThermalChart || !rows.length) return;
  const width = Math.max(460, els.weatherThermalChart.clientWidth - 20);
  const height = Math.max(310, Math.min(430, width * 0.55));
  const plot = { left: 58, right: 62, top: 28, bottom: 45 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const temperatures = rows.map((row) => row.tempC).filter(Number.isFinite);
  const humidities = rows.map((row) => row.humidityPct).filter(Number.isFinite);
  const tempMin = Math.floor(Math.min(...temperatures) - 1);
  const tempMax = Math.ceil(Math.max(...temperatures) + 1);
  const humidityMin = Math.max(0, Math.floor((Math.min(...humidities) - 5) / 10) * 10);
  const humidityMax = Math.min(100, Math.ceil((Math.max(...humidities) + 5) / 10) * 10);
  const xFor = (index) => plot.left + (index / Math.max(rows.length - 1, 1)) * plotWidth;
  const yTemp = (value) => plot.top + (1 - (value - tempMin) / Math.max(tempMax - tempMin, 1)) * plotHeight;
  const yHumidity = (value) => plot.top + (1 - (value - humidityMin) / Math.max(humidityMax - humidityMin, 1)) * plotHeight;
  const tempPoints = rows.map((row, index) => `${xFor(index).toFixed(1)},${yTemp(row.tempC).toFixed(1)}`).join(" ");
  const humidityPoints = rows.map((row, index) => `${xFor(index).toFixed(1)},${yHumidity(row.humidityPct).toFixed(1)}`).join(" ");
  const grid = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const y = plot.top + ratio * plotHeight;
    const temp = tempMax - ratio * (tempMax - tempMin);
    const humidity = humidityMax - ratio * (humidityMax - humidityMin);
    return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text x="${plot.left - 12}" y="${y + 4}" text-anchor="end">${formatNumber(temp, 0)}°</text><text x="${width - plot.right + 12}" y="${y + 4}">${formatNumber(humidity, 0)}%</text>`;
  }).join("");
  const tickIndexes = period === "yearly"
    ? rows.map((_, index) => index)
    : [...new Set(Array.from({ length: 6 }, (_, index) => Math.round(index * (rows.length - 1) / 5)) )];
  const ticks = tickIndexes.map((index) => `<text x="${xFor(index)}" y="${height - 14}" text-anchor="middle">${weatherAxisLabel(rows[index].time, period)}</text>`).join("");
  const hits = rows.map((_, index) => {
    const start = index === 0 ? plot.left : (xFor(index - 1) + xFor(index)) / 2;
    const end = index === rows.length - 1 ? width - plot.right : (xFor(index) + xFor(index + 1)) / 2;
    return `<rect class="weather-chart-hit" data-weather-index="${index}" x="${start}" y="${plot.top}" width="${Math.max(1, end - start)}" height="${plotHeight}" tabindex="0" aria-label="Inspect ${escapeHtml(weatherAxisLabel(rows[index].time, period, true))}"></rect>`;
  }).join("");
  els.weatherThermalChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Temperature and humidity time series">
      <text class="weather-axis-unit" x="${plot.left}" y="14">Temperature °C</text><text class="weather-axis-unit right" x="${width - plot.right}" y="14">Relative humidity %</text>
      <g class="weather-chart-grid">${grid}</g><g class="weather-chart-axis">${ticks}</g>
      <polyline class="weather-series temperature" points="${tempPoints}"></polyline>
      <polyline class="weather-series humidity" points="${humidityPoints}"></polyline>
      ${rows.map((row, index) => `<circle class="weather-mean-dot temperature" cx="${xFor(index)}" cy="${yTemp(row.tempC)}" r="3"></circle><circle class="weather-mean-dot humidity" cx="${xFor(index)}" cy="${yHumidity(row.humidityPct)}" r="3"></circle>`).join("")}
      <line class="weather-hover-line" y1="${plot.top}" y2="${height - plot.bottom}" hidden></line>
      <circle class="weather-hover-dot temperature" r="5" hidden></circle><circle class="weather-hover-dot humidity" r="5" hidden></circle>
      <g>${hits}</g>
    </svg>
    <div class="weather-chart-tooltip" role="status" hidden></div>
    <p class="weather-chart-note">${period === "yearly" ? `Source: Open-Meteo / ERA5 historical estimates · through ${escapeHtml(state.weatherYearData.lastDate)}${rows.at(-1)?.partial ? " · latest month is partial" : ""}` : "Source: Open-Meteo · Singapore time (SGT)"}</p>
  `;
  bindWeatherThermalInteraction({ rows, period, width, xFor, yTemp, yHumidity });
}

function bindWeatherThermalInteraction({ rows, period, width, xFor, yTemp, yHumidity }) {
  const frame = els.weatherThermalChart;
  const tooltip = frame.querySelector(".weather-chart-tooltip");
  const line = frame.querySelector(".weather-hover-line");
  const tempDot = frame.querySelector(".weather-hover-dot.temperature");
  const humidityDot = frame.querySelector(".weather-hover-dot.humidity");
  const hide = () => { tooltip.hidden = true; line.hidden = true; tempDot.hidden = true; humidityDot.hidden = true; };
  const show = (index) => {
    const row = rows[index];
    const x = xFor(index);
    line.setAttribute("x1", x); line.setAttribute("x2", x); line.hidden = false;
    tempDot.setAttribute("cx", x); tempDot.setAttribute("cy", yTemp(row.tempC)); tempDot.hidden = false;
    humidityDot.setAttribute("cx", x); humidityDot.setAttribute("cy", yHumidity(row.humidityPct)); humidityDot.hidden = false;
    const detail = period === "yearly" ? `Monthly average · ${row.sampleDays} ${row.sampleDays === 1 ? "day" : "days"}${row.partial ? " · partial month" : ""}` : period === "30d" ? "Daily average" : "3-hour sample";
    tooltip.innerHTML = `<header>${weatherAxisLabel(row.time, period, true)}</header><div><span><i class="temperature"></i>Temperature</span><strong>${formatNumber(row.tempC, 1)} °C</strong></div><div><span><i class="humidity"></i>Humidity</span><strong>${formatNumber(row.humidityPct, 0)} %RH</strong></div><small>${detail}</small>`;
    tooltip.hidden = false;
    const pixelX = (x / width) * frame.clientWidth;
    tooltip.style.left = `${Math.max(112, Math.min(frame.clientWidth - 112, pixelX))}px`;
    tooltip.classList.toggle("align-right", pixelX > frame.clientWidth * 0.78);
  };
  frame.querySelectorAll("[data-weather-index]").forEach((hit) => {
    const index = Number(hit.dataset.weatherIndex);
    hit.addEventListener("pointerenter", () => show(index));
    hit.addEventListener("pointermove", () => show(index));
    hit.addEventListener("focus", () => show(index));
    hit.addEventListener("blur", hide);
  });
  frame.addEventListener("pointerleave", hide);
}

function renderWeatherHeatChart(rows, period) {
  renderWeatherSingleSeries(els.weatherHeatChart, rows, period, {
    name: "Estimated WBGT", unit: "°C", className: "wbgt", digits: 1,
    value: (row) => estimatedWbgt(row.tempC, row.wetBulbC),
    describe: (value) => `${formatNumber(value, 1)} °C · ${weatherHeatLevel(value).label}`,
  });
}

function renderWeatherWindChart(rows, period) {
  renderWeatherSingleSeries(els.weatherWindChart, rows, period, {
    name: "Wind direction", unit: "°", className: "wind", digits: 0, min: 0, max: 360,
    value: (row) => Number.isFinite(row.windDirection) ? ((row.windDirection % 360) + 360) % 360 : null,
    describe: (value) => `${formatNumber(value, 0)}° ${compassDirection(value)}`,
  });
}

function renderWeatherSingleSeries(frame, rows, period, config) {
  if (!frame || !rows.length) return;
  const values = rows.map(config.value);
  const finite = values.filter(Number.isFinite);
  if (!finite.length) {
    frame.innerHTML = '<div class="weather-empty"><strong>No reported data</strong><span>No usable values are available for this period.</span></div>';
    return;
  }
  const width = Math.max(460, frame.clientWidth - 20);
  const height = Math.max(290, Math.min(390, width * 0.48));
  const plot = { left: 58, right: 28, top: 28, bottom: 45 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const min = Number.isFinite(config.min) ? config.min : Math.floor(Math.min(...finite) - 1);
  const max = Number.isFinite(config.max) ? config.max : Math.ceil(Math.max(...finite) + 1);
  const xFor = (index) => plot.left + index / Math.max(rows.length - 1, 1) * plotWidth;
  const yFor = (value) => plot.top + (1 - (value - min) / Math.max(max - min, 1)) * plotHeight;
  const points = values.map((value, index) => Number.isFinite(value) ? `${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}` : "").filter(Boolean).join(" ");
  const grid = Array.from({ length: 5 }, (_, index) => {
    const value = max - index / 4 * (max - min);
    const y = yFor(value);
    return `<line x1="${plot.left}" x2="${width - plot.right}" y1="${y}" y2="${y}"></line><text x="${plot.left - 12}" y="${y + 4}" text-anchor="end">${formatNumber(value, config.digits)}${config.unit}</text>`;
  }).join("");
  const tickIndexes = period === "yearly" ? rows.map((_, index) => index)
    : [...new Set(Array.from({ length: 6 }, (_, index) => Math.round(index * (rows.length - 1) / 5)))];
  const ticks = tickIndexes.map((index) => `<text x="${xFor(index)}" y="${height - 14}" text-anchor="middle">${weatherAxisLabel(rows[index].time, period)}</text>`).join("");
  const hits = rows.map((row, index) => {
    if (!Number.isFinite(values[index])) return "";
    const start = index === 0 ? plot.left : (xFor(index - 1) + xFor(index)) / 2;
    const end = index === rows.length - 1 ? width - plot.right : (xFor(index) + xFor(index + 1)) / 2;
    return `<rect class="weather-chart-hit" data-weather-single-index="${index}" x="${start}" y="${plot.top}" width="${Math.max(1, end - start)}" height="${plotHeight}" tabindex="0" aria-label="Inspect ${escapeHtml(weatherAxisLabel(row.time, period, true))}"></rect>`;
  }).join("");
  const source = period === "yearly"
    ? `Source: Open-Meteo / ERA5 historical estimates · through ${escapeHtml(state.weatherYearData.lastDate)}${rows.at(-1)?.partial ? " · latest month is partial" : ""}`
    : "Source: Open-Meteo · Singapore time (SGT)";
  frame.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(config.name)} time series">
    <text class="weather-axis-unit" x="${plot.left}" y="14">${escapeHtml(config.name)} ${escapeHtml(config.unit)}</text>
    <g class="weather-chart-grid">${grid}</g><g class="weather-chart-axis">${ticks}</g>
    <polyline class="weather-series ${config.className}" points="${points}"></polyline>
    ${values.map((value, index) => Number.isFinite(value) ? `<circle class="weather-mean-dot ${config.className}" cx="${xFor(index)}" cy="${yFor(value)}" r="3"></circle>` : "").join("")}
    <line class="weather-hover-line" y1="${plot.top}" y2="${height - plot.bottom}" hidden></line><circle class="weather-hover-dot ${config.className}" r="5" hidden></circle>
    <g>${hits}</g></svg><div class="weather-chart-tooltip" role="status" hidden></div><p class="weather-chart-note">${source}</p>`;
  const tooltip = frame.querySelector(".weather-chart-tooltip");
  const line = frame.querySelector(".weather-hover-line");
  const dot = frame.querySelector(".weather-hover-dot");
  const hide = () => { tooltip.hidden = true; line.hidden = true; dot.hidden = true; };
  const show = (index) => {
    const x = xFor(index), value = values[index];
    line.setAttribute("x1", x); line.setAttribute("x2", x); line.hidden = false;
    dot.setAttribute("cx", x); dot.setAttribute("cy", yFor(value)); dot.hidden = false;
    const detail = period === "yearly" ? `Monthly average · ${rows[index].sampleDays} days${rows[index].partial ? " · partial month" : ""}` : period === "30d" ? "Daily average" : "3-hour sample";
    tooltip.innerHTML = `<header>${weatherAxisLabel(rows[index].time, period, true)}</header><div><span><i class="${config.className}"></i>${escapeHtml(config.name)}</span><strong>${escapeHtml(config.describe(value))}</strong></div><small>${detail}</small>`;
    tooltip.hidden = false;
    const pixelX = x / width * frame.clientWidth;
    tooltip.style.left = `${Math.max(112, Math.min(frame.clientWidth - 112, pixelX))}px`;
    tooltip.classList.toggle("align-right", pixelX > frame.clientWidth * 0.78);
  };
  frame.querySelectorAll("[data-weather-single-index]").forEach((hit) => {
    const index = Number(hit.dataset.weatherSingleIndex);
    hit.addEventListener("pointerenter", () => show(index));
    hit.addEventListener("pointermove", () => show(index));
    hit.addEventListener("focus", () => show(index));
    hit.addEventListener("blur", hide);
  });
  frame.addEventListener("pointerleave", hide);
}

function renderWeatherForecast(rows) {
  if (!els.weatherForecast) return;
  if (!rows.length) {
    els.weatherForecast.innerHTML = '<div class="weather-empty"><strong>Forecast unavailable</strong><span>No future periods were returned.</span></div>';
    return;
  }
  const groups = Array.from({ length: 4 }, (_, index) => rows.slice(index * 6, index * 6 + 6)).filter((group) => group.length);
  els.weatherForecast.innerHTML = groups.map((group) => {
    const first = group[0];
    const last = group.at(-1);
    const temps = group.map((row) => row.tempC);
    const humidities = group.map((row) => row.humidityPct);
    const codes = group.map((row) => row.weatherCode);
    const code = codes.sort((a, b) => codes.filter((item) => item === a).length - codes.filter((item) => item === b).length).at(-1);
    const time = `${weatherAxisLabel(first.time, "24h")}–${weatherAxisLabel(new Date(last.time.getTime() + 3_600_000), "24h")}`;
    return `<div class="weather-forecast-row"><time>${time}</time><div><strong>${escapeHtml(weatherCodeLabel(code))}</strong><span>${formatNumber(Math.min(...temps), 0)}–${formatNumber(Math.max(...temps), 0)} °C</span></div><dl><div><dt>Humidity</dt><dd>${formatNumber(average(humidities), 0)}%</dd></div><div><dt>Wind</dt><dd>${compassDirection(average(group.map((row) => row.windDirection)))}</dd></div></dl></div>`;
  }).join("");
}

function renderWeatherDashboard() {
  if (window.NUSStationWeather.isActive()) return;
  const data = state.weatherData;
  if (!data) return;
  const current = data.current;
  const prior = [...data.history].reverse().find((row) => row.time <= new Date(data.currentTime.getTime() - 23 * 3_600_000));
  const heat = weatherHeatLevel(current.wbgtC);
  if (els.weatherSourceStatus) els.weatherSourceStatus.innerHTML = '<span class="status-dot live"></span>Open-Meteo · live';
  if (els.weatherUpdated) els.weatherUpdated.textContent = `Updated ${new Intl.DateTimeFormat("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Singapore" }).format(current.time)} SGT`;
  els.weatherTemperature.textContent = `${formatNumber(current.tempC, 1)} °C`;
  els.weatherTemperatureMeta.textContent = weatherDeltaText(current.tempC, prior?.tempC, " °C");
  els.weatherHumidity.textContent = `${formatNumber(current.humidityPct, 0)} %`;
  els.weatherHumidityMeta.textContent = weatherDeltaText(current.humidityPct, prior?.humidityPct, " pp", 0);
  els.weatherHeatStress.textContent = `${formatNumber(current.wbgtC, 1)} °C`;
  els.weatherHeatStressMeta.textContent = `${heat.label} · estimated in shade`;
  els.weatherWind.textContent = `${formatNumber(current.windDirection, 0)}° ${compassDirection(current.windDirection)}`;
  els.weatherWindMeta.textContent = `Feels like ${formatNumber(current.apparentTempC, 1)} °C`;
  renderWeatherPeriodChart();
}

function setWeatherPeriod(period, chartKey) {
  if (chartKey) state.weatherPeriods[chartKey] = ["7d", "30d", "yearly"].includes(period) ? period : "7d";
  if (window.NUSStationWeather.isActive()) { window.NUSStationWeather.load(); return; }
  if (Object.values(state.weatherPeriods).includes("yearly") && !state.weatherYearData) loadWeatherYear();
  renderWeatherPeriodChart();
}

function bindControls() {
  document.getElementById("weatherLocation").addEventListener("change", (event) => {
    window.NUSStationWeather.select(event.target.value);
    loadWeatherDashboard();
    setWeatherPeriod(state.activeWeatherPeriod);
  });
  els.tabButtons.forEach((button) => button.addEventListener("click", () => activateTab(button.dataset.tab)));
  els.weatherPeriodButtons.forEach((button) => button.addEventListener("click", () => setWeatherPeriod(button.dataset.weatherPeriod, button.closest("[data-weather-chart]").dataset.weatherChart)));
  els.overviewBuildingPerformance?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-performance-building]");
    if (!button) return;
    const code = button.dataset.performanceBuilding;
    const feature = state.displayFeatures.find((item) => String(item.properties.short_name || "").toUpperCase() === code);
    if (!feature) return;
    selectBuilding(feature);
    zoomToFeature(feature, 17);
  });
  els.buildingPeriodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-building-chart]");
      state.buildingPeriods[card.dataset.buildingChart] = button.dataset.buildingPeriod;
      renderBuildingMetricChart(card);
    });
  });
  els.marketViewButtons.forEach((button) => button.addEventListener("click", () => setMarketView(button.dataset.marketView)));
  els.marketIntervalButtons.forEach((button) => button.addEventListener("click", () => renderMarketInterval(button.dataset.marketInterval)));
  els.nemsRefresh?.addEventListener("click", () => loadNemsMarket({ force: true }));
  els.nemsProductSelect?.addEventListener("change", (event) => selectNemsProduct(event.target.value));
  els.nemsViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setNemsView(button.dataset.nemsView);
      loadNemsMarket();
    });
  });
  els.externalDataButtons.forEach((button) => {
    button.addEventListener("click", () => renderExternalDataPanel(button.dataset.external));
  });
  els.externalContextClose?.addEventListener("click", () => setExternalPanelOpen(false));
  els.aiHealthRefresh?.addEventListener("click", () => {
    state.aiHealthCache = null;
    renderAiHealthMonitor({ force: true });
  });
  els.aiAgentPromptForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = els.aiAgentPromptInput?.value || "";
    submitAiAgentPrompt(prompt);
    if (els.aiAgentPromptInput) els.aiAgentPromptInput.value = "";
  });
  els.aiAgentSuggestions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-agent-prompt]");
    if (!button) return;
    submitAiAgentPrompt(button.dataset.agentPrompt);
  });
  els.metricButtons.forEach((button) => button.addEventListener("click", () => updateMetric(button.dataset.metric)));
  els.toggleBuildings.addEventListener("change", (event) => {
    setLayerVisibility(["buildings-fill", "buildings-outline", "buildings-extrusion"], event.target.checked);
  });
  els.toggleLabels.addEventListener("change", (event) => {
    setLayerVisibility(
      [
        "region-area-fill",
        "region-area-outline",
        "zone-marker-outer",
        "zone-marker-middle",
        "zone-marker-halo",
        "zone-marker-dot",
        "zone-count-label",
        "zone-label",
        "priority-marker-halo",
        "priority-marker-dot",
        "priority-marker-label",
        "building-marker-halo",
        "building-marker-dot",
        "building-marker-label",
        "building-name-label",
      ],
      event.target.checked,
    );
  });
  els.toggleEuiLayer.addEventListener("change", (event) => {
    setLayerVisibility(["eui-context-fill", "eui-context-outline"], event.target.checked);
    updateMetric(state.metric);
  });
  els.buildingSelect.addEventListener("change", (event) => {
    const feature = visibleFeatures().find((item) =>
      String(item.properties.short_name || "").toUpperCase() === event.target.value);
    if (feature) selectBuilding(feature);
  });
  els.campusView.addEventListener("click", () => {
    closeTrendModal();
    closeBrickModal();
    fitCampus();
  });
  els.mapRealtimeView?.addEventListener("click", () => {
    if (els.trendModal?.classList.contains("hidden")) openTrendModal(state.activeHistoryKey || "electricity");
    else closeTrendModal();
  });
  els.mapBrickView?.addEventListener("click", () => {
    if (els.brickModal?.classList.contains("hidden")) openBrickModal();
    else closeBrickModal();
  });
  els.trendPlaceSelect?.addEventListener("change", (event) => {
    state.activeRealtimeBuilding = event.target.value;
    renderTrendChart(state.activeHistoryKey || "electricity");
  });
  els.brickPlaceSelect?.addEventListener("change", (event) => {
    state.activeBrickBuilding = event.target.value;
    state.activeBrickNodeId = "sde4";
    renderBrickGraph();
  });
  els.trendClose?.addEventListener("click", closeTrendModal);
  els.brickClose?.addEventListener("click", closeBrickModal);
  els.trendModal?.addEventListener("click", (event) => {
    if (event.target === els.trendModal) closeTrendModal();
  });
  els.brickModal?.addEventListener("click", (event) => {
    if (event.target === els.brickModal) closeBrickModal();
  });
  els.trendTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-key]");
    if (button) renderTrendChart(button.dataset.historyKey);
  });
  els.brickGraph?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-brick-node]");
    if (!button) return;
    state.activeBrickNodeId = button.dataset.brickNode;
    renderBrickGraph();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.trendModal?.classList.contains("hidden")) closeTrendModal();
    if (event.key === "Escape" && !els.brickModal?.classList.contains("hidden")) closeBrickModal();
  });
  els.resetToken?.addEventListener("click", () => {
    localStorage.removeItem("nus-emis-mapbox-token");
    window.location.reload();
  });
}

function fallBackToDefaultMapboxToken() {
  if (state.mapAuthFallbackInProgress) return;
  if (!defaultMapboxPublicToken) {
    showTokenPanel("No site Mapbox token is configured. Paste a temporary public token to load the map.");
    return;
  }
  state.mapAuthFallbackInProgress = true;
  localStorage.removeItem("nus-emis-mapbox-token");
  setRealtimeStatus("loading", "Using site Mapbox token");
  initMap(defaultMapboxPublicToken, "fallback").catch((error) => {
    console.error(error);
    state.mapAuthFallbackInProgress = false;
    showTokenPanel(
      error.message || "The configured site Mapbox token failed. Ask the site owner to check token restrictions.",
    );
  });
}

class MapCameraControl {
  onAdd(map) {
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group map-camera-controls";
    const actions = [
      ["Rotate left 15°", "↶", () => ({ bearing: map.getBearing() - 15 })],
      ["Rotate right 15°", "↷", () => ({ bearing: map.getBearing() + 15 })],
      ["Increase pitch 10°", "⌃", () => ({ pitch: Math.min(map.getMaxPitch(), map.getPitch() + 10) })],
      ["Decrease pitch 10°", "⌄", () => ({ pitch: Math.max(map.getMinPitch(), map.getPitch() - 10) })],
    ];
    actions.forEach(([label, icon, camera]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.title = label;
      button.setAttribute("aria-label", label);
      button.textContent = icon;
      button.addEventListener("click", () => map.easeTo({ ...camera(), duration: 250 }));
      this.container.append(button);
    });
    return this.container;
  }

  onRemove() {
    this.container.remove();
  }
}

async function initMap(token, tokenSource = "default") {
  if (typeof mapboxgl === "undefined") {
    throw new Error("Mapbox GL could not be loaded. Refresh the page and try again.");
  }

  state.activeMapboxToken = token;
  state.activeMapboxTokenSource = tokenSource;
  window.clearInterval(state.refreshTimer);
  if (state.map) {
    state.map.remove();
    state.map = null;
  }

  hideTokenPanel();
  await loadData();

  mapboxgl.accessToken = token;
  state.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v11",
    center: [103.776, 1.2987],
    zoom: 15.05,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
  });

  state.map.addControl(new mapboxgl.AttributionControl({
    compact: false,
    customAttribution: '<a class="lab-attribution" href="https://maomaohu.net/" target="_blank" rel="noopener noreferrer">🦁 NUS BIOR Lab</a>',
  }), "bottom-left");
  state.map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
  state.map.addControl(new MapCameraControl(), "top-right");
  state.map.addControl(new mapboxgl.ScaleControl({ maxWidth: 140, unit: "metric" }), "bottom-right");
  state.map.on("error", (event) => {
    const message = String(event?.error?.message || "");
    const isAuthError = /token|auth|not authorized|forbidden|401|403/i.test(message);
    if (isAuthError) {
      localStorage.removeItem("nus-emis-mapbox-token");
      if (!isDefaultMapboxToken(token)) {
        fallBackToDefaultMapboxToken();
        return;
      }
      state.mapAuthFallbackInProgress = false;
      showTokenPanel("The configured site Mapbox token was rejected. Ask the site owner to check domain restrictions or use a temporary public token.");
    } else if (message) {
      setRealtimeStatus("error", "Map service warning");
      console.warn(event.error);
    }
  });
  state.map.on("load", async () => {
    state.mapAuthFallbackInProgress = false;
    addMapLayers();
    applySearchFilter();
    updateMetric(state.metric);
    fitCampus();
    await loadRealtime().catch((error) => {
      console.error(error);
      setRealtimeStatus("error", "Realtime API unavailable");
    });
    window.clearInterval(state.refreshTimer);
    state.refreshTimer = window.setInterval(() => {
      loadRealtime().catch((error) => {
        console.error(error);
        setRealtimeStatus("error", "Realtime API unavailable");
      });
    }, realtimeConfig.refreshMs);
  });
}

els.tokenForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const token = els.tokenInput.value.trim();
  if (!token) return;
  if (!token.startsWith("pk.")) {
    showTokenPanel("Paste a Mapbox public token that starts with pk.");
    return;
  }
  localStorage.setItem("nus-emis-mapbox-token", token);
  initMap(token, "manual").catch((error) => {
    console.error(error);
    localStorage.removeItem("nus-emis-mapbox-token");
    showTokenPanel(error.message || "Map failed to load. The site token will be used after refresh.");
  });
});

bindControls();
window.NUSStationWeather.select(document.querySelector('[name="weather-location"]:checked').value);
renderMarketHeatmap();
renderBuildingAnalytics();
setWeatherPeriod(state.activeWeatherPeriod);
activateTab(state.activeTab);

const initialMapboxToken = getInitialMapboxToken();
if (initialMapboxToken.token) {
  initMap(initialMapboxToken.token, initialMapboxToken.source).catch((error) => {
    console.error(error);
    if (!isDefaultMapboxToken(initialMapboxToken.token)) {
      fallBackToDefaultMapboxToken();
      return;
    }
    showTokenPanel(error.message || "The configured site Mapbox token failed. Ask the site owner to check token restrictions.");
  });
} else {
  showTokenPanel("No site Mapbox token is configured. Paste a temporary public token to load the map.");
}
