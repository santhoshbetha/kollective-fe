import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

/*
Implementing
Geoapify Address Autocomplete in your React frontend allows users to select a valid address, 
which you then send to your Elixir backend to fetch the specific political districts. 
*/
const OnboardingForm = () => {
  const onPlaceSelect = (value) => {
    if (value) {
      // Send the full formatted address to your Phoenix API
      sendToBackend(value.properties.formatted);
    }
  };

  return (
    <GeoapifyContext apiKey="YOUR_GEOAPIFY_API_KEY">
      <GeoapifyGeocoderAutocomplete
        placeholder="Enter your home address"
        type="address"
        onPlaceSelect={onPlaceSelect}
      />
    </GeoapifyContext>
  );
};


// /npm install @geoapify/geocoder-autocomplete @geoapify/react-geocoder-autocomplete

