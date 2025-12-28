import { useNavigate } from "react-router-dom";
import MedicinesTable from "./components/medicine-table";

export const Medicine = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    // navigate("/medicine-create");
    console.log("clicked");
  };

  return <div>{<MedicinesTable handleClick={handleClick} />}</div>;
};
