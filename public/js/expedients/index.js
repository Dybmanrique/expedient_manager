async function getData() {
    const response = await fetch('/dashboard/data');

    if (!response.ok) {
        console.error('error');
    }

    const data = await response.json();
    return data;
}

let gridApi;

// const isDarkMode = document.documentElement.classList.contains('dark');
const isDarkMode = true;

async function initialiceTable() {
    // Grid Options: Contains all of the Data Grid configurations
    const gridOptions = {
        // Row Data: The data to be displayed.
        // rowData: await getData(),
        theme: agGrid.themeQuartz.withPart(
            isDarkMode ? agGrid.colorSchemeDarkWarm : agGrid.colorSchemeLightWarm
        ),
        localeText: AG_GRID_LOCALE_ES,
        loading: true,
        // Column Definitions: Defines the columns to be displayed.
        enableCellTextSelection: true,
        columnDefs: [
            {
                field: "expedient_number",
                headerName: "Número de Expediente",
                filter: 'agTextColumnFilter',
            },
            {
                field: "name",
                headerName: "Nombre"
            },
            {
                field: "state",
                headerName: "Estado",
                filter: 'agTextColumnFilter',
                cellRenderer: (params) => {
                    const valor = params.value?.toUpperCase() ?? '';
                    let clase = '';

                    switch (valor) {
                        case 'EN PROCESO':
                            clase = 'state-en-proceso';
                            break;
                        case 'APROBADO':
                            clase = 'state-aprobado';
                            break;
                        case 'ANULADO':
                            clase = 'state-anulado';
                            break;
                        case 'ARCHIVADO':
                            clase = 'state-archivado';
                            break;
                        default:
                            clase = 'state-desconocido';
                    }

                    return `<span class="state ${clase}">${valor}</span>`;
                }
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
                pinned: 'right',
                field: 'uuid',
                sortable: false,
                filter: false,
                width: 180,
                cellRenderer: function (params) {
                    // Crear botones con íconos y asignar eventos
                    const verBtn = document.createElement('button');
                    verBtn.className = 'btn btn-details'; // Clases de Bootstrap
                    verBtn.title = 'Ver detalles';
                    verBtn.textContent = 'Abrir';
                    verBtn.addEventListener('click', function () {
                        showExpedient(params.data.uuid);
                    });

                    const editarBtn = document.createElement('button');
                    editarBtn.className = 'btn btn-delete';
                    editarBtn.title = 'Editar';
                    // editarBtn.textContent = 'Eliminar';
                    editarBtn.addEventListener('click', function () {
                        editarExpediente(params.data.expedient_number);
                    });

                    const eliminarBtn = document.createElement('button');
                    eliminarBtn.className = 'btn btn-delete';
                    eliminarBtn.title = 'Eliminar';
                    eliminarBtn.textContent = 'Eliminar';
                    eliminarBtn.addEventListener('click', function () {
                        confirmarEliminar(params.data.id);
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
    gridApi = agGrid.createGrid(myGridElement, gridOptions);

    gridApi.setGridOption('rowData', await getData());
    gridApi.setGridOption('loading', false);
}

initialiceTable();

function showExpedient(uuid) {
    const url = new URL('/expedientes/descargar', window.location.origin);
    url.searchParams.append('uuid', uuid);
    window.open(url.toString(), '_blank');
}

function onBtExport() {
    // gridApi.exportDataAsCsv();
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
        filteredData.push(node.data);
    });

    console.log('Datos filtrados:', filteredData);
}

function exportToExcel() {
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
        filteredData.push(node.data);
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Calcular ancho de cada columna
    const columnWidths = Object.keys(filteredData[0]).map(key => {
        const maxLength = Math.max(
            key.length,
            ...filteredData.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxLength + 2 }; // +2 de margen
    });

    worksheet['!cols'] = columnWidths;

    const dateKeys = ['created_at', 'updated_at'];
    const headerKeys = Object.keys(filteredData[0]);

    // Recorremos las filas
    filteredData.forEach((row, rowIndex) => {
        dateKeys.forEach((key) => {
            const colIndex = headerKeys.indexOf(key);
            const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex + 1 }); // +1 por encabezado
            const isoDate = new Date(row[key]);
            worksheet[cellAddress] = {
                t: 'd',         // tipo date
                v: isoDate,     // valor tipo Date
                z: 'yyyy-mm-dd hh:mm:ss' // formato
            };
        });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expedientes");

    XLSX.writeFile(workbook, "expedientes.xlsx");
}

function printData() {
    const filteredData = [];
    gridApi.forEachNodeAfterFilter((node) => {
        filteredData.push(node.data);
    });

    printJS({
        printable: filteredData,
        properties: ['id', 'expedient_number', 'name', 'state', 'created_at'],
        type: 'json',
        header: 'Lista de Expedientes'
    });
}

function resetFilters() {
    gridApi.setFilterModel(null); // elimina todos los filtros
    gridApi.onFilterChanged();    // aplica el cambio
}


/**FOR DARK MODE */
window.addEventListener('theme-changed', (e) => {
    const isDark = e.detail.isDark;
    const newTheme = agGrid.themeQuartz.withPart(
        isDark ? agGrid.colorSchemeDarkWarm : agGrid.colorSchemeLightWarm
    );

    gridApi.setGridOption('theme', newTheme);
    // recrear AG Grid o actualizarlo como necesites
    // recreateGridWithTheme(newTheme); // tu función para reiniciar el grid

    console.log(isDark);
});

async function confirmarEliminar(id) {
    const acceptDelete = confirm("¿Estás seguro de que quieres eliminar este expediente?");
    
    if (acceptDelete) {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('/expedientes/eliminar', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json'
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                refreshTable();
            }
            
        } else {
            console.error(result);
        }
    }
}

async function refreshTable() {
    gridApi.setGridOption('loading', true);
    gridApi.setGridOption('rowData', await getData());
    gridApi.setGridOption('loading', false);
}