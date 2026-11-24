// Hand-picked destinations around the world. As your total miles grow,
// every place within that distance of home becomes "unlocked".
(function (root) {
  const PLACES = [
    // North America
    { name: "New York City", country: "USA", lat: 40.7128, lng: -74.006, facts: [
      "The Statue of Liberty was a gift from France and was dedicated in 1886.",
      "Central Park covers 843 acres, which makes it bigger than the country of Monaco.",
      "Hundreds of languages are spoken here, making it one of the most linguistically diverse cities on Earth.",
    ]},
    { name: "Boston", country: "USA", lat: 42.3601, lng: -71.0589, facts: [
      "Boston Common, set aside in 1634, is the oldest public park in the United States.",
      "Boston opened America's first subway tunnel in 1897.",
      "The Boston Marathon, first run in 1897, is the world's oldest annual marathon.",
    ]},
    { name: "Washington, D.C.", country: "USA", lat: 38.9072, lng: -77.0369, facts: [
      "Most Smithsonian museums are free to enter.",
      "A law from 1910 limits how tall buildings can be, which keeps the skyline low.",
      "The city was designed from scratch as a capital, with a street plan by Pierre L'Enfant.",
    ]},
    { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, facts: [
      "Engineers reversed the flow of the Chicago River in 1900 so it runs away from Lake Michigan.",
      "The Home Insurance Building, finished here in 1885, is often called the world's first skyscraper.",
      "The river is dyed bright green every year for St. Patrick's Day.",
    ]},
    { name: "Nashville", country: "USA", lat: 36.1627, lng: -86.7816, facts: [
      "The Grand Ole Opry has been on the radio since 1925, the longest-running radio broadcast in U.S. history.",
      "Centennial Park has a full-size replica of the Parthenon in Athens.",
      "Its nickname is 'Music City'.",
    ]},
    { name: "New Orleans", country: "USA", lat: 29.9511, lng: -90.0715, facts: [
      "New Orleans is widely called the birthplace of jazz.",
      "Large parts of the city sit below sea level.",
      "Its cemeteries bury people above ground, earning them the nickname 'Cities of the Dead'.",
    ]},
    { name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918, facts: [
      "Miami is the only major U.S. city founded by a woman, Julia Tuttle.",
      "Miami Beach's Art Deco Historic District has more than 800 preserved buildings.",
      "It is the only U.S. city that borders two national parks: Everglades and Biscayne.",
    ]},
    { name: "Austin", country: "USA", lat: 30.2672, lng: -97.7431, facts: [
      "Up to 1.5 million bats live under the Congress Avenue Bridge, the largest urban bat colony in North America.",
      "The Texas State Capitol in Austin is taller than the U.S. Capitol.",
      "The city's unofficial motto is 'Keep Austin Weird'.",
    ]},
    { name: "Denver", country: "USA", lat: 39.7392, lng: -104.9903, facts: [
      "A step on the Colorado State Capitol is marked as exactly one mile (5,280 ft) above sea level.",
      "Denver is the only city ever to turn down the Olympics after winning the bid, for the 1976 Winter Games.",
      "It gets about 300 days of sunshine a year, by local count.",
    ]},
    { name: "Phoenix", country: "USA", lat: 33.4484, lng: -112.074, facts: [
      "It is named after the mythical phoenix, because the city rose on the site of ancient Hohokam canals.",
      "Phoenix is the most populous state capital in the U.S.",
      "Summer highs often top 110°F (43°C).",
    ]},
    { name: "Las Vegas", country: "USA", lat: 36.1699, lng: -115.1398, facts: [
      "The beam on top of the Luxor is one of the brightest beams of light in the world.",
      "Hoover Dam is about a 45-minute drive away.",
      "The Las Vegas Strip is technically outside city limits, in the town of Paradise.",
    ]},
    { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, facts: [
      "The Hollywood Sign first read 'HOLLYWOODLAND' and was built in 1923 to advertise houses for sale.",
      "The city was founded in 1781 as a small Spanish farming settlement.",
      "LA has more than 75 miles of coastline in its county.",
    ]},
    { name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, facts: [
      "The Golden Gate Bridge opened in 1937, and its color is officially called 'International Orange'.",
      "Its cable cars are a moving National Historic Landmark.",
      "Alcatraz Island was a federal prison from 1934 to 1963.",
    ]},
    { name: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321, facts: [
      "The Space Needle was built for the 1962 World's Fair.",
      "Starbucks was founded in Seattle in 1971.",
      "Pike Place Market, opened in 1907, is one of the oldest public markets running in the U.S.",
    ]},
    { name: "Anchorage", country: "USA", lat: 61.2181, lng: -149.9003, facts: [
      "Moose regularly wander through city neighborhoods.",
      "The Iditarod sled dog race starts here every March.",
      "In midsummer the sun is up for more than 19 hours a day.",
    ]},
    { name: "Honolulu", country: "USA", lat: 21.3069, lng: -157.8583, facts: [
      "ʻIolani Palace is the only royal palace in the United States.",
      "Diamond Head is a volcanic crater that last erupted about 300,000 years ago.",
      "Honolulu means 'sheltered bay' in Hawaiian.",
    ]},
    { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, facts: [
      "The CN Tower (553 m) was the world's tallest freestanding structure from 1975 to 2007.",
      "Nearly half of Torontonians were born outside Canada.",
      "PATH, an underground walkway downtown, runs for about 30 km.",
    ]},
    { name: "Montréal", country: "Canada", lat: 45.5019, lng: -73.5674, facts: [
      "Montréal is the largest mainly French-speaking city in the Americas.",
      "The city sits on an island in the St. Lawrence River.",
      "Its bagels are boiled in honey water and baked in wood-fired ovens.",
    ]},
    { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, facts: [
      "Stanley Park is larger than New York's Central Park.",
      "The Seawall around Stanley Park is the world's longest uninterrupted waterfront path.",
      "Vancouver hosted the 2010 Winter Olympics.",
    ]},
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, facts: [
      "The city is built on top of Tenochtitlan, the Aztec capital that stood on an island in a lake.",
      "Because it sits on old lakebed, parts of the city sink several inches every year.",
      "It has one of the largest numbers of museums of any city in the world.",
    ]},
    { name: "Cancún", country: "Mexico", lat: 21.1619, lng: -86.8515, facts: [
      "Cancún was planned by the Mexican government in the 1970s as a resort city.",
      "An underwater museum off the coast holds more than 500 sculptures.",
      "The Mayan ruins of Chichén Itzá are about a 2.5-hour drive away.",
    ]},
    { name: "Havana", country: "Cuba", lat: 23.1136, lng: -82.3666, facts: [
      "Old Havana is a UNESCO World Heritage Site.",
      "Classic 1950s American cars are still a common sight on its streets.",
      "The Malecón seawall stretches about 8 km along the coast.",
    ]},
    { name: "Panama City", country: "Panama", lat: 8.9824, lng: -79.5199, facts: [
      "The Panama Canal's locks lift ships about 26 m (85 ft) above sea level.",
      "Ships pay a toll to use the canal, set by their size and cargo.",
      "Casco Viejo, the old quarter, was founded in 1673.",
    ]},
    { name: "Reykjavík", country: "Iceland", lat: 64.1466, lng: -21.9426, facts: [
      "It is the northernmost capital of a sovereign country.",
      "Most homes are heated with geothermal water.",
      "In midwinter it gets only about four hours of daylight.",
    ]},

    // South America
    { name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721, facts: [
      "Bogotá sits about 2,640 m (8,660 ft) above sea level.",
      "Every Sunday, more than 100 km of streets close to cars for the Ciclovía.",
      "The Gold Museum holds tens of thousands of pre-Columbian gold pieces.",
    ]},
    { name: "Quito", country: "Ecuador", lat: -0.1807, lng: -78.4678, facts: [
      "Quito is the capital city closest to the equator.",
      "In 1978 it was one of the first places named a UNESCO World Heritage Site.",
      "It sits at about 2,850 m (9,350 ft), high in the Andes.",
    ]},
    { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, facts: [
      "Lima is one of the driest capitals in the world and rarely gets rain.",
      "Ceviche, Peru's national dish, is a Lima favorite.",
      "Adobe pyramids from before the Inca still stand in the middle of the city.",
    ]},
    { name: "Cusco", country: "Peru", lat: -13.532, lng: -71.9675, facts: [
      "Cusco was the capital of the Inca Empire.",
      "It is the main gateway to Machu Picchu.",
      "Many buildings stand on Inca stone walls built without mortar.",
    ]},
    { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, facts: [
      "The Christ the Redeemer statue was finished in 1931.",
      "From 1808 to 1821 Rio was the capital of the Portuguese Empire, a European capital outside Europe.",
      "Rio's Carnival is often called the biggest party on Earth.",
    ]},
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, facts: [
      "Avenida 9 de Julio is one of the widest avenues in the world.",
      "Tango was born in the neighborhoods of Buenos Aires and Montevideo.",
      "The city has one of the highest numbers of bookstores per person in the world.",
    ]},
    { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, facts: [
      "On clear days, snowy Andes peaks tower over the city.",
      "Gran Torre Santiago is the tallest building in South America.",
      "Ski resorts are less than two hours' drive from downtown.",
    ]},

    // Europe
    { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, facts: [
      "The London Underground, opened in 1863, is the world's oldest underground railway.",
      "'Big Ben' is really the name of the great bell, not the tower.",
      "Many of its biggest museums, like the British Museum, are free.",
    ]},
    { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lng: -3.1883, facts: [
      "A cannon is fired from Edinburgh Castle at 1 p.m. every day except Sunday.",
      "The castle sits on an extinct volcano.",
      "The Edinburgh Festival Fringe is the world's largest arts festival.",
    ]},
    { name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, facts: [
      "Arthur Guinness signed a 9,000-year lease on the St. James's Gate brewery in 1759.",
      "The Book of Kells, from about 800 AD, is kept at Trinity College.",
      "The name comes from the Irish 'Dubh Linn', meaning 'black pool'.",
    ]},
    { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, facts: [
      "The Eiffel Tower was built for the 1889 World's Fair and was meant to be temporary.",
      "In summer heat, the tower grows about 15 cm taller as its iron expands.",
      "The Louvre is the most visited art museum in the world.",
    ]},
    { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, facts: [
      "Amsterdam has more bicycles than people.",
      "The city has more than 1,200 bridges.",
      "Much of the city is built on wooden piles driven into the soggy ground.",
    ]},
    { name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683, facts: [
      "Tivoli Gardens opened in 1843 and is one of the oldest amusement parks still running.",
      "Walt Disney visited Tivoli while dreaming up Disneyland.",
      "More people commute by bike than by car.",
    ]},
    { name: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522, facts: [
      "Every year Oslo gives a Christmas tree to London for Trafalgar Square, as thanks for help during WWII.",
      "The Nobel Peace Prize is awarded in Oslo.",
      "You can ski, hike or swim in the fjord without leaving the city.",
    ]},
    { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, facts: [
      "Stockholm is built on 14 islands.",
      "The Vasa, a warship that sank on its first voyage in 1628, was raised and is now a museum.",
      "Its metro is called the world's longest art gallery.",
    ]},
    { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, facts: [
      "The Berlin Wall divided the city from 1961 until it fell in 1989.",
      "Berlin has more bridges than Venice.",
      "It is about nine times the size of Paris by area.",
    ]},
    { name: "Prague", country: "Czechia", lat: 50.0755, lng: 14.4378, facts: [
      "Prague Castle is one of the largest ancient castle complexes in the world.",
      "The Astronomical Clock, installed in 1410, is the oldest of its kind still working.",
      "Czechs drink more beer per person than anyone else.",
    ]},
    { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738, facts: [
      "Schönbrunn Zoo, founded in 1752, is the oldest zoo still running.",
      "Mozart, Beethoven and Haydn all lived and worked here.",
      "Viennese coffee house culture is on UNESCO's list of intangible heritage.",
    ]},
    { name: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402, facts: [
      "Budapest was formed in 1873 when Buda, Óbuda and Pest joined together.",
      "The city sits on more than 100 thermal springs.",
      "Its metro line 1 (1896) is the oldest underground line on the European mainland.",
    ]},
    { name: "Venice", country: "Italy", lat: 45.4408, lng: 12.3155, facts: [
      "Venice is built on about 118 small islands joined by bridges.",
      "There are no cars in the historic center. People get around on foot or by boat.",
      "Buildings stand on wooden piles driven deep into the lagoon mud.",
    ]},
    { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, facts: [
      "Over a million euros in coins are thrown into the Trevi Fountain each year, and the money goes to charity.",
      "Vatican City, the world's smallest country, sits inside Rome.",
      "The Pantheon's concrete dome, nearly 1,900 years old, is still the largest unreinforced concrete dome in the world.",
    ]},
    { name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686, facts: [
      "Work on Gaudí's Sagrada Família began in 1882 and is still going on.",
      "The city's beaches were largely created for the 1992 Olympics.",
      "Its Eixample district is laid out in a grid of blocks with cut-off corners.",
    ]},
    { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, facts: [
      "Sobrino de Botín, open since 1725, is listed as the oldest restaurant in the world.",
      "Madrid is the highest capital city in the European Union.",
      "The Prado holds one of the world's finest collections of European art.",
    ]},
    { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, facts: [
      "Lisbon is one of the oldest cities in Western Europe.",
      "Yellow Tram 28 winds through the steep historic neighborhoods.",
      "Much of the city was rebuilt after a huge earthquake in 1755.",
    ]},
    { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275, facts: [
      "Athens has a recorded history of about 3,400 years.",
      "The Parthenon was finished in 432 BC.",
      "The first modern Olympic Games were held here in 1896.",
    ]},
    { name: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784, facts: [
      "Istanbul spans two continents, Europe and Asia, across the Bosphorus.",
      "The Grand Bazaar has about 4,000 shops and is one of the oldest covered markets in the world.",
      "The city was once called Byzantium, and later Constantinople.",
    ]},
    { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, facts: [
      "Many Moscow Metro stations are decorated like palaces, with chandeliers and mosaics.",
      "The Kremlin is a walled fortress with five palaces and four cathedrals.",
      "St. Basil's Cathedral was finished in 1561.",
    ]},

    // Africa & Middle East
    { name: "Marrakech", country: "Morocco", lat: 31.6295, lng: -7.9811, facts: [
      "Jemaa el-Fnaa square fills with storytellers, musicians and food stalls every night.",
      "Its old city, the medina, is a UNESCO World Heritage Site.",
      "The city is nicknamed 'the Red City' for its red sandstone walls.",
    ]},
    { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, facts: [
      "The Great Pyramid of Giza was the tallest human-made structure for about 3,800 years.",
      "It is the only one of the Seven Wonders of the Ancient World still standing.",
      "Cairo is the largest city in the Arab world.",
    ]},
    { name: "Jerusalem", country: "Israel / Palestine", lat: 31.7683, lng: 35.2137, facts: [
      "Jerusalem is holy to Judaism, Christianity and Islam.",
      "The Old City is less than one square kilometer.",
      "It is one of the oldest cities in the world.",
    ]},
    { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, facts: [
      "The Burj Khalifa, at 828 m, is the tallest building in the world.",
      "The Palm Jumeirah is an artificial island shaped like a palm tree.",
      "In 1960, Dubai had only about 40,000 residents.",
    ]},
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, facts: [
      "Lagos is one of the largest cities in Africa.",
      "It is a hub of 'Nollywood', one of the world's biggest film industries.",
      "The city is spread across islands and the mainland around a lagoon.",
    ]},
    { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, facts: [
      "Nairobi National Park has lions, giraffes and rhinos with the city skyline behind them.",
      "The name comes from a Maasai phrase meaning 'cool water'.",
      "The city began as a railway depot in 1899.",
    ]},
    { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, facts: [
      "Table Mountain was named one of the New 7 Wonders of Nature.",
      "African penguins live on Boulders Beach, just outside the city.",
      "Robben Island, where Nelson Mandela was imprisoned, is a short ferry ride away.",
    ]},

    // Asia
    { name: "Delhi", country: "India", lat: 28.6139, lng: 77.209, facts: [
      "The Qutub Minar, at 73 m, is the tallest brick minaret in the world.",
      "New Delhi was designed as a capital in the 1910s and '20s.",
      "Its Old Delhi spice market is one of the largest in Asia.",
    ]},
    { name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, facts: [
      "Mumbai is home to Bollywood, one of the world's biggest film industries.",
      "Its dabbawalas deliver hundreds of thousands of home-cooked lunches every day.",
      "The city was once seven separate islands.",
    ]},
    { name: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.324, facts: [
      "The Kathmandu Valley has seven UNESCO World Heritage monuments.",
      "It is the starting point for many Everest expeditions.",
      "Nepal's flag is the only national flag that isn't a rectangle.",
    ]},
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, facts: [
      "Bangkok's full ceremonial name is the longest place name in the world.",
      "Thais call the city Krung Thep, 'City of Angels'.",
      "The Grand Palace was the royal residence from 1782.",
    ]},
    { name: "Hanoi", country: "Vietnam", lat: 21.0278, lng: 105.8342, facts: [
      "Hanoi celebrated its 1,000th birthday in 2010.",
      "Hoan Kiem Lake has a legend about a giant turtle and a magic sword.",
      "Pho, the famous noodle soup, is said to have its roots around Hanoi.",
    ]},
    { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, facts: [
      "Selling chewing gum has been banned since 1992.",
      "Singapore is one of only a few city-states in the world.",
      "Changi Airport has an indoor waterfall about 40 m tall.",
    ]},
    { name: "Bali (Denpasar)", country: "Indonesia", lat: -8.6705, lng: 115.2126, facts: [
      "On Nyepi, the Balinese Day of Silence, the whole island shuts down, airport included.",
      "Bali's rice terraces use the subak irrigation system, a UNESCO World Heritage Site.",
      "The island has thousands of Hindu temples.",
    ]},
    { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, facts: [
      "Manila is one of the most densely populated cities in the world.",
      "Intramuros, its walled city, dates from the 1500s.",
      "Its sunsets over Manila Bay are famous.",
    ]},
    { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694, facts: [
      "Hong Kong has more skyscrapers than any other city in the world.",
      "The Mid-Levels escalator is the world's longest outdoor covered escalator system.",
      "About three-quarters of its land is countryside and parks.",
    ]},
    { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, facts: [
      "The Shanghai Maglev train reaches about 431 km/h (268 mph).",
      "Shanghai Tower is one of the tallest buildings in the world, at 632 m.",
      "Its port is the busiest container port in the world.",
    ]},
    { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, facts: [
      "The Forbidden City has around 980 buildings.",
      "Beijing is the first city to host both the Summer and Winter Olympics.",
      "Parts of the Great Wall are about an hour's drive from the city.",
    ]},
    { name: "Ulaanbaatar", country: "Mongolia", lat: 47.8864, lng: 106.9057, facts: [
      "Ulaanbaatar is the coldest national capital in the world.",
      "Many residents live in traditional round tents called gers.",
      "Nearly half of Mongolia's people live in the capital.",
    ]},
    { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, facts: [
      "Cheonggyecheon, a stream that had been covered by a highway, was restored as a park in 2005.",
      "Seoul has five grand palaces from the Joseon dynasty.",
      "Its subway is one of the longest in the world.",
    ]},
    { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, facts: [
      "Kyoto was Japan's capital for more than 1,000 years.",
      "The city has about 1,600 Buddhist temples.",
      "Fushimi Inari Shrine has thousands of bright orange torii gates.",
    ]},
    { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, facts: [
      "Greater Tokyo is the largest metropolitan area in the world, with about 37 million people.",
      "Shibuya Crossing can have thousands of people crossing at once.",
      "Tokyo has more Michelin-starred restaurants than almost any other city.",
    ]},

    // Oceania & the poles
    { name: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605, facts: [
      "Perth is one of the most isolated big cities in the world.",
      "Kings Park is one of the largest inner-city parks in the world.",
      "Rottnest Island, nearby, is home to quokkas, sometimes called the happiest animals on Earth.",
    ]},
    { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, facts: [
      "The Sydney Opera House roof is covered in more than one million tiles.",
      "Locals nickname the Harbour Bridge 'the Coathanger'.",
      "Sydney has more than 100 beaches.",
    ]},
    { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, facts: [
      "Melbourne has the largest tram network in the world.",
      "The Melbourne Cricket Ground holds around 100,000 people.",
      "It was briefly Australia's capital, from 1901 to 1927.",
    ]},
    { name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633, facts: [
      "Auckland is built on a field of about 50 volcanoes.",
      "It is nicknamed the 'City of Sails' for its many boats.",
      "The Sky Tower is the tallest freestanding structure in the Southern Hemisphere.",
    ]},
    { name: "McMurdo Station", country: "Antarctica", lat: -77.8419, lng: 166.6863, facts: [
      "McMurdo is the largest research station in Antarctica, with about 1,000 people in summer.",
      "The sun does not set for months in the Antarctic summer.",
      "Antarctica holds about 70% of the world's fresh water as ice.",
    ]},
    { name: "North Pole", country: "Arctic Ocean", lat: 90, lng: 0, facts: [
      "There is no land at the North Pole, only floating sea ice over ocean about 4 km deep.",
      "Every direction from the North Pole is south.",
      "The sun rises once and sets once a year here.",
    ]},
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = PLACES;
  else root.PLACES = PLACES;
})(this);
