// src/GeoGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countriesData from './data/countries.json';
import flags from './data/flags.json';

function GeoGame() {
    const [chosenCountry, setTargetCountry] = useState(null);
    const [score, setScore] = useState(0);
    const chosenCountryRef = useRef(null);
  
    useEffect(() => {
      selectRandomCountry();
    }, []);
  
    useEffect(() => {
      if (chosenCountry) {
        chosenCountryRef.current = chosenCountry;
        console.log("targetCountry actualizado:", chosenCountry);
      }
    }, [chosenCountry]);
  
    const selectRandomCountry = () => {
      const countries = countriesData.features;
      const randomIndex = Math.floor(Math.random() * countries.length);
      console.log(randomIndex);
      
      const selectedCountry = countries[randomIndex];
      console.log("pais elegido", selectedCountry);
      setTargetCountry(selectedCountry);
      // Actualizamos el ref de forma inmediata:
      chosenCountryRef.current = selectedCountry;
    };
  
    const onCountryClick = (e, country) => {
      if (!chosenCountryRef.current || !country || !country.properties) {
        console.log("No hay chosenCountry o country no tiene properties");
        return;
      }
    
      const clickedName = country.properties.ADMIN?.trim().toLowerCase();
      const targetName = chosenCountryRef.current.properties.ADMIN?.trim().toLowerCase();
      console.log("Clicked:", clickedName, "Target:", targetName);
    
      if (clickedName === targetName) {
        setScore(prevScore => prevScore + 1);
        selectRandomCountry();
        console.log("Correcto");
      }
    };
  
  //dd

  const countryStyle = {
    fillColor: '#ddd',
    weight: 1,
    color: '#333',
    fillOpacity: 1,
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>GeoGuess Game</h1>
        <p>Score: {score}</p>
      </header>
      {chosenCountry && (
        <div style={styles.flagContainer}>
          <img
            src={flags[chosenCountry.properties.ADMIN]}
            alt="Country Flag"
            style={styles.flag}
          />
           {/*  <p>{chosenCountry.properties.ADMIN}</p> */}
        </div>
      )}
      <MapContainer center={[20, 0]} zoom={2} style={styles.map}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
        <GeoJSON
          data={countriesData}
          style={countryStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: (e) => onCountryClick(e, feature),
            });
          }}
        />
      </MapContainer>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px'
  },
  header: {
    marginBottom: '20px'
  },
  flagContainer: {
    margin: '20px auto'
  },
  flag: {
    width: '150px',
    height: 'auto'
  },
  map: {
    height: '500px',
    width: '80%',
    margin: '0 auto',
    border: '1px solid #ccc'
  }
};

export default GeoGame;
