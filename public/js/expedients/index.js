async function getData() {
    const response = await fetch('/dashboard/data');
    
    if (!response.ok) {
        console.error('error');
    }

    const data = await response.json();
    return data;
}   

async function initialiceTable(){
    // Grid Options: Contains all of the Data Grid configurations
    const gridOptions = {
        // Row Data: The data to be displayed.
        rowData: await getData(),
        // Column Definitions: Defines the columns to be displayed.
        columnDefs: [
            { 
                field: "expedient_number",
                headerName: "Número de Expediente"
            },
            { 
                field: "name",
                headerName: "Nombre"
            },
            { 
                field: "state",
                headerName: "Estado"
            },
            {
                field: 'created_at',
                headerName: "Fecha creación",
                filter: 'agDateColumnFilter',
                filterParams: {
                    inRangeFloatingFilterDateFormat: "DD/MM/YYYY",
                    // Comparador corregido para evitar el día de diferencia
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        if (!cellValue) return -1;
                        
                        // Convertir la fecha ISO a objeto Date
                        const cellDate = new Date(cellValue);
                        
                        // Ajustar ambas fechas para usar UTC y evitar problemas de zona horaria
                        // Creamos las fechas usando UTC para evitar problemas con zonas horarias
                        const cellDateOnly = new Date(Date.UTC(
                            cellDate.getFullYear(), 
                            cellDate.getMonth(), 
                            cellDate.getDate()
                        ));
                        
                        const filterDateOnly = new Date(Date.UTC(
                            filterLocalDateAtMidnight.getFullYear(), 
                            filterLocalDateAtMidnight.getMonth(), 
                            filterLocalDateAtMidnight.getDate()
                        ));
                        
                        // Comparar fechas UTC
                        if (cellDateOnly.getTime() === filterDateOnly.getTime()) return 0;
                        if (cellDateOnly < filterDateOnly) return -1;
                        return 1;
                    },
                    // Para el filtro "between" (inRange), necesitamos asegurarnos que
                    // incluya el día completo hasta el final del día
                    inRangeInclusive: true,
                    browserDatePicker: true
                },
                valueFormatter: (params) => {
                    if (!params.value) return '';
                    const date = new Date(params.value);
                    return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) + ' ' + date.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
            },
            {
                field: 'updated_at',
                headerName: "Fecha modificación",
                // configure column to use the Date Filter
                filter: 'agDateColumnFilter',
                filterParams: {
                    inRangeFloatingFilterDateFormat: "DD/MM/YYYY",
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        if (!cellValue) return -1;
                        
                        // Convertir la fecha ISO a objeto Date
                        const cellDate = new Date(cellValue);
                        
                        // Si filterLocalDateAtMidnight no incluye hora (es medianoche), comparamos solo las fechas
                        const filterTime = filterLocalDateAtMidnight.getHours() + 
                                          filterLocalDateAtMidnight.getMinutes() + 
                                          filterLocalDateAtMidnight.getSeconds();
                        
                        if (filterTime === 0) {
                            // Crear objetos Date solo con la parte de fecha para comparar
                            const cellDateOnly = new Date(
                                cellDate.getFullYear(), 
                                cellDate.getMonth(), 
                                cellDate.getDate()
                            );
                            
                            const filterDateOnly = new Date(
                                filterLocalDateAtMidnight.getFullYear(), 
                                filterLocalDateAtMidnight.getMonth(), 
                                filterLocalDateAtMidnight.getDate()
                            );
                            
                            if (cellDateOnly.getTime() === filterDateOnly.getTime()) return 0;
                            if (cellDateOnly < filterDateOnly) return -1;
                            return 1;
                        } else {
                            // Comparar con fecha y hora completas
                            if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) return 0;
                            if (cellDate < filterLocalDateAtMidnight) return -1;
                            return 1;
                        }
                    },
                    // Habilitar el selector de tiempo en el filtro
                    browserDatePicker: true,
                    minValidYear: 2000,
                    maxValidYear: 2100,
                    includeDateTimeInput: true // Agregar input para hora
                },
                // Formatear la fecha para mostrar fecha y hora en formato latinoamericano
                valueFormatter: (params) => {
                    if (!params.value) return '';
                    const date = new Date(params.value);
                    return date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) + ' ' + date.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
            },
            {
                headerName: 'Acciones',
                field: 'uuid',
                sortable: false,
                filter: false,
                width: 150,
                cellRenderer: function(params) {
                    // Crear botones con íconos y asignar eventos
                    const verBtn = document.createElement('button');
                    verBtn.innerHTML = '<i class="fas fa-eye"></i>'; // Usando Font Awesome (asegúrate de incluirlo)
                    verBtn.className = 'btn btn-primary btn-sm me-1'; // Clases de Bootstrap
                    verBtn.title = 'Ver detalles';
                    verBtn.textContent = 'Ver detalles';
                    verBtn.addEventListener('click', function() {
                        showExpedient(params.data.uuid);
                    });
                    
                    const editarBtn = document.createElement('button');
                    editarBtn.innerHTML = '<i class="fas fa-edit"></i>';
                    editarBtn.className = 'btn btn-warning btn-sm me-1';
                    editarBtn.title = 'Editar';
                    editarBtn.addEventListener('click', function() {
                        editarExpediente(params.data.expedient_number);
                    });
                    
                    const eliminarBtn = document.createElement('button');
                    eliminarBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    eliminarBtn.className = 'btn btn-danger btn-sm';
                    eliminarBtn.title = 'Eliminar';
                    eliminarBtn.addEventListener('click', function() {
                        confirmarEliminar(params.data.expedient_number);
                    });
                    
                    // Contenedor para los botones
                    const container = document.createElement('div');
                    container.className = 'd-flex';
                    container.appendChild(verBtn);
                    container.appendChild(editarBtn);
                    container.appendChild(eliminarBtn);
                    
                    return container;
                }
            }
        ],
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        // Definir el idioma para los componentes de AG Grid
        // localeText: AG_GRID_LOCALE_ES, // Asegúrate de importar o definir esta constante
    };

    const myGridElement = document.querySelector('#myGrid');
    agGrid.createGrid(myGridElement, gridOptions);
}

initialiceTable();

function showExpedient(uuid) {
    const url = new URL('/expedientes/descargar', window.location.origin);
    url.searchParams.append('uuid', uuid);
    window.open(url.toString(), '_blank');
}