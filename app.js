const { useState, useEffect } = React;

const MANUFACTURERS = [
  "Carrier",
  "Trane",
  "Lennox",
  "Daikin",
  "Rheem",
  "Aaon",
  "Goodman",
  "Toshiba",
  "Mitsubishi",
  "LG",
  "Nordyne",
  "Bosch",
  "Samsung",
  "Danfoss",
  "Other",
];

const CONTROL_CIRCUIT_VOLTS = ["24vac", "120vac"];
const NUM_COMPRESSORS = [0, 1, 2, 3, 4];
const NUM_OUTDOOR_FANS = ["Not Present", 1, 2, 3, 4];
const NUM_INDOOR_FANS = ["Not Present", 1, 2];
const ECONOMIZER_OPTIONS = ["Not Present", 1];

const defaultForm = {
  manufacturer: "",
  modelNumber: "",
  serialNumber: "",
  controlCircuitVolts: "24vac",

  numCompressors: 0,
  compressors: [
    { label: "ComprA", volts: "", phases: "", hz: "", rla: "", lra: "" },
    { label: "ComprB", volts: "", phases: "", hz: "", rla: "", lra: "" },
    { label: "ComprC", volts: "", phases: "", hz: "", rla: "", lra: "" },
    { label: "ComprD", volts: "", phases: "", hz: "", rla: "", lra: "" },
  ],

  numOutdoorFans: "1",
  outdoorFans: [
    { label: "FanA", volts: "", phases: "", hz: "", rla: "" },
    { label: "FanB", volts: "", phases: "", hz: "", rla: "" },
  ],

  numIndoorFans: "1",
  indoorFans: [
    { label: "FanA", volts: "", phases: "", hz: "", rla: "" },
    { label: "FanB", volts: "", phases: "", hz: "", rla: "" },
  ],

  economizer: "Not Present",

  heating: {
    inputMaxBtuHr: "",
    outputCapacityBtuHr: "",
  },

  cooling: {
    inputMaxKw: "",
    outputCapacityKw: "",
  },
};

const STORAGE_KEY = "pst-form-v1";

function App() {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultForm;
    } catch {
      return defaultForm;
    }
  });

  const [tab, setTab] = useState("nameplate");
  const [telemetry, setTelemetry] = useState(null);

  // Persist form to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (e) {
      console.warn("Unable to save form:", e);
    }
  }, [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCompressor = (index, field, value) => {
    setForm((prev) => {
      const next = { ...prev };
      next.compressors = prev.compressors.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      );
      return next;
    });
  };

  const updateOutdoorFan = (index, field, value) => {
    setForm((prev) => {
      const next = { ...prev };
      next.outdoorFans = prev.outdoorFans.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      );
      return next;
    });
  };

  const updateIndoorFan = (index, field, value) => {
    setForm((prev) => {
      const next = { ...prev };
      next.indoorFans = prev.indoorFans.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      );
      return next;
    });
  };

  const updateHeating = (field, value) => {
    setForm((prev) => ({
      ...prev,
      heating: {
        ...prev.heating,
        [field]: value,
      },
    }));
  };

  const updateCooling = (field, value) => {
    setForm((prev) => ({
      ...prev,
      cooling: {
        ...prev.cooling,
        [field]: value,
      },
    }));
  };

  const runTelemetryTest = () => {
    const randomRange = (min, max, decimals = 1) => {
      const v = Math.random() * (max - min) + min;
      return decimals ? v.toFixed(decimals) : Math.round(v);
    };

    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const now = new Date();
    const bypass = Math.random() > 0.5;
    const online = !bypass;

    const result = {
      bypass: bypass ? "Bypass (all relays closed)" : "Normal",
      online: online ? "Online" : "Offline",

      cellularSignalStrength: randomRange(-110, -70, 0) + " dBm",
      ratMeasured: randomChoice(["LTE", "LTE-M", "5G", "NB-IoT"]),
      satMeasured: randomRange(45, 60, 1) + " °F",
      ratTempMeasured: randomRange(68, 80, 1) + " °F",
      domeTempMeasured: randomRange(80, 120, 1) + " °F",
      voltageMeasured: randomRange(198, 265, 0) + " V",
      currentMeasured: randomRange(5, 40, 1) + " A",
      vibrationMeasured: randomRange(0, 8, 2) + " mm/s",

      paceDateTime: now.toISOString(),
      paceLocationZip: randomChoice(["32801", "75001", "60601", "30301"]),
      weatherSiteLocation: randomChoice(["KORL", "KATL", "KDFW", "KORD"]),
      weatherSiteOat: randomRange(55, 98, 1) + " °F",
      energyPriceLocation: randomChoice(["FL-UTIL-01", "ERCOT", "PJM"]),
      energySitePrice: "$" + randomRange(0.08, 0.35, 3) + " /kWh",

      compressorSignals:
        "Thermostat sweep detected – compressor call inputs observed.",
      fanSignals:
        "Fan signals received – indoor/outdoor fan stages cycled from thermostat.",
    };

    setTelemetry(result);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-badge">Pace Service Tool · PWA Prototype</div>
        <div className="app-title">PST – Cellular Commissioning</div>
        <div className="app-subtitle">
          Nameplate data entry and telemetry test harness for Pace 5 cellular
          commissioning. Data is stored locally in this browser only.
        </div>
      </header>

      <div className="tab-bar">
        <button
          className={"tab-btn " + (tab === "nameplate" ? "active" : "")}
          onClick={() => setTab("nameplate")}
        >
          Nameplate &amp; Operations
        </button>
        <button
          className={"tab-btn " + (tab === "telemetry" ? "active" : "")}
          onClick={() => setTab("telemetry")}
        >
          Commissioning / Telemetry Test
        </button>
      </div>

      {tab === "nameplate" ? (
        <NameplateView
          form={form}
          updateField={updateField}
          updateCompressor={updateCompressor}
          updateOutdoorFan={updateOutdoorFan}
          updateIndoorFan={updateIndoorFan}
          updateHeating={updateHeating}
          updateCooling={updateCooling}
        />
      ) : (
        <TelemetryView telemetry={telemetry} runTelemetryTest={runTelemetryTest} />
      )}

      <div className="footer-note">
        Prototype only – in production, telemetry values would come from AWS /
        Pace 5 via secure APIs.
      </div>
    </div>
  );
}

function NameplateView({
  form,
  updateField,
  updateCompressor,
  updateOutdoorFan,
  updateIndoorFan,
  updateHeating,
  updateCooling,
}) {
  const compressorsToShow = form.compressors.slice(0, form.numCompressors || 0);

  const outdoorCount =
    form.numOutdoorFans === "Not Present" ? 0 : Number(form.numOutdoorFans);
  const indoorCount =
    form.numIndoorFans === "Not Present" ? 0 : Number(form.numIndoorFans);

  return (
    <>
      <div className="card">
        <div className="card-title">Nameplate Data</div>
        <div className="card-subtitle">
          Basic equipment information used during commissioning.
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Manufacturer Name</label>
            <select
              className="form-select"
              value={form.manufacturer}
              onChange={(e) => updateField("manufacturer", e.target.value)}
            >
              <option value="">Select manufacturer...</option>
              {MANUFACTURERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Model Number</label>
            <input
              className="form-input"
              value={form.modelNumber}
              onChange={(e) => updateField("modelNumber", e.target.value)}
              placeholder="e.g. RTU-123ABC"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Serial Number</label>
            <input
              className="form-input"
              value={form.serialNumber}
              onChange={(e) => updateField("serialNumber", e.target.value)}
              placeholder="e.g. SN-00123456"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Control Circuit Volts</label>
            <select
              className="form-select"
              value={form.controlCircuitVolts}
              onChange={(e) => updateField("controlCircuitVolts", e.target.value)}
            >
              {CONTROL_CIRCUIT_VOLTS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Compressors
          <span className="small-badge">ComprA–ComprD</span>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Number of Compressors</label>
            <select
              className="form-select"
              value={form.numCompressors}
              onChange={(e) => updateField("numCompressors", Number(e.target.value))}
            >
              {NUM_COMPRESSORS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {compressorsToShow.length > 0 && (
          <>
            <hr className="section-divider" />
            <div className="form-grid">
              {compressorsToShow.map((c, idx) => (
                <div key={c.label} className="card" style={{ marginBottom: 0 }}>
                  <div className="card-title" style={{ marginBottom: "0.4rem" }}>
                    {c.label}
                  </div>
                  <div className="form-grid">
                    <Field
                      label="Volts"
                      value={c.volts}
                      onChange={(v) => updateCompressor(idx, "volts", v)}
                      placeholder="e.g. 460"
                    />
                    <Field
                      label="Phases"
                      value={c.phases}
                      onChange={(v) => updateCompressor(idx, "phases", v)}
                      placeholder="e.g. 3"
                    />
                    <Field
                      label="Hz"
                      value={c.hz}
                      onChange={(v) => updateCompressor(idx, "hz", v)}
                      placeholder="e.g. 60"
                    />
                    <Field
                      label="Rated Load Amps"
                      value={c.rla}
                      onChange={(v) => updateCompressor(idx, "rla", v)}
                      placeholder="RLA"
                    />
                    <Field
                      label="Locked Rotor Amps"
                      value={c.lra}
                      onChange={(v) => updateCompressor(idx, "lra", v)}
                      placeholder="LRA"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          Outdoor Fans
          <span className="small-badge">FanA–FanB</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Number of Outdoor Fans</label>
            <select
              className="form-select"
              value={form.numOutdoorFans}
              onChange={(e) => updateField("numOutdoorFans", e.target.value)}
            >
              {NUM_OUTDOOR_FANS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {outdoorCount > 0 && (
          <>
            <hr className="section-divider" />
            <div className="form-grid">
              {form.outdoorFans.slice(0, Math.min(outdoorCount, 2)).map((f, idx) => (
                <div key={f.label} className="card" style={{ marginBottom: 0 }}>
                  <div className="card-title" style={{ marginBottom: "0.4rem" }}>
                    {f.label}
                  </div>
                  <div className="form-grid">
                    <Field
                      label="Volts"
                      value={f.volts}
                      onChange={(v) => updateOutdoorFan(idx, "volts", v)}
                      placeholder="e.g. 460"
                    />
                    <Field
                      label="Phases"
                      value={f.phases}
                      onChange={(v) => updateOutdoorFan(idx, "phases", v)}
                      placeholder="e.g. 3"
                    />
                    <Field
                      label="Hz"
                      value={f.hz}
                      onChange={(v) => updateOutdoorFan(idx, "hz", v)}
                      placeholder="e.g. 60"
                    />
                    <Field
                      label="Rated Load Amps"
                      value={f.rla}
                      onChange={(v) => updateOutdoorFan(idx, "rla", v)}
                      placeholder="RLA"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          Indoor Fans
          <span className="small-badge">FanA–FanB</span>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Number of Indoor Fans</label>
            <select
              className="form-select"
              value={form.numIndoorFans}
              onChange={(e) => updateField("numIndoorFans", e.target.value)}
            >
              {NUM_INDOOR_FANS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {indoorCount > 0 && (
          <>
            <hr className="section-divider" />
            <div className="form-grid">
              {form.indoorFans.slice(0, Math.min(indoorCount, 2)).map((f, idx) => (
                <div key={f.label} className="card" style={{ marginBottom: 0 }}>
                  <div className="card-title" style={{ marginBottom: "0.4rem" }}>
                    {f.label}
                  </div>
                  <div className="form-grid">
                    <Field
                      label="Volts"
                      value={f.volts}
                      onChange={(v) => updateIndoorFan(idx, "volts", v)}
                      placeholder="e.g. 460"
                    />
                    <Field
                      label="Phases"
                      value={f.phases}
                      onChange={(v) => updateIndoorFan(idx, "phases", v)}
                      placeholder="e.g. 3"
                    />
                    <Field
                      label="Hz"
                      value={f.hz}
                      onChange={(v) => updateIndoorFan(idx, "hz", v)}
                      placeholder="e.g. 60"
                    />
                    <Field
                      label="Rated Load Amps"
                      value={f.rla}
                      onChange={(v) => updateIndoorFan(idx, "rla", v)}
                      placeholder="RLA"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">Economizer</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Economizer</label>
            <select
              className="form-select"
              value={form.economizer}
              onChange={(e) => updateField("economizer", e.target.value)}
            >
              {ECONOMIZER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Heating Operation</div>
        <div className="form-grid">
          <Field
            label="BTU/HR Input Max"
            value={form.heating.inputMaxBtuHr}
            onChange={(v) => updateHeating("inputMaxBtuHr", v)}
            placeholder="e.g. 120000"
          />
          <Field
            label="BTU/HR Output Capacity"
            value={form.heating.outputCapacityBtuHr}
            onChange={(v) => updateHeating("outputCapacityBtuHr", v)}
            placeholder="e.g. 97000"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Cooling Operation</div>
        <div className="form-grid">
          <Field
            label="kW Input Max"
            value={form.cooling.inputMaxKw}
            onChange={(v) => updateCooling("inputMaxKw", v)}
            placeholder="e.g. 35.2"
          />
          <Field
            label="kW Output Capacity"
            value={form.cooling.outputCapacityKw}
            onChange={(v) => updateCooling("outputCapacityKw", v)}
            placeholder="e.g. 28.4"
          />
        </div>
      </div>
    </>
  );
}

function TelemetryView({ telemetry, runTelemetryTest }) {
  return (
    <div className="card">
      <div className="card-title">Commissioning Telemetry Test</div>
      <div className="card-subtitle">
        Simulated telemetry loop: AWS ↔ Pace 5. In production this would be
        driven from the cellular backend.
      </div>

      <button className="telemetry-btn" onClick={runTelemetryTest}>
        Run Telemetry Test
      </button>

      {telemetry ? (
        <div className="telemetry-grid">
          <TelemetryItem label="Bypass / Relays" value={telemetry.bypass} />
          <TelemetryItem label="Online State" value={telemetry.online} />
          <TelemetryItem
            label="Cellular Signal Strength"
            value={telemetry.cellularSignalStrength}
          />
          <TelemetryItem label="RAT Measured" value={telemetry.ratMeasured} />
          <TelemetryItem label="SAT Measured" value={telemetry.satMeasured} />
          <TelemetryItem
            label="RAT Measured"
            value={telemetry.ratTempMeasured}
          />
          <TelemetryItem
            label="Dome Temp Measured"
            value={telemetry.domeTempMeasured}
          />
          <TelemetryItem
            label="Voltage Measured"
            value={telemetry.voltageMeasured}
          />
          <TelemetryItem
            label="Current Measured"
            value={telemetry.currentMeasured}
          />
          <TelemetryItem
            label="Vibration Measured"
            value={telemetry.vibrationMeasured}
          />
          <TelemetryItem
            label="Pace5 Date/Time"
            value={telemetry.paceDateTime}
          />
          <TelemetryItem
            label="Pace5 Location (ZIP)"
            value={telemetry.paceLocationZip}
          />
          <TelemetryItem
            label="Weather Site Location"
            value={telemetry.weatherSiteLocation}
          />
          <TelemetryItem
            label="Weather Site OAT"
            value={telemetry.weatherSiteOat}
          />
          <TelemetryItem
            label="Energy Price Site"
            value={telemetry.energyPriceLocation}
          />
          <TelemetryItem
            label="Energy Site Price"
            value={telemetry.energySitePrice}
          />
          <TelemetryItem
            label="Compressor Signals"
            value={telemetry.compressorSignals}
          />
          <TelemetryItem
            label="Fan Signals"
            value={telemetry.fanSignals}
          />
        </div>
      ) : (
        <p style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}>
          No telemetry values yet. Click <strong>Run Telemetry Test</strong> to
          simulate a round trip.
        </p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TelemetryItem({ label, value }) {
  return (
    <div className="telemetry-item">
      <div className="telemetry-label">{label}</div>
      <div className="telemetry-value">{value}</div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
