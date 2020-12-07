// @ts-nocheck
import React from 'react';
import mapboxgl from "mapbox-gl";
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import "mapbox-gl/dist/mapbox-gl.css";

import LanguageControl from 'mapbox-gl-controls/lib/language';
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import CompassControl from 'mapbox-gl-controls/lib/compass';
import ZoomControl from 'mapbox-gl-controls/lib/zoom';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const accessToken = process.env.REACT_APP_ACCESS_TOKEN;

function App() {
  React.useEffect(() => {
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [37.618423, 55.755826],
      zoom: 4 // starting zoom
    });

    let hoveredStateId = null;

    map.on("load", () => {
      map.addControl(
        new MapboxGeocoder({
          accessToken,
          mapboxgl,
        }),
        "top-left"
      );

      // with browser detect:
      map.addControl(new LanguageControl());
      map.addControl(new RulerControl(), 'top-right');
      map.addControl(new CompassControl(), 'top-right');
      map.addControl(new ZoomControl(), 'top-right');

      map.on('mousemove', 'russia-fill', function (e) {
        if (e.features.length > 0) {
          if (hoveredStateId) {
            map.setFeatureState(
              { source: 'russia', id: hoveredStateId },
              { hover: false }
            );
          }
          hoveredStateId = e.features[0].id;

          console.log(e.features[0].id, e.features[0].properties.name);

          map.setFeatureState(
            { source: 'russia', id: hoveredStateId },
            { hover: true }
          );
        }
      });

      // When the mouse leaves the state-fill layer, update the feature state of the
      // previously hovered feature.
      map.on('mouseleave', 'russia-fill', function () {
        if (hoveredStateId) {
          map.setFeatureState(
            { source: 'russia', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
      });

      map.addControl(new MapboxTraffic());

      fetch("https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson")
        .then(data => data.json())
        .then(({ features, type }) => {
          features.forEach(feature => {
            feature.id = feature.properties.cartodb_id;
          })
          console.log("f", features);
          map.addSource("russia", {
            'type': 'geojson',
            'data': { type, features }
          });

          map.addLayer({
            'id': 'russia-line',
            'type': 'line',
            'source': 'russia',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': 'blue',
              'line-width': 1
            }
          });

          map.addLayer({
            'id': 'russia-fill',
            'type': 'fill',
            'source': 'russia',
            'layout': {},
            'paint': {
              'fill-color': '#088',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.3,
                0.2
              ]
            }
          });
        });
    })
  }, []);

  return (
    <div id="map" />
  );
}

export default App;
