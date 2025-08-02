const SERVER_URL = "https://discord.com/api/guilds/1391191664004956310/widget.json";

fetch(SERVER_URL)
    .then(res => res.json())
    .then(data => renderDiscord(data))
    .catch(() => renderDiscord(null));

function renderDiscord(data) {
    const container = document.querySelector(".discord");
    if (!data || !data.id) {
        container.innerHTML = "<p>Failed to load Discord server data.</p>";
        return;
    }
    var membersCount = 0;

    const serverName = document.getElementById("server_name");
    const membersCntEl = document.getElementById("members_count");

    serverName.textContent = data.name;

    const memberList = document.createElement("div");
    memberList.className = "discord_members";

    const joinBtn = document.createElement("a");
    joinBtn.textContent = "Join Discord Server";
    joinBtn.target = "_blank";
    joinBtn.href = data.instant_invite;
    joinBtn.className = "button"
    joinBtn.classList.add("hidedesktop");
    joinBtn.style.backgroundColor = "var(--discord-btn)";
    joinBtn.style.color = "var(--discord-btn-text)";

    const knownBots = {
        "reforger bot": true,
        "carl-bot": true
    };

    data.members.forEach(member => {
        const isBot = knownBots[member.username?.toLowerCase()];

        membersCount = membersCount + 1;
        membersCntEl.textContent = membersCount + " members online";

        const memberContainer = document.createElement("div");
        memberContainer.className = "discord_member";

        const info = document.createElement("div");
        info.className = "discord_member_info";

        const avatar = document.createElement("img");
        avatar.src = member.avatar_url;
        avatar.alt = member.username;
        avatar.className = 'discord_avatar';

        const name = document.createElement("span");
        const username = isBot ? member.username + "<span id=isBot>BOT</span>" : member.username;
        name.innerHTML = username;
        name.className = "discord_member_name";

        const activity = document.createElement("div");
        activity.className = "discord_activity";

        const status = document.createElement("span");
        status.className = "discord_status";
        status.textContent = member.status || "offline";

        const game = document.createElement("span");
        game.className = "discord_game";
        game.textContent = member.game?.name || "";

        activity.appendChild(status);
        if (member.game?.name) activity.appendChild(game);

        info.appendChild(avatar);
        info.appendChild(name);

        memberContainer.appendChild(info);
        memberContainer.appendChild(activity);

        memberList.appendChild(memberContainer);
    });

    container.appendChild(memberList);
    container.appendChild(joinBtn);

    container.classList.add("loaded");
}