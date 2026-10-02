(() => {
	"use strict";

	const year = document.getElementById("current-year");
	if (year) {
		year.textContent = new Date().getFullYear();
	}

	const progress = document.getElementById("reading-progress");
	const updateProgress = () => {
		if (!progress) {
			return;
		}
		const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
		const percentage = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
		progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
	};

	window.addEventListener("scroll", updateProgress, { passive: true });
	window.addEventListener("resize", updateProgress);
	updateProgress();

	document.querySelectorAll(".filter-controls").forEach((controls) => {
		const section = controls.closest("section");
		if (!section) {
			return;
		}
		const items = section.querySelectorAll(".filterable");

		controls.addEventListener("click", (event) => {
			const button = event.target.closest("button[data-filter]");
			if (!button || !controls.contains(button)) {
				return;
			}

			const filter = button.dataset.filter;
			controls.querySelectorAll("button[data-filter]").forEach((option) => {
				option.setAttribute("aria-pressed", String(option === button));
			});
			items.forEach((item) => {
				item.hidden = filter !== "all" && item.dataset.category !== filter;
			});
		});
	});

	const navigationLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
	if ("IntersectionObserver" in window) {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}
				navigationLinks.forEach((link) => {
					if (link.hash === `#${entry.target.id}`) {
						link.setAttribute("aria-current", "location");
					} else {
						link.removeAttribute("aria-current");
					}
				});
			});
		}, { rootMargin: "-15% 0px -70% 0px" });

		navigationLinks.forEach((link) => {
			const target = document.querySelector(link.hash);
			if (target) {
				observer.observe(target);
			}
		});
	}
})();
