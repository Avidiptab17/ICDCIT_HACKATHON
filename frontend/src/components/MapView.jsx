import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";

const TOKEN = "YOUR_MAPBOX_TOKEN";

function MapView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/uhi")
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <Map
      initialViewState={{
        latitude: 20.30,
        longitude: 85.82,
        zoom: 11
      }}
      style={{ width: "100%", height: "90vh" }}
      mapboxAccessToken={TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v10"
    >
      {data.map((d, i) => (
        <Marker key={i} latitude={d.lat} longitude={d.lon}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                d.zone === 2 ? "red" :
                d.zone === 1 ? "orange" : "green"
            }}
            title={d.recommendation}
          />
        </Marker>
      ))}
    </Map>
  );
}

export default MapView;
