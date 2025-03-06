/****************************************
 *  CONFIGURAÇÕES GERAIS
 ****************************************/
const CONFIG = {
  taxaSelicMensal: 1.02,    // 1,02% ao mês
  taxaDolarAnual: 10,       // 10% ao ano
  taxaOuroAnual: 20,        // 20% ao ano
  porcentagensIniciais: {
    C: 35,
    I: 20,
    P: 20,
    A: 25
  }
};

// Cores utilizadas
const CORES = {
  capitalGiro: '#003366',    // Azul escuro
  investimentos: '#006633',  // Verde escuro
  poupanca: '#FFD700',       // Amarelo ouro
  aluguel: '#666666',        // Cinza
  despesas: '#990000'        // Vermelho
};

/****************************************
 *  ESTADO GLOBAL DA APLICAÇÃO
 ****************************************/
const state = {
  registros: [],
  // Temos 5 campos no total, incluindo D (despesas)
  valoresAcumulados: {
    C: 0,
    I: 0,
    P: 0,
    A: 0,
    D: 0  // Total de despesas separadas
  },
  porcentagens: { ...CONFIG.porcentagensIniciais },
  tema: localStorage.getItem('tema') || 'light'
};

// Variáveis para gráficos
let lineChart, candleChart, pieChart, projecaoChart;

/****************************************
 *  INICIALIZAÇÃO
 ****************************************/
document.addEventListener('DOMContentLoaded', () => {
  inicializarAplicacao();
});

function inicializarAplicacao() {
  inicializarTema();
  inicializarFormularios();
  inicializarGraficos();
  inicializarEventListeners();
  carregarDadosSalvos();
  atualizarTudo();
}

/****************************************
 *  TEMA
 ****************************************/
function inicializarTema() {
  if (state.tema === 'dark') {
    document.body.classList.add('dark-theme');
    const icon = document.querySelector('#toggleTheme i');
    if (icon) icon.classList.replace('fa-moon', 'fa-sun');
  }
}

/****************************************
 *  FORMATAÇÃO DE CAMPOS
 ****************************************/
// Máscara simples para data (DD/MM/AA)
function formatarData(e) {
  let valor = e.target.value.replace(/\D/g, '');
  
  if (valor.length >= 6) {
    const dia = valor.substr(0, 2);
    const mes = valor.substr(2, 2);
    const ano = valor.substr(4, 2);
    
    let diaNum = parseInt(dia);
    let mesNum = parseInt(mes);
    
    // Correções de limite
    if (diaNum > 31) diaNum = 31;
    if (diaNum === 0) diaNum = 1;
    if (mesNum > 12) mesNum = 12;
    if (mesNum === 0) mesNum = 1;
    
    const diaFormatado = diaNum.toString().padStart(2, '0');
    const mesFormatado = mesNum.toString().padStart(2, '0');
    
    valor = `${diaFormatado}/${mesFormatado}/${ano}`;
  } else if (valor.length >= 4) {
    valor = valor.replace(/^(\d{2})(\d{2})/, '$1/$2/');
  } else if (valor.length >= 2) {
    valor = valor.replace(/^(\d{2})/, '$1/');
  }
  
  e.target.value = valor;
}

function inicializarFormularios() {
  // Formatar campo monetário
  document.querySelectorAll('.valor-input').forEach(input => {
    input.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '');
      val = (parseFloat(val) / 100).toFixed(2);
      e.target.value = val ? `R$ ${val.replace('.', ',')}` : '';
    });
  });

  // Formatar data
  const inputData = document.getElementById('dia');
  inputData.addEventListener('input', formatarData);
  inputData.addEventListener('blur', e => {
    const valor = e.target.value;
    if (valor.length > 0 && valor.length < 8) {
      e.target.value = '';
      mostrarAlerta('Data inválida', 'danger');
    }
  });

  // Toggle pagamento/despesa
  const tipoToggle = document.getElementById('tipoTransacao');
  tipoToggle.addEventListener('change', e => {
    const label = document.getElementById('tipoLabel');
    if (e.target.checked) {
      label.textContent = 'Despesa';
      label.style.color = CORES.despesas;
    } else {
      label.textContent = 'Pagamento';
      label.style.color = CORES.capitalGiro;
    }
  });
}

/****************************************
 *  GRÁFICOS
 ****************************************/
function inicializarGraficos() {
  // Gráfico de Linha
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Capital de Giro (C)',
          data: [],
          borderColor: CORES.capitalGiro,
          backgroundColor: CORES.capitalGiro + '40',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Investimentos (I)',
          data: [],
          borderColor: CORES.investimentos,
          backgroundColor: CORES.investimentos + '40',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Poupança (P)',
          data: [],
          borderColor: CORES.poupanca,
          backgroundColor: CORES.poupanca + '40',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatarMoeda(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });

  // Gráfico de Candle (barras separadas)
  const ctxCandle = document.getElementById('candleChart').getContext('2d');
  candleChart = new Chart(ctxCandle, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Capital de Giro (C)',
          data: [],
          backgroundColor: CORES.capitalGiro
        },
        {
          label: 'Investimentos (I)',
          data: [],
          backgroundColor: CORES.investimentos
        },
        {
          label: 'Poupança (P)',
          data: [],
          backgroundColor: CORES.poupanca
        },
        {
          label: 'Aluguel/Fixas (A)',
          data: [],
          backgroundColor: CORES.aluguel
        },
        {
          label: 'Despesas (D)',
          data: [],
          backgroundColor: CORES.despesas
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: false
        },
        y: {
          stacked: false
        }
      }
    }
  });

  // Gráfico de Pizza
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Capital de Giro (C)', 'Investimentos (I)', 'Poupança (P)', 'Aluguel/Fixas (A)'],
      datasets: [
        {
          data: [35, 20, 20, 25],
          backgroundColor: [
            CORES.capitalGiro,
            CORES.investimentos,
            CORES.poupanca,
            CORES.aluguel
          ]
        }
      ]
    },
    options: {
      responsive: true
    }
  });
}

/****************************************
 *  EVENTOS
 ****************************************/
function inicializarEventListeners() {
  const elements = {
    formTransacao: document.getElementById('formTransacao'),
    toggleTheme: document.getElementById('toggleTheme'),
    formProjecao: document.getElementById('formProjecao'),
    exportarCIPAG: document.getElementById('exportarCIPAG'),
    exportarProjecao: document.getElementById('exportarProjecao')
  };

  if (elements.formTransacao) {
    elements.formTransacao.addEventListener('submit', handleNovaTransacao);
  }
  if (elements.toggleTheme) {
    elements.toggleTheme.addEventListener('click', toggleTema);
  }
  
  document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleGrafico);
  });
  
  if (elements.formProjecao) {
    elements.formProjecao.addEventListener('submit', calcularProjecao);
  }
  if (elements.exportarCIPAG) {
    elements.exportarCIPAG.addEventListener('click', exportarPDFCipag);
  }
  if (elements.exportarProjecao) {
    elements.exportarProjecao.addEventListener('click', exportarPDFProjecao);
  }

  ['C', 'I', 'P', 'A'].forEach(tipo => {
    const element = document.getElementById(`porc${tipo}`);
    if (element) {
      element.addEventListener('change', atualizarPorcentagens);
    }
  });
}

/****************************************
 *  FUNÇÕES: NOVA TRANSAÇÃO
 ****************************************/
function handleNovaTransacao(e) {
  e.preventDefault();

  const dataInput = document.getElementById('dia').value.trim();
  if (!/^\d{2}\/\d{2}\/\d{2}$/.test(dataInput)) {
    mostrarAlerta('Formato de data inválido. Use DD/MM/AA', 'danger');
    return;
  }

  const transacao = {
    categoria: document.getElementById('categoria').value.trim(),
    data: dataInput,
    horario: document.getElementById('horario').value.trim(),
    valor: converterParaNumero(
      document.getElementById('valor').value.replace(/[^\d,]/g, '')
    ),
    tipo: document.getElementById('tipoTransacao').checked ? 'despesa' : 'pagamento'
  };

  if (!transacao.categoria || !transacao.data || !transacao.horario) {
    mostrarAlerta('Preencha todos os campos corretamente.', 'danger');
    return;
  }
  if (isNaN(transacao.valor) || transacao.valor <= 0) {
    mostrarAlerta('Valor inválido.', 'danger');
    return;
  }

  state.registros.push(transacao);
  atualizarTudo();
  e.target.reset();
  mostrarAlerta('Transação adicionada com sucesso!', 'success');
}

/****************************************
 *  EXCLUIR REGISTRO
 ****************************************/
function excluirRegistro(index) {
  state.registros.splice(index, 1);
  atualizarTudo();
  mostrarAlerta('Registro excluído!', 'danger');
}

/****************************************
 *  ATUALIZAR PORCENTAGENS
 ****************************************/
function atualizarPorcentagens() {
  state.porcentagens.C = parseFloat(document.getElementById('porcC').value) || 0;
  state.porcentagens.I = parseFloat(document.getElementById('porcI').value) || 0;
  state.porcentagens.P = parseFloat(document.getElementById('porcP').value) || 0;
  state.porcentagens.A = parseFloat(document.getElementById('porcA').value) || 0;
  atualizarTudo();
}

/****************************************
 *  CÁLCULOS E DISTRIBUIÇÕES
 ****************************************/
function calcularValoresAcumulados() {
  const valores = { C: 0, I: 0, P: 0, A: 0, D: 0 };

  // Iteramos sobre cada registro e ajustamos os valores
  state.registros.forEach(registro => {
    const valor = registro.valor;
    if (registro.tipo === 'pagamento') {
      // Distribuir conforme porcentagens
      const somaPorc =
        state.porcentagens.C +
        state.porcentagens.I +
        state.porcentagens.P +
        state.porcentagens.A;

      if (somaPorc === 0) return;

      valores.C += (valor * state.porcentagens.C) / somaPorc;
      valores.I += (valor * state.porcentagens.I) / somaPorc;
      valores.P += (valor * state.porcentagens.P) / somaPorc;
      valores.A += (valor * state.porcentagens.A) / somaPorc;
    } else {
      // Despesa => abate e também soma no total de despesas D
      valores.D += valor;

      let despesaRestante = valor;
      const ordem = ['C', 'I', 'P', 'A'];
      for (let i = 0; i < ordem.length; i++) {
        const key = ordem[i];
        if (despesaRestante > 0) {
          const disponivel = valores[key];
          const abatimento = Math.min(despesaRestante, disponivel);
          valores[key] -= abatimento;
          despesaRestante -= abatimento;
        }
      }
    }
  });

  // Aplicar rendimentos em C, I, P
  valores.C = aplicarJurosCompostos(valores.C);
  valores.I = aplicarJurosSimples(valores.I, CONFIG.taxaDolarAnual);
  valores.P = aplicarJurosSimples(valores.P, CONFIG.taxaOuroAnual);

  return valores;
}

function aplicarJurosCompostos(valor) {
  const meses = calcularMesesPassados();
  const taxaMensal = 1 + CONFIG.taxaSelicMensal / 100;
  return valor * Math.pow(taxaMensal, meses);
}

function aplicarJurosSimples(valor, taxaAnual) {
  const meses = calcularMesesPassados();
  const taxaDecimal = taxaAnual / 100;
  return valor + valor * (taxaDecimal * (meses / 12));
}

function calcularMesesPassados() {
  if (state.registros.length === 0) return 0;
  let [dia, mes, ano] = state.registros[0].data.split('/');
  if (ano.length === 2) {
    // Simples ajuste para 20XX
    ano = '20' + ano;
  }
  const primeiraData = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  let meses = (hoje.getFullYear() - primeiraData.getFullYear()) * 12 +
              (hoje.getMonth() - primeiraData.getMonth());
  return Math.max(0, meses);
}

/****************************************
 *  ATUALIZAÇÃO GERAL
 ****************************************/
function atualizarTudo() {
  const novosValores = calcularValoresAcumulados();
  state.valoresAcumulados = novosValores;
  atualizarInterfaceValores();
  atualizarTabela();
  atualizarGraficos();
  salvarDados();
}

/****************************************
 *  ATUALIZAR INTERFACE
 ****************************************/
function atualizarInterfaceValores() {
  document.getElementById('valorC').textContent = formatarMoeda(state.valoresAcumulados.C);
  document.getElementById('valorI').textContent = formatarMoeda(state.valoresAcumulados.I);
  document.getElementById('valorP').textContent = formatarMoeda(state.valoresAcumulados.P);
  document.getElementById('valorA').textContent = formatarMoeda(state.valoresAcumulados.A);

  const total =
    state.valoresAcumulados.C +
    state.valoresAcumulados.I +
    state.valoresAcumulados.P +
    state.valoresAcumulados.A;
  document.getElementById('valorTotal').textContent = formatarMoeda(total);

  verificarAlertasFinanceiros();
}

function atualizarTabela() {
  const tbody = document.getElementById('registrosBody');
  tbody.innerHTML = '';

  state.registros.forEach((registro, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${registro.categoria}</td>
      <td>${registro.data}</td>
      <td>${registro.horario}</td>
      <td>${formatarMoeda(registro.valor)}</td>
      <td>${registro.tipo}</td>
      <td>
        <button class="btn-delete" onclick="excluirRegistro(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/****************************************
 *  ATUALIZAR GRÁFICOS
 ****************************************/
function atualizarGraficos() {
  atualizarGraficoLinha();
  atualizarGraficoCandle();
  atualizarGraficoPizza();
}

function atualizarGraficoLinha() {
  lineChart.data.labels = ['Atual'];
  lineChart.data.datasets[0].data = [state.valoresAcumulados.C];
  lineChart.data.datasets[1].data = [state.valoresAcumulados.I];
  lineChart.data.datasets[2].data = [state.valoresAcumulados.P];
  lineChart.update();
}

function atualizarGraficoCandle() {
  candleChart.data.labels = ['Atual'];
  candleChart.data.datasets[0].data = [state.valoresAcumulados.C];
  candleChart.data.datasets[1].data = [state.valoresAcumulados.I];
  candleChart.data.datasets[2].data = [state.valoresAcumulados.P];
  candleChart.data.datasets[3].data = [state.valoresAcumulados.A];
  candleChart.data.datasets[4].data = [state.valoresAcumulados.D];
  candleChart.update();
}

function atualizarGraficoPizza() {
  pieChart.data.datasets[0].data = [
    state.valoresAcumulados.C,
    state.valoresAcumulados.I,
    state.valoresAcumulados.P,
    state.valoresAcumulados.A
  ];
  pieChart.update();
}

/****************************************
 *  ALERTAS FINANCEIROS
 ****************************************/
function verificarAlertasFinanceiros() {
  const alerta = document.getElementById('mensagemAlerta');
  alerta.classList.add('hidden');
  alerta.textContent = '';
  alerta.classList.remove('alert-success', 'alert-danger');

  const { C, I, P } = state.valoresAcumulados;
  if (C <= 0) {
    alerta.textContent = 'Pare os gastos imediatamente e pense no seu futuro!';
    alerta.classList.remove('hidden');
    alerta.classList.add('alert', 'alert-danger', 'fade-in');
  }
  if (C <= 0 && I <= 0 && P <= 0) {
    alerta.textContent =
      'Infelizmente você não irá prosperar se não cortar gastos! Ajuste seus gastos e seus lucros de acordo com sua realidade e volte para o jogo!';
    alerta.classList.remove('hidden');
    alerta.classList.add('alert', 'alert-danger', 'fade-in');
  }
  if (C > 0 && I > 0 && P > 0) {
    alerta.textContent = 'Parabéns! Você voltou a prosperar!';
    alerta.classList.remove('hidden');
    alerta.classList.add('alert', 'alert-success', 'fade-in');
  }
}

/****************************************
 *  PROJEÇÃO
 ****************************************/
function calcularProjecao(e) {
  e.preventDefault();

  const valorStr = document.getElementById('valorProjecao').value.replace(/[^\d,]/g, '');
  const valor = converterParaNumero(valorStr);
  const tipoAporte = document.getElementById('tipoAporte').value;
  const periodoTipo = document.getElementById('periodoTipo').value;
  const duracao = parseInt(document.getElementById('periodoDuracao').value, 10);

  if (isNaN(valor) || valor <= 0) {
    mostrarAlerta('Valor de projeção inválido.', 'danger');
    return;
  }

  let meses = periodoTipo === 'meses' ? duracao : duracao * 12;

  let cVal = 0, iVal = 0, pVal = 0;
  const totalPorc = state.porcentagens.C + state.porcentagens.I + state.porcentagens.P;
  
  if (totalPorc === 0) {
    mostrarAlerta('Porcentagens inválidas para projeção.', 'danger');
    return;
  }

  const fracC = state.porcentagens.C / totalPorc;
  const fracI = state.porcentagens.I / totalPorc;
  const fracP = state.porcentagens.P / totalPorc;

  if (tipoAporte === 'unico') {
    cVal = valor * fracC;
    iVal = valor * fracI;
    pVal = valor * fracP;
    
    // Aplicar juros durante 'meses'
    cVal *= Math.pow(1 + CONFIG.taxaSelicMensal / 100, meses);
    iVal += iVal * (CONFIG.taxaDolarAnual / 100) * (meses / 12);
    pVal += pVal * (CONFIG.taxaOuroAnual / 100) * (meses / 12);
  } else {
    for (let m = 0; m < meses; m++) {
      cVal += valor * fracC;
      iVal += valor * fracI;
      pVal += valor * fracP;

      cVal *= (1 + CONFIG.taxaSelicMensal / 100);
      iVal += iVal * (CONFIG.taxaDolarAnual / 100 / 12);
      pVal += pVal * (CONFIG.taxaOuroAnual / 100 / 12);
    }
  }

  const totalProjecao = cVal + iVal + pVal;
  exibirResultadoProjecao(cVal, iVal, pVal, totalProjecao);
  e.target.reset();
}

function exibirResultadoProjecao(cVal, iVal, pVal, total) {
  const container = document.querySelector('#resultadoProjecao');
  container.classList.remove('hidden');
  const grade = container.querySelector('.projecao-grid');
  grade.innerHTML = `
    <div>
      <h4>Capital de Giro (C)</h4>
      <p>${formatarMoeda(cVal)}</p>
    </div>
    <div>
      <h4>Investimentos (I)</h4>
      <p>${formatarMoeda(iVal)}</p>
    </div>
    <div>
      <h4>Poupança (P)</h4>
      <p>${formatarMoeda(pVal)}</p>
    </div>
    <div>
      <h4>Total</h4>
      <p>${formatarMoeda(total)}</p>
    </div>
  `;

  if (!projecaoChart) {
    const ctx = document.getElementById('projecaoChart').getContext('2d');
    projecaoChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['C', 'I', 'P'],
        datasets: [{
          data: [cVal, iVal, pVal],
          backgroundColor: [
            CORES.capitalGiro,
            CORES.investimentos,
            CORES.poupanca
          ]
        }]
      },
      options: {
        responsive: true
      }
    });
  } else {
    projecaoChart.data.datasets[0].data = [cVal, iVal, pVal];
    projecaoChart.update();
  }
}

/****************************************
 *  TEMA (LIGHT/DARK)
 ****************************************/
function toggleTema() {
  const body = document.body;
  const icon = document.querySelector('#toggleTheme i');

  if (state.tema === 'light') {
    body.classList.add('dark-theme');
    icon.classList.replace('fa-moon', 'fa-sun');
    state.tema = 'dark';
  } else {
    body.classList.remove('dark-theme');
    icon.classList.replace('fa-sun', 'fa-moon');
    state.tema = 'light';
  }

  localStorage.setItem('tema', state.tema);
  atualizarGraficos();
}

/****************************************
 *  MOSTRAR/OCULTAR GRÁFICOS
 ****************************************/
function toggleGrafico(e) {
  const chartType = e.target.dataset.chart;
  if (!chartType) return;

  const charts = {
    line: document.getElementById('lineChart'),
    candle: document.getElementById('candleChart'),
    pie: document.getElementById('pieChart')
  };

  document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');

  Object.entries(charts).forEach(([type, chart]) => {
    chart.classList.toggle('hidden', type !== chartType);
  });

  atualizarGraficos();
}

/****************************************
 *  ALERTAS
 ****************************************/
function mostrarAlerta(mensagem, tipo) {
  const alerta = document.getElementById('mensagemAlerta');
  alerta.textContent = mensagem;
  alerta.className = `alert alert-${tipo} fade-in`;
  alerta.classList.remove('hidden');

  setTimeout(() => {
    alerta.classList.add('hidden');
  }, 3000);
}

/****************************************
 *  FORMATOS E PERSISTÊNCIA
 ****************************************/
function formatarMoeda(valor) {
  if (isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function converterParaNumero(str) {
  return parseFloat(str.replace(',', '.')) || 0;
}

function salvarDados() {
  try {
    const data = {
      registros: state.registros,
      porcentagens: state.porcentagens,
      tema: state.tema
    };
    localStorage.setItem('cipagData', JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    mostrarAlerta('Erro ao salvar dados', 'danger');
  }
}

function carregarDadosSalvos() {
  try {
    const dados = JSON.parse(localStorage.getItem('cipagData'));
    if (dados) {
      state.registros = dados.registros || [];
      state.porcentagens = dados.porcentagens || { ...CONFIG.porcentagensIniciais };
      state.tema = dados.tema || 'light';
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarAlerta('Erro ao carregar dados', 'danger');
  }
}

/****************************************
 *  EXPORTAÇÕES PDF
 ****************************************/
function exportarPDFCipag() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Relatório CIPAG', 20, 20);
  doc.text(`Total de Registros: ${state.registros.length}`, 20, 30);
  doc.save('relatorio-cipag.pdf');
}

function exportarPDFProjecao() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Relatório de Projeções', 20, 20);
  doc.save('relatorio-projecoes.pdf');
}
