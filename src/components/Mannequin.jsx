import React, { useState } from 'react';
import '../BodyAdjustment.css';

const SKIN_TONES = [
  { id: 'tone-1', color: '#dcdcdc', label: 'Cinza Claro' },
  { id: 'tone-2', color: '#f7eedf', label: 'Muito Claro' },
  { id: 'tone-3', color: '#e0ab85', label: 'Claro' },
  { id: 'tone-4', color: '#be7d56', label: 'Médio' },
  { id: 'tone-5', color: '#965b39', label: 'Bronzeado' },
  { id: 'tone-6', color: '#703820', label: 'Escuro' },
  { id: 'tone-7', color: '#321811', label: 'Muito Escuro' },
];

export default function Mannequin({ onBack, onShowRecommendation, usarMedidasMannequin }) {
  const medidasMannequin = [{
    busto: {
      1: 80,
      2: 84,
      3: 88,
      4: 92
    },
    cintura: {
      1: 64,
      2: 68,
      3: 72,
      4: 76
    },
    quadril: {
      1: 90,
      2: 96,
      3: 100,
      4: 104
    }
  }];

  const [busto, setBusto] = useState(3);
  const [cintura, setCintura] = useState(3);
  const [quadril, setQuadril] = useState(3);
  const [selectedSkinTone, setSelectedSkinTone] = useState(SKIN_TONES[0].id);
  const [imageError, setImageError] = useState(false);

  const formato = [busto, cintura, quadril].map((value) => Number(value).toString().padStart(2, '0')).join('');
  const imageSrc = `/mannequin_formatos/${formato}.jpg`;

  const medidasSelecionadas = {
    busto: medidasMannequin[0].busto[busto],
    cintura: medidasMannequin[0].cintura[cintura],
    quadril: medidasMannequin[0].quadril[quadril]
  };

  const handleStep = (setter, currentValue, delta) => {
    const nextVal = Math.min(Math.max(currentValue + delta, 1), 4);
    setter(nextVal);
  };

  const handleNext = () => {
    if (onShowRecommendation) {
      onShowRecommendation(formato, usarMedidasMannequin ? medidasSelecionadas : undefined);
    }
  };

  const handleImageError = (evento) => {
    console.error('Imagem não encontrada:', imageSrc);
    setImageError(true);
  };

  return (
    <main className="screen-container">
      {/* Badge da Loja */}
      <header className="logo-badge">
        <div className="brand-name">CROP.</div>
      </header>

        {/* Coluna Visual: Manequim e Paleta de Cores */}
        <section
          className="visual-column"
        >
          <div className="mannequin-container">
            {!imageError ? (
              <img
                src={imageSrc}
                alt={`Mannequin ${formato}`}
                className="mannequin-svg"
                style={{ filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.05))' }}
                onError={handleImageError}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>
                Imagem não disponível
              </div>
            )}
          </div>

          {/* Seletor de Tom de Pele */}
          <aside className="skin-palette" aria-label="Escolher tom de pele">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={`color-swatch ${selectedSkinTone === tone.id ? 'active' : ''}`}
                style={{ backgroundColor: tone.color }}
                title={tone.label}
                onClick={() => setSelectedSkinTone(tone.id)}
              />
            ))}
          </aside>
        </section>

        {/* Coluna de Controles / Sliders */}
        <section className="controls-column">
          <h1 className="main-title">Ajuste o formato do corpo</h1>
          <p className="description">
            Este é o formato aproximado do corpo que geramos com suas medidas. Ajuste somente se for necessário.
          </p>

          {/* Controle: Busto */}
          <AdjustmentSlider
            label="Busto"
            value={busto}
            onChange={(val) => setBusto(val)}
            onDecrement={() => handleStep(setBusto, busto, -1)}
            onIncrement={() => handleStep(setBusto, busto, 1)}
            min={1}
            max={4}
          />

          {/* Controle: Cintura */}
          <AdjustmentSlider
            label="Cintura"
            value={cintura}
            onChange={(val) => setCintura(val)}
            onDecrement={() => handleStep(setCintura, cintura, -1)}
            onIncrement={() => handleStep(setCintura, cintura, 1)}
            min={1}
            max={4}
          />

          {/* Controle: Quadril */}
          <AdjustmentSlider
            label="Quadril"
            value={quadril}
            onChange={(val) => setQuadril(val)}
            onDecrement={() => handleStep(setQuadril, quadril, -1)}
            onIncrement={() => handleStep(setQuadril, quadril, 1)}
            min={1}
            max={4}
          />

          {/* Navegação Inferior */}
          <div className="footer-actions">
            <div className="pagination-dots">
              <span className="dot" />
              <span className="dot active" />
            </div>
            <div className="buttons-group">
              <button className="btn btn-back" type="button" onClick={onBack}>
                VOLTAR
              </button>
              <button className="btn btn-next" type="button" onClick={handleNext}>
                PRÓXIMO
              </button>
            </div>
          </div>
        </section>
    </main>
  );
}

// Subcomponente do Slider com a régua e marcações
function AdjustmentSlider({ label, value, onChange, onDecrement, onIncrement, min, max }) {
  return (
    <div className="adjustment-group">
      <div className="group-label">{label}</div>
      <div className="slider-row">
        <button className="btn-step" type="button" onClick={onDecrement} aria-label={`Diminuir ${label}`}>
          —
        </button>

        <div className="slider-container">
          <div className="ruler-track">
            <span className="ruler-tick" /> 
            <span className="ruler-tick" />
            <span className="ruler-tick" />
            <span className="ruler-tick" />
          </div>
          <input
            type="range"
            className="range-input"
            min={min}
            max={max}
            step="1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={label}
          />
        </div>

        <button className="btn-step" type="button" onClick={onIncrement} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
