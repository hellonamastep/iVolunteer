// Indian states and cities data
export const indianStatesData: { [key: string]: string[] } = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Davangere", "Bellary", "Tumkur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling", "Bardhaman", "Malda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Rajahmundry"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
  "Haryana": ["Faridabad", "Gurgaon", "Rohtak", "Panipat", "Karnal", "Sonipat", "Yamunanagar", "Hisar"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Ratlam"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital"],
  "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Palampur", "Baddi", "Nahan"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia", "Khowai"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Williamnagar"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul", "Senapati"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Singtam"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Zanskar"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"]
};

// Railway stations by city
export const railwayStationsByCity: { [key: string]: string[] } = {
  // Maharashtra
  "Mumbai": ["Mumbai Central", "Mumbai CST", "Bandra Terminus", "Dadar", "Andheri", "Borivali", "Kurla", "Thane", "Kalyan", "Churchgate"],
  "Pune": ["Pune Junction", "Shivajinagar", "Hadapsar", "Khadki", "Chinchwad"],
  "Nagpur": ["Nagpur Junction", "Ajni", "Itwari"],
  "Thane": ["Thane Railway Station", "Kalyan Junction"],
  "Nashik": ["Nashik Road", "Deolali"],
  "Aurangabad": ["Aurangabad Railway Station"],
  "Solapur": ["Solapur Junction"],
  "Kolhapur": ["Kolhapur Railway Station"],
  "Amravati": ["Amravati Railway Station", "Badnera Junction"],
  "Navi Mumbai": ["Vashi", "Nerul", "Panvel"],
  
  // Delhi
  "New Delhi": ["New Delhi Railway Station", "Old Delhi", "Hazrat Nizamuddin", "Anand Vihar"],
  "North Delhi": ["Delhi Junction", "Azadpur"],
  "South Delhi": ["Sarojini Nagar", "Lajpat Nagar"],
  "East Delhi": ["Anand Vihar Terminal", "Ghaziabad"],
  "West Delhi": ["Delhi Cantt", "Patel Nagar"],
  "Central Delhi": ["New Delhi", "Delhi Junction"],
  
  // Karnataka
  "Bangalore": ["Bangalore City", "Yesvantpur", "Bangalore Cantonment", "KSR Bengaluru"],
  "Mysore": ["Mysore Junction"],
  "Hubli": ["Hubli Junction"],
  "Mangalore": ["Mangalore Central", "Mangalore Junction"],
  "Belgaum": ["Belgaum Railway Station"],
  "Davangere": ["Davangere Railway Station"],
  "Bellary": ["Bellary Junction"],
  "Tumkur": ["Tumkur Railway Station"],
  
  // Tamil Nadu
  "Chennai": ["Chennai Central", "Chennai Egmore", "Tambaram", "Chennai Beach"],
  "Coimbatore": ["Coimbatore Junction", "Coimbatore North"],
  "Madurai": ["Madurai Junction"],
  "Tiruchirappalli": ["Tiruchirappalli Junction"],
  "Salem": ["Salem Junction"],
  "Tirunelveli": ["Tirunelveli Junction"],
  "Tiruppur": ["Tiruppur Railway Station"],
  "Erode": ["Erode Junction"],
  
  // Gujarat
  "Ahmedabad": ["Ahmedabad Junction", "Sabarmati Junction", "Gandhigram", "Maninagar"],
  "Surat": ["Surat Railway Station", "Udhna Junction"],
  "Vadodara": ["Vadodara Junction", "Vishvamitri"],
  "Rajkot": ["Rajkot Junction"],
  "Bhavnagar": ["Bhavnagar Terminus"],
  "Jamnagar": ["Jamnagar Railway Station"],
  "Junagadh": ["Junagadh Junction"],
  "Gandhinagar": ["Gandhinagar Capital"],
  
  // West Bengal
  "Kolkata": ["Howrah Junction", "Sealdah", "Kolkata Station"],
  "Howrah": ["Howrah Junction"],
  "Durgapur": ["Durgapur Railway Station"],
  "Asansol": ["Asansol Junction"],
  "Siliguri": ["New Jalpaiguri", "Siliguri Junction"],
  "Darjeeling": ["Darjeeling Railway Station"],
  "Bardhaman": ["Bardhaman Junction"],
  "Malda": ["Malda Town"],
  
  // Rajasthan
  "Jaipur": ["Jaipur Junction", "Durgapura", "Gandhinagar Jaipur"],
  "Jodhpur": ["Jodhpur Junction"],
  "Udaipur": ["Udaipur City"],
  "Kota": ["Kota Junction"],
  "Ajmer": ["Ajmer Junction"],
  "Bikaner": ["Bikaner Junction"],
  "Alwar": ["Alwar Junction"],
  "Bhilwara": ["Bhilwara Railway Station"],
  
  // Uttar Pradesh
  "Lucknow": ["Lucknow Charbagh", "Lucknow Junction", "Aishbagh"],
  "Kanpur": ["Kanpur Central", "Kanpur Anwarganj"],
  "Ghaziabad": ["Ghaziabad Junction"],
  "Agra": ["Agra Cantt", "Agra Fort"],
  "Varanasi": ["Varanasi Junction", "Manduadih"],
  "Meerut": ["Meerut City", "Meerut Cantt"],
  "Allahabad": ["Prayagraj Junction", "Prayag"],
  "Bareilly": ["Bareilly Junction"],
  
  // Telangana
  "Hyderabad": ["Secunderabad", "Hyderabad Deccan", "Kacheguda", "Begumpet"],
  "Warangal": ["Warangal Railway Station"],
  "Nizamabad": ["Nizamabad Junction"],
  "Khammam": ["Khammam Railway Station"],
  "Karimnagar": ["Karimnagar Railway Station"],
  "Ramagundam": ["Ramagundam Railway Station"],
  "Mahbubnagar": ["Mahbubnagar Railway Station"],
  
  // Kerala
  "Thiruvananthapuram": ["Thiruvananthapuram Central"],
  "Kochi": ["Ernakulam Junction", "Ernakulam Town"],
  "Kozhikode": ["Kozhikode Railway Station"],
  "Thrissur": ["Thrissur Railway Station"],
  "Kollam": ["Kollam Junction"],
  "Palakkad": ["Palakkad Junction"],
  "Alappuzha": ["Alappuzha Railway Station"],
  "Kannur": ["Kannur Railway Station"],
  
  // Andhra Pradesh
  "Visakhapatnam": ["Visakhapatnam Railway Station"],
  "Vijayawada": ["Vijayawada Junction"],
  "Guntur": ["Guntur Junction"],
  "Nellore": ["Nellore Railway Station"],
  "Kurnool": ["Kurnool City"],
  "Tirupati": ["Tirupati Railway Station"],
  "Kakinada": ["Kakinada Town"],
  "Rajahmundry": ["Rajahmundry Railway Station"],
  
  // Punjab
  "Chandigarh": ["Chandigarh Railway Station"],
  "Ludhiana": ["Ludhiana Junction"],
  "Amritsar": ["Amritsar Junction"],
  "Jalandhar": ["Jalandhar City", "Jalandhar Cantt"],
  "Patiala": ["Patiala Railway Station"],
  "Bathinda": ["Bathinda Junction"],
  "Mohali": ["Chandigarh Railway Station"],
  "Pathankot": ["Pathankot Junction"],
  
  // Haryana
  "Faridabad": ["Faridabad Railway Station", "Faridabad New Town"],
  "Gurgaon": ["Gurgaon Railway Station"],
  "Rohtak": ["Rohtak Junction"],
  "Panipat": ["Panipat Junction"],
  "Karnal": ["Karnal Railway Station"],
  "Sonipat": ["Sonipat Junction"],
  "Yamunanagar": ["Yamunanagar Jagadhri"],
  "Hisar": ["Hisar Junction"],
  
  // Madhya Pradesh
  "Bhopal": ["Bhopal Junction", "Habibganj"],
  "Indore": ["Indore Junction"],
  "Gwalior": ["Gwalior Junction"],
  "Jabalpur": ["Jabalpur Junction"],
  "Ujjain": ["Ujjain Junction"],
  "Sagar": ["Sagar Railway Station"],
  "Dewas": ["Dewas Junction"],
  "Ratlam": ["Ratlam Junction"],
  
  // Bihar
  "Patna": ["Patna Junction", "Rajendra Nagar", "Patna Saheb"],
  "Gaya": ["Gaya Junction"],
  "Bhagalpur": ["Bhagalpur Junction"],
  "Muzaffarpur": ["Muzaffarpur Junction"],
  "Purnia": ["Purnia Junction"],
  "Darbhanga": ["Darbhanga Junction"],
  "Bihar Sharif": ["Bihar Sharif Junction"],
  "Arrah": ["Arrah Railway Station"],
  
  // Odisha
  "Bhubaneswar": ["Bhubaneswar Railway Station"],
  "Cuttack": ["Cuttack Railway Station"],
  "Rourkela": ["Rourkela Railway Station"],
  "Berhampur": ["Berhampur Railway Station"],
  "Sambalpur": ["Sambalpur Railway Station"],
  "Puri": ["Puri Railway Station"],
  "Balasore": ["Balasore Railway Station"],
  "Bhadrak": ["Bhadrak Railway Station"],
  
  // Assam
  "Guwahati": ["Guwahati Railway Station", "Kamakhya"],
  "Silchar": ["Silchar Railway Station"],
  "Dibrugarh": ["Dibrugarh Town"],
  "Jorhat": ["Jorhat Town"],
  "Nagaon": ["Nagaon Railway Station"],
  "Tinsukia": ["Tinsukia Junction"],
  "Tezpur": ["Tezpur Railway Station"],
  "Bongaigaon": ["Bongaigaon Junction"],
  
  // Jharkhand
  "Ranchi": ["Ranchi Junction"],
  "Jamshedpur": ["Tatanagar Junction"],
  "Dhanbad": ["Dhanbad Junction"],
  "Bokaro": ["Bokaro Steel City"],
  "Deoghar": ["Deoghar Railway Station"],
  "Hazaribagh": ["Hazaribagh Road"],
  "Giridih": ["Giridih Railway Station"],
  "Ramgarh": ["Ramgarh Cantt"],
  
  // Chhattisgarh
  "Raipur": ["Raipur Junction"],
  "Bhilai": ["Bhilai Railway Station"],
  "Bilaspur": ["Bilaspur Junction"],
  "Korba": ["Korba Railway Station"],
  "Durg": ["Durg Junction"],
  "Rajnandgaon": ["Rajnandgaon Railway Station"],
  "Raigarh": ["Raigarh Railway Station"],
  "Jagdalpur": ["Jagdalpur Railway Station"],
  
  // Uttarakhand
  "Dehradun": ["Dehradun Railway Station"],
  "Haridwar": ["Haridwar Junction"],
  "Roorkee": ["Roorkee Railway Station"],
  "Haldwani": ["Haldwani Railway Station"],
  "Rudrapur": ["Rudrapur City"],
  "Kashipur": ["Kashipur Railway Station"],
  "Rishikesh": ["Rishikesh Railway Station"],
  "Nainital": ["Kathgodam Railway Station"],
  
  // Goa
  "Panaji": ["Karmali Railway Station"],
  "Vasco da Gama": ["Vasco da Gama Railway Station"],
  "Margao": ["Madgaon Junction"],
  "Mapusa": ["Thivim Railway Station"],
  "Ponda": ["Ponda Railway Station"],
  "Bicholim": ["Bicholim Railway Station"],
  
  // Other states
  "Shimla": ["Shimla Railway Station"],
  "Dharamshala": ["Pathankot Junction"],
  "Solan": ["Solan Railway Station"],
  "Mandi": ["Joginder Nagar"],
  "Kullu": ["Joginder Nagar"],
  "Palampur": ["Palampur Railway Station"],
  "Baddi": ["Baddi Railway Station"],
  "Nahan": ["Ambala Cantt"],
  "Srinagar": ["Srinagar Railway Station"],
  "Jammu": ["Jammu Tawi"],
  "Anantnag": ["Anantnag Railway Station"],
  "Baramulla": ["Baramulla Railway Station"],
  "Udhampur": ["Udhampur Railway Station"],
  "Kathua": ["Kathua Railway Station"],
  "Sopore": ["Sopore Railway Station"],
  "Agartala": ["Agartala Railway Station"],
  "Dharmanagar": ["Dharmanagar Railway Station"],
  "Kailashahar": ["Kailashahar Railway Station"],
  "Belonia": ["Belonia Railway Station"],
  "Khowai": ["Khowai Railway Station"],
  "Shillong": ["Guwahati Railway Station"],
  "Tura": ["Guwahati Railway Station"],
  "Nongstoin": ["Guwahati Railway Station"],
  "Jowai": ["Guwahati Railway Station"],
  "Baghmara": ["Guwahati Railway Station"],
  "Williamnagar": ["Guwahati Railway Station"],
  "Imphal": ["Imphal Railway Station"],
  "Thoubal": ["Imphal Railway Station"],
  "Bishnupur": ["Imphal Railway Station"],
  "Churachandpur": ["Imphal Railway Station"],
  "Ukhrul": ["Imphal Railway Station"],
  "Senapati": ["Imphal Railway Station"],
  "Kohima": ["Dimapur Railway Station"],
  "Dimapur": ["Dimapur Railway Station"],
  "Mokokchung": ["Dimapur Railway Station"],
  "Tuensang": ["Dimapur Railway Station"],
  "Wokha": ["Dimapur Railway Station"],
  "Zunheboto": ["Dimapur Railway Station"],
  "Aizawl": ["Bairabi Railway Station"],
  "Lunglei": ["Bairabi Railway Station"],
  "Saiha": ["Bairabi Railway Station"],
  "Champhai": ["Bairabi Railway Station"],
  "Kolasib": ["Bairabi Railway Station"],
  "Serchhip": ["Bairabi Railway Station"],
  "Itanagar": ["Naharlagun Railway Station"],
  "Naharlagun": ["Naharlagun Railway Station"],
  "Pasighat": ["Naharlagun Railway Station"],
  "Tawang": ["Naharlagun Railway Station"],
  "Ziro": ["Naharlagun Railway Station"],
  "Bomdila": ["Naharlagun Railway Station"],
  "Gangtok": ["New Jalpaiguri"],
  "Namchi": ["New Jalpaiguri"],
  "Gyalshing": ["New Jalpaiguri"],
  "Mangan": ["New Jalpaiguri"],
  "Rangpo": ["New Jalpaiguri"],
  "Singtam": ["New Jalpaiguri"],
  "Puducherry": ["Puducherry Railway Station"],
  "Karaikal": ["Karaikal Railway Station"],
  "Mahe": ["Mahe Railway Station"],
  "Yanam": ["Yanam Railway Station"],
  "Leh": ["Jammu Tawi"],
  "Kargil": ["Jammu Tawi"],
  "Nubra": ["Jammu Tawi"],
  "Zanskar": ["Jammu Tawi"],
  "Daman": ["Vapi Railway Station"],
  "Diu": ["Veraval Railway Station"],
  "Silvassa": ["Vapi Railway Station"],
  
  // Fallback
  "Other": ["Other"]
};

// Countries data (only India for now)
export const countriesData: string[] = ["India"];

// Helper function to get cities by state
export const getCitiesByState = (state: string): string[] => {
  return indianStatesData[state] || [];
};

// Helper function to get stations by city
export const getStationsByCity = (city: string): string[] => {
  return railwayStationsByCity[city] || [];
};

// Helper function to get all states sorted
export const getAllStates = (): string[] => {
  return Object.keys(indianStatesData).sort();
};
