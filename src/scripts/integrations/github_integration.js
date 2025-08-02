const GITHUB_USER = "RareIridium77";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for cache

const keywords = {
    // WIP
    wip: { label: "WIP", color: "var(--wip-color)" },
    // major
    major: { label: "Major Changes", color: "var(--mjr-color)" },
    // smally
    minor: { label: "Minor Changes", color: "var(--sml-color)" },
    micro: { label: "Micro Changes", color: "var(--sml-color)" },
    typo: { label: "Typo", color: "var(--sml-color)" },
    doc: { label: "Documentation", color: "var(--sml-color)" },
    docs: { label: "Documentation", color: "var(--sml-color)" },
    // fixes
    fix: { label: "Fixed", color: "var(--fix-color)" },
    fixed: { label: "Fixed", color: "var(--fix-color)" },
    bug: { label: "Bug", color: "var(--fix-color)" },
    bugfix: { label: "Bug-Fix", color: "var(--fix-color)" },
    // updates
    upd: { label: "Updated", color: "var(--upd-color)" },
    update: { label: "Updated", color: "var(--upd-color)" },
    updated: { label: "Updated", color: "var(--upd-color)" },
    // improvements
    imp: { label: "Improved", color: "var(--imp-color)" },
    improve: { label: "Improved", color: "var(--imp-color)" },
    improved: { label: "Improved", color: "var(--imp-color)" },
    // added
    add: { label: "Added", color: "var(--add-color)" },
    added: { label: "Added", color: "var(--add-color)" },
    // refactoring
    ref: { label: "Refactored", color: "var(--ref-color)" },
    refactored: { label: "Refactored", color: "var(--ref-color)" },
    refactor: { label: "Refactored", color: "var(--ref-color)" },
    // merge
    merge: { label: "Merged", color: "var(--mrg-color)" },
    // changes
    changed: { label: "Changed", color: "var(--chg-color)" },
    changes: { label: "Changes", color: "var(--chg-color)" },
    // angry
    fuck: { label: "Angry :D", color: "var(--angry-color)" },
    shit: { label: "Angry :D", color: "var(--angry-color)" },
    // optimization
    opt: { label: "Optimized", color: "var(--imp-color)" },
    optimize: { label: "Optimized", color: "var(--imp-color)" },
    optimized: { label: "Optimized", color: "var(--imp-color)" },
    optimizations: { label: "Optimized", color: "var(--imp-color)" },
    optimization: { label: "Optimized", color: "var(--imp-color)" },
    simplified: { label: "Simplified", color: "var(--imp-color)" },
    // removes / deletes
    rm: { label: "Removed", color: "var(--del-color)" },
    remove: { label: "Removed", color: "var(--del-color)" },
    removed: { label: "Removed", color: "var(--del-color)" },
    delete: { label: "Removed", color: "var(--del-color)" },
    deleted: { label: "Removed", color: "var(--del-color)" },
};

function getKeywordInfo(msg) {
    const lowered = msg.toLowerCase();
    const firstLine = lowered.split("\n")[0];

    // Remove everythin except letters
    const words = firstLine
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean); // remove empty

    const found = [];

    for (const word of words) {
        if (keywords[word]) {
            found.push({
                label: keywords[word].label,
                color: keywords[word].color
            });
        }
    }

    const unique = new Map();
    for (const i of found) {
        unique.set(i.label, i);
    }

    return unique.size === 0
        ? [{ label: "Commit", color: "#999" }]
        : Array.from(unique.values());
}

function cleanMessage(raw) {
    const firstLine = raw.split("\n").find(line => line.trim()) || "No message";
    if (/^[a-z+]+:/i.test(firstLine)) {
        return firstLine.replace(/^[^:]+:\s*/i, "");
    }
    return firstLine;
}

function setCache(key, data) {
    localStorage.setItem(key, JSON.stringify({ time: Date.now(), data }));
}

function getCache(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return { data: null, expired: false };

    try {
        const parsed = JSON.parse(cached);
        const expired = Date.now() - parsed.time > CACHE_TTL;
        return { data: parsed.data, expired };
    } catch {
        return { data: null, expired: false };
    }
}

const repoSelect = document.getElementById("repo-select");
const commitList = document.getElementById("commit-list");

function renderCommits(commits, repo) {
    commitList.innerHTML = "";
    commits.slice(0, 10).forEach(commit => {
        const msg = commit.commit.message;
        const sha = commit.sha.substring(0, 7);
        const fullSha = commit.sha;
        const author = commit.commit.author.name;
        const date = new Date(commit.commit.author.date).toLocaleDateString();
        const info = getKeywordInfo(msg);
        const cleanedMsg = cleanMessage(msg);

        const item = document.createElement("li");
        item.style.marginBottom = "14px";

        const labelsHTML = info.map(tag => `
                    <span class="commit-tag" style="color: ${tag.color};">
                        ${tag.label}
                    </span>
                `).join(", ");

        item.innerHTML = `
                ${labelsHTML} – ${cleanedMsg}<br>
                <small style="color: #aaa;">
                    ${author} • ${date} • 
                    <a href="https://github.com/${GITHUB_USER}/${repo}/commit/${fullSha}" 
                    target="_blank" style="color: #888;"><code>${sha}</code></a>
                </small>
            `;
        commitList.appendChild(item);
    });
}

function loadCommits(repo) {
    commitList.innerHTML = "<li>Loading commits...</li>";

    const cacheKey = `commits:${repo}`;
    const cache = getCache(cacheKey);

    if (cache.data) {
        renderCommits(cache.data, repo);
    }

    if (!cache.data || cache.expired) {
        fetch(proxy(`https://api.github.com/repos/${GITHUB_USER}/${repo}/commits`))
            .then(res => res.json())
            .then(commits => {
                renderCommits(commits, repo);
                setCache(cacheKey, commits);
            })
            .catch(() => {
                if (!cache.data) {
                    commitList.innerHTML = `<li style="color: #f88;">Failed to load commits 😓</li>`;
                }
            });
    }
}

function loadRepos() {
    const cacheKey = `repos:${GITHUB_USER}`;
    const cache = getCache(cacheKey);

    if (cache.data) {
        populateRepos(cache.data);
    }

    if (!cache.data || cache.expired) {
        fetch(proxy(`https://api.github.com/users/${GITHUB_USER}/repos`))
            .then(res => res.json())
            .then(repos => {
                populateRepos(repos);
                setCache(cacheKey, repos);
            })
            .catch(err => {
                if (!cache.data) {
                    repoSelect.innerHTML = `<option disabled>Failed to load repos</option>`;
                }
                console.error("Repo list error:", err);
            });
    }
}

function populateRepos(repos) {
    repoSelect.innerHTML = "";
    repos.forEach(repo => {
        const opt = document.createElement("option");
        opt.value = repo.name;
        opt.textContent = repo.name;
        repoSelect.appendChild(opt);
    });

    const defaultRepo = "Reforger-Base";
    if ([...repoSelect.options].some(o => o.value === defaultRepo)) {
        repoSelect.value = defaultRepo;
        loadCommits(defaultRepo);
    }

    repoSelect.addEventListener("change", () => {
        loadCommits(repoSelect.value);
    });
}

loadRepos();