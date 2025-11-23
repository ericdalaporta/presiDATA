class PresidentCardManager {
    constructor() {
        this.currentCards = [];
    }

    /**
     * Renderiza um ou mais cards de presidente na área de resultados
     * @param {Object[]|Object} presidentes - Lista de presidentes a exibir
     */
    createPresidentCardInResults(presidentes) {
        const listaPresidentes = Array.isArray(presidentes)
            ? presidentes.filter(Boolean)
            : [presidentes].filter(Boolean);

        const resultsArea = document.getElementById('area-resultados');
        if (!resultsArea) {
            console.error('Área de resultados não encontrada');
            return;
        }

        console.log('🎯 Renderizando', listaPresidentes.length, 'card(s) de presidente');

        const useHeightAnimation = typeof gsap !== 'undefined';
        const wasEmpty = resultsArea.classList.contains('is-empty');
        const previousHeight = wasEmpty ? 0 : resultsArea.offsetHeight;

        const leavingCards = [...this.currentCards];
        if (leavingCards.length) {
            leavingCards.forEach(card => {
                card.classList.add('card-leaving');
                setTimeout(() => card.remove(), 250);
            });
        }

        this.currentCards = [];

        const mountDelay = leavingCards.length ? 220 : 0;

        if (listaPresidentes.length === 0) {
            if (useHeightAnimation && previousHeight > 0) {
                this.lockResultsAreaHeight(resultsArea, previousHeight);
            }

            setTimeout(() => {
                resultsArea.innerHTML = '';

                if (useHeightAnimation && previousHeight > 0) {
                    this.animateResultsAreaHeight(resultsArea, 0, () => {
                        resultsArea.classList.add('is-empty');
                        this.clearResultsAreaHeight(resultsArea);
                    });
                } else {
                    resultsArea.classList.add('is-empty');
                    this.clearResultsAreaHeight(resultsArea);
                }
            }, mountDelay);

            return;
        }

        if (wasEmpty) {
            resultsArea.classList.remove('is-empty');
        }

        if (useHeightAnimation) {
            this.lockResultsAreaHeight(resultsArea, previousHeight);
        }

        const fragment = document.createDocumentFragment();
        const newCards = [];
        listaPresidentes.forEach((presidente, index) => {
            const cardContainer = this.buildPresidentCard(presidente, index, listaPresidentes.length);
            cardContainer.classList.add('card-entering');
            fragment.appendChild(cardContainer);
            newCards.push(cardContainer);
        });

        setTimeout(() => {
            resultsArea.innerHTML = '';
            resultsArea.appendChild(fragment);
            this.currentCards = newCards;

            if (useHeightAnimation) {
                const targetHeight = resultsArea.scrollHeight;
                this.animateResultsAreaHeight(resultsArea, targetHeight, () => {
                    this.clearResultsAreaHeight(resultsArea);
                });
            } else {
                this.clearResultsAreaHeight(resultsArea);
            }

            requestAnimationFrame(() => {
                newCards.forEach((card, idx) => {
                    setTimeout(() => {
                        card.classList.remove('card-entering');
                        card.classList.add('card-visible');
                    }, 80 + idx * 40);
                });
            });
        }, mountDelay);
    }

    buildPresidentCard(presidente, order = 0, total = 1) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'president-result-card';

        const partyDisplay = Array.isArray(presidente.partido) ? presidente.partido.join(', ') : (presidente.partido || 'Sem partido');
        const professionDisplay = Array.isArray(presidente.profissao) ? presidente.profissao.join(', ') : (presidente.profissao || 'Não informado');
        const showMandateLabel = total > 1;
        const mandatoLabel = showMandateLabel ? `<span class="mandate-order">Mandato ${order + 1}</span>` : '';

        cardContainer.innerHTML = `
            <div class="president-info">
                <div class="president-header">
                    <h1 class="president-name-elegant">${presidente.nome}</h1>
                    <div class="mandate-wrapper">
                        ${mandatoLabel}
                        <span class="mandate-period">${presidente.inicio_mandato} a ${presidente.final_mandato}</span>
                    </div>
                </div>
                <div class="president-details-stack">
                    <div class="details-bottom-row">
                        <div class="president-meta">
                            <div class="president-party">Partido: ${partyDisplay}</div>
                            <div class="president-profession">Profissão: <span class="profissao-value">${professionDisplay}</span></div>
                        </div>
                        <div class="president-compact-info">
                            <button class="gradient-btn" onclick="window.open('presidente.html?id=${presidente.id}', '_blank')">
                                ABRIR
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        return cardContainer;
    }

    /**
     * @param {Object} presidente - Dados do presidente
     */
    createPresidentCard(presidente) {
        this.createPresidentCardInResults(presidente);
    }

    lockResultsAreaHeight(element, fallbackHeight = 0) {
        if (!element) {
            return;
        }

        const safeHeight = Math.max(0, Number.isFinite(fallbackHeight) ? fallbackHeight : element.offsetHeight);
        element.style.height = `${safeHeight}px`;
        element.style.willChange = 'height';
    }

    animateResultsAreaHeight(element, targetHeight, onComplete) {
        if (!element) {
            return;
        }

        if (typeof gsap === 'undefined') {
            element.style.height = targetHeight === 0 ? '0px' : 'auto';
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        gsap.killTweensOf(element);

        gsap.to(element, {
            height: targetHeight,
            duration: 0.55,
            ease: 'power3.out',
            onComplete: () => {
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        });
    }

    clearResultsAreaHeight(element) {
        if (!element) {
            return;
        }

        element.style.removeProperty('height');
        element.style.removeProperty('will-change');
    }

    /**
     * @param {string} periodo - Período do presidente
     * @returns {string} Classe CSS do badge
     */
    getBadgeClass(periodo) {
        switch(periodo.toLowerCase()) {
            case 'república velha':
                return 'badge-republica-velha';
            case 'era vargas':
                return 'badge-era-vargas';  
            case 'república nova':
                return 'badge-republica-nova';
            case 'anos dourados':
                return 'badge-anos-ouro';
            case 'ditadura militar':
                return 'badge-ditadura-militar';
            case 'nova república':
                return 'badge-nova-republica';
            default:
                return 'badge-default';
        }
    }

    /**
     * Calcula anos no cargo baseado no mandato
     * @param {string} mandato - Período do mandato
     * @returns {number} Total de anos no cargo
     */
    calculateYearsInOffice(mandato) {
        const years = mandato.split(',').map(period => {
            const [start, end] = period.trim().split('-');
            return parseInt(end) - parseInt(start) + 1;
        });
        return years.reduce((total, year) => total + year, 0);
    }

    /**
     * Remove o card atual
     */
    clearCurrentCard() {
        if (this.currentCards.length) {
            this.currentCards.forEach(card => card.remove());
            this.currentCards = [];
        }

        const resultsArea = document.getElementById('area-resultados');
        if (resultsArea) {
            resultsArea.classList.add('is-empty');
            resultsArea.innerHTML = '';
        }
    }
}

