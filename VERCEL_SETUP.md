# Guia de Deploy na Vercel

## Variáveis de Ambiente Necessárias

No painel da Vercel, acesse **Settings > Environment Variables** e adicione:

```
DATABASE_URL=URL_DO_SEU_POSTGRES
JWT_SECRET=troque-esta-chave
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NUVEMSHOP_APP_ID=seu_app_id
NUVEMSHOP_APP_SECRET=seu_app_secret
NUVEMSHOP_REDIRECT_URI=https://seu-projeto.vercel.app/api/integracoes/nuvemshop/callback
NUVEMSHOP_WEBHOOK_URL=https://seu-projeto.vercel.app/api/integracoes/nuvemshop/webhook
NUVEMSHOP_SUCCESS_REDIRECT=https://seu-projeto.vercel.app/#/admin?integracao=nuvemshop-conectada
```

## Checklist de Deploy

- [ ] DATABASE_URL está preenchida com a URL do Neon
- [ ] JWT_SECRET está definida com um valor seguro
- [ ] ADMIN_USERNAME e ADMIN_PASSWORD estão preenchidas
- [ ] Variáveis `NUVEMSHOP_*` estão preenchidas
- [ ] URLs de callback e webhook estão cadastradas na aplicação Nuvemshop
- [ ] O repositório está sincronizado com `git push`
- [ ] O branch principal (main) está atualizado

## Teste da API

Após o deploy, verifique se a API está funcionando:

1. Acesse: `https://seu-projeto.vercel.app/api/health`
   - Deve retornar: `{ "ok": true, "hasDatabase": true }`

2. Se receber erro de DATABASE_URL, verifique se as variáveis estão salvas na Vercel.

## Teste do Login

1. Acesse: `https://seu-projeto.vercel.app/#/admin`
2. Use as credenciais:
   - Usuário: admin
   - Senha: admin123

## Troubleshooting

- **connect ECONNREFUSED**: DATABASE_URL não está definida ou correta na Vercel
- **Tela branca**: Verifique o console do navegador (F12) para ver o erro específico
- **Erro 500 na API**: Confira os logs da Vercel em **Deployments > Logs**
