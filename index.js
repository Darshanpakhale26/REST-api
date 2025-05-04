const express = require("express");
const fs = require("fs"); // Importing the fs module to read files
const path = require("path"); // Importing the path module to work with file paths
const app = express();
const PORT = 8000; // Port number
const users = require("./MOCK_DATA.json"); // Importing the users data

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request body

// Middleware to parse JSON request body

app.get("/api/users", (req, res) => {
  return res.json(users); // Send the users data as JSON response
});

app.get("/users", (req, res) => {
  const html = `
        <html>
            <head>
                <title>Users</title>
            </head>
            <body>
                <h1>Users</h1>
                <ol>
                    ${users
                      .map(
                        (user) =>
                          `<li>${user.first_name} ${user.last_name}</li>`
                      )
                      .join("")}
                </ol>
            </body>
        </html>`; // Create a simple HTML page with the users list

  res.send(html); // Send the HTML response
});

//

app.get("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id); // Get the user ID from the request parameters
  const user = users.find((user) => user.id === userId); // Find the user with the given ID

  if (user) {
    return res.json(user); // If user is found, send it as JSON response
  } else {
    return res.status(404).json({ message: "User not found" }); // If not found, send 404 status with message
  }
});

app.post("/api/users", (req, res) => {
  const newUser = {
    id: users.length + 1, // Assign a new ID based on the current length of the users array
    first_name: req.body.first_name, // Get first name from request body
    last_name: req.body.last_name, // Get last name from request body
    email: req.body.email, // Get email from request body
    gender: req.body.gender,
  };

  users.push(newUser); // Add the new user to the users array

  // Write updated users array back to the file
  fs.writeFile(
    path.join(__dirname, "MOCK_DATA.json"),
    JSON.stringify(users, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing to file:", err); // Log error if writing fails
        return res.status(500).json({ error: "Internal Server Error" }); // Send 500 status with error message
      }

      return res.status(201).json(newUser); // Send the newly created user as JSON response with 201 status
    }
  );
});


app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id); // Get the user ID from the request parameters
  const userIndex = users.findIndex((user) => user.id === userId); // Find the index of the user with the given ID

  if (userIndex !== -1) {
    const updatedUser = {
      ...users[userIndex], // Spread the existing user data
      ...req.body, // Override with new data from request body
    };

    users[userIndex] = updatedUser; // Update the user in the array

    // Write updated users array back to the file
    fs.writeFile(
      path.join(__dirname, "MOCK_DATA.json"),
      JSON.stringify(users, null, 2),            
      (err) => {
        if (err) {
          console.error("Error writing to file:", err); // Log error if writing fails
          return res.status(500).json({ error: "Internal Server Error" }); // Send 500 status with error message
        }

        return res.json(updatedUser); // Send the updated user as JSON response
      }
    );
  } else {
    return res.status(404).json({ message: "User not found" }); // If not found, send 404 status with message
  }
});


// Endpoint to delete a user by ID
// This endpoint handles DELETE requests to remove a user from the users array

app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id); // Get the user ID from the request parameters
  const userIndex = users.findIndex((user) => user.id === userId); // Find the index of the user with the given ID

  if (userIndex !== -1) {
    users.splice(userIndex, 1); // Remove the user from the array

    // Write updated users array back to the file
    fs.writeFile(
      path.join(__dirname, "MOCK_DATA.json"),
      JSON.stringify(users, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to file:", err); // Log error if writing fails
          return res.status(500).json({ error: "Internal Server Error" }); // Send 500 status with error message
        }

        return res.status(204).send(); // Send 204 No Content status
      }
    );
  } else {
    return res.status(404).json({ message: "User not found" }); // If not found, send 404 status with message
  }
});
