Desafio 2 — Nginx (proxy reverso) + Node.js + MySQL (Full Cycle)

O que este projeto faz
- Nginx recebe requisições em http://localhost:8081
- Nginx encaminha (proxy reverso) para a aplicação Node.js (app:3000)
- A aplicação Node.js insere um nome na tabela `people` do MySQL e retorna:
  <h1>Full Cycle Rocks!</h1>
  + lista de nomes cadastrados

-----------------------------------------------------------------------
Requisitos atendidos (conforme solicitado)
- Node e Nginx em imagens Alpine
- MySQL 5.7 (rodando em amd64 no Mac Apple Silicon via emulação)
- Network: net-node
- Serviços: db, app, nginx
- Volume de desenvolvimento: ./app montado em /usr/src/app no container app
- MySQL exposto localmente em 3311 (container 3306)
- Nginx exposto localmente em 8081 (container 80)
- Usuário do banco: user / senha: user
- init.sql cria o schema e a tabela

-----------------------------------------------------------------------
Estrutura de pastas

.
├── docker-compose.yml
├── app
│   ├── index.js
│   └── package.json
├── node
│   └── Dockerfile
├── nginx
│   ├── Dockerfile
│   └── nginx.conf
└── mysql
    └── init.sql

-----------------------------------------------------------------------
Como subir (build + start)

1) Na raiz do projeto:
   docker-compose up -d --build

2) Abra no navegador:
   http://localhost:8080

3) Cada refresh adiciona um nome novo na tabela `people` e retorna a lista.