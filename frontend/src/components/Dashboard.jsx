import React from 'react';

const Dashboard = ({ statistics, data }) => {
  // Calculate additional metrics
  const getVegetationDistribution = () => {
    if (!data) return {};

    const distribution = {
      'Water/Built-up': 0,
      'Barren/Sparse': 0,
      'Moderate Vegetation': 0,
      'Dense Vegetation': 0
    };

    data.forEach(point => {
      if (distribution.hasOwnProperty(point.vegetation)) {
        distribution[point.vegetation]++;
      }
    });

    return distribution;
  };

  const getTemperatureRanges = () => {
    if (!data) return [];

    const ranges = [
      { label: '< 30°C', min: -100, max: 30, color: '#3b82f6', icon: '❄️' },
      { label: '30-35°C', min: 30, max: 35, color: '#22c55e', icon: '🌡️' },
      { label: '35-40°C', min: 35, max: 40, color: '#eab308', icon: '☀️' },
      { label: '40-45°C', min: 40, max: 45, color: '#f97316', icon: '🔥' },
      { label: '> 45°C', min: 45, max: 100, color: '#ef4444', icon: '🌋' }
    ];

    return ranges.map(range => ({
      ...range,
      count: data.filter(d => d.lst >= range.min && d.lst < range.max).length
    }));
  };

  const getTopHotspots = () => {
    if (!data) return [];

    return [...data]
      .sort((a, b) => b.uhi_intensity - a.uhi_intensity)
      .slice(0, 5);
  };

  const vegDistribution = getVegetationDistribution();
  const tempRanges = getTemperatureRanges();
  const hotspots = getTopHotspots();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      minWidth: '320px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          Analytics Dashboard
        </h3>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          Real-time UHI metrics and insights
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <MetricCard
          icon="🌡️"
          label="Avg Temperature"
          value={`${statistics?.temperature?.avg_lst || 0}°C`}
          color="#ef4444"
          subtitle={`±${statistics?.temperature?.std_lst || 0}°C`}
        />
        <MetricCard
          icon="🌿"
          label="Avg NDVI"
          value={statistics?.vegetation?.avg_ndvi || 0}
          color="#22c55e"
          subtitle="Vegetation Index"
        />
        <MetricCard
          icon="🔥"
          label="Max UHI"
          value={`${statistics?.uhi?.max_intensity || 0}°C`}
          color="#f97316"
          subtitle="Peak Intensity"
        />
        <MetricCard
          icon="📍"
          label="Data Points"
          value={statistics?.total_points || 0}
          color="#3b82f6"
          subtitle="Analyzed"
        />
      </div>

      {/* Temperature Distribution */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🌡️</span>
          Temperature Distribution
        </h4>

        {tempRanges.map((range, index) => {
          const percentage = statistics?.total_points
            ? ((range.count / statistics.total_points) * 100).toFixed(1)
            : 0;

          return (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{range.icon}</span>
                  {range.label}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: range.color,
                  fontWeight: 'bold'
                }}>
                  {range.count} ({percentage}%)
                </span>
              </div>

              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: range.color,
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                  boxShadow: `0 0 8px ${range.color}80`
                }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vegetation Analysis */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🌳</span>
          Vegetation Coverage
        </h4>

        {Object.entries(vegDistribution).map(([type, count], index) => {
          const percentage = statistics?.total_points
            ? ((count / statistics.total_points) * 100).toFixed(1)
            : 0;

          const colors = {
            'Water/Built-up': '#3b82f6',
            'Barren/Sparse': '#f59e0b',
            'Moderate Vegetation': '#84cc16',
            'Dense Vegetation': '#22c55e'
          };

          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < Object.entries(vegDistribution).length - 1
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : 'none'
            }}>
              <span style={{ fontSize: '12px', color: '#d1d5db' }}>
                {type}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: colors[type],
                  fontWeight: 'bold'
                }}>
                  {percentage}%
                </span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: colors[type],
                  boxShadow: `0 0 8px ${colors[type]}80`
                }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 5 Hotspots */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🔥</span>
          Top 5 Hotspots
        </h4>

        {hotspots.map((point, index) => (
          <div key={index} style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#fca5a5'
              }}>
                #{index + 1} Hotspot
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#ef4444'
              }}>
                +{point.uhi_intensity.toFixed(1)}°C
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '11px',
              color: '#d1d5db'
            }}>
              <div>
                <span style={{ color: '#9ca3af' }}>Temp:</span> {point.lst.toFixed(1)}°C
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>NDVI:</span> {point.ndvi.toFixed(3)}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#9ca3af' }}>Location:</span> {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Source Info */}
      {statistics?.date_range && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '11px',
          color: '#93c5fd'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            📡 Data Source
          </div>
          <div style={{ color: '#bfdbfe', lineHeight: '1.5' }}>
            <div>Data: OpenStreetMap + Open-Meteo API</div>
            <div>Analysis Date: {statistics.date_range.image_date}</div>
            <div>Algorithms: NDVI Estimation + LST</div>
            <div>Clustering: K-Means (3 zones)</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, label, value, color, subtitle }) => {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: '10px',
      padding: '14px',
      transition: 'transform 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        fontSize: '24px',
        marginBottom: '8px'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '11px',
        color: '#9ca3af',
        marginBottom: '4px',
        fontWeight: '500'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '2px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px',
        color: '#6b7280'
      }}>
        {subtitle}
      </div>
    </div>
  );
};

export default Dashboard;