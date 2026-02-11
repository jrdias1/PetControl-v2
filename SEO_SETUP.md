# 📊 SEO - Google Search Console & Analytics Setup

## ✅ Já Implementado:
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ Meta tags (title, description, OG, Twitter)
- ✅ JSON-LD (SoftwareApplication + Organization)
- ✅ noindex na rota /login
- ✅ PWA icons e manifest

---

## 🔧 Próximos Passos Manuais

### 1️⃣ Google Search Console
**Tempo:** 5-10 minutos

1. Acesse [Google Search Console](https://search.google.com/search-console/)
2. Clique em "Adicionar propriedade"
3. Cole a URL: `https://pet-control-v2.vercel.app/`
4. Escolha **Verificação por domínio** ou **Arquivo HTML**
5. Após verificação, submeta o sitemap em "Sitemaps":
   - URL: `https://pet-control-v2.vercel.app/sitemap.xml`
6. Aguarde Google rastrear (24-48h)

---

### 2️⃣ Google Analytics 4
**Tempo:** 10 minutos

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Clique em "Criar propriedade"
   - Nome: "PetControl"
   - País: Brasil
   - Fuso: São Paulo (UTC-3)
3. Copie o **ID de Medição** (G-XXXXXXX)
4. Adicione ao `index.html`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXX');
   </script>
   ```
5. Substitua `G-XXXXXXX` pelo seu ID real

---

### 3️⃣ Verificar Dados Estruturados
**Como testar JSON-LD:**

1. Acesse [Schema.org Validator](https://validator.schema.org/)
2. Cole a URL: `https://pet-control-v2.vercel.app/`
3. Ou use [Google Rich Results Test](https://search.google.com/test/rich-results)
4. Procure por **SoftwareApplication** nos resultados

---

### 4️⃣ Monitorar SEO (Ferramentas Recomendadas)

**Gratuitas:**
- [Google Search Console](https://search.google.com/search-console/) - Rastreamento
- [Google PageSpeed Insights](https://pagespeed.web.dev/) - Performance
- [Lighthouse](chrome://extensions/) - Auditoria

**Pagas (Opcional):**
- Semrush
- Ahrefs
- Moz

---

### 5️⃣ Checklist de SEO Técnico ✅

- [x] robots.txt criado
- [x] sitemap.xml criado
- [x] Meta tags completas
- [x] OG + Twitter cards
- [x] JSON-LD estruturado
- [x] noindex em /login
- [x] favicon e PWA icons
- [ ] Google Search Console (ação manual)
- [ ] Google Analytics (ação manual)
- [ ] Core Web Vitals monitorados
- [ ] SSL/HTTPS (Vercel faz automaticamente)

---

## 📈 Palavras-chave Monitoradas

Após configurar GSC, monitore essas keywords:
- "sistema para pet shop"
- "software para pet shop"
- "automação para pet shop"
- "recompra automática pet shop"
- "sistema de fidelização pet shop"

---

## 🚀 Próximos Passos
1. Configurar GSC e Analytics (manual)
2. Esperar indexação (24-48h)
3. Monitorar rankings no GSC
4. Começar blog content com keywords
5. Otimizar Core Web Vitals

---

**Status:** SEO Técnico 100% ✅ | Próximo: Conteúdo + Backlinking
