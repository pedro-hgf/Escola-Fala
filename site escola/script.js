document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            if (mainNav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Report Form Functionality (only if on relatar.html) ---
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        const identifyRadios = document.querySelectorAll('input[name="identify"]');
        const identificationFields = document.getElementById('identificationFields');
        const whatsappMessageElement = document.getElementById('whatsappMessage');

        const toggleIdentificationFields = () => {
            if (document.getElementById('identifyYes').checked) {
                identificationFields.classList.remove('hidden');
                document.getElementById('reporterName').setAttribute('required', 'required');
                document.getElementById('contact').setAttribute('required', 'required');
            } else {
                identificationFields.classList.add('hidden');
                document.getElementById('reporterName').removeAttribute('required');
                document.getElementById('contact').removeAttribute('required');
            }
        };

        identifyRadios.forEach(radio => {
            radio.addEventListener('change', toggleIdentificationFields);
        });
        toggleIdentificationFields(); // Initial check

        reportForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Collect form data
            const tipoDiscrimination = document.getElementById('tipoDiscrimination').value;
            const description = document.getElementById('description').value;
            const approxDate = document.getElementById('approxDate').value;
            const location = document.getElementById('location').value;
            const identify = document.querySelector('input[name="identify"]:checked').value;
            const authorizePublication = document.getElementById('authorizePublication').checked;

            let reportText = `*Novo Relato de Discriminação - Fala, Estudante!*\n\n`;
            reportText += `*Tipo:* ${tipoDiscrimination}\n`;
            reportText += `*Descrição:* ${description}\n`;
            reportText += `*Data Aproximada:* ${approxDate || 'Não Informado'}\n`;
            reportText += `*Local:* ${location}\n`;

            if (identify === 'yes') {
                const reporterName = document.getElementById('reporterName').value;
                const studentClass = document.getElementById('class').value;
                const contact = document.getElementById('contact').value;
                reportText += `*Identificação:*\n`;
                reportText += `  - Nome: ${reporterName || 'Não Informado'}\n`;
                reportText += `  - Turma: ${studentClass || 'Não Informado'}\n`;
                reportText += `  - Contato: ${contact || 'Não Informado'}\n`;
            } else {
                reportText += `*Identificação:* Não, Relato Anônimo\n`;
            }

            reportText += `*Autoriza Publicação Anônima:* ${authorizePublication ? 'Sim' : 'Não'}\n\n`;
            reportText += `_Este relato foi enviado através do formulário "Fazer um Relato" do site Fala, Estudante!_`;

            // Encode the message for URL
            const encodedMessage = encodeURIComponent(reportText);

            // Replace 'YOUR_WHATSAPP_NUMBER' with the actual WhatsApp number (including country code, e.g., 55319XXXXXXXX)
            const whatsappNumber = '5531995460028'; // Exemplo: DDI 55, DDD 31, seu número

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            // Redirect to WhatsApp
            window.open(whatsappUrl, '_blank');

            // Show confirmation message
            whatsappMessageElement.classList.remove('hidden');

            // Optional: Clear form after submission
            // reportForm.reset();
            // toggleIdentificationFields(); // Reset visibility of identification fields
        });
    }

    // --- Reports Display and Filtering Functionality (only if on relatos.html) ---
    const reportsContainer = document.getElementById('reportsContainer');
    const filterTypeSelect = document.getElementById('filterType');
    const noReportsMessage = document.querySelector('.no-reports-message');
    const loadingMessage = document.querySelector('.loading-message');

    let allReports = []; // Store all fetched reports

    // Function to fetch reports (simulated from JSON)
    async function fetchReports() {
        if (!reportsContainer) return; // Exit if not on reports page

        loadingMessage.classList.remove('hidden');
        noReportsMessage.classList.add('hidden');
        reportsContainer.innerHTML = ''; // Clear previous content

        try {
            // In a real application, this would be an API call to your backend
            // For now, we'll simulate with a local JSON file or hardcoded data
            const response = await fetch('data/reports.json'); // Assume a data/reports.json file exists
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allReports = await response.json();
            displayReports(allReports);
        } catch (error) {
            console.error('Erro ao carregar relatos:', error);
            reportsContainer.innerHTML = '<p class="no-reports-message">Erro ao carregar relatos. Tente novamente mais tarde.</p>';
            loadingMessage.classList.add('hidden');
            noReportsMessage.classList.remove('hidden'); // Show an error message
        }
    }

    // Function to display reports
    function displayReports(reportsToDisplay) {
        reportsContainer.innerHTML = ''; // Clear current reports
        loadingMessage.classList.add('hidden');

        if (reportsToDisplay.length === 0) {
            noReportsMessage.classList.remove('hidden');
        } else {
            noReportsMessage.classList.add('hidden');
            reportsToDisplay.forEach(report => {
                const reportCard = document.createElement('div');
                reportCard.classList.add('report-card');
                reportCard.setAttribute('data-type', report.type); // For filtering

                const dateDisplay = report.approxDate ? new Date(report.approxDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Data não informada';

                // Basic sanitization for display
                const safeDescription = report.description ? report.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Sem descrição.';
                const safeLocation = report.location ? report.location.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Local não informado.';

                reportCard.innerHTML = `
                    <h3>${report.type.replace(/_/, ' ')}</h3>
                    <p>${safeDescription}</p>
                    <div class="report-meta">
                        <p><strong>Local:</strong> ${safeLocation}</p>
                        <p><strong>Data:</strong> ${dateDisplay}</p>
                        <p><strong>Identificação:</strong> Anônimo</p>
                    </div>
                `;
                // Add media if available (simplified for display)
                if (report.evidenceUrl) {
                    const mediaType = report.evidenceUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : 'video';
                    if (mediaType === 'image') {
                        reportCard.innerHTML += `<img src="${report.evidenceUrl}" alt="Evidência" style="max-width: 100%; height: auto; margin-top: 15px; border-radius: 4px;">`;
                    } else if (mediaType === 'video') {
                        reportCard.innerHTML += `<video controls src="${report.evidenceUrl}" style="max-width: 100%; height: auto; margin-top: 15px; border-radius: 4px;"></video>`;
                    }
                }
                reportsContainer.appendChild(reportCard);
            });
        }
    }

    // Function to filter reports
    function filterReports() {
        const selectedType = filterTypeSelect.value;
        let filtered = [];

        if (selectedType === 'all') {
            filtered = allReports;
        } else {
            filtered = allReports.filter(report => report.type === selectedType);
        }
        displayReports(filtered);
    }

    // Add event listener for filter dropdown
    if (filterTypeSelect) {
        filterTypeSelect.addEventListener('change', filterReports);
        fetchReports(); // Fetch reports when the page loads
    }
});
