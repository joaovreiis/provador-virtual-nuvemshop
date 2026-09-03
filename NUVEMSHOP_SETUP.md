# Integração com Nuvemshop

## Configuração da aplicação

1. Crie uma aplicação no painel de desenvolvedores da Nuvemshop.
2. Configure a URL de redirecionamento como `https://SEU-DOMINIO/api/integracoes/nuvemshop/callback`.
3. Configure `NUVEMSHOP_APP_ID`, `NUVEMSHOP_APP_SECRET` e as URLs no ambiente do servidor usando [.env.example](.env.example) como referência.
4. Publique `NUVEMSHOP_WEBHOOK_URL` como `https://SEU-DOMINIO/api/integracoes/nuvemshop/webhook`.

## Fluxo

No painel `/admin`, abra **Nuvemshop** e clique em **Conectar loja**. O servidor troca o código OAuth, salva o token no PostgreSQL e registra eventos de produto. Depois da conexão, use **Sincronizar produtos** para importar o catálogo existente.

Produtos importados são identificados por `loja_externa_id` e `produto_externo_id`, portanto novas sincronizações não duplicam peças. Nome, descrição, imagem, URL, SKU, preço, estoque e status vêm da Nuvemshop. As medidas de busto, cintura, quadril e comprimento continuam sendo dados do provador e devem ser preenchidas no campo de tamanhos da peça importada.

## Desenvolvimento local

O OAuth exige uma URL pública para callback e webhook. Use um túnel HTTPS para a porta 3001 e coloque as URLs públicas nas variáveis de ambiente. O servidor local deve ser iniciado com `npm run dev:server` e o frontend com `npm run dev`.

## Produção

Na Vercel, adicione todas as variáveis de [.env.example](.env.example) em **Settings > Environment Variables**. Nunca versione `.env`, tokens ou a URL real do banco. Depois de alterar variáveis, faça um novo deploy.

Validações úteis:

- `GET /api/health` deve retornar `ok: true` e `hasDatabase: true`.
- O painel deve mostrar a loja conectada.
- Uma alteração de produto deve atualizar a peça correspondente sem criar duplicata.
