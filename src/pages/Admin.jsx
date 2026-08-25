import { useEffect, useState } from 'react'
import '../App.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api')).replace(/\/$/, '')

const CATEGORIAS_PADRAO = [
  { id: 1, nome: "Blusa", medidas: ["busto", "cintura", "quadril"] },
  { id: 2, nome: "Body", medidas: ["busto", "cintura"]},
  { id: 3, nome: "Calça", medidas: ["cintura", "quadril", "comprimento"]},
  { id: 4, nome: "Vestido", medidas: ["busto", "cintura", "quadril", "comprimento"]},
  { id: 6, nome: "Cropped", medidas: ["busto", "cintura"]},
  { id: 7, nome: "Short", medidas: ["cintura", "quadril", "comprimento"]},
  { id: 8, nome: "Saia", medidas: ["cintura", "quadril", "comprimento"]}
]

const MEDIDAS_DISPONIVEIS = [
  { chave: 'busto', nome: 'Busto' },
  { chave: 'cintura', nome: 'Cintura' },
  { chave: 'quadril', nome: 'Quadril' },
  { chave: 'comprimento', nome: 'Comprimento' }
]

const initialForm = { categoria: 'Blusa', name: '', description: '', sizes: [], image: '' }

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('adminToken')))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [adminView, setAdminView] = useState('create')
  const [selectedPieceIndex, setSelectedPieceIndex] = useState(null)
  const [editingPieceIndex, setEditingPieceIndex] = useState(null)

  const [pieces, setPieces] = useState(() => {
    try {
      const raw = localStorage.getItem('pieces')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO)
  const [categoriaModalAberto, setCategoriaModalAberto] = useState(false)
  const [categoriaForm, setCategoriaForm] = useState({ nome: '', medidas: [] })
  const [pesquisaCategoria, setPesquisaCategoria] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setAuthError('')

    if (!username.trim() || !password.trim()) {
      setAuthError('Preencha usuário e senha')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Falha ao autenticar')
      }

      if (!data?.token) {
        throw new Error('Resposta inválida da API')
      }

      localStorage.setItem('adminToken', data.token)
      setLoggedIn(true)
    } catch (error) {
      console.error('Login admin error:', error)
      setAuthError(error.message || 'Erro ao autenticar')
    }
  }

  function addSize() {
    const categoriaSelecionada = categorias.find(c => c.nome === form.categoria)
    const medidas = categoriaSelecionada?.medidas || []
    
    const measurements = {}
    medidas.forEach(m => {
      if (m === 'busto') measurements.bust = ''
      else if (m === 'cintura') measurements.waist = ''
      else if (m === 'quadril') measurements.hips = ''
      else if (m === 'comprimento') measurements.length = ''
    })
    
    setForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { label: '', measurements }]
    }))
  }

  function updateSize(index, key, value) {
    setForm(prev => {
      const sizes = [...prev.sizes]
      if (key === 'label') sizes[index].label = value
      else sizes[index].measurements[key] = value
      return { ...prev, sizes }
    })
  }
  
  function removeSize(index) {
    setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))
  }

  async function removePiece(index) {
    const piece = pieces[index]
    if (!piece) return

    try {
      if (piece.id) {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/roupas/${piece.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
          }
        })

        if (!response.ok) {
          throw new Error('Falha ao remover a peça')
        }
      }

      setPieces(prev => prev.filter((_, i) => i !== index))
      if (selectedPieceIndex === index) {
        setSelectedPieceIndex(null)
        setAdminView('list')
      }
      setDeleteConfirm(null)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Não foi possível remover a peça')
    } finally {
      setIsLoading(false)
    }
  }

  function showPieceDetails(index) {
    setSelectedPieceIndex(index)
    setAdminView('details')
  }

  function startEditingPiece(index) {
    const piece = pieces[index]
    if (!piece) return

    setForm({
      categoria: piece.categoria || 'blusa',
      name: piece.name || '',
      description: piece.description || '',
      image: piece.image || '',
      sizes: (piece.sizes || []).map(size => ({
        ...size,
        measurements: { ...(size.measurements || {}) }
      }))
    })
    setEditingPieceIndex(index)
    setAdminView('create')
  }

  function openCreateForm() {
    setForm(initialForm)
    setEditingPieceIndex(null)
    setAdminView('create')
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      alert('Por favor, preencha o nome da peça')
      return
    }

    const payload = {
      ...form,
      description: form.description || ''
    }

    try {
      setIsLoading(true)
      const editingPiece = editingPieceIndex !== null ? pieces[editingPieceIndex] : null
      const response = await fetch(
        editingPiece?.id ? `${API_BASE_URL}/roupas/${editingPiece.id}` : `${API_BASE_URL}/roupas`,
        {
        method: editingPiece?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw new Error('Falha ao salvar no banco')
      }

      const savedPiece = await response.json()
      const normalizedPiece = {
        ...savedPiece,
        id: savedPiece.id,
        name: savedPiece.nome,
        description: savedPiece.descricao,
        image: savedPiece.imagem,
        sizes: savedPiece.tamanhos || []
      }
      setPieces(prev => editingPieceIndex !== null
        ? prev.map((piece, index) => index === editingPieceIndex ? normalizedPiece : piece)
        : [normalizedPiece, ...prev]
      )
      setForm(initialForm)
      setEditingPieceIndex(null)
      setAdminView('list')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Não foi possível salvar a peça')
    } finally {
      setIsLoading(false)
    }
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function removeFormImage() {
    setForm(prev => ({ ...prev, image: '' }))
  }

  async function criarCategoria(e) {
    e.preventDefault()
    if (!categoriaForm.nome.trim() || categoriaForm.medidas.length === 0) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify(categoriaForm)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar a categoria')

      setCategorias(prev => [...prev, data])
      setCategoriaForm({ nome: '', medidas: [] })
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const categoriasFiltradas = categorias.filter(categoria => (
    categoria.nome.toLowerCase().includes(pesquisaCategoria.trim().toLowerCase())
  ))

  async function excluirCategoria(categoria) {
    if (!window.confirm(`Excluir a categoria ${categoria.nome}?`)) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/categorias/${categoria.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}` }
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível excluir a categoria')

      setCategorias(prev => prev.filter(item => item.id !== categoria.id))
      if (form.categoria === categoria.nome) {
        const proximaCategoria = categorias.find(item => item.id !== categoria.id)
        if (proximaCategoria) setForm(prev => ({ ...prev, categoria: proximaCategoria.nome, sizes: [] }))
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem('pieces', JSON.stringify(pieces))
    } catch {
      // Ignore storage errors.
    }
  }, [pieces])

  useEffect(() => {
    async function loadCategorias() {
      try {
        const response = await fetch(`${API_BASE_URL}/categorias`)
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) setCategorias(data)
      } catch (error) {
        console.error(error)
      }
    }

    loadCategorias()
  }, [])

  useEffect(() => {
    async function loadPieces() {
      try {
        const response = await fetch(`${API_BASE_URL}/roupas`)
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data)) {
          setPieces(data.map(piece => ({
            ...piece,
            name: piece.nome,
            description: piece.descricao,
            image: piece.imagem,
            sizes: piece.tamanhos || []
          })))
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadPieces()
  }, [])




  function getMedidasCategoria() {
    const categoriaSelecionada = categorias.find(c => c.nome === form.categoria)
    return categoriaSelecionada?.medidas || []
  }

  if (!loggedIn) {
    return (
      <div className='card card-step'>
        <div style={{ maxWidth: 520 }}>
          <p className='subtitle'>Area do Administrador</p>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className='form-row'>
              <label>Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className='form-row'>
              <label>Senha</label>
              <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {authError && <p className='description' style={{ color: '#b91c1c' }}>{authError}</p>}
            <div className='card-footer'>
              <button className='btn-primary' type='submit'>Entrar</button>
            </div>
          </form>
          <div style={{ marginTop: 18 }}>
            <button className='btn-voltar' onClick={() => (location.hash = '')}>Voltar ao site</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='card card-step'>
      <div>
        <div className='admin-header'>
          <div>
            <p className='subtitle'>Área do Administrador</p>
          </div>
          <div className='admin-actions'>
          </div>
        </div>

        <div className='admin-nav'>
          <button
            type='button'
            className={`btn-editar ${adminView === 'create' ? 'ativo' : ''}`}
            onClick={openCreateForm}
          >
            Cadastrar peça
          </button>
          <button
            type='button'
            className={`btn-editar ${adminView === 'list' ? 'ativo' : ''}`}
            onClick={() => setAdminView('list')}
          >
            Lista de peças
          </button>
          <button type='button' className='btn-editar' onClick={() => setCategoriaModalAberto(true)}>
            Categorias
          </button>
        </div>

        {adminView === 'create' && (
          <div className='admin-form admin-screen'>
            <form onSubmit={handleSubmit}>
            <h3 style={{ marginTop: 0 }}>{editingPieceIndex !== null ? 'Editar peça' : 'Cadastrar peça'}</h3>
            <div className='form-row'>
                <label>Selecione a categoria</label>
                <select name='categoria' value={form.categoria} onChange={handleChange}>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.nome}>
                      {categoria.nome.charAt(0).toUpperCase() + categoria.nome.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-row'>
                <label>Nome</label>
                <input name='name' value={form.name} onChange={handleChange} required/>
              </div>
              {/* <div className='form-row'>
                <label>Descrição</label>
                <input name='description' value={form.description} onChange={handleChange} required/>
              </div>*/}

              <div className='form-row'>
                <label>Imagem</label>
                <input type='file' accept='image/*' onChange={handleImageChange} required={!form.image}/>
                {form.image && (
                  <div className='admin-image-preview'>
                    <img src={form.image} alt='Preview da peca' />
                    <button type='button' className='btn-editar' onClick={removeFormImage}>Remover imagem</button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0 }}>Tamanhos</h3>
                <p className='description' style={{ marginTop: 6 }}>
                  Adicione tamanhos e as medidas correspondentes.
                </p>


                {form.sizes.map((size, i) => (
                  <div key={i} className='card admin-size-card'>
                    <div className='admin-size-row'>
                      <div style={{ flex: 1 }}>
                        <div className='form-row'>
                          <label>Etiqueta (ex: P, M, G)</label>
                          <input value={size.label} onChange={e => updateSize(i, 'label', e.target.value)} />
                        </div>
                        <div className='formMedidas-cadastro' style={{ marginTop: 8 }}>
                          {getMedidasCategoria().includes('busto') && (
                            <div>
                              <label>Busto (cm)</label>
                              <input value={size.measurements.bust || ''} onChange={e => updateSize(i, 'bust', e.target.value)} />
                            </div>
                          )}
                          {getMedidasCategoria().includes('cintura') && (
                            <div>
                              <label>Cintura (cm)</label>
                              <input value={size.measurements.waist || ''} onChange={e => updateSize(i, 'waist', e.target.value)} />
                            </div>
                          )}
                          {getMedidasCategoria().includes('quadril') && (
                            <div>
                              <label>Quadril (cm)</label>
                              <input value={size.measurements.hips || ''} onChange={e => updateSize(i, 'hips', e.target.value)} />
                            </div>
                          )}
                          {getMedidasCategoria().includes('comprimento') && (
                            <div>
                              <label>Comprimento (cm)</label>
                              <input value={size.measurements.length || ''} onChange={e => updateSize(i, 'length', e.target.value)} />
                            </div>
                          )}
                        </div>
                      </div>
                      <button type='button' className='btn-editar' onClick={() => removeSize(i)}>Remover</button>
                    </div>
                  </div>
                ))}

                <div className='admin-form-actions'>
                  <button type='button' className='btn-primary' onClick={addSize}>Adicionar tamanho</button>
                </div>
              </div>

              <div className='card-footer' style={{ marginTop: 18 }}>
                <button className='btn-primary' type='submit' disabled={isLoading}>
                  {isLoading ? 'Salvando...' : editingPieceIndex !== null ? 'Salvar alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {adminView === 'list' && (
          <div className='admin-pieces admin-screen'>
            <div className='admin-list-header'>
            </div>

            {pieces.length === 0 && <p className='description'>Nenhuma peça cadastrada.</p>}

            <div className='pieces-grid'>
              {pieces.map((piece, idx) => (
                <div key={idx} className='piece-card card'>
                  {piece.image && <img className='piece-image' src={piece.image} alt={piece.name} />}
                  <div className='piece-info'>
                    <h4 style={{ margin: '0 0 6px' }}>{piece.name}</h4>
                    <p className='description' style={{ margin: '0 0 8px' }}>{piece.description}</p>
                    <div className='sizes-row'>
                      {(piece.sizes ?? []).map((size, i) => (
                        <div key={i} className='size-badge'>
                          <div style={{ fontWeight: 700 }}>{size.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {size.measurements.bust && `Busto: ${size.measurements.bust}cm`} / {size.measurements.waist && `Cintura: ${size.measurements.waist}cm`} / {size.measurements.hips && `Quadril: ${size.measurements.hips}cm`} / {size.measurements.length && `Comprimento: ${size.measurements.length}cm`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='piece-actions'>
                      <button type='button' className='btn-editar' onClick={() => showPieceDetails(idx)}>Visualizar detalhes</button>
                      <button type='button' className='btn-editar' onClick={() => startEditingPiece(idx)}>Editar</button>
                      <button type='button' className='btn-excluir' onClick={() => setDeleteConfirm(idx)}>Excluir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminView === 'details' && pieces[selectedPieceIndex] && (
          <div className='admin-details admin-screen'>
            <button type='button' className='btn-voltar' onClick={() => setAdminView('list')}>
              Voltar
            </button>

            <div className='piece-details-grid'>
              <div className='piece-details-image'>
                {pieces[selectedPieceIndex].image ? (
                  <img src={pieces[selectedPieceIndex].image} alt={pieces[selectedPieceIndex].name} />
                ) : (
                  <div className='piece-details-placeholder'>Sem imagem</div>
                )}
              </div>
              
              <div className='piece-details-info'>
                <h3>{pieces[selectedPieceIndex].name}</h3>
                <p className='description' style={{ marginBottom: 12 }}>
                  <strong>Categoria:</strong> {pieces[selectedPieceIndex].categoria?.charAt(0).toUpperCase() + pieces[selectedPieceIndex].categoria?.slice(1) || 'Não especificada'}
                </p>

                <h4>Medidas por tamanho</h4>
                <div className='details-sizes-grid'>
                  {(pieces[selectedPieceIndex].sizes ?? []).map((size, i) => (
                    <div key={i} className='details-size-card'>
                      <strong>{size.label}</strong>
                      <dl>
                        {size.measurements.bust && (
                          <div>
                            <dt>Busto</dt>
                            <dd>{size.measurements.bust} cm</dd>
                          </div>
                        )}
                        {size.measurements.waist && (
                          <div>
                            <dt>Cintura</dt>
                            <dd>{size.measurements.waist} cm</dd>
                          </div>
                        )}
                        {size.measurements.hips && (
                          <div>
                            <dt>Quadril</dt>
                            <dd>{size.measurements.hips} cm</dd>
                          </div>
                        )}
                        {size.measurements.length && (
                          <div>
                            <dt>Comprimento</dt>
                            <dd>{size.measurements.length} cm</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f0f0f0',
              borderTop: '4px solid #333',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>Carregando...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      {deleteConfirm !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 10px', color: '#333' }}>Confirmar Exclusão</h3>
            <p style={{ margin: '0 0 20px', color: '#666' }}>
              Tem certeza que deseja excluir <strong>{pieces[deleteConfirm]?.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                type='button'
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#000000'
                }}
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={() => removePiece(deleteConfirm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {categoriaModalAberto && (
        <div className='modal-admin-overlay' onClick={() => setCategoriaModalAberto(false)}>
          <div className='modal-admin' onClick={e => e.stopPropagation()}>
            <div className='modal-admin-header'>
              <h3>Gerenciar categorias</h3>
              <button type='button' className='btn-fechar-modal' onClick={() => setCategoriaModalAberto(false)} aria-label='Fechar'>X</button>
            </div>

            <form onSubmit={criarCategoria}>
              <div className='form-row'>
                <label htmlFor='nova-categoria'>Nome da categoria</label>
                <input
                  id='nova-categoria'
                  value={categoriaForm.nome}
                  onChange={e => setCategoriaForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder='Ex.: Jaqueta'
                  required
                />
              </div>
              <fieldset className='categoria-medidas'>
                <legend>Tipos de medidas</legend>
                {MEDIDAS_DISPONIVEIS.map(medida => (
                  <label key={medida.chave}>
                    <input
                      type='checkbox'
                      checked={categoriaForm.medidas.includes(medida.chave)}
                      onChange={e => setCategoriaForm(prev => ({
                        ...prev,
                        medidas: e.target.checked
                          ? [...prev.medidas, medida.chave]
                          : prev.medidas.filter(item => item !== medida.chave)
                      }))}
                    />
                    {medida.nome}
                  </label>
                ))}
              </fieldset>
              <button className='btn-primary' type='submit' disabled={isLoading || categoriaForm.medidas.length === 0}>
                Criar categoria
              </button>
            </form>

            <div className='categorias-lista'>
              <h4>Lista de categorias</h4>
              <input
                type='search'
                aria-label='Pesquisar categorias'
                placeholder='Pesquisar categoria'
                value={pesquisaCategoria}
                onChange={e => setPesquisaCategoria(e.target.value)}
              />
              {categoriasFiltradas.map(categoria => (
                <div className='categoria-item' key={categoria.id}>
                  <div>
                    <strong>{categoria.nome}</strong>
                    <span>{categoria.medidas.map(medida => MEDIDAS_DISPONIVEIS.find(item => item.chave === medida)?.nome).join(', ')}</span>
                  </div>
                  <button type='button' className='btn-excluir' onClick={() => excluirCategoria(categoria)}>Excluir</button>
                </div>
              ))}
              {categoriasFiltradas.length === 0 && <p className='description'>Nenhuma categoria encontrada.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
