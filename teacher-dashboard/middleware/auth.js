// middleware/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY || "SECRET123";

const verifyToken = (req, res, next) => {
  console.log("\n=== 🔐 JWT Verification Started ===");
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader ? "Present" : "Missing");
  
  if (!authHeader) {
    console.error("❌ No Authorization header found");
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // Extract token
  const parts = authHeader.split(" ");
  console.log("Authorization parts:", parts);
  
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.error("❌ Invalid Authorization format. Expected: Bearer <token>");
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  const token = parts[1];
  console.log("Token extracted:", token ? `${token.substring(0, 20)}...` : "empty");

  if (!token) {
    console.error("❌ Token is empty");
    return res.status(401).json({ error: "Token missing" });
  }

  // Verify token
  try {
    console.log("Secret key being used:", secret ? `${secret.substring(0, 10)}...` : "undefined");
    
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    
    console.log("✅ Token verified successfully!");
    console.log("Decoded payload:", JSON.stringify(decoded, null, 2));
    console.log("User ID:", decoded.id);
    console.log("User Email:", decoded.sub);
    console.log("Roles:", decoded.roles);
    
    req.user = decoded;
    console.log("=== ✅ JWT Verification Complete ===\n");
    next();
    
  } catch (err) {
    console.error("❌ JWT verification failed!");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    
    if (err.name === "JsonWebTokenError") {
      console.error("This usually means the secret key doesn't match or token is malformed");
    } else if (err.name === "TokenExpiredError") {
      console.error("Token has expired");
    }
    
    console.error("Full error:", err);
    console.log("=== ❌ JWT Verification Failed ===\n");
    
    return res.status(401).json({ 
      error: "Invalid token",
      details: err.message,
      type: err.name
    });
  }
};

module.exports = verifyToken;