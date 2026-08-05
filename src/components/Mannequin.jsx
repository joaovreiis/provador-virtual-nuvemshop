import { useState } from 'react';

export default function Mannequin({ onBack, onShowRecommendation, usarMedidasMannequin }) {

  const medidasMannequin = [{
    busto: {
      1: 79,
      2: 84,
      3: 90,
      4: 96,
      5: 102
    },

    cintura: {
      1: 60,
      2: 66,
      3: 74,
      4: 80,
      5: 86
    },

    quadril: {
      1: 87,
      2: 93,
      3: 99,
      4: 105,
      5: 111
    }
  }]

  const [busto, setBusto] = useState(3);
  const [cintura, setCintura] = useState(3);
  const [quadril, setQuadril] = useState(3);

  const formato = [busto, cintura, quadril].map((value) => Number(value).toString().padStart(2, '0')).join('');

  const imageSrc = `/mannequin_formatos/${formato}.jpg`;
  const medidasSelecionadas = {
    busto: medidasMannequin[0].busto[busto],
    cintura: medidasMannequin[0].cintura[cintura],
    quadril: medidasMannequin[0].quadril[quadril]
  };

  return (
    <div className='boneco'>
      <img src={imageSrc} alt={`Mannequin ${formato}`} onError={(evento) => {console.error('Imagem não encontrada:',imageSrc); evento.target.style.display = 'none';}}
      />

      <div className='formMedidas'>
        <h2>Ajuste o formato do corpo</h2>

        <h3>
          Este é o formato aproximado do corpo que geramos com suas medidas.
          Ajuste somente se for necessário.
        </h3>
        
        <label htmlFor='busto'>Busto</label>
        <input type='range' id='busto' min='1' max='5' value={busto} onChange={(evento) => setBusto(Number(evento.target.value))}
        />

        <label htmlFor='cintura'>Cintura</label>
        <input type='range' id='cintura' min='1' max='5' value={cintura} onChange={(evento) => setCintura(Number(evento.target.value))}
        />

        <label htmlFor='quadril'>Quadril</label>
        <input type='range' id='quadril' min='1' max='5' value={quadril} onChange={(evento) => setQuadril(Number(evento.target.value))}
        />

        <div className='card-footer-mannequin'>
          <button className='btn-voltar' type='button' onClick={onBack}>Voltar</button>
          <button className='btn-proximo' type='button' onClick={() => onShowRecommendation && onShowRecommendation(formato, usarMedidasMannequin ? medidasSelecionadas : undefined)}>Recomendação</button>
        </div>
      </div> 
    </div>
  );
}
