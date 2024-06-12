import csv
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Cấu hình Selenium và ChromeDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Chạy Chrome ở chế độ ẩn
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL của trang web bạn muốn crawl
url = 'https://www.vemaybay.vn/flight-result?request=SGNHAN01072024-1-0-0'
driver.get(url)

# Đợi cho đến khi các phần tử cần thiết xuất hiện
wait = WebDriverWait(driver, 20)
wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'ftl-flight-item')))

# Tìm các phần tử chứa thông tin vé máy bay
flights = driver.find_elements(By.CLASS_NAME, 'ftl-flight-item')

# Đường dẫn lưu file CSV và Excel
file_path_csv = 'flights_vemaybay.csv'
file_path_excel = 'flights_vemaybay.xlsx'

# Mở file CSV để lưu dữ liệu
with open(file_path_csv, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['Departure Location', 'Arrival Location', 'Airline', 'Flight Number', 'Departure Date', 'Departure Time', 'Arrival Time', 'Flight Duration', 'Price', 'Ticket Class'])

    # Duyệt qua các phần tử và lấy thông tin
    for flight in flights:
        try:
            airline = flight.find_element(By.CSS_SELECTOR, '.ftl-flight-info > li > p').text.strip()
            departure_location = flight.find_elements(By.CLASS_NAME, 'ftl-flight-city')[0].text.strip()
            arrival_location = flight.find_elements(By.CLASS_NAME, 'ftl-flight-city')[1].text.strip()
            flight_number = flight.find_element(By.CLASS_NAME, 'ftl-flight-numb').text.strip()
            departure_time = flight.find_elements(By.CLASS_NAME, 'ftl-flight-time')[0].text.strip()
            arrival_time = flight.find_elements(By.CLASS_NAME, 'ftl-flight-time')[1].text.strip()
            price = flight.find_element(By.CLASS_NAME, 'ftl-flight-price').text.strip().replace(' VND', '') + ' VND'

            # Mở chi tiết chuyến bay để thu thập thêm thông tin
            flight_detail_link = flight.find_element(By.CLASS_NAME, 'ftl-flight-detail')
            flight_detail_link.click()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'ftl-box-item-flight'))
            )
            details = flight.find_element(By.CLASS_NAME, 'ftl-box-item-flight')

            # Lấy ngày khởi hành và ngày đến
            departure_date = details.find_elements(By.TAG_NAME, 'b')[3].text.strip()
            arrival_date = details.find_elements(By.TAG_NAME, 'b')[7].text.strip()

            # Lấy thời gian bay và hạng vé
            flight_duration = details.find_elements(By.TAG_NAME, 'b')[9].text.strip()
            ticket_class = details.find_elements(By.TAG_NAME, 'b')[11].text.strip()

            # Ghi dữ liệu vào file CSV
            writer.writerow([departure_location, arrival_location, airline, flight_number, departure_date, departure_time, arrival_time, flight_duration, price, ticket_class])
        except Exception as e:
            print(f"Error processing flight: {e}")

print('Data saved to flights_vemaybay.csv')

# Đóng trình duyệt
driver.quit()

# Đọc file CSV
df = pd.read_csv(file_path_csv)

# Sắp xếp lại thứ tự các cột
columns_order = ['Departure Location', 'Arrival Location', 'Airline', 'Flight Number', 'Departure Date', 'Departure Time', 'Arrival Time', 'Flight Duration', 'Price', 'Ticket Class']
df = df[columns_order]

# Lưu dữ liệu vào file Excel
df.to_excel(file_path_excel, index=False)

# Hiển thị nội dung file CSV
print(df)
