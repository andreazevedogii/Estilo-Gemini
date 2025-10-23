require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 3001;

// --- CONFIGURAÇÃO DAS CHAVES DO ABACATE PAY (CARREGADAS DO ARQUIVO .env) ---
const ABACATE_API_KEY = process.env.ABACATE_API_KEY;
const ABACATEPAY_PUBLIC_KEY = process.env.ABACATEPAY_PUBLIC_KEY;
const ABACATE_API_URL = 'https://api.abacatepay.com/v1';

// Validação inicial para garantir que as chaves foram configuradas
if (!ABACATE_API_KEY || !ABACATEPAY_PUBLIC_KEY) {
    console.error("\n[ERRO CRÍTICO] As variáveis de ambiente ABACATE_API_KEY e ABACATEPAY_PUBLIC_KEY não foram definidas.");
    console.error("1. Crie um arquivo chamado '.env' na raiz do projeto.");
    console.error("2. Copie o conteúdo de '.env.example' para o novo arquivo '.env'.");
    console.error("3. Preencha o arquivo '.env' com suas chaves reais da Abacate Pay.");
    console.error("O servidor não pode iniciar sem as chaves.\n");
    process.exit(1); // Encerra o processo se as chaves não estiverem configuradas
}


// --- SIMULAÇÃO DE BANCO DE DADOS ---
const diamondPackages = {
    'pkg_100': 100,
    'pkg_500': 500,
    'pkg_1000': 1000,
    'pkg_2500': 2500,
};

let users = {
    'user_123': { name: 'Usuário Teste 1', diamonds: 20 },
    'user_456': { name: 'Usuário Teste 2', diamonds: 0 },
};


// Habilita o CORS para permitir requisições do seu frontend
app.use(cors());

// Captura o corpo bruto da requisição para validação do webhook
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));


// Rota para criar um PIX QR Code
app.post('/api/abacatepay/create-payment-link', async (req, res) => {
    const { id, title, unit_price, userId } = req.body;

    if (!id || !title || !unit_price || !userId) {
        return res.status(400).json({ error: 'Dados do pacote ou ID do usuário inválidos.' });
    }

    try {
        const payload = {
            amount: Math.round(Number(unit_price) * 100),
            description: `Compra de ${title} no Estilo Gemini`,
            customer: {
                name: "Cliente Estilo Gemini",
                email: `user+${userId}@example.com`,
                taxId: "999.999.999-99"
            },
            metadata: { package_id: id, userId: userId },
        };

        const response = await axios.post(`${ABACATE_API_URL}/pixQrCode/create`, payload, {
            headers: {
                'Authorization': `Bearer ${ABACATE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Resposta da API Abacate Pay (/pixQrCode/create):', JSON.stringify(response.data, null, 2));
        
        const pixQrCodeBase64 = response.data.imageBase64;
        const pixCopyPaste = response.data.copyPaste;

        if (!pixQrCodeBase64 || !pixCopyPaste) {
            console.error('Resposta da API do Abacate Pay não contém os campos esperados (imageBase64, copyPaste):', response.data);
            return res.status(500).json({ error: 'Resposta inválida da API de pagamento ao gerar PIX.' });
        }

        console.log(`Dados de PIX gerados para o usuário ${userId}`);
        res.json({ pixQrCodeBase64, pixCopyPaste });

    } catch (error) {
        console.error('Erro detalhado ao gerar PIX no Abacate Pay:');
        let errorMessage = 'Falha na comunicação com o provedor de pagamento.';
        let statusCode = 500;

        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Status:', error.response.status);
            
            const apiError = error.response.data?.error || error.response.data?.message;
            if (apiError) {
                errorMessage = `Erro do Provedor: ${apiError}`;
            }
            statusCode = error.response.status;
        } else if (error.request) {
            console.error('Request:', 'Nenhuma resposta recebida do servidor da Abacate Pay.');
            errorMessage = 'Não foi possível conectar ao provedor de pagamento. Verifique a conexão de rede.';
        } else {
            console.error('Error', error.message);
            errorMessage = error.message;
        }
        res.status(statusCode).json({ error: errorMessage });
    }
});

// Endpoint para receber webhooks do Abacate Pay
app.post('/webhook/abacatepay', (req, res) => {
    const signatureFromHeader = req.headers['x-webhook-signature'];
    
    console.log('\n--- Webhook Recebido ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Corpo:', JSON.stringify(req.body));
    
    if (!signatureFromHeader) {
        console.warn('Webhook recebido sem o cabeçalho X-Webhook-Signature.');
        return res.status(400).send('Assinatura do webhook ausente.');
    }
    
    try {
        const expectedSignature = crypto
            .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
            .update(req.rawBody)
            .digest("base64");

        const signatureIsValid = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureFromHeader));
        
        if (signatureIsValid) {
            console.log('Assinatura do webhook do Abacate Pay verificada com sucesso!');
            const event = req.body;
            console.log(`Evento recebido: ${event.event}`);
            
            if (event.event === 'billing.paid') {
              const paymentData = event.data?.payment;
              const { package_id, userId } = paymentData?.metadata || {};

              if (!userId || !package_id) {
                console.error(`ERRO: 'userId' ou 'package_id' ausentes nos metadados do webhook.`, paymentData?.metadata);
                return res.status(400).send('Metadados ausentes no payload do pagamento.');
              }

              const diamondsToAdd = diamondPackages[package_id];
              
              if (users[userId] && diamondsToAdd) {
                  const oldBalance = users[userId].diamonds;
                  users[userId].diamonds += diamondsToAdd;
                  console.log(`SUCESSO: Pagamento confirmado para o usuário ${userId}.`);
                  console.log(`   - Pacote: ${package_id} (${diamondsToAdd} diamantes)`);
                  console.log(`   - Saldo antigo: ${oldBalance}`);
                  console.log(`   - Novo saldo: ${users[userId].diamonds}`);
              } else {
                  console.error(`ERRO: Usuário (${userId}) ou pacote (${package_id}) não encontrado nos dados do webhook.`);
              }
            }

            res.sendStatus(200);
        } else {
            console.warn('Falha na verificação da assinatura do webhook. Assinatura recebida != Assinatura esperada.');
            console.log('Recebida:', signatureFromHeader);
            console.log('Esperada:', expectedSignature);
            res.sendStatus(403);
        }
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).send('Erro interno no processamento do webhook.');
    }
});


app.listen(port, () => {
    console.log(`Servidor backend de produção rodando em http://localhost:${port}`);
    console.log('Integrado com Abacate Pay (REAL).');
    console.log('Saldos atuais:', users);
});