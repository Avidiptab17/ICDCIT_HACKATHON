import React, { useState, useEffect, useRef } from "react";
import MapView from "./components/MapView";
import Legend from "./components/Legend";
import Dashboard from "./components/Dashboard";
import "./App.css";

// ViewModel - Business Logic Layer
class UHIViewModel {
  constructor() {
    const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
    this.apiBaseUrl = `${base}/api/analyze`;
  }

  async fetchUHIData(numPoints = 100, daysBack = 30) {
    const response = await fetch(
      `${this.apiBaseUrl}/uhi?points=${numPoints}&days=${daysBack}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "API returned error");
    }

    return result;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  validateParameters(numPoints, daysBack) {
    const errors = [];

    if (numPoints < 10 || numPoints > 500) {
      errors.push("Number of points must be between 10 and 500");
    }

    if (daysBack < 7 || daysBack > 90) {
      errors.push("Days back must be between 7 and 90");
    }

    return errors;
  }
}

function App() {
  // ✅ show/hide header
  const [showHeader, setShowHeader] = useState(true);

  // ✅ Initialize ViewModel
  const [viewModel] = useState(() => new UHIViewModel());

  // ✅ State management
  const [uhiData, setUhiData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(false);

  // ✅ UI State
  const [numPoints, setNumPoints] = useState(100);
  const [daysBack, setDaysBack] = useState(30);
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeView, setActiveView] = useState("map");

  // ✅ Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // ✅ HEADER SCROLL LOGIC (on window)
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near top
      if (currentScrollY < 20) {
        setShowHeader(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY < lastScrollY) {
        setShowHeader(true); // scrolling up
      } else {
        setShowHeader(false); // scrolling down
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Load data when backend is healthy
  useEffect(() => {
    if (backendHealthy) loadUHIData();
  }, [backendHealthy]);

  const checkBackendHealth = async () => {
    const healthy = await viewModel.checkHealth();
    setBackendHealthy(healthy);

    if (!healthy) {
      setError("Backend server is not responding. Please try again later.");
      setLoading(false);
    }
  };

  const loadUHIData = async () => {
    setLoading(true);
    setError(null);

    try {
      const errors = viewModel.validateParameters(numPoints, daysBack);
      if (errors.length > 0) {
        setError(errors.join(". "));
        setLoading(false);
        return;
      }

      const result = await viewModel.fetchUHIData(numPoints, daysBack);

      setUhiData(result.data);
      setStatistics(result.statistics);
    } catch (err) {
      setError(err.message || "Failed to load UHI data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => loadUHIData();
  const handleApplyFilters = () => loadUHIData();
  const handleZoneFilter = (zone) => setSelectedZone(zone);
  const handlePointClick = (point) => setSelectedPoint(point);

  const handleExportData = () => {
    if (!uhiData) return;

    const dataStr = JSON.stringify(
      {
        data: uhiData,
        statistics: statistics,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uhi-analysis-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`app ${showHeader ? "with-header" : "no-header"}`}>
      {/* ✅ Header */}
      <header className={`app-header ${showHeader ? "header-show" : "header-hide"}`}>
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              <span className="title-icon">🌡️</span>
              Urban Heat Island Analysis System
            </h1>
            <p className="app-subtitle">
              Real-time monitoring using OpenStreetMap & Open-Meteo Weather API
            </p>
          </div>

          <div className="header-right">
            <div className="status-indicator">
              <div className={`status-dot ${backendHealthy ? "online" : "offline"}`} />
              <span className="status-text">{backendHealthy ? "Online" : "Offline"}</span>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={loading || !backendHealthy}
            >
              {loading ? "🔄 Loading..." : "🔄 Refresh"}
            </button>

            <button className="btn btn-secondary" onClick={handleExportData} disabled={!uhiData}>
              📥 Export
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Control Panel */}
      <div className="control-panel">
        <div className="controls-grid">
          <div className="control-group">
            <label className="control-label">
              📍 Sample Points: <strong>{numPoints}</strong>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={numPoints}
              onChange={(e) => setNumPoints(parseInt(e.target.value))}
              className="control-slider"
              disabled={loading}
            />
            <div className="control-info">More points = Higher accuracy, slower processing</div>
          </div>

          <div className="control-group">
            <label className="control-label">
              📅 Historical Data: <strong>{daysBack} days</strong>
            </label>
            <input
              type="range"
              min="7"
              max="90"
              step="7"
              value={daysBack}
              onChange={(e) => setDaysBack(parseInt(e.target.value))}
              className="control-slider"
              disabled={loading}
            />
            <div className="control-info">Recent data may have more cloud cover</div>
          </div>

          <div className="control-group">
            <label className="control-label">🗺️ Visualization Options</label>
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  disabled={loading || !uhiData}
                />
                <span>Show Heatmap Layer</span>
              </label>
            </div>
          </div>

          <div className="control-group">
            <button
              className="btn btn-apply"
              onClick={handleApplyFilters}
              disabled={loading || !backendHealthy}
            >
              ✓ Apply Changes
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Error */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button className="error-close" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ✅ Main Content */}
      <div className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Fetching data from OpenStreetMap & Weather APIs...</p>
            <p className="loading-subtext">This may take 10-30 seconds</p>
          </div>
        ) : uhiData ? (
          <>
            <div className="view-tabs">
              <button
                className={`tab-button ${activeView === "map" ? "active" : ""}`}
                onClick={() => setActiveView("map")}
              >
                🗺️ Map View
              </button>
              <button
                className={`tab-button ${activeView === "analytics" ? "active" : ""}`}
                onClick={() => setActiveView("analytics")}
              >
                📊 Analytics
              </button>
            </div>

            {activeView === "map" ? (
              <div className="map-layout">
                <div className="map-sidebar">
                  <Legend
                    statistics={statistics}
                    onZoneFilter={handleZoneFilter}
                    selectedZone={selectedZone}
                  />
                </div>

                <div className="map-container">
                  <MapView
                    data={uhiData}
                    onPointClick={handlePointClick}
                    selectedZone={selectedZone}
                    showHeatmap={showHeatmap}
                  />
                </div>
              </div>
            ) : (
              <div className="analytics-layout">
                <Dashboard statistics={statistics} data={uhiData} />
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <h3>No Data Available</h3>
            <p>Click "Refresh" to load UHI analysis data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
