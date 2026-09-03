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
  const [medidasModalAberto, setMedidasModalAberto] = useState(false)
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [idade, setIdade] = useState('')
  const [busto, setBusto] = useState()
  const [cintura, setCintura] = useState()
  const [quadril, setQuadril] = useState()
  const [naoSabeMedidas, setNaoSabeMedidas] = useState(false)
  const [roupaSelecionada, setRoupaSelecionada] = useState()
  const [formatoCorpo, setFormatoCorpo] = useState('030303')
  const [transicaoModal, setTransicaoModal] = useState(false)
  const [transicaoRecomendacao, setTransicaoRecomendacao] = useState(false)
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false,
  }))

  useEffect(() => {
    function onHash() {
      setRoute(location.hash || '')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    function handleViewportChange() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isPortrait: window.innerHeight > window.innerWidth,
      })
    }

    handleViewportChange()
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
    }
  }, [])

  const handleShowRecommendation = (formato, medidasDoMannequin) => {
    if (formato) setFormatoCorpo(formato)
    if (naoSabeMedidas && medidasDoMannequin) {
      setBusto(medidasDoMannequin.busto)
      setCintura(medidasDoMannequin.cintura)
      setQuadril(medidasDoMannequin.quadril)
    }

    setTransicaoRecomendacao(true)
    window.setTimeout(() => {
      setTransicaoRecomendacao(false)
      setMostrarRecomendacao(true)
    }, 1000)
  }

  const handleCloseRecommendation = () => {
    setTransicaoRecomendacao(false)
    setMostrarRecomendacao(false)
  }

  const handleRestartFlow = () => {
    setTransicaoRecomendacao(false)
    setMostrarRecomendacao(false)
    setMedidasModalAberto(false)
    setStep(0)
    setRoupaSelecionada(undefined)
    setAltura('')
    setPeso('')
    setIdade('')
    setBusto(undefined)
    setCintura(undefined)
    setQuadril(undefined)
    setNaoSabeMedidas(false)
    setFormatoCorpo('030303')
  }

  const handleSelecionarRoupa = (roupa) => {
    setRoupaSelecionada(roupa)
    setNaoSabeMedidas(false)
    setMedidasModalAberto(true)
  }

  const iniciarTransicaoModal = (proximoStep) => {
    setTransicaoModal(true)
    window.setTimeout(() => {
      setTransicaoModal(false)
      setMedidasModalAberto(false)
      setStep(proximoStep)
    }, 1000)
  }

  const mostrarModalDeMedidas = medidasModalAberto || step === 2

  const handleCloseMedidasModal = () => {
    setTransicaoModal(false)
    setMedidasModalAberto(false)
    setStep(0)
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
            {step === 1 && <CalculoAlturaPeso onNext={() => iniciarTransicaoModal(2)} altura={altura} setAltura={setAltura} peso={peso} setPeso={setPeso} idade={idade} setIdade={setIdade} roupaSelecionada={roupaSelecionada} />}
          </>
        )}
      </section>

      {step === 3 && !mostrarRecomendacao && (
        <div className='medidas-modal-overlay' onClick={() => setStep(0)}>
          <div className='medidas-modal' role='dialog' aria-modal='true' aria-labelledby='mannequin-modal-title' onClick={(event) => event.stopPropagation()}>
            <button className='medidas-modal-close' type='button' aria-label='Fechar ajuste do manequim' onClick={() => setStep(0)}>x</button>
            <h2 id='mannequin-modal-title' className='sr-only'>Ajuste do manequim</h2>
            <div className='medidas-modal-content'>
              {transicaoRecomendacao ? (
                <div className='medidas-transition-screen'>
                  <div className='medidas-transition-spinner' aria-label='Carregando recomendação' />
                  <span>Preparando sua recomendação...</span>
                </div>
              ) : (
                <Mannequin onBack={() => setStep(0)} onShowRecommendation={handleShowRecommendation} usarMedidasMannequin={naoSabeMedidas} altura={altura} peso={peso} busto={busto} cintura={cintura} quadril={quadril} roupaSelecionada={roupaSelecionada} />
              )}
            </div>
          </div>
        </div>
      )}

      {step === 0 && !medidasModalAberto && (
        <div className='medidas-modal-overlay selecionar-roupa-modal-overlay' onClick={() => setStep(0)}>
          <div className='medidas-modal selecionar-roupa-modal' role='dialog' aria-modal='true' aria-labelledby='selecionar-roupa-title' onClick={(event) => event.stopPropagation()}>
            <button className='medidas-modal-close' type='button' aria-label='Fechar seleção de roupa' onClick={() => setStep(-1)}>x</button>
            <h2 id='selecionar-roupa-title' className='sr-only'>Selecione a roupa</h2>
            <SelecionarRoupa roupaSelecionada={roupaSelecionada} setRoupaSelecionada={setRoupaSelecionada} onNext={handleSelecionarRoupa} />
          </div>
        </div>
      )}

      {mostrarModalDeMedidas && (
        <div className='medidas-modal-overlay' onClick={handleCloseMedidasModal}>
          <div className='medidas-modal' role='dialog' aria-modal='true' aria-labelledby='medidas-modal-title' onClick={(event) => event.stopPropagation()}>
            <button className='medidas-modal-close' type='button' aria-label='Fechar formulário de medidas' onClick={handleCloseMedidasModal}>x</button>
            <h2 id='medidas-modal-title' className='sr-only'>Informe suas medidas</h2>
            <div className='medidas-modal-content'>
              {transicaoModal ? (
                <div className='medidas-transition-screen'>
                  <div className='medidas-transition-spinner' aria-label='Carregando próxima etapa' />
                  <span>Preparando sua próxima etapa...</span>
                </div>
              ) : medidasModalAberto ? (
                <CalculoAlturaPeso onNext={() => iniciarTransicaoModal(2)} altura={altura} setAltura={setAltura} peso={peso} setPeso={setPeso} idade={idade} setIdade={setIdade} roupaSelecionada={roupaSelecionada} />
              ) : (
                <MedidasCliente onNext={() => iniciarTransicaoModal(3)} busto={busto} setBusto={setBusto} cintura={cintura} setCintura={setCintura} quadril={quadril} setQuadril={setQuadril} naoSabeMedidas={naoSabeMedidas} setNaoSabeMedidas={setNaoSabeMedidas} roupaSelecionada={roupaSelecionada} />
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarRecomendacao && (
        <RecomendarTamanho 
          tamanhoRecomendado={tamanhoRecomendado}
          onClose={handleCloseRecommendation}
          onRestart={handleRestartFlow}
          onBack={() => {
            setMostrarRecomendacao(false)
            setStep(3)
          }}
          onSizeChange={setTamanhoRecomendado}
          altura={altura}
          peso={peso}
          idade={idade}
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