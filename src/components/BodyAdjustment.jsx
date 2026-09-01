import React, { useState } from 'react';
import '../BodyAdjustment.css'; // Certifique-se de criar este arquivo CSS para estilizar o componente

const SKIN_TONES = [
  { id: 'tone-1', color: '#dcdcdc', label: 'Cinza Claro' },
  { id: 'tone-2', color: '#f7eedf', label: 'Muito Claro' },
  { id: 'tone-3', color: '#e0ab85', label: 'Claro' },
  { id: 'tone-4', color: '#be7d56', label: 'Médio' },
  { id: 'tone-5', color: '#965b39', label: 'Bronzeado' },
  { id: 'tone-6', color: '#703820', label: 'Escuro' },
  { id: 'tone-7', color: '#321811', label: 'Muito Escuro' },
];

export default function BodyAdjustment({ onBack, onNext, onValuesChange }) {
  const [busto, setBusto] = useState(3);
  const [cintura, setCintura] = useState(3);
  const [quadril, setQuadril] = useState(3);
  const [selectedSkinTone, setSelectedSkinTone] = useState(SKIN_TONES[0].id);

  // Ajusta o valor dentro dos limites
  const handleStep = (setter, currentValue, delta) => {
    const nextVal = Math.min(Math.max(currentValue + delta, 1), 5);
    setter(nextVal);
    if (onValuesChange) {
      onValuesChange({ busto, cintura, quadril, skinTone: selectedSkinTone });
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext({ busto, cintura, quadril, skinTone: selectedSkinTone });
    }
  };

  return (
    <main className="screen-container">
      {/* Badge da Loja */}
      <header className="logo-badge">
        <div className="brand-name">CROP.</div>
      </header>

      {/* Coluna Visual: Manequim e Paleta de Cores */}
      <section className="visual-column">
        <div className="mannequin-container">
          <svg className="mannequin-svg" viewBox="0 0 340 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bodyGrad" x1="120" y1="20" x2="280" y2="580" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#e8ebec" />
                <stop offset="70%" stopColor="#cbd0d4" />
                <stop offset="100%" stopColor="#abb1b7" />
              </linearGradient>
              <radialGradient id="highlightGrad" cx="190" cy="180" r="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Cabeça / Pescoço */}
            <path
              d="M152 48 C152 40, 160 30, 185 30 C210 30, 218 40, 218 48 C218 68, 205 92, 198 105 L172 105 C165 92, 152 68, 152 48 Z"
              fill="url(#bodyGrad)"
            />
            {/* Tronco e Braços */}
            <path
              d="M168 105 C145 115, 118 135, 102 165 C85 198, 76 250, 72 320 C68 375, 78 435, 82 465 L92 462 C88 430, 80 370, 84 315 C88 255, 96 205, 112 178 C122 160, 140 148, 155 142 C140 162, 130 195, 142 225 C154 252, 188 252, 202 225 C215 198, 205 162, 192 142 C208 148, 226 160, 236 178 C252 205, 260 255, 264 315 C268 370, 260 430, 256 462 L266 465 C270 435, 280 375, 276 320 C272 250, 263 198, 246 165 C230 135, 203 115, 180 105 Z"
              fill="url(#bodyGrad)"
            />
            {/* Curvas do Corpo */}
            <path
              d="M155 140 C135 158, 125 192, 136 226 C148 260, 182 260, 198 230 C212 195, 205 158, 188 140 C175 148, 165 148, 155 140 Z"
              fill="url(#bodyGrad)"
            />
            {/* Quadril e Pernas */}
            <path
              d="M138 220 C125 240, 128 290, 122 340 C112 420, 100 500, 112 590 L158 590 C154 510, 152 430, 160 380 C165 380, 175 380, 180 380 C188 430, 186 510, 182 590 L228 590 C240 500, 228 420, 218 340 C212 290, 215 240, 202 220 C190 242, 150 242, 138 220 Z"
              fill="url(#bodyGrad)"
            />

            <ellipse cx="168" cy="210" rx="45" ry="35" fill="url(#highlightGrad)" />
            <ellipse cx="140" cy="360" rx="30" ry="70" fill="url(#highlightGrad)" />
          </svg>
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
        />

        {/* Controle: Cintura */}
        <AdjustmentSlider
          label="Cintura"
          value={cintura}
          onChange={(val) => setCintura(val)}
          onDecrement={() => handleStep(setCintura, cintura, -1)}
          onIncrement={() => handleStep(setCintura, cintura, 1)}
        />

        {/* Controle: Quadril */}
        <AdjustmentSlider
          label="Quadril"
          value={quadril}
          onChange={(val) => setQuadril(val)}
          onDecrement={() => handleStep(setQuadril, quadril, -1)}
          onIncrement={() => handleStep(setQuadril, quadril, 1)}
        />

        {/* Navegação Inferior */}
        <div className="footer-actions">
          <div className="pagination-dots">
            <span className="dot" />
            <span className="dot active" />
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
function AdjustmentSlider({ label, value, onChange, onDecrement, onIncrement }) {
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
            <span className="ruler-tick" />
          </div>
          <input
            type="range"
            className="range-input"
            min="1"
            max="5"
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