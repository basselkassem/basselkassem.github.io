(() => {
	"use strict";

	const year = document.getElementById("current-year");
	if (year) {
		year.textContent = new Date().getFullYear();
	}

	const initializePortfolioMap = () => {
		const map = document.querySelector("[data-portfolio-map]");
		const canvas = map?.querySelector(".lrn-map3-canvas");
		if (!map || !(canvas instanceof HTMLCanvasElement)) {
			return;
		}

		let groups;
		try {
			groups = JSON.parse(map.dataset.groups);
		} catch (error) {
			console.error("Unable to read portfolio network groups.", error);
			return;
		}

		const context = canvas.getContext("2d");
		if (!context || !Array.isArray(groups) || groups.length === 0) {
			console.error("Portfolio network requires a 2D canvas context and groups.");
			return;
		}

		const figure = map.closest(".hero-illustration");
		const title = map.querySelector("[data-map-title]");
		const copy = map.querySelector("[data-map-copy]");
		const link = map.querySelector("[data-map-link]");
		const groupButtons = [...figure.querySelectorAll("[data-map-group]")];
		const groupLayout = [
			{ x: 0.25, y: 0.29 },
			{ x: 0.75, y: 0.29 },
			{ x: 0.25, y: 0.76},
			{ x: 0.75, y: 0.76 }
		];
		const groupNodes = groups.map((group, index) => ({
			...group,
			...groupLayout[index % groupLayout.length],
			baseDepth: (index - (groups.length - 1) / 2) * 0.16,
			nodes: []
		}));
		let nodes = [];
		let activeNode = null;
		let pinned = false;
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		let canvasIsVisible = true;
		let animationFrame = 0;
		let lastFrame = 0;
		const animationStart = performance.now();

		const textOf = (element, selector) => element.querySelector(selector)?.textContent.trim() ?? "";
		const makeNode = (groupId, section, label, summary, element) => ({
			groupId,
			section,
			label,
			summary,
			element,
			x: 0,
			y: 0,
			motion: {
				phaseX: Math.random() * Math.PI * 2,
				phaseY: Math.random() * Math.PI * 2,
				speedX: 0.5 + Math.random() * 0.1,
				speedY: 0.5 + Math.random() * 0.1,
				amplitudeX: 20 + Math.random() * 2.5,
				amplitudeY: 30 + Math.random() * 2,
				phaseZ: Math.random() * Math.PI * 2,
				speedZ: 0.25 + Math.random() * 0.12
			}
		});

		const experienceNodes = [...document.querySelectorAll(".timeline-entry")].map((entry) => makeNode(
			"experience",
			"experience",
			textOf(entry, ".entry-heading h3"),
			`${textOf(entry, ".entry-company").replace(/\s*·.*$/, "")} · ${textOf(entry, ".timeline-date")}. ${textOf(entry, ".details-body li")}`,
			entry
		));
		const skillNodes = [...document.querySelectorAll(".skill-catalog .filterable")].map((skill) => makeNode(
			"skills",
			"skills",
			skill.textContent.trim(),
			`${skill.textContent.trim()} is part of my technical toolkit.`,
			skill
		));
		const projectNodes = [...document.querySelectorAll(".project-card")].map((project) => makeNode(
			"projects",
			"projects",
			textOf(project, "h3"),
			textOf(project, "p:last-child"),
			project
		));
		const educationNodes = [...document.querySelectorAll(".education-card")].map((education) => makeNode(
			"education",
			"education",
			textOf(education, "h3"),
			`${textOf(education, ".project-meta")}. ${textOf(education, "p:not(.project-meta)")}`,
			education
		));
		const certificationNodes = [...document.querySelectorAll(".cert-list li")].map((certification) => makeNode(
			"education",
			"certifications",
			textOf(certification, "span:first-child"),
			`${textOf(certification, "span:last-child")}. Professional certification.`,
			certification
		));
		nodes = [...experienceNodes, ...skillNodes, ...projectNodes, ...educationNodes, ...certificationNodes];

		groupNodes.forEach((group) => {
			group.nodes = nodes.filter((node) => node.groupId === group.id);
		});

		const setActiveNode = (node, isPinned = false) => {
			activeNode = node;
			pinned = isPinned;
			groupButtons.forEach((button) => {
				button.setAttribute("aria-pressed", String(Boolean(node && button.dataset.mapGroup === node.groupId && isPinned)));
			});

			if (node) {
				const group = groupNodes.find((item) => item.id === node.groupId);
				title.textContent = node.label;
				copy.textContent = node.summary;
				link.href = `#${node.section}`;
				link.textContent = `EXPLORE ${group.title} `;
				const arrow = document.createElement("span");
				arrow.setAttribute("aria-hidden", "true");
				arrow.textContent = "↗";
				link.append(arrow);
				link.hidden = false;
			} else {
				title.textContent = "PORTFOLIO NETWORK";
				copy.textContent = `${nodes.length} connected nodes · skills, experience, projects, education & certificates`;
				link.hidden = true;
			}
			drawNetwork();
		};

		const layoutNodes = (width, height) => {
			const marginX = Math.min(14, width * 0.06);
			const marginY = 12;
			const clusterWidth = (width - marginX * 2) * 0.35;
			const clusterHeight = (height - marginY * 2) * 0.29;

			groupNodes.forEach((group) => {
				const count = group.nodes.length;
				const columns = Math.max(1, Math.ceil(Math.sqrt(count * clusterWidth / clusterHeight)));
				const rows = Math.max(1, Math.ceil(count / columns));
				const centerX = group.x * width;
				const centerY = group.y * height;
				const left = centerX - clusterWidth / 2;
				const top = centerY - clusterHeight / 2 + 12;
				const stepX = clusterWidth / Math.max(1, columns - 1);
				const stepY = clusterHeight / Math.max(1, rows - 1);

				group.nodes.forEach((node, index) => {
					const row = Math.floor(index / columns);
					const col = index % columns;
					const rowCount = Math.min(columns, count - row * columns);
					const rowOffset = (columns - rowCount) * stepX / 2;
					const jitter = ((index * 13) % 7 - 3) * 1.5;
					node.baseX = left + rowOffset + col * stepX + jitter;
					node.baseY = top + row * stepY + ((index * 7) % 5 - 2) * 1.2;
					node.baseZ = group.baseDepth + (((index * 7) % 11) / 10 - 0.5) * 0.18;
					node.radius = node === activeNode ? 4 : 2.3;
				});
			});
		};

		const drawNetwork = () => {
			const bounds = canvas.getBoundingClientRect();
			if (bounds.width === 0 || bounds.height === 0) {
				return;
			}
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(bounds.width * ratio);
			canvas.height = Math.round(bounds.height * ratio);
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			context.clearRect(0, 0, bounds.width, bounds.height);
			layoutNodes(bounds.width, bounds.height);

			const elapsed = motionPreference.matches ? 0 : (performance.now() - animationStart) / 1000;
			const angleY = elapsed * 0.16;
			const angleX = Math.sin(elapsed * 0.22) * 0.16;
			const cosY = Math.cos(angleY);
			const sinY = Math.sin(angleY);
			const cosX = Math.cos(angleX);
			const sinX = Math.sin(angleX);
			const focalLength = 2.8;
			const projectPoint = (x, y, z) => {
				const rotatedX = x * cosY + z * sinY;
				const rotatedZ = -x * sinY + z * cosY;
				const rotatedY = y * cosX - rotatedZ * sinX;
				const depth = y * sinX + rotatedZ * cosX;
				const perspective = focalLength / (focalLength - depth);
				return {
					x: bounds.width / 2 + rotatedX * bounds.width * 0.55 * perspective,
					y: bounds.height / 2 + rotatedY * bounds.height * 0.55 * perspective,
					depth,
					perspective
				};
			};

			nodes.forEach((node) => {
				const { motion } = node;
				const x = node.baseX
					+ Math.sin(elapsed * motion.speedX + motion.phaseX) * motion.amplitudeX
					+ Math.sin(elapsed * motion.speedX * 0.43 + motion.phaseY) * motion.amplitudeX * 0.3;
				const y = node.baseY
					+ Math.sin(elapsed * motion.speedY + motion.phaseY) * motion.amplitudeY
					+ Math.sin(elapsed * motion.speedY * 0.51 + motion.phaseX) * motion.amplitudeY * 0.3;
				const z = node.baseZ + Math.sin(elapsed * motion.speedZ + motion.phaseZ) * 0.045;
				const projected = projectPoint((x / bounds.width - 0.5) * 2, (y / bounds.height - 0.5) * 2, z);
				node.x = projected.x;
				node.y = projected.y;
				node.depth = projected.depth;
				node.radius = (node === activeNode ? 4 : 2.3) * projected.perspective;
			});

			groupNodes.forEach((group) => {
				const projected = projectPoint((group.x - 0.5) * 2, (group.y - 0.5) * 2, group.baseDepth);
				group.screenX = projected.x;
				group.screenY = projected.y;
				group.screenDepth = projected.depth;
				group.perspective = projected.perspective;
			});

			context.lineWidth = 0.7;
			context.strokeStyle = "#292929";
			groupNodes.forEach((group, groupIndex) => {
				const nextGroup = groupNodes[(groupIndex + 1) % groupNodes.length];
				context.beginPath();
				context.moveTo(group.screenX, group.screenY);
				context.lineTo(nextGroup.screenX, nextGroup.screenY);
				context.stroke();
			});

			groupNodes.forEach((group) => {
				const centerX = group.screenX;
				const centerY = group.screenY;
				const groupIsActive = activeNode?.groupId === group.id;

				group.nodes.forEach((node, index) => {
					const next = group.nodes[(index + 1) % group.nodes.length];
					const neighbor = group.nodes[(index + 3) % group.nodes.length];
					[[node, next], [node, neighbor]].forEach(([from, to]) => {
						if (!to || from === to) {
							return;
						}
						context.beginPath();
						context.moveTo(from.x, from.y);
						context.lineTo(to.x, to.y);
						context.globalAlpha = Math.max(0.2, Math.min(0.8, 0.55 + (from.depth + to.depth) * 0.22));
						context.strokeStyle = activeNode === from || activeNode === to
							? `${group.color}cc`
							: "#303030";
						context.lineWidth = (activeNode === from || activeNode === to ? 1.2 : 0.65)
							* Math.max(0.8, Math.min(1.2, (from.radius + to.radius) / 4.6));
						context.stroke();
					});

					context.beginPath();
					context.moveTo(centerX, centerY);
					context.lineTo(node.x, node.y);
					context.globalAlpha = Math.max(0.2, Math.min(0.8, 0.55 + node.depth * 0.22));
					context.strokeStyle = activeNode === node ? `${group.color}cc` : "#353535";
					context.lineWidth = (activeNode === node ? 1.3 : 0.65)
						* Math.max(0.8, Math.min(1.2, node.radius / 2.3));
					context.stroke();
				});
			});

			[...nodes].sort((a, b) => a.depth - b.depth).forEach((node) => {
				const group = groupById(node.groupId);
				context.beginPath();
				context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
				context.globalAlpha = Math.max(0.4, Math.min(1, 0.72 + node.depth * 0.35));
				context.fillStyle = activeNode === node ? group.color : `${group.color}bb`;
				context.fill();
			});

			groupNodes.forEach((group) => {
				const centerX = group.screenX;
				const centerY = group.screenY;
				const groupIsActive = activeNode?.groupId === group.id;
				context.globalAlpha = Math.max(0.55, Math.min(1, 0.78 + group.screenDepth * 0.3));
				context.beginPath();
				context.arc(centerX, centerY, (groupIsActive ? 7 : 5) * group.perspective, 0, Math.PI * 2);
				context.fillStyle = "#0b0b0b";
				context.fill();
				context.lineWidth = (groupIsActive ? 2 : 1.2) * group.perspective;
				context.strokeStyle = group.color;
				context.stroke();
				context.fillStyle = group.color;
				context.font = `600 ${8 * group.perspective}px monospace`;
				const labelIsLeft = centerX < bounds.width / 2;
				const labelIsAbove = centerY < bounds.height / 2;
				context.textAlign = labelIsLeft ? "left" : "right";
				context.textBaseline = labelIsAbove ? "bottom" : "top";
				const labelX = centerX + (labelIsLeft ? 9 : -9) * group.perspective;
				const labelY = centerY + (labelIsAbove ? -8 : 8) * group.perspective;
				context.fillText(group.title, labelX, labelY);
			});
			context.globalAlpha = 1;
		};

		const nodeAt = (event) => {
			const bounds = canvas.getBoundingClientRect();
			const x = event.clientX - bounds.left;
			const y = event.clientY - bounds.top;
			let closest = null;
			let closestDistance = 13;
			nodes.forEach((node) => {
				const distance = Math.hypot(node.x - x, node.y - y);
				if (distance < closestDistance) {
					closest = node;
					closestDistance = distance;
				}
			});
			return closest;
		};

		const showGroup = (groupId, isPinned = false) => {
			const group = groupById(groupId);
			const representative = group?.nodes[0];
			if (representative) {
				setActiveNode({
					...representative,
					label: group.title,
					summary: group.summary,
					section: group.target
				}, isPinned);
			}
		};

		canvas.addEventListener("pointermove", (event) => {
			if (event.pointerType === "touch" || pinned) {
				return;
			}
			const node = nodeAt(event);
			if (node !== activeNode) {
				setActiveNode(node);
			}
		});
		figure.addEventListener("pointerleave", () => {
			if (!pinned) {
				setActiveNode(null);
			}
		});
		canvas.addEventListener("click", (event) => {
			const node = nodeAt(event);
			if (node) {
				setActiveNode(node, true);
			} else if (pinned) {
				setActiveNode(null);
			}
		});
		canvas.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				setActiveNode(null);
				return;
			}
			if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
				event.preventDefault();
				const currentIndex = nodes.indexOf(activeNode);
				const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
				const nextIndex = (currentIndex + step + nodes.length) % nodes.length;
				setActiveNode(nodes[nextIndex]);
			}
			if (event.key === "Enter" && activeNode) {
				window.location.hash = activeNode.section;
			}
		});

		groupButtons.forEach((button) => {
			const activate = () => showGroup(button.dataset.mapGroup);
			button.addEventListener("mouseenter", activate);
			button.addEventListener("focus", activate);
			button.addEventListener("click", () => showGroup(button.dataset.mapGroup, true));
		});

		figure.addEventListener("focusout", (event) => {
			if (!pinned && !figure.contains(event.relatedTarget)) {
				setActiveNode(null);
			}
		});

		link.addEventListener("click", () => {
			pinned = false;
		});

		const stopAnimation = () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
				animationFrame = 0;
			}
		};
		const animate = (timestamp) => {
			if (!canvasIsVisible || document.hidden || motionPreference.matches) {
				animationFrame = 0;
				return;
			}
			if (timestamp - lastFrame >= 33) {
				drawNetwork();
				lastFrame = timestamp;
			}
			animationFrame = requestAnimationFrame(animate);
		};
		const syncAnimation = () => {
			stopAnimation();
			if (motionPreference.matches) {
				drawNetwork();
				return;
			}
			if (canvasIsVisible && !document.hidden && !motionPreference.matches) {
				animationFrame = requestAnimationFrame(animate);
			}
		};
		const visibilityObserver = "IntersectionObserver" in window
			? new IntersectionObserver(([entry]) => {
				canvasIsVisible = entry.isIntersecting;
				syncAnimation();
			}, { threshold: 0.05 })
			: null;

		visibilityObserver?.observe(canvas);
		document.addEventListener("visibilitychange", syncAnimation);
		motionPreference.addEventListener("change", syncAnimation);
		window.addEventListener("resize", drawNetwork);
		drawNetwork();
		syncAnimation();

		function groupById(id) {
			return groupNodes.find((group) => group.id === id);
		}
	};

	initializePortfolioMap();

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
