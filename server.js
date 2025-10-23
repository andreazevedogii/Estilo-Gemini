const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 3001;

// --- CONFIGURAÇÃO DAS CHAVES DO ABACATE PAY ---
// ATENÇÃO: Substitua pelos seus valores reais de produção antes de publicar.
const ABACATE_API_KEY = 'abc_dev_xjcneqKFpFwAU6bE3pM2TP4f';
// Chave PÚBLICA para verificação da assinatura do webhook HMAC, conforme a documentação.
const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";
const ABACATE_API_URL = 'https://api.abacatepay.com/v1';

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


// Rota para criar um link de pagamento (checkout)
app.post('/api/abacatepay/create-payment-link', async (req, res) => {
    const { id, title, unit_price, userId } = req.body;

    if (!id || !title || !unit_price || !userId) {
        return res.status(400).json({ error: 'Dados do pacote ou ID do usuário inválidos.' });
    }

    try {
        // Payload modificado para solicitar um pagamento PIX diretamente.
        // Removido success_url e cancel_url para indicar que não queremos um fluxo de redirecionamento.
        const payload = {
            method: 'PIX', 
            amount: Math.round(Number(unit_price) * 100), // Valor em centavos
            description: title,
            metadata: { package_id: id, userId: userId }, // Metadados importantes para o webhook
        };

        const response = await axios.post(`${ABACATE_API_URL}/payments`, payload, {
            headers: {
                'Authorization': `Bearer ${ABACATE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        // A API para PIX deve retornar os dados para exibição do QR Code.
        // As propriedades exatas podem variar (ex: qr_code, copy_paste_key, etc.)
        // Assumimos nomes comuns baseados em outras APIs.
        const pixQrCodeBase64 = response.data.pix_qr_code_image_base64;
        const pixCopyPaste = response.data.pix_copy_paste_code;

        if (!pixQrCodeBase64 || !pixCopyPaste) {
            console.error('Resposta da API do Abacate Pay não contém dados PIX esperados:', response.data);
            return res.status(500).json({ error: 'Resposta inválida da API de pagamento ao gerar PIX.' });
        }

        console.log(`Dados de PIX gerados para o usuário ${userId}`);
        res.json({ pixQrCodeBase64, pixCopyPaste });

    } catch (error) {
        console.error('Erro ao gerar PIX no Abacate Pay:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Falha ao comunicar com o Abacate Pay para gerar PIX.' });
    }
});

// Endpoint para receber webhooks do Abacate Pay, conforme documentação
app.post('/webhook/abacatepay', (req, res) => {
    const signatureFromHeader = req.headers['x-webhook-signature'];
    
    console.log('\n--- Webhook Recebido ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Cabeçalhos:', req.headers);
    console.log('Corpo Bruto:', req.rawBody.toString('utf8'));
    
    if (!signatureFromHeader) {
        console.warn('Webhook recebido sem o cabeçalho X-Webhook-Signature.');
        return res.status(400).send('Assinatura do webhook ausente.');
    }
    
    try {
        // Lógica de verificação HMAC-SHA256 conforme a documentação
        const expectedSignature = crypto
            .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
            .update(req.rawBody)
            .digest("base64");

        const signatureIsValid = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureFromHeader));
        
        if (signatureIsValid) {
            console.log('Assinatura do webhook do Abacate Pay verificada com sucesso!');
            const event = req.body;
            console.log(`Evento recebido: ${event.event}`); // ex: 'billing.paid'
            
            // --- LÓGICA DE NEGÓCIO REAL ---
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
            // -----------------------------------------

            res.sendStatus(200);
        } else {
            console.warn('Falha na verificação da assinatura do webhook. Assinatura recebida != Assinatura esperada.');
            console.log('Recebida:', signatureFromHeader);
            console.log('Esperada:', expectedSignature);
            res.sendStatus(403); // Forbidden, pois a assinatura é inválida
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
