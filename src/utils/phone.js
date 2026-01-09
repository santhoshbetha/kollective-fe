/** List of supported E164 country codes for democratic countries. */
const COUNTRY_CODES = [
  '1',    // United States, Canada
  '27',   // South Africa
  '30',   // Greece
  '31',   // Netherlands
  '32',   // Belgium
  '33',   // France
  '34',   // Spain
  '36',   // Hungary
  '39',   // Italy
  '40',   // Romania
  '41',   // Switzerland
  '43',   // Austria
  '44',   // United Kingdom
  '45',   // Denmark
  '46',   // Sweden
  '47',   // Norway
  '48',   // Poland
  '49',   // Germany
  '51',   // Peru
  '52',   // Mexico
  '53',   // Cuba (questionable)
  '54',   // Argentina
  '55',   // Brazil
  '56',   // Chile
  '57',   // Colombia
  '58',   // Venezuela (questionable)
  '61',   // Australia
  '64',   // New Zealand
  '81',   // Japan
  '82',   // South Korea
  '91',   // India
  '221',  // Senegal
  '230',  // Mauritius
  '233',  // Ghana
  '238',  // Cape Verde
  '239',  // Sao Tome and Principe
  '267',  // Botswana
  '264',  // Namibia
  '351',  // Portugal
  '352',  // Luxembourg
  '353',  // Ireland
  '354',  // Iceland
  '355',  // Albania
  '356',  // Malta
  '357',  // Cyprus
  '358',  // Finland
  '359',  // Bulgaria
  '370',  // Lithuania
  '371',  // Latvia
  '372',  // Estonia
  '373',  // Moldova
  '374',  // Armenia
  '375',  // Belarus (questionable)
  '376',  // Andorra
  '377',  // Monaco
  '378',  // San Marino
  '380',  // Ukraine
  '381',  // Serbia
  '382',  // Montenegro
  '383',  // Kosovo
  '385',  // Croatia
  '386',  // Slovenia
  '387',  // Bosnia and Herzegovina
  '389',  // North Macedonia
  '420',  // Czech Republic
  '421',  // Slovakia
  '423',  // Liechtenstein
  '506',  // Costa Rica
  '507',  // Panama
  '593',  // Ecuador
  '598',  // Uruguay
  '670',  // Timor-Leste
  '675',  // Papua New Guinea
  '677',  // Solomon Islands
  '678',  // Vanuatu
  '679',  // Fiji
  '685',  // Samoa
  '686',  // Kiribati
  '688',  // Tuvalu
  '691',  // Micronesia
  '692',  // Marshall Islands
  '674',  // Nauru
  '680',  // Palau
  '886',  // Taiwan
  '972',  // Israel
];


/** Check whether a given value is a country code. */
const isCountryCode = (value) => COUNTRY_CODES.includes(value);

export {
  COUNTRY_CODES,
  isCountryCode,
};
