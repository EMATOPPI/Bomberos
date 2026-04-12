import { chromium } from 'playwright';

const INVITE_URL = 'https://bomberos-k141.netlify.app/#confirmation_token=test_token';
const CONFIRM_URL = 'https://bomberos-k141.netlify.app/admin/confirm.html';

async function testFlow() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capturar errores de consola
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    console.log('1. Abriendo página de confirmación...');

    // Ir directo a la página de confirmación (simulando el token)
    await page.goto(CONFIRM_URL, { waitUntil: 'networkidle' });

    console.log('   - URL actual:', page.url());
    console.log('   - Título:', await page.title());

    // Buscar elementos del formulario
    const emailInput = await page.$('#email');
    const passwordInput = await page.$('#password');
    const submitBtn = await page.$('#submit-btn');
    const form = await page.$('#signup-form');
    const message = await page.$('#message');

    console.log('\n2. Elementos encontrados:');
    console.log('   - Email input:', emailInput ? '✅' : '❌');
    console.log('   - Password input:', passwordInput ? '✅' : '❌');
    console.log('   - Submit button:', submitBtn ? '✅' : '❌');
    console.log('   - Form:', form ? '✅' : '❌');
    console.log('   - Message:', message ? '✅' : '❌');

    // Verificar si hay mensaje de error
    if (message) {
        const msgText = await message.textContent();
        const msgClass = await message.getAttribute('class');
        console.log('   - Mensaje actual:', msgText);
        console.log('   - Tipo mensaje:', msgClass);
    }

    // Tomar screenshot
    await page.screenshot({ path: 'confirm-page.png', fullPage: true });
    console.log('\n3. Screenshot guardado: confirm-page.png');

    // Verificar contenido de la página
    const bodyText = await page.textContent('body');
    console.log('\n4. Contenido de la página (primeros 500 chars):');
    console.log(bodyText.substring(0, 500));

    await browser.close();

    // Resumen
    console.log('\n=== RESUMEN ===');
    console.log('Si ves el formulario con email y contraseña: ✅ FUNCIONA');
    console.log('Si ves "Enlace de invitación inválido": ❌ TOKEN NO RECONOCIDO');
    console.log('Si ves página en blanco: ❌ HAY ERROR DE CARGA');

    console.log('\nErrores de consola:', errors.length > 0 ? errors : 'Ninguno');
}

testFlow().catch(console.error);