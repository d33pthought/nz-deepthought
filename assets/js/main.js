// deepthought.nz

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
	const header = document.querySelector('.site-header');
	const nav = document.querySelector('.site-nav');
	const toggle = document.querySelector('.nav-toggle');

	// Solid header once the hero is scrolled past
	const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	// Mobile menu
	const setMenu = (open) => {
		toggle.setAttribute('aria-expanded', String(open));
		nav.classList.toggle('is-open', open);
		header.classList.toggle('menu-open', open);
	};
	toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
	nav.addEventListener('click', (e) => {
		if (e.target.closest('a')) setMenu(false);
	});

	// Highlight the nav link for the section in view
	const links = [...nav.querySelectorAll('a[href^="#"]')];
	const sectionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
		});
	}, { rootMargin: '-45% 0px -50% 0px' });
	document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

	// Reveal content as it scrolls into view
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		});
	}, { threshold: 0.12 });
	document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

	// Gallery lightbox
	const lightbox = document.querySelector('.lightbox');
	const lightboxImg = lightbox.querySelector('img');
	document.querySelectorAll('.gallery .tile').forEach((tile) => {
		tile.addEventListener('click', (e) => {
			e.preventDefault();
			const img = tile.querySelector('img');
			lightboxImg.src = tile.href;
			lightboxImg.alt = img.alt;
			lightbox.showModal();
		});
	});
	lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
	lightbox.addEventListener('click', (e) => {
		if (e.target === lightbox) lightbox.close();
	});

	// Contact form: submit in place and show the result inline
	const form = document.querySelector('.contact-form');
	const status = form.querySelector('.form-status');
	const submit = form.querySelector('button[type="submit"]');
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		submit.disabled = true;
		status.textContent = 'Sending…';
		try {
			const res = await fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { Accept: 'application/json' },
			});
			if (!res.ok) throw new Error(res.statusText);
			form.reset();
			status.textContent = 'Thanks — your message has been sent.';
		} catch {
			status.textContent = 'Sorry, something went wrong. Please try again or reach out on LinkedIn.';
		} finally {
			submit.disabled = false;
		}
	});

	document.getElementById('year').textContent = new Date().getFullYear();
});
