let chartInstance = null; // Variable global para almacenar la instancia del gráfico. Esto permite destruir la gráfica anterior antes de crear una nueva, evitando que se superpongan.

 // Función que retorna el nombre de la moneda correspondiente según el valor seleccionado
const getCurrencyName = (currency) => {
    // Compara el valor de currency y devuelve el nombre y símbolo de la moneda
    if (currency === 'dolar') {
        return '$ (USD)';
    } else if (currency === 'euro') {
        return '€ (EUR)';
    } else if (currency === 'uf') {
        return 'UF'; // Unidad de Fomento
    }
    return ''; // Retorna una cadena vacía si no coincide con ninguna moneda
}

// Agrega un evento de escucha al botón de conversión
document.getElementById('convert-btn').addEventListener('click', async () => {
    // Obtiene el monto ingresado por el usuario
    const amount = document.getElementById('amount').value;

    // Valida que el monto sea un número mayor a cero
    if (amount <= 0) {
        document.getElementById('result').textContent = 'El monto debe ser un número mayor a cero "0".';
        return; // Si la validación falla, termina la función
    }

    // Obtiene la moneda seleccionada
    const currency = document.getElementById('currency').value;

    try {
        // Realiza una llamada a la API para obtener los datos de conversión
        const response = await fetch(`https://mindicador.cl/api`);
        const data = await response.json(); // Convierte la respuesta a formato JSON

        // Obtiene el tipo de cambio para la moneda seleccionada
        const exchangeRate = data[currency].valor;
        
        // Calcula el monto convertido y lo redondea a dos decimales
        const convertedAmount = (amount / exchangeRate).toFixed(2);
        
        // Obtiene el nombre de la moneda para mostrar en el resultado
        const currencyName = getCurrencyName(currency);

        // Muestra el resultado de la conversión en la interfaz
        document.getElementById('result').textContent = 
            `Resultado: ${convertedAmount} ${currencyName}`;

        // Llama a la función para renderizar la gráfica del historial de la moneda
        renderHistoryChart(currency);
        
        // Muestra el contenedor del gráfico en el DOM, que estaba oculto
        document.getElementById('history-container').style.display = 'block';
        
    } catch (error) {
        // Manejo de errores, muestra un mensaje en caso de que la llamada a la API falle
        document.getElementById('result').textContent = 
            'Error al obtener los datos. Intente nuevamente.';
    }
});

// Función para renderizar el gráfico del historial de una moneda
async function renderHistoryChart(currency) {
    try {
        // Realiza una llamada a la API para obtener el historial de la moneda seleccionada
        const response = await fetch(`https://mindicador.cl/api/${currency}`);
        const data = await response.json(); // Convierte la respuesta a formato JSON
        
        // Extrae las etiquetas (fechas) y valores del historial, limitándose a los últimos 10
        const labels = data.serie.slice(0, 10).map(item => item.fecha.slice(0, 10));
        const values = data.serie.slice(0, 10).map(item => item.valor);

        // Si existe una gráfica previa, la destruye para evitar superposición
        if (chartInstance !== null) {
            chartInstance.destroy();
        }

        // Obtiene el contexto del canvas para dibujar el gráfico
        const ctx = document.getElementById('historyChart').getContext('2d');
        // Crea una nueva instancia del gráfico
        chartInstance = new Chart(ctx, {
            type: 'line', // Tipo de gráfico (línea)
            data: {
                labels: labels, // Etiquetas del eje X (fechas)
                datasets: [{
                    label: `Historial de ${currency.toUpperCase()}`, // Etiqueta del conjunto de datos
                    data: values, // Datos del eje Y (valores)
                    borderColor: 'rgb(75, 192, 192)', // Color de la línea del gráfico
                    fill: false // No llenar el área debajo de la línea
                }]
            }
        });
        
    } catch (error) {
        // Manejo de errores, muestra un mensaje en la consola si hay un problema al obtener el historial
        console.error('Error al obtener el historial:', error);
    }
}


