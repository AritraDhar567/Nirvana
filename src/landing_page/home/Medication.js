import React, { useState } from 'react';
import '../home/PredictMedication.css'; // Importing the CSS file for styling
import TopSymptomsChart from './TopSymptomsChart';

const PredictMedications = () => {
  const [medications, setMedications] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleSymptom, setVisibleSymptom] = useState(null); // Track which symptom's medications are visible

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict_medications');
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setMedications(data);
        setError(null);
      } else {
        setError(data.error || 'Error fetching medications.');
        setMedications(null);
      }
    } catch (err) {
      setError('Error connecting to the server.');
      setMedications(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleMedications = (symptom) => {
    // Toggle visibility of the medications for a specific symptom
    if (visibleSymptom === symptom) {
      setVisibleSymptom(null); // Hide if already visible
    } else {
      setVisibleSymptom(symptom); // Show the selected symptom's medications
    }
  };

  return (
    <div className="medication-page-wrapper">
      <h1>Predicted Medication</h1>

      <div className="content-wrapper">
        {/* Left section: Predicted Medications */}
        <div className="medication-wrapper">
          <h2>Predicted Medications for Top Symptoms</h2>

          {/* Button to fetch medications */}
          <button className="medication-fetch-button" onClick={fetchMedications} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Medications'}
          </button>
          
      {loading && (
        <div className='loadd'>
          <div className='loader'>Loading...</div>
        </div>
      )}


          {/* Display loading, error, medications, or empty state */}
          {loading ? (
            <div className="medication-loading">Loading Medications...</div>
          ) : error ? (
            <div className="medication-error">{error}</div>
          ) : medications ? (
            <table className="medication-table">
              <thead>
                <tr>
                  <th>Symptom</th>
                  <th>Actions</th>
                  <th>Medications</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(medications).map((symptom, index) => (
                  <tr key={index}>
                    <td>{symptom}</td>
                    <td>
                      {/* Button to toggle medications for each symptom */}
                      <button className="medication-fetch-button" onClick={() => toggleMedications(symptom)}>
                        {visibleSymptom === symptom ? 'Hide Medications' : 'Show Medications'}
                      </button>
                    </td>
                    <td>
                      {/* Conditionally show medications if this symptom is visible */}
                      {visibleSymptom === symptom && (
                        <ul className="medication-list">
                          {medications[symptom].map((medication, i) => (
                            <li className="medication-item" key={i}>{medication}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div ></div>
          )}
        </div>

        {/* Right section: Top Symptoms Chart */}
        <div className="chart-wrapper">
        <h2>Pie-Chart Data for Top Symptoms </h2>
          <TopSymptomsChart />
        </div>
      </div>
    </div>
  );
};

export default PredictMedications;
