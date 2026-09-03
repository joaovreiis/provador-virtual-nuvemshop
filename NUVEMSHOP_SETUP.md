# Integração com Nuvemshop

## Configuração da aplicação

1. Crie uma aplicação no painel de desenvolvedores da Nuvemshop.
2. Configure a URL de redirecionamento como `https://SEU-DOMINIO/api/integracoes/nuvemshop/callback`.
3. Configure `NUVEMSHOP_APP_ID`, `NUVEMSHOP_APP_SECRET` e as URLs no ambiente do servidor usando [.env.example](.env.example) como referência.
4. Publique `NUVEMSHOP_WEBHOOK_URL` como `https://SEU-DOMINIO/api/integracoes/nuvemshop/webhook`.

## Fluxo

No painel `/admin`, abra **Nuvemshop** e clique em **Conectar loja**. O servidor troca o código OAuth, salva o token no PostgreSQL e registra eventos de produto. Depois da conexão, use **Sincronizar produtos** para importar o catálogo existente.

Produtos importados são identificados por `loja_externa_id` e `produto_externo_id`, portanto novas sincronizações não duplicam peças. Nome, descrição, imagem, URL, SKU, preço, estoque e status vêm da Nuvemshop. As medidas de busto, cintura, quadril e comprimento continuam sendo dados do provador e devem ser preenchidas no campo de tamanhos da peça importada.

## Botão na página do produto

Para um teste imediato, adicione o script público no recurso de script da loja ou no tema, substituindo os valores pelos seus dados:

```html
<script src="https://SEU-DOMINIO.vercel.app/provador-virtual.js"
	data-app-url="https://SEU-DOMINIO.vercel.app/"
	data-store-id="ID_DA_LOJA"></script>
```

Em uma página de produto, o script cria o botão **Descobrir meu tamanho**. Ao clicar, ele abre o provador com `produto` e `loja` na URL. O aplicativo busca a peça correspondente e inicia automaticamente a sequência de altura/peso, medidas do cliente, manequim e recomendação.

O script é um mecanismo de teste/compatibilidade. Para novas instalações, a Nuvemshop exige o NubeSDK; a versão definitiva deve ser empacotada como uma extensão NubeSDK, renderizando o botão em um slot de storefront e lendo o produto pelo evento `location:updated`.

## Desenvolvimento local

O OAuth exige uma URL pública para callback e webhook. Use um túnel HTTPS para a porta 3001 e coloque as URLs públicas nas variáveis de ambiente. O servidor local deve ser iniciado com `npm run dev:server` e o frontend com `npm run dev`.

## Produção

Na Vercel, adicione todas as variáveis de [.env.example](.env.example) em **Settings > Environment Variables**. Nunca versione `.env`, tokens ou a URL real do banco. Depois de alterar variáveis, faça um novo deploy.

Validações úteis:

- `GET /api/health` deve retornar `ok: true` e `hasDatabase: true`.
- O painel deve mostrar a loja conectada.
- Uma alteração de produto deve atualizar a peça correspondente sem criar duplicata.
