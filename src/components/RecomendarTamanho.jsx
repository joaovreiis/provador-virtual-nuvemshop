import { Children, cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';

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

const MARCACOES_MANEQUIM = {
  busto: (
    <g id="chest" className="group-NORMAL" key="busto" transform="translate(50, -180) scale(0.85, 0.7)">
      <path className="st1 path-NORMAL" d="M278.4,472.6c35.9-1.4,62.2-5.6,83-13.2c5.8-2.1,14.5-2,25.5-1.9c19.2,0.1,44.4,0.3,63.4-12.2c0.2-4.7-0.1-9.4-0.9-14c-17.9,13.1-44.3,13.6-64.7,14c-12,0.2-22.5,0.4-27.7,3c-15.5,7.5-40.4,11.8-78.4,13.5c-6.6,0.3-13.6,0.5-20.8,0.5c-31.8,0-67.3-3.5-94.7-15.5c-0.8,3.4-1.6,6.9-2.4,10C198.3,474,258,473.4,278.4,472.6z"></path>
      <path className="st2 path-NORMAL" d="M158,472c28.4,13.1,77.1,17.9,120.4,16.4s68-7.7,89.6-13.2c5.2-1.3,12.4-1,21.5-0.7c16,0.6,36.5,1.5,56-6.6c2.2-4.7,3.6-9.7,4.2-14.8c0.1-0.6,0.1-1.1,0.2-1.7c-19.6,11.4-44.1,11.2-63,11c-10.1-0.1-18.9-0.1-23.8,1.6c-21.3,7.8-48.1,12-84.5,13.5c-4.1,0.2-9.7,0.3-16.4,0.3c-27,0-71.6-2.4-102.6-16.3c-0.2,0.7-0.3,1.3-0.5,1.8C158.3,466.2,157.9,469.1,158,472z"></path>
      <path className="st3 path-NORMAL" d="M278.4,441.1c26.6-1.4,55.8-4,69.8-12.9c6.7-4.2,19.5-4.7,34.3-5.3c20.4-0.8,44.5-1.7,59.3-12.6c-1-2-2.1-4-3.3-6c-0.8-1.4-1.7-2.9-2.5-4.3c-15,8-36.5,9.2-55.2,10.3c-15.6,0.9-30.3,1.7-36,6.3c-11.9,9.7-39.2,12.1-66.1,13.8c-8.1,0.5-16.9,0.9-26.2,0.9c-26.1,0-55.9-3-83.1-14.6c-0.5,3.1-1.2,6.6-1.9,10.1C194.9,438.7,232,443.5,278.4,441.1z"></path>
      <path className="st2 path-NORMAL" d="M164.3,441.8c35,15.6,84.2,16.4,114.1,15.1c37.3-1.7,61.6-5.8,76.4-13c6.3-3.1,17.2-3.3,29.8-3.5c21.4-0.4,47.3-0.9,63.6-14.3c-1.1-3.8-2.5-7.6-4.1-11.2c-15.9,11.3-40.5,12.2-61.4,13c-13.5,0.5-26.3,1-31.9,4.5c-15,9.5-43.6,12.1-72.2,13.7c-7.8,0.4-15.3,0.6-22.6,0.6c-36.3,0-66.2-5-89.6-15c-0.6,2.6-1.1,5.2-1.6,7.4C164.7,440,164.5,440.8,164.3,441.8z"></path>
      <path className="st3 path-NORMAL" d="M278.4,504.2c34-1,55.7-5.4,75-9.3c7.4-1.5,14.3-2.9,21.2-4c4.7-0.7,10.8-0.2,17.9,0.4c8.8,0.7,19,1.5,30.3,0.6c0.7-0.8,1.6-1.5,2.5-2c6.4-3.8,12-9,16.3-15.1c-18.5,6.1-37.3,5.4-52.3,4.7c-8.4-0.3-15.6-0.6-20.1,0.5c-21.9,5.6-46.7,11.9-90.6,13.4c-5,0.2-10.1,0.3-15.3,0.3c-36.3,0-77.1-4.3-104.1-15.6c0.8,2.6,2.4,7.5,4,12.6C191.7,500.9,237.7,505.4,278.4,504.2z"></path>
    </g>
  ),
  cintura: (
    <g id="waist" className="group-NORMAL" key="cintura" transform="translate(50, -100) scale(0.85, 0.7)">
      <path className="st3 path-NORMAL" d="M351,585.8l-3.6,0.6c-19.7,3.4-40.1,7-68.1,7c-25.8,0-65.5,0-98.4-18.2c0.1,1.4,0,2.8-0.1,4.2c-0.3,2.1-0.6,4.7-1.1,7.3c30.7,18.1,70.6,18.2,96.5,18.2l0,0c31.1,0,56.2-4.7,76.4-8.4c2.8-0.5,5.9-1,9.6-1.5c17.7-2.7,43.7-6.6,60.7-19.8c0.1-3,0.3-6.1,0.4-9.2c-17.7,11.8-44.3,15.7-62.8,18.4C357,584.9,353.7,585.3,351,585.8z"></path>
      <path className="st1 path-NORMAL" d="M270,637.9L270,637.9c26.1,0,55.5-3.4,87.3-10.1c2.4-0.5,5.3-1,8.6-1.5c14.8-2.3,38.9-6,58-22c-0.3-2.7-0.6-5.5-0.9-8.1c-18.6,13.3-42.8,17-58.1,19.3c-3.5,0.5-6.5,1-9,1.5c-23.4,4.6-51.5,9.3-82.8,9.3l0,0c-34.1,0-71.2-1.8-98.8-18.8c-1,3.2-2.2,6.7-3.5,10.3C195.8,636,233.1,637.9,270,637.9z"></path>
      <path className="st2 path-NORMAL" d="M362.9,599.9c-3.6,0.5-6.8,1-9.5,1.5c-20.4,3.8-45.7,8.5-77.3,8.5l0,0c-26,0-65.8,0-97.4-17.9c-0.5,2.5-1.1,4.9-1.8,7.3c-0.3,0.9-0.7,2.1-1.1,3.5c26.1,16.9,62,18.6,97.2,18.6l0,0c30.9,0,58.7-4.7,81.8-9.2c2.6-0.5,5.7-1,9.2-1.5c16.5-2.5,40.8-6.2,58.4-20.2c-0.1-1.3-0.1-2.5-0.1-3.6c0-1.4,0.1-3.3,0.1-5.5C404.4,593.7,379.1,597.5,362.9,599.9z"></path>
      <path className="st2 path-NORMAL" d="M266.9,654.4c27.7,0,62.4-4.1,92.8-11c2.1-0.5,4.7-0.9,7.8-1.3c14.1-2.2,37.4-5.8,58.1-24c-0.3-2.2-0.6-4.9-1-7.8c-19.6,15.1-43.2,18.8-57.9,21c-3.3,0.5-6.1,0.9-8.3,1.4c-32.1,6.8-61.9,10.2-88.4,10.2h0c-37.2,0-75-1.9-101-20.1c-0.7,1.8-1.4,3.4-2.1,5c-0.6,1.3-1.3,2.8-2.1,4.3C185.4,650.2,220.1,654.4,266.9,654.4L266.9,654.4z"></path>
      <path className="st3 path-NORMAL" d="M263.8,670.9L263.8,670.9c36.7,0,75.9-6.4,98.4-11.8c1.8-0.4,4.1-0.8,6.8-1.2c13.3-2,35.6-5.5,58.4-26.1c-0.4-2.7-0.8-5.4-1-7.7c-21,17.3-44,20.8-58.1,23c-2.9,0.5-5.5,0.8-7.4,1.3c-30.8,6.9-65.9,11.1-93.9,11.1h-0.1c-39.7,0-79.7-2.1-104.3-22.7c-1.4,2.8-2.7,5.8-4.1,8.7C176.9,666.2,213.3,670.8,263.8,670.9z"></path>
    </g>
  ),
  quadril: (
    <g id="hip" className="group-NORMAL" key="quadril" transform="translate(55, -100) scale(0.85, 0.7)">
      <path className="st2 path-NORMAL" d="M134.1,765.6c28.5,22.3,80.6,19.5,98.2,16.6c13-2.2,26.9-4.4,40.3-6.5c24.1-3.8,47-7.5,64.9-10.9c2.7-0.5,5.9-1.1,9.5-1.7c24.4-4.2,64.8-11.2,87.6-31.4c-0.2-2.9-0.4-5.8-0.5-8.6c-28.9,23.9-83.2,32-104.7,35.2l-5.8,0.9c-25.5,3.8-64.1,9.6-95.7,12.4c-5.2,0.5-12.3,0.9-20.4,0.9c-23.4,0-55.5-3.6-75.1-20.9c-3.1-2.7-5.9-5.8-8.2-9.2c-0.8,3.1-1.6,6.3-2.3,9.3C125.1,757.1,129.2,761.8,134.1,765.6z"></path>
      <path className="st3 path-NORMAL" d="M317.3,747.5c-5.6,0.5-12.5,1.4-20.6,2.4c-21.5,2.6-51.1,6.3-73.9,6.3h-6.4c-20.5,0-61-1.1-82.3-22.3c-2.1-2.1-4-4.4-5.7-6.9c-0.7,2.2-1.2,4.1-1.6,5.4c-0.3,1.1-0.6,2.2-0.8,3.3c2.5,4.6,5.8,8.8,9.8,12.3c25.7,22.6,76.8,20.1,91.8,18.7c31.5-2.8,70-8.5,95.4-12.4l5.8-0.9c21.8-3.3,78.5-11.7,105.1-36.5c-0.1-1.6-0.1-3-0.2-4.4s-0.1-2.7-0.2-4c-9.5,8.3-23.1,15.6-40.7,22C364.5,740.8,332,746,317.3,747.5z"></path>
      <path className="st1 path-NORMAL" d="M118.5,768.8c3.8,5.7,8.6,10.6,14.2,14.5c31.9,22.4,87.8,18.4,104.5,14.4c21.1-5,42.6-8.9,63.4-12.6c17-3,33-5.9,47.3-9.2c4.3-1,9.4-1.9,14.8-2.9c22-4.1,52.3-9.7,72.9-26.7c-0.2-2.7-0.4-5.5-0.6-8.4c-24.3,19.2-63.2,26-87.2,30.1c-3.6,0.6-6.7,1.2-9.4,1.7c-18,3.5-40.9,7.1-65,10.9c-13.4,2.1-27.2,4.3-40.3,6.5c-9.3,1.4-18.6,2.1-28,2c-23.6,0-54.2-4-74.2-19.6c-4-3.2-7.6-6.9-10.7-11c-0.4,1.9-0.8,3.7-1,5.4S118.8,767.1,118.5,768.8z"></path>
      <path className="st3 path-NORMAL" d="M130.6,818.8c38.5,22.2,99.7,16,116.5,9.9c25.9-9.5,50.6-14.6,74.4-19.5c16.3-3.4,31.7-6.6,47.4-11.1c7.3-2.1,14.4-3.4,21.2-4.7c16.3-3.1,31.9-6.1,48.7-18.4c-0.4-3.1-0.7-6.1-1-8.5c-18.9,13.7-41,17.9-59.8,21.5c-6.5,1.2-12.6,2.4-18.3,3.9c-14.8,3.8-30.2,6.8-46.5,10c-22.6,4.4-45.9,8.9-69.5,16.1c-8,2.4-23.3,4.6-41,4.6c-24.2,0-52.9-4.1-73.7-17.3c-5.1-3.2-9.8-7.1-13.9-11.6c-0.3,4.3-0.5,8.9-0.6,12.4C119.1,811.2,124.6,815.4,130.6,818.8z"></path>
      <path className="st2 path-NORMAL" d="M131.6,801c34.8,22,92.4,17.7,110.6,12.1c23.9-7.3,47.4-11.8,70-16.3c16.2-3.2,31.5-6.1,46.2-9.9c5.8-1.5,12-2.7,18.6-3.9c19.9-3.8,41.7-8,60-22.2c-0.2-2.1-0.5-5.1-0.8-8.6c-21.4,16.1-50.8,21.6-72.5,25.6c-5.3,1-10.3,1.9-14.6,2.9c-14.4,3.3-30.5,6.2-47.5,9.2c-20.7,3.7-42.2,7.5-63.1,12.6c-7.7,1.8-20.4,3.4-34.9,3.4c-24.1,0-53.3-4.2-73.6-18.5c-4.7-3.3-8.9-7.2-12.5-11.6c-0.6,3.8-1.2,7.5-1.6,11C120.1,792.4,125.5,797.3,131.6,801z"></path>
    </g>
  )
};

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

function formatarMedidaTabela(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';

  const texto = String(valor).trim();
  if (!texto) return '—';

  if (texto.includes('-') || texto.includes('–')) {
    return `${texto.replace(/\s+/g, ' ').trim()} cm`;
  }

  const numero = Number(texto);
  return Number.isFinite(numero) ? `${numero} cm` : `${texto} cm`;
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

function mapearFormatoMedida(valor, campo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 3;

  const faixa = {
    busto: { min: 70, max: 130 },
    cintura: { min: 60, max: 120 },
    quadril: { min: 85, max: 145 }
  }[campo] ?? { min: 60, max: 120 };

  const percentual = (numero - faixa.min) / (faixa.max - faixa.min);
  const indice = Math.round(percentual * 4) + 1;

  return Math.min(5, Math.max(1, indice));
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
  const [tamanhoTabelaSelecionado, setTamanhoTabelaSelecionado] = useState('');
  const [editandoMedidas, setEditandoMedidas] = useState(false);
  const [mostrarMedidas, setMostrarMedidas] = useState(false);
  const [mostrarTabelaMedidas, setMostrarTabelaMedidas] = useState(false);
  const [indiceCarrossel, setIndiceCarrossel] = useState(0);
  const [medidaAtiva, setMedidaAtiva] = useState('busto');
  const [animacaoChave, setAnimacaoChave] = useState(0);
  const [medidasEditadas, setMedidasEditadas] = useState({
    busto: busto ?? '',
    cintura: cintura ?? '',
    quadril: quadril ?? '',
    comprimento: ''
  });

  const imagemMedidaAtiva = {
    busto: '/editarMedidas/chest.jpg',
    cintura: '/editarMedidas/waist.jpg',
    quadril: '/editarMedidas/hip.jpg'
  }[medidaAtiva] ?? '/editarMedidas/chest.jpg';

  const rotuloMedidaAtiva = { busto: 'Chest', cintura: 'Waist', quadril: 'Hip' }[medidaAtiva] ?? 'Chest';

  const mannequinPrincipalSrc = `/mannequin_formatos/${formatoCorpo || '030303'}.jpg`;
  const mannequinSrc = imagemMedidaAtiva;
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
  const tamanhoTabelaAtual = tamanhosRoupa.find((tamanho) => tamanho.label === tamanhoTabelaSelecionado) ?? tamanhosRoupa[0] ?? null;
  const maxIndiceCarrossel = Math.max(0, tamanhosRoupa.length - 3);
  const tamanhosVisiveis = tamanhosRoupa.slice(indiceCarrossel, indiceCarrossel + 3);

  useEffect(() => {
    if (tamanhosRoupa.length === 0) return;
    if (!tamanhoTabelaSelecionado || !tamanhosRoupa.some((tamanho) => tamanho.label === tamanhoTabelaSelecionado)) {
      setTamanhoTabelaSelecionado(tamanhosRoupa[0].label);
    }
  }, [tamanhosRoupa, tamanhoTabelaSelecionado]);

  const ajustes = CAMPOS_MEDIDAS
    .filter((campo) => medidasRelevantes.includes(campo.key))
    .map((campo) => ({
      ...campo,
      folga: tamanhoAtual?.[campo.key] == null || medidasCliente[campo.key] == null
        ? null
        : tamanhoAtual[campo.key] - medidasCliente[campo.key],
      status: classificarAjuste(medidasCliente[campo.key], tamanhoAtual?.[campo.key])
    }));
  const marcasMannequin = Object.entries(MARCACOES_MANEQUIM)
    .filter(([chave]) => medidasRelevantes.includes(chave))
    .map(([chave, markup]) => {
      const status = ajustes.find((ajuste) => ajuste.key === chave)?.status ?? 'indefinido';
      const filhos = isValidElement(markup) ? markup.props.children : null;

      const filhosComStatus = isValidElement(markup)
        ? Children.map(filhos, (filho) => {
            if (!isValidElement(filho)) return filho;
            return cloneElement(filho, {
              className: `${filho.props.className ?? ''} ${status}`.trim()
            });
          })
        : filhos;

      return cloneElement(markup, {
        className: `${markup.props.className ?? 'group-NORMAL'} ${status}`.trim(),
        children: filhosComStatus
      });
    });

  const posicaoIndicadores = {
    busto: '35%',
    cintura: '50%',
    quadril: '66%'
  };

  const handleSizeChange = (novo) => {
    setTamanhoSelecionado(novo);
    setAnimacaoChave((valorAtual) => valorAtual + 1);
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

  const resetarMedidasEditadas = () => {
    setMedidasEditadas({
      busto: busto ?? '',
      cintura: cintura ?? '',
      quadril: quadril ?? '',
      comprimento: medidasEditadas.comprimento ?? ''
    });
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

        {mostrarMedidas && (
          <div className="medidas-drawer-overlay" onClick={(evento) => { evento.stopPropagation(); setMostrarMedidas(false); }}>
            <aside className="medidas-drawer" onClick={(evento) => evento.stopPropagation()} aria-label="Medidas corporais do cliente">
              <button className="medidas-drawer-fechar" type="button" onClick={() => setMostrarMedidas(false)} aria-label="Fechar medidas">x</button>
              <h2>Medidas corporais</h2>

              <div className="medidas-drawer-lista">
                {medidasRelevantes.includes('busto') && <div><span>Tórax / Busto</span><strong>{busto || '-'} cm</strong></div>}
                {medidasRelevantes.includes('cintura') && <div><span>Cintura</span><strong>{cintura || '-'} cm</strong></div>}
                {medidasRelevantes.includes('quadril') && <div><span>Quadril</span><strong>{quadril || '-'} cm</strong></div>}
              </div>

              <button className="medidas-drawer-editar" type="button" onClick={() => { setMostrarMedidas(false); setMostrarTabelaMedidas(true); }}>
                Tabela de medidas
              </button>
            </aside>
          </div>
        )}

        {mostrarTabelaMedidas && (
          <div className="tabela-medidas-overlay" onClick={(evento) => { evento.stopPropagation(); setMostrarTabelaMedidas(false); }}>
            <div className="tabela-medidas-modal" onClick={(evento) => evento.stopPropagation()}>
              <button className="tabela-medidas-fechar" type="button" onClick={() => setMostrarTabelaMedidas(false)} aria-label="Fechar tabela de medidas">x</button>

              <div className="tabela-medidas-imagem-wrap">
                <div className="tabela-medidas-titulo-imagem">Tabela de tamanhos</div>
                <img src={imagemRoupa} alt={nomeRoupa} className="tabela-medidas-imagem" />
                <span className="tabela-medidas-fita"></span>
              </div>

              <div className="tabela-medidas-conteudo">
                <h3>Selecione um tamanho e verifique as medidas</h3>

                <div className="tabela-medidas-tamanhos">
                  {tamanhosRoupa.map((tamanho) => (
                    <button
                      key={tamanho.label}
                      type="button"
                      className={`tabela-medida-botao ${tamanhoTabelaSelecionado === tamanho.label ? 'selecionado' : ''}`}
                      onClick={() => setTamanhoTabelaSelecionado(tamanho.label)}
                    >
                      {tamanho.label}
                    </button>
                  ))}
                </div>

                <div className="tabela-medidas-lista">
                  {medidasRelevantes.filter((campo) => campo !== 'comprimento').map((campo) => {
                    const valor = tamanhoTabelaAtual?.[campo] ?? '—';
                    const label = CAMPOS_MEDIDAS.find((item) => item.key === campo)?.label ?? campo;

                    return (
                      <div key={campo} className="tabela-medidas-row">
                        <span>{label}</span>
                        <strong>{formatarMedidaTabela(valor)}</strong>
                      </div>
                    );
                  })}
                </div>

                <button className="tabela-medidas-cta" type="button" onClick={() => setMostrarTabelaMedidas(false)}>
                  Provador virtual
                </button>
              </div>
            </div>
          </div>
        )}

        {editandoMedidas ? (
          <div className="editar-medidas-content">
            <div className="editar-medidas-visual">
              <div className="editar-medidas-logo">
                <span>CROP.</span>
              </div>

              <div className={`editar-medidas-silhueta medida-${medidaAtiva}`} aria-label={`Medida ativa: ${rotuloMedidaAtiva}`}>
                <img src={mannequinSrc} alt="Modelo de referência" className="editar-medidas-modelo" />

                <div className="editar-medidas-overlay editar-medidas-overlay-busto" />
                <div className="editar-medidas-overlay editar-medidas-overlay-cintura" />
                <div className="editar-medidas-overlay editar-medidas-overlay-quadril" />

                <div className="editar-medidas-rotulo">{rotuloMedidaAtiva}</div>
              </div>
            </div>

            <div className="editar-medidas-panel">
              <h3>Minhas Medidas</h3>
              <p>Ajuste as medidas conforme necessário</p>

              <div className="editar-medidas-form">
                {['busto', 'cintura', 'quadril'].filter((campo) => medidasRelevantes.includes(campo)).map((campo) => {
                  const valorAtual = medidasEditadas[campo] ?? '';
                  const valorRange = Number(valorAtual || 0);
                  const label = CAMPOS_MEDIDAS.find((item) => item.key === campo)?.label ?? campo;

                  return (
                    <div
                      key={campo}
                      className="editar-medida-linha"
                      onMouseEnter={() => setMedidaAtiva(campo)}
                      onMouseLeave={() => setMedidaAtiva('busto')}
                      onFocus={() => setMedidaAtiva(campo)}
                      onBlur={() => setMedidaAtiva('busto')}
                    >
                      <label htmlFor={`editar-${campo}`}>{label}</label>

                      <div className="editar-medida-slider-wrap">
                        <input
                          id={`editar-${campo}`}
                          type="range"
                          min="40"
                          max="160"
                          step="1"
                          value={valorRange}
                          onChange={(e) => handleMedidaChange(campo, e.target.value)}
                          onMouseEnter={() => setMedidaAtiva(campo)}
                          onFocus={() => setMedidaAtiva(campo)}
                        />
                      </div>

                      <div className="editar-medida-box">
                        <input
                          type="number"
                          min="40"
                          max="160"
                          step="1"
                          value={valorAtual === '' ? '' : valorRange}
                          onChange={(e) => handleMedidaChange(campo, e.target.value)}
                          className="editar-medida-box-input"
                          aria-label={`${label} em centímetros`}
                          inputMode="numeric"
                        />
                        <small>cm</small>
                      </div>
                    </div>
                  );
                })}

              </div>

              <button className="editar-medidas-link" type="button" onClick={() => { setEditandoMedidas(false); setMostrarMedidas(true); }}>
              </button>

              <div className="editar-medidas-actions">
                <button className="btn-editar btn-editar-secundario" type="button" onClick={resetarMedidasEditadas}>
                  Reiniciar
                </button>
                <button className="btn-salvar-medidas" type="button" onClick={salvarMedidas}>Ver recomendação</button>
              </div>
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
                <img src={mannequinPrincipalSrc} alt={`Mannequin ${formatoCorpo || '030303'}`} />
                <svg key={`mannequin-path-${animacaoChave}`} className="resultado-manequim-svg" viewBox="0 0 620 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  {marcasMannequin}
                </svg>
              </div>

              <div className="resultado-indicadores">
                {ajustes.filter((ajuste) => ajuste.key !== 'comprimento').map((ajuste) => (
                  <div
                    key={`${tamanhoSelecionado}-${animacaoChave}-${ajuste.key}`}
                    className="resultado-indicador"
                    style={{ top: posicaoIndicadores[ajuste.key] ?? '50%' }}
                  >
                    <span className={`resultado-icone-medida ${ajuste.status}`}>↔</span>
                    <span>{textoAjuste(ajuste.status, ajuste.folga).toLowerCase()}</span>
                  </div>
                ))}
              </div>

              <div className="resultado-outros-tamanhos">
                <div className="resultado-titulo-outros">Prove também os tamanhos:</div>
                <div className="resultado-opcoes">
                  <button
                    className="resultado-seta resultado-seta-anterior"
                    type="button"
                    aria-label="Mostrar tamanhos anteriores"
                    onClick={() => setIndiceCarrossel((indice) => Math.max(0, indice - 1))}
                    disabled={indiceCarrossel === 0}
                  >
                    ‹
                  </button>
                  {tamanhosVisiveis.map((tamanho) => (
                    <button
                      key={tamanho.label}
                      className={`resultado-opcao ${tamanho.label === tamanhoSelecionado ? 'selecionado' : ''}`}
                      type="button"
                      onClick={() => handleSizeChange(tamanho.label)}
                    >
                      {tamanho.label.toUpperCase()}
                      {tamanho.label === tamanhoSelecionado && <span className="resultado-mini-check">✓</span>}
                    </button>
                  ))}
                  <button
                    className="resultado-seta resultado-seta-proxima"
                    type="button"
                    aria-label="Mostrar próximos tamanhos"
                    onClick={() => setIndiceCarrossel((indice) => Math.min(maxIndiceCarrossel, indice + 1))}
                    disabled={indiceCarrossel >= maxIndiceCarrossel}
                  >
                    ›
                  </button>
                </div>
              </div>

              <button className="resultado-fechar" onClick={onClose}>FECHAR</button>
            </section>
          </div>
        )}
      </div>

    </div>
  );
}