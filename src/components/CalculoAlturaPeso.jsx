export default function CalculoAlturaPeso({ onNext, altura, setAltura, peso, setPeso, idade, setIdade, roupaSelecionada }) {

  const isButtonEnabled = (() => {
    const alturaNumero = Number(altura)
    const pesoNumero = Number(peso)
    const idadeNumero = Number(idade)

    return altura !== '' && Number.isFinite(alturaNumero) && alturaNumero >= 50 && alturaNumero <= 300
      && peso !== '' && Number.isFinite(pesoNumero) && pesoNumero >= 30 && pesoNumero <= 200
      && idade !== '' && Number.isFinite(idadeNumero) && idadeNumero >= 1 && idadeNumero <= 120
  })()
  const imagemRoupa = roupaSelecionada?.imagem || roupaSelecionada?.image || '/produtos/produto1.png';
  const nomeRoupa = roupaSelecionada?.nome || roupaSelecionada?.name || 'Produto em destaque';

  return (
    <div className='card card-step'>
      <div className='card-content'>
        <div className='card-copy'>
          <p className='subtitle'>Passo 1</p>
          <h2>Informe suas medidas antropométricas</h2>
          <p className='description'>Preencha com sua altura, peso e idade.</p>

          <div className='form-row'>
            <label htmlFor='altura'>Altura</label>
            <input type='number' id='altura' min='50' max='300' placeholder='cm' value={altura ?? ''} onChange={(e) => setAltura(e.target.value)} />
          </div>

          <div className='form-row'>
            <label htmlFor='peso'>Peso</label>
            <input type='number' id='peso' min='30' max='200' placeholder='kg' value={peso ?? ''} onChange={(e) => setPeso(e.target.value)} />
          </div>

          <div className='form-row'>
            <label htmlFor='idade'>Idade</label>
            <input type='number' id='idade' min='1' max='120' placeholder='anos' value={idade ?? ''} onChange={(e) => setIdade(e.target.value)} />
          </div>
        </div>

        <div className='card-visual roupa-passo-visual'>
          <img src={imagemRoupa} alt={nomeRoupa} />
          <strong>{nomeRoupa}</strong>
        </div>
      </div>

      <div className='card-footer'>
        <button className='btn-primary' type='button' disabled={!isButtonEnabled} onClick={onNext}>Próximo</button>
      </div>
    </div>
  )
}
