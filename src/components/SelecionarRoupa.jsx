function normalizarProduto(produto, index) {
  return {
    id: produto.id ?? `admin-${index}`,
    nome: produto.nome ?? produto.name ?? 'Peca sem nome',
    imagem: produto.imagem ?? produto.image ?? '',
    descricao: produto.descricao ?? produto.description ?? '',
    categoria: produto.categoria ?? '',
    tamanhos: produto.tamanhos ?? produto.sizes ?? []
  }
}

const CATEGORIAS = ['blusa', 'body', 'calça', 'vestido', 'saia', 'short', 'cropped',  ]
const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api')).replace(/\/$/, '')

function carregarRoupasLocais() {
  try {
    const raw = localStorage.getItem('pieces')
    const roupasAdmin = raw ? JSON.parse(raw) : []

    if (Array.isArray(roupasAdmin) && roupasAdmin.length > 0) {
      return roupasAmin.map(normalizarProduto)
    }
  } catch {
    // Sem roupas quando o armazenamento local nao puder ser lido.
  }

  return []
}

import { useEffect, useState } from 'react'

export default function SelecionarRoupa({ roupaSelecionada, setRoupaSelecionada, onNext }) {
  const [roupas, setRoupas] = useState(() => carregarRoupasLocais())
  const [carregando, setCarregando] = useState(true)
  const roupaAtual = roupaSelecionada ?? roupas[0]
  const [pesquisa, setPesquisa] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  useEffect(() => {
    let isMounted = true

    async function carregarRoupas() {
      setCarregando(true)

      try {
        const response = await fetch(`${API_BASE_URL}/roupas`)
        if (!response.ok) {
          throw new Error('Falha ao carregar roupas')
        }

        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Resposta inválida do servidor')
        }

        const roupasApi = data.map(normalizarProduto)

        if (isMounted) {
          setRoupas(roupasApi)
          try {
            localStorage.setItem('pieces', JSON.stringify(roupasApi))
          } catch {
            // Ignora falhas de armazenamento local.
          }
        }
      } catch (error) {
        console.error(error)

        if (isMounted) {
          const roupasLocais = carregarRoupasLocais()
          if (roupasLocais.length > 0) {
            setRoupas(roupasLocais)
          }
        }
      } finally {
        if (isMounted) {
          setCarregando(false)
        }
      }
    }

    carregarRoupas()

    return () => {
      isMounted = false
    }
  }, [])

  const roupasFiltradas = roupas.filter(roupa => {
    const pesquisaBaixa = pesquisa.toLowerCase()
    const matchPesquisa = roupa.nome.toLowerCase().includes(pesquisaBaixa) || 
                         roupa.descricao.toLowerCase().includes(pesquisaBaixa)
    const matchCategoria = !categoriaFiltro || roupa.categoria === categoriaFiltro
    return matchPesquisa && matchCategoria
  })

  function selecionarRoupa(roupa) {
    setRoupaSelecionada(roupa)
  }

  function avancar() {
    const roupaParaProvar = roupaSelecionada ?? roupasFiltradas[0]

    setRoupaSelecionada(roupaParaProvar)
    onNext(roupaParaProvar)
  }

  return (
    <div className='card card-step'>
      <div className='card-copy selecionar-roupa-header'>
        <h2 className="subtitle">VITRINE</h2>
        <h2>Escolha a roupa que deseja provar</h2>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className='form-row' style={{ marginBottom: 12 }}>
          <label htmlFor='pesquisa'>Pesquisar</label>
          <input 
            id='pesquisa'
            type='text'
            placeholder='Digite o nome da roupa' 
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <div className='form-row'>
          <label htmlFor='categoria'>Filtrar por categoria</label>
          <select 
            id='categoria'
            value={categoriaFiltro} 
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value=''>Todas as categorias</option>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carregando && roupas.length === 0 ? (
        <div className='empty-state'>
          <h3>Carregando...</h3>
        </div>
      ) : roupasFiltradas.length === 0 ? (
        <div className='empty-state'>
          <h3>{roupas.length === 0 ? 'Nenhuma peça cadastrada' : 'Nenhuma peça encontrada'}</h3>
        </div>
      ) : (
        <div className='roupas-grid'>
          {roupasFiltradas.map((roupa) => {
            const selecionada = roupaAtual?.id === roupa.id

            return (
              <button
                key={roupa.id}
                type='button'
                className={`roupa-card ${selecionada ? 'selecionada' : ''}`}
                onClick={() => selecionarRoupa(roupa)}
                aria-pressed={selecionada}
              >
                <span className='roupa-image-wrap'>
                  {roupa.imagem ? (
                    <img src={roupa.imagem} alt={roupa.nome} />
                  ) : (
                    <span className='roupa-image-placeholder'>Sem imagem</span>
                  )}
                </span>

                <span className='roupa-info'>
                  <strong>{roupa.nome}</strong>
                  {roupa.categoria && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
                      {roupa.categoria.charAt(0).toUpperCase() + roupa.categoria.slice(1)}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className='card-footer'>
        <button className='btn-primary' type='button' onClick={avancar} disabled={roupasFiltradas.length === 0}>
          Proximo
        </button>
      </div>
    </div>
  )
}
