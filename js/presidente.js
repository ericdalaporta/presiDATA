class PresidentePage {
    constructor() {
        this.presidentes = [];
        this.currentPresident = null;
        this.heroTimeline = null;
        this.nameTimeline = null;
        this.scrollTriggers = [];
        this.init();
    }

    async init() {
        await this.loadPresidentes();
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        this.loadPresidentFromURL();
        this.setupHeaderScroll();
    }

    async loadPresidentes() {
        try {
            const response = await fetch('./data/presidentes-db.json');
            const data = await response.json();
            this.presidentes = data.presidentes;
        } catch (error) {
            console.error('Erro ao carregar dados dos presidentes:', error);
            this.showError('Erro ao carregar dados dos presidentes');
        }
    }

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

    displayPresident(presidente) {
        document.title = `${presidente.nome} - PresiDATA`;

        if (presidente.id) {
            document.body.dataset.currentPresidentId = presidente.id;
        } else {
            delete document.body.dataset.currentPresidentId;
        }
        document.body.dataset.currentPresidentName = presidente.nome || '';

        
        const photoEl = document.getElementById('president-photo');
        if (photoEl) { photoEl.src = presidente.foto; photoEl.alt = `Foto de ${presidente.nome}`; }

        
        const nameElement = document.getElementById('president-name-display');
        if (nameElement) nameElement.textContent = presidente.nome;

        
        const orderEl = document.getElementById('president-order-display');
        if (orderEl && presidente.numero) {
            orderEl.textContent = `${presidente.numero}º Presidente`;
        }

        
        const mandateEl = document.getElementById('president-mandate-display');
        if (mandateEl) {
            mandateEl.textContent = `${this.formatDateShort(presidente.inicio_mandato)} — ${this.formatDateShort(presidente.final_mandato)}`;
        }

        
        const partyDisplay = Array.isArray(presidente.partido)
            ? presidente.partido.join(' · ')
            : (presidente.partido || 'Sem filiação partidária');
        const partyEl = document.getElementById('president-party-display');
        if (partyEl) partyEl.textContent = partyDisplay;

        
        const vice = Array.isArray(presidente.vice_presidente) && presidente.vice_presidente.length > 0
            ? presidente.vice_presidente.join(', ')
            : 'Sem vice registrado';
        const viceEl = document.getElementById('vice-display');
        if (viceEl) viceEl.textContent = vice;

        
        const periodoEl = document.getElementById('hero-periodo-display');
        if (periodoEl) periodoEl.textContent = this.calcDuracao(presidente.inicio_mandato, presidente.final_mandato);

        
        const regimeEl = document.getElementById('hero-regime-display');
        if (regimeEl) regimeEl.textContent = this.derivarRegime(presidente.numero);

        
        const signatureWrapper = document.getElementById('president-signature-wrapper');
        const signatureImg = document.getElementById('president-signature');
        const signatureNone = document.getElementById('president-signature-none');
        const hasSignature = presidente.assinatura && presidente.assinatura !== 'N/A' && presidente.assinatura.trim() !== '';
        if (signatureWrapper && signatureImg) {
            if (hasSignature) {
                signatureImg.src = presidente.assinatura;
                signatureImg.alt = `Assinatura de ${presidente.nome}`;
                signatureImg.style.display = '';
                if (signatureNone) signatureNone.style.display = 'none';
                signatureWrapper.classList.remove('is-hidden');
            } else {
                signatureImg.removeAttribute('src');
                signatureImg.style.display = 'none';
                if (signatureNone) signatureNone.style.display = '';
                signatureWrapper.classList.remove('is-hidden');
            }
        }

        
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '--'; };
        setEl('nascimento-display', presidente.nascimento);
        setEl('morte-display', (presidente.morte && presidente.morte !== '') ? presidente.morte : 'Vivo');
        const profissao = Array.isArray(presidente.profissao)
            ? presidente.profissao.join(' · ')
            : (presidente.profissao || '--');
        setEl('profissao-display', profissao);

        
        setEl('nascimento-mobile', presidente.nascimento);
        setEl('morte-mobile', (presidente.morte && presidente.morte !== '') ? presidente.morte : 'Vivo');
        setEl('profissao-mobile', profissao);
        setEl('estado-display', presidente.estado);

        
        this.setIndicator('pib-display', presidente.pib_mandato);
        this.setIndicator('inflacao-display', presidente.inflacao);
        this.setIndicator('desemprego-display', presidente.desemprego);
        this.setIndicator('dolar-display', presidente.dolar);
        this.setIndicator('aprovacao-display', presidente.aprovacao);

        
        this.buildLegacyTable(presidente);
        this.buildTimeline(presidente);

        this.animateHeroName(presidente.nome);
        this.runPageAnimations();
        this.setupScrollAnimations();
    }

    buildLegacyTable(presidente) {
        const tbody = document.getElementById('legacy-table-body');
        if (!tbody) return;

        const sucessos = Array.isArray(presidente.sucessos) ? presidente.sucessos : [];
        const polemicas = Array.isArray(presidente.polemicas) ? presidente.polemicas : [];

        const countS = document.getElementById('sucessos-count');
        const countP = document.getElementById('polemicas-count');
        if (countS) countS.textContent = sucessos.length > 0 ? `${sucessos.length} registros` : '';
        if (countP) countP.textContent = polemicas.length > 0 ? `${polemicas.length} registros` : '';

        if (sucessos.length === 0 && polemicas.length === 0) {
            tbody.innerHTML = '<div class="legacy-row"><div class="legacy-cell legacy-cell--success legacy-cell--empty">Sem dados</div><div class="legacy-cell legacy-cell--empty">Sem dados</div></div>';
            this.buildLegacyTabs([], [], true);
            return;
        }

        const parseItem = (text) => {
            if (!text) return { title: '--', desc: '', year: '' };
            
            const yearMatch = text.match(/\((\d{4}(?:[–\-]\d{2,4})?)\)\s*$/);
            const year = yearMatch ? yearMatch[1] : '-';
            const dashIdx = text.indexOf(' — ');
            if (dashIdx > -1) {
                return { title: text.substring(0, dashIdx).trim(), desc: text.substring(dashIdx + 3).trim(), year };
            }
            return { title: text, desc: '', year };
        };

        const sortYear = (item) => {
            if (!item.year || item.year === '-') return 9999;
            return parseInt(item.year, 10);
        };

        const parsedS = sucessos.map(parseItem).sort((a, b) => sortYear(a) - sortYear(b));
        const parsedP = polemicas.map(parseItem).sort((a, b) => sortYear(a) - sortYear(b));
        const maxRows = Math.max(parsedS.length, parsedP.length);

        let html = '';
        for (let i = 0; i < maxRows; i++) {
            const s = parsedS[i] || null;
            const p = parsedP[i] || null;

            const sHtml = s
                ? `<div class="legacy-cell legacy-cell--success">
                    <div class="legacy-cell-title">${s.title}<span class="legacy-cell-year">${s.year}</span></div>
                    ${s.desc ? `<div class="legacy-cell-desc">${s.desc}</div>` : ''}
                  </div>`
                : `<div class="legacy-cell legacy-cell--success legacy-cell--empty"></div>`;

            const pHtml = p
                ? `<div class="legacy-cell">
                    <div class="legacy-cell-title">${p.title}<span class="legacy-cell-year">${p.year}</span></div>
                    ${p.desc ? `<div class="legacy-cell-desc">${p.desc}</div>` : ''}
                  </div>`
                : `<div class="legacy-cell legacy-cell--empty"></div>`;

            html += `<div class="legacy-row">${sHtml}${pHtml}</div>`;
        }
        tbody.innerHTML = html;

        
        this.buildLegacyTabs(parsedS, parsedP, false);
    }

    buildLegacyTabs(parsedS, parsedP, empty) {
        const container = document.getElementById('legacy-tabs');
        if (!container) return;

        const makeItems = (list) => {
            if (list.length === 0) return '<div class="legacy-tab-empty">Sem registros</div>';
            return list.map(item => `
                <div class="legacy-tab-item">
                    <div class="legacy-tab-item-header">
                        <span class="legacy-tab-item-title">${item.title}</span>
                        <span class="legacy-tab-item-year">${item.year}</span>
                    </div>
                    ${item.desc ? `<div class="legacy-tab-item-desc">${item.desc}</div>` : ''}
                </div>`).join('');
        };

        container.innerHTML = `
            <div class="legacy-tabs-nav">
                <button class="legacy-tab-btn is-active" data-tab="realizacoes">
                    <span class="legacy-tab-bar legacy-tab-bar--success"></span>
                    Realizações
                    <span class="legacy-tab-count">${parsedS.length}</span>
                </button>
                <button class="legacy-tab-btn tab-polemic" data-tab="controversias">
                    <span class="legacy-tab-bar legacy-tab-bar--polemic"></span>
                    Controvérsias
                    <span class="legacy-tab-count">${parsedP.length}</span>
                </button>
            </div>
            <div class="legacy-tab-panel is-active" id="tab-panel-realizacoes">
                ${makeItems(parsedS)}
            </div>
            <div class="legacy-tab-panel" id="tab-panel-controversias">
                ${makeItems(parsedP)}
            </div>`;

        
        container.querySelectorAll('.legacy-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.legacy-tab-btn').forEach(b => b.classList.remove('is-active'));
                container.querySelectorAll('.legacy-tab-panel').forEach(p => p.classList.remove('is-active'));
                btn.classList.add('is-active');
                const panel = container.querySelector(`#tab-panel-${btn.dataset.tab}`);
                if (panel) panel.classList.add('is-active');
            });
        });
    }

    buildTimeline(presidente) {
        const container = document.getElementById('timeline-table');
        const section = document.getElementById('timeline-section');
        if (!container) return;

        const items = Array.isArray(presidente.linha_do_tempo) ? presidente.linha_do_tempo : [];
        if (items.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        container.innerHTML = items.map(item =>
            `<div class="timeline-row">
                <div class="timeline-year">${item.ano}</div>
                <div class="timeline-event">${item.evento}</div>
            </div>`
        ).join('');

        if (section) {
            section.style.display = '';
            section.style.opacity = '1';
            section.style.transform = 'none';
        }
    }

    setupHeaderScroll() {
        const header = document.querySelector('.page-header');
        if (!header) {
            return;
        }

        const updateHeaderState = () => {
            const shouldCondense = window.scrollY > 24;
            header.classList.toggle('is-condensed', shouldCondense);
        };

        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });

        
        const navTimeline = document.getElementById('nav-timeline');
        if (navTimeline) {
            navTimeline.addEventListener('click', (e) => {
                const section = document.getElementById('timeline-section');
                if (section && section.style.display !== 'none') {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        
        const navPresidentes = document.getElementById('nav-presidentes');
        if (navPresidentes) {
            navPresidentes.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.setItem('scrollToPresidentes', '1');
                const wrapper = document.querySelector('.page-wrapper');
                if (wrapper) {
                    wrapper.style.transition = 'opacity 0.38s ease';
                    wrapper.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 380);
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
    }

    showError(message) {
        const container = document.querySelector('.content-wrapper');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h1>Erro</h1>
                        <p>${message}</p>
                        <a href="index.html" class="btn-back">Voltar ao Início</a>
                    </div>
                </div>
            `;
        }
    }

    animateHeroName(name) {
            const nameElement = document.getElementById('president-name-display');
            if (!nameElement) return;

            const safeName = name || '';
            nameElement.setAttribute('aria-label', safeName);
            nameElement.innerHTML = '';

            
            const words = safeName.split(' ');
            const fragment = document.createDocumentFragment();

            words.forEach((word, wi) => {
                const isMuted = words.length > 2 && wi > 0 && wi < words.length - 1;
                const wordSpan = document.createElement('span');
                wordSpan.className = isMuted ? 'hero-name-word hero-name-word--muted' : 'hero-name-word';
                wordSpan.style.display = 'block';

                [...word].forEach((char) => {
                    const span = document.createElement('span');
                    span.className = 'hero-name-letter';
                    span.textContent = char;
                    wordSpan.appendChild(span);
                });
                fragment.appendChild(wordSpan);
            });
            nameElement.appendChild(fragment);

            if (typeof gsap === 'undefined') {
                return;
            }

            if (this.nameTimeline) {
                this.nameTimeline.kill();
            }

            const letters = nameElement.querySelectorAll('.hero-name-letter');
            this.nameTimeline = gsap.timeline({ delay: 0.15 });
            this.nameTimeline.fromTo(letters, {
                y: 60,
                opacity: 0,
                rotateX: 90
            }, {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 0.8,
                ease: 'back.out(1.8)',
                stagger: 0.045
            });
    }

    runPageAnimations() {
        if (typeof gsap === 'undefined') {
            return;
        }

        if (this.heroTimeline) {
            this.heroTimeline.kill();
        }

        this.heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        this.heroTimeline.fromTo('.photo-frame', {
            opacity: 0,
            scale: 1.04
        }, {
            opacity: 1,
            scale: 1,
            duration: 0.9
        }, 0);

        this.heroTimeline.fromTo(['.hero-top-meta', '.hero-dates-row', '.hero-bio-grid'], {
            y: 16,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1
        }, 0.25);

        this.heroTimeline.fromTo('.hero-sidebar-bio', {
            y: 12,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.45
        }, 0.5);

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    setupScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            return;
        }

        this.scrollTriggers.forEach(trigger => trigger.kill());
        this.scrollTriggers = [];

        const register = (trigger) => {
            if (trigger) {
                this.scrollTriggers.push(trigger);
            }
        };

        const createReveal = (selector, options = {}) => {
            const { start = 'top 85%', delayStep = 0 } = options;
            gsap.utils.toArray(selector).forEach((element, index) => {
                element.classList.add('reveal-on-scroll');
                element.classList.remove('is-visible');
                if (delayStep) {
                    element.style.setProperty('--reveal-delay', `${index * delayStep}s`);
                } else {
                    element.style.removeProperty('--reveal-delay');
                }

                const trigger = ScrollTrigger.create({
                    trigger: element,
                    start,
                    once: true,
                    onEnter: () => {
                        element.classList.add('is-visible');
                    }
                });

                register(trigger);
            });
        };

        createReveal('.section-header', { start: 'top 92%' });
        createReveal('.indicator-card', { start: 'top 88%', delayStep: 0.06 });
        createReveal('.legacy-row', { start: 'top 92%', delayStep: 0.05 });
        createReveal('.timeline-row', { start: 'top 94%', delayStep: 0.03 });
        createReveal('.bio-row', { start: 'top 92%', delayStep: 0.04 });

        const footer = document.querySelector('.page-footer');
        if (footer) {
            footer.classList.add('reveal-on-scroll');
            footer.classList.remove('is-visible');
            const trigger = ScrollTrigger.create({
                trigger: footer,
                start: 'top 96%',
                once: true,
                onEnter: () => footer.classList.add('is-visible')
            });
            register(trigger);
        }
    }

    
    formatDateShort(str) {
        if (!str || str === 'Atualidade') return str || 'Atualidade';
        const parts = str.split('/');
        if (parts.length !== 3) return str;
        const months = ['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'];
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        return `${parseInt(parts[0], 10)} ${month} ${parts[2]}`;
    }

    
    setIndicator(id, rawText) {
        const valueEl = document.getElementById(id);
        if (!valueEl) return;
        if (!rawText) { valueEl.innerHTML = '<span>--</span>'; return; }

        const text = String(rawText).trim();
        const naPattern = /^(sem\s+dado|n[ãa]o?\s+dispon[ií]vel|sem\s+s[ée]ries|n\/d)/i;
        if (naPattern.test(text)) {
            valueEl.innerHTML = `<span class="indicator-value-na">—</span><div class="indicator-desc">${text}</div>`;
            return;
        }

        if (id.includes('dolar')) {
            const beforeDash = text.split(/\s*—\s*/)[0];
            const values = beforeDash.match(/R\$([\d,.]+)/g) || text.match(/R\$([\d,.]+)/g);
            if (values && values.length) {
                const firstVal = values[0];
                const lastVal = values[values.length - 1];
                const context = this._extractDashDesc(text);
                const desc = `início: ${firstVal}/US$1 → saída: ${lastVal}/US$1${context ? ' — ' + context : ''}`;
                valueEl.innerHTML = `${lastVal}/US$1<div class="indicator-desc">${desc}</div>`;
                return;
            }
        }

        if (id.includes('aprovacao')) {
            const range = this._exAprovacaoRange(text);
            const avg = this._exAprovacao(text);
            if (range && avg !== null) {
                const peak = this._fmtPct(range.max, false);
                const minima = this._fmtPct(range.min, false);
                const core = this._extractDashDesc(text);
                const desc = (range.min !== range.max)
                    ? `pico: ${peak} → mínima: ${minima}${core ? ' — ' + core : ''}`
                    : (core || 'sem variação relevante no período');
                valueEl.innerHTML = `${this._fmtPct(avg, false)}<span class="indicator-unit">média</span><div class="indicator-desc">${desc}</div>`;
                return;
            }
        }

        if (id.includes('pib') || id.includes('inflacao') || id.includes('desemprego')) {
            const avg = this._exPctAvg(text);
            if (avg !== null) {
                const showPlus = id.includes('pib');
                const desc = this._extractDashDesc(text);
                valueEl.innerHTML = `${this._fmtPct(avg, showPlus)}<span class="indicator-unit">média</span>${desc ? `<div class="indicator-desc">${desc}</div>` : ''}`;
                return;
            }
        }

        valueEl.innerHTML = `<span class="indicator-value-na">—</span><div class="indicator-desc">${text}</div>`;
    }

    _extractDashDesc(rawText) {
        const idx = rawText.indexOf(' — ');
        if (idx === -1) return '';
        return rawText.slice(idx + 3).trim();
    }

    _exPctAvg(raw) {
        if (!raw) return null;
        const nums = [];
        const reAnual = /([+\u2212\-]?\d[\d,.]*)\.?\s*%(?!\s*a\.a\.)[^(]{0,35}\([\w\/]*\d{4}/g;
        let m;
        while ((m = reAnual.exec(raw)) !== null) {
            nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
        }
        if (!nums.length) {
            const reAll = /([+\u2212\-]?\d[\d,.]*)\s*%/g;
            while ((m = reAll.exec(raw)) !== null) {
                nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
            }
        }
        if (!nums.length) return null;
        const sum = nums.reduce((a, b) => a + b, 0);
        return Math.round((sum / nums.length) * 10) / 10;
    }

    _exAprovacaoRange(raw) {
        if (!raw) return null;
        const nums = [];
        const re = /([+\u2212\-]?\d[\d,.]*)\.?\s*%(?!\s*a\.a\.)[^(]{0,35}\([\w\/]*\d{4}/g;
        let m;
        while ((m = re.exec(raw)) !== null) {
            nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
        }
        if (!nums.length) {
            const reAll = /([+\u2212\-]?\d[\d,.]*)\s*%/g;
            while ((m = reAll.exec(raw)) !== null) {
                nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
            }
        }
        if (!nums.length) return null;
        return { min: Math.min.apply(null, nums), max: Math.max.apply(null, nums) };
    }

    _exAprovacao(raw) {
        const r = this._exAprovacaoRange(raw);
        if (!r) return null;
        if (r.min === r.max) return r.max;
        return Math.round(((r.max + r.min) / 2) * 10) / 10;
    }

    _fmtPct(val, showPlus = false) {
        if (val === null || val === undefined) return '—';
        const abs = Math.abs(val);
        const num = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1).replace('.', ',');
        const sign = val < 0 ? '−' : (showPlus && val > 0 ? '+' : '');
        return `${sign}${num}%`;
    }

    
    calcDuracao(inicio, fim) {
        if (!inicio) return '--';
        const parseDate = (str) => {
            if (!str || str === 'Atualidade') return new Date();
            const parts = str.split('/');
            if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
            
            if (/^\d{4}$/.test(str)) return new Date(+str, 0, 1);
            return new Date(str);
        };
        const d1 = parseDate(inicio);
        const d2 = parseDate(fim);
        if (isNaN(d1) || isNaN(d2)) return '--';
        const diffMs = Math.abs(d2 - d1);
        const anos = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        if (anos === 0) return 'menos de 1 ano';
        return anos === 1 ? '1 ano' : `${anos} anos`;
    }

    
    derivarRegime(numero) {
        if (!numero) return '--';
        if (numero <= 3) return 'República Velha';
        if (numero === 4) return 'República Velha · Café com Leite';
        if (numero <= 12) return 'República Velha';
        if (numero === 13) return 'Revolução de 1930';
        if (numero <= 16) return 'Era Vargas';
        if (numero <= 18) return 'República Nova';
        if (numero <= 20) return 'Democracia Populista';
        if (numero <= 25) return 'Regime Militar';
        if (numero === 26) return 'Nova República';
        if (numero <= 40) return 'Nova República · Democracia';
        return '--';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PresidentePage();
});
