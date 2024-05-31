// Obtén los elementos del DOM
const paymentForm = document.getElementById('paymentForm');
const paymentsTableBody = document.getElementById('paymentsTable').querySelector('tbody');
const totalIncome = document.getElementById('totalIncome');

// Inicializa el total de ingresos desde localStorage (si existe)
let total = parseFloat(localStorage.getItem('totalIncome')) || 0;
totalIncome.textContent = total.toFixed(2);

// Recupera los datos de pagos desde localStorage (si existen)
let parsedPayments = JSON.parse(localStorage.getItem('paymentsData')) || [];

// Función para guardar los datos en localStorage
function savePaymentsToLocalStorage() {
    localStorage.setItem('paymentsData', JSON.stringify(parsedPayments));
    localStorage.setItem('totalIncome', total.toFixed(2));
}

// Función para agregar una fila a la tabla
function addRowToTable(payment) {
    const newRow = paymentsTableBody.insertRow();
    newRow.setAttribute('data-payment-id', payment.paymentId);

    const faltaPago = getFaltaPago(payment.paymentType, payment.paymentDate);
    newRow.innerHTML = `
        <td>${payment.name}</td>
        <td>${payment.paymentType === 'Mensual' ? payment.amount : 0}</td>
        <td>${payment.paymentType === 'Semanal' ? payment.amount : 0}</td>
        <td class="${faltaPago ? 'falta-pago' : ''}">${faltaPago ? 'No' : 'Sí'}</td>
        <td><button class="delete-btn" data-payment-id="${payment.paymentId}">Eliminar</button></td>
    `;
}

// Función para actualizar la tabla completa
function updateTable() {
    paymentsTableBody.innerHTML = ''; // Limpia el contenido previo
    parsedPayments.forEach(addRowToTable); // Agrega filas desde los datos guardados
}

// Al cargar la página, crea los botones "Eliminar" para las filas existentes
updateTable();

// Función para agregar un pago
function addPayment(name, paymentType, amount, paymentDate) {
    const existingPayment = parsedPayments.find((payment) => payment.name === name);
    if (existingPayment) {
        // Si existe, actualiza el pago
        total -= existingPayment.paymentType === 'Mensual' ? existingPayment.amount : existingPayment.amount;
        existingPayment.paymentType = paymentType;
        existingPayment.amount = amount;
        existingPayment.paymentDate = paymentDate;
        total += paymentType === 'Mensual' ? amount : amount;
    } else {
        // Si no existe, agrega un nuevo pago
        const newPayment = {
            paymentId: Date.now(),
            name,
            paymentType,
            amount,
            paymentDate,
        };
        parsedPayments.push(newPayment);
        addRowToTable(newPayment);
        total += paymentType === 'Mensual' ? amount : amount;
    }

    totalIncome.textContent = total.toFixed(2);
    savePaymentsToLocalStorage();
    paymentForm.reset();
}

// Función para determinar si falta el pago
function getFaltaPago(paymentType, paymentDate) {
    const now = new Date();
    const paymentDueDate = new Date(paymentDate);
    if (paymentType === 'Mensual') {
        paymentDueDate.setMonth(paymentDueDate.getMonth() + 1);
    } else if (paymentType === 'Semanal') {
        paymentDueDate.setDate(paymentDueDate.getDate() + 7);
    }
    return now > paymentDueDate;
}

// Manejador de eventos para el formulario
paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const paymentType = document.getElementById('paymentType').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    addPayment(name, paymentType, amount, paymentDate);
    updateTable();
});

// Manejador de eventos para el botón "Eliminar"
paymentsTableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const paymentId = parseInt(event.target.getAttribute('data-payment-id'));
        const paymentToDelete = parsedPayments.find(payment => payment.paymentId === paymentId);

        // Elimina el pago de los datos guardados y actualiza localStorage
        parsedPayments = parsedPayments.filter(payment => payment.paymentId !== paymentId);
        savePaymentsToLocalStorage();

        // Elimina la fila de la tabla
        event.target.closest('tr').remove();
    }
});

// Función para borrar todos los datos de localStorage
function clearLocalStorage() {
    localStorage.removeItem('paymentsData');
    localStorage.removeItem('totalIncome');
    parsedPayments = [];
    total = 0;
    totalIncome.textContent = total.toFixed(2);
    updateTable();
}

// Botón para borrar todos los datos
const clearBtn = document.createElement('button');
clearBtn.textContent = 'Borrar Todos los Datos';
clearBtn.addEventListener('click', clearLocalStorage);
document.body.appendChild(clearBtn);


