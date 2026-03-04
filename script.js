document.addEventListener("DOMContentLoaded", function () {
    const url = "https://io.adafruit.com/api/v2/CyCPollutionMonitor/feeds/testfeed/data";

    let jsonData = []; // Store fetched data

    // --------------------------
    // Setup: Date picker defaults to today
    // --------------------------
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("dateFilter");
    dateInput.value = today;
    dateInput.max = today;

    // --------------------------
    // Fetch JSON data
    // --------------------------
    fetch(url)
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            applyFilter(); // Load today's data on page load
        })
        .catch(error => {
            document.getElementById("data").innerHTML =
                "<p class='text-danger'>Failed to load data.</p>";
            console.error("Error fetching JSON:", error);
        });

    // --------------------------
    // Button listener
    // --------------------------
    document.getElementById("filterBtn").addEventListener("click", applyFilter);

    // --------------------------
    // Apply filter & sorting
    // --------------------------
    function applyFilter() {
        const selectedDate = dateInput.value;

        // Get sort order value from radio buttons
        const sortType = document.querySelector('input[name="sortOrder"]:checked').value;

        // Filter by date
        let filtered = jsonData.filter(item => {
            const d = new Date(item.created_at);
            return d.toISOString().split("T")[0] === selectedDate;
        });

        // Sort by ascending or descending
        filtered.sort((a, b) => {
            const da = new Date(a.created_at);
            const db = new Date(b.created_at);
            return sortType === "asc" ? da - db : db - da;
        });

        displayTable(filtered);
        displayAverage(filtered, selectedDate);
    }

    // --------------------------
    // Display table
    // --------------------------
    function displayTable(dataList) {
        if (dataList.length === 0) {
            document.getElementById("data").innerHTML =
                "<p>No data for this date.</p>";
            return;
        }

        let table = `
            <table class="table table-striped mt-4">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
        `;

        dataList.forEach(entry => {
            const dt = new Date(entry.created_at);
            const date = dt.toLocaleDateString();
            const time = dt.toLocaleTimeString();

            table += `
                <tr>
                    <td>${date}</td>
                    <td>${time}</td>
                    <td>${entry.value}</td>
                </tr>
            `;
        });

        table += "</tbody></table>";
        document.getElementById("data").innerHTML = table;
    }

    // --------------------------
    // Display average value
    // --------------------------
    function displayAverage(list, selectedDate) {
        if (list.length === 0) {
            document.getElementById("averageResult").innerHTML =
                `No data found for <strong>${selectedDate}</strong>.`;
            return;
        }

        const sum = list.reduce((acc, item) => acc + Number(item.value), 0);
        const avg = (sum / list.length).toFixed(2);

        document.getElementById("averageResult").innerHTML =
            `Average for <strong>${selectedDate}</strong>: <strong>${avg}</strong>`;
    }
});