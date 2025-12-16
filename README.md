# Sistema de Gerenciamento Multi-Rota

Este projeto implementa um sistema de gerenciamento centralizado para múltiplas rotas, cada uma com seu próprio formulário e integração com o Telegram.

## Configuração

1. Instale as dependências:
```bash
npm install @prisma/client prisma @types/react @types/node @types/react-dom sonner next
```

2. Configure o banco de dados:
```bash
# Inicie o container do PostgreSQL
docker-compose up -d

# Configure o Prisma
npx prisma init
npx prisma generate
npx prisma db push
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis necessárias

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

- `/app` - Páginas e rotas da aplicação
- `/components` - Componentes reutilizáveis
- `/prisma` - Schema do banco de dados
- `/api` - Endpoints da API

## Funcionalidades

### Painel Administrativo (`/admin`)
- Gerenciamento de rotas
- Configuração de bots do Telegram
- Visualização de solicitações

### Rotas Dinâmicas (`/[route]`)
- Formulários isolados por rota
- Integração automática com Telegram
- Separação de dados por ambiente

## Configuração do Telegram

1. Crie um bot no Telegram usando o @BotFather
2. Obtenha o token do bot
3. Configure o token e chat_id no painel administrativo

## Segurança

- Dados isolados por rota
- Tokens e configurações separados
- Validação de rotas via middleware
