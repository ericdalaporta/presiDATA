let allPresidents = [];
let dataLoaded = false;

const compareBtn = document.querySelector('.compare-btn');
const modal = document.getElementById('compare-modal');
const closeBtn = document.querySelector('.compare-close');
const selectA = document.getElementById('compare-select-a');
const selectB = document.getElementById('compare-select-b');
const resultsWrapper = document.getElementById('comparison-results');
const summaryContainer = document.getElementById('comparison-summary');
const groupsContainer = document.getElementById('comparison-groups');
const successesContainer = document.getElementById('comparison-successes');
const polemicsContainer = document.getElementById('comparison-polemics');
const emptyState = document.getElementById('comparison-empty');

const fieldGroups = [
    {
        title: 'Perfil do Mandato',
        fields: [
            {
                label: 'Mandato',
                getValue: (president) => getMandatePeriod(president)
            },
            {
                label: 'Partido',
                getValue: (president) => formatValue(president.partido)
            },
            {
                label: 'Vice-presidente',
                getValue: (president) => formatValue(president.vice_presidente, 'Sem vice registrado')
            },
            {
                label: 'Número na linha sucessória',
                getValue: (president) => president.numero ? `#${president.numero}` : '--'
            }
        ]
    },
    {
        title: 'Indicadores Econômicos',
        fields: [
            { label: 'PIB', getValue: (president) => formatValue(president.pib_mandato) },
            { label: 'Inflação', getValue: (president) => formatValue(president.inflacao) },
            { label: 'Desemprego', getValue: (president) => formatValue(president.desemprego) },
            { label: 'Dólar', getValue: (president) => formatValue(president.dolar) },
            { label: 'Aprovação', getValue: (president) => formatValue(president.aprovacao) }
        ]
    },
    {
        title: 'Perfil Pessoal',
        fields: [
            { label: 'Nascimento', getValue: (president) => formatValue(president.nascimento) },
            { label: 'Falecimento', getValue: (president) => formatValue(president.morte, 'Vivo') },
            { label: 'Estado', getValue: (president) => formatValue(president.estado) },
            { label: 'Profissão', getValue: (president) => formatValue(president.profissao) }
        ]
    }
];

compareBtn?.addEventListener('click', async () => {
    openModal();
    await ensurePresidents();
    populateSelects(document.body.dataset.currentPresidentId || null);
    runComparison(true);
});

closeBtn?.addEventListener('click', () => {
    closeModal();
});

modal?.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
    }
});

selectA?.addEventListener('change', () => {
    handleSelectChange();
    runComparison();
});

selectB?.addEventListener('change', () => {
    handleSelectChange();
    runComparison();
});

function openModal() {
    modal?.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    modal?.classList.remove('active');
    document.body.classList.remove('modal-open');
}

async function ensurePresidents() {
    if (dataLoaded) {
        return;
    }

    try {
        const response = await fetch('data/presidentes-db.json');
        const data = await response.json();
        allPresidents = data.presidentes || data;
        dataLoaded = true;
    } catch (error) {
        console.error('Erro ao carregar dados dos presidentes:', error);
    }
}

function populateSelects(currentId) {
    if (!selectA || !selectB) return;

    const optionsMarkup = allPresidents
        .map((president) => `<option value="${president.id}">${president.nome}</option>`)
        .join('');

    selectA.innerHTML = `<option value="">Selecione um presidente</option>${optionsMarkup}`;
    selectB.innerHTML = `<option value="">Selecione um presidente</option>${optionsMarkup}`;

    if (currentId && selectA.querySelector(`option[value="${currentId}"]`)) {
        selectA.value = currentId;
    }

    if (!selectA.value && allPresidents.length) {
        selectA.value = allPresidents[0].id;
    }

    const candidateB = allPresidents.find((president) => president.id !== selectA.value);
    if (candidateB) {
        selectB.value = candidateB.id;
    }

    handleSelectChange();
}

function handleSelectChange() {
    if (!selectA || !selectB) {
        return;
    }

    const idA = selectA.value;
    const idB = selectB.value;

    if (!idA || !idB) {
        return;
    }

    if (idA === idB) {
        const activeElement = document.activeElement;
        const replacement = allPresidents.find((president) => president.id !== idA);

        if (!replacement) {
            return;
        }

        if (activeElement === selectA && selectB) {
            selectB.value = replacement.id;
        } else if (activeElement === selectB && selectA) {
            selectA.value = replacement.id;
        } else if (selectB) {
            selectB.value = replacement.id;
        }
    }
}

function runComparison(auto = false) {
    if (!selectA || !selectB || !resultsWrapper || !summaryContainer || !groupsContainer) {
        return;
    }

    const idA = selectA.value;
    const idB = selectB.value;

    if (!idA || !idB || idA === idB) {
        resultsWrapper.classList.add('hidden');
        emptyState?.classList.remove('hidden');
        return;
    }

    const presidentA = allPresidents.find((item) => item.id === idA);
    const presidentB = allPresidents.find((item) => item.id === idB);

    if (!presidentA || !presidentB) {
        return;
    }

    renderSummary(presidentA, presidentB);
    renderGroups(presidentA, presidentB);
    renderLegacies(presidentA, presidentB);

    emptyState?.classList.add('hidden');
    resultsWrapper.classList.remove('hidden');
}

function renderSummary(presidentA, presidentB) {
    if (!summaryContainer) return;

    const durationA = getDurationData(presidentA);
    const durationB = getDurationData(presidentB);
    summaryContainer.innerHTML = buildDurationSummaryCard(
        shortenName(presidentA.nome),
        shortenName(presidentB.nome),
        durationA.text,
        durationB.text
    );
}

function buildSummaryCard({ iconClass, title, metricA, metricB, delta }) {
    const deltaClass = delta.className || 'neutral';
    const cardClass = deltaClass === 'neutral' ? 'summary-card accent-neutral' : 'summary-card';

    return `
        <div class="${cardClass}">
            <div class="summary-header">
                <span class="summary-icon" aria-hidden="true"><i class="${iconClass}"></i></span>
                <div class="summary-title">${title}</div>
            </div>
            <div class="summary-values">
                <div class="summary-metric">
                    <span class="metric-label">${metricA.label}</span>
                    <span class="metric-value">${metricA.value}</span>
                </div>
                <div class="summary-metric">
                    <span class="metric-label">${metricB.label}</span>
                    <span class="metric-value">${metricB.value}</span>
                </div>
            </div>
            <div class="summary-delta ${deltaClass}">${delta.text}</div>
        </div>
    `;
}

function buildDurationSummaryCard(labelA, labelB, valueA, valueB) {
    return `
        <div class="duration-compare-card">
            <div class="duration-column">
                <span class="duration-label">${labelA}</span>
                <span class="duration-value">${valueA}</span>
            </div>
            <div class="duration-vs" aria-hidden="true">VS</div>
            <div class="duration-column">
                <span class="duration-label">${labelB}</span>
                <span class="duration-value">${valueB}</span>
            </div>
        </div>
    `;
}

function renderGroups(presidentA, presidentB) {
    if (!groupsContainer) return;

    const groupMarkup = fieldGroups
        .map((group) => createGroupMarkup(group, presidentA, presidentB))
        .join('');

    groupsContainer.innerHTML = groupMarkup;
}

function createGroupMarkup(group, presidentA, presidentB) {
    const headerRow = `
        <div class="comparison-field-row comparison-field-header">
            <div class="field-label" aria-hidden="true"></div>
            <div class="field-value">${shortenName(presidentA.nome)}</div>
            <div class="field-value">${shortenName(presidentB.nome)}</div>
        </div>
    `;

    const rows = group.fields
        .map((field) => {
            const valueA = safeFieldValue(field, presidentA);
            const valueB = safeFieldValue(field, presidentB);

            return `
                <div class="comparison-field-row">
                    <div class="field-label">${field.label}</div>
                    <div class="field-value">${valueA}</div>
                    <div class="field-value">${valueB}</div>
                </div>
            `;
        })
        .join('');

    return `
        <div class="comparison-group">
            <div class="comparison-group-title">
                <h3>${group.title}</h3>
            </div>
            <div class="comparison-group-body">
                ${headerRow}
                ${rows}
            </div>
        </div>
    `;
}

function safeFieldValue(field, president) {
    if (typeof field.getValue === 'function') {
        return field.getValue(president);
    }

    if (field.key) {
        return formatValue(president[field.key], field.fallback);
    }

    return '--';
}

function renderLegacies(presidentA, presidentB) {
    renderListColumn(successesContainer, presidentA, presidentB, presidentA.sucessos, presidentB.sucessos, 'Nenhum sucesso registrado');
    renderListColumn(polemicsContainer, presidentA, presidentB, presidentA.polemicas, presidentB.polemicas, 'Nenhuma polêmica registrada');
}

function renderListColumn(container, presidentA, presidentB, listA, listB, emptyMessage) {
    if (!container) return;

    const columnMarkup = [
        { name: presidentA.nome, items: listA },
        { name: presidentB.nome, items: listB }
    ]
        .map(({ name, items }) => {
            const hasItems = Array.isArray(items) && items.length;
            const entries = hasItems
                ? items.map((item) => `<li>${item}</li>`).join('')
                : `<li class="empty-item">${emptyMessage}</li>`;

            return `
                <div class="list-column">
                    <h4>${shortenName(name)}</h4>
                    <ul>${entries}</ul>
                </div>
            `;
        })
        .join('');

    container.innerHTML = columnMarkup;
}

function buildDelta(valueA, valueB, nameA, nameB, higherIsBetter = true, neutralMessage = 'Valores equivalentes') {
    if (valueA == null || valueB == null) {
        return { text: 'Dados incompletos', className: 'neutral' };
    }

    if (valueA === valueB) {
        return { text: neutralMessage, className: 'neutral' };
    }

    const diff = valueA - valueB;
    const absoluteDiff = Math.abs(diff);
    const advantageName = diff > 0 ? nameA : nameB;
    const className = diff > 0
        ? (higherIsBetter ? 'positive' : 'negative')
        : (higherIsBetter ? 'negative' : 'positive');

    const formattedDiff = typeof valueA === 'number'
        ? (absoluteDiff >= 365
            ? `${(absoluteDiff / 365).toFixed(1)} anos`
            : `${absoluteDiff} ${absoluteDiff === 1 ? 'ponto' : 'pontos'}`)
        : `${absoluteDiff}`;

    return {
        text: `${formattedDiff} a mais para ${shortenName(advantageName)}`,
        className
    };
}

function getMandatePeriod(president) {
    const inicio = president.inicio_mandato || '';
    const fim = president.final_mandato || '';

    if (!inicio && !fim) {
        return '--';
    }

    if (!fim) {
        return inicio;
    }

    return `${inicio} até ${fim}`;
}

function getDurationData(president) {
    const startDate = parseDate(president.inicio_mandato);
    const endDate = parseDate(president.final_mandato);

    if (!startDate) {
        return { text: 'Dados indisponíveis', days: null };
    }

    const effectiveEnd = endDate || new Date();
    const diffMs = effectiveEnd.getTime() - startDate.getTime();

    if (Number.isNaN(diffMs) || diffMs < 0) {
        return { text: 'Dados indisponíveis', days: null };
    }

    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const text = formatDuration(days, endDate ? null : president.final_mandato);

    return { text, days };
}

function formatDuration(days, endLabel) {
    if (days == null) {
        return 'Sem dados';
    }

    if (days < 30) {
        return `${days} dias`;
    }

    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    const parts = [];

    if (years) {
        parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    }

    if (months) {
        parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
    }

    if (!parts.length) {
        parts.push(`${days} dias`);
    }

    if (endLabel && typeof endLabel === 'string' && endLabel.toLowerCase().includes('atual')) {
        parts.push('(em andamento)');
    }

    return parts.join(' ');
}

function parseDate(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const parts = value.split('/');
    if (parts.length !== 3) {
        return null;
    }

    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);

    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
        return null;
    }

    return new Date(year, month, day);
}

function formatValue(value, fallback = '--') {
    if (value == null) {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : fallback;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : fallback;
    }

    if (typeof value === 'number') {
        return value.toString();
    }

    return String(value);
}

function shortenName(name) {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length <= 2) {
        return name;
    }
    return `${parts[0]} ${parts[parts.length - 1]}`;
}


