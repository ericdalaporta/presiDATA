class PresiDataBR {
    constructor() {
        this.searchInput = document.getElementById('busca-candidato');
        this.searchButton = document.getElementById('btn-buscar');
        this.areaResultados = document.getElementById('area-resultados');
        this.suggestionsDropdown = document.getElementById('suggestions-dropdown');
        this.tutorialCards = document.getElementById('tutorial-cards');
        this.quickStats = document.getElementById('quick-stats');
        
        this.presidentes = [];
        this.isFirstSearch = true;
        
        this.animationManager = new AnimationManager();
        this.presidentCardManager = new PresidentCardManager();
        this.typewriter = null;
        
        if (!this.searchInput || !this.searchButton) {
            console.warn('Elementos do DOM não foram encontrados');
            return;
        }
        
        this.init();
    }

    async init() {
        await this.loadPresidentes();
        this.initAnimations();
        this.initTypewriter();
        this.initSearch();
        this.initScrollAnimations();
        this.animateStats();
        
        setTimeout(() => {
            this.searchInput?.focus();
        }, 1500);
    }
    
    initTypewriter() {
        setTimeout(() => {
            if (this.searchInput && this.searchInput.value === '') {
                this.typewriter = new TypewriterEffect(this.searchInput);
            }
            
            this.searchInput.addEventListener('focus', () => {
                if (this.typewriter) {
                    this.typewriter.stop();
                    this.typewriter = null;
                }
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    searchContainer.classList.add('focused');
                }
            });
            
            this.searchInput.addEventListener('blur', () => {
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    searchContainer.classList.remove('focused');
                }
                
                if (this.searchInput.value === '' && !this.typewriter) {
                    setTimeout(() => {
                        if (this.searchInput.value === '') {
                            this.typewriter = new TypewriterEffect(this.searchInput);
                        }
                    }, 1500);
                }
            });
            
            this.searchInput.addEventListener('input', () => {
                if (this.typewriter && this.searchInput.value !== '') {
                    this.typewriter.stop();
                    this.typewriter = null;
                }
            });
        }, 2000);
    }

    async loadPresidentes() {
        try {
            const response = await fetch('./data/presidentes-db.json');
            const data = await response.json();
            this.presidentes = data.presidentes;
            console.log(`Carregados ${this.presidentes.length} presidentes`);
        } catch (error) {
            console.error('Erro ao carregar dados dos presidentes:', error);
        }
    }

    initAnimations() {
        this.animationManager.animatePageEntry();
    }

    initSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length >= 1) {
                this.showSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        });

        const performSearch = () => {
            if (this.animationManager.isCurrentlyAnimating()) {
                console.log('⚠️ Animação ativa, ignorando busca...');
                return;
            }
            
            const query = this.searchInput.value.trim();
            if (query.length >= 1) {
                this.searchPresidentes(query);
            }
        };

        this.searchButton.addEventListener('click', performSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                this.hideSuggestions();
            }
        });
    }

    /**
     * Mostra sugestões de busca
     * @param {string} query - Termo de busca
     */
    showSuggestions(query) {
        const matches = this.presidentes.filter(presidente => 
            presidente.nome.toLowerCase().includes(query) ||
            presidente.nomeCompleto.toLowerCase().includes(query) ||
            presidente.partido.toLowerCase().includes(query)
        ).slice(0, 8);

        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHTML = matches.map(presidente => `
            <div class="suggestion-item" data-president-id="${presidente.id}">
                <img src="${presidente.foto}" alt="${presidente.nome}" class="suggestion-photo">
                <div class="suggestion-info">
                    <div class="suggestion-name">${presidente.nome}</div>
                    <div class="suggestion-details">${presidente.mandato} • ${presidente.partido}</div>
                </div>
            </div>
        `).join('');

        this.suggestionsDropdown.innerHTML = suggestionsHTML;
        this.suggestionsDropdown.classList.add('active');

        this.suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const presidentId = item.dataset.presidentId;
                const presidente = this.presidentes.find(p => p.id === presidentId);
                this.selectPresident(presidente);
            });
        });
    }


    hideSuggestions() {
        this.suggestionsDropdown.classList.remove('active');
    }

    /**
     * Busca presidentes
     * @param {string} query - Termo de busca
     */
    searchPresidentes(query) {
        if (this.animationManager.isCurrentlyAnimating()) {
            console.log('⚠️ Animação em andamento, ignorando busca...');
            return;
        }
        
        const matches = this.presidentes.filter(presidente => 
            presidente.nome.toLowerCase().includes(query.toLowerCase()) ||
            presidente.nomeCompleto.toLowerCase().includes(query.toLowerCase()) ||
            presidente.partido.toLowerCase().includes(query.toLowerCase())
        );

        if (matches.length > 0) {
            this.selectPresident(matches[0]);
        } else {
            return
        }
    }

    /**
     * Seleciona um presidente
     * @param {Object} presidente 
     */
    selectPresident(presidente) {
        console.log('🎯 Presidente selecionado:', presidente.nome);
        console.log('🎯 É primeira pesquisa:', this.isFirstSearch);
        
        if (this.animationManager.isCurrentlyAnimating()) {
            console.log('⚠️ Animação já em andamento, ignorando...');
            return;
        }
        
        this.hideSuggestions();
        this.searchInput.value = presidente.nome;
        
        this.animationManager.animatePresidentSelection(presidente, this.isFirstSearch, (pres) => {
            console.log('🎯 Callback executado para:', pres.nome);
            this.presidentCardManager.createPresidentCardInResults(pres);
        });
        
        this.isFirstSearch = false;
    }
   
    initScrollAnimations() {
        this.animationManager.initScrollAnimations();
    }

    animateStats() {
        this.animationManager.animateStats();
    }

    /**
     * Mostra comparação rápida (placeholder)
     * @param {string} presidentId - ID do presidente
     */
    showQuickComparison(presidentId) {
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.presidata = new PresiDataBR();
});

window.presidata = null;