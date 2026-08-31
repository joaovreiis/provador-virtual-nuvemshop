import guiaMedidas from '../../public/_comoMedirCrop2.jpg';

const CATEGORIAS_MEDIDAS = {
  blusa: ['busto', 'cintura', 'quadril'],
  body: ['busto', 'cintura'],
  camisa: ['busto', 'cintura', 'quadril'],
  cropped: ['busto', 'cintura'],
  calça: ['cintura', 'quadril', 'comprimento'],
  short: ['cintura', 'quadril', 'comprimento'],
  vestido: ['busto', 'cintura', 'quadril', 'comprimento'],
  saia: ['cintura', 'quadril', 'comprimento']
}

function getMedidasCategoria(categoria) {
  const categoriaLimpa = (categoria ?? '').toString().trim().toLowerCase()
  return CATEGORIAS_MEDIDAS[categoriaLimpa] || CATEGORIAS_MEDIDAS.blusa
}

export default function MedidasCliente({ onNext, busto, setBusto, cintura, setCintura, quadril, setQuadril, naoSabeMedidas, setNaoSabeMedidas, roupaSelecionada }) {
  const medidasRelevantes = roupaSelecionada?.categoriaMedidas || getMedidasCategoria(roupaSelecionada?.categoria)
  const nomeRoupa = roupaSelecionada?.nome || roupaSelecionada?.name || 'Produto em destaque'

  return (
    <div className='card card-step medidas-step medidas-step-medidas'>
      <div className='medidas-step-visual medidas-step-visual-guide'>
        <img src={guiaMedidas} alt='Guia de medidas' />
        <div className='medidas-step-logo'>
          <strong>CROP.</strong>
        </div>
      </div>

      <div className='medidas-step-content'>
        <h2>Conte-nos suas medidas</h2>
        <p className='medidas-step-subtitle'>Preencha as medidas para {nomeRoupa} para gerar o mannequin correto.</p>

        <div className='medidas-step-field medidas-step-toggle'>
          <label className='medidas-step-checkbox' htmlFor='isMedidas'>
            <input id='isMedidas' type='checkbox' checked={naoSabeMedidas} onChange={(e) => setNaoSabeMedidas(e.target.checked)} />
            <span>Não sei minhas medidas</span>
          </label>
        </div>

        {!naoSabeMedidas && (
          <div className='medidas-step-fields'>
            {medidasRelevantes.includes('busto') && (
              <div className='medidas-step-field'>
                <label htmlFor='busto'>Busto</label>
                <div className='medidas-step-field-row'>
                  <input type='number' id='busto' min='25' max='120' placeholder='cm' value={busto ?? ''} onChange={(e) => setBusto(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span>cm</span>
                </div>
              </div>
            )}

            {medidasRelevantes.includes('cintura') && (
              <div className='medidas-step-field'>
                <label htmlFor='cintura'>Cintura</label>
                <div className='medidas-step-field-row'>
                  <input type='number' id='cintura' min='30' max='120' placeholder='cm' value={cintura ?? ''} onChange={(e) => setCintura(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span>cm</span>
                </div>
              </div>
            )}

            {medidasRelevantes.includes('quadril') && (
              <div className='medidas-step-field'>
                <label htmlFor='quadril'>Quadril</label>
                <div className='medidas-step-field-row'>
                  <input type='number' id='quadril' min='0' max='120' placeholder='cm' value={quadril ?? ''} onChange={(e) => setQuadril(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span>cm</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className='medidas-step-bottom'>
          <div className='medidas-step-dots' aria-label='Passo 2 de 2'>
            <span />
            <span className='active' />
          </div>
          <button className='medidas-step-next' type='button' onClick={onNext}>PRÓXIMO</button>
        </div>
      </div>
    </div>
  )
}
