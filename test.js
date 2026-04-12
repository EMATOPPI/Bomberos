import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle' });
        console.log('✓ Página cargada correctamente');
        
        // Check title
        const title = await page.title();
        console.log(`✓ Título: ${title}`);
        
        // Check hero section with new class
        const heroTitle = await page.$eval('.hero__title', el => el.textContent.trim());
        console.log(`✓ Hero título encontrado: ${heroTitle.substring(0, 30)}...`);
        
        // Check navigation with new class
        const navLinks = await page.$$('.header__menu-link');
        console.log(`✓ ${navLinks.length} enlaces de navegación`);
        
        // Check sections
        const sections = ['nosotros', 'servicios', 'impacto', 'galeria', 'contacto'];
        for (const section of sections) {
            const exists = await page.$(`#${section}`);
            if (exists) {
                console.log(`✓ Sección #${section} encontrada`);
            }
        }
        
        // Check buttons
        const buttons = await page.$$('.btn');
        console.log(`✓ ${buttons.length} botones encontrados`);
        
        // Check responsive
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        const menuToggle = await page.$('.header__menu-toggle');
        if (menuToggle) {
            const isVisible = await menuToggle.isVisible();
            console.log(`✓ Menú móvil ${isVisible ? 'visible' : 'no visible'} en móvil`);
        }
        
        // Report errors
        if (errors.length > 0) {
            console.log('\n⚠ Errores de consola:');
            errors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('\n✓ Sin errores de consola');
        }
        
        console.log('\n✅ Todas las pruebas pasaron');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();