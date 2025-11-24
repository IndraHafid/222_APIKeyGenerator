
const express = require("express");
const cors = require("cors");
const app = express();
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

app.use(cors());
app.use(express.json());

app.use("/api", apiKeyRoutes);
app.use("/api/admin", adminAuthRoutes);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
