(function () {
    'use strict';

    const DATA_URL = './data/presidentes-db.json';

    let allPresidentes = [];
    let catalogoLimitado = true;   
    
    let showAll = (sessionStorage.getItem('scrollToPresidentes') === '1') || (window.location.hash === '#presidentes');

    
    const CATALOGO_PADRAO = [
        'deodoro_da_fonseca',
        'floriano_peixoto',
        'prudente_de_morais',
        'campos_sales',
        'rodrigues_alves',
        'getulio_vargas',
        'eurico_dutra',
        'juscelino_kubitschek',
        'joao_goulart',
        'fernando_henrique_cardoso',
        'lula',
        'jair_bolsonaro'
    ];

    

    function parseDateBR(str) {
        if (!str) return null;
        const parts = str.split('/');
        if (parts.length !== 3) return null;
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }

    function formatYearRange(inicio, fim) {
        const d1 = parseDateBR(inicio);
        const d2 = parseDateBR(fim);
        if (!d1 || !d2) return (inicio || '') + ' – ' + (fim || '');
        return d1.getFullYear() + ' – ' + d2.getFullYear();
    }

    function deriveRegime(p) {
        const ini = parseDateBR(p.inicio_mandato);
        const fim = parseDateBR(p.final_mandato);
        const year = ini ? ini.getFullYear() : 0;
        const month = ini ? ini.getMonth() + 1 : 0; 

        
        if (year > 1937 || (year === 1937 && month >= 11)) {
            if (fim && (fim.getFullYear() < 1946)) {
                
                if (year >= 1937 && fim.getFullYear() <= 1945) return 'Estado Novo';
            }
        }
        if (year >= 1964 && year <= 1985) return 'Ditadura Militar';
        return 'República';
    }

    function normalizeText(text) {
        if (!text) return '';
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    

    async function loadData() {
        try {
            const res = await fetch(DATA_URL);
            const json = await res.json();
            allPresidentes = (json.presidentes || []).map(p => ({
                ...p,
                _norm: normalizeText(p.nome)
            }));
            document.getElementById('stat-presidentes').textContent = allPresidentes.length;
            renderCatalogo();
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }

    

    function renderCatalogo() {
        const body = document.getElementById('catalog-body');
        if (!body) return;

        
        const sorted = allPresidentes.slice().sort(function (a, b) {
            const da = parseDateBR(a.inicio_mandato);
            const db = parseDateBR(b.inicio_mandato);
            if (!da && !db) return 0;
            if (!da) return 1;
            if (!db) return -1;
            return da - db;
        });

        let lista;
        if (showAll) {
            lista = sorted;
        } else {
            lista = sorted.slice(0, 12);
        }

        body.innerHTML = lista.map(p => {
            const regime = deriveRegime(p);
            const isEspecial = regime === 'Estado Novo' || regime === 'Ditadura Militar';
            
            const num = (p.numero && p.numero > 0) ? String(p.numero).padStart(2, '0') : '—';
            const mandato = formatYearRange(p.inicio_mandato, p.final_mandato);
            return '<a href="presidente.html?id=' + p.id + '" class="catalog-row">' +
                '<span class="row-num">' + num + '</span>' +
                '<span class="row-name">' + escHtml(p.nome) + '</span>' +
                '<span class="row-mandate">' + escHtml(mandato) + '</span>' +
                '<span class="row-regime' + (isEspecial ? ' row-regime--especial' : '') + '">' + escHtml(regime) + '</span>' +
                '</a>';
        }).join('');
    }

    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    

    document.addEventListener('DOMContentLoaded', function () {
        const btnVerTodos = document.getElementById('btn-ver-todos');
        if (btnVerTodos) {
            btnVerTodos.addEventListener('click', function (e) {
                e.preventDefault();
                showAll = !showAll;
                btnVerTodos.textContent = showAll ? 'Ocultar →' : 'Ver todos →';
                renderCatalogo();
            });
        }

        
        const navPresidentes = document.getElementById('nav-presidentes');
        if (navPresidentes) {
            navPresidentes.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.getElementById('presidentes');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        
        const navComparar = document.getElementById('nav-comparar');
        if (navComparar) {
            navComparar.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.getElementById('compare-section');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        
        if (window.location.hash === '#compare-section') {
            history.replaceState(null, '', window.location.pathname);
            setTimeout(function () {
                var target = document.getElementById('compare-section');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }

        loadData().then(function () {
            var comingFromPresidente = sessionStorage.getItem('scrollToPresidentes') === '1';
            var comingFromHash = window.location.hash === '#presidentes';

            if (comingFromPresidente || comingFromHash) {
                sessionStorage.removeItem('scrollToPresidentes');
                history.replaceState(null, '', window.location.pathname);

                window.scrollTo(0, 0);
                
                document.documentElement.style.transition = 'opacity 0.4s ease';
                document.documentElement.style.opacity = '1';

                setTimeout(function () {
                    var target = document.getElementById('presidentes');
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        });

        initSearch();
    });

    

    function initSearch() {
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');
        const dropdown = document.getElementById('suggestions-dropdown');

        if (!input || !btn || !dropdown) return;

        input.addEventListener('input', function () {
            const q = input.value.trim();
            if (q.length < 1) {
                hideSuggestions(dropdown);
                return;
            }
            showSuggestions(q, dropdown, input);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch(input.value.trim());
            }
            if (e.key === 'Escape') {
                hideSuggestions(dropdown);
            }
        });

        btn.addEventListener('click', function () {
            doSearch(input.value.trim());
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('#search-box') && !e.target.closest('#suggestions-dropdown')) {
                hideSuggestions(dropdown);
            }
        });
    }

    function doSearch(q) {
        if (!q) return;
        const matches = findMatches(q, 1);
        if (matches.length > 0) {
            window.location.href = 'presidente.html?id=' + matches[0].id;
        }
    }

    function showSuggestions(q, dropdown, input) {
        const matches = findMatches(q, 8);
        if (matches.length === 0) {
            hideSuggestions(dropdown);
            return;
        }
        dropdown.innerHTML = matches.map(p => {
            const mandato = formatYearRange(p.inicio_mandato, p.final_mandato);
            return '<div class="suggestion-item" data-id="' + escHtml(p.id) + '">' +
                '<img class="suggestion-photo" src="' + escHtml(p.foto || '') + '" alt="" onerror="this.style.display=\'none\'">' +
                '<div class="suggestion-info">' +
                '<span class="suggestion-name">' + escHtml(p.nome) + '</span>' +
                '<span class="suggestion-details">' + escHtml(mandato) + ' &bull; ' + escHtml(Array.isArray(p.partido) ? p.partido[0] : (p.partido || 'Sem partido')) + '</span>' +
                '</div>' +
                '</div>';
        }).join('');
        dropdown.classList.add('active');

        dropdown.querySelectorAll('.suggestion-item').forEach(function (item) {
            item.addEventListener('click', function () {
                window.location.href = 'presidente.html?id=' + item.dataset.id;
            });
        });
    }

    function hideSuggestions(dropdown) {
        if (dropdown) dropdown.classList.remove('active');
    }

    function findMatches(q, limit) {
        const norm = normalizeText(q);
        if (!norm) return [];
        const tokens = norm.split(' ').filter(Boolean);

        const scored = allPresidentes.map(function (p) {
            return { p: p, score: scoreMatch(p._norm, tokens, norm) };
        });

        return scored
            .filter(function (x) { return x.score > 0; })
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, limit)
            .map(function (x) { return x.p; });
    }

    function scoreMatch(fullNorm, tokens, fullQuery) {
        let score = 0;
        if (fullNorm === fullQuery) score += 200;
        else if (fullNorm.startsWith(fullQuery)) score += 120;
        else if (fullNorm.includes(fullQuery)) score += 80;

        tokens.forEach(function (t) {
            if (fullNorm.includes(t)) score += 50;
        });
        return score;
    }

})();
