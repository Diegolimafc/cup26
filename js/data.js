let WORLD_CUP_DATA = null;

const TEAM_FLAGS = {
    "México": "mx",
    "África do Sul": "za",
    "Coreia do Sul": "kr",
    "Czechia": "cz",
    "Canadá": "ca",
    "Bosnia e Herzegovina": "ba",
    "Catar": "qa",
    "Suíça": "ch",
    "Brasil": "br",
    "Marrocos": "ma",
    "Haiti": "ht",
    "Escócia": "gb-sct",
    "Estados Unidos": "us",
    "Paraguai": "py",
    "Austrália": "au",
    "Turquia": "tr",
    "Alemanha": "de",
    "Curaçao": "cw",
    "Costa do Marfim": "ci",
    "Equador": "ec",
    "Holanda": "nl",
    "Japão": "jp",
    "Suécia": "se",
    "Tunísia": "tn",
    "Bélgica": "be",
    "Egito": "eg",
    "Irã": "ir",
    "Nova Zelândia": "nz",
    "Espanha": "es",
    "Cabo Verde": "cv",
    "Arábia Saudita": "sa",
    "Uruguai": "uy",
    "França": "fr",
    "Senegal": "sn",
    "Iraque": "iq",
    "Noruega": "no",
    "Argentina": "ar",
    "Argélia": "dz",
    "Áustria": "at",
    "Jordânia": "jo",
    "Portugal": "pt",
    "RD Congo": "cd",
    "Uzbequistão": "uz",
    "Colômbia": "co",
    "Inglaterra": "gb-eng",
    "Croácia": "hr",
    "Gana": "gh",
    "Panamá": "pa"
};

async function loadWorldCupData() {
    try {
        const response = await fetch('data/worldcup2026.json');

        if (!response.ok) {
            throw new Error('Erro ao carregar worldcup2026.json');
        }

        WORLD_CUP_DATA = await response.json();

        if (!WORLD_CUP_DATA.matches || WORLD_CUP_DATA.matches.length === 0) {
            WORLD_CUP_DATA.matches = generateGroupMatches(WORLD_CUP_DATA.groups);
        }

        populateFilters();
        renderMatches();
        calculateStandings();

    } catch (error) {
        console.error(error);
    }
}

function generateGroupMatches(groups) {
    const matches = [];
    let id = 1;

    Object.entries(groups).forEach(function ([group, teams]) {
        const pairings = [
            [0, 1],
            [2, 3],
            [0, 2],
            [1, 3],
            [0, 3],
            [1, 2]
        ];

        pairings.forEach(function (pair) {
            matches.push({
                id: id++,
                group: group,
                date: 'A definir',
                time: 'A definir',
                home: teams[pair[0]],
                away: teams[pair[1]],
                stadium: 'A definir',
                city: 'A definir'
            });
        });
    });

    return matches;
}

function getFlag(team) {
    const code = TEAM_FLAGS[team];

    if (!code) return '';

    return '<img class="flag" src="https://flagcdn.com/w40/' + code + '.png" alt="' + team + '">';
}

function populateFilters() {
    const groupFilter = document.getElementById('groupFilter');
    const teamFilter = document.getElementById('teamFilter');

    if (!groupFilter || !teamFilter || !WORLD_CUP_DATA) return;

    groupFilter.innerHTML = '<option value="ALL">Todos os grupos</option>';
    teamFilter.innerHTML = '<option value="ALL">Todas as seleções</option>';

    Object.keys(WORLD_CUP_DATA.groups).forEach(function (group) {
        groupFilter.innerHTML += '<option value="' + group + '">Grupo ' + group + '</option>';
    });

    const teams = Object.values(WORLD_CUP_DATA.groups).flat().sort();

    teams.forEach(function (team) {
        teamFilter.innerHTML += '<option value="' + team + '">' + team + '</option>';
    });

    groupFilter.onchange = renderMatches;
    teamFilter.onchange = renderMatches;
}