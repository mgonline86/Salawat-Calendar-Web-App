// Global Variables
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

let user_inputs = {
    'country': 'Not Selected',
    'city': 'Not Selected',
    'from_date': today,
    'to_date': today,
    'duration': 0,
    'method': 'Not Selected'
}

let fromDateSelector = document.getElementById("from-date");
fromDateSelector.value = today
let toDateSelector = document.getElementById("to-date");
toDateSelector.value = today

let prayer_times=[]
let all_days_rows_list = [
    ['Subject', 'Start Date', 'Start Time', 'End Time']
]

const all_countries = async () => {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/flag/unicode');
    const result = await response.json(); 
    const countries = result.data;
    countries.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    let countries_options = ''
    countries.forEach(country => {
        countries_options += `<option>${country.name}</option>\n`
    });
    const countriesSelector = document.getElementById('select-countries');
    countriesSelector.insertAdjacentHTML('beforeend',countries_options)
}


const handleCountry = async(e) =>{
    country = e.value;
    console.log(country)
    const citiesInput = document.getElementById('cities_input');
    citiesInput.disabled = false;
    citiesInput.value = '';
    user_inputs['country'] = country;
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        body: JSON.stringify({
            "country": country
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const result = await response.json();
    let cities_options = ''
    if (result.data === undefined || result.data.length === 0) {
        cities_options += `<option>${country}</option>\n`
    } else {
            const cities = result.data;
            cities.sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
            cities.forEach(city => {
                cities_options += `<option>${city}</option>\n`
            });
    }
    const citiesSelector = document.getElementById('select-cities');
    citiesSelector.textContent = '';
    citiesSelector.insertAdjacentHTML('beforeend',cities_options)
    
}

const handleCity = (e) => {
    city = e.value
    console.log(city)
    user_inputs['city'] = city
}

const handleFromDate = (e) => {
    let to_date = document.getElementById("to-date")
    if (to_date.value < e.value) {
        to_date.value = e.value
        user_inputs['to_date'] = e.value
    }
    console.log(e.value)
    user_inputs['from_date'] = e.value
}

const handletoDate = (e) => {
    const from_date = document.getElementById("from-date").value
    const prev_to_date = user_inputs['to_date']
    if (from_date > e.value) {
        alert(`The "End date" can't be earlier than "Start date"!`)
        e.value = prev_to_date
        return
    }
    console.log(e.value)
    user_inputs['to_date'] = e.value
}

const handleDuration = (e) => {
    console.log(e.value)
    user_inputs['duration'] = e.value
}

const handleMethod = (e) => {
    console.log(e.value)
    user_inputs['method'] = e.value
}

const fetch_prayer_times = async(country, city, method, year) => {
    const response = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${city}&country=${country}&method=${method}&year=${year}&annual=true`);
    const result = await response.json(); 
    prayer_times.push(result.data);
}

const row_creator = (d, prayer, duration) =>{
    let row = []
    row.push(prayer)
    let start_date = d['date']['gregorian']['date']
    row.push(start_date)
    let start_time = d['timings'][prayer].substring(0,5)
    let end_time = d['timings'][prayer].substring(0,5)
    duration = parseInt(duration)
    let end_time_hr = parseInt(end_time.substring(0,2))
    let end_time_min = parseInt(end_time.substring(3,5))
    if (end_time_hr === 23) {   
        for (let i = 0; i < duration; i++) {
            if (end_time_min === 59) {
                break;
            }
            end_time_min += 1;
        }
    } else {
        for (let i = 0; i < duration; i++) {
            end_time_min += 1;
            if (end_time_min > 59) {
                end_time_hr += 1;
                end_time_min = 0
            }
        }
    }

    end_time = String(end_time_hr).padStart(2, '0') + ':' + String(end_time_min).padStart(2, '0')
    console.log(end_time)

    row.push(start_time)
    row.push(end_time)
    return row
}


const structure_data = (prayer_times, from_date, to_date, duration) => {
    prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const structure_month = (prayer_times, from_date, to_date) => {
        prayer_times.forEach((d) => {
           let current_date = parseInt(d['date']['timestamp']) * 1000
           current_date = new Date(current_date).toISOString()
           current_date = current_date.substring(0, current_date.indexOf('T'))
            if (current_date >= from_date && current_date <= to_date) {
                prayers.forEach((prayer)=>all_days_rows_list.push(row_creator(d, prayer, duration)))
            }
        }
        )}

    monthes = [1,2,3,4,5,6,7,8,9,10,11,12]
    prayer_times.forEach((p)=>{
        monthes.forEach((m)=>structure_month(p[String(m)], from_date, to_date))
            

    })
    
    return all_days_rows_list

}

const create_csv_file = (file_name, all_days_rows_list) => {
    console.log (file_name,all_days_rows_list)

    let csvContent = "data:text/csv;charset=utf-8," 
    + all_days_rows_list.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${file_name}.csv`);
    document.body.appendChild(link); 

    link.click();
}

const handleSubmit = (e) => {
    e.preventDefault()
    document.getElementById('main-form').checkValidity();
    let {country, city, from_date, to_date, duration, method} = user_inputs
    let file_name = `${city} prayer times (${from_date} to ${to_date})`
    if (from_date === to_date) {
        file_name = `${city} prayer times (${from_date})`
    }
    let start_year = parseInt(from_date.substring(0,4))
    let end_year = parseInt(to_date.substring(0,4))
    let years = [start_year]
    years_count = end_year - start_year
    for(let i = 1; i < years_count+1; i++){
        years.push(start_year+i)
      }
    prayer_times=[]
    all_days_rows_list = [
        ['Subject', 'Start Date', 'Start Time', 'End Time']
    ]
    Promise.all(years.map(year =>
        fetch_prayer_times(country, city, method, year)
    
    ))
    .then(()=>console.log(prayer_times))
    .then(() => structure_data(prayer_times, from_date, to_date, duration))
    .then(() => console.log(all_days_rows_list))
    .then(() => create_csv_file(file_name, all_days_rows_list))
}

all_countries()