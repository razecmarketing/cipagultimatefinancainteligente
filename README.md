Pensou por um segundo
CIPAG Ultimate – Sistema de Fluxo de Caixa Inteligente

Bem-vindo(a) ao CIPAG Ultimate, uma aplicação web 100% responsiva construída com HTML, CSS e JavaScript puro. O propósito é otimizar o controle de pagamentos e despesas, além de oferecer projeções financeiras e gráficos dinâmicos, tudo em uma interface intuitiva que pode ser executada em qualquer dispositivo.
Sumário

    Visão Geral
    Funcionalidades Principais
    Estrutura de Pastas
    Instruções de Uso
    Tecnologias e Recursos Utilizados
    Como Contribuir
    Licença

Visão Geral

O CIPAG Ultimate foi desenvolvido para facilitar o acompanhamento de fluxo de caixa, gerando gráficos de análise e relatórios PDF para melhor compreensão dos dados. Você pode inserir pagamentos, despesas, ajustar porcentagens de investimentos e guardar tudo localmente no LocalStorage do navegador.

O projeto é modular: bastam três arquivos principais para rodar:

    index.html
    css/styles.css
    js/script.js

E está pronto para rodar em qualquer ambiente frontend sem dependências adicionais de frameworks – apenas vanilla HTML/CSS/JS.
Funcionalidades Principais

    Adicionar Pagamentos e Despesas
        Entradas diárias, mensais ou pontuais.
        Checkbox para alternar entre Pagamento ou Despesa.

    Porcentagens Dinâmicas (CIPA)
        C: Capital de Giro,
        I: Investimentos (Reserva em dólar),
        P: Poupança (Reserva em ouro),
        A: Aluguel/Despesas Fixas.
        Altere esses valores em tempo real, refletindo em toda a aplicação.

    Tabela de Registros
        Listagem completa de entradas e saídas.
        Botão Excluir registro.

    Valores Acumulados
        Controle em tempo real de C, I, P, A, e Total.

    Gráficos Interativos
        Linha: exibe o desempenho de C, I, e P.
        Candle (barras): exibe separadamente Capital de Giro, Investimentos, Poupança, Aluguel e Despesas.
        Pizza: distribuição de C, I, P e A.

    Projeções Financeiras
        Cálculo rápido de rendimentos futuros (pagamentos mensais ou únicos).
        Gera valores simulados para meses ou anos.
        Gráfico de pizza específico para projeções.

    Exportar Relatórios
        Geração de PDFs simples para CIPAG (entradas e saídas) e Projeção (valores projetados).

    Tema Claro/Escuro
        Botão de Alternar Tema que atualiza a UI dinamicamente com transições suaves.

Estrutura de Pastas

seu_projeto/
├─ index.html
├─ css/
│  └─ styles.css
└─ js/
   └─ script.js

    index.html: Arquivo principal com a estrutura base do aplicativo.
    styles.css: Estilos globais e responsividade.
    script.js: Contém a lógica de inserção, exclusão, cálculos, projeções, gráficos e tema.

Instruções de Uso

    Clone ou Baixe o repositório.
    Abra o arquivo index.html em qualquer navegador moderno (Chrome, Firefox, Edge, Safari etc.).
    Adicione transações via “Adicionar Pagamentos e Despesas”.
    Ajuste as porcentagens de CIPA conforme desejar.
    Verifique a tabela de registros e exclua itens indesejados.
    Acompanhe os “Valores Acumulados” e alterne os gráficos (Linha, Candle, Pizza).
    Faça projeções no formulário de “Faça uma projeção de patrimônio”.
    Use os botões de Exportar para gerar PDFs básicos (CIPAG e Projeção).
    Alternar Tema (claro ou escuro) no topo ao clicar no botão.

Tecnologias e Recursos Utilizados

    HTML5: Estrutura semântica e layout responsivo.
    CSS3:
        Responsividade via @media queries.
        Animações para o botão de tema.
        Design limpo usando variáveis e classes utilitárias.
    JavaScript (Vanilla ES6+):
        Manipulação de DOM para inserir, excluir e exibir registros.
        Chart.js (CDN) para gerar gráficos dinâmicos.
        LocalStorage para manter dados entre sessões.
        jsPDF (CDN) para geração simples de PDFs.
    Font Awesome: Ícones na UI (botões, cabeçalho e etc.).

Como Contribuir

    Fork o repositório e crie uma branch feature/nome.
    Faça as alterações necessárias e commit.
    Abra um Pull Request com uma descrição clara das mudanças.
    Feedbacks e revisões serão bem-vindos!

Sinta-se livre para ajustar design, lógica de projeção ou melhorias no fluxo de trabalho.
Licença

Este projeto está sob a MIT License. Fique à vontade para usar e adaptar em projetos pessoais ou comerciais. Não nos responsabilizamos por tomadas de decisão financeira baseadas nas projeções geradas pelo aplicativo.

Aproveite o CIPAG Ultimate e transforme sua gestão financeira em algo simples, visual e eficiente! Se tiver dúvidas ou sugestões, abra uma issue ou entre em contato.

    Equipe CIPAG – Juntos na missão de empoderar suas finanças e potencializar seus lucros.
