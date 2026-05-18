import { useEffect, useState } from "react";
import type { Cafe } from "../types/cafe";
import { getCafesByLocation } from "../services/cafeServices";

function Discover () {
  const [ cafes, setCafes ] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getCafesByLocation(latitude, longitude)
          .then((data) => {
            setCafes(data);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {cafes.map((cafe)=> 
        (<div key={cafe.fsq_id}>{cafe.name}</div>)
      )}  
    </div>
  )
}

export default Discover
