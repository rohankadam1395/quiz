var express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const basicAuth = require('express-basic-auth');


// Import the questions array
const questions = require('./questions');


var app = express();

const hostname = '0.0.0.0';  // This allows external access
const port = 8080;

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, 'quiz/build')));
app.use(express.static(path.join(__dirname, 'quiz_admin', 'build')));


app.use(express.json());
app.use(cors()); // Enable CORS for all routes


// Middleware to parse JSON request bodies
app.use(bodyParser.json());


// Function to get 30 random questions
function getRandomQuestions() {
  // Create a copy of the questions array to avoid modifying the original array
  const questionsCopy = [...questions];
  
  // Shuffle the array using Fisher-Yates (Durstenfeld) shuffle
  for (let i = questionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
  }

  // Return the first 30 questions (or less if there aren't enough)
  return questionsCopy.slice(0, 30);
}

// Utility function to process JSON files and output CSV
function processJsonFiles(directory, questionsFile, outputCsv, callback) {
  const csvHeader = ["userId", "name", "email", "answers", "correct_count", "submittedAt", "correct_answers"];
  const csvData = [];

  // Read the questions.js file and map questions by id
  fs.readFile(questionsFile, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading questions file:", err);
          callback(err);
          return;
      }

      let questions = [];
      try {
          // Parsing the questions.js file, which is in module.exports format
          questions = require(questionsFile);  // Import the questions.js directly
      } catch (err) {
          console.error("Error reading or parsing questions file:", err);
          callback(err);
          return;
      }

      const questionsMap = questions.reduce((acc, question) => {
          acc[question.id] = question.correct_answer;  // Map each question by its id
          return acc;
      }, {});

      // Read all files in the directory
      fs.readdir(directory, (err, files) => {
          if (err) {
              console.error("Error reading directory:", err);
              callback(err);
              return;
          }

          // Process each JSON file in the directory
          files.forEach((filename) => {
              const filePath = path.join(directory, filename);

              // Read and parse the JSON file
              fs.readFile(filePath, 'utf8', (err, data) => {
                  if (err) {
                      console.error("Error reading file:", filePath);
                      return;
                  }

                  try {
                      const jsonData = JSON.parse(data);
                      const answers = jsonData.answers || [];
                      const combinedAnswers = JSON.stringify(answers);

                      // Get the correct answers for each question
                      const correctAnswers = answers.map((answer) => {
                          const correctAnswer = questionsMap[answer.questionId];  // Get the correct answer from the map
                          return {
                              questionId: answer.id,
                              correct_answer: correctAnswer || "Not Available"  // If no correct answer is found
                          };
                      });

                      const correctCount = answers.filter((answer) => {
                          const correctAnswer = questionsMap[answer.questionId];  // Get the correct answer from the map
                          return correctAnswer && answer.answer === correctAnswer;  // Compare the answer with correct_answer
                      }).length;

                      // Push data to be written in CSV format
                      csvData.push({
                          userId: jsonData.userId || '',
                          name: jsonData.name || '',
                          email: jsonData.email || '',
                          answers: combinedAnswers,
                          correct_count: correctCount,
                          submittedAt: jsonData.submittedAt || '',
                          correct_answers: JSON.stringify(correctAnswers)  // Add the correct answers as a string
                      });

                      // Once all files have been processed, write the CSV
                      if (csvData.length === files.length) {
                          const parser = new Parser({ fields: csvHeader });
                          const csv = parser.parse(csvData);

                          // Write the CSV data to the output file
                          fs.writeFile(outputCsv, csv, (err) => {
                              if (err) {
                                  console.error("Error writing CSV file:", err);
                                  callback(err);
                                  return;
                              }
                              console.log(`CSV file '${outputCsv}' created successfully!`);
                              callback(null);
                          });
                      }
                  } catch (err) {
                      console.error("Error parsing JSON in file:", filePath);
                  }
              });
          });
      });
  });
}

// Define a route to serve the random questions
app.get('/questions', (req, res) => {
  const randomQuestions = getRandomQuestions();
  res.json(randomQuestions); // Send the questions as a JSON response
});


// Middleware for basic authentication only on /process-json endpoint
app.get('/result', basicAuth({
  users: { 'admin': 'password' },  // Replace with your actual username and password
  challenge: true,
  realm: 'Authorization Required'
}), (req, res) => {
  const jsonDirectory = './result_json_files';  // Update this to your directory path
  const outputCsvFile = 'combined_results.csv';
  const questionFile = "./questions.js"

  processJsonFiles(jsonDirectory, questionFile, outputCsvFile, (err) => {
      if (err) {
          res.status(500).send('An error occurred while processing the JSON files.');
          return;
      }

      // Send the CSV file as a download response
      res.download(outputCsvFile, (err) => {
          if (err) {
              console.error('Error sending file:', err);
              res.status(500).send('Error sending the CSV file.');
          } else {
              console.log('CSV file sent successfully.');
          }
      });
  });
});



// Define the POST route to save answers
app.post('/submit-answers', (req, res) => {
  const { userId, name, email, answers } = req.body;

  // Log the received data
  console.log("Received submission:", { userId, name, email, answers });

  // Prepare the data to be saved
  const submissionData = {
    userId,
    name,
    email,
    answers,
    submittedAt: new Date().toISOString(),
  };

  // Define the file path using userId as filename
  const filePath = path.join(__dirname, 'result_json_files', `${userId}.json`);

  // Write the data to the file with the userId as the filename
  fs.writeFile(filePath, JSON.stringify(submissionData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Failed to save answers' });
    }

    // Respond to the client
    res.status(200).json({ message: 'Answers submitted successfully' });
  });
});

app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'quiz_admin','build', 'index.html'));
});

// Serve React's index.html for all routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'quiz','build', 'index.html'));
});


app.listen(port, hostname,  () => {
  console.log(`Server is running on port ${port}`);
});
