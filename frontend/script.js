async function analyzeWebsite() {

    const url = document.getElementById("urlInput").value.trim();
    const result = document.getElementById("result");

    if (url === "") {
        result.innerHTML = `
            <div class="error">
                Please enter a website URL.
            </div>
        `;
        return;
    }

    try {

        result.innerHTML = `
            <div class="spinner"></div>
            <h3 style="text-align:center;">Analyzing Website...</h3>
        `;

        const response = await fetch(
            `http://127.0.0.1:8000/analyze?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {

            const error = await response.json();

            result.innerHTML = `
                <div class="error">
                    ${error.detail}
                </div>
            `;

            return;
        }

        const data = await response.json();

        // ---------------- SEO SCORE ----------------

        let seoScore = 100;

        if (data.h1_count === 0)
            seoScore -= 20;

        if (
            data.meta_description === "No Meta Description Found" ||
            data.meta_description.trim() === ""
        )
            seoScore -= 20;

        seoScore -= data.images_without_alt * 2;

        if (data.response_time_ms > 1000)
            seoScore -= 10;

        if (seoScore < 0)
            seoScore = 0;

        // ---------------- RESULT ----------------

        result.innerHTML = `

        <div class="dashboard-top">

            <div class="score-card">

                <canvas id="seoChart"></canvas>

                <h2 id="seoScoreText">${seoScore}/100</h2>

                <p>SEO Score</p>

            </div>

            <div class="summary-card">

                <h2>Website Overview</h2>

                <p>Analysis completed successfully.</p>

                <p>
                    <strong>Status:</strong>
                    ${data.status_code}
                </p>

                <p>
                    <strong>Response Time:</strong>
                    ${data.response_time_ms} ms
                </p>

                <p>
                    <strong>Total Words:</strong>
                    ${data.word_count}
                </p>

            </div>

        </div>

        <h2 class="report-title">
            <i class="fa-solid fa-chart-column"></i>
            Website Analysis Report
        </h2>

        <div class="grid">

            <div class="card">
                <h3>
                    <i class="fa-solid fa-circle-check"></i>
                    Status Code
                </h3>
                <p>${data.status_code}</p>
            </div>

            <div class="card">
                <h3>
                    <i class="fa-solid fa-bolt"></i>
                    Response Time
                </h3>
                <p>${data.response_time_ms} ms</p>
            </div>

            <div class="card wide">
                <h3>
                    <i class="fa-solid fa-heading"></i>
                    Title
                </h3>
                <p>${data.title}</p>
            </div>

            <div class="card wide">
                <h3>
                    <i class="fa-solid fa-file-lines"></i>
                    Meta Description
                </h3>
                <p>${data.meta_description}</p>
            </div>

            <div class="card">
                <h3>
                    <i class="fa-solid fa-list"></i>
                    H1 Count
                </h3>
                <p>${data.h1_count}</p>
            </div>

            <div class="card">
                <h3>
                    <i class="fa-solid fa-image"></i>
                    Images Without ALT
                </h3>
                <p>${data.images_without_alt}</p>
            </div>

            <div class="card wide">
                <h3>
                    <i class="fa-solid fa-book"></i>
                    Word Count
                </h3>
                <p>${data.word_count}</p>
            </div>
            </div>

<div style="text-align:center; margin-top:30px;">

    <button class="download-btn" onclick="downloadReport()">
        <i class="fa-solid fa-download"></i>
        Download Report
    </button>

</div>

        </div>
        `;

        // ---------------- CHART ----------------

        const ctx = document.getElementById("seoChart");

        new Chart(ctx, {

            type: "doughnut",

            data: {

                datasets: [{

                    data: [
                        seoScore,
                        100 - seoScore
                    ],

                    backgroundColor: [
                        "#2563eb",
                        "#e5e7eb"
                    ],

                    borderWidth: 0

                }]
            },

            options: {

                cutout: "75%",

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {
                        enabled: false
                    }

                }

            }

        });

    }

    catch (error) {

        result.innerHTML = `
            <div class="error">
                Unable to connect to backend.
            </div>
        `;

    }

}

// ENTER KEY

document
.getElementById("urlInput")
.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        analyzeWebsite();

    }

});
async function downloadReport() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Page Pulse Report", 20, 20);

    doc.setFontSize(12);

    doc.text("Website Analysis Report",20,35);

    doc.text("Status Code : " +
    document.querySelectorAll(".card p")[0].innerText,20,50);

    doc.text("Response Time : " +
    document.querySelectorAll(".card p")[1].innerText,20,60);

    doc.text("Title : " +
    document.querySelectorAll(".card p")[2].innerText,20,70);

    doc.text("Meta Description : ",20,85);

    doc.text(
        document.querySelectorAll(".card p")[3].innerText,
        20,
        95,
        { maxWidth:170 }
    );

    doc.text("H1 Count : " +
    document.querySelectorAll(".card p")[4].innerText,20,125);

    doc.text("Images Without ALT : " +
    document.querySelectorAll(".card p")[5].innerText,20,135);

    doc.text("Word Count : " +
    document.querySelectorAll(".card p")[6].innerText,20,145);

    doc.save("PagePulse_Report.pdf");

}