// src/GeoGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import countriesData from './data/countries.json';
import flags from './data/flags.json';

function GeoGame() {
  // Estados para país objetivo, puntaje, vidas, puntaje máximo, feedback y dificultad.
  const [chosenCountry, setChosenCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxScore, setMaxScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [difficulty, setDifficulty] = useState("dificil"); // Opciones: "normal", "dificil", "extremo"
  
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
    const validCountries = countriesData.features.filter(
      feature => feature.properties && feature.properties.ADMIN
    );
    const randomIndex = Math.floor(Math.random() * validCountries.length);
    console.log("Índice seleccionado:", randomIndex);
    const selectedCountry = validCountries[randomIndex];
    console.log("País elegido:", selectedCountry);
    setChosenCountry(selectedCountry);
    chosenCountryRef.current = selectedCountry;
    setFeedbackMessage("");
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
      // Respuesta correcta
      setScore(prev => prev + 1);
      setFeedbackMessage("¡Correcto!");
      selectRandomCountry();
    } else {
      // Respuesta incorrecta
      setLives(prev => prev - 1);
      setFeedbackMessage(`Incorrecto! Seleccionaste ${country.properties.ADMIN}`);
      if (lives - 1 <= 0) {
        // Fin del juego: actualiza maxScore y reinicia
        setMaxScore(prev => (score > prev ? score : prev));
        setFeedbackMessage(`Perdiste. El país correcto era ${targetName}. Tu racha fue ${score} y el máximo es ${score > maxScore ? score : maxScore}.`);
        setScore(0);
        setLives(3);
        selectRandomCountry();
      }
    }
  };

  // Función que retorna el estilo del GeoJSON según la dificultad.
  const getCountryStyle = () => {
    if (difficulty === "extremo") {
      return { fillColor: 'white' , weight: 1, color: 'white', fillOpacity: 1};
    }
    if (difficulty === "normal") {
      return { weight: 1, fillOpacity: 0 };
    }
    //dificil
    return { fillColor: 'white', weight: 1, color: 'grey', fillOpacity: 1 };
  };

  // Función que retorna el URL del TileLayer según la dificultad.
  const getTileLayerURL = () => {
    // En modo "normal" (fácil) se muestra el mapa con nombres y fronteras.
    if (difficulty === "normal") {
      return "http://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{@2x}.png";
    }
    if (difficulty === "extremo") {
      return "http://{s}.basemaps.cartocdn.com/rastertiles/{z}/{x}/{y}{@2x}.png";
    }
    // dificil
    return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{@2x}.png";
  };

  // Manejador para el cambio de dificultad.
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const styles = {
    container: {
      textAlign: 'center',
      padding: '20px'
    },
    header: {
      marginBottom: '20px'
    },
    instructions: {
      margin: '10px 0'
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
      border: '1px solid #ccc',
    },
    feedback: {
      margin: '10px 0',
      fontWeight: 'bold'
    },
    difficultyContainer: {
      margin: '10px 0'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>GeoGuess Game</h1>
        <p style={styles.instructions}>Haz clic en el mapa para adivinar el país de la bandera.</p>
        <p>Score: {score}</p>
        <p>Vidas: {lives}</p>
        <p>Score máximo: {maxScore}</p>
        {feedbackMessage && <p style={styles.feedback}>{feedbackMessage}</p>}
        <div style={styles.difficultyContainer}>
          <label>
            Dificultad:{" "}
            <select value={difficulty} onChange={handleDifficultyChange}>
              <option value="normal">Normal (Nombres y fronteras)</option>
              <option value="dificil">Difícil (Solo fronteras)</option>
              <option value="extremo">Extremo (Sin nombres ni fronteras)</option>
            </select>
          </label>
        </div>
      </header>
      {chosenCountry && (
        <div style={styles.flagContainer}>
          <img
            src={flags[chosenCountry.properties.ADMIN]}
            alt="Country Flag"
            style={styles.flag}
          />
        
        </div>
      )}
      <MapContainer center={[20, 0]} zoom={2} style={styles.map}>
        <TileLayer url={getTileLayerURL()} />
        <GeoJSON
          data={countriesData}
          style={getCountryStyle()}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: (e) => onCountryClick(e, feature),
            });
            if (difficulty === "normal" && feature.properties && feature.properties.ADMIN) {
              layer.bindTooltip(feature.properties.ADMIN, { permanent: true, direction: 'center' });
            }
          }}
        />
      </MapContainer>
    </div>
  );
}

export default GeoGame;
