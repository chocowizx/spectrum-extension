// Spectrum Research Monitor — App router & auth gate

(function () {
    const authGate = document.getElementById("auth-gate");
    const app = document.getElementById("app");
    const content = document.getElementById("content");
    const signInBtn = document.getElementById("sign-in-btn");
    const signOutBtn = document.getElementById("sign-out-btn");

    // ============================================
    // Auth
    // ============================================

    auth.onAuthStateChanged((user) => {
        if (user && isOwner(user)) {
            authGate.classList.add("hidden");
            app.classList.remove("hidden");
            route();
        } else {
            authGate.classList.remove("hidden");
            app.classList.add("hidden");
            if (user && !isOwner(user)) {
                auth.signOut();
                alert("Access restricted to owner only.");
            }
        }
    });

    signInBtn.addEventListener("click", () => {
        auth.signInWithPopup(provider).catch((err) => {
            console.error("Sign-in error:", err);
            alert("Sign-in failed: " + err.message);
        });
    });

    signOutBtn.addEventListener("click", () => {
        auth.signOut();
    });

    // ============================================
    // Router
    // ============================================

    function route() {
        const hash = window.location.hash || "#/";
        const parts = hash.slice(2).split("/"); // Remove "#/"
        const page = parts[0] || "";
        const param = parts.slice(1).join("/");

        // Update active nav link
        document.querySelectorAll(".nav-link").forEach((link) => {
            const r = link.dataset.route;
            link.classList.toggle("active",
                (r === "dashboard" && page === "") ||
                (r === "papers" && page === "papers") ||
                (r === "papers" && page === "paper") ||
                (r === "digests" && (page === "digests" || page === "digest")) ||
                (r === "upgrades" && page === "upgrades")
            );
        });

        // Render view
        switch (page) {
            case "":
                renderDashboard(content);
                break;
            case "papers":
                renderPapers(content);
                break;
            case "paper":
                renderPaperDetail(content, param);
                break;
            case "digests":
                renderDigests(content);
                break;
            case "digest":
                renderDigestDetail(content, param);
                break;
            case "upgrades":
                renderUpgrades(content);
                break;
            default:
                content.innerHTML = `<div class="empty-state"><p>Page not found</p><a href="#/" style="color:#a5b4fc">Go to Dashboard</a></div>`;
        }
    }

    window.addEventListener("hashchange", route);
})();
