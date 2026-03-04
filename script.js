document.addEventListener("DOMContentLoaded", function () {
    const url = "https://io.adafruit.com/api/v2/CyCPollutionMonitor/feeds/testfeed/data";

    let jsonData = []; // store data globally for filtering

    fetch(url)
        .then(response => response.json())
        .then(data => {
            jsonData = data; // save full dataset
            displayTable(jsonData); // show full list on load
        })
        .catch(error => {
            document.getElementById("data").innerHTML =
                "<p class='text-danger'>Failed to load data.</p>";
            console.error("Error fetching JSON:", error);
        });

    // Filter button click
    document.getElementById("filterBtn").addEventListener("click", () => {
        const selectedDate = document.getElementById("dateFilter").value;
        if (!selectedDate) return;

        const filtered = jsonData.filter(item => {
            const d = new Date(item.created_at);
            return d.toISOString().split("T")[0] === selectedDate;
        });

        displayTable(filtered);
        displayAverage(filtered, selectedDate);
    });

    // Display table function
    function displayTable(dataList) {
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
            const dateTime = new Date(entry.created_at);
            const date = dateTime.toLocaleDateString();
            const time = dateTime.toLocaleTimeString();

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

    // Display average function
    function displayAverage(list, selectedDate) {
        if (list.length === 0) {
            document.getElementById("averageResult").innerHTML =
                `No data found for <strong>${selectedDate}</strong>.`;
            return;
        }

        const sum = list.reduce((acc, item) => acc + Number(item.value), 0);
        const avg = (sum / list.length).toFixed(2);

        document.getElementById("averageResult").innerHTML =
            `Average Value for <strong>${selectedDate}</strong>: <strong>${avg}</strong>`;
    }
});
``