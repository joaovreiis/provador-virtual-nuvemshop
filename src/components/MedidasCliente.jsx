import guiaMedidas from '../../public/_comoMedirCrop2.jpg';

const CATEGORIAS_MEDIDAS = {
  blusa: ['busto', 'cintura', 'quadril'],
  camisa: ['busto', 'cintura', 'quadril'],
  calça: ['cintura', 'quadril', 'comprimento'],
  vestido: ['busto', 'cintura', 'quadril', 'comprimento'],
  saia: ['cintura', 'quadril', 'comprimento']
}

function getMedidasCategoria(categoria) {
  const categoriaLimpa = (categoria ?? '').toString().trim().toLowerCase()
  return CATEGORIAS_MEDIDAS[categoriaLimpa] || CATEGORIAS_MEDIDAS.blusa
}

export default function MedidasCliente({ onNext, busto, setBusto, cintura, setCintura, quadril, setQuadril, naoSabeMedidas, setNaoSabeMedidas, roupaSelecionada }) {

    const medidasRelevantes = getMedidasCategoria(roupaSelecionada?.categoria)
    
    return (
        <div className='card card-step'>
            <div className='card-content'>
                <div className='card-copy'>
                    <p className='subtitle'>Passo 2</p>
                    <h2>Conte-nos suas medidas</h2>
                    <p className='description'>Preencha as medidas para {roupaSelecionada?.nome || 'a peça'} para gerar o mannequin correto.</p>

                    <div className="form-row-medidas">
                        <input id="isMedidas" type="checkbox" checked={naoSabeMedidas} onChange={(e) => setNaoSabeMedidas(e.target.checked)} />
                        <label htmlFor="isMedidas">Não sei minhas medidas</label>
                    </div>

                    {medidasRelevantes.includes('busto') && (
                      <div className='form-row' style={{display: naoSabeMedidas ? 'none' : 'grid'}} >
                          <label htmlFor='busto'>Busto</label>
                          <input type='number' id='busto' min='25' max='120' placeholder='cm' value={busto ?? ''} onChange={(e) => setBusto(e.target.value === '' ? '' : Number(e.target.value))} />
                      </div>
                    )}
                    
                    {medidasRelevantes.includes('cintura') && (
                      <div className='form-row' style={{display: naoSabeMedidas ? 'none' : 'grid'}}>
                          <label htmlFor='cintura'>Cintura</label>
                          <input type='number' id='cintura' min='30' max='120' placeholder='cm' value={cintura ?? ''} onChange={(e) => setCintura(e.target.value === '' ? '' : Number(e.target.value))} />
                      </div>
                    )}

                    {medidasRelevantes.includes('quadril') && (
                      <div className='form-row' style={{display: naoSabeMedidas ? 'none' : 'grid'}}>
                          <label htmlFor='quadril'>Quadril</label>
                          <input type='number' id='quadril' min='0' max='120' placeholder='cm' value={quadril ?? ''} onChange={(e) => setQuadril(e.target.value === '' ? '' : Number(e.target.value))} />
                      </div>
                    )}
                </div>
                <div className='card-visual'>
                    <img src={guiaMedidas} alt='' />
                </div>
            </div>
            
            <div className='card-footer'>
                <button className='btn-primary' type='button' onClick={onNext}>Próximo</button>
            </div>
        </div>
    )
}
