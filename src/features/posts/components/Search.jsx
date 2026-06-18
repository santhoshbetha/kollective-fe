// Full-Text Search
const [results, setResults] = useState([]);

const handleSearch = async (query) => {
  const { data } = await axios.get(`/api/posts?q=${query}`);
  setResults(data.data);
};

return (
  <input 
    type="text" 
    placeholder="Search for posts (e.g. #protest or 'peaceful')..." 
    onChange={(e) => handleSearch(e.target.value)} 
    className="w-full p-2 border rounded-lg"
  />
);
