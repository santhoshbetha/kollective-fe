const [level, setLevel] = useState("all");

const fetchLogs = async (selectedLevel) => {
  const url = selectedLevel === "all" 
    ? "/api/admin/logs" 
    : `/api/admin/logs?level=${selectedLevel}`;
    
  const { data } = await axios.get(url);
  setLogs(data);
};