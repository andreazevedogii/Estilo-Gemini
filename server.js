require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;
const DB_FILE = './db.json';

// --- SIMULAÇÃO DE BANCO DE DADOS EM ARQUIVO JSON ---
let db = {
    users: {
        'user_123': { name: 'Usuário Padrão', diamonds: 20 },
        'user_456': { name: 'Usuário Secundário', diamonds: 0 },
    },
    submissions: [],
    submissionIdCounter: 1
};

const loadDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            db = JSON.parse(data);
            console.log('Banco de dados carregado de db.json.');
        } else {
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
            console.log('db.json não encontrado, criando novo arquivo de banco de dados.');
        }
    } catch (error) {
        console.error("Erro ao carregar o banco de dados:", error);
    }
};

const saveDB = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error("Erro ao salvar o banco de dados:", error);
    }
};

loadDB();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumenta o limite para aceitar imagens em base64


// --- ROTAS DO PAINEL DE ADMIN ---

// [GET] Pega todas as submissões pendentes
app.get('/api/admin/submissions', (req, res) => {
    const pending = db.submissions.filter(s => s.status === 'Pendente');
    res.json(pending);
});

// [POST] Aprova uma submissão
app.post('/api/admin/approve/:submissionId', (req, res) => {
    const { submissionId } = req.params;
    const submission = db.submissions.find(s => s.id === parseInt(submissionId));

    if (!submission) {
        return res.status(404).json({ error: 'Submissão não encontrada.' });
    }
    if (submission.status !== 'Pendente') {
        return res.status(400).json({ error: 'Esta submissão já foi processada.' });
    }

    const user = db.users[submission.userId];
    if (!user) {
        submission.status = 'Rejeitado';
        saveDB();
        console.warn(`Admin aprovou submissão #${submissionId}, mas o usuário ${submission.userId} não foi encontrado. A submissão foi rejeitada.`);
        return res.status(404).json({ error: `Usuário ${submission.userId} não encontrado.` });
    }

    // Ação principal: adicionar diamantes e marcar como aprovado
    user.diamonds += submission.packageDiamonds;
    submission.status = 'Aprovado';
    saveDB();
    
    console.log(`[ADMIN] Submissão #${submissionId} APROVADA para o usuário ${submission.userId}.`);
    console.log(`  - Diamantes adicionados: ${submission.packageDiamonds}`);
    console.log(`  - Novo saldo de ${submission.userId}: ${user.diamonds}`);

    res.json({ message: 'Submissão aprovada com sucesso!', user });
});

// [POST] Rejeita uma submissão
app.post('/api/admin/reject/:submissionId', (req, res) => {
    const { submissionId } = req.params;
    const submission = db.submissions.find(s => s.id === parseInt(submissionId));

    if (!submission) {
        return res.status(404).json({ error: 'Submissão não encontrada.' });
    }
     if (submission.status !== 'Pendente') {
        return res.status(400).json({ error: 'Esta submissão já foi processada.' });
    }

    submission.status = 'Rejeitado';
    saveDB();
    console.log(`[ADMIN] Submissão #${submissionId} REJEITADA para o usuário ${submission.userId}.`);

    res.json({ message: 'Submissão rejeitada com sucesso.' });
});


// --- ROTAS DO CLIENTE ---

// [POST] Cliente envia um comprovante de pagamento
app.post('/api/submit-proof', (req, res) => {
    const { userId, packageId, packageName, packageDiamonds, receiptImage } = req.body;

    if (!userId || !packageId || !receiptImage) {
        return res.status(400).json({ error: 'Dados incompletos. Envie userId, packageId e a imagem do comprovante.' });
    }

    const newSubmission = {
        id: db.submissionIdCounter++,
        userId,
        packageId,
        packageName,
        packageDiamonds,
        receiptImage, // A imagem vem como string base64
        status: 'Pendente',
        timestamp: new Date().toISOString()
    };

    db.submissions.push(newSubmission);
    saveDB();

    console.log(`[CLIENTE] Nova submissão recebida: #${newSubmission.id}`);
    console.log(`  - Usuário: ${userId}`);
    console.log(`  - Pacote: ${packageName} (${packageDiamonds} diamantes)`);
    
    res.status(201).json({ message: 'Comprovante recebido! Aguardando aprovação.' });
});

// [GET] Pega os dados de um usuário específico (incluindo saldo de diamantes)
app.get('/api/users/:userId', (req, res) => {
    const { userId } = req.params;

    // Se o usuário não existir, crie-o (simula o primeiro login)
    if (!db.users[userId]) {
        console.log(`[SERVER] Novo usuário detectado: ${userId}. Criando entrada no banco de dados.`);
        db.users[userId] = {
            // Em um aplicativo real, você pode obter o nome de uma etapa de registro
            name: `Usuário ${userId.substring(0, 8)}...`,
            diamonds: 20 // Bônus inicial
        };
        saveDB();
    }

    const user = db.users[userId];
    
    if (user) {
        res.json(user);
    } else {
        // Este caso teoricamente não deve ser alcançado devido à verificação acima
        res.status(404).json({ error: 'Usuário não encontrado.' });
    }
});


app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    console.log('Modo: Aprovação Manual de Pagamentos.');
    console.log('Saldos iniciais:', db.users);
});