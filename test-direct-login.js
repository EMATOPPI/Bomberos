const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('=== TEST: Login directo via widget API ===\n');

    // Ir a /admin
    console.log('1. Yendo a /admin...');
    await page.goto('https://bomberos-k141.netlify.app/admin/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('   URL:', page.url());

    // Esperar a que cargue el widget
    await page.waitForTimeout(3000);

    // Usar la API del widget directamente
    console.log('\n2. Abriendo widget via netlifyIdentity.open()...');
    await page.evaluate(() => {
        window.netlifyIdentity.open();
    });

    await page.waitForTimeout(2000);

    // Ahora verificar si hay un modal visible
    const modalVisible = await page.evaluate(() => {
        const iframe = document.querySelector('#netlify-identity-widget');
        if (iframe) {
            const style = window.getComputedStyle(iframe);
            return style.display !== 'none' && style.visibility !== 'hidden';
        }
        return false;
    });
    console.log('   Modal visible:', modalVisible ? '✅' : '❌');

    // Hacer login directamente usando la API del widget
    console.log('\n3. Intentando login via API...');
    try {
        await page.evaluate(async () => {
            const email = 'toppiemanuel@gmail.com';
            const password = 'Eti1986.Eti';

            // Primero cerrar el modal si está abierto
            window.netlifyIdentity.close();

            // Intentar login
            await new Promise((resolve, reject) => {
                window.netlifyIdentity.on('login', resolve);
                window.netlifyIdentity.on('error', reject);

                window.netlifyIdentity.open();
                // Esperar a que se abra el modal y entonces hacer login
                setTimeout(() => {
                    // Encontrar el modal del widget
                    const iframe = document.querySelector('#netlify-identity-widget');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'logout' }, '*');
                    }
                    reject(new Error('Timeout waiting for modal'));
                }, 5000);
            });
        });
        console.log('   ✅ Login exitoso!');
    } catch (e) {
        console.log('   ❌ Error:', e.message);
    }

    await page.waitForTimeout(3000);

    console.log('\n4. Estado final:');
    console.log('   URL:', page.url());
    console.log('   Body:', (await page.textContent('body')).substring(0, 300));

    await page.screenshot({ path: 'direct-login-test.png', fullPage: true });
    console.log('   📸 Screenshot: direct-login-test.png');

    await browser.close();
})().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});