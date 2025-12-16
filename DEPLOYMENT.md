# Guia de Implantação

Este guia explica como implantar o sistema em um ambiente de produção.

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado
- Docker (opcional, para containerização)

## Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE admin_panel_db;
```

2. Configure as variáveis de ambiente:
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/admin_panel_db"
```

3. Execute as migrações:
```bash
npx prisma migrate deploy
```

## Configuração do Aplicativo

1. Instale as dependências:
```bash
npm install
```

2. Construa o aplicativo:
```bash
npm run build
```

3. Configure as variáveis de ambiente de produção:
```bash
# .env.production
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="https://seu-dominio.com"
```

## Implantação com Docker

1. Construa a imagem:
```bash
docker build -t admin-panel .
```

2. Execute o container:
```bash
docker run -d -p 3000:3000 \
  --env-file .env.production \
  admin-panel
```

## Implantação sem Docker

1. Inicie o servidor:
```bash
npm start
```

2. Configure um proxy reverso (Nginx exemplo):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuração do SSL

1. Instale o Certbot
2. Execute:
```bash
certbot --nginx -d seu-dominio.com
```

## Monitoramento

1. Configure o PM2:
```bash
npm install -g pm2
pm2 start npm --name "admin-panel" -- start
```

2. Configure logs:
```bash
pm2 logs admin-panel
```

## Backup

1. Configure backups do banco de dados:
```bash
pg_dump -U user admin_panel_db > backup.sql
```

2. Automatize com cron:
```bash
0 0 * * * pg_dump -U user admin_panel_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

## Segurança

1. Configure firewall:
```bash
ufw allow 80,443/tcp
```

2. Configure rate limiting no Nginx:
```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
```

## Manutenção

1. Atualize dependências:
```bash
npm update
```

2. Monitore logs:
```bash
tail -f /var/log/nginx/error.log
```

## Resolução de Problemas

### Banco de Dados
- Verifique conexão: `pg_isready`
- Verifique logs: `tail -f /var/log/postgresql/postgresql.log`

### Aplicação
- Verifique logs: `pm2 logs`
- Verifique status: `pm2 status`

### Nginx
- Teste configuração: `nginx -t`
- Verifique logs: `tail -f /var/log/nginx/error.log`
