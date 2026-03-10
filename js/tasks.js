/* modo modulos
import { supabase } from './supabase-config.js';
import { showMessage, formatDate } from './utils.js';
 */


// Usar funciones globales de utils.js
/* showMessage("Hola desde tasks.js"); */
console.log("Fecha formateada:", formatDate(new Date()));

// Aquí tu lógica de tareas...



class TaskManager {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = { field: 'created_at', order: 'desc' };
        this.searchTerm = '';
        
        this.init();
    }

    async init() {
        await this.getCurrentUser();
        await this.loadTasks();
        this.initEventListeners();
        this.updateUI();
    }

    updateUI() {
        console.log("UI actualizada");
    }

    async getCurrentUser() {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        this.currentUser = user;
        
        if (user) {
            const profileResult = await this.getUserProfile(user.id);
            if (profileResult.success) {
                this.updateUserInfo(profileResult.data);
            }
        }
    }

    async getUserProfile(userId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return { success: false, error: error.message };
        }
    }

    updateUserInfo(profile) {
        console.log("Perfil recibido:", profile);
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userName) userName.textContent = profile.full_name || 'Usuario';
        if (userEmail) userEmail.textContent = profile.email || 'usuario@email.com';
        
        // Actualizar fecha actual
        const currentDate = document.getElementById('currentDate');
        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    async loadTasks() {
        if (!this.currentUser) return;

        try {
            let query = window.supabaseClient
                .from('tasks')
                .select('*')
                .eq('user_id', this.currentUser.id);

            // Aplicar filtro
            if (this.currentFilter === 'pending') {
                query = query.eq('is_completed', false);
            } else if (this.currentFilter === 'completed') {
                query = query.eq('is_completed', true);
            } else if (this.currentFilter === 'high') {
                query = query.eq('priority', 3);
            }

            // Aplicar búsqueda
            if (this.searchTerm) {
                query = query.or(`title.ilike.%${this.searchTerm}%,description.ilike.%${this.searchTerm}%`);
            }

            // Aplicar ordenamiento
            query = query.order(this.currentSort.field, { 
                ascending: this.currentSort.order === 'asc' 
            });

            const { data, error } = await query;

            if (error) throw error;

            this.tasks = data || [];
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('Error cargando tareas:', error);
            showMessage('Error al cargar las tareas', 'error');
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        
        if (!tasksList) return;

        if (this.tasks.length === 0) {
            tasksList.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        
        // Ordenar: pendientes primero, luego completadas
        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.is_completed === b.is_completed) return 0;
            return a.is_completed ? 1 : -1;
        });

        tasksList.innerHTML = sortedTasks.map(task => this.createTaskElement(task)).join('');
        
        // Agregar event listeners a los botones
        this.attachTaskEventListeners();
    }

    createTaskElement(task) {
        const dueDate = task.due_date ? formatDate(task.due_date) : 'Sin fecha límite';
        const priorityClass = this.getPriorityClass(task.priority);
        const priorityText = this.getPriorityText(task.priority);
        
        return `
            <div class="task-item ${task.is_completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-priority ${priorityClass}">${priorityText}</span>
                </div>
                ${task.description ? `
                    <p class="task-description">${this.escapeHtml(task.description)}</p>
                ` : ''}
                <div class="task-footer">
                    <div class="task-meta">
                        <span><i class="far fa-calendar"></i> ${dueDate}</span>
                        <span><i class="far fa-clock"></i> ${formatDate(task.created_at, true)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn-complete" data-action="complete">
                            <i class="fas fa-${task.is_completed ? 'undo' : 'check'}"></i>
                            ${task.is_completed ? 'Reabrir' : 'Completar'}
                        </button>
                        <button class="btn-edit" data-action="edit">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-delete" data-action="delete">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPriorityClass(priority) {
        switch (parseInt(priority)) {
            case 3: return 'high';
            case 2: return 'medium';
            case 1: return 'low';
            default: return 'low';
        }
    }

    getPriorityText(priority) {
        switch (parseInt(priority)) {
            case 3: return 'Alta';
            case 2: return 'Media';
            case 1: return 'Baja';
            default: return 'Baja';
        }
    }

    attachTaskEventListeners() {
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                this.toggleTaskComplete(taskId);
            });
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                this.editTask(taskId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                this.deleteTask(taskId);
            });
        });
    }

    async toggleTaskComplete(taskId) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            const { error } = await window.supabaseClient
                .from('tasks')
                .update({ is_completed: !task.is_completed })
                .eq('id', taskId);

            if (error) throw error;

            showMessage(`Tarea ${!task.is_completed ? 'completada' : 'reabierta'}`, 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            showMessage('Error al actualizar la tarea', 'error');
        }
    }

    async createTask(taskData) {
        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .insert([{
                    ...taskData,
                    user_id: this.currentUser.id
                }]);

            if (error) throw error;

            showMessage('Tarea creada exitosamente', 'success');
            await this.loadTasks();
            this.closeTaskModal();
        } catch (error) {
            console.error('Error creando tarea:', error);
            showMessage('Error al crear la tarea', 'error');
        }
    }

    async updateTask(taskId, taskData) {
        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .update(taskData)
                .eq('id', taskId);

            if (error) throw error;

            showMessage('Tarea actualizada exitosamente', 'success');
            await this.loadTasks();
            this.closeTaskModal();
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            showMessage('Error al actualizar la tarea', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            showMessage('Tarea eliminada exitosamente', 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            showMessage('Error al eliminar la tarea', 'error');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.openTaskModal(task);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const taskId = document.getElementById('taskId');
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskDueDate = document.getElementById('taskDueDate');
        const taskPriority = document.getElementById('taskPriority');

        if (task) {
            modalTitle.textContent = 'Editar Tarea';
            taskId.value = task.id;
            taskTitle.value = task.title;
            taskDescription.value = task.description || '';
            taskDueDate.value = task.due_date || '';
            taskPriority.value = task.priority || '2';
        } else {
            modalTitle.textContent = 'Nueva Tarea';
            taskId.value = '';
            taskTitle.value = '';
            taskDescription.value = '';
            taskDueDate.value = '';
            taskPriority.value = '2';
        }

        modal.classList.add('show');
        setTimeout(() => taskTitle.focus(), 100);
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        const taskForm = document.getElementById('taskForm');
        
        modal.classList.remove('show');
        taskForm.reset();
    }

updateStats() {

    console.log('🎯 Debug priority:', this.tasks.map(t => ({ 
    title: t.title, 
    priority: t.priority, 
    type: typeof t.priority 
})));
    const totalTasks = this.tasks.length;
    const pendingTasks = this.tasks.filter(t => !t.is_completed).length;
    const completedTasks = this.tasks.filter(t => t.is_completed).length;
    // Contar tareas de alta prioridad pendientes (ajusta 'priority' si tu campo se llama diferente)
    const highPriorityTasks = this.tasks.filter(t => t.priority === 'high').length;

    // Actualizar contadores
    const totalTasksEl = document.getElementById('totalTasks');
    const pendingCountEl = document.getElementById('pendingCount');
    const completedCountEl = document.getElementById('completedCount');
    const pendingStatsEl = document.getElementById('pendingStats');
    const completedStatsEl = document.getElementById('completedStats');
    const highPriorityCountEl = document.getElementById('highPriorityCount');

    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (pendingCountEl) pendingCountEl.textContent = pendingTasks;
    if (completedCountEl) completedCountEl.textContent = completedTasks;
    if (pendingStatsEl) pendingStatsEl.textContent = `${pendingTasks} pendientes`;
    if (completedStatsEl) completedStatsEl.textContent = `${completedTasks} completadas`;
    
    // ← Alta prioridad: siempre mostrar el número (0, 1, 39, etc.)
    if (highPriorityCountEl) highPriorityCountEl.textContent = highPriorityTasks;

    // Actualizar resumen
    const taskSummary = document.getElementById('taskSummary');
    if (taskSummary) {
        taskSummary.innerHTML = `Tienes <span id="totalTasks">${totalTasks}</span> tareas`;
    }

    
}

    initEventListeners() {
        // Nuevo botón de tarea
        const newTaskBtn = document.getElementById('newTaskBtn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.openTaskModal());
        }

        // Formulario de tarea
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const taskId = document.getElementById('taskId').value;
                const taskData = {
                    title: document.getElementById('taskTitle').value.trim(),
                    description: document.getElementById('taskDescription').value.trim(),
                    due_date: document.getElementById('taskDueDate').value || null,
                    priority: parseInt(document.getElementById('taskPriority').value),
                    updated_at: new Date().toISOString()
                };

                if (!taskData.title) {
                    showMessage('El título es requerido', 'error');
                    return;
                }

                if (taskId) {
                    this.updateTask(taskId, taskData);
                } else {
                    this.createTask(taskData);
                }
            });
        }

        // Botón cancelar en modal
        const cancelTaskBtn = document.getElementById('cancelTask');
        if (cancelTaskBtn) {
            cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        }

        // Cerrar modal
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeTaskModal());
        }

        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeTaskModal();
                }
            });
        }

        // Filtros de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
                
                // Actualizar clases activas
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        // Ordenamiento
        const sortBy = document.getElementById('sortBy');
        const sortOrder = document.getElementById('sortOrder');
        
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.currentSort.field = sortBy.value;
                this.loadTasks();
            });
        }
        
        if (sortOrder) {
            sortOrder.addEventListener('change', () => {
                this.currentSort.order = sortOrder.value;
                this.loadTasks();
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('searchTask');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim();
                    this.loadTasks();
                }, 300);
            });
        }

        // Toggle del menú móvil
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }

        // Cerrar menú al hacer clic fuera (en móvil)
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (sidebar && sidebar.classList.contains('show') && 
                !sidebar.contains(e.target) && 
                e.target !== menuToggle) {
                sidebar.classList.remove('show');
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.loadTasks();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});


/* Obtener el botón que abre/cierra el menú (icono hamburguesa) */
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Cerrar al tocar fuera
document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("open");
    }
});