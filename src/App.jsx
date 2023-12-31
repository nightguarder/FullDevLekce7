import React,{ useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  //1. Submit the file locally
  const handleSubmit = async (event) => {
    event.preventDefault();
    const presignedPost = await requestPresignedPost(file);
    console.log(presignedPost);
    const uploadedFileUrl = await uploadFile(file, presignedPost);
    console.log(uploadedFileUrl);
    setUploadedFileUrl(uploadedFileUrl);
  };

  //2. Prepare the PUT request
  async function uploadFile(file, presignedPost) {
    const formData = new FormData();
    formData.append("Content-Type", file.type);
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    const res = await fetch(presignedPost.url, {
      method: "POST",
      body: formData,
    });
    //Obtain the url
    if (res.ok) {
      //Not the best solution I know
      const bucket = 'fulldevlekce7'
      const region = 'eu-north-1'
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${presignedPost.fields.key}`;
      return fileUrl;
    } else {
      throw new Error('Upload failed with status ' + res.status);
    }
  }
//3. Request to begin-upload (server)
  async function requestPresignedPost(file) {
    const { type } = file;
    const res = await fetch("http://localhost:5000/begin-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
      }),
    });
    return res.json();
  }

  return (
    <div className="App">
      <h1>FullDevLekce 7 - S3 Upload </h1>

<input type="file" name="file" onChange={handleFileChange} />
{isFilePicked ? (
  <p>Filename: {file.name} selected</p>
) : (
  <p>Select a file to show details</p>
)}

{isFilePicked && <button onClick={handleSubmit}>Upload!</button>}
{uploadedFileUrl && (
  <React.Fragment>
    <h3>Congrats!! Your file was uploaded</h3>
    <p>File URL: {uploadedFileUrl}</p>
  </React.Fragment>
)}
    </div>
  );
}
export default App
