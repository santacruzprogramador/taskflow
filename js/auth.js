

// 1. FUNCIÓN para verificar sesión y decidir redirección
async function checkSessionAndRedirect() {
    try {
        // Obtener sesión actual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        // Identificar página actual
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/pages/auth.html');
        const isHomePage = currentPath.includes('/pages/home.html');
        const isIndexPage = currentPath.includes('/index.html');

        
        console.log('🔍 Verificando sesión...');
        console.log('📄 Página actual:', currentPath);
        console.log('👤 Sesión:', session ? 'SÍ' : 'NO');
        
        // REGLA 1: Si hay sesión y está en auth → redirigir a home
        if (session && isAuthPage) {
            console.log('🚀 Redirigiendo a home (sesión activa)');
            window.location.href = 'home.html';
            return { redirect: 'home' };
        }
        
        // REGLA 2: Si NO hay sesión y está en home → redirigir a auth
        if (!session && isHomePage) {
            console.log('🔒 Redirigiendo a auth (sin sesión)');
            window.location.href = 'auth.html';
            return { redirect: 'auth' };
        }
        
        // REGLA 3: Acceso permitido
        console.log('✅ Acceso permitido');
        return { redirect: null, session };
        
    } catch (error) {
        console.error('❌ Error verificando sesión:', error);
        return { error };
    }
}

// 2. FUNCIÓN para login con GitHub
async function loginWithGitHub() {
    try {
        console.log('🔄 Iniciando GitHub OAuth...');
        
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/pages/home.html`
            }
        });
        
        if (error) throw error;
        
        console.log('✅ Redirigiendo a GitHub...');
        
    } catch (error) {
        console.error('❌ Error GitHub OAuth:', error);
        alert('Error: ' + error.message);
    }
}

// 3. FUNCIÓN para logout
async function logout() {
    try {
        console.log('🔄 Cerrando sesión...');
        
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        
        console.log('✅ Sesión cerrada');
        window.location.href = 'auth.html';
        
    } catch (error) {
        console.error('❌ Error logout:', error);
    }
}

// 4. CONFIGURACIÓN cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 auth.js cargado');
    
    // A. Verificar sesión y redirigir si es necesario
    await checkSessionAndRedirect();
    
    // B. Configurar botones según la página
    
    // Botón GitHub (solo en auth.html)
    const githubBtn = document.getElementById('githubRegister');
    if (githubBtn) {
        githubBtn.addEventListener('click', loginWithGitHub);
        console.log('✅ Botón GitHub configurado');
    }
    
    // Botón Logout (solo en home.html)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('✅ Botón Logout configurado');
    }
});

// 5. OPCIONAL: Listener para cambios de auth (CON CONDICIÓN para evitar loops)
window.supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('🎭 Evento auth:', event);
    
    // Solo redirigir si el usuario se desloguea y estamos en home
    if (event === 'SIGNED_OUT' && window.location.pathname.includes('home.html')) {
        console.log('👋 Usuario cerró sesión, redirigiendo...');
        window.location.href = 'auth.html';
    }
    
    // No redirigir en SIGNED_IN porque GitHub ya redirige a home.html
});

// 6. FUNCIÓN para login con email/contraseña
async function loginWithEmail() {
    try {
        console.log('🔄 Iniciando login con email...');

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const rememberMe = document.getElementById("rememberMe");

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password,
            options: {
                persistSession: rememberMe.checked
            }
        });

        if (error) throw error;

        // Ocultar mensaje si existía
        document.getElementById("emailNotConfirmedMessage").style.display = "none";
        pendingConfirmationEmail = null;

        if (!rememberMe.checked) {
            localStorage.removeItem('supabase.auth.token');
            console.log('🧹 Sesión temporal: token eliminado de localStorage');
        }

        console.log('✅ Sesión iniciada:', data);
        window.location.href = "home.html";

    } catch (error) {
        console.error('❌ Error login:', error);

        // 🔥 CASO ESPECIAL
        if (error.message.includes("Email not confirmed")) {

            pendingConfirmationEmail = document.getElementById("email").value;

            document
                .getElementById("emailNotConfirmedMessage")
                .style.display = "block";

            return;
        }

        // Otros errores normales
        alert("Error: " + error.message);
    }
}

// 7. CONFIGURACIÓN cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 auth.js cargado');

    // Verificar sesión y redirigir si es necesario
    await checkSessionAndRedirect();

    setupPasswordToggles(); // Paso 10

    // Botón Login (solo en auth.html)
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await loginWithEmail();
        });

        console.log('✅ Formulario de login configurado');
    }

    // Botón GitHub 
    const githubBtn = document.getElementById('githubRegister');
    if (githubBtn) {
        githubBtn.addEventListener('click', loginWithGitHub);
        console.log('✅ Botón GitHub configurado');
    }

    // Botón Logout 
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('✅ Botón Logout configurado');
    }
});

// 8. FUNCIÓN para registro con email/contraseña
async function registerWithEmail() {

    console.log('🔄 Iniciando registro con email...');

    try {

        // Obtener elementos del formulario
        const fullNameInput = document.getElementById("fullName");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const termsCheckbox = document.getElementById("terms");

        // Obtener valores
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // =========================
        // VALIDACIONES
        // =========================

        if (!fullName || fullName.split(" ").length < 2) {
            alert("El nombre completo debe tener al menos nombre y apellido.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        if (!termsCheckbox.checked) {
            alert("Debes aceptar los términos y condiciones.");
            return;
        }

        // =========================
        // REGISTRO EN SUPABASE
        // =========================

        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { fullName }
            }
        });

        console.log("DATA:", data);
        console.log("ERROR:", error);
        console.table(data);

        if (error) throw error;

        // =========================
        // DETECTAR EMAIL YA REGISTRADO
        // =========================

        const user = data?.user;

        if (user && user.identities && user.identities.length === 0) {

            alert("Este email ya está registrado. Inicia sesión.");
            window.location.href = "auth.html";
            return;
        }

        console.log("✅ Cuenta creada correctamente");

        // Mensaje para confirmar email
        alert("Cuenta creada. Revisa tu correo y confirma tu cuenta antes de iniciar sesión.");

        window.location.href = "auth.html";
        return;

        // =========================
        // LOGIN AUTOMÁTICO (no se ejecuta por el return)
        // =========================

        const { error: loginError } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password,
            options: { persistSession: true }
        });

        if (loginError) throw loginError;

        window.location.href = "home.html";

    } catch (error) {

        console.error('❌ Error registro/login:', error);
        alert("Error: " + error.message);

    }

}

// 9. CONFIGURACIÓN para formulario de registro
document.addEventListener('DOMContentLoaded', async function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // evitar envío nativo
            registerWithEmail();
        });
        console.log('✅ Formulario de registro configurado');
    }
});

// 10. FUNCIÓN para mostrar/ocultar contraseñas
function setupPasswordToggles() {   
    console.log('🔑 Configurando toggles de contraseña...');

    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");

    if (passwordInput && togglePassword) {
        togglePassword.addEventListener("click", () => {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;

            // Alternar icono
            const icon = togglePassword.querySelector("i");
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");

            console.log(`👁️ Password ahora en modo: ${type}`);
        });
        console.log('✅ Toggle de contraseña principal configurado');
    }

    const confirmPasswordInput = document.getElementById("confirmPassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

    if (confirmPasswordInput && toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener("click", () => {
            const type = confirmPasswordInput.type === "password" ? "text" : "password";
            confirmPasswordInput.type = type;

            // Alternar icono
            const icon = toggleConfirmPassword.querySelector("i");
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");

            console.log(`👁️ ConfirmPassword ahora en modo: ${type}`);
        });
        console.log('✅ Toggle de confirmación configurado');
    }
}

// 11. Verificación de email: Reenviar confirmación
async function resendConfirmationEmail(email) {
    const { data, error } = await window.supabaseClient.auth.resend({
        type: 'signup',
        email: email
    });

    if (error) {
        console.error(error);
        alert("Error reenviando email: " + error.message);
        return;
    }

    alert("Correo de confirmación reenviado.");
}

// 12. Configuración del botón de reenvío de confirmación de correo
const resendBtn = document.getElementById("resendEmailBtn");

if (resendBtn) {
    resendBtn.addEventListener("click", async () => {

        if (!pendingConfirmationEmail) {
            alert("No hay email para reenviar.");
            return;
        }

        await resendConfirmationEmail(pendingConfirmationEmail);
    });
}


// 13. Redirigir a página de restablecimiento de contraseña
const forgotPasswordLink = document.querySelector(".forgot-password");

forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault(); // Evita comportamiento por defecto

    // Redirigir directamente a reset-password.html
    window.location.href = "reset-password.html";
});


