/**
 * CBVP K141 Caazapá - Landing Page JavaScript
 * Cuerpo de Bombeiros Voluntarios del Paraguay
 */

// ==========================================
// ConfigModule
// ==========================================
const ConfigModule = (function() {
    let config = null;

    async function loadConfig() {
        try {
            const response = await fetch('/data/config.json');
            if (!response.ok) throw new Error('No se pudo cargar config.json');
            config = await response.json();
            return config;
        } catch (error) {
            console.error('[ConfigModule] Error:', error);
            return null;
        }
    }

    function getConfig() { return config; }

    function applyToDOM() {
        if (!config) return;
        const c = config;

        // Emergency bar
        const telCentralEl = document.getElementById('telefono-central');
        if (telCentralEl) telCentralEl.textContent = c.contacto?.telefonoCentral || '';

        // Contact section
        const telCentral2 = document.getElementById('telefono-central-2');
        if (telCentral2) telCentral2.textContent = c.contacto?.telefonoCentral || '';
        const emailContact = document.getElementById('email-contact');
        if (emailContact) emailContact.textContent = c.contacto?.emailInstitucional || '';
        const emailInstitucional = document.getElementById('email-institucional');
        if (emailInstitucional) emailInstitucional.textContent = c.contacto?.emailInstitucional || '';

        // Bank info
        const bancoInfo = document.getElementById('banco-info');
        if (bancoInfo && c.donaciones) {
            bancoInfo.innerHTML = `
                <p><strong>Banco:</strong> ${c.donaciones.banco}</p>
                <p><strong>Tipo:</strong> ${c.donaciones.tipoCuenta}</p>
                <p><strong>Cuenta/CBU:</strong> ${c.donaciones.numeroCuenta}</p>
                <p><strong>Titular:</strong> ${c.donaciones.nombreTitular}</p>
                <p><strong>RUC:</strong> ${c.donaciones.ruc}</p>
                ${c.donaciones.observaciones ? `<p style="margin-top:12px;font-size:0.85rem;color:var(--color-gray-medium)">${c.donaciones.observaciones}</p>` : ''}
            `;
        }

        // Social links
        const socials = ['facebook', 'instagram', 'twitter', 'youtube'];
        socials.forEach(network => {
            const contactLink = document.getElementById(`social-${network}`);
            const footerLink = document.getElementById(`footer-${network}`);
            const redes = c.redesSociales || {};
            const url = redes[network];
            if (contactLink && url) { contactLink.href = url; contactLink.style.display = ''; }
            if (footerLink && url) { footerLink.href = url; footerLink.style.display = ''; }
        });
    }

    return { loadConfig, getConfig, applyToDOM };
})();

// ==========================================
// NewsModule
// ==========================================
const NewsModule = (function() {
    async function loadNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) return [];
            const data = await response.json();
            return data.filter(n => n.published).sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch { return []; }
    }

    function renderNews(news) {
        const container = document.getElementById('news-container');
        if (!container) return;
        if (!news || news.length === 0) {
            container.innerHTML = '<p class="no-news">Próximamente tendremos novedades...</p>';
            return;
        }
        // Show max 3 on landing
        const toShow = news.slice(0, 3);
        container.innerHTML = toShow.map(item => `
            <article class="news-card animate-on-scroll">
                ${item.image ? `<div class="news-card__image"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>` : `<div class="news-card__image" style="display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" width="48" height="48"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>`}
                <div class="news-card__content">
                    <span class="news-card__date">${formatDate(item.date)}</span>
                    <h3 class="news-card__title">${item.title}</h3>
                    <p class="news-card__excerpt">${item.excerpt || ''}</p>
                </div>
            </article>
        `).join('');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    return { loadNews, renderNews };
})();

// ==========================================
// Utils
// ==========================================
const Utils = {
    debounce(func, wait = 50) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    smoothScrollTo(target, offset = 80) {
        const el = document.querySelector(target);
        if (el) {
            const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
};

// ==========================================
// UIModule
// ==========================================
const UIModule = (function() {
    function init() {
        const header = document.getElementById('header');
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuClose = document.getElementById('mobileMenuClose');

        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.scrollY > 80) header.classList.add('header--scrolled');
            else header.classList.remove('header--scrolled');
        }, 10));

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                if (mobileMenu) mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }
        if (mobileMenu) {
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeMobileMenu();
                GalleryModule.close();
            }
        });
    }

    function closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    return { init, closeMobileMenu };
})();

// ==========================================
// NavigationModule
// ==========================================
const NavigationModule = (function() {
    function init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') { e.preventDefault(); return; }
                e.preventDefault();
                Utils.smoothScrollTo(href);
            });
        });
    }
    return { init };
})();

// ==========================================
// AnimationModule
// ==========================================
const AnimationModule = (function() {
    let countersAnimated = false;

    function init() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 80);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(el => observer.observe(el));

        // Counter animation
        const impactSection = document.getElementById('estadisticas');
        if (impactSection) {
            const counterObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !countersAnimated) {
                        countersAnimated = true;
                        animateCounters();
                        // Also trigger donors bars
                        document.querySelectorAll('.donors__bar-fill').forEach(bar => {
                            bar.style.width = bar.style.getPropertyValue('--w');
                        });
                    }
                });
            }, { threshold: 0.3 });
            counterObserver.observe(impactSection);
        }
    }

    function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();
            function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(target * eased).toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    return { init };
})();

// ==========================================
// GalleryModule
// ==========================================
const GalleryModule = (function() {
    function init() {
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.getElementById('lightboxCerrar');
        const lightboxImage = document.getElementById('lightboxImage');

        document.querySelectorAll('[data-lightbox]').forEach(item => {
            item.addEventListener('click', () => {
                const placeholder = item.querySelector('.gallery__placeholder');
                const span = placeholder ? placeholder.querySelector('span') : null;
                if (lightboxImage) {
                    lightboxImage.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:rgba(255,255,255,0.6);padding:48px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6"/></svg>
                        <span style="font-weight:600">${span ? span.textContent : 'Galería'}</span>
                        <span style="font-size:0.85rem;opacity:0.7">Contenido próximamente</span>
                    </div>`;
                }
                if (lightbox) lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', close);
        }
        if (lightbox) {
            lightbox.addEventListener('click', e => {
                if (e.target === lightbox) close();
            });
        }
    }

    function close() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    return { init, close };
})();

// ==========================================
// FormModule
// ==========================================
const FormModule = (function() {
    function init() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactSubmit);
        }
    }

    function sanitize(val) {
        return String(val || '').trim().slice(0, 1000).replace(/[\r\n]/g, ' ');
    }

    async function handleContactSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if (!data.nombre || !data.email || !data.mensaje) {
            showNotification('Por favor complete los campos requeridos', 'error');
            return;
        }
        showNotification('Enviando mensaje...', 'info');
        try {
            await emailjs.send('service_oarbwik', 'template_9heno5c', {
                name: sanitize(data.nombre),
                email: sanitize(data.email),
                phone: sanitize(data.telefono) || 'No proporcionado',
                subject: sanitize(data.asunto) || 'Sin asunto',
                message: sanitize(data.mensaje)
            });
            showNotification('¡Mensaje enviado! Nos pondremos en contacto pronto.', 'success');
            e.target.reset();
        } catch (err) {
            console.error('[FormModule] Error:', err);
            showNotification('Error al enviar. Por favor intenta de nuevo.', 'error');
        }
    }

    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const n = document.createElement('div');
        n.className = `notification notification--${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => {
            n.classList.add('notification--hide');
            setTimeout(() => n.remove(), 300);
        }, 5000);
    }

    return { init };
})();

// ==========================================
// App Init
// ==========================================
const App = (function() {
    async function init() {
        console.log('CBVP K141 — Init');
        await ConfigModule.loadConfig();
        ConfigModule.applyToDOM();
        const news = await NewsModule.loadNews();
        NewsModule.renderNews(news);
        UIModule.init();
        NavigationModule.init();
        AnimationModule.init();
        GalleryModule.init();
        FormModule.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
