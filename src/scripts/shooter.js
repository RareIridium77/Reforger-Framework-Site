(() => {
    let canShoot = true;
    const reloadTime = 8000; // 8 секунд
    const removeTime = 60000; // 60 секунд
    const volume = 0.7;

    const shotAudio = new Audio("./src/assets/shot.mp3");
    shotAudio.volume = volume;

    const reloadAudio = new Audio("./src/assets/reload-tank.mp3");
    reloadAudio.volume = volume;

    function shootAt(pos, target) {
        try {
            shotAudio.currentTime = 0;
            shotAudio.play();
        } catch (err) { }

        // дырка
        const hole = document.createElement("div");
        hole.className = "bullet-hole";

        const randomSize = (0.8 + Math.random() * 1.4) * 25;
        hole.style.width = randomSize + "px";
        hole.style.height = randomSize + "px";

        const rotation = Math.random() * 360;
        hole.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        hole.style.left = pos.x + "px";
        hole.style.top = pos.y + "px";

        document.body.appendChild(hole);

        setTimeout(() => {
            hole.style.opacity = "0";
            setTimeout(() => hole.remove(), 500);
        }, removeTime);

        if (target && target !== document.body && !hole.contains(target)) {
            target.classList.add("shake-on-hit");
            target.addEventListener("animationend", () => {
                target.classList.remove("shake-on-hit");
            }, { once: true });

            if (!target.dataset.hp) {
                target.dataset.hp = "2";
            }

            let hp = parseInt(target.dataset.hp, 10);
            hp -= 1;
            target.dataset.hp = hp;

            if (hp <= 0) {
                target.classList.add("dead");
                target.style.transition = "opacity 0.5s ease";
                target.style.opacity = "0";
                setTimeout(() => target.remove(), 600);
            }
        }
    }

    document.addEventListener("click", (e) => {
        if (!canShoot) return;

        canShoot = false;

        // определяем, куда попали
        const target = document.elementFromPoint(e.clientX, e.clientY);

        shootAt({ x: e.pageX, y: e.pageY }, target);

        try {
            reloadAudio.currentTime = 0;
            reloadAudio.play();
        } catch (err) { }

        setTimeout(() => {
            canShoot = true;
        }, reloadTime);
    });
})();
