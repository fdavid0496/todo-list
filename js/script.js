/**
 * js/script.js
 *
 * Este archivo JavaScript gestiona la lógica principal de la aplicación "Mi Gestor de Tareas".
 * Incluye funcionalidades para añadir, editar, eliminar y marcar tareas como completadas,
 * así como la persistencia de datos en el almacenamiento local (localStorage).
 * La validación del formulario de título se maneja en `formValidation.js`.
 *
 * @author [Fabián David Marín Luna]
 * @version 1.0.0
 * @date 2025-06-25
 */

// Se ejecuta una vez que todo el contenido del DOM ha sido cargado.
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Referencias a elementos del DOM ---
    const taskForm = document.getElementById('task-form'); // Formulario de tareas
    const taskTitleInput = document.getElementById('task-title'); // Campo de entrada para el título
    const taskDescriptionInput = document.getElementById('task-description'); // Campo de texto para la descripción
    const addTaskButton = document.getElementById('add-task-button'); // Botón para añadir/actualizar tarea
    const tasksTableBody = document.querySelector('#tasks-table tbody'); // Cuerpo de la tabla de tareas
    const tasksTable = document.getElementById('tasks-table'); // La tabla completa de tareas

    // --- 2. Estado de la Aplicación ---
    let tasks = []; // Array para almacenar todas las tareas.

    // --- 3. Funciones de Utilidad y Persistencia ---

    /**
     * Guarda el array de tareas en el almacenamiento local del navegador.
     * Convierte el array de objetos a una cadena JSON.
     */
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    /**
     * Carga las tareas del almacenamiento local al iniciar la aplicación.
     * Si existen tareas guardadas, las parsea de JSON a objetos y las asigna al array `tasks`.
     */
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    };

    // --- 4. Funciones CRUD y Renderizado ---

    /**
     * Renderiza (dibuja) la lista de tareas en la tabla HTML.
     * - Limpia el contenido actual del tbody.
     * - Si no hay tareas, muestra un mensaje y oculta la tabla.
     * - Para cada tarea, crea una nueva fila con su título, descripción y botones de acción.
     * - Añade la clase 'completed-task' si la tarea está marcada como completada.
     */
    const renderTasks = () => {
        tasksTableBody.innerHTML = ''; // Limpia el cuerpo de la tabla

        if (tasks.length === 0) {
            tasksTable.style.display = 'none'; // Oculta la tabla completa
            const noTasksMessageRow = document.createElement('tr');
            noTasksMessageRow.innerHTML = `
                <td colspan="2" style="text-align: center; padding: 2rem; font-size: 1.2em; color: var(--primary-color);">
                    No hay tareas registradas
                </td>
            `;
            tasksTableBody.appendChild(noTasksMessageRow);
            tasksTableBody.style.display = 'table-row-group'; // Asegura que el tbody esté visible para el mensaje
            return;
        }

        tasksTable.style.display = 'table'; // Muestra la tabla si hay tareas

        // Itera sobre cada tarea en el array `tasks`
        tasks.forEach(task => {
            const row = document.createElement('tr');
            if (task.completed) {
                row.classList.add('completed-task'); // Aplica estilo si la tarea está completada
            }
            row.dataset.id = task.id; // Almacena el ID de la tarea en la fila HTML (para futuras interacciones)

            // Define el contenido HTML de la fila, incluyendo título, descripción (si existe) y botones
            row.innerHTML = `
                <td>
                    <strong>${task.title}</strong>
                    ${task.description ? `<br><small>${task.description}</small>` : ''}
                </td>
                <td class="task-actions">
                    <button class="edit-button">Editar</button>
                    <button class="delete-button">Eliminar</button>
                    <button class="${task.completed ? 'undo-complete-button' : 'complete-button'}">
                        ${task.completed ? 'Desmarcar' : 'Completado'}
                    </button>
                </td>
            `;
            tasksTableBody.appendChild(row); // Añade la fila al cuerpo de la tabla
        });
    };

    /**
     * Maneja el envío del formulario para añadir una nueva tarea.
     * - Previene el comportamiento por defecto del formulario (recargar la página).
     * - **Depende del estado `disabled` del botón `addTaskButton` establecido por `formValidation.js`.**
     * - Crea un nuevo objeto de tarea con un ID único, título, descripción y estado inicial.
     * - Añade la nueva tarea al array `tasks`, la guarda y vuelve a renderizar la tabla.
     * - Limpia el formulario y resetea el estado del botón.
     * @param {Event} e - El evento de envío del formulario.
     */
    const addTask = (e) => {
        e.preventDefault(); // Evita la recarga de la página

        // Aquí nos basamos en que el botón ya está deshabilitado si el título no es válido
        if (addTaskButton.disabled) { 
            // Opcional: si la lógica de validación estuviera en `formValidation.js` y expusiera una función
            // de validación, podrías llamarla aquí para forzar el feedback al usuario en el submit.
            // Por ejemplo: if (typeof window.validateTitle === 'function') window.validateTitle();
            return;
        }

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        const newTask = {
            id: Date.now(), // Genera un ID único (marca de tiempo)
            title,
            description,
            completed: false // Nueva tarea no está completada por defecto
        };

        tasks.push(newTask); // Añade la nueva tarea al array
        saveTasks(); // Guarda las tareas en localStorage
        renderTasks(); // Actualiza la interfaz

        // Limpia y resetea el formulario
        taskForm.reset();
        addTaskButton.disabled = true; // Deshabilita el botón nuevamente (asumiendo que el campo de título está vacío)
        taskTitleInput.focus(); // Vuelve el foco al campo de título
        // No necesitamos manipular isTitleInputDirty o validateTitle aquí,
        // ya que formValidation.js se encarga con sus propios listeners.
    };

    /**
     * Prepara el formulario para editar una tarea existente.
     * - Busca la tarea por su ID.
     * - Rellena los campos del formulario con los datos de la tarea a editar.
     * - Cambia el texto del botón a "Actualizar Tarea" y almacena el ID de la tarea a editar.
     * - Reemplaza el event listener de `submit` para usar `updateTask` en lugar de `addTask`.
     * @param {number} id - El ID de la tarea a editar.
     */
    const editTask = (id) => {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            taskTitleInput.value = taskToEdit.title;
            taskDescriptionInput.value = taskToEdit.description;

            addTaskButton.textContent = 'Actualizar Tarea';
            addTaskButton.dataset.editingId = id; // Almacena el ID de la tarea que se está editando
            
            // Para asegurar que la validación del título se active en modo edición si el título es inválido:
            // Tendríamos que llamar a una función expuesta por formValidation.js
            // Por ahora, el botón ya estará deshabilitado si el texto no cumple la validación.
            // Si la función validateTitle no está expuesta globalmente, no se puede llamar directamente aquí.
            // Si se necesitara, formValidation.js debería tener: `window.validateTitle = validateTitle;`
            // Y aquí se llamaría: `if (typeof window.validateTitle === 'function') window.validateTitle();`
            
            // Cambia el manejador del evento submit
            taskForm.removeEventListener('submit', addTask);
            taskForm.addEventListener('submit', updateTask);
        }
    };

    /**
     * Actualiza una tarea existente con los datos del formulario.
     * - Previene el comportamiento por defecto del formulario.
     * - **Depende del estado `disabled` del botón `addTaskButton` establecido por `formValidation.js`.**
     * - Encuentra la tarea por su ID de edición.
     * - Actualiza los datos de la tarea en el array `tasks`, guarda y renderiza.
     * - Restaura el formulario a su estado original para "Agregar Tarea".
     * @param {Event} e - El evento de envío del formulario.
     */
    const updateTask = (e) => {
        e.preventDefault();

        // Aquí nos basamos en que el botón ya está deshabilitado si el título no es válido
        if (addTaskButton.disabled) {
            // Ver comentario en addTask para cómo se podría forzar validación visual
            return;
        }

        const editingId = parseInt(addTaskButton.dataset.editingId);
        const taskIndex = tasks.findIndex(task => task.id === editingId);

        if (taskIndex !== -1) {
            tasks[taskIndex].title = taskTitleInput.value.trim();
            tasks[taskIndex].description = taskDescriptionInput.value.trim();
            saveTasks();
            renderTasks();

            // Restaura el formulario a su estado original
            taskForm.reset();
            addTaskButton.textContent = 'Agregar Tarea';
            delete addTaskButton.dataset.editingId; // Elimina el ID de edición
            addTaskButton.disabled = true; // Deshabilita el botón nuevamente
            taskTitleInput.focus(); // Vuelve el foco al campo de título

            // Restaura el manejador del evento submit para añadir tareas
            taskForm.removeEventListener('submit', updateTask);
            taskForm.addEventListener('submit', addTask);
        }
    };

    /**
     * Elimina una tarea del array `tasks` por su ID.
     * - Filtra la tarea a eliminar.
     * - Guarda las tareas actualizadas y renderiza la tabla.
     * @param {number} id - El ID de la tarea a eliminar.
     */
    const deleteTask = (id) => {
        // Filtra el array, creando uno nuevo sin la tarea con el ID especificado
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    };

    /**
     * Cambia el estado de "completado" de una tarea.
     * - Busca la tarea por su ID.
     * - Invierte el valor de `task.completed` (true a false, o false a true).
     * - Guarda las tareas actualizadas y renderiza la tabla.
     * @param {number} id - El ID de la tarea a marcar/desmarcar.
     */
    const toggleCompleteTask = (id) => {
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed; // Invierte el estado
            saveTasks();
            renderTasks();
        }
    };

    // --- 5. Event Listeners ---
    
    // Listener principal para el envío del formulario.
    // Inicialmente, `addTask` es el controlador. Se puede cambiar a `updateTask` durante la edición.
    taskForm.addEventListener('submit', addTask);

    /**
     * Delegación de eventos para los botones de acción en la tabla de tareas.
     * Permite manejar clics en botones de filas que pueden añadirse dinámicamente.
     * - Identifica qué botón fue clickeado (Editar, Eliminar, Completado/Desmarcar).
     * - Llama a la función CRUD correspondiente (`editTask`, `deleteTask`, `toggleCompleteTask`).
     * - Incluye una confirmación para la eliminación de tareas.
     * @param {Event} e - El evento de clic.
     */
    tasksTableBody.addEventListener('click', (e) => {
        const target = e.target; // El elemento que fue clickeado
        const row = target.closest('tr'); // Busca la fila <tr> más cercana al elemento clickeado

        if (!row) return; // Si no se clickeó en una fila, no hacemos nada

        const taskId = parseInt(row.dataset.id); // Obtiene el ID de la tarea almacenado en la fila

        // Determina qué botón fue clickeado basándose en sus clases
        if (target.classList.contains('edit-button')) {
            editTask(taskId);
        } else if (target.classList.contains('delete-button')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                deleteTask(taskId);
            }
        } else if (target.classList.contains('complete-button') || target.classList.contains('undo-complete-button')) {
            toggleCompleteTask(taskId);
        }
    });

    // --- 6. Inicialización de la Aplicación ---
    loadTasks(); // Carga las tareas existentes al inicio
    renderTasks(); // Dibuja las tareas cargadas en la tabla
    // El estado inicial del botón `addTaskButton.disabled` se manejará por `formValidation.js`
    // Una vez que `formValidation.js` se cargue y el DOM esté listo.
});