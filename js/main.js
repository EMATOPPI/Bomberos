/**
 * CBVP K141 Caazapá - Landing Page JavaScript
 * Cuerpo de Bombeiros Voluntarios del Paraguay
 *
 * Architecture: Module Pattern with Separation of Concerns
 * - ConfigModule: Carga y provee datos dinámicos desde JSON
 * - UIModule: User interface interactions
 * - NavigationModule: Smooth scrolling
 * - AnimationModule: Scroll-triggered animations
 * - GalleryModule: Lightbox functionality
 * - FormModule: Form handling & validation
 * - NewsModule: Carga y renderiza noticias
 */

// ==========================================
// Config Module - Datos Dinámicos
// ==========================================
const ConfigModule = (function() {
    let config = null;
    let news = [];

    /**
     * Cargar config.json
     */
    async function loadConfig() {
        try {
            const response = await fetch('/data/config.json');
            if (!response.ok) throw new Error('No se pudo cargar config.json');
            config = await response.json();
            return config;
        } catch (error) {
            console.error('[ConfigModule] Error cargando config:', error);
            return null;
        }
    }

    /**
     * Cargar noticias del folder data/news/
     */
    async function loadNews() {
        try {
            // Cargar todos los JSON de news
            const response = await fetch('/data/news.json');
            if (!response.ok) throw new Error('No se pudo cargar news.json');
            const data = await response.json();
            news = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            return news;
        } catch (error) {
            // Si no existe news.json, intentar cargar individualmente
            console.warn('[ConfigModule] news.json no existe, intentando cargar noticias individualmente');
            return [];
        }
    }

    /**
     * Obtener configuración cargada
     */
    function getConfig() {
        return config;
    }

    /**
     * Obtener noticias
     */
    function getNews() {
        return news;
    }

    /**
     * Aplicar datos dinámicos al DOM
     */
    function applyToDOM() {
        if (!config) return;

        // Teléfono de emergencias
        const telefonoEmergencia = document.getElementById('telefono-emergencia');
        if (telefonoEmergencia) telefonoEmergencia.textContent = config.contacto?.telefonoEmergencias || '';

        // Teléfono central
        const telefonoCentral = document.getElementById('telefono-central');
        if (telefonoCentral) telefonoCentral.textContent = config.contacto?.telefonoCentral || '';

        // Emails
        const emailInstitucional = document.getElementById('email-institucional');
        if (emailInstitucional) emailInstitucional.textContent = config.contacto?.emailInstitucional || '';

        const emailPersonal = document.getElementById('email-personal');
        if (emailPersonal) emailPersonal.textContent = config.contacto?.emailPersonal || '';

        // Redes sociales
        if (config.redesSociales) {
            const fbLink = document.getElementById('social-facebook');
            if (fbLink && config.redesSociales.facebook) {
                fbLink.href = config.redesSociales.facebook;
                fbLink.style.display = '';
            }

            const igLink = document.getElementById('social-instagram');
            if (igLink && config.redesSociales.instagram) {
                igLink.href = config.redesSociales.instagram;
                igLink.style.display = '';
            }

            const twLink = document.getElementById('social-twitter');
            if (twLink && config.redesSociales.twitter) {
                twLink.href = config.redesSociales.twitter;
                twLink.style.display = '';
            }

            const ytLink = document.getElementById('social-youtube');
            if (ytLink && config.redesSociales.youtube) {
                ytLink.href = config.redesSociales.youtube;
                ytLink.style.display = '';
            }
        }

        // Datos bancarios para sección donation
        const bancoInfo = document.getElementById('banco-info');
        if (bancoInfo && config.donaciones) {
            bancoInfo.innerHTML = `
                <p><strong>Banco:</strong> ${config.donaciones.banco}</p>
                <p><strong>Tipo:</strong> ${config.donaciones.tipoCuenta}</p>
                <p><strong>Cuenta/CBU:</strong> ${config.donaciones.numeroCuenta}</p>
                <p><strong>Titular:</strong> ${config.donaciones.nombreTitular}</p>
                ${config.donaciones.observaciones ? `<p class="donacion-observaciones">${config.donaciones.observaciones}</p>` : ''}
            `;
        }
    }

    return {
        loadConfig,
        loadNews,
        getConfig,
        getNews,
        applyToDOM
    };
})();

// ==========================================
// News Module - Renderizar Noticias
// ==========================================
const NewsModule = (function() {
    /**
     * Renderizar noticias en el DOM
     */
    function renderNews(news) {
        const container = document.getElementById('news-container');
        if (!container) return;

        if (!news || news.length === 0) {
            container.innerHTML = '<p class="no-news">Proximamente tendremos novedades...</p>';
            return;
        }

        const html = news.map(item => `
            <article class="news-card animate-on-scroll">
                ${item.image ? `<div class="news-card__image"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>` : ''}
                <div class="news-card__content">
                    <span class="news-card__date">${formatDate(item.date)}</span>
                    <h3 class="news-card__title">${item.title}</h3>
                    <p class="news-card__excerpt">${item.excerpt || ''}</p>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * Formatear fecha a formato legible
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PY', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    return {
        renderNews
    };
})();

// ==========================================
// Utility Functions
// ==========================================
const Utils = {
    debounce(func, wait = 50) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    smoothScrollTo(target, offset = 80) {
        const element = document.querySelector(target);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },

    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
            rect.bottom >= 0
        );
    },

    lockScroll() {
        document.body.style.overflow = 'hidden';
    },

    unlockScroll() {
        document.body.style.overflow = '';
    }
};

// ==========================================
// UI Module - User Interface Interactions
// ==========================================
const UIModule = (function() {
    let header;
    let menuToggle;
    let mobileMenu;
    let mobileMenuClose;
    let mobileLinks;

    function init() {
        cacheDOM();
        bindEvents();
    }

    function cacheDOM() {
        header = document.getElementById('header');
        menuToggle = document.getElementById('menuToggle');
        mobileMenu = document.getElementById('mobileMenu');
        mobileMenuClose = document.getElementById('mobileMenuClose');
        mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.nav-link, .btn') : [];
    }

    function bindEvents() {
        if (menuToggle) {
            menuToggle.addEventListener('click', openMobileMenu);
            menuToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('active');
                menuToggle.setAttribute('aria-expanded', !isOpen);
            });
        }

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', handleEscapeKey);
        window.addEventListener('scroll', Utils.debounce(handleHeaderScroll, 10));
    }

    function handleHeaderScroll() {
        if (window.scrollY > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    function openMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            Utils.lockScroll();
        }
    }

    function closeMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            Utils.unlockScroll();
        }
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
            GalleryModule.close();
        }
    }

    return { init, closeMobileMenu };
})();

// ==========================================
// Navigation Module - Smooth Scrolling
// ==========================================
const NavigationModule = (function() {
    function init() {
        bindEvents();
    }

    function bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });
    }

    function handleAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            return;
        }
        if (href && href.startsWith('#')) {
            e.preventDefault();
            Utils.smoothScrollTo(href);
        }
    }

    return { init };
})();

// ==========================================
// Animation Module - Scroll Animations
// ==========================================
const AnimationModule = (function() {
    let animatedElements = [];
    let countersAnimated = false;
    let observer;

    function init() {
        cacheElements();
        setupObserver();
        observeElements();
    }

    function cacheElements() {
        animatedElements = document.querySelectorAll('.animate-on-scroll');
    }

    function setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                }
            });
        }, options);
    }

    function observeElements() {
        animatedElements.forEach(el => observer.observe(el));
    }

    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            function updateCounter() {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            }

            updateCounter();
        });
    }

    function setupCounterObserver() {
        const impactSection = document.getElementById('impacto');
        if (!impactSection) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(impactSection);
    }

    return { init, setupCounterObserver };
})();

// ==========================================
// Gallery Module - Lightbox Functionality
// ==========================================
const GalleryModule = (function() {
    let lightbox;
    let lightboxClose;
    let galleryItems;

    function init() {
        cacheElements();
        bindEvents();
    }

    function cacheElements() {
        lightbox = document.getElementById('lightbox');
        lightboxClose = document.getElementById('lightboxCerrar');
        galleryItems = document.querySelectorAll('[data-lightbox]');
    }

    function bindEvents() {
        galleryItems.forEach(item => {
            item.addEventListener('click', handleGalleryClick);
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', close);
        }

        if (lightbox) {
            lightbox.addEventListener('click', handleBackdropClick);
        }
    }

    function handleGalleryClick(e) {
        const item = e.currentTarget;
        const img = item.querySelector('img');
        if (img && lightbox) {
            const lightboxImage = lightbox.querySelector('.lightbox__image');
            if (lightboxImage) {
                lightboxImage.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" style="max-width:100%;max-height:80vh;object-fit:contain;">`;
            }
        }
        open();
    }

    function handleBackdropClick(e) {
        if (e.target === lightbox) {
            close();
        }
    }

    function open() {
        if (lightbox) {
            lightbox.classList.add('active');
            Utils.lockScroll();
        }
    }

    function close() {
        if (lightbox) {
            lightbox.classList.remove('active');
            Utils.unlockScroll();
        }
    }

    return { init, open, close };
})();

// ==========================================
// Form Module - Form Handling & Validation
// ==========================================
const FormModule = (function() {
    let contactForm;
    let newsletterForm;

    function init() {
        cacheElements();
        bindEvents();
    }

    function cacheElements() {
        contactForm = document.getElementById('contactForm');
        newsletterForm = document.getElementById('newsletterForm');
    }

    function bindEvents() {
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactSubmit);
        }

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
    }

    /**
     * Sanitizar input para EmailJS
     */
    function sanitizeForEmail(value) {
        if (!value) return '';
        return String(value)
            .trim()
            .slice(0, 1000)
            .replace(/[\r\n]/g, ' ');
    }

    async function handleContactSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.nombre || !data.email || !data.mensaje) {
            showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        if (!isValidEmail(data.email)) {
            showNotification('Por favor ingrese un correo electrónico válido', 'error');
            return;
        }

        showNotification('Enviando mensaje...', 'info');

        try {
            await emailjs.send('service_oarbwik', 'template_9heno5c', {
                name: sanitizeForEmail(data.nombre),
                email: sanitizeForEmail(data.email),
                phone: sanitizeForEmail(data.telefono) || 'No proporcionó',
                message: sanitizeForEmail(data.mensaje)
            });

            showNotification('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.', 'success');
            e.target.reset();
        } catch (error) {
            console.error('[FormModule] Error al enviar:', error);
            showNotification('Error al enviar el mensaje. Por favor intenta de nuevo.', 'error');
        }
    }

    function handleNewsletterSubmit(e) {
        e.preventDefault();

        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (!email) {
            showNotification('Por favor ingrese su correo electrónico', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Por favor ingrese un correo electrónico válido', 'error');
            return;
        }

        // Newsletter aún no implementado - mostrar mensaje informativo
        showNotification('¡Gracias por tu interés! Próximamente available newsletter.', 'success');
        e.target.reset();
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostrar notificación - usa CSS classes, no inyecta estilos
     */
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification--hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    return { init };
})();

// ==========================================
// Main Application - Initialization
// ==========================================
const App = (function() {
    async function init() {
        console.log('CBVP K141 Caazapá - Initializing application...');

        // Cargar datos dinámicos primero
        await ConfigModule.loadConfig();
        ConfigModule.applyToDOM();

        const news = await ConfigModule.loadNews();
        NewsModule.renderNews(news);

        // Inicializar todos los módulos
        UIModule.init();
        NavigationModule.init();
        AnimationModule.init();
        AnimationModule.setupCounterObserver();
        GalleryModule.init();
        FormModule.init();

        console.log('Application initialized successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();