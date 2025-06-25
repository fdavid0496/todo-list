/**
 * js/formValidation.js
 *
 * Este archivo JavaScript gestiona la validación del campo de título del formulario.
 * Separa la lógica de validación de la lógica principal de CRUD de tareas para una mejor modularidad.
 *
 * @author [Fabián David Marín Luna]
 * @version 1.0.0
 * @date 2025-06-25
 */

// Se ejecuta una vez que todo el contenido del DOM ha sido cargado.
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM necesarios para la validación ---
    const taskTitleInput = document.getElementById('task-title'); // Campo de entrada para el título
    const addTaskButton = document.getElementById('add-task-button'); // Botón para añadir/actualizar tarea
    const titleErrorLabel = document.getElementById('title-error'); // Etiqueta para mostrar errores del título

    // --- Estado de Validación ---
    // Bandera para controlar si el campo de título ha sido interactuado de forma que requiera validación visible.
    // Es decir, si el usuario ha empezado a escribir y la validación ha fallado, o ha salido del campo con error.
    let isTitleInputDirty = false;

    // --- Función de Validación ---

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

    // --- Event Listeners para Validación ---

    /**
     * Listener para el evento 'input' en el campo de título.
     * Se activa cada vez que el usuario escribe en el campo.
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
     * Marca `isTitleInputDirty` como true para asegurar que el error se muestre si el campo es inválido.
     * Llama a `validateTitle` para realizar la validación final y mostrar/ocultar el error.
     */
    taskTitleInput.addEventListener('blur', () => {
        isTitleInputDirty = true; // El campo ha sido tocado
        validateTitle(); // Valida y muestra el error si es necesario
    });
    
    /**
     * Listener para el evento 'focus' (cuando el campo gana el foco) en el campo de título.
     * Si el campo no está "sucio" y está vacío, asegura que el mensaje de error esté oculto.
     */
    taskTitleInput.addEventListener('focus', () => {
        if (!isTitleInputDirty && taskTitleInput.value.trim() === '') {
            titleErrorLabel.style.display = 'none';
        }
    });

    // Opcional: Exportar la función validateTitle si es necesario llamarla desde script.js
    // Aunque en este diseño, validateTitle se auto-maneja con los event listeners del input,
    // y el botón de submit en script.js ya se basa en el estado `disabled` del botón.
    // Si necesitas que script.js pueda forzar una validación de visibilidad al submitear,
    // puedes exportar y luego importar, pero para el flujo actual no es estrictamente necesario.
    // window.validateTitle = validateTitle; // Ejemplo de cómo se podría hacer accesible globalmente
});