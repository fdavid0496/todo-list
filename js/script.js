/**
 * script.js
 *
 * Este archivo JavaScript gestiona la lógica de la aplicación "Mi Gestor de Tareas".
 * Incluye funcionalidades para añadir, editar, eliminar y marcar tareas como completadas,
 * así como la persistencia de datos en el almacenamiento local (localStorage)
 * y la validación del formulario.
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
    const titleErrorLabel = document.getElementById('title-error'); // Etiqueta para mostrar errores del título
    const tasksTableBody = document.querySelector('#tasks-table tbody'); // Cuerpo de la tabla de tareas
    const tasksTable = document.getElementById('tasks-table'); // La tabla completa de tareas

    // --- 2. Estado de la Aplicación ---
    let tasks = []; // Array para almacenar todas las tareas.
    // Bandera para controlar si el campo de título ha sido interactuado de forma que requiera validación visible.
    let isTitleInputDirty = false;

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

    /**
     * Valida el campo de título del formulario.
     * - El título debe tener entre 5 y 50 caracteres (trim() elimina espacios al inicio/final).
     * - Muestra u oculta el mensaje de error `titleErrorLabel` basándose en la validez
     * y si `isTitleInputDirty` es true (es decir, si el usuario ya interactuó).
     * - Habilita o deshabilita el botón `addTaskButton` según la validez del título.
     * @returns {boolean} True si el título es válido, false en caso contrario.
     */
    const validateTitle = () => {
        const title = taskTitleInput.value.trim();
        const isValid = title.length >= 5 && title.length <= 50;

        // Solo muestra/oculta el error si el input ya está "sucio" (interactuado)
        if (isTitleInputDirty) {
            if (!isValid) {
                titleErrorLabel.style.display = 'block'; // Muestra el mensaje de error
            } else {
                titleErrorLabel.style.display = 'none'; // Oculta el mensaje de error
            }
        } else {
            // Asegura que el error esté oculto si no ha habido interacción relevante.
            titleErrorLabel.style.display = 'none';
        }

        addTaskButton.disabled = !isValid; // Habilita/deshabilita el botón según la validez
        return isValid;
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
     * - Valida el título; si no es válido, detiene la ejecución.
     * - Crea un nuevo objeto de tarea con un ID único, título, descripción y estado inicial.
     * - Añade la nueva tarea al array `tasks`, la guarda y vuelve a renderizar la tabla.
     * - Limpia el formulario y resetea el estado de validación.
     * @param {Event} e - El evento de envío del formulario.
     */
    const addTask = (e) => {
        e.preventDefault(); // Evita la recarga de la página

        isTitleInputDirty = true; // Marca que se intentó enviar el formulario
        if (!validateTitle()) { // Valida el título antes de procesar
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
        addTaskButton.disabled = true; // Deshabilita el botón nuevamente
        taskTitleInput.focus(); // Vuelve el foco al campo de título
        isTitleInputDirty = false; // Resetea el estado "sucio"
        validateTitle(); // Oculta el mensaje de error si el campo quedó vacío
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
            
            isTitleInputDirty = true; // El campo se considera "sucio" al iniciar la edición
            validateTitle(); // Re-valida el título para asegurar el estado correcto del botón y mensaje
            
            // Cambia el manejador del evento submit
            taskForm.removeEventListener('submit', addTask);
            taskForm.addEventListener('submit', updateTask);
        }
    };

    /**
     * Actualiza una tarea existente con los datos del formulario.
     * - Previene el comportamiento por defecto del formulario.
     * - Valida el título.
     * - Encuentra la tarea por su ID de edición.
     * - Actualiza los datos de la tarea en el array `tasks`, guarda y renderiza.
     * - Restaura el formulario a su estado original para "Agregar Tarea".
     * @param {Event} e - El evento de envío del formulario.
     */
    const updateTask = (e) => {
        e.preventDefault();

        isTitleInputDirty = true; // Marca que se intentó actualizar el formulario
        if (!validateTitle()) {
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
            addTaskButton.disabled = true;
            taskTitleInput.focus();

            isTitleInputDirty = false; // Resetea el estado "sucio"
            validateTitle(); // Oculta el mensaje de error después de limpiar el formulario

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

    /**
     * Listener para el evento 'input' en el campo de título.
     * - Se activa cada vez que el usuario escribe en el campo.
     * - Si el campo no está vacío, marca `isTitleInputDirty` como true.
     * - Llama a `validateTitle` para actualizar el estado del error y el botón.
     */
    taskTitleInput.addEventListener('input', () => {
        if (taskTitleInput.value.trim().length > 0) {
            isTitleInputDirty = true; // El usuario ha empezado a escribir
        } else {
            // Si el campo se vacía, y no está "sucio" por un blur previo, oculta el error.
            if (!isTitleInputDirty) {
                 titleErrorLabel.style.display = 'none';
            }
        }
        validateTitle();
    });

    /**
     * Listener para el evento 'blur' (cuando el campo pierde el foco) en el campo de título.
     * - Marca `isTitleInputDirty` como true para asegurar que el error se muestre si el campo es inválido.
     * - Llama a `validateTitle` para realizar la validación final y mostrar/ocultar el error.
     */
    taskTitleInput.addEventListener('blur', () => {
        isTitleInputDirty = true; // El campo ha sido tocado
        validateTitle(); // Valida y muestra el error si es necesario
    });
    
    /**
     * Listener para el evento 'focus' (cuando el campo gana el foco) en el campo de título.
     * - Si el campo no está "sucio" y está vacío, asegura que el mensaje de error esté oculto.
     */
    taskTitleInput.addEventListener('focus', () => {
        if (!isTitleInputDirty && taskTitleInput.value.trim() === '') {
            titleErrorLabel.style.display = 'none';
        }
    });

    /**
     * Listener principal para el envío del formulario.
     * Inicialmente, `addTask` es el controlador. Se puede cambiar a `updateTask` durante la edición.
     */
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
    addTaskButton.disabled = true; // Asegura que el botón "Agregar Tarea" esté deshabilitado al cargar si el campo de título está vacío.
});