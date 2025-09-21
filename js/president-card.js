class PresidentCardManager {
    constructor() {
        this.currentPresidentCard = null;
    }

    /**
     * Cria um card de presidente na área de resultados
     * @param {Object} presidente - Dados do presidente
     */
    createPresidentCardInResults(presidente) {
        const resultsArea = document.getElementById('area-resultados');
        if (!resultsArea) {
            console.error('Área de resultados não encontrada');
            return;
        }

        console.log('🎯 Criando card para:', presidente.nome);
        console.log('🎯 GSAP disponível:', typeof gsap !== 'undefined');

        const existingCard = this.currentPresidentCard;

        const cardContainer = document.createElement('div');
        cardContainer.className = 'president-result-card';
        
        const approvalClass = presidente.aprovacao.media < 50 ? 'approval-low' : 'approval-value';

        cardContainer.innerHTML = `
            <div class="president-info">
                <div class="president-header">
                    <h1 class="president-name-elegant">${presidente.nome}</h1>
                    <span class="mandate-period">${presidente.mandato}</span>
                </div>
                <div class="president-details-stack">
                    <div class="president-party">Partido: ${presidente.partido}</div>
                    <div class="president-republica">Período: ${presidente.periodo}</div>
                    <div class="details-bottom-row">
                        <div class="president-approval">
                            Aprovação de <span class="${approvalClass}">${presidente.aprovacao.media}%</span>
                        </div>
                        <div class="president-compact-info">
                            <button class="gradient-btn" onclick="window.open('presidente.html?id=${presidente.id}', '_blank')">
                                ABRIR
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        if (existingCard) {
            console.log('🔄 TROCANDO PRESIDENTE - Animando troca');
            
            cardContainer.classList.add('card-entering');
            resultsArea.appendChild(cardContainer);
            console.log('🎬 Classes do novo card:', cardContainer.className);
            
            existingCard.classList.add('card-leaving');
            console.log('🎬 Classes do card anterior:', existingCard.className);
            
            setTimeout(() => {
                if (existingCard.parentNode) {
                    existingCard.remove();
                }
                
                cardContainer.classList.remove('card-entering');
                cardContainer.classList.add('card-visible');
                
                console.log('✅ Troca de card animada concluída');
            }, 300);
            
        } else {
            console.log('🆕 PRIMEIRO PRESIDENTE - Animando entrada');
            
            cardContainer.classList.add('card-entering');
            resultsArea.appendChild(cardContainer);
            console.log('🎬 Classes do primeiro card:', cardContainer.className);
            
            setTimeout(() => {
                cardContainer.classList.remove('card-entering');
                cardContainer.classList.add('card-visible');
                console.log('🎬 Classes após animação:', cardContainer.className);
                console.log('✅ Primeiro card animado');
            }, 100);
        }
        
        this.currentPresidentCard = cardContainer;
    }

    /**
     * @param {Object} presidente - Dados do presidente
     */
    createPresidentCard(presidente) {
        if (this.currentPresidentCard) {
            this.currentPresidentCard.remove();
        }

        const cardContainer = document.createElement('div');
        cardContainer.className = 'president-result-card';
        cardContainer.innerHTML = `
            <div class="president-card-header">
                <img class="president-photo" src="${presidente.foto}" alt="${presidente.nome}" 
                     onerror="this.src='assets/images/presidentes/placeholder.svg'">
                <div class="president-info">
                    <h2 class="president-name">${presidente.nome}</h2>
                    <p class="president-full-name">${presidente.nomeCompleto}</p>
                    <div class="president-compact-info">
                        <span class="president-period">${presidente.periodo}</span>
                    </div>
                </div>
            </div>
            <button class="view-details-btn" onclick="window.open('presidente.html?id=${presidente.id}', '_blank')">
                Ver Detalhes
            </button>
        `;

        const searchCard = document.querySelector('.search-card');
        searchCard.parentNode.insertBefore(cardContainer, searchCard.nextSibling);
        
        this.currentPresidentCard = cardContainer;
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
        if (this.currentPresidentCard) {
            this.currentPresidentCard.remove();
            this.currentPresidentCard = null;
        }
    }
}

