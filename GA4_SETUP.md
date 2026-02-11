# 📊 Google Analytics 4 - Guia de Integração

## Passo 1: Criar conta Google Analytics

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Clique em **"Começar"** ou **"Criar"**
3. Preencha:
   - **Nome da conta:** "PetControl"
   - **Nome da propriedade:** "PetControl App"
   - **Fuso horário:** "América/São Paulo (UTC-3)"
   - **Moeda:** "BRL - Real Brasileiro"
4. Clique em **"Criar"**

---

## Passo 2: Configurar fluxo de dados web

1. Em **"Coleta de dados"**, escolha **"Web"**
2. Preencha:
   - **Nome do stream:** "PetControl Website"
   - **URL website:** `https://pet-control-v2.vercel.app/`
   - **Protocolo stream:** "https://"
3. Clique em **"Criar stream"**

---

## Passo 3: Copiar ID de Medição

1. Google vai gerar um **ID de Medição** (formato: `G-XXXXXXXXX`)
2. **Copie este ID!**
3. Você vai precisar dele agora

---

## Passo 4: Instalar código no site

### Opção A: Automaticamente (recomendado)
Google oferece gerenciador de tags. Deixe para depois se quiser.

### Opção B: Manual (fazer agora)

Peça para o JF colar esse código no `index.html` **antes do `</head>`**:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX');
</script>
```

**⚠️ Troque `G-XXXXXXXXX` pelo seu ID real!**

---

## Passo 5: Fazer Deploy

1. Após adicionar o código:
   ```bash
   git add index.html
   git commit -m "add Google Analytics tracking"
   git push
   ```
2. Espere 2-5 minutos pelo deploy

---

## Passo 6: Verificar se está funcionando

1. Volta pra Google Analytics
2. Vá para **"Relatórios"** → **"Tempo real"**
3. Acesse seu site em outra aba: `https://pet-control-v2.vercel.app/`
4. **Você deve ver um usuário ativo** em tempo real

---

## ⏱️ Timeline

| Tempo | O que Esperar |
|-------|--------------|
| **Imediato** | Você vê em "Tempo real" |
| **24h** | Primeiros relatórios |
| **7 dias** | Dados consolidados |

---

## Eventos Automáticos Rastreados

Google Analytics rastreia automaticamente:
- ✅ Pageviews (visitantes)
- ✅ Sessões (períodos de visita)
- ✅ Taxa de rejeição
- ✅ Duração média da sessão
- ✅ Dispositivo (mobile/desktop)
- ✅ País/região
- ✅ Browser (Chrome, Safari, etc)

---

## Eventos Customizados (Opcional)

Se quiser rastrear coisas específicas (ex: clique em "Instalar PWA"):

```javascript
gtag('event', 'pwa_install', {
  event_category: 'engagement',
  event_label: 'PWA instalado'
});
```

Mas por enquanto, a configuração padrão já é ótima.

---

## Checklist

- [ ] Conta Google Analytics criada
- [ ] Propriedade "PetControl" criada
- [ ] ID de Medição (G-XXXXXXXXX) copiado
- [ ] Código colado em `index.html`
- [ ] Deploy feito
- [ ] Testei em "Tempo real" e vi usuário ativo
- [ ] Aguardando 24h para dados consolidados

---

## Dúvidas

**P: Por que não dá pra escolher "Google tag Manager"?**
A: Recomendo usar direto o gtag. Mais simples pra começar.

**P: E se eu mudar a senha depois?**
A: GA não usa senha, só está vinculado a conta Google.

**P: Posso ver quantas pessoas visitam?**
A: Sim! Em "Relatórios" → "Aquisição" vê visitantes únicos.

---

**Próximo:** Monitorar em 24-48h ⏳
