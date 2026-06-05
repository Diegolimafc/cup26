const themeBtn = document.getElementById('themeBtn');

if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dicopa_theme', next);

    showToast('Tema ' + (next === 'dark' ? 'escuro' : 'claro') + ' ativado');
}

function loadTheme() {
    const saved = localStorage.getItem('dicopa_theme');

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(function () {
        toast.classList.remove('show');
    }, 2500);
}

function resetTournament() {
    if (!confirm('Deseja limpar todos os resultados da fase de grupos e do mata-mata?')) {
        return;
    }

    localStorage.removeItem('dicopa2026_predictions');
    localStorage.removeItem('dicopa2026_knockout');

    showToast('Simulação limpa');

    setTimeout(function () {
        location.reload();
    }, 500);
}

function updateDashboard() {
    if (typeof getPredictions !== 'function') return;

    const predictions = getPredictions();

    const completed = Object.values(predictions).filter(function (match) {
        return match.home !== '' && match.away !== '';
    }).length;

    const total = WORLD_CUP_DATA && WORLD_CUP_DATA.matches
        ? WORLD_CUP_DATA.matches.length
        : 0;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const gamesCount = document.getElementById('gamesCount');
    const progressValue = document.getElementById('progressValue');
    const dashboardGoals = document.getElementById('dashboardGoals');
    const avgGoals = document.getElementById('avgGoals');
    const bestAttack = document.getElementById('bestAttack');
    const qualifiedCount = document.getElementById('qualifiedCount');

    if (gamesCount) gamesCount.textContent = completed;
    if (progressValue) progressValue.textContent = percentage + '%';

    if (typeof generateStats === 'function') {
        const stats = generateStats();

        if (dashboardGoals) dashboardGoals.textContent = stats.totalGoals;
        if (avgGoals) avgGoals.textContent = stats.averageGoals;
        if (bestAttack) bestAttack.textContent = stats.bestAttack;
    }

    if (qualifiedCount) {
        qualifiedCount.textContent =
            completed === total && total > 0 ? 32 : 0;
    }
}

function loadSharedData() {
    const params = new URLSearchParams(window.location.search);
    const sim = params.get('sim');

    if (!sim) return;

    try {
        const decoded = JSON.parse(atob(sim));

        if (typeof STORAGE_KEY !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(decoded));
            showToast('Simulação carregada');
        }
    } catch (error) {
        console.error('Erro ao carregar simulação compartilhada', error);
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const target = tab.dataset.tab;

            document.querySelectorAll('.tab').forEach(function (item) {
                item.classList.remove('active');
            });

            document.querySelectorAll('.tab-panel').forEach(function (panel) {
                panel.classList.remove('active');
            });

            tab.classList.add('active');

            const activePanel = document.getElementById('tab-' + target);

            if (activePanel) {
                activePanel.classList.add('active');
            }

            if (target === 'stats' && typeof renderStats === 'function') {
                renderStats();
            }
        });
    });
}

function registerGlobalEvents() {
    const exportBtn = document.getElementById('exportBtn');

    if (exportBtn && typeof exportSimulation === 'function') {
        exportBtn.addEventListener('click', exportSimulation);
    }

    const importBtn = document.getElementById('importBtn');

    if (importBtn) {
        importBtn.addEventListener('click', function () {
            const input = document.getElementById('importFile');

            if (input) {
                input.click();
            }
        });
    }

    const importFile = document.getElementById('importFile');

    if (importFile && typeof importSimulation === 'function') {
        importFile.addEventListener('change', importSimulation);
    }

    const shareBtn = document.getElementById('shareBtn');

    if (shareBtn && typeof shareSimulation === 'function') {
        shareBtn.addEventListener('click', shareSimulation);
    }
	
	const resetTournamentBtn = document.getElementById('resetTournamentBtn');

	if (resetTournamentBtn) {
		resetTournamentBtn.addEventListener('click', resetTournament);
	}
}

async function initializeApp() {
    loadTheme();
    loadSharedData();
    registerGlobalEvents();
    setupTabs();

    if (typeof loadWorldCupData === 'function') {
        await loadWorldCupData();
    }

    updateDashboard();

    if (typeof calculateStandings === 'function') {
        calculateStandings();
    }

    if (typeof renderBracket === 'function') {
        renderBracket();
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
