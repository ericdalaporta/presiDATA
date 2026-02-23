class CompareManager {
    constructor() {
        this.allPresidents = [];
        this.dataLoaded    = false;

        
        this.selectA    = document.getElementById('compare-select-a');
        this.selectB    = document.getElementById('compare-select-b');

        this.resultsEl  = document.getElementById('comparison-results');
        this.emptyEl    = document.getElementById('comparison-empty');
        this.identityEl = document.getElementById('cs-identity');
        this.indEl      = document.getElementById('cs-indicators');
        this.profileEl  = document.getElementById('cs-profile');
        this.successEl  = document.getElementById('comparison-successes');
        this.polemicsEl = document.getElementById('comparison-polemics');
        this.verdictEl  = document.getElementById('comparison-verdict');

        
        this._pickerOpen = null; 

        this._init();
    }

    async _init() {
        await this._loadData();
        this._buildPickers();
        this._bindPickerEvents();
        
        this._runComparison();
    }

    async _loadData() {
        if (this.dataLoaded) return;
        try {
            const res  = await fetch('./data/presidentes-db.json');
            const json = await res.json();
            this.allPresidents = json.presidentes || json;
            this.dataLoaded = true;
        } catch (e) {
            console.error('[CompareManager] Erro ao carregar JSON:', e);
        }
    }

    

    _buildPickers() {
        const self  = this;
        
        const presidents = [...this.allPresidents].sort((a, b) => (b.numero || 0) - (a.numero || 0));
        const count = {};
        presidents.forEach(p => { count[p.nome] = (count[p.nome] || 0) + 1; });

        ['a', 'b'].forEach(side => {
            const list = document.getElementById('list-' + side);
            if (!list) return;
            list.innerHTML = presidents.map(p => {
                const y1  = (p.inicio_mandato || '').split('/')[2] || '?';
                const y2  = (p.final_mandato  || '').split('/')[2] || 'Atual';
                const sub = count[p.nome] > 1 ? `${p.nome} \u00b7 ${y1}\u2013${y2}` : y1 + '\u2013' + y2;
                const ini = self._initials(p.nome);
                return `<div class="cs-picker-option" data-id="${p.id}" data-side="${side}" role="option">
                    <div class="cs-opt-photo-wrap">
                        <img class="cs-opt-photo" src="${p.foto || ''}" alt="" loading="lazy"
                             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                        <div class="cs-opt-photo-fallback" style="display:none">${ini}</div>
                    </div>
                    <div class="cs-opt-info">
                        <div class="cs-opt-name">${p.nome}</div>
                        <div class="cs-opt-sub">${sub}</div>
                    </div>
                </div>`;
            }).join('');
        });
    }

    _bindPickerEvents() {
        const self = this;

        ['a', 'b'].forEach(side => {
            const trigger  = document.getElementById('trigger-' + side);
            const dropdown = document.getElementById('dropdown-' + side);
            const search   = document.getElementById('search-' + side);
            const list     = document.getElementById('list-' + side);
            if (!trigger || !dropdown) return;

            
            trigger.addEventListener('click', () => self._togglePicker(side));
            trigger.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self._togglePicker(side); }
                if (e.key === 'Escape') self._closePicker();
            });

            
            search?.addEventListener('input', () => {
                const q = search.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                list?.querySelectorAll('.cs-picker-option').forEach(opt => {
                    const name = (opt.querySelector('.cs-opt-name')?.textContent || '').toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    opt.style.display = name.includes(q) ? '' : 'none';
                });
            });

            
            list?.addEventListener('click', e => {
                const opt = e.target.closest('.cs-picker-option');
                if (!opt || opt.classList.contains('is-disabled')) return;
                const id = opt.dataset.id;
                const p  = self.allPresidents.find(x => x.id === id);
                if (!p) return;
                self._selectPresident(side, p);
                self._closePicker();
                self._runComparison();
            });
        });

        
        document.addEventListener('click', e => {
            if (!e.target.closest('.cs-picker') && !e.target.closest('.cs-picker-dropdown')) {
                self._closePicker();
            }
        });
    }

    _togglePicker(side) {
        if (this._pickerOpen === side) { this._closePicker(); return; }
        this._closePicker();
        this._pickerOpen = side;
        const trigger  = document.getElementById('trigger-'  + side);
        const dropdown = document.getElementById('dropdown-' + side);
        const search   = document.getElementById('search-'   + side);
        if (!trigger || !dropdown) return;
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');

        if (window.innerWidth <= 720) {
            
            dropdown._portalOriginalParent = dropdown.parentNode;
            dropdown._portalNextSibling    = dropdown.nextSibling;
            document.body.appendChild(dropdown);
            const rect = trigger.getBoundingClientRect();
            const maxH = window.innerHeight - rect.bottom - 12;
            Object.assign(dropdown.style, {
                position:  'fixed',
                top:       rect.bottom + 'px',
                left:      rect.left + 'px',
                width:     rect.width + 'px',
                right:     '',
                maxHeight: (maxH > 120 ? maxH : 120) + 'px',
                zIndex:    '99999',
                display:   'flex'
            });
            dropdown.classList.add('is-open');
        } else {
            dropdown.classList.add('is-open');
        }
        setTimeout(() => search?.focus(), 60);
    }

    _closePicker() {
        if (!this._pickerOpen) return;
        const side     = this._pickerOpen;
        const trigger  = document.getElementById('trigger-'  + side);
        const dropdown = document.getElementById('dropdown-' + side);
        const search   = document.getElementById('search-'   + side);
        trigger?.classList.remove('is-open');
        trigger?.setAttribute('aria-expanded', 'false');
        dropdown?.classList.remove('is-open');

        
        if (dropdown && dropdown._portalOriginalParent) {
            const parent  = dropdown._portalOriginalParent;
            const sibling = dropdown._portalNextSibling;
            if (sibling && sibling.parentNode === parent) {
                parent.insertBefore(dropdown, sibling);
            } else {
                parent.appendChild(dropdown);
            }
            dropdown._portalOriginalParent = null;
            dropdown._portalNextSibling    = null;
            
            ['position','top','left','width','right','maxHeight','zIndex','display'].forEach(p => {
                dropdown.style[p] = '';
            });
        }

        if (search) { search.value = ''; }
        
        document.getElementById('list-' + side)?.querySelectorAll('.cs-picker-option')
            .forEach(opt => { opt.style.display = ''; });
        this._pickerOpen = null;
    }

    _selectPresident(side, p) {
        const count = {};
        this.allPresidents.forEach(x => { count[x.nome] = (count[x.nome] || 0) + 1; });
        const y1 = (p.inicio_mandato || '').split('/')[2] || '?';
        const y2 = (p.final_mandato  || '').split('/')[2] || 'Atual';

        
        const photoEl    = document.getElementById('trigger-photo-' + side);
        const fallbackEl = document.getElementById('trigger-fallback-' + side);
        const nameEl     = document.getElementById('trigger-name-' + side);
        const subEl      = document.getElementById('trigger-sub-' + side);

        if (photoEl) {
            photoEl.src = p.foto || '';
            photoEl.style.display = p.foto ? '' : 'none';
            photoEl.onerror = function() {
                this.style.display = 'none';
                if (fallbackEl) fallbackEl.style.display = 'flex';
            };
        }
        if (fallbackEl) {
            fallbackEl.textContent = this._initials(p.nome);
            fallbackEl.style.display = p.foto ? 'none' : 'flex';
        }
        if (nameEl) {
            nameEl.textContent = p.nome;
            nameEl.classList.remove('is-placeholder');
        }
        if (subEl) {
            const party = Array.isArray(p.partido) ? p.partido[0] : (p.partido || '');
            subEl.textContent = party + ' \u00b7 ' + y1 + '\u2013' + y2;
        }

        
        document.getElementById('list-' + side)?.querySelectorAll('.cs-picker-option').forEach(opt => {
            opt.classList.toggle('is-selected', opt.dataset.id === p.id);
        });

        
        const sel = side === 'a' ? this.selectA : this.selectB;
        const otherSel = side === 'a' ? this.selectB : this.selectA;
        if (sel) {
            
            let opt = sel.querySelector(`option[value="${p.id}"]`);
            if (!opt) {
                opt = document.createElement('option');
                opt.value = p.id;
                sel.appendChild(opt);
            }
            sel.value = p.id;
        }

        
        const otherId = (otherSel && otherSel.value) || '';
        const otherSide = side === 'a' ? 'b' : 'a';
        document.getElementById('list-' + otherSide)?.querySelectorAll('.cs-picker-option').forEach(opt => {
            opt.classList.toggle('is-disabled', opt.dataset.id === p.id);
        });
    }

    _runComparison() {
        const idA = this.selectA?.value;
        const idB = this.selectB?.value;
        if (!idA || !idB || idA === idB) {
            this.resultsEl?.classList.add('hidden');
            this.emptyEl?.classList.remove('hidden');
            return;
        }
        const pA = this.allPresidents.find(p => p.id === idA);
        const pB = this.allPresidents.find(p => p.id === idB);
        if (!pA || !pB) return;
        this._renderIdentity(pA, pB);
        this._renderIndicators(pA, pB);
        this._renderProfile(pA, pB);
        this._renderLegacy(this.successEl,  pA.sucessos,  pB.sucessos,  pA, pB);
        this._renderLegacy(this.polemicsEl, pA.polemicas, pB.polemicas, pA, pB);
        this._renderVerdict(pA, pB);
        this.emptyEl?.classList.add('hidden');
        this.resultsEl?.classList.remove('hidden');
    }

    

    _renderIdentity(pA, pB) {
        if (!this.identityEl) return;
        this.identityEl.innerHTML =
            this._idCard(pA, 'cs-id-a') +
            '<div class="cs-id-divider"><span class="cs-id-vs">VS</span></div>' +
            this._idCard(pB, 'cs-id-b');
    }

    _idCard(p, cls) {
        const num   = p.numero ? `${p.numero}\u00ba` : '\u2014';
        const party = Array.isArray(p.partido) ? p.partido[0] : (p.partido || '\u2014');
        const y1    = (p.inicio_mandato || '').split('/')[2] || '?';
        const y2    = (p.final_mandato  || '').split('/')[2] || 'Atual';
        return `<div class="cs-id-card ${cls}">
            <div class="cs-id-photo-col">
                <img src="${p.foto || ''}" alt="${p.nome}" class="cs-id-photo"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="cs-id-photo-fallback" style="display:none">${this._initials(p.nome)}</div>
            </div>
            <div class="cs-id-info">
                <div class="cs-id-num">${num} Presidente</div>
                <div class="cs-id-name">${p.nome}</div>
                <div class="cs-id-meta">${party} \u00b7 ${y1}\u2013${y2}</div>
                <div class="cs-id-duration">${this._calcDuration(p)}</div>
            </div>
        </div>`;
    }

    

    

    _renderIndicators(pA, pB) {
        if (!this.indEl) return;
        const self = this;
        const defs = [
            { key: 'pib_mandato', label: 'PIB (média anual)',       dir: 'high', extr: function(v){ return self._exPct(v); } },
            { key: 'inflacao',    label: 'Infla\u00e7\u00e3o',      dir: 'low',  extr: function(v){ return self._exPct(v); } },
            { key: 'desemprego',  label: 'Desemprego',               dir: 'low',  extr: function(v){ return self._exPctAvg(v); } },
            { key: 'dolar',       label: 'C\u00e2mbio (sa\u00edda)', dir: 'low',  extr: function(v){ return self._exCambio(v); } },
            { key: 'aprovacao',   label: 'Aprova\u00e7\u00e3o', dir: 'high', extr: function(v){ return self._exAprovacao(v); },
              desc: function(v) {
                var r = self._exAprovacaoRange(v);
                if (!r) return null;
                if (r.min === r.max) return null;
                return 'pico: ' + r.max + '% \u2192 mínima: ' + r.min + '%';
              }
            }
        ];
        const nameHeader = `<div class="cs-ind-row cs-ind-header-row">
                <div class="cs-ind-stripe"></div>
                <div class="cs-ind-val cs-ind-a cs-ind-colname">${this._shortName(pA.nome)}</div>
                <div class="cs-ind-val cs-ind-b cs-ind-colname">${this._shortName(pB.nome)}</div>
            </div>`;
        this.indEl.innerHTML = nameHeader + defs.map(function(d) {
            const rawA = pA[d.key] || '';
            const rawB = pB[d.key] || '';
            const numA = d.extr(rawA);
            const numB = d.extr(rawB);
            let winA = false, winB = false;
            if (numA !== null && numB !== null && numA !== numB) {
                winA = d.dir === 'high' ? numA > numB : numA < numB;
                winB = !winA;
            }
            const valA  = numA !== null ? self._fmtInd(numA, d.key) : null;
            const valB  = numB !== null ? self._fmtInd(numB, d.key) : null;
            const descA = d.desc ? d.desc(rawA) : self._indDesc(rawA);
            const descB = d.desc ? d.desc(rawB) : self._indDesc(rawB);
            function cellHtml(val, desc, side, win) {
                const raw    = side === 'a' ? rawA : rawB;
                const isNA   = val === null;
                const numCls = 'cs-ind-num' + (isNA ? ' is-na' : '');
                const showVal = isNA ? self._shortDisplay(raw) : val;
                return `<div class="cs-ind-val cs-ind-${side}${win ? ' cs-ind--winner' : ''}">
                    <span class="${numCls}">${showVal}</span>
                    ${desc && !isNA ? '<span class="cs-ind-desc">' + desc + '</span>' : ''}
                </div>`;
            }
            return `<div class="cs-ind-row">
                ${cellHtml(valA, descA, 'a', winA)}
                <div class="cs-ind-center"><span class="cs-ind-label">${d.label}</span></div>
                ${cellHtml(valB, descB, 'b', winB)}
            </div>`;
        }).join('');
    }

    

    _renderProfile(pA, pB) {
        if (!this.profileEl) return;
        const self = this;
        const fields = [
            { lbl: 'Partido',         fn: function(p){ return self._fmt(p.partido); } },
            { lbl: 'Mandato',         fn: function(p){ return self._mandateRange(p); } },
            { lbl: 'Dura\u00e7\u00e3o',         fn: function(p){ return self._calcDuration(p); } },
            { lbl: 'Vice-presidente', fn: function(p){ return self._fmt(p.vice_presidente, 'Sem vice'); } },
            { lbl: 'Estado natal',    fn: function(p){ return self._fmt(p.estado); } },
            { lbl: 'Profiss\u00e3o',  fn: function(p){ return self._fmt(p.profissao); } },
            { lbl: 'Nascimento',      fn: function(p){ return self._fmt(p.nascimento); } },
            { lbl: 'Falecimento',     fn: function(p){ return self._fmt(p.morte, 'Vivo'); } }
        ];
        let html = `<div class="cs-prof-row cs-prof-header">
            <div class="cs-prof-val cs-prof-a cs-prof-val--name">${this._shortName(pA.nome)}</div>
            <div class="cs-prof-label"></div>
            <div class="cs-prof-val cs-prof-b cs-prof-val--name">${this._shortName(pB.nome)}</div>
        </div>`;
        html += fields.map(function(f) {
            return `<div class="cs-prof-row">
                <div class="cs-prof-val cs-prof-a">${f.fn(pA)}</div>
                <div class="cs-prof-label">${f.lbl}</div>
                <div class="cs-prof-val cs-prof-b">${f.fn(pB)}</div>
            </div>`;
        }).join('');
        this.profileEl.innerHTML = html;
    }

    

    _renderLegacy(el, listA, listB, pA, pB) {
        if (!el) return;
        const self = this;
        const col = function(items, name) {
            let lis;
            if (Array.isArray(items) && items.length) {
                lis = items.map(function(item) {
                    const dash  = item.indexOf(' \u2014 ');
                    const title = dash > -1 ? item.substring(0, dash) : item;
                    const m     = item.match(/(\(\d{4}(?:[\u2013\-]\d{2,4})?\))\s*$/);
                    const yr    = m ? m[1] : null;
                    const yrHtml = yr
                        ? '<span class="cs-leg-year">' + yr + '</span>'
                        : '<span class="cs-leg-year cs-leg-year--none">\u2014</span>';
                    return '<li><span class="cs-leg-title">' + title + '</span>' + yrHtml + '</li>';
                }).join('');
            } else {
                lis = '<li class="cs-leg-empty">Sem registros</li>';
            }
            return '<div class="cs-leg-col"><div class="cs-leg-colname">' + self._shortName(name) + '</div><ul class="cs-leg-list">' + lis + '</ul></div>';
        };
        el.innerHTML = col(listA, pA.nome) + col(listB, pB.nome);
    }

    

    _renderVerdict(pA, pB) {
        if (!this.verdictEl) return;
        const self = this;
        const defs = [
            { key: 'pib_mandato', label: 'PIB (média anual)',       dir: 'high', extr: function(v){ return self._exPct(v); },    fmt: function(v){ return self._fmtInd(v, 'pib_mandato'); } },
            { key: 'inflacao',    label: 'Infla\u00e7\u00e3o',      dir: 'low',  extr: function(v){ return self._exPct(v); },    fmt: function(v){ return self._fmtInd(v, 'inflacao'); } },
            { key: 'desemprego',  label: 'Desemprego',               dir: 'low',  extr: function(v){ return self._exPctAvg(v); }, fmt: function(v){ return self._fmtInd(v, 'desemprego'); } },
            { key: 'dolar',       label: 'C\u00e2mbio (sa\u00edda)', dir: 'low',  extr: function(v){ return self._exCambio(v); }, fmt: function(v){ return self._fmtInd(v, 'dolar'); } },
            { key: 'aprovacao',   label: 'Aprova\u00e7\u00e3o',      dir: 'high', extr: function(v){ return self._exAprovacao(v); }, fmt: function(v){ return self._fmtInd(v, 'aprovacao'); } }
        ];

        let winsA = 0, winsB = 0;
        const nameA = this._shortName(pA.nome);
        const nameB = this._shortName(pB.nome);

        const headerRow = `<div class="cs-verdict-stat-row cs-verdict-stat-header">
            <div class="cs-verdict-stat-metric">Indicador</div>
            <div class="cs-verdict-stat-val">${nameA}</div>
            <div class="cs-verdict-stat-val">${nameB}</div>
            <div class="cs-verdict-stat-winner">Vencedor</div>
        </div>`;

        const statRows = defs.map(function(d) {
            const rawA = pA[d.key] || '';
            const rawB = pB[d.key] || '';
            const numA = d.extr(rawA);
            const numB = d.extr(rawB);

            let winnerHtml;
            if (numA === null || numB === null) {
                winnerHtml = '<div class="cs-verdict-stat-winner cs-verdict-stat-winner--none">Sem dados</div>';
            } else if (numA === numB) {
                winnerHtml = '<div class="cs-verdict-stat-winner">Empate</div>';
            } else {
                const aWins = d.dir === 'high' ? numA > numB : numA < numB;
                if (aWins) winsA++; else winsB++;
                winnerHtml = '<div class="cs-verdict-stat-winner">' + (aWins ? nameA : nameB) + '</div>';
            }

            const dispA = numA !== null ? d.fmt(numA) : (rawA ? '<span style="color:#b8b3a8;font-style:italic;font-size:0.76rem">Sem dado</span>' : '<span style="color:#b8b3a8">\u2014</span>');
            const dispB = numB !== null ? d.fmt(numB) : (rawB ? '<span style="color:#b8b3a8;font-style:italic;font-size:0.76rem">Sem dado</span>' : '<span style="color:#b8b3a8">\u2014</span>');

            return `<div class="cs-verdict-stat-row">
                <div class="cs-verdict-stat-metric">${d.label}</div>
                <div class="cs-verdict-stat-val">${dispA}</div>
                <div class="cs-verdict-stat-val">${dispB}</div>
                ${winnerHtml}
            </div>`;
        }).join('');

        let summaryHtml;
        const total = winsA + winsB;
        if (total === 0) {
            summaryHtml = `<div class="cs-verdict-summary">
                <div class="cs-verdict-summary-label">Veredicto</div>
                <div class="cs-verdict-winner-text">Compara\u00e7\u00e3o n\u00e3o foi poss\u00edvel</div>
                <div class="cs-verdict-score">Nenhum dos dois presidentes possui dados suficientes para compara\u00e7\u00e3o direta.</div>
            </div>`;
        } else if (winsA === winsB) {
            summaryHtml = `<div class="cs-verdict-summary">
                <div class="cs-verdict-summary-label">Veredicto</div>
                <div class="cs-verdict-winner-text">Empate t\u00e9cnico</div>
                <div class="cs-verdict-score">${nameA} e ${nameB} empataram com ${winsA} vit\u00f3ria${winsA !== 1 ? 's' : ''} cada nos indicadores compar\u00e1veis.</div>
            </div>`;
        } else {
            const winner = winsA > winsB ? nameA : nameB;
            const loser  = winsA > winsB ? nameB : nameA;
            const wW = winsA > winsB ? winsA : winsB;
            const wL = winsA > winsB ? winsB : winsA;
            summaryHtml = `<div class="cs-verdict-summary">
                <div class="cs-verdict-summary-label">Veredicto</div>
                <div class="cs-verdict-winner-text">${winner} venceu ${wW}\u00d7${wL}</div>
                <div class="cs-verdict-score">${winner} saiu-se melhor em ${wW} dos ${total} indicadores compar\u00e1veis frente a ${loser}.</div>
            </div>`;
        }

        this.verdictEl.innerHTML = `
            <div class="cs-verdict-header">
                <span class="cs-verdict-eyebrow">An\u00e1lise</span>
                <h2 class="cs-verdict-title">Veredicto dos indicadores</h2>
            </div>
            <div class="cs-verdict-body">
                <div class="cs-verdict-stats">${headerRow}${statRows}</div>
                ${summaryHtml}
                <p class="cs-verdict-caveat">Esta compara\u00e7\u00e3o \u00e9 baseada em dados brutos e n\u00e3o reflete a complexidade do contexto hist\u00f3rico de cada mandato. Indicadores econ\u00f4micos s\u00e3o influenciados por fatores externos \u2014 crises internacionais, heran\u00e7as de governos anteriores, ciclos globais de commodities e conjunturas pol\u00edticas \u2014 que fogem ao controle direto de qualquer presidente. O veredicto \u00e9 uma leitura quantitativa dos n\u00fameros, n\u00e3o um ju\u00edzo hist\u00f3rico definitivo.</p>
            </div>`;
    }

    

    _mandateRange(p) {
        return `${this._fmtDate(p.inicio_mandato)} \u2014 ${this._fmtDate(p.final_mandato)}`;
    }

    _fmtDate(str) {
        if (!str || str === 'Atualidade') return str || 'Atual';
        const months = ['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'];
        const parts = str.split('/');
        if (parts.length !== 3) return str;
        return `${parseInt(parts[0])} ${months[parseInt(parts[1])-1]} ${parts[2]}`;
    }

    _calcDuration(p) {
        const parse = (s) => {
            if (!s) return null;
            if (s === 'Atualidade') return new Date();
            const parts = s.split('/');
            if (parts.length !== 3) return null;
            return new Date(+parts[2], +parts[1]-1, +parts[0]);
        };
        const d1 = parse(p.inicio_mandato);
        const d2 = parse(p.final_mandato) || new Date();
        if (!d1) return '—';
        const days = Math.round((d2 - d1) / 86400000);
        if (days < 30) return `${days} dias`;
        const years = Math.floor(days / 365.25);
        const months = Math.floor((days % 365.25) / 30.5);
        const parts = [];
        if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
        if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
        return parts.join(' e ') || `${days} dias`;
    }

    _shortName(name) {
        if (!name) return '';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length <= 2) return name;
        return `${parts[0]} ${parts[parts.length - 1]}`;
    }

    _initials(name) {
        if (!name) return '?';
        return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    _fmt(val, fallback = '\u2014') {
        if (!val) return fallback;
        if (Array.isArray(val)) return val.length ? val.join(' \u00b7 ') : fallback;
        const s = String(val).trim();
        return s || fallback;
    }

    
    _exPctAvg(raw) {
        if (!raw) return null;
        var nums = [];
        var m;
        
        
        var reAnual = /([+\u2212\-]?\d[\d,.]*)\.?\s*%(?!\s*a\.a\.)[^(]{0,35}\([\w\/]*\d{4}/g;
        while ((m = reAnual.exec(raw)) !== null) {
            nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
        }
        
        if (!nums.length) {
            var reAll = /([+\u2212\-]?\d[\d,.]*)\s*%/g;
            while ((m = reAll.exec(raw)) !== null) {
                nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
            }
        }
        if (!nums.length) return null;
        var sum = nums.reduce(function(a, b){ return a + b; }, 0);
        return Math.round((sum / nums.length) * 10) / 10;
    }

    
    _exPct(raw) {
        return this._exPctAvg(raw);
    }

    
    _exAprovacao(raw) {
        var r = this._exAprovacaoRange(raw);
        if (!r) return null;
        if (r.min === r.max) return r.max;
        return Math.round(((r.max + r.min) / 2) * 10) / 10;
    }

    _exAprovacaoRange(raw) {
        
        if (!raw) return null;
        var re = /([+\u2212\-]?\d[\d,.]*)\.?\s*%(?!\s*a\.a\.)[^(]{0,35}\([\w\/]*\d{4}/g;
        var nums = [];
        var m;
        while ((m = re.exec(raw)) !== null) {
            nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
        }
        if (!nums.length) {
            var reAll = /([+\u2212\-]?\d[\d,.]*)\s*%/g;
            while ((m = reAll.exec(raw)) !== null) {
                nums.push(parseFloat(m[1].replace(',', '.').replace('\u2212', '-')));
            }
        }
        if (!nums.length) return null;
        return { min: Math.min.apply(null, nums), max: Math.max.apply(null, nums), last: nums[nums.length - 1] };
    }

    
    _indDesc(raw) {
        if (!raw) return null;
        const t = raw.trim();
        
        if (!/\d/.test(t) || /^sem\s/i.test(t)) {
            return t.length > 60 ? t.slice(0, 58).trimEnd() + '\u2026' : t;
        }
        
        const dashIdx = t.indexOf(' \u2014 ');
        if (dashIdx !== -1) {
            const after = t.slice(dashIdx + 3).trim();
            return after.length > 70 ? after.slice(0, 68).trimEnd() + '\u2026' : after;
        }
        return null;
    }

    _exCambio(raw) {
        if (!raw) return null;
        const parts = raw.split(' \u2014 ');
        const src   = parts[0] || raw;
        const all   = src.match(/R\$([\d,.]+)/g);
        if (!all) return null;
        return parseFloat(all[all.length - 1].replace('R$', '').replace(',', '.'));
    }

    _fmtInd(val, key) {
        if (val === null || val === undefined) return '\u2014';
        if (key === 'dolar') return 'R$' + val.toFixed(2).replace('.', ',');
        const abs  = Math.abs(val);
        const str  = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1).replace('.', ',');
        const sign = val < 0 ? '\u2212' : (key === 'pib_mandato' && val > 0 ? '+' : '');
        return sign + str + '%';
    }

    _shortDisplay(raw) {
        if (!raw) return '\u2014';
        const t = raw.trim();
        if (/^(sem\s+dado|n[aã]o\s+dispon|n\/d)/i.test(t)) return '\u2014';
        const m = t.match(/^([^\u2014\n]{1,35})/);
        return m ? m[1].trim() : '\u2014';
    }

}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('compare-select-a')) {
        window.compareManager = new CompareManager();
    }
});