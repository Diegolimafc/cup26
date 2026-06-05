function formatDateBR(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString + 'T00:00:00');

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function renderMatches() {
    if (!WORLD_CUP_DATA || !WORLD_CUP_DATA.matches) return;

    const container = document.getElementById('gamesContainer');
    if (!container) return;

    const groupFilter = document.getElementById('groupFilter');
    const teamFilter = document.getElementById('teamFilter');

    const selectedGroup = groupFilter ? groupFilter.value : 'ALL';
    const selectedTeam = teamFilter ? teamFilter.value : 'ALL';

    container.innerHTML = '';
    container.className = 'games-by-day';
    renderNextMatches(container);

    const filteredMatches = WORLD_CUP_DATA.matches
        .filter(function (match) {
            if (selectedGroup !== 'ALL' && match.group !== selectedGroup) return false;

            if (
                selectedTeam !== 'ALL' &&
                match.home !== selectedTeam &&
                match.away !== selectedTeam
            ) return false;

            return true;
        })
        .sort(function (a, b) {
            return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
        });

    const matchesByDate = {};

    filteredMatches.forEach(function (match) {
        if (!matchesByDate[match.date]) {
            matchesByDate[match.date] = [];
        }

        matchesByDate[match.date].push(match);
    });

    Object.entries(matchesByDate).forEach(function ([date, matches]) {
        const daySection = document.createElement('section');
        daySection.className = 'match-day-section';

        let html = '';

        html += '<div class="match-day-header">';
        html += '<h2>' + formatDateBR(date) + '</h2>';
        html += '<span>' + matches.length + ' jogos</span>';
        html += '</div>';

        html += '<div class="games-grid">';

        matches.forEach(function (match) {
            const saved = typeof getPrediction === 'function'
                ? getPrediction(match.id)
                : { home: '', away: '' };

            html +=
                '<div class="match-card" data-match-id="' + match.id + '">' +

                    '<div class="match-header">' +
                        '<span>Grupo ' + match.group + '</span>' +
                        '<span>' + formatTimeBR(match.time) + '</span>' +
                    '</div>' +

                    '<div class="match-body">' +

                        '<div class="teams">' +
                            '<div class="team">' + getFlag(match.home) + '<span>' + formatTeamName(match.home) + '</span></div>' +

                            '<div class="score-inputs">' +
                                '<input class="score-input home-score" type="number" min="0" max="20" value="' + saved.home + '">' +
                                '<span>×</span>' +
                                '<input class="score-input away-score" type="number" min="0" max="20" value="' + saved.away + '">' +
                            '</div>' +

                            '<div class="team">' + getFlag(match.away) + '<span>' + formatTeamName(match.away) + '</span></div>' +
                        '</div>' +

                        '<div class="match-stadium">📍 ' + match.stadium + ' · ' + match.city + '</div>' +

                    '</div>' +

                '</div>';
        });

        html += '</div>';

        daySection.innerHTML = html;
        container.appendChild(daySection);

        daySection.querySelectorAll('.match-card').forEach(function (card) {
            const matchId = card.getAttribute('data-match-id');

            const homeInput = card.querySelector('.home-score');
            const awayInput = card.querySelector('.away-score');

            if (homeInput && awayInput) {
                homeInput.addEventListener('change', function () {
                    savePrediction(matchId, homeInput.value, awayInput.value);
                });

                awayInput.addEventListener('change', function () {
                    savePrediction(matchId, homeInput.value, awayInput.value);
                });
            }
        });
    });
}

function renderStandings(data) {
    const section = document.getElementById('standingsContainer');
    if (!section) return;

    section.innerHTML = '';

    let bestThirds = [];

    if (typeof getBestThirds === 'function') {
        bestThirds = getBestThirds(data);
    }

    Object.entries(data).forEach(function ([group, teams]) {
        const ordered = Array.isArray(teams) ? teams : Object.values(teams);

        const card = document.createElement('div');
        card.className = 'group-card';

        const rows = ordered.map(function (team, index) {
            let rowClass = '';

            const isThirdQualified = bestThirds.some(function (third) {
                return third.name === team.name;
            });

            if (index < 2) {
                rowClass = 'qualified';
            } else if (isThirdQualified) {
                rowClass = 'best-third';
            } else {
                rowClass = 'eliminated';
            }

            return (
                '<tr class="' + rowClass + '">' +
                    '<td>' + (index + 1) + '. ' + getFlag(team.name) + ' ' + team.name + '</td>' +
                    '<td>' + team.points + '</td>' +
                    '<td>' + team.games + '</td>' +
                    '<td>' + team.wins + '</td>' +
                    '<td>' + team.draws + '</td>' +
                    '<td>' + team.losses + '</td>' +
                    '<td>' + team.goalDiff + '</td>' +
                    '<td>' + team.goalsFor + '</td>' +
                '</tr>'
            );
        }).join('');

        card.innerHTML =
            '<h3>Grupo ' + group + '</h3>' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>Seleção</th>' +
                        '<th>P</th>' +
                        '<th>J</th>' +
                        '<th>V</th>' +
                        '<th>E</th>' +
                        '<th>D</th>' +
                        '<th>SG</th>' +
                        '<th>GP</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>';

        section.appendChild(card);
    });
}

function formatTimeBR(timeString) {
    if (!timeString) return '';

    const parts = timeString.split(':');
    let hours = Number(parts[0]);
    const minutes = parts[1];

    hours = (hours + 1) % 24;

    return String(hours).padStart(2, '0') + ':' + minutes;
}

function renderNextMatches(container) {
    if (!WORLD_CUP_DATA || !WORLD_CUP_DATA.matches) return;

    const predictions = getPredictions();

    const nextMatches = WORLD_CUP_DATA.matches
        .filter(function (match) {
            const result = predictions[String(match.id)];

            return !result || result.home === '' || result.away === '';
        })
        .sort(function (a, b) {
            return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
        })
        .slice(0, 5);

    if (nextMatches.length === 0) return;

    const section = document.createElement('section');
    section.className = 'next-matches';

    let html = '<h2>Próximos jogos</h2>';

    nextMatches.forEach(function (match) {
        html +=
            '<div class="next-match-item">' +
                '<span>' + formatDateBR(match.date) + ' · ' + formatTimeBR(match.time) + '</span>' +
                '<strong>' + getFlag(match.home) + ' ' + match.home + ' x ' + getFlag(match.away) + ' ' + match.away + '</strong>' +
            '</div>';
    });

    section.innerHTML = html;
    container.appendChild(section);
}

function formatTeamName(teamName) {
    if (teamName === 'Bosnia e Herzegovina') {
        return 'Bosnia e H.';
    }

    return teamName;
}