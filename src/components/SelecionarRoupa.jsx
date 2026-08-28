function normalizarProduto(produto, index, categorias = []) {
  const categoria = categorias.find(item => item.nome.toLowerCase() === (produto.categoria ?? '').toLowerCase())
  return {
    id: produto.id ?? `admin-${index}`,
    nome: produto.nome ?? produto.name ?? 'Peca sem nome',
    imagem: produto.imagem ?? produto.image ?? '',
    descricao: produto.descricao ?? produto.description ?? '',
    categoria: produto.categoria ?? '',
    categoriaMedidas: categoria?.medidas,
    tamanhos: produto.tamanhos ?? produto.sizes ?? []
  }
}

const CATEGORIAS_PADRAO = [
  { nome: 'Blusa', medidas: ['busto', 'cintura', 'quadril'] },
  { nome: 'Body', medidas: ['busto', 'cintura'] },
  { nome: 'Calça', medidas: ['cintura', 'quadril', 'comprimento'] },
  { nome: 'Vestido', medidas: ['busto', 'cintura', 'quadril', 'comprimento'] },
  { nome: 'Cropped', medidas: ['busto', 'cintura'] },
  { nome: 'Short', medidas: ['cintura', 'quadril', 'comprimento'] },
  { nome: 'Saia', medidas: ['cintura', 'quadril', 'comprimento'] }
]
const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api')).replace(/\/$/, '')

function normalizarCategoria(categoria) {
  return String(categoria ?? '').trim().toLocaleLowerCase('pt-BR')
}

function carregarRoupasLocais() {
  try {
    const raw = localStorage.getItem('pieces')
    const roupasAdmin = raw ? JSON.parse(raw) : []

    if (Array.isArray(roupasAdmin) && roupasAdmin.length > 0) {
      return roupasAdmin.map((produto, index) => normalizarProduto(produto, index, CATEGORIAS_PADRAO))
    }
  } catch {
    // Sem roupas quando o armazenamento local nao puder ser lido.
  }

  return []
}

import { useEffect, useState } from 'react'

export default function SelecionarRoupa({ roupaSelecionada, setRoupaSelecionada, onNext }) {
  const [roupas, setRoupas] = useState(() => carregarRoupasLocais())
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO)
  const [carregando, setCarregando] = useState(true)
  const roupaAtual = roupaSelecionada ?? roupas[0]
  const [pesquisa, setPesquisa] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  useEffect(() => {
    let isMounted = true

    async function carregarRoupas() {
      setCarregando(true)

      try {
        const [roupasResponse, categoriasResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/roupas`),
          fetch(`${API_BASE_URL}/categorias`)
        ])
        if (!roupasResponse.ok) {
          throw new Error('Falha ao carregar roupas')
        }

        const data = await roupasResponse.json()
        if (!Array.isArray(data)) {
          throw new Error('Resposta inválida do servidor')
        }

        const categoriasApi = categoriasResponse.ok ? await categoriasResponse.json() : CATEGORIAS_PADRAO
        if (Array.isArray(categoriasApi) && categoriasApi.length > 0) setCategorias(categoriasApi)
        const roupasApi = data.map((produto, index) => normalizarProduto(produto, index, categoriasApi))

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
    const matchCategoria = !categoriaFiltro || normalizarCategoria(roupa.categoria) === normalizarCategoria(categoriaFiltro)
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
            {categorias.map(cat => (
              <option key={cat.id ?? cat.nome} value={cat.nome}>
                {cat.nome}
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
