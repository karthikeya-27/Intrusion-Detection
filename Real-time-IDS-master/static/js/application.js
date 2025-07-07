// Initialize Socket.IO connection
const socket = io('/test');

// Chart configuration
let trafficChart;
let flowCounts = {
    total: 0,
    benign: 0,
    suspicious: 0,
    malicious: 0
};

// Initialize the traffic chart
function initTrafficChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    trafficChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Traffic by IP',
                data: [],
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: '#3498db',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update flow counts
function updateFlowCounts(classification) {
    flowCounts.total++;
    switch(classification) {
        case 'Benign':
            flowCounts.benign++;
            break;
        case 'DDoS':
        case 'DoS':
        case 'Botnet':
            flowCounts.malicious++;
            break;
        default:
            flowCounts.suspicious++;
    }
    
    document.getElementById('total-flows').textContent = flowCounts.total;
    document.getElementById('benign-count').textContent = flowCounts.benign;
    document.getElementById('suspicious-count').textContent = flowCounts.suspicious;
    document.getElementById('malicious-count').textContent = flowCounts.malicious;
    document.getElementById('flow-count').textContent = `Flows: ${flowCounts.total}`;
}

// Add new flow to the table
function addFlowToTable(flowData) {
    const tbody = document.getElementById('flows-body');
    const row = document.createElement('tr');
    row.className = 'fade-in';
    
    // Determine risk level class
    let riskClass = 'risk-low';
    const riskLevel = flowData[flowData.length - 1];
    if (riskLevel.includes('High')) {
        riskClass = 'risk-high';
    } else if (riskLevel.includes('Medium')) {
        riskClass = 'risk-medium';
    }
    
    row.innerHTML = `
        <td>${flowData[0]}</td>
        <td>${flowData[1]}</td>
        <td>${flowData[2]}</td>
        <td>${flowData[3]}</td>
        <td>${flowData[4]}</td>
        <td>${flowData[5]}</td>
        <td>${flowData[6]}</td>
        <td>${flowData[7]}</td>
        <td>${flowData[8]}</td>
        <td>${flowData[9]}</td>
        <td>${flowData[flowData.length - 3]}</td>
        <td>${(flowData[flowData.length - 2] * 100).toFixed(1)}%</td>
        <td class="${riskClass}">${riskLevel}</td>
        <td>
            <a href="/flow-detail?flow_id=${flowData[0]}" class="btn btn-sm btn-primary">
                <i class="fas fa-search me-1"></i>Details
            </a>
        </td>
    `;
    
    tbody.insertBefore(row, tbody.firstChild);
    
    // Keep only the last 100 rows
    if (tbody.children.length > 100) {
        tbody.removeChild(tbody.lastChild);
    }
}

// Update chart with new data
function updateChart(ipData) {
    const chart = trafficChart;
    
    // Update chart with IP data
    chart.data.labels = ipData.map(ip => ip.SourceIP);
    chart.data.datasets[0].data = ipData.map(ip => ip.count);
    
    chart.update('none');
}

// Handle socket events
socket.on('connect', () => {
    document.getElementById('connection-status').className = 'badge bg-success me-2';
    document.getElementById('connection-status').innerHTML = '<i class="fas fa-circle me-1"></i>Connected';
});

socket.on('disconnect', () => {
    document.getElementById('connection-status').className = 'badge bg-danger me-2';
    document.getElementById('connection-status').innerHTML = '<i class="fas fa-circle me-1"></i>Disconnected';
});

socket.on('newresult', (data) => {
    const result = data.result;
    updateFlowCounts(result[result.length - 3]);
    addFlowToTable(result);
    updateChart(data.ips);
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initTrafficChart();
    
    // Add loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('d-none');
        setTimeout(() => {
            loadingOverlay.classList.add('d-none');
        }, 1000);
    }
});



