const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

let flightsData = [];

const jsonFiles = [
    'data/HCM-HN_01-07-2024.json', 'data/HCM-HN_02-07-2024.json', 'data/HCM-HN_03-07-2024.json',
    'data/HCM-HN_04-07-2024.json', 'data/HCM-HN_05-07-2024.json', 'data/HCM-HN_06-07-2024.json',
    'data/HCM-HN_07-07-2024.json', 'data/HCM-DN_01-07-2024.json', 'data/HCM-DN_02-07-2024.json',
    'data/HCM-DN_03-07-2024.json', 'data/HCM-DN_04-07-2024.json', 'data/HCM-DN_05-07-2024.json',
    'data/HCM-DN_06-07-2024.json', 'data/HCM-DN_07-07-2024.json', 'data/HCM-PQ_01-07-2024.json',
    'data/HCM-PQ_02-07-2024.json', 'data/HCM-PQ_03-07-2024.json', 'data/HCM-PQ_04-07-2024.json',
    'data/HCM-PQ_05-07-2024.json', 'data/HCM-PQ_06-07-2024.json', 'data/HCM-PQ_07-07-2024.json',
    'data/HN-HCM_01-07-2024.json', 'data/HN-HCM_02-07-2024.json', 'data/HN-HCM_03-07-2024.json',
    'data/HN-HCM_04-07-2024.json', 'data/HN-HCM_05-07-2024.json', 'data/HN-HCM_06-07-2024.json',
    'data/HN-HCM_07-07-2024.json', 'data/HN-DN_01-07-2024.json', 'data/HN-DN_02-07-2024.json',
    'data/HN-DN_03-07-2024.json', 'data/HN-DN_04-07-2024.json', 'data/HN-DN_05-07-2024.json',
    'data/HN-DN_06-07-2024.json', 'data/HN-DN_07-07-2024.json', 'data/HN-PQ_01-07-2024.json',
    'data/HN-PQ_02-07-2024.json', 'data/HN-PQ_03-07-2024.json', 'data/HN-PQ_04-07-2024.json',
    'data/HN-PQ_05-07-2024.json', 'data/HN-PQ_06-07-2024.json', 'data/HN-PQ_07-07-2024.json'
    // ...other files
];

jsonFiles.forEach(file => {
    try {
        const data = fs.readFileSync(path.join(__dirname, file), 'utf8');
        flightsData = flightsData.concat(JSON.parse(data));
        console.log(`Flight data successfully loaded from ${file}.`);
    } catch (err) {
        console.error(`Error reading flight data from ${file}:`, err);
    }
});

console.log('Total flights data:', flightsData.length);

function convertDateFormat(date, inputFormat, outputFormat) {
    let day, month, year;
    if (inputFormat === 'DD/MM/YYYY') {
        [day, month, year] = date.split('/');
    } else if (inputFormat === 'YYYY-MM-DD') {
        [year, month, day] = date.split('-');
    }
    
    if (outputFormat === 'YYYY-MM-DD') {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (outputFormat === 'DD/MM/YYYY') {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
}

app.post('/search', (req, res) => {
    const { departure, arrival, date } = req.body;
    const convertedDate = convertDateFormat(date, 'DD/MM/YYYY', 'YYYY-MM-DD');

    console.log(`Search criteria: departure=${departure}, arrival=${arrival}, date=${convertedDate}`);

    const filteredFlights = flightsData.filter(flight => {
        const flightDate = convertDateFormat(flight['Ngày khởi hành'], 'DD/MM/YYYY', 'YYYY-MM-DD');
        console.log(`Comparing: flightDate=${flightDate} with convertedDate=${convertedDate}`);
        const matches = (!departure || flight['Địa điểm khởi hành'] === departure) &&
                        (!arrival || flight['Địa điểm đến'] === arrival) &&
                        (!date || flightDate === convertedDate);
        if (matches) {
            console.log(`Match found: ${JSON.stringify(flight)}`);
        }
        return matches;
    });

    console.log(`Filtered flights: ${JSON.stringify(filteredFlights, null, 2)}`);

    res.json(filteredFlights);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
