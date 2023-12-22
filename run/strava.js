async function getLatestActivityData() {
    const tokenResponse = await fetch("https://www.strava.com/oauth/token?client_id=107067&client_secret=27a443ffc4c042a377ecb6e9fe4945e1da25337c&refresh_token=365fa27c4fbb2329e1f65fdc6638ed3f238fcf76&grant_type=refresh_token", {method: 'POST'});
    const tokens = await tokenResponse.json();
    const activitiesResponse = await fetch('https://www.strava.com/api/v3/athletes/30066650/activities?access_token=' + tokens.access_token);
    const activitiesJson = await activitiesResponse.json()

    let latestActivity = activitiesJson[0];
    let i = 0;
    while (latestActivity.sport_type != "Run") {
        latestActivity = activitiesJson[++i];
    }

    const date = new Date(latestActivity.start_date); // date of latest activity
    date.setHours(0, 0, 0, 0); // zero out time to calculate streak
    const today = new Date(); // today's date
    const startDate = new Date('2021-12-01T00:00:00.000-06:00'); // date of start of streak
    const streakLength = Math.ceil((date - startDate) / 86400000) + 1;
    const runToday = date.getYear() == today.getYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate();

    const data = {
        name: latestActivity.name,
        distance: Math.round(latestActivity.distance * 0.00062137 * 100) / 100,
        time: Math.round(latestActivity.moving_time / 60),
        streakLength: streakLength,
        runToday: runToday
    }

    return data;
     
}

async function updateHTML() {
    const latestActivityData = await getLatestActivityData();
    console.log(latestActivityData);
    // const streakLength = 0;
    document.getElementById("streakCount").innerHTML = `Current run streak: ${latestActivityData.streakLength}`;
    if (latestActivityData.runToday) {
        document.getElementById("runToday").innerHTML = "I have completed my run today!";
    } else {
        document.getElementById("runToday").innerHTML = "I have yet to complete my run today! Hopefully I don't forget!";
    }
    document.getElementById("latestRun").innerHTML = `Latest run: "${latestActivityData.name}", ${latestActivityData.distance} miles, ${latestActivityData.time} minutes`;

}

updateHTML();