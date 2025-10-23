# Servidor Backend - Estilo Gemini

Este é o servidor backend para o aplicativo Estilo Gemini. Ele é responsável por se comunicar com a API da Abacate Pay para processar pagamentos PIX.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Uma conta na [Abacate Pay](https://abacatepay.com/) com acesso às chaves de API.

## Configuração

Siga estes passos para configurar e rodar o servidor localmente.

### 1. Instalar Dependências

Navegue até a pasta do projeto que contém o arquivo `package.json` e execute o seguinte comando para instalar todas as dependências necessárias:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

As chaves da API e outras configurações sensíveis são gerenciadas através de variáveis de ambiente.

1.  Crie uma cópia do arquivo `.env.example` e renomeie para `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Abra o arquivo `.env` em um editor de texto.
3.  Substitua os valores de placeholder pelas suas chaves reais da Abacate Pay:

    ```env
    # Sua chave secreta de API da Abacate Pay (geralmente começa com 'abc_dev_' ou 'abc_prod_')
    ABACATE_API_KEY="SUA_CHAVE_DE_API_SECRETA_AQUI"

    # Sua chave pública para verificação da assinatura do webhook HMAC
    ABACATEPAY_PUBLIC_KEY="SUA_CHAVE_PUBLICA_DE_WEBHOOK_AQUI"
    ```

    **Importante:** Mantenha seu arquivo `.env` seguro e nunca o envie para repositórios públicos como o GitHub.

### 3. Iniciar o Servidor

Após instalar as dependências e configurar suas chaves, inicie o servidor com o comando:

```bash
npm start
```

Se tudo estiver configurado corretamente, você verá a seguinte mensagem no seu terminal:

```
Servidor backend de produção rodando em http://localhost:3001
Integrado com Abacate Pay (REAL).
Saldos atuais: { 'user_123': { name: 'Usuário Teste 1', diamonds: 20 }, ... }
```

O servidor agora está pronto para receber requisições do frontend do Estilo Gemini.