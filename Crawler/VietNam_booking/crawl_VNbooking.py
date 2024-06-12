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
#HCM-HN
#url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=SGN&Destination=HAN&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'

#HCM-DN
# url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=SGN&Destination=DAD&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'

#HCM-PQ
#url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=SGN&Destination=PQC&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'

#HN-HCM
#url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=HAN&Destination=SGN&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'

#HN-DN
#url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=HAN&Destination=DAD&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'

#HN-PQ
url = 'https://www.vietnambooking.com/flightsearch?Itinerary=Oneway&Departure=HAN&Destination=PQC&DepartureDate=07072024&ReturnDate=&Adult=1&Child=0&Infant=0'


driver.get(url)

# Đợi cho đến khi các phần tử cần thiết xuất hiện
wait = WebDriverWait(driver, 20)
wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'item-flight')))

# Tìm các phần tử chứa thông tin vé máy bay
flights = driver.find_elements(By.CLASS_NAME, 'item-flight')

# Đường dẫn lưu file CSV và Excel
file_path_csv = 'HN-PQ_07-07-2024.csv'
file_path_excel = 'HN-PQ_07-07-2024.xlsx'

# Mở file CSV để lưu dữ liệu
with open(file_path_csv, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['Địa điểm khởi hành', 'Địa điểm đến', 'Hãng hàng không', 'Số hiệu chuyến bay', 'Ngày khởi hành', 'Giờ khởi hành', 'Giờ đến', 'Thời gian bay', 'Giá', 'Hạng vé'])
    # Duyệt qua các phần tử và lấy thông tin
    for flight in flights:
        try:
            departure_location = flight.find_element(By.CLASS_NAME, 'box-place-depart').text.strip()
            arrival_location = flight.find_element(By.CLASS_NAME, 'box-place-return').text.strip()
            flight_number = flight.find_element(By.CSS_SELECTOR, '.box-logo span').text.strip()
            departure_time = flight.find_element(By.CLASS_NAME, 'time-start').text.strip()
            arrival_time = flight.find_element(By.CLASS_NAME, 'time-end').text.strip()
            flight_duration = flight.find_element(By.CLASS_NAME, 'total-time').text.strip()

            # Thu thập ngày khởi hành
            try:
                departure_date_element = flight.find_element(By.CLASS_NAME, 'box-date.type-depart')
                departure_date = departure_date_element.get_attribute('innerText').strip()
            except:
                departure_date = "N/A"

            # Thu thập hạng vé
            try:
                ticket_class = flight.find_element(By.CSS_SELECTOR, '.type-ticket').text.strip()
            except:
                ticket_class = "N/A"
                
            # Thu thập giá vé
            try:
                price = flight.find_element(By.CLASS_NAME, 'price-show').text.strip()
            except:
                price = "N/A"

            # Thu thập tên hãng bay
            try:
                airline = flight.find_element(By.CSS_SELECTOR, '.box-logo img').get_attribute('alt').strip()
            except:
                airline = "N/A"

            # Ghi dữ liệu vào file CSV
            writer.writerow([departure_location, arrival_location, airline, flight_number, departure_date, departure_time, arrival_time, flight_duration, price, ticket_class])
        except Exception as e:
            print(f"Error processing flight: {e}")

print('Data saved to flights.csv')

# Đóng trình duyệt
driver.quit()

# Đọc file CSV
df = pd.read_csv(file_path_csv)

# Sắp xếp lại thứ tự các cột
columns_order = ['Địa điểm khởi hành', 'Địa điểm đến', 'Hãng hàng không', 'Số hiệu chuyến bay', 'Ngày khởi hành', 'Giờ khởi hành', 'Giờ đến', 'Thời gian bay', 'Giá', 'Hạng vé']
df = df[columns_order]

# Lưu dữ liệu vào file Excel
df.to_excel(file_path_excel, index=False)

# Hiển thị nội dung file CSV
print(df)
