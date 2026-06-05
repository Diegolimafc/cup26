function generateStats() {
    const predictions = getPredictions();

    let completedMatches = 0;
    let totalGoals = 0;
    let draws = 0;

    const teamGoals = {};
    let biggestWin = null;

    if (!WORLD_CUP_DATA || !WORLD_CUP_DATA.matches) {
        return {
            completedMatches: 0,
            totalGoals: 0,
            averageGoals: '0.00',
            draws: 0,
            teamGoals: {},
            biggestWin: null,
            bestAttack: '-'
        };
    }

    WORLD_CUP_DATA.matches.forEach(function (match) {
        const result = predictions[String(match.id)];

        if (!result || result.home === '' || result.away === '') return;

        const homeGoals = Number(result.home);
        const awayGoals = Number(result.away);

        completedMatches++;
        totalGoals += homeGoals + awayGoals;

        if (!teamGoals[match.home]) teamGoals[match.home] = 0;
        if (!teamGoals[match.away]) teamGoals[match.away] = 0;

        teamGoals[match.home] += homeGoals;
        teamGoals[match.away] += awayGoals;

        if (homeGoals === awayGoals) draws++;

        const diff = Math.abs(homeGoals - awayGoals);

        if (!biggestWin || diff > biggestWin.diff) {
            biggestWin = {
                home: match.home,
                away: match.away,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                diff: diff
            };
        }
    });

    const bestAttackEntry = Object.entries(teamGoals)
        .sort(function (a, b) {
            return b[1] - a[1];
        })[0];

    return {
        completedMatches: completedMatches,
        totalGoals: totalGoals,
        averageGoals: completedMatches ? (totalGoals / completedMatches).toFixed(2) : '0.00',
        draws: draws,
        teamGoals: teamGoals,
        biggestWin: biggestWin,
        bestAttack: bestAttackEntry ? bestAttackEntry[0] : '-'
    };
}

function renderStats() {
    const container = document.getElementById('statsContainer');

    if (!container) return;

    const stats = generateStats();

    const topAttack = Object.entries(stats.teamGoals)
        .sort(function (a, b) {
            return b[1] - a[1];
        })
        .slice(0, 5);

    let biggestWinText = 'Nenhuma goleada registrada';

    if (stats.biggestWin) {
        biggestWinText =
            stats.biggestWin.home +
            ' ' +
            stats.biggestWin.homeGoals +
            ' x ' +
            stats.biggestWin.awayGoals +
            ' ' +
            stats.biggestWin.away;
    }

    container.innerHTML =
        '<div class="stats-grid">' +

            '<div class="stat-box">' +
                '<span>' + stats.completedMatches + '</span>' +
                '<p>Jogos preenchidos</p>' +
            '</div>' +

            '<div class="stat-box">' +
                '<span>' + stats.totalGoals + '</span>' +
                '<p>Gols marcados</p>' +
            '</div>' +

            '<div class="stat-box">' +
                '<span>' + stats.averageGoals + '</span>' +
                '<p>Média de gols</p>' +
            '</div>' +

            '<div class="stat-box">' +
                '<span>' + stats.draws + '</span>' +
                '<p>Empates</p>' +
            '</div>' +

        '</div>' +

        '<div class="stats-section">' +
            '<h2>Maior goleada</h2>' +
            '<div class="highlight-card">' + biggestWinText + '</div>' +
        '</div>' +

        '<div class="stats-section">' +
            '<h2>Melhores ataques</h2>' +
            '<div class="ranking-list">' +
                topAttack.map(function ([team, goals], index) {
                    return (
                        '<div class="ranking-item">' +
                            '<span>' + (index + 1) + '. ' + getFlag(team) + ' ' + team + '</span>' +
                            '<strong>' + goals + ' gols</strong>' +
                        '</div>'
                    );
                }).join('') +
            '</div>' +
        '</div>';
}