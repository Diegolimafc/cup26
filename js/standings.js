function createTeamStats(team) {

    return {
        name: team,

        points: 0,
        games: 0,

        wins: 0,
        draws: 0,
        losses: 0,

        goalsFor: 0,
        goalsAgainst: 0,

        goalDiff: 0
    };

}

function calculateStandings() {

    if (!WORLD_CUP_DATA) return;

    const standings = {};

    Object.entries(
        WORLD_CUP_DATA.groups
    ).forEach(([group, teams]) => {

        standings[group] = {};

        teams.forEach(team => {

            standings[group][team] =
                createTeamStats(team);

        });

    });

    const predictions =
        getPredictions();

    WORLD_CUP_DATA.matches.forEach(match => {

        const result =
            predictions[match.id];

        if (!result) return;

        if (
            result.home === "" ||
            result.away === ""
        ) return;

        const homeGoals =
            Number(result.home);

        const awayGoals =
            Number(result.away);

        const home =
            standings[match.group][match.home];

        const away =
            standings[match.group][match.away];

        home.games++;
        away.games++;

        home.goalsFor += homeGoals;
        home.goalsAgainst += awayGoals;

        away.goalsFor += awayGoals;
        away.goalsAgainst += homeGoals;

        if (homeGoals > awayGoals) {

            home.points += 3;
            home.wins++;

            away.losses++;

        }
        else if (awayGoals > homeGoals) {

            away.points += 3;
            away.wins++;

            home.losses++;

        }
        else {

            home.points++;
            away.points++;

            home.draws++;
            away.draws++;

        }

    });

    Object.values(standings)
        .forEach(group => {

            Object.values(group)
                .forEach(team => {

                    team.goalDiff =
                        team.goalsFor -
                        team.goalsAgainst;

                });

        });

    const orderedGroups = getOrderedGroups(standings);

	renderStandings(orderedGroups);

	if (typeof generateKnockout === 'function') {
		generateKnockout(orderedGroups);
	}

	if (typeof updateDashboard === 'function') {
		updateDashboard();
	}
}

function getOrderedGroups(
standings
){

const ordered = {};

Object.entries(
standings
).forEach(([group,teams])=>{

ordered[group] =
Object.values(teams)
.sort((a,b)=>{

if(a.points!==b.points)
return b.points-a.points;

if(a.goalDiff!==b.goalDiff)
return b.goalDiff-a.goalDiff;

return b.goalsFor-a.goalsFor;

});

});

return ordered;

}