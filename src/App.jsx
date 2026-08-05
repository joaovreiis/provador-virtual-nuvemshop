import { useEffect, useState } from 'react'
import './App.css'
import Mannequin from './components/Mannequin.jsx'
import CalculoAlturaPeso from './components/CalculoAlturaPeso.jsx'
import RecomendarTamanho from './components/RecomendarTamanho.jsx'
import MedidasCliente from './components/MedidasCliente.jsx'
import SelecionarRoupa from './components/SelecionarRoupa.jsx'
import AdminPage from './pages/Admin.jsx'

export default function App() {
  const [step, setStep] = useState(0)
  const [mostrarRecomendacao, setMostrarRecomendacao] = useState(false)
  const [tamanhoRecomendado, setTamanhoRecomendado] = useState('P')
  const [route, setRoute] = useState(location.hash || '')
  const [altura, setAltura] = useState()
  const [peso, setPeso] = useState()
  const [idade, setIdade] = useState()
  const [busto, setBusto] = useState()
  const [cintura, setCintura] = useState()
  const [quadril, setQuadril] = useState()
  const [naoSabeMedidas, setNaoSabeMedidas] = useState(false)
  const [roupaSelecionada, setRoupaSelecionada] = useState()
  const [formatoCorpo, setFormatoCorpo] = useState('030303')
  
  useEffect(() => {
    function onHash() {
      setRoute(location.hash || '')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleShowRecommendation = (formato, medidasDoMannequin) => {
    if (formato) setFormatoCorpo(formato)
    if (naoSabeMedidas && medidasDoMannequin) {
      setBusto(medidasDoMannequin.busto)
      setCintura(medidasDoMannequin.cintura)
      setQuadril(medidasDoMannequin.quadril)
    }
    setMostrarRecomendacao(true)
  }

  const handleCloseRecommendation = () => {
    setMostrarRecomendacao(false)
  }

  const handleSelecionarRoupa = (roupa) => {
    setRoupaSelecionada(roupa)
    setNaoSabeMedidas(false)
    setStep(1)
  }

  return (
    <main className='app'>
      <header className='app-header'>
        <div className='titulo'>
          <p className='eyebrow'>Provador Virtual</p>
          <h1>Experimente nossas roupas com suas medidas</h1>
        </div>
      </header>

      <section className='page-content'>
        {route === '#/admin' ? (
          <AdminPage />
        ) : (
          <>
            {step === 0 && <SelecionarRoupa roupaSelecionada={roupaSelecionada} setRoupaSelecionada={setRoupaSelecionada} onNext={handleSelecionarRoupa} />}
            {step === 1 && <CalculoAlturaPeso onNext={() => setStep(2)} altura={altura} setAltura={setAltura} peso={peso} setPeso={setPeso} idade={idade} setIdade={setIdade} roupaSelecionada={roupaSelecionada} />}
            {step === 2 && <MedidasCliente onNext={() => setStep(3)} busto={busto} setBusto={setBusto} cintura={cintura} setCintura={setCintura} quadril={quadril} setQuadril={setQuadril} naoSabeMedidas={naoSabeMedidas} setNaoSabeMedidas={setNaoSabeMedidas} roupaSelecionada={roupaSelecionada} />}
            {step === 3 && <Mannequin onBack={() => setStep(0)} onShowRecommendation={handleShowRecommendation} usarMedidasMannequin={naoSabeMedidas} altura={altura} peso={peso} busto={busto} cintura={cintura} quadril={quadril} roupaSelecionada={roupaSelecionada} />}
          </>
        )}
      </section>

      {mostrarRecomendacao && (
        <RecomendarTamanho 
          tamanhoRecomendado={tamanhoRecomendado}
          onClose={handleCloseRecommendation}
          onBack={() => {
            setMostrarRecomendacao(false)
            setStep(3)
          }}
          onSizeChange={setTamanhoRecomendado}
          altura={altura}
          peso={peso}
          busto={busto}
          setBusto={setBusto}
          cintura={cintura}
          setCintura={setCintura}
          quadril={quadril}
          setQuadril={setQuadril}
          formatoCorpo={formatoCorpo}
          roupaSelecionada={roupaSelecionada}
        />
      )}
    </main>
  )
}
