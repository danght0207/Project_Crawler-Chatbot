document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const flightDataBody = document.getElementById('flight-data');
    const flightTable = document.getElementById('flight-table');
    const loadingBarContainer = document.querySelector('.loading-bar-container');
    const loadingBar = document.getElementById('loading-bar');
    const filterOptions = document.querySelector('.filter-options');
    const filterAirline = document.getElementById('filter-airline');
    const filterTime = document.getElementById('filter-time');
    const filterClass = document.getElementById('filter-class');
    const filterPrice = document.getElementById('filter-price');
    const filterBtn = document.getElementById('filter-btn');

    let flightsData = []; // Biến để lưu dữ liệu chuyến bay tìm kiếm được

    const locations = ['Hồ Chí Minh', 'Hà Nội', 'Địa điểm khác']; // Địa điểm có thể mở rộng thêm
    const timeSlots = ["00:00 - 06:00", "06:00 - 12:00", "12:00 - 18:00", "18:00 - 00:00"]; // Các khung giờ

    // Tạo thêm dòng chữ dưới thanh loading
    const loadingText = document.createElement('div');
    loadingText.style.textAlign = 'center';
    loadingText.style.marginTop = '5px';
    loadingText.style.fontWeight = 'bold';
    loadingText.id = 'loading-text';  // Thêm id để xác định

    // Xóa bất kỳ loading text nào trước khi thêm mới
    const existingLoadingText = document.getElementById('loading-text');
    if (existingLoadingText) {
        existingLoadingText.remove();
    }

    loadingText.innerText = "Vui lòng chờ trong giây lát... 0%";
    loadingBarContainer.appendChild(loadingText);

    // Ẩn bảng kết quả ban đầu
    flightTable.style.display = 'none';

    searchBtn.addEventListener('click', async function () {
        const departure = document.getElementById('departure').value;
        const arrival = document.getElementById('arrival').value;
        const date = document.getElementById('date').value;

        // Kiểm tra điểm đi và điểm đến
        if (departure === arrival) {
            alert("Vui lòng chọn địa điểm khởi hành và địa điểm đến hợp lệ.");
            return;
        }

        // Kiểm tra ngày tháng
        const now = new Date();
        const dateObj = new Date(date);

        if (date && dateObj < now) {
            alert("Vui lòng chọn ngày hợp lệ.");
            return;
        }

        // Chuyển đổi định dạng ngày thành ngày/tháng/năm
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

        // Hiển thị thanh loading và bắt đầu hiệu ứng
        loadingBarContainer.style.visibility = 'visible';
        loadingBar.style.width = '0';
        loadingText.innerText = "Vui lòng chờ trong giây lát... 0%";

        // Thanh loading từ 0% đến 100%
        let loadingPercentage = 0;
        const loadingInterval = setInterval(() => {
            loadingPercentage += 1;
            loadingBar.style.width = `${loadingPercentage}%`;
            loadingText.innerText = `Vui lòng chờ trong giây lát... ${loadingPercentage}%`;
            if (loadingPercentage >= 100) {
                clearInterval(loadingInterval);
            }
        }, 30);

        // Chờ thời gian tải thực tế
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    departure,
                    arrival,
                    date: formattedDate
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            flightsData = await response.json();
            console.log(`Flights data: ${JSON.stringify(flightsData, null, 2)}`);

            // Ẩn thanh loading và reset hiệu ứng
            loadingBarContainer.style.visibility = 'hidden';
            loadingBar.style.width = '0';
            loadingText.innerText = "Vui lòng chờ trong giây lát... 0%";

            // Hiển thị kết quả sau khi tải xong
            displayFlights(flightsData);
            filterOptions.style.display = 'flex';
        } catch (error) {
            alert("Có lỗi xảy ra khi tìm kiếm chuyến bay.");
            console.error(error);
        }
    });

    function displayFlights(flights) {
        flightDataBody.innerHTML = ''; // Xóa kết quả cũ

        if (flights.length === 0) {
            alert("Không tìm thấy chuyến bay nào phù hợp.");
            flightTable.style.display = 'none';
            return;
        }

        flights.forEach(flight => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${flight['Địa điểm khởi hành']}</td>
                <td>${flight['Địa điểm đến']}</td>
                <td>${flight['Hãng hàng không']}</td>
                <td>${flight['Số hiệu chuyến bay']}</td>
                <td>${flight['Ngày khởi hành']}</td>
                <td>${flight['Giờ khởi hành']}</td>
                <td>${flight['Giờ đến']}</td>
                <td>${flight['Thời gian bay']}</td>
                <td>${flight['Giá']}</td>
                <td>${flight['Hạng vé']}</td>
            `;
            flightDataBody.appendChild(row);
        });

        flightTable.style.display = 'table'; // Hiển thị bảng kết quả
    }

    function filterFlights() {
        const airline = filterAirline.value;
        const timeSlot = filterTime.value;
        const ticketClass = filterClass.value;
        const priceOrder = filterPrice.value;

        let filteredFlights = flightsData;

        if (airline) {
            filteredFlights = filteredFlights.filter(flight => flight['Hãng hàng không'] === airline);
        }

        if (timeSlot) {
            const [start, end] = timeSlot.split('-').map(t => t.trim());
            filteredFlights = filteredFlights.filter(flight => {
                const flightTime = flight['Giờ khởi hành'];
                return flightTime >= start && flightTime <= end;
            });
        }

        if (ticketClass) {
            filteredFlights = filteredFlights.filter(flight => flight['Hạng vé'] === ticketClass);
        }

        if (priceOrder === 'asc') {
            filteredFlights.sort((a, b) => parseFloat(a['Giá'].replace(/[^0-9.-]+/g, "")) - parseFloat(b['Giá'].replace(/[^0-9.-]+/g, "")));
        } else if (priceOrder === 'desc') {
            filteredFlights.sort((a, b) => parseFloat(b['Giá'].replace(/[^0-9.-]+/g, "")) - parseFloat(a['Giá'].replace(/[^0-9.-]+/g, "")));
        }

        displayFlights(filteredFlights);
    }

    filterBtn.addEventListener('click', filterFlights);
});
