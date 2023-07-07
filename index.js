const axios = require("axios");
const Buffer = require("buffer").Buffer;
const fs = require("fs");
const appendFileSync = require("fs").appendFileSync;

const api = axios.create({
    baseURL: "http://18.140.254.213:8080/api/"
});

async function login() {
    const data = {
        "username": "nusakarya.teknologi@gmail.com",
        "password": "ThingsboardCrustea2023"
    };
    return await api.post("auth/login", data);
}

async function getData() {
    const ebii = [
        "temperature",
        "pH",
        "DO",
        "DoLabel",
        "DO_label"
    ]
    const smartEnergy = [
        "Voltage",
        "Power",
        "IP",
        "ID",
        "Time",
        "Power_Faktor",
        "Current",
        "Frekunsi",
        "Frekuensi",
        "Harga",
        "totalConsumption",
        "Tes",
        "Cost",
        "SumResult",
        "CostCal",
        "Latitude",
        "Longitude",
        "Energy",
        "PV Voltage",
        "DODummy",
        "method",
        "DOLabe",
        "E_Current",
        "E_Voltage",
        "E_Frekuensi",
        "E_Power_Faktor",
        "E_nergy",
        "E_Power",
        "CostEco"
    ]
    const ebiiKeys = ebii.join("%2C");
    const smartEnergyKeys = smartEnergy.join("%2C");
    // const startTs = 1673756901000;
    const startTs = 1675487401000; //sabtu 4 Feb
    const endTS = 1675573801000; //minggu 5 feb
    // const endTS = Date.now();
    // const endTS = 1673756905000;
    const token = await login();
    const config = {
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": `Bearer ${token.data.token}`
        }
    };
    const ebiiData = await api.get(`plugins/telemetry/DEVICE/55d6ede0-8f09-11ed-ac9f-1d637a3b2b80/values/timeseries?keys=${ebiiKeys}&startTs=${startTs}&endTs=${endTS}&limit=2147483647`, config);
    const smartEnergyData = await api.get(`plugins/telemetry/DEVICE/55d6ede0-8f09-11ed-ac9f-1d637a3b2b80/values/timeseries?keys=${smartEnergyKeys}&startTs=${startTs}&endTs=${endTS}&limit=2147483647`, config);
    return {
        ebii: ebiiData,
        smartEnergy: smartEnergyData
    };
}

async function getCSVFromData()
{
    const {ebii, smartEnergy} = await getData();
    const ebiiCSV = await convertToCSV(ebii);
    const smartEnergyCSV = await convertToCSV(smartEnergy);
    return {
        ebii: ebiiCSV,
        smartEnergy: smartEnergyCSV
    };
}

async function convertToCSV(data) {
    const keys = Object.keys(data.data);
    const values = Object.values(data.data).map((value) => value);
    let csv = "";
    csv += keys.join(",") + ",date" + "\n";
    for(let y = 0; y < values[0].length; y++) {
        let time = "";
        for(let x = 0; x < values.length; x++) {
            if(values[x][y])
            {
                if("value" in values[x][y])
                    csv += values[x][y].value + ",";
                time = values[x][y].ts;
            }
        }
        csv += new Date(time).toString() + "\n";
    }
    return csv;
}

async function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: "text/csv" });
    const buffer = Buffer.from( await blob.arrayBuffer() );

    fs.writeFile(`${filename}-${new Date().toISOString()}.csv`, buffer, () => console.log('csv saved!') );
    appendFileSync("./Sabtu_Minggu Monitoring Tambak.csv", buffer);
}

async function saveCSV() {
    const {ebii, smartEnergy} = await getCSVFromData();
    await downloadCSV(ebii, "ebii");
    await downloadCSV(smartEnergy, "smartEnergy");
}

(async () => {
    await saveCSV();
})();