/**
 * Página de Detalhes do Presidente
 * Responsável por exibir informações detalhadas de um presidente específico
 */
class PresidentePage {
    constructor() {
        this.presidentes = [];
        this.currentPresident = null;
        this.comparisonPresident = null;
        this.charts = {};
    // Notificações removidas
        
        this.init();
    }

    /**
     * Inicializa a página
     */
    async init() {
        await this.loadPresidentes();
        this.loadPresidentFromURL();
        this.initModalEvents();
        this.initAnimations();
    }

    /**
     * Carrega os dados dos presidentes
     */
    async loadPresidentes() {
        try {
            const response = await fetch('./data/presidentes-db.json');
            const data = await response.json();
            this.presidentes = data.presidentes;
        } catch (error) {
            console.error('Erro ao carregar dados dos presidentes:', error);
            // Notificações removidas
        }
    }

    /**
     * Carrega presidente baseado na URL
     */
    loadPresidentFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const presidentId = urlParams.get('id');
        
        if (presidentId) {
            const president = this.presidentes.find(p => p.id === presidentId);
            if (president) {
                this.displayPresident(president);
                this.currentPresident = president;
            } else {
                this.showError('Presidente não encontrado');
            }
        } else {
            this.showError('ID do presidente não fornecido');
        }
    }

    /**
     * Exibe os dados do presidente
     * @param {Object} presidente - Dados do presidente
     */
    displayPresident(presidente) {
        // Atualizar título da página
        document.title = `${presidente.nome} - PresiData BR`;

        // Foto
        const photo = document.getElementById('president-photo');
        photo.src = presidente.foto;
        photo.alt = `Foto de ${presidente.nome}`;

        // Informações básicas
        document.getElementById('president-name').textContent = presidente.nome;
        document.getElementById('president-full-name').textContent = presidente.nomeCompleto;
        document.getElementById('president-mandate').textContent = presidente.mandato;
        document.getElementById('president-party').textContent = presidente.partido;

        // Indicadores rápidos
        document.getElementById('approval-rating').textContent = 
            presidente.aprovacao?.media ? `${presidente.aprovacao.media}%` : 'N/A';
        document.getElementById('economic-growth').textContent = 
            presidente.dadosEconomicos?.crescimentoPIB || 'N/A';
        document.getElementById('period').textContent = presidente.periodo;

        // Biografia
        document.getElementById('president-biography').textContent = presidente.biografia;
        document.getElementById('birth-info').textContent = presidente.nascimento;
        document.getElementById('birth-place').textContent = presidente.local;
        
        if (presidente.morte && presidente.morte !== 'Vivo') {
            document.getElementById('death-info').textContent = presidente.morte;
            document.getElementById('death-info-container').style.display = 'block';
        }

        // Realizações
        this.displayAchievements(presidente.realizacoes);

        // Dados econômicos
        this.displayEconomicData(presidente.dadosEconomicos);

        // Análise de mandato
        this.displayAnalysis(presidente.coisasBoas, presidente.polemicas);

        // Gráficos
        setTimeout(() => {
            this.createCharts(presidente);
        }, 500);
    }

    /**
     * Exibe as realizações do presidente
     * @param {Array} realizacoes - Lista de realizações
     */
    displayAchievements(realizacoes) {
        const container = document.getElementById('achievements-list');
        container.innerHTML = realizacoes.map(realizacao => `
            <div class="achievement-item" data-aos="fade-up">
                <div class="achievement-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <p>${realizacao}</p>
            </div>
        `).join('');
    }

    /**
     * Exibe dados econômicos
     * @param {Object} dados - Dados econômicos
     */
    displayEconomicData(dados) {
        if (!dados) return;

        document.getElementById('pib-inicio').textContent = dados.pibInicio || 'N/A';
        document.getElementById('pib-fim').textContent = dados.pibFim || 'N/A';
        document.getElementById('pib-crescimento').textContent = dados.crescimentoPIB || 'N/A';
        document.getElementById('inflacao-media').textContent = dados.inflacaoMedia || 'N/A';
        document.getElementById('desemprego').textContent = dados.desemprego || 'N/A';
        document.getElementById('divida').textContent = dados.divida || 'N/A';

        // Adicionar classes de cor baseado no crescimento
        const crescimentoElement = document.getElementById('pib-crescimento');
        const crescimento = dados.crescimentoPIB;
        if (crescimento && crescimento.includes('+')) {
            crescimentoElement.style.color = '#10b981';
        } else if (crescimento && crescimento.includes('-')) {
            crescimentoElement.style.color = '#ef4444';
        }
    }

    /**
     * Exibe análise de mandato
     * @param {Array} pontos - Pontos positivos
     * @param {Array} polemicas - Polêmicas
     */
    displayAnalysis(pontos, polemicas) {
        const positiveContainer = document.getElementById('positive-points');
        const controversyContainer = document.getElementById('controversies');

        if (pontos) {
            positiveContainer.innerHTML = pontos.map(ponto => `
                <li data-aos="fade-left">${ponto}</li>
            `).join('');
        }

        if (polemicas) {
            controversyContainer.innerHTML = polemicas.map(polemica => `
                <li data-aos="fade-right">${polemica}</li>
            `).join('');
        }
    }

    /**
     * Cria os gráficos
     * @param {Object} presidente - Dados do presidente
     */
    createCharts(presidente) {
        this.createIndicatorsChart(presidente.indicadores);
        this.createApprovalChart(presidente.aprovacao);
    }

    /**
     * Cria gráfico de indicadores
     * @param {Object} indicadores - Dados dos indicadores
     */
    createIndicatorsChart(indicadores) {
        if (!indicadores) return;

        const ctx = document.getElementById('indicatorsChart');
        if (!ctx) return;

        if (this.charts.indicators) {
            this.charts.indicators.destroy();
        }

        this.charts.indicators = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Educação', 'Saúde', 'Economia', 'Social', 'Anticorrupção'],
                datasets: [{
                    label: 'Indicadores',
                    data: [
                        indicadores.educacao || 0,
                        indicadores.saude || 0,
                        indicadores.economia || 0,
                        indicadores.social || 0,
                        100 - (indicadores.corrupcao || 0)
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Cria gráfico de aprovação
     * @param {Object} aprovacao - Dados de aprovação
     */
    createApprovalChart(aprovacao) {
        if (!aprovacao) return;

        const ctx = document.getElementById('approvalChart');
        if (!ctx) return;

        if (this.charts.approval) {
            this.charts.approval.destroy();
        }

        this.charts.approval = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Início do Mandato', 'Meio do Mandato', 'Final do Mandato'],
                datasets: [{
                    label: 'Aprovação (%)',
                    data: [aprovacao.inicial || 0, aprovacao.media || 0, aprovacao.final || 0],
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

   
    initModalEvents() {
        const modal = document.getElementById('comparison-modal');
        const compareBtn = document.getElementById('compare-btn');
        const closeBtn = document.getElementById('close-modal');
        const compareSearch = document.getElementById('compare-search');
        const compareSuggestions = document.getElementById('compare-suggestions');

        compareBtn?.addEventListener('click', () => {
            modal.style.display = 'flex';
            compareSearch.focus();
        });

        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        compareSearch?.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length >= 1) {
                this.showComparisonSuggestions(query);
            } else {
                this.hideComparisonSuggestions();
            }
        });

        if (this.currentPresident) {
            compareBtn.disabled = false;
        }
    }

    /**
     * Mostra sugestões para comparação
     * @param {string} query - Termo de busca
     */
    showComparisonSuggestions(query) {
        const matches = this.presidentes.filter(presidente => 
            presidente.id !== this.currentPresident?.id &&
            (presidente.nome.toLowerCase().includes(query) ||
             presidente.nomeCompleto.toLowerCase().includes(query))
        ).slice(0, 6);

        const container = document.getElementById('compare-suggestions');
        
        if (matches.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = matches.map(presidente => `
            <div class="comparison-suggestion" data-president-id="${presidente.id}">
                <img src="${presidente.foto}" alt="${presidente.nome}">
                <div class="suggestion-info">
                    <div class="suggestion-name">${presidente.nome}</div>
                    <div class="suggestion-details">${presidente.mandato}</div>
                </div>
            </div>
        `).join('');

        container.style.display = 'block';

        // Adicionar eventos de clique
        container.querySelectorAll('.comparison-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const presidentId = item.dataset.presidentId;
                const president = this.presidentes.find(p => p.id === presidentId);
                this.startComparison(president);
            });
        });
    }

   
    hideComparisonSuggestions() {
        const container = document.getElementById('compare-suggestions');
        container.style.display = 'none';
    }

    /**
     * @param {Object} comparisonPresident - Presidente para comparar
     */
    startComparison(comparisonPresident) {
        this.comparisonPresident = comparisonPresident;
        this.hideComparisonSuggestions();
        document.getElementById('compare-search').value = comparisonPresident.nome;
        
        this.createComparisonView();
    }

   
    createComparisonView() {
        const container = document.getElementById('comparison-content');
        
        const comparison = this.comparePresidents(this.currentPresident, this.comparisonPresident);
        
        container.innerHTML = `
            <div class="comparison-header">
                <h3>Comparação entre Presidentes</h3>
            </div>
            
            <div class="presidents-comparison">
                <div class="president-comparison-card">
                    <div class="president-header">
                        <img src="${this.currentPresident.foto}" alt="${this.currentPresident.nome}">
                        <div>
                            <h4>${this.currentPresident.nome}</h4>
                            <p>${this.currentPresident.mandato}</p>
                        </div>
                    </div>
                </div>
                
                <div class="vs-divider">
                    <span>VS</span>
                </div>
                
                <div class="president-comparison-card">
                    <div class="president-header">
                        <img src="${this.comparisonPresident.foto}" alt="${this.comparisonPresident.nome}">
                        <div>
                            <h4>${this.comparisonPresident.nome}</h4>
                            <p>${this.comparisonPresident.mandato}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="comparison-metrics">
                ${comparison.map(metric => `
                    <div class="metric-comparison">
                        <h5>${metric.label}</h5>
                        <div class="metric-bars">
                            <div class="metric-bar">
                                <span class="metric-name">${this.currentPresident.nome}</span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${metric.president1.percentage}%; background: #667eea;"></div>
                                    <span class="bar-value">${metric.president1.value}</span>
                                </div>
                            </div>
                            <div class="metric-bar">
                                <span class="metric-name">${this.comparisonPresident.nome}</span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${metric.president2.percentage}%; background: #764ba2;"></div>
                                    <span class="bar-value">${metric.president2.value}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.style.display = 'block';
    }

    /**
     * Compara dois presidentes
     * @param {Object} president1 - Primeiro presidente
     * @param {Object} president2 - Segundo presidente
     * @returns {Array} Métricas comparativas
     */
    comparePresidents(president1, president2) {
        const metrics = [
            {
                label: 'Aprovação Média',
                getValue: (p) => p.aprovacao?.media || 0,
                format: (v) => v + '%'
            },
            {
                label: 'Educação',
                getValue: (p) => p.indicadores?.educacao || 0,
                format: (v) => v + '%'
            },
            {
                label: 'Saúde',
                getValue: (p) => p.indicadores?.saude || 0,
                format: (v) => v + '%'
            },
            {
                label: 'Economia',
                getValue: (p) => p.indicadores?.economia || 0,
                format: (v) => v + '%'
            },
            {
                label: 'Social',
                getValue: (p) => p.indicadores?.social || 0,
                format: (v) => v + '%'
            }
        ];

        return metrics.map(metric => {
            const value1 = metric.getValue(president1);
            const value2 = metric.getValue(president2);
            const max = Math.max(value1, value2, 1);

            return {
                label: metric.label,
                president1: {
                    value: metric.format(value1),
                    percentage: (value1 / max) * 100
                },
                president2: {
                    value: metric.format(value2),
                    percentage: (value2 / max) * 100
                }
            };
        });
    }

    /**
     * Inicializa animações
     */
    initAnimations() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true
            });
        }

        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            gsap.timeline()
                .from('.page-header', {
                    y: -50,
                    opacity: 0,
                    duration: 0.6
                })
                .from('.president-hero', {
                    y: 30,
                    opacity: 0,
                    duration: 0.8
                }, "-=0.4")
                .from('.content-sections', {
                    y: 20,
                    opacity: 0,
                    duration: 0.6
                }, "-=0.4");
        }
    }

    /**
     * Exibe página de erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        document.body.innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h1>Erro</h1>
                    <p>${message}</p>
                    <a href="index.html" class="btn-primary">Voltar ao Início</a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PresidentePage();
});