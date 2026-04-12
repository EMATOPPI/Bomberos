import { chromium } from 'playwright';

const INVITE_URL = 'https://bomberos-k141.netlify.app/#confirmation_token=REAL_TOKEN_HERE';

async function testFullFlow() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('=== TEST: Flujo completo de invitación ===\n');

    // TEST 1: Verificar que index.html redirige con token
    console.log('1. Verificando redirección desde index.html...');

    // Simular acceso desde el email (con hash de token)
    await page.goto('https://bomberos-k141.netlify.app/#confirmation_token=TEST_TOKEN_123', {
        waitUntil: 'load'
    });

    // Esperar un momento para que el script ejecute
    await page.waitForTimeout(1000);

    console.log('   URL después de carga:', page.url());

    // Si la redirección funcionó, debe ir a confirm.html
    if (page.url().includes('confirm.html')) {
        console.log('   ✅ REDIRECCIÓN FUNCIONA');
    } else {
        console.log('   ❌ NO REDIRIGIÓ - verificando por qué...');

        // Verificar el script en index.html
        const scriptContent = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script');
            return Array.from(scripts).map(s => s.textContent.substring(0, 200)).join('\n---\n');
        });
        console.log('   Scripts en page:', scriptContent.substring(0, 500));
    }

    // TEST 2: Ir directo a confirm.html y verificar elementos
    console.log('\n2. Verificando página confirm.html...');
    await page.goto('https://bomberos-k141.netlify.app/admin/confirm.html', {
        waitUntil: 'networkidle'
    });

    // Agregar hash manualmente para simular token
    await page.evaluate(() => {
        window.location.hash = 'confirmation_token=FAKE_TOKEN_456';
    });
    await page.reload({ waitUntil: 'networkidle' });

    console.log('   URL:', page.url());

    // Ver elementos
    const hasForm = await page.$('#signup-form');
    const hasEmail = await page.$('#email');
    const hasPassword = await page.$('#password');
    const hasSubmit = await page.$('#submit-btn');

    console.log('   Formulario:', hasForm ? '✅' : '❌');
    console.log('   Email:', hasEmail ? '✅' : '❌');
    console.log('   Contraseña:', hasPassword ? '✅' : '❌');
    console.log('   Botón:', hasSubmit ? '✅' : '❌');

    // Intentar submit con datos falsos
    console.log('\n3. Probando envío del formulario...');

    if (hasEmail && hasPassword && hasSubmit) {
        await page.fill('#email', 'test@example.com');
        await page.fill('#password', 'TestPassword123');
        await page.click('#submit-btn');

        await page.waitForTimeout(3000);

        const messageEl = await page.$('#message');
        const messageText = messageEl ? await messageEl.textContent() : 'no hay mensaje';
        const messageClass = messageEl ? await messageEl.getAttribute('class') : 'no hay clase';

        console.log('   Mensaje:', messageText);
        console.log('   Tipo:', messageClass);
        console.log('   URL final:', page.url());
    }

    await page.screenshot({ path: 'full-flow-test.png', fullPage: true });
    console.log('\n📸 Screenshot guardado: full-flow-test.png');

    await browser.close();

    console.log('\n=== FIN TEST ===');
}

testFullFlow().catch(console.error);