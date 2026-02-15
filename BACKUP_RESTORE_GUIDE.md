# 💾 Backup & Restore - Guia Prático

## Situação Atual

❌ **Problema:** Sem backup, se banco cair = perdem TODOS os dados  
✅ **Solução:** Backup automático diário + restore rápido

---

## 🎯 3 Opções de Backup

### Opção 1: Supabase Automático (Recomendado Pro)
- ✅ Automático diariamente
- ✅ Retenção 30 dias
- ✅ 1-click restore
- ❌ Pago (plano Pro - $25/mês)
- 📍 Painel: Settings → Backups

---

### Opção 2: Backup Manual via SQL (Gratuito)
- ✅ Gratuito
- ✅ Controle total
- ❌ Manual (precisa rodar script)
- ⏱️ ~5 minutos semanais

---

### Opção 3: Backup com pgAdmin (Gratuito + Fácil)
- ✅ Gratuito
- ✅ Arquivo .sql para download
- ✅ Pode agendar com task scheduler
- ⏱️ ~10 minutos

---

## 📋 Qual Escolher?

```
Se quer SEGURANÇA MÁXIMA:    → Opção 1 (Supabase Pro)
Se quer GRATUITO mas SEGURO: → Opção 2 (SQL Scripts)
Se quer SIMPLES e GRÁTIS:    → Opção 3 (pgAdmin)
```

---

## 🚀 Implementar Opção 2 (Recomendado para Agora)

**Backup via SQL Script + Google Drive**

### Passo 1: Criar Script de Backup (Windows)

Salve como `backup-petcontrol.ps1`:

```powershell
# ============================================
# BACKUP DO SUPABASE - PetControl
# ============================================

# Configurações
$SUPABASE_HOST = "gzxalmghhddrtvpwchnj.supabase.co"
$SUPABASE_DB = "postgres"
$SUPABASE_USER = "postgres"
$SUPABASE_PASSWORD = "SUA_SENHA_AQUI"  # ⚠️ MUDE PARA SENHA REAL
$BACKUP_DIR = "C:\backups\petcontrol"
$DATE = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_FILE = "$BACKUP_DIR\backup_$DATE.sql"

# Criar pasta se não existir
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Executar pg_dump
Write-Host "🔄 Iniciando backup..."
$env:PGPASSWORD = $SUPABASE_PASSWORD

& "C:\Program Files\PostgreSQL\15\bin\pg_dump" `
    -h $SUPABASE_HOST `
    -U $SUPABASE_USER `
    -d $SUPABASE_DB `
    --no-password `
    > $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup criado com sucesso!"
    Write-Host "📁 Arquivo: $BACKUP_FILE"
    Write-Host "📊 Tamanho: $(Get-Item $BACKUP_FILE).Length bytes"
} else {
    Write-Host "❌ Erro no backup: $LASTEXITCODE"
    exit 1
}

# Limpar backups > 30 dias
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem $BACKUP_DIR -Filter "backup_*.sql" | 
    Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
    Remove-Item

Write-Host "🧹 Backups antigos removidos"
```

---

### Passo 2: Agendar Backup Automático (Windows Task Scheduler)

1. **Abra Task Scheduler:**
   - WIN + R → `taskschd.msc`

2. **Criar Nova Tarefa:**
   - Task Scheduler Library → Create Basic Task
   - Nome: "PetControl Backup"
   - Descrição: "Backup diário do banco Supabase"

3. **Configurar Gatilho:**
   - Trigger: "Daily" às 2h da manhã
   - Recorrência: Todos os dias

4. **Configurar Ação:**
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\backup-petcontrol.ps1"`

5. **Salvar e Testar**

---

### Passo 3: Sincronizar com Google Drive

Instale **rclone** (sistema de sync automático):

```powershell
# 1. Instalar rclone
choco install rclone -y

# 2. Configurar Google Drive
rclone config

# 3. Criar script de sincronização (sync-backup.ps1)
rclone sync "C:\backups\petcontrol" "gdrive:PetControl-Backups" --progress

# 4. Agendar no Task Scheduler também (após backup)
```

---

## 🔄 Opção 3: Backup Simples via n8n (Cloud)

Se preferir **automático na nuvem**, use n8n:

```json
{
  "name": "Daily Database Backup",
  "trigger": "Schedule (2 AM daily)",
  "nodes": [
    {
      "type": "Postgres",
      "operation": "Execute Query",
      "query": "SELECT * FROM clients, products, sales, agenda"
    },
    {
      "type": "Google Sheets",
      "operation": "Append rows",
      "sheet": "Backups"
    }
  ]
}
```

---

## 🔧 Fazer Restore (Quando Precisar)

### Via pgAdmin (Mais Fácil):

1. **Abra pgAdmin**
2. **Conecte no Supabase** (mesmas credenciais)
3. **Databases → postgres → Restore**
4. **Selecione arquivo .sql**
5. **Clique Restore**

### Via Linha de Comando:

```powershell
$SUPABASE_PASSWORD = "SUA_SENHA"
$env:PGPASSWORD = $SUPABASE_PASSWORD

psql -h gzxalmghhddrtvpwchnj.supabase.co `
     -U postgres `
     -d postgres `
     -f "C:\backups\petcontrol\backup_2026-02-11.sql"
```

---

## ⚡ Checklist de Backup

- [ ] Escolhida estratégia (Opção 1, 2 ou 3)
- [ ] Script ou automação criada
- [ ] Primeiro backup feito
- [ ] Pasta de backups configurada
- [ ] Google Drive/Cloud sincronizado
- [ ] Testado restore (simular restauração)
- [ ] Agendar backups semanais
- [ ] Monitorar espaço em disco

---

## 📊 Estimativas

| Opção | Custo | Tempo Setup | Automação |
|-------|-------|-----------|-----------|
| **1. Supabase Pro** | $25/mês | 0 min | ✅ Total |
| **2. SQL Script** | Grátis | 30 min | ✅ Semanal |
| **3. pgAdmin** | Grátis | 15 min | ❌ Manual |
| **4. n8n** | Grátis | 20 min | ✅ Diário |

---

## 🚨 Cenários de Perda de Dados

**Caso 1:** Banco corrompido
- ✅ Restore de último backup = Salvo

**Caso 2:** Usuário deleta dados acidentalmente
- ✅ Voltar pra versão anterior = Salvo

**Caso 3:** Ataque cibernético / ransomware
- ✅ Backup offline (Google Drive) = Salvo

**Caso 4:** Supabase server down
- ✅ Dados intactos, só espera voltar

---

## 💡 Recomendação Para PetControl

**Implementar HOJE:**

1. **SQL Script semanal** (Opção 2) - 30 min
2. **Google Drive sync** - 20 min
3. **Testar restore** - 10 min

**Total: 1 hora = Proteção máxima!**

---

**Próximo passo:** Qual opção você escolhe? Ou quer que eu configure tudo?
