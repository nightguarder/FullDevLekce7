import { useState } from 'react'
import './App.css'

function App() {
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [processedData, setProcessedData] = useState([]);
  //For the Input File Button
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  //After file is submitted
  const handleSubmission = async () => {
    
    //1. Request to upload
    let uploadData = await getUploadData();
    let fileLocation = uploadData.fileLocation;
    let fileUrl = uploadData.fileUrl;

    //2. Wait for upload
    await uploadToAWS(fileLocation);

    //wait for the completed upload request from AWS
    let processedData = await UploadComplete(fileUrl);
    setIsDataProcessed(true);
    setProcessedData(processedData.results);
  };

  //1. Prepare request and upload data
  const getUploadData = () => {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      };
      fetch("http://localhost:5000/begin-upload", requestOptions)
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error.message));
    });
  };
  //2. Put request to upload
  const uploadToAWS = (fileLocation) => {
    return new Promise((resolve, reject) => {
      // Configure Headers
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      };
      fetch(fileLocation, requestOptions)
        .then((response) => {
          if (response.status === 200) resolve(true);
          else reject('Upload failed with status ' + response.status);
        })
        .catch((error) => reject(error.message));
    });
  };
  
  const UploadComplete = (uploadID) => {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadID: uploadID }),
      };
      fetch("http://localhost:5000/process-upload", requestOptions)
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error.message));
    });
  };



  return (
    <div className="App">
      <h1>FullDevLekce 7 - S3 Upload </h1>

      <input type="file" name="file" onChange={changeHandler} />
      {isFilePicked ? (
        <p>Filename: {selectedFile.name} selected</p>
      ) : (
        <p>Select a file to show details</p>
      )}

      {isFilePicked && <button onClick={handleSubmission}>Upload!</button>}
      {isDataProcessed && (
        <React.Fragment>
          <h1>Congrats!! The following records were uploaded</h1>
          <ul>
            {processedData.map((record, index) => {
              return (
                <li key={index}>
                  {record.Name} {record.Age}
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      )}
    </div>
  );
}
export default App
