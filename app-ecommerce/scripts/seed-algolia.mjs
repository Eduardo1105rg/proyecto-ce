import { algoliasearch } from "algoliasearch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const appId = process.env.VITE_ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.VITE_ALGOLIA_INDEX_MAIN;

if (!appId) {
    throw new Error("ALGOLIA_APP_ID no encontrado en .env");
}

if (!adminApiKey) {
    throw new Error("ALGOLIA_ADMIN_API_KEY no encontrado en .env");
}

if (!indexName) {
    throw new Error("ALGOLIA_INDEX_NAME no encontrado en .env");
}

// Crear cliente de Algolia
const client = algoliasearch(appId, adminApiKey);

// Leer archivo JSON
const products = JSON.parse(
    fs.readFileSync(new URL("../src/data/products.json", import.meta.url), "utf-8")
);


console.log(`Productos encontrados: ${products.length}`);
console.log(`Índice destino: ${indexName}`);

try {
    // Guardar productos en Algolia
    const response = await client.saveObjects({
        indexName,
        objects: products,
        autoGenerateObjectIDIfNotExist: true,
    });

    console.log("Datos indexados correctamente en Algolia.");
    console.log(`Productos enviados: ${products.length}`);
    console.log("Respuesta:", response);
} catch (error) {
    console.error("Error al indexar los productos:", error);
    process.exit(1);
}
