import MedicinesTable from './components/medicine-table';

const Medicine = () => {
  const handleClick = () => {
    // navigate("/medicine-create");
    console.log('clicked');
  };

  return <div>{<MedicinesTable handleClick={handleClick} />}</div>;
};

export default Medicine;
