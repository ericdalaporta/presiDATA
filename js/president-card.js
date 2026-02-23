class PresidentCardManager {
    constructor() {
        this.currentCards = [];
    }

    
    createPresidentCardInResults(presidentes) {
        const listaPresidentes = Array.isArray(presidentes)
            ? presidentes.filter(Boolean)
            : [presidentes].filter(Boolean);

        const resultsArea = document.getElementById('area-resultados');
        if (!resultsArea) {
            console.error('Área de resultados não encontrada');
            return;
        }

        
        const leavingCards = [...this.currentCards];
        const mountDelay = leavingCards.length ? 180 : 0;

        if (leavingCards.length) {
            if (typeof gsap !== 'undefined') {
                gsap.to(leavingCards, {
                    opacity: 0,
                    y: -20,
                    scale: 0.95,
                    filter: 'blur(4px)',
                    duration: 0.18,
                    ease: 'power3.in',
                    stagger: 0.04,
                    onComplete: () => leavingCards.forEach(c => c.remove())
                });
            } else {
                leavingCards.forEach(card => {
                    card.style.transition = 'opacity 0.15s ease';
                    card.style.opacity = '0';
                });
                setTimeout(() => leavingCards.forEach(c => c.remove()), 150);
            }
        }

        this.currentCards = [];

        if (listaPresidentes.length === 0) {
            setTimeout(() => {
                resultsArea.innerHTML = '';
                resultsArea.classList.add('is-empty');
                const tutorial = document.querySelector('.instructions-section');
                if (tutorial) {
                    tutorial.classList.remove('is-hidden');
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(tutorial,
                            { opacity: 0, y: 16, scale: 0.97 },
                            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out',
                              onComplete: () => gsap.set(tutorial, { clearProps: 'all' }) }
                        );
                    }
                }
            }, mountDelay);
            return;
        }

        
        resultsArea.classList.remove('is-empty');

        const fragment = document.createDocumentFragment();
        const newCards = [];
        listaPresidentes.forEach((presidente, index) => {
            const card = this.buildPresidentCard(presidente, index, listaPresidentes.length);
            fragment.appendChild(card);
            newCards.push(card);
        });

        setTimeout(() => {
            resultsArea.innerHTML = '';
            resultsArea.appendChild(fragment);
            this.currentCards = newCards;

            if (typeof gsap !== 'undefined') {
                
                gsap.fromTo(newCards,
                    {
                        opacity: 0,
                        y: 40,
                        scale: 0.92,
                        filter: 'blur(8px)',
                        rotationX: 6
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        rotationX: 0,
                        duration: 0.45,
                        ease: 'expo.out',
                        stagger: 0.07,
                        transformOrigin: 'center bottom',
                        onComplete: () => gsap.set(newCards, { clearProps: 'all' })
                    }
                );
            } else {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        newCards.forEach(card => {
                            card.style.transition = 'opacity 0.22s ease';
                            card.style.opacity = '1';
                        });
                    });
                });
            }
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
            </div>`;
        return cardContainer;
    }

    
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

    
    calculateYearsInOffice(mandato) {
        const years = mandato.split(',').map(period => {
            const [start, end] = period.trim().split('-');
            return parseInt(end) - parseInt(start) + 1;
        });
        return years.reduce((total, year) => total + year, 0);
    }

    
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

