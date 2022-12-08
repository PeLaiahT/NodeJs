import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import jwt from "jsonwebtoken";
import cors from "cors";
require("dotenv").config();

let app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: true }));

connectDB();

// app.use((req, res, next) => {
//   var pathName = req.url;
//   if (pathName.includes("/api/login" || pathName.includes("/"))) {
//     next();
//   } else {
//     var token = req.rawHeaders[11].replace("Bearer", "").replace(/ /g, "");
//     if (token) {
//       jwt.verify(token, "bolathai199x", async (err, decoded) => {
//         if (err) {
//           res
//             .status(403)
//             .send({ success: false, message: "Failed to authenticate user." });
//         } else {
//           req.decoded = decoded;
//           next();
//         }
//       });
//     } else {
//       res.status(403).send({ success: false, message: "No Token Provided." });
//     }
//   }
// });
viewEngine(app);
initWebRoutes(app);

let port = process.env.PORT || 6868;
app.listen(port, () => {
  console.log("App is runing on the port : " + port);
});
