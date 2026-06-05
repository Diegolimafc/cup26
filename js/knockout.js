const BRACKET_STORAGE_KEY = 'dicopa2026_knockout';

const BRACKET = {
    round32: [],
    round16: [],
    quarters: [],
    semis: [],
    final: []
};

function getKnockoutScores() {
    return JSON.parse(
        localStorage.getItem(BRACKET_STORAGE_KEY) || '{}'
    );
}

function saveKnockoutScore(round, index, field, value) {
    const scores = getKnockoutScores();

    if (!scores[round]) {
        scores[round] = {};
    }

    if (!scores[round][index]) {
        scores[round][index] = {
            homeGoals: '',
            awayGoals: ''
        };
    }

    scores[round][index][field] = value;

    localStorage.setItem(
        BRACKET_STORAGE_KEY,
        JSON.stringify(scores)
    );

    applySavedScores();
    propagateWinners();
    renderBracket();
}

function getWinner(match) {
    if (
        match.homeGoals === '' ||
        match.awayGoals === ''
    ) {
        return null;
    }

    const home = Number(match.homeGoals);
    const away = Number(match.awayGoals);

    if (home > away) return match.home;
    if (away > home) return match.away;

    return null;
}

function getBestThirds(groups) {
    const thirds = [];

    Object.values(groups).forEach(function (group) {
        if (group[2]) {
            thirds.push(group[2]);
        }
    });

    return thirds.sort(function (a, b) {
        if (a.points !== b.points) return b.points - a.points;
        if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
    }).slice(0, 8);
}

function isGroupStageComplete() {
    if (!WORLD_CUP_DATA || !WORLD_CUP_DATA.matches) return false;

    const predictions = getPredictions();

    return WORLD_CUP_DATA.matches.every(function (match) {
        const result = predictions[String(match.id)];

        return result && result.home !== '' && result.away !== '';
    });
}

function generateKnockout(groups) {
    BRACKET.round32 = [];
    BRACKET.round16 = [];
    BRACKET.quarters = [];
    BRACKET.semis = [];
    BRACKET.final = [];

    if (!isGroupStageComplete()) {
        renderKnockout(null);
        renderBracket();
        renderChampion(null);
        return;
    }

    const firsts = [];
    const seconds = [];

    Object.entries(groups).forEach(function ([groupName, group]) {
        if (group[0]) {
            firsts.push({
                ...group[0],
                source: '1º Grupo ' + groupName
            });
        }

        if (group[1]) {
            seconds.push({
                ...group[1],
                source: '2º Grupo ' + groupName
            });
        }
    });

    const bestThirds = getBestThirds(groups).map(function (team) {
        return {
            ...team,
            source: 'Melhor 3º'
        };
    });

    const qualified = firsts.concat(seconds, bestThirds);

    for (let i = 0; i < qualified.length; i += 2) {
        if (!qualified[i] || !qualified[i + 1]) continue;

        BRACKET.round32.push({
            home: qualified[i].name,
            away: qualified[i + 1].name,
            homeGoals: '',
            awayGoals: ''
        });
    }

    applySavedScores();
    propagateWinners();

    renderKnockout({
        firsts: firsts,
        seconds: seconds,
        bestThirds: bestThirds
    });

    renderBracket();
}

function applySavedScores() {
    const scores = getKnockoutScores();

    Object.keys(BRACKET).forEach(function (round) {
        BRACKET[round].forEach(function (match, index) {
            if (
                scores[round] &&
                scores[round][index]
            ) {
                match.homeGoals =
                    scores[round][index].homeGoals ?? '';

                match.awayGoals =
                    scores[round][index].awayGoals ?? '';
            }
        });
    });
}

function propagateWinners() {
    buildNextRound('round32', 'round16');
    buildNextRound('round16', 'quarters');
    buildNextRound('quarters', 'semis');
    buildNextRound('semis', 'final');

    const finalMatch = BRACKET.final[0];

    if (finalMatch) {
        renderChampion(getWinner(finalMatch));
    } else {
        renderChampion(null);
    }
}

function buildNextRound(currentRound, nextRound) {
    const winners = [];

    BRACKET[currentRound].forEach(function (match) {
        const winner = getWinner(match);

        if (winner) {
            winners.push(winner);
        }
    });

    BRACKET[nextRound] = [];

    for (let i = 0; i < winners.length; i += 2) {
        if (!winners[i] || !winners[i + 1]) continue;

        BRACKET[nextRound].push({
            home: winners[i],
            away: winners[i + 1],
            homeGoals: '',
            awayGoals: ''
        });
    }

    applySavedScores();
}

/* =========================
   CLASSIFICADOS
========================= */

function renderKnockout(data) {
    const container = document.getElementById('knockoutContainer');

    if (!container) return;

    container.innerHTML = '';

    if (!data) {
        container.innerHTML =
            '<div class="knockout-card">' +
                '<div class="knockout-header">Mata-Mata</div>' +
                '<div class="knockout-body">' +
                    'Complete todos os jogos da fase de grupos para liberar os classificados.' +
                '</div>' +
            '</div>';
        return;
    }

    const card = document.createElement('div');
    card.className = 'knockout-card collapsible-card collapsed';

    let html = '';

    html += '<button class="collapse-header" onclick="toggleCollapse(this)">';
    html += '<span>Classificados para o Mata-Mata</span>';
    html += '<span>⌄</span>';
    html += '</button>';

    html += '<div class="collapse-content">';
    html += '<div class="qualified-groups">';

    html += renderQualifiedBlock('1º colocados', data.firsts);
    html += renderQualifiedBlock('2º colocados', data.seconds);
    html += renderQualifiedBlock('Melhores terceiros', data.bestThirds);

    html += '</div>';
    html += '</div>';

    card.innerHTML = html;
    container.appendChild(card);
}

function toggleCollapse(button) {
    const card = button.closest('.collapsible-card');

    if (card) {
        card.classList.toggle('collapsed');
    }
}

function renderQualifiedBlock(title, teams) {
    let html = '';

    html += '<div class="qualified-block">';
    html += '<h3>' + title + '</h3>';

    teams.forEach(function (team) {
        html +=
            '<div class="qualified-team">' +
                '<span>' + getFlag(team.name) + ' ' + team.name + '</span>' +
                '<small>' + team.source + '</small>' +
            '</div>';
    });

    html += '</div>';

    return html;
}

/* =========================
   CHAVEAMENTO VISUAL
========================= */

function renderBracket() {
    const container = document.getElementById('fullBracket');

    if (!container) return;

    container.innerHTML =
        '<div class="bracket-actions">' +
            '<button onclick="resetKnockout()">Limpar Mata-Mata</button>' +
        '</div>' +

        '<div class="worldcup-bracket">' +

            '<div class="bracket-half bracket-left">' +
                renderBracketColumn('round32', 0, 8, 'R32', 'c1') +
                renderBracketColumn('round16', 0, 4, 'Oitavas', 'c2') +
                renderBracketColumn('quarters', 0, 2, 'Quartas', 'c3') +
                renderBracketColumn('semis', 0, 1, 'Semi', 'c4') +
            '</div>' +

            '<div class="bracket-final-center">' +
                '<img src="assets/Logo_copa_2026.png" class="final-trophy-img" alt="Troféu Copa do Mundo">' +
                '<div class="bracket-column-title">Final</div>' +
                renderBracketFinal() +
            '</div>' +

            '<div class="bracket-half bracket-right">' +
                renderBracketColumn('semis', 1, 2, 'Semi', 'c4') +
                renderBracketColumn('quarters', 2, 4, 'Quartas', 'c3') +
                renderBracketColumn('round16', 4, 8, 'Oitavas', 'c2') +
                renderBracketColumn('round32', 8, 16, 'R32', 'c1') +
            '</div>' +

        '</div>';
}

function renderBracketColumn(round, start, end, title, columnClass) {
    const matches = BRACKET[round].slice(start, end);
    const expected = end - start;

    let html = '';

    html += '<div class="bracket-column ' + columnClass + '">';
    html += '<div class="bracket-column-title">' + title + '</div>';
    html += '<div class="bracket-column-matches">';

    for (let i = 0; i < expected; i++) {
        const match = matches[i];
        const realIndex = start + i;

        if (match) {
            html += renderBracketMatch(round, match, realIndex);
        } else {
            html += renderEmptyMatch();
        }
    }

    html += '</div>';
    html += '</div>';

    return html;
}

function renderBracketMatch(round, match, index) {
    const winner = getWinner(match);

    const homeClass = winner === match.home ? 'winner' : '';
    const awayClass = winner === match.away ? 'winner' : '';

    return (
        '<div class="bracket-node">' +

            '<div class="bracket-node-team ' + homeClass + '" title="' + match.home + '">' +
                '<span>' + getFlag(match.home) + '</span>' +
                '<input type="number" min="0" max="20" value="' + match.homeGoals + '" ' +
                'onchange="saveKnockoutScore(&quot;' + round + '&quot;,' + index + ',&quot;homeGoals&quot;,this.value)">' +
            '</div>' +

            '<div class="bracket-node-team ' + awayClass + '" title="' + match.away + '">' +
                '<span>' + getFlag(match.away) + '</span>' +
                '<input type="number" min="0" max="20" value="' + match.awayGoals + '" ' +
                'onchange="saveKnockoutScore(&quot;' + round + '&quot;,' + index + ',&quot;awayGoals&quot;,this.value)">' +
            '</div>' +

        '</div>'
    );
}

function renderEmptyMatch() {
    return (
        '<div class="bracket-node empty">' +
            '<div class="bracket-node-team">' +
                '<span class="placeholder-flag"></span>' +
                '<input disabled>' +
            '</div>' +
            '<div class="bracket-node-team">' +
                '<span class="placeholder-flag"></span>' +
                '<input disabled>' +
            '</div>' +
        '</div>'
    );
}

function renderBracketFinal() {
    const match = BRACKET.final[0];

    if (!match) {
        return renderEmptyMatch();
    }

    return renderBracketMatch('final', match, 0);
}

/* =========================
   CAMPEÃO
========================= */

function renderChampion(name) {
    const container = document.getElementById('championContainer');

    if (!container) return;

    if (!name) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML =
`
    <div class="champion-modal-overlay">
        <div class="champion-modal">

            <button
                class="champion-close"
                onclick="closeChampionModal()"
            >
                ×
            </button>

            <img
                src="assets/Logo_copa_2026.png"
                class="champion-trophy-img"
                alt="Troféu Copa do Mundo"
            >

            <div>
                Campeão
            </div>

            <div class="champion-name">
                ${getFlag(name)}
                ${name}
            </div>

        </div>
    </div>
    `;
}

function closeChampionModal() {
    const container = document.getElementById('championContainer');

    if (container) {
        container.innerHTML = '';
    }
}

function resetKnockout() {
    if (!confirm('Deseja limpar todos os resultados do Mata-Mata?')) return;

    localStorage.removeItem(BRACKET_STORAGE_KEY);

    BRACKET.round16 = [];
    BRACKET.quarters = [];
    BRACKET.semis = [];
    BRACKET.final = [];

    BRACKET.round32.forEach(function(match) {
        match.homeGoals = '';
        match.awayGoals = '';
    });

    renderChampion(null);
    renderBracket();

    showToast('Resultados do Mata-Mata limpos');
}