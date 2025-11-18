// Hero slider auto-advance (no dependencies)
(function () {
	if (typeof document === "undefined") return;
	const slider = document.querySelector('.hero-slider');
	if (!slider) return;
	const slides = Array.from(slider.querySelectorAll('.slide'));
	const dotsContainer = slider.querySelector('.slider-dots');
	if (slides.length === 0 || !dotsContainer) return;

	let current = 0;
	const intervalMs = Number(slider.getAttribute('data-interval') || 3000);

	// Build dots
	slides.forEach((_, idx) => {
		const b = document.createElement('button');
		b.setAttribute('aria-label', 'Slide ' + (idx + 1));
		b.addEventListener('click', () => goTo(idx));
		dotsContainer.appendChild(b);
	});
	const dots = Array.from(dotsContainer.querySelectorAll('button'));

	function render() {
		slides.forEach((el, i) => el.classList.toggle('active', i === current));
		dots.forEach((el, i) => el.classList.toggle('active', i === current));
	}

	function goTo(index) {
		current = (index + slides.length) % slides.length;
		render();
		resetTimer();
	}

	let timerId = null;
	function startTimer() {
		stopTimer();
		timerId = setInterval(() => goTo(current + 1), intervalMs);
	}
	function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
	function resetTimer() { stopTimer(); startTimer(); }

	// Start after a small delay (2s) as requested
	setTimeout(() => {
		render();
		startTimer();
	}, 2000);

	// Pause on hover (desktop)
	slider.addEventListener('mouseenter', stopTimer);
	slider.addEventListener('mouseleave', startTimer);
})();


