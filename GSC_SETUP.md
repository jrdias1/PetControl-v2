# 🔍 Google Search Console - Guia Passo-a-Passo

## Passo 1: Acessar Google Search Console

1. Abra [Google Search Console](https://search.google.com/search-console/about)
2. Faça login com sua conta Google (Gmail)

---

## Passo 2: Adicionar Propriedade

1. Clique em **"Adicionar Propriedade"** (lado esquerdo)
2. Escolha **"URL"** (não domínio)
3. Cole: `https://pet-control-v2.vercel.app/`
4. Clique em **"Continuar"**

---

## Passo 3: Verificar Propriedade

**Opção A: Recomendada (Tag)** ⭐
1. Google vai gerar uma `meta` tag com `content="xxxxx"`
2. Copie a tag completa
3. **Cole em `index.html`** entre as tags `<head>`:
   ```html
   <meta name="google-site-verification" content="XXXXX" />
   ```
4. Faça deploy: `git add index.html && git commit -m "add GSC verification" && git push`
5. Volta no GSC e clica **"Verificar"**

**Opção B: Alternativa (Upload arquivo)**
1. Download o arquivo `google...html`
2. Salve em `public/`
3. Deploy e clica "Verificar"

---

## Passo 4: Submeter Sitemap

Após verificação:

1. No menu esquerdo, vá para **"Sitemaps"**
2. Em "Adicionar novo sitemap", cole:
   ```
   https://pet-control-v2.vercel.app/sitemap.xml
   ```
3. Clique em **"Enviar"**
4. Aguarde a resposta (pode levar minutos)

---

## Passo 5: Monitorar Rastreamento

1. Vá para **"Visão geral"**
2. Procure por:
   - ✅ **Cobertura**: Esperado ~2 imóvel (home)
   - ✅ **Performance**: Palavras-chave com impressões
   - ✅ **Usabilidade no móvel**: Tudo ok

---

## ⏱️ Timeline Esperado

| Tempo | O que Esperar |
|-------|--------------|
| **5 min** | Google recebe sitemap |
| **2-4h** | Primeira indexação |
| **24h** | Dados aparecem em "Performance" |
| **48h** | Rankings começam (se houver volume) |

---

## Checklist

- [ ] Conta Google feita/verificada
- [ ] Propriedade adicionada
- [ ] Meta tag de verificação adicionada a `index.html`
- [ ] Deploy feito
- [ ] GSC mostra como verificado
- [ ] Sitemap enviado com sucesso
- [ ] Vendo dados em "Performance" após 24h

---

## Dúvidas Frequentes

**P: Por que não aparece dado em "Performance" ainda?**
A: Google precisa de 24-48h para indexar e coletar dados. É normal.

**P: Meu site não aparece em buscas ainda?**
A: Novo site leva tempo. Google prioriza sites estabelecidos. Paciência!

**P: Como aceleço a indexação?**
A: Crie conteúdo de qualidade (blog) e compartilhe nas redes.

---

**Status:** Pronto para configurar ✅
