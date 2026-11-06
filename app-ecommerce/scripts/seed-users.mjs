import { algoliasearch } from "algoliasearch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const appId = process.env.VITE_ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.VITE_ALGOLIA_INDEX_USERS;

if (!appId) {
    throw new Error("VITE_ALGOLIA_APP_ID no encontrado en .env");
}

if (!adminApiKey) {
    throw new Error("ALGOLIA_ADMIN_API_KEY no encontrado en .env");
}

if (!indexName) {
    throw new Error("VITE_ALGOLIA_INDEX_USERS no encontrado en .env");
}

const ROLES_VALIDOS = new Set(["B2C", "B2B", "ADMIN"]);

/**
 * Valida un registro de users.json y normaliza los campos de acceso.
 * El índice es la única fuente de usuarios de la aplicación: no existe
 * registro ni CRUD desde el frontend, solo lectura.
 */
function validarUsuario(usuario, indice) {
    const prefijo = `users.json[${indice}]`;

    if (typeof usuario?.objectID !== "string" || usuario.objectID.trim() === "") {
        throw new Error(`${prefijo}: objectID es obligatorio.`);
    }

    if (typeof usuario.username !== "string" || usuario.username.trim() === "") {
        throw new Error(`${prefijo}: username es obligatorio.`);
    }

    if (typeof usuario.password !== "string" || usuario.password === "") {
        throw new Error(`${prefijo}: password es obligatorio.`);
    }

    if (!ROLES_VALIDOS.has(usuario.rol)) {
        throw new Error(
            `${prefijo}: rol inválido "${usuario.rol}". Use B2C, B2B o ADMIN.`,
        );
    }

    return {
        ...usuario,
        username: usuario.username.trim().toLowerCase(),
        correo:
            typeof usuario.correo === "string"
                ? usuario.correo.trim().toLowerCase()
                : usuario.correo,
    };
}

const usuarios = JSON.parse(
    fs.readFileSync(new URL("../src/data/users.json", import.meta.url), "utf-8"),
).map(validarUsuario);

const client = algoliasearch(appId, adminApiKey);

console.log(`Usuarios encontrados: ${usuarios.length}`);
console.log(`Índice destino: ${indexName}`);

for (const usuario of usuarios) {
    console.log(`- ${usuario.username} (${usuario.rol})`);
}

try {
    await client.setSettings({
        indexName,
        indexSettings: {
            searchableAttributes: ["username", "nombre", "correo"],
            attributesForFaceting: ["rol"],
        },
    });

    // Reemplaza el contenido del índice por el conjunto canónico de users.json.
    // Así se eliminan usuarios viejos o creados manualmente desde el dashboard.
    const response = await client.replaceAllObjects({
        indexName,
        objects: usuarios,
    });

    console.log("Índice reemplazado con el conjunto canónico de usuarios.");
    console.log(`Usuarios enviados: ${usuarios.length}`);
    console.log("Respuesta:", response);
} catch (error) {
    console.error("Error al indexar los usuarios:", error);
    process.exit(1);
}
