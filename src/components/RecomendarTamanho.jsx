import { useEffect, useMemo, useState } from 'react';

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

const CAMPOS_MEDIDAS = [
  { key: 'busto', label: 'Busto', posicao: 'busto' },
  { key: 'cintura', label: 'Cintura', posicao: 'cintura' },
  { key: 'quadril', label: 'Quadril', posicao: 'quadril' },
  { key: 'comprimento', label: 'Comprimento', posicao: 'comprimento' }
];

function medidaNumero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function getMedidasCategoria(categoria) {
  return CATEGORIAS_MEDIDAS[categoria?.toLowerCase()] || CATEGORIAS_MEDIDAS.blusa
}

function normalizarTamanho(tamanho) {
  const medidas = tamanho.measurements ?? tamanho.medidas ?? {};

  return {
    label: tamanho.label ?? tamanho.size ?? tamanho.tamanho ?? '',
    busto: medidaNumero(tamanho.busto ?? medidas.busto ?? medidas.bust),
    cintura: medidaNumero(tamanho.cintura ?? medidas.cintura ?? medidas.waist),
    quadril: medidaNumero(tamanho.quadril ?? medidas.quadril ?? medidas.hips)
  };
}

function classificarAjuste(medidaCliente, medidaRoupa) {
  if (medidaCliente == null || medidaRoupa == null) return 'indefinido';

  const folga = medidaRoupa - medidaCliente;

  if (folga < -2 || folga > 6) return 'critico';
  if (folga > 3) return 'atencao';
  return 'perfeito';
}

function textoAjuste(status, folga) {
  if (status === 'critico') return folga < 0 ? 'Muito apertado' : 'Muito folgado';
  if (status === 'atencao') return folga < 0 ? 'Justo' : 'Folgado';
  if (status === 'perfeito') return 'Perfeito';
  return 'Sem medida';
}

function pontuarTamanho(tamanho, medidasCliente, medidasRelevantes) {
  const camposFiltrados = CAMPOS_MEDIDAS.filter(campo => medidasRelevantes.includes(campo.key))
  
  return camposFiltrados.reduce((score, campo) => {
    const medidaCliente = medidasCliente[campo.key];
    const medidaRoupa = tamanho[campo.key];

    if (medidaCliente == null || medidaRoupa == null) return score + 100;

    const folga = medidaRoupa - medidaCliente;
    const alvoConforto = 2;
    const penalidadeApertado = folga < -2 ? Math.abs(folga) * 12 : 0;
    const penalidadeFolgado = folga > 5 ? (folga - 5) * 4 : 0;

    return score + Math.abs(folga - alvoConforto) + penalidadeApertado + penalidadeFolgado;
  }, 0);
}

export default function RecomendarTamanho({
  tamanhoRecomendado,
  onClose,
  onSizeChange,
  altura,
  peso,
  idade,
  busto,
  setBusto,
  cintura,
  setCintura,
  quadril,
  setQuadril,
  formatoCorpo,
  roupaSelecionada
}) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(tamanhoRecomendado);
  const [editandoMedidas, setEditandoMedidas] = useState(false);
  const [mostrarMedidas, setMostrarMedidas] = useState(false);
  const [medidasEditadas, setMedidasEditadas] = useState({
    busto: busto ?? '',
    cintura: cintura ?? '',
    quadril: quadril ?? '',
    comprimento: ''
  });

  const mannequinSrc = `/mannequin_formatos/${formatoCorpo || '030303'}.jpg`;
  const imagemRoupa = roupaSelecionada?.imagem || roupaSelecionada?.image || '/produtos/produto1.png';
  const nomeRoupa = roupaSelecionada?.nome || roupaSelecionada?.name || 'Peça selecionada';
  const medidasCliente = useMemo(() => ({
    busto: medidaNumero(busto),
    cintura: medidaNumero(cintura),
    quadril: medidaNumero(quadril),
    comprimento: medidaNumero(medidasEditadas.comprimento)
  }), [busto, cintura, quadril, medidasEditadas.comprimento]);

  const tamanhosRoupa = useMemo(() => {
    const tamanhos = roupaSelecionada?.tamanhos ?? roupaSelecionada?.sizes ?? [];
    return tamanhos.map(normalizarTamanho).filter((tamanho) => tamanho.label);
  }, [roupaSelecionada]);

  const medidasRelevantes = roupaSelecionada?.categoriaMedidas || getMedidasCategoria(roupaSelecionada?.categoria)

  const tamanhoIdeal = useMemo(() => {
    if (tamanhosRoupa.length === 0) return null;

    return tamanhosRoupa.reduce((melhor, tamanho) => (
      pontuarTamanho(tamanho, medidasCliente, medidasRelevantes) < pontuarTamanho(melhor, medidasCliente, medidasRelevantes) ? tamanho : melhor
    ), tamanhosRoupa[0]);
  }, [tamanhosRoupa, medidasCliente, medidasRelevantes]);

  useEffect(() => {
    if (!tamanhoIdeal?.label) return;

    setTamanhoSelecionado(tamanhoIdeal.label);
    if (onSizeChange) onSizeChange(tamanhoIdeal.label);
  }, [tamanhoIdeal?.label, onSizeChange]);

  const tamanhoAtual = tamanhosRoupa.find((tamanho) => tamanho.label === tamanhoSelecionado) ?? tamanhoIdeal;
  const tamanhosMais = tamanhosRoupa.filter((tamanho) => tamanho.label !== tamanhoSelecionado);
  const ajustes = CAMPOS_MEDIDAS
    .filter((campo) => medidasRelevantes.includes(campo.key))
    .map((campo) => ({
      ...campo,
      folga: tamanhoAtual?.[campo.key] == null || medidasCliente[campo.key] == null
        ? null
        : tamanhoAtual[campo.key] - medidasCliente[campo.key],
      status: classificarAjuste(medidasCliente[campo.key], tamanhoAtual?.[campo.key])
    }));

  const handleSizeChange = (novo) => {
    setTamanhoSelecionado(novo);
    if (onSizeChange) onSizeChange(novo);
  };

  const abrirEdicaoMedidas = () => {
    setMedidasEditadas({
      busto: busto ?? '',
      cintura: cintura ?? '',
      quadril: quadril ?? '',
      comprimento: medidasEditadas.comprimento ?? ''
    });
    setEditandoMedidas(true);
  };

  const handleMedidaChange = (campo, valor) => {
    setMedidasEditadas((medidasAtuais) => ({
      ...medidasAtuais,
      [campo]: valor
    }));
  };

  const salvarMedidas = () => {
    if (setBusto) setBusto(medidasEditadas.busto === '' ? '' : Number(medidasEditadas.busto));
    if (setCintura) setCintura(medidasEditadas.cintura === '' ? '' : Number(medidasEditadas.cintura));
    if (setQuadril) setQuadril(medidasEditadas.quadril === '' ? '' : Number(medidasEditadas.quadril));
    setEditandoMedidas(false);
  };

  return (
    <div className="modal-recomendacao-overlay" onClick={onClose}>
      <div className="modal-recomendacao" onClick={(e) => e.stopPropagation()}>
        <button className="btn-fechar-modal" onClick={onClose}>x</button>

        {editandoMedidas ? (
          <div className="editar-medidas-content">
            <h3>Editar medidas</h3>

            <div className="editar-medidas-form">
              {medidasRelevantes.includes('busto') && (
                <>
                  <label htmlFor="editar-busto">Busto</label>
                  <div className="editar-medida-input">
                    <input id="editar-busto" type="number" min="0" value={medidasEditadas.busto} onChange={(e) => handleMedidaChange('busto', e.target.value)} />
                    <span>cm</span>
                  </div>
                </>
              )}

              {medidasRelevantes.includes('cintura') && (
                <>
                  <label htmlFor="editar-cintura">Cintura</label>
                  <div className="editar-medida-input">
                    <input id="editar-cintura" type="number" min="0" value={medidasEditadas.cintura} onChange={(e) => handleMedidaChange('cintura', e.target.value)} />
                    <span>cm</span>
                  </div>
                </>
              )}

              {getMedidasCategoria(roupaSelecionada?.categoria).includes('quadril') && (
                <>
                  <label htmlFor="editar-quadril">Quadril</label>
                  <div className="editar-medida-input">
                    <input id="editar-quadril" type="number" min="0" value={medidasEditadas.quadril} onChange={(e) => handleMedidaChange('quadril', e.target.value)} />
                    <span>cm</span>
                  </div>
                </>
              )}

              {getMedidasCategoria(roupaSelecionada?.categoria).includes('comprimento') && (
                <>
                  <label htmlFor="editar-comprimento">Comprimento</label>
                  <div className="editar-medida-input">
                    <input id="editar-comprimento" type="number" min="0" value={medidasEditadas.comprimento} onChange={(e) => handleMedidaChange('comprimento', e.target.value)} />
                    <span>cm</span>
                  </div>
                </>
              )}
            </div>

            <div className="editar-medidas-actions">
              <button className="btn-editar" type="button" onClick={() => setEditandoMedidas(false)}>Cancelar</button>
              <button className="btn-salvar-medidas" type="button" onClick={salvarMedidas}>Salvar</button>
            </div>
          </div>
        ) : (
          <div className="resultado-modal">
            <section className="resultado-foto" style={{ backgroundImage: `url(${imagemRoupa})` }} aria-label={nomeRoupa}>
              <div className="resultado-logo">
                <span>CROP.</span>
              </div>
              <button className="resultado-label-medidas" type="button" onClick={() => setMostrarMedidas(true)}>
                Medidas<br />corporais
              </button>
            </section>

            <section className="resultado-painel">
              <div className="resultado-titulo">MELHOR OPÇÃO</div>
              <div className="resultado-usuario" aria-hidden="true">
                <span className="usuario-cabeca"></span>
                <span className="usuario-corpo"></span>
              </div>

              <div className="resultado-tamanho-recomendado">
                <div className="resultado-card-tamanho">
                  <span>{tamanhoIdeal?.label || tamanhoSelecionado || 'N/A'}</span>
                  <span className="resultado-check">✓</span>
                </div>
                <button className="resultado-editar" onClick={abrirEdicaoMedidas} type="button">Editar Medidas</button>
              </div>

              <div className="resultado-medidas-detalhes" aria-label="Medidas corporais">
                <span>Altura: {altura} cm</span>
                <span>Peso: {peso} kg</span>
                <span>Idade: {idade || 'não informada'}</span>
                {getMedidasCategoria(roupaSelecionada?.categoria).includes('busto') && <span>Busto: {busto || '-'} cm</span>}
                {getMedidasCategoria(roupaSelecionada?.categoria).includes('cintura') && <span>Cintura: {cintura || '-'} cm</span>}
                {getMedidasCategoria(roupaSelecionada?.categoria).includes('quadril') && <span>Quadril: {quadril || '-'} cm</span>}
              </div>

              <div className="resultado-manequim">
                <img src={mannequinSrc} alt={`Mannequin ${formatoCorpo || '030303'}`} />
                {ajustes.map((ajuste) => (
                  <span key={ajuste.key} className={`resultado-faixa resultado-faixa-${ajuste.posicao} ${ajuste.status}`} />
                ))}
              </div>

              <div className="resultado-indicadores">
                {ajustes.filter((ajuste) => ajuste.key !== 'comprimento').map((ajuste) => (
                  <div key={ajuste.key} className="resultado-indicador">
                    <span className={`resultado-icone-medida ${ajuste.status}`}>↔</span>
                    <span>{textoAjuste(ajuste.status, ajuste.folga).toLowerCase()}</span>
                  </div>
                ))}
              </div>

              <div className="resultado-outros-tamanhos">
                <div className="resultado-titulo-outros">Prove também os tamanhos:</div>
                <div className="resultado-opcoes">
                  {tamanhosRoupa.map((tamanho) => (
                    <button
                      key={tamanho.label}
                      className={`resultado-opcao ${tamanho.label === tamanhoSelecionado ? 'selecionado' : ''}`}
                      onClick={() => handleSizeChange(tamanho.label)}
                    >
                      {tamanho.label.toUpperCase()}
                      {tamanho.label === tamanhoSelecionado && <span className="resultado-mini-check">✓</span>}
                    </button>
                  ))}
                  <span className="resultado-seta" aria-hidden="true">›</span>
                </div>
              </div>

              <button className="resultado-fechar" onClick={onClose}>FECHAR</button>
            </section>
          </div>
        )}
      </div>

      {mostrarMedidas && (
        <div className="medidas-drawer-overlay" onClick={(evento) => { evento.stopPropagation(); setMostrarMedidas(false); }}>
          <aside className="medidas-drawer" onClick={(evento) => evento.stopPropagation()} aria-label="Medidas corporais do cliente">
            <button className="medidas-drawer-fechar" type="button" onClick={() => setMostrarMedidas(false)} aria-label="Fechar medidas">x</button>
            <p className="medidas-drawer-eyebrow">SEU PERFIL</p>
            <h2>Medidas corporais</h2>
            <p className="medidas-drawer-descricao">Informações usadas para calcular o tamanho recomendado.</p>

            <div className="medidas-drawer-lista">
              <div><span>Altura</span><strong>{altura || '-'} cm</strong></div>
              <div><span>Peso</span><strong>{peso || '-'} kg</strong></div>
              <div><span>Idade</span><strong>{idade || '-'} anos</strong></div>
              {getMedidasCategoria(roupaSelecionada?.categoria).includes('busto') && <div><span>Busto</span><strong>{busto || '-'} cm</strong></div>}
              {getMedidasCategoria(roupaSelecionada?.categoria).includes('cintura') && <div><span>Cintura</span><strong>{cintura || '-'} cm</strong></div>}
              {getMedidasCategoria(roupaSelecionada?.categoria).includes('quadril') && <div><span>Quadril</span><strong>{quadril || '-'} cm</strong></div>}
            </div>

            <button className="medidas-drawer-editar" type="button" onClick={() => { setMostrarMedidas(false); abrirEdicaoMedidas(); }}>
              Editar medidas
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}