import { algoliasearch } from "algoliasearch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const appId = process.env.VITE_ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.VITE_ALGOLIA_INDEX_ORDERS;

if (!appId) {
    throw new Error("VITE_ALGOLIA_APP_ID no encontrado en .env");
}

if (!adminApiKey) {
    throw new Error("ALGOLIA_ADMIN_API_KEY no encontrado en .env");
}

if (!indexName) {
    throw new Error("VITE_ALGOLIA_INDEX_ORDERS no encontrado en .env");
}

const numerosVistos = new Set();

function validarOrden(orden, indice) {
    const prefijo = `orders-demo.json[${indice}]`;

    if (typeof orden?.orderNumber !== "string" || !/^DEMO-\d{4}-\d{4}$/.test(orden.orderNumber)) {
        throw new Error(`${prefijo}: orderNumber debe tener el formato DEMO-YYYY-NNNN.`);
    }

    if (numerosVistos.has(orden.orderNumber)) {
        throw new Error(`${prefijo}: orderNumber duplicado "${orden.orderNumber}".`);
    }

    numerosVistos.add(orden.orderNumber);

    if (orden.origen !== "demo") {
        throw new Error(`${prefijo}: origen debe ser "demo".`);
    }

    if (typeof orden.createdAt !== "string" || Number.isNaN(Date.parse(orden.createdAt))) {
        throw new Error(`${prefijo}: createdAt debe ser una fecha ISO válida.`);
    }

    if (typeof orden.usuarioId !== "string" || orden.usuarioId.trim() === "") {
        throw new Error(`${prefijo}: usuarioId es obligatorio.`);
    }

    if (!["B2C", "B2B", "ADMIN"].includes(orden.rol)) {
        throw new Error(`${prefijo}: rol inválido.`);
    }

    for (const campo of ["fullName", "email", "phone"]) {
        if (typeof orden.buyer?.[campo] !== "string" || orden.buyer[campo].trim() === "") {
            throw new Error(`${prefijo}: buyer.${campo} es obligatorio.`);
        }
    }

    for (const campo of ["province", "canton", "address"]) {
        if (typeof orden.delivery?.[campo] !== "string" || orden.delivery[campo].trim() === "") {
            throw new Error(`${prefijo}: delivery.${campo} es obligatorio.`);
        }
    }

    if (orden.rol === "B2B" && typeof orden.empresa?.nombre !== "string") {
        throw new Error(`${prefijo}: las órdenes B2B deben incluir empresa.`);
    }

    if (!Array.isArray(orden.items) || orden.items.length === 0) {
        throw new Error(`${prefijo}: debe incluir al menos un producto.`);
    }

    for (const [itemIndice, item] of orden.items.entries()) {
        if (typeof item?.objectID !== "string" || item.objectID.trim() === "") {
            throw new Error(`${prefijo}.items[${itemIndice}]: objectID es obligatorio.`);
        }

        if (!["B2C", "B2B"].includes(item.pricingType)) {
            throw new Error(`${prefijo}.items[${itemIndice}]: pricingType inválido.`);
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new Error(`${prefijo}.items[${itemIndice}]: quantity debe ser un entero positivo.`);
        }

        if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
            throw new Error(`${prefijo}.items[${itemIndice}]: unitPrice inválido.`);
        }
    }

    for (const campo of ["subtotal", "tax", "shipping", "total"]) {
        if (typeof orden[campo] !== "number" || !Number.isFinite(orden[campo]) || orden[campo] < 0) {
            throw new Error(`${prefijo}: ${campo} inválido.`);
        }
    }

    return {
        ...orden,
        buyer: {
            ...orden.buyer,
            fullName: orden.buyer.fullName.trim(),
            email: orden.buyer.email.trim().toLowerCase(),
        },
    };
}

const ordenes = JSON.parse(
    fs.readFileSync(new URL("../src/data/orders-demo.json", import.meta.url), "utf-8"),
).map(validarOrden);

const client = algoliasearch(appId, adminApiKey);

console.log(`Órdenes demo encontradas: ${ordenes.length}`);
console.log(`Índice destino: ${indexName}`);

for (const orden of ordenes) {
    console.log(`- ${orden.orderNumber} (${orden.rol}, ${orden.status}/${orden.paymentStatus})`);
}

try {
    await client.setSettings({
        indexName,
        indexSettings: {
            searchableAttributes: [
                "orderNumber",
                "buyer.fullName",
                "buyer.email",
                "empresa.nombre",
                "sucursales.nombre",
            ],
            attributesForFaceting: ["origen", "rol", "status", "paymentStatus"],
        },
    });

    const response = await client.replaceAllObjects({
        indexName,
        objects: ordenes,
    });

    console.log("Índice de órdenes demo reemplazado correctamente.");
    console.log(`Órdenes enviadas: ${ordenes.length}`);
    console.log("Respuesta:", response);
} catch (error) {
    console.error("Error al indexar las órdenes demo:", error);
    process.exit(1);
}
