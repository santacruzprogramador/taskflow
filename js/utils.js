// Utilidades generales

// Mostrar mensajes al usuario
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('authMessage') || 
    document.getElementById('taskMessage') ||
    document.createElement('div');
    
    if (!messageEl.id) {
        messageEl.className = 'message';
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = text;
    messageEl.className = `message ${type} fade-in`;
    messageEl.classList.remove('hidden');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}
// ✅ Exponer en global
window.showMessage = showMessage;


// Redirigir a otra página
function redirectTo(path) {
    window.location.href = path;
}

// Formatear fecha
function formatDate(dateString, time = false) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    if (time) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('es-ES', options);
}

// Alternar visibilidad de contraseña
function togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    const icon = button.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const { supabase } = await window.supabaseClient.auth.getUser();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            redirectTo('index.html');
            return null;
        }
        
        const { data: profile, error } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (error) throw error;
        
        return { user, profile };
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        redirectTo('index.html');
        return null;
    }
}

// Verificar autenticación en cada página
async function checkAuthAndRedirect() {
    const user = await loadUserData();
    if (!user) {
        redirectTo('index.html');
    }
    return user;
}

// Inicializar utilidades comunes
function initCommonUtils() {
    // Inicializar tooltips
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const title = e.target.getAttribute('title');
            if (title) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                
                e.target.setAttribute('data-tooltip-id', tooltip.id);
            }
        });
        
        el.addEventListener('mouseleave', (e) => {
            const tooltipId = e.target.getAttribute('data-tooltip-id');
            if (tooltipId) {
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) {
                    tooltip.remove();
                }
                e.target.removeAttribute('data-tooltip-id');
            }
        });
    });
    
    // Agregar estilos para tooltips
    if (!document.querySelector('#tooltip-styles')) {
        const style = document.createElement('style');
        style.id = 'tooltip-styles';
        style.textContent = `
            .tooltip {
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }
}