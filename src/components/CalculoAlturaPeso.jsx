export default function CalculoAlturaPeso({ onNext, altura, setAltura, peso, setPeso, idade, setIdade, roupaSelecionada }) {
  const alturaNumero = Number(altura)
  const pesoNumero = Number(peso)
  const idadeNumero = Number(idade)
  const isButtonEnabled = altura !== '' && Number.isFinite(alturaNumero) && alturaNumero >= 50 && alturaNumero <= 300
    && peso !== '' && Number.isFinite(pesoNumero) && pesoNumero >= 30 && pesoNumero <= 200
    && idade !== '' && Number.isFinite(idadeNumero) && idadeNumero >= 1 && idadeNumero <= 120
  const imagemRoupa = roupaSelecionada?.imagem || roupaSelecionada?.image || '/produtos/produto1.png'
  const nomeRoupa = roupaSelecionada?.nome || roupaSelecionada?.name || 'Produto em destaque'

  return (
    <div className='card card-step medidas-step'>
      <div className='medidas-step-visual'>
        <img src={imagemRoupa} alt={nomeRoupa} />
        <div className='medidas-step-logo'>
          <strong>CROP.</strong>
        </div>
        <span className='medidas-step-product'>{nomeRoupa}</span>
      </div>

      <div className='medidas-step-content'>
        <h2>Seja bem vinda ao provador virtual</h2>
        <p className='medidas-step-subtitle'>Preencha os dados para experimentar este produto</p>

        <div className='medidas-step-field'>
          <label htmlFor='altura'>Altura</label>
          <div className='medidas-step-field-row'>
            <input type='number' id='altura' min='50' max='300' value={altura ?? ''} onChange={(e) => setAltura(e.target.value)} />
            <span>cm</span>
          </div>
        </div>

        <div className='medidas-step-field'>
          <label htmlFor='peso'>Peso</label>
          <div className='medidas-step-field-row'>
            <input type='number' id='peso' min='30' max='200' value={peso ?? ''} onChange={(e) => setPeso(e.target.value)} />
            <span>kg</span>
          </div>
        </div>

        <div className='medidas-step-field'>
          <label htmlFor='idade'>Idade</label>
          <div className='medidas-step-field-row'>
            <input type='number' id='idade' min='1' max='120' value={idade ?? ''} onChange={(e) => setIdade(e.target.value)} />
            <span>anos</span>
            <span className='medidas-step-info' title='Usamos sua idade apenas para ajustar o caimento' aria-label='Informação sobre o uso da idade'>i</span>
          </div>
        </div>

        <div className='medidas-step-bottom'>
          <div className='medidas-step-dots' aria-label='Passo 1 de 2'>
            <span className='dots active' />
            <span className="dots" />
            <span className="dots" />
          </div>
          <button className='medidas-step-next' type='button' disabled={!isButtonEnabled} onClick={onNext}>PRÓXIMO</button>
        </div>
      </div>
    </div>
  )
}
