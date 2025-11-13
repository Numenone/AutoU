document.addEventListener('DOMContentLoaded', () => {
    
    // --- Seletores do DOM ---
    const form = document.getElementById('email-form');
    const submitButton = document.getElementById('submit-button');
    const emailTextInput = document.getElementById('email-text');
    const emailFileInput = document.getElementById('email-file');
    
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    
    const resultCategory = document.getElementById('result-category');
    const resultResponse = document.getElementById('result-response');

    const tiltContainer = document.getElementById('tilt-container');
    const tiltWrapper = document.getElementById('tilt-wrapper');
    const recipientEmailInput = document.getElementById('recipient-email');
    const sendEmailButton = document.getElementById('send-email-button');

    // Tema
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-toggle-light-icon');
    const moonIcon = document.getElementById('theme-toggle-dark-icon');

    // Abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('#main-card-content .tab-panel');
    
    // Dashboard
    const dashboardLoading = document.getElementById('dashboard-loading');
    const dashboardContent = document.getElementById('dashboard-content');
    const sentCountKPI = document.getElementById('sent-count-kpi');
    const sendStatus = document.getElementById('send-status');

    // --- Lógica dos Gráficos (variáveis globais para o script) ---
    let chartsInitialized = false;
    let chartInstances = [];

    // --- Lógica do Tema (Dark/Light) ---
    if (themeToggleButton && sunIcon && moonIcon) {
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
            if (chartsInitialized) {
                destroyCharts();
                loadDashboardData();
            }
        };

        themeToggleButton.addEventListener('click', () => {
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }

    // --- Lógica das Abas ---
    if (tabButtons.length && tabPanels.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                tabButtons.forEach(btn => {
                    btn.classList.toggle('tab-active', btn === button);
                    btn.classList.toggle('tab-inactive', btn !== button);
                });

                tabPanels.forEach(panel => {
                    panel.classList.toggle('hidden', panel.getAttribute('data-panel') !== targetTab);
                });

                if (targetTab === 'dashboard' && !chartsInitialized) {
                    loadDashboardData();
                }
            });
        });
    }

    // --- Lógica do Efeito Tilt (CORRIGIDA) ---
    if (tiltContainer && tiltWrapper) {
        const MAX_ROTATION = 4;
        tiltContainer.addEventListener('mousemove', (e) => {
            const rect = tiltContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const normalizedX = (x / rect.width) - 0.5;
            const normalizedY = (y / rect.height) - 0.5;
            const rotateY = normalizedX * 2 * MAX_ROTATION;
            const rotateX = -normalizedY * 2 * MAX_ROTATION;
            
            tiltWrapper.style.transition = 'transform 0.05s ease-out';
            tiltWrapper.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });

        tiltContainer.addEventListener('mouseleave', () => {
            tiltWrapper.style.transition = 'transform 0.3s ease-in-out';
            tiltWrapper.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }

    // --- Lógica do Formulário (Classificar) ---
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const text = emailTextInput.value;
            const file = emailFileInput.files[0];
            if (!text && !file) {
                displayError('Por favor, cole um texto ou envie um arquivo.');
                return;
            }

            const formData = new FormData();
            formData.append('email_text', text);
            if (file) { formData.append('email_file', file); }

            submitButton.disabled = true;
            loadingDiv.classList.remove('hidden');
            resultContainer.classList.add('hidden');
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('/classify', { method: 'POST', body: formData });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Ocorreu um erro no servidor.');
                displayResults(data);
                
                if (chartsInitialized) {
                    destroyCharts();
                    loadDashboardData();
                }
            } catch (error) {
                displayError(error.message);
            } finally {
                submitButton.disabled = false;
                loadingDiv.classList.add('hidden');
                emailTextInput.value = '';
                emailFileInput.value = null;
            }
        });
    }
    
    // --- Lógica de Envio de Email (SMTP) ---
    if (sendEmailButton) {
        sendEmailButton.addEventListener('click', async () => {
            const recipient = recipientEmailInput.value;
            const body = resultResponse.textContent;

            if (!recipient) {
                setSendStatus('Por favor, insira o email do destinatário.', 'error');
                return;
            }

            setSendStatus('Enviando...', 'sending');
            sendEmailButton.disabled = true;

            try {
                const response = await fetch('/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipient, body })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Ocorreu uma falha no servidor.');
                }

                setSendStatus('Email enviado com sucesso!', 'success');
                
                // Atualiza o dashboard se ele já foi inicializado
                if (chartsInitialized) {
                    destroyCharts();
                    loadDashboardData();
                }

            } catch (error) {
                setSendStatus(error.message, 'error');
            } finally {
                sendEmailButton.disabled = false;
            }
        });
    }

    /** Exibe os resultados na tela */
    function displayResults(data) {
        const { categoria, resposta_sugerida } = data;

        const baseClasses = ['inline-block', 'px-3', 'py-1', 'text-sm', 'font-semibold', 'rounded-full', 'shadow-md', 'backdrop-filter', 'backdrop-blur-sm'];
        const produtivoClasses = [...baseClasses, 'bg-green-600/30', 'text-green-900', 'dark:text-green-200', 'border', 'border-green-500/50'];
        const improdutivoClasses = [...baseClasses, 'bg-yellow-600/30', 'text-yellow-900', 'dark:text-yellow-200', 'border', 'border-yellow-500/50'];
        const erroClasses = [...baseClasses, 'bg-red-600/30', 'text-red-900', 'dark:text-red-200', 'border', 'border-red-500/50'];

        resultCategory.className = '';
        if (categoria.toLowerCase() === 'produtivo') resultCategory.classList.add(...produtivoClasses);
        else if (categoria.toLowerCase() === 'improdutivo') resultCategory.classList.add(...improdutivoClasses);
        else resultCategory.classList.add(...erroClasses);

        resultCategory.textContent = categoria;
        resultResponse.textContent = resposta_sugerida;
        
        resultContainer.classList.remove('hidden');
    }

    /** Define a mensagem de status do envio de email */
    function setSendStatus(message, type) {
        if (!sendStatus) return;
        
        sendStatus.textContent = message;
        sendStatus.className = 'text-sm text-center mt-2 h-4'; // Reset classes
        
        switch (type) {
            case 'success':
                sendStatus.classList.add('text-green-500');
                break;
            case 'error':
                sendStatus.classList.add('text-red-500');
                break;
            case 'sending':
                sendStatus.classList.add('text-blue-500');
                break;
        }
        
        // Limpa a mensagem após alguns segundos
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                sendStatus.textContent = '';
                sendStatus.className = 'text-sm text-center mt-2 h-4';
            }, 4000);
        }
    }

    /** Exibe uma mensagem de erro na tela */
    function displayError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        if (resultContainer) {
            resultContainer.classList.add('hidden');
        }
    }

    /** Busca dados da API e chama a criação dos gráficos */
    async function loadDashboardData() {
        if (!dashboardLoading || !dashboardContent) return;
        
        dashboardLoading.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
        chartsInitialized = false;

        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Falha ao buscar estatísticas.');
            
            const data = await response.json();
            
            destroyCharts();
            createCharts(data);
            
            dashboardLoading.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
            chartsInitialized = true;
            
        } catch (err) {
            console.error(err);
            dashboardLoading.innerHTML = `<p class="text-red-400">Erro ao carregar dados do dashboard.</p>`;
        }
    }

    /** Destrói instâncias de gráficos antigos */
    function destroyCharts() {
        chartInstances.forEach(chart => chart.destroy());
        chartInstances = [];
    }

    /** Cria os gráficos com base nos dados REAIS vindos da API */
    function createCharts(data) {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não foi carregado.');
            return;
        }
        const isDarkMode = document.documentElement.classList.contains('dark');
        // Use pure white and black for chart text as requested
        const chartTextColor = isDarkMode ? '#FFFFFF' : '#000000';
        const chartGridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        Chart.defaults.color = chartTextColor;
        Chart.defaults.borderColor = chartGridColor;

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false, // Fix for resize bug in hidden tabs
        };

        const ctxCategoria = document.getElementById('chart-categoria')?.getContext('2d');
        if (ctxCategoria) {
            chartInstances.push(new Chart(ctxCategoria, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.categories),
                    datasets: [{
                        data: Object.values(data.categories),
                        backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'],
                        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)'],
                        borderWidth: 1
                    }]
                },
                options: { ...commonOptions, plugins: { legend: { position: 'top' } } }
            }));
        }
        
        const ctxMes = document.getElementById('chart-mes')?.getContext('2d');
        if (ctxMes) {
            chartInstances.push(new Chart(ctxMes, {
                type: 'line',
                data: {
                    labels: Object.keys(data.monthly),
                    datasets: [{
                        label: 'Emails Verificados',
                        data: Object.values(data.monthly),
                        fill: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        tension: 0.3
                    }]
                },
                options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }));
        }
        
        const ctxDia = document.getElementById('chart-dia')?.getContext('2d');
        if (ctxDia) {
            chartInstances.push(new Chart(ctxDia, {
                type: 'bar',
                data: {
                    labels: Object.keys(data.daily),
                    datasets: [{
                        label: 'Média Diária',
                        data: Object.values(data.daily),
                        backgroundColor: 'rgba(139, 92, 246, 0.5)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: { ...commonOptions, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            }));
        }
        
        if (sentCountKPI) {
            sentCountKPI.textContent = data.sent_count;
        }
    }
});