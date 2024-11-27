# Quiz Application

## Requirements
- **Node.js**
- **npm**

---

## Client Applications

### Quiz
This is the client-side application for quiz functionality.
Run following in quiz directory

- **Build Command**:
  ```bash
  npm run build
  ```


### QuizAdmin
This is the client-side application for viewing and managing CSV uploads.
Run following in quiz_admin directory

- **Build Command**:
  ```bash
  npm run build
  ```


### Server
Run following in root directory
- **Build Command**:
  ```bash
  npm install
  node server.js
  ```

### URL	Description


## URL Mapping

| **URL**         | **Description**                                            |
|------------------|------------------------------------------------------------|
| `/`              | Login Page                                                 |
| `/result`        | Get the combined result in CSV format. **Credentials**: `admin` / `password` |
| `/admin`         | Upload a CSV to view it in tabular format                  |



### Run this build and run the server in one command
In root directory run 'npm install'
- **Build Command**:
  ```bash
  ./build_and_run.sh
  ```