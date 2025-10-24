# Estilo Gemini - Provador Virtual

Este é o repositório para o aplicativo Estilo Gemini, um provador de roupas virtual que utiliza a API do Gemini. O projeto inclui um frontend em React e um servidor backend em Node.js/Express.

O sistema de monetização é baseado em um **fluxo de aprovação manual via PIX**:
1.  O usuário seleciona um pacote de diamantes.
2.  O aplicativo exibe uma chave PIX estática e um QR Code para pagamento.
3.  O usuário realiza o pagamento e envia o comprovante através do aplicativo.
4.  Um administrador revisa o comprovante em um painel de administração e aprova ou rejeita a compra.
5.  Se aprovado, os diamantes são creditados na conta do usuário.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)

## Configuração e Execução

Siga estes passos para configurar e rodar o projeto completo (frontend e backend) localmente.

### 1. Instalar Dependências

Navegue até a pasta raiz do projeto e execute o seguinte comando para instalar todas as dependências do frontend e do backend:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para gerenciar a chave da API Gemini. O servidor não precisa mais de chaves de pagamento, pois o sistema é manual.

1.  Certifique-se de que você tem um arquivo `.env` na raiz do projeto.
2.  Adicione sua chave da API do Google Gemini a este arquivo:

    ```env
    # Sua chave de API do Google Gemini
    API_KEY="SUA_CHAVE_DE_API_DO_GEMINI_AQUI"
    ```

    **Importante:** Mantenha seu arquivo `.env` seguro e nunca o envie para repositórios públicos.

### 3. Iniciar o Ambiente Completo

Para facilitar o desenvolvimento, o projeto está configurado para iniciar o servidor do frontend (Vite) e o servidor do backend (Node.js) simultaneamente com um único comando.

Execute o seguinte comando no seu terminal:

```bash
npm run dev:full
```

Se tudo estiver configurado corretamente, você verá logs de ambos os servidores no seu terminal:
- O frontend estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).
- O backend estará rodando em `http://localhost:3001`.

O aplicativo agora está pronto para ser usado. O proxy do Vite redirecionará automaticamente as chamadas de API do frontend para o backend, evitando problemas de CORS.