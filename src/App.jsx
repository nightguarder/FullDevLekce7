import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [processedData, setProcessedData] = useState([]);
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  //After file is submitted
  const handleSubmission = async () => {
    
    let uploadData = await getUploadData();
    let uploadID = uploadData.uploadID;
    let fileLocation = uploadData.fileLocation;

    //Wait for upload
    await uploadToAWS(fileLocation);

    //Step 3 we tell our server we are done with the upload
    let processedData = await tellServerComplete(uploadID);
    setIsDataProcessed(true);
    setProcessedData(processedData.results);
  };

  const getUploadData = () => {
    return new Promise((resolve) => {
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
        .then((data) => resolve(data));
    });
  };

  const uploadToAWS = (fileLocation) => {
    return new Promise((resolve) => {
      //Make put request with raw file as body
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "multipart/form-data" },
        body: selectedFile,
      };
      //Perform the upload
      fetch(fileLocation, requestOptions)
        .then((response) => {
          if (response.status === 200) resolve(true);
          else resolve(false);
        })
        .catch((error) => {
          console.log(error);
          resolve(false);
        });
    });
  };
  //handle when the upload is done 
  const tellServerComplete = (uploadID) => {
    return new Promise((resolve) => {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadID: uploadID }),
      };
      fetch("http://localhost:5000/process-upload", requestOptions)
        .then((response) => response.json())
        .then((data) => resolve(data));
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
          <h1>Congrats!! We Uploaded the following records</h1>
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
