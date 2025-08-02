const HOST = "147.185.221.16"
const PORT = "52346"

document.getElementById("copy-connect").addEventListener("click", () => {
    const command = `connect ${HOST}:${PORT}`;

    navigator.clipboard.writeText(command).then(() => {
        const msg = document.getElementById("copied-msg");
        msg.style.display = "block";
        msg.style.transition = "opacity 0.3s ease";

        setTimeout(() => {
            const go = confirm("Command copied!\nDo you want to try launching Garry's Mod now?");
            if (go) {
                window.location.href = "steam://run/4000";
            }
        }, 2000)
    }).catch(err => {
        alert("Failed to copy connect command 😢");
        console.error(err);
    });
});