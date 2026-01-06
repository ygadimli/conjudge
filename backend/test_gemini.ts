import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, ".env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    console.log("Fetching model list using Axios...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const response = await axios.get(url);
        console.log("Success! Available models:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error("Axios Test Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

listModels();
