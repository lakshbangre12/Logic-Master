
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Parse JSON requests
app.use(express.json());

// Serve the existing frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Load Member 3's public interface
const member3 = require("./backend/member3/member3Interface");

// Equivalence checker
app.post("/api/equivalence", (req, res) => {
    try {
        const { expression1, expression2 } = req.body;

        if (!expression1 || !expression2) {
            return res.status(400).json({
                success: false,
                error: "Please enter both logical expressions."
            });
        }

        const result = member3.runEquivalence(
            expression1,
            expression2
        );

        res.json({ success: true, result });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Inference checker
app.post("/api/inference", (req, res) => {
    try {
        const { premises, conclusion } = req.body;

        if (!Array.isArray(premises) ||
            premises.length === 0 ||
            !conclusion) {
            return res.status(400).json({
                success: false,
                error: "Enter at least one premise and a conclusion."
            });
        }

        const result = member3.runInference(
            premises,
            conclusion
        );

        res.json({ success: true, result });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Get inference rule names
app.get("/api/rules", (req, res) => {
    try {
        res.json({
            success: true,
            rules: member3.getRuleNames()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`LogicMaster running at http://localhost:${PORT}`);
});
