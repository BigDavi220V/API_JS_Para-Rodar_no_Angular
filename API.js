// server.js
const express = require("express");
const path = require("path");
const cors = require("cors")

const app = express();
const PORT = 3001; // Porta 3001

app.use(cors());
app.use(express.json());

// Permitir servir arquivos estáticos (como imagens) do diretório raiz da API.
// NOTA: Se você for rodar esta API no diretório raiz do seu projeto Angular,
// você pode precisar ajustar o `path.join(__dirname)`
app.use(express.static(path.join(__dirname)));

// ======================================================================
// DADOS MOCKADOS
// ======================================================================

// Dados dos Modelos (GET /vehicles)
const db_vehicles = [
    {
        id: 1,
        vehicle: "Ranger",
        volumetotal: 85000, // Usado como totalSales
        connected: 72000,
        softwareUpdates: 69000, // Usado como updated
        img: "http://localhost:3001/assets/Ranger_Ford.png", // Usando o caminho direto da API
        model_name: "Ranger" // Nome usado para a lista de seleção
    },
    {
        id: 2,
        vehicle: "Mustang",
        volumetotal: 15000,
        connected: 14500,
        softwareUpdates: 14000,
        img: "http://localhost:3001/assets/ford mustang.avif",
        model_name: "Mustang"
    },
    {
        id: 3,
        vehicle: "Territory",
        volumetotal: 35000,
        connected: 30000,
        softwareUpdates: 28000,
        img: "http://localhost:3001/assets/Territory_Ford.webp",
        model_name: "Territory"
    },
    {
        // Renomeado de "Bronco Sport" para "Bronco" para corresponder ao seu dropdown original
        id: 4, 
        vehicle: "Bronco",
        volumetotal: 18000,
        connected: 17500,
        softwareUpdates: 16800,
        img: "http://localhost:3001/assets/BRONCO.webp", // Usando a imagem correta
        model_name: "Bronco"
    }
];

// Dados de Detalhe do Veículo (POST /vehicleData)
const db_vehicleDetails = [
    { vin: "2FRHDUYS2Y63NHD22454", odometer: 23344, status: "on", lat: -12.2322, long: -35.2314 },
    { vin: "2RFAASDY54E4HDU34874", odometer: 130000, status: "off", lat: -12.2322, long: -35.2314 },
    { vin: "2FRHDUYS2Y63NHD22455", odometer: 50000, status: "on", lat: -12.2322, long: -35.2314 },
    { vin: "2RFAASDY54E4HDU34875", odometer: 10000, status: "off", lat: -12.2322, long: -35.2314 },
    { vin: "2FRHDUYS2Y63NHD22654", odometer: 23544, status: "on", lat: -12.2322, long: -35.2314 },
    { vin: "2FRHDUYS2Y63NHD22854", odometer: 23574, status: "on", lat: -12.2322, long: -35.2314 }
];


// ======================================================================
// ROTAS DA API
// ======================================================================

// ROTA: POST /login (Mantida a lógica de login)
app.post("/login", async (req, res) => {
    try {
        const { nome, senha } = req.body

        if (!nome || !senha) {
            return res.status(400).json({
                message: "O campo de usuário ou senha não foi preenchido!"
            });
        }

        if (nome !== "admin" || senha !== "123456") {
            return res.status(401).json({
                message: "O nome de usuário ou senha está incorreto ou não foi cadastrado!"
            });
        }

        return res.status(200).json({
            id: 1,
            nome: "admin",
            email: "admin@email.com"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Falha na comunicação com o servidor!",
            error: String(error)
        });
    }
});

// ROTA: GET /vehicles (Lista todos os veículos. Usado para o Dropdown)
app.get("/vehicles", (req, res) => {
    try {
        // Retorna APENAS os dados necessários para o dropdown
        const modelSummaries = db_vehicles.map(v => ({ model: v.model_name }));
        // Aqui retornamos o objeto completo da API que você forneceu, mas o Angular usará apenas o campo `model`.
        return res.status(200).json({ vehicles: db_vehicles });
    } catch (error) {
        return res.status(500).json({
            message: "Falha na comunicação com o servidor!"
        });
    }
});

// ROTA: GET /vehicles/:model (Retorna os dados AGREGADOS do modelo)
app.get("/vehicle/:model", (req, res) => {
    try {
        const modelParam = req.params.model;
        const data = db_vehicles.find(v => v.model_name.toLowerCase() === modelParam.toLowerCase());

        if (data) {
            // Mapeia para o formato esperado pelo DashboardComponent
            return res.status(200).json({
                model: data.model_name,
                totalSales: data.volumetotal,
                connected: data.connected,
                updated: data.softwareUpdates,
                image: data.img
            });
        } else {
            return res.status(404).json({ message: "Modelo não encontrado." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Falha ao carregar dados do modelo.", error: String(error) });
    }
});


// ROTA: POST /vehicleData (Busca detalhes do veículo pelo VIN - Busca na tabela)
app.post("/vehicleData", (req, res) => {
    try {
        const { vin } = req.body;
        
        if (!vin) {
            return res.status(400).json({ message: "VIN é obrigatório." });
        }

        const detail = db_vehicleDetails.find(d => d.vin.toLowerCase() === vin.toLowerCase());

        if (detail) {
            // Mapeia para o formato esperado pelo DashboardComponent
            return res.status(200).json({
                code: detail.vin,
                odometer: detail.odometer,
                status: detail.status,
                lat: detail.lat,
                long: detail.long
            });
        } else {
            // Retorna 200 com null se não encontrar (conforme padrão do service Angular)
            return res.status(200).json(null); 
        }

    } catch (error) {
        return res.status(500).json({
            message: "Falha na comunicação com o servidor!"
        });
    }
});


app.listen(PORT, () => {
    console.log(`API FORD rodando em http://localhost:${PORT}/`);
    console.log(`Endpoints: /login (POST), /vehicles (GET), /vehicle/:model (GET), /vehicleData (POST)`);
});