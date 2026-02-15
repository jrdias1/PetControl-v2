# 🔒 Row Level Security (RLS) - Implementação Passo-a-Passo

## Situação Atual

❌ **Problema:** Sem RLS, qualquer usuário pode ver dados de TODOS os clientes/vendas/produtos  
✅ **Solução:** RLS + Autenticação = Cada usuário vê só seus dados

---

## 📋 Tabelas que Precisam de RLS

```
clients       → Clientes do pet shop
products      → Produtos ofertados
sales         → Histórico de vendas
agenda        → Lembretes de recompra
app_settings  → Configurações por loja
```

---

## 🔧 Implementação em 4 Passos

### Passo 1: Adicionar `shop_id` nas Tabelas (SQL)

No console do Supabase, execute:

```sql
-- 1. Adicionar coluna shop_id em clients
ALTER TABLE clients ADD COLUMN shop_id UUID DEFAULT NULL;

-- 2. Adicionar coluna shop_id em products
ALTER TABLE products ADD COLUMN shop_id UUID DEFAULT NULL;

-- 3. Adicionar coluna shop_id em sales
ALTER TABLE sales ADD COLUMN shop_id UUID DEFAULT NULL;

-- 4. Adicionar coluna shop_id em agenda
ALTER TABLE agenda ADD COLUMN shop_id UUID DEFAULT NULL;

-- 5. Criar tabela de lojas (shops)
CREATE TABLE shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  webhook_url VARCHAR(500),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar tabela de membros da loja
CREATE TABLE shop_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(shop_id, user_id)
);
```

---

### Passo 2: Habilitar RLS nas Tabelas

```sql
-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_members ENABLE ROW LEVEL SECURITY;
```

---

### Passo 3: Criar Políticas RLS

```sql
-- POLÍTICA: Cliente vê só clientes de sua loja
CREATE POLICY "clients_select_own_shop" ON clients
FOR SELECT USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clients_insert_own_shop" ON clients
FOR INSERT WITH CHECK (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clients_update_own_shop" ON clients
FOR UPDATE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clients_delete_own_shop" ON clients
FOR DELETE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Produto vê só produtos de sua loja
CREATE POLICY "products_select_own_shop" ON products
FOR SELECT USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "products_insert_own_shop" ON products
FOR INSERT WITH CHECK (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "products_update_own_shop" ON products
FOR UPDATE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "products_delete_own_shop" ON products
FOR DELETE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Vendas
CREATE POLICY "sales_select_own_shop" ON sales
FOR SELECT USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "sales_insert_own_shop" ON sales
FOR INSERT WITH CHECK (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "sales_update_own_shop" ON sales
FOR UPDATE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Agenda
CREATE POLICY "agenda_select_own_shop" ON agenda
FOR SELECT USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "agenda_insert_own_shop" ON agenda
FOR INSERT WITH CHECK (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "agenda_update_own_shop" ON agenda
FOR UPDATE USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: App Settings
CREATE POLICY "app_settings_select_own_shop" ON app_settings
FOR SELECT USING (
  id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "app_settings_update_own_shop" ON app_settings
FOR UPDATE USING (
  id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Shop Members
CREATE POLICY "shop_members_select_own" ON shop_members
FOR SELECT USING (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "shop_members_insert_admin" ON shop_members
FOR INSERT WITH CHECK (
  shop_id IN (
    SELECT shop_id FROM shop_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

### Passo 4: Atualizar Código React

**Precisamos:**

1. **Usar Supabase Auth** ao invés de password simples
2. **Filtrar por shop_id** em todas as queries

**Arquivo: `src/services/api.js`**

Mude de:
```javascript
// ❌ SEM FILTRO
const { data } = await supabase
  .from('clients')
  .select('*');
```

Para:
```javascript
// ✅ COM SHOP_ID
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('shop_id', currentShopId);
```

---

## ⚠️ Importante: Autenticação Real

**O código atual usa senhas simples. RLS precisa de Supabase Auth real.**

Você tem 2 opções:

### Opção A: Usar Supabase Auth (Recomendado)
```javascript
// Ao invés de password, use:
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'senha'
});
```

### Opção B: Multi-tenancy com JWT (Avançado)
```javascript
// Usar secret token pra cada loja
supabase.setAuth(token);
```

---

## ✅ Checklist

- [ ] `shop_id` adicionado em todas as tabelas
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS criadas (SQL no Supabase)
- [ ] Código React atualizado com `shop_id`
- [ ] Autenticação migrada para Supabase Auth
- [ ] Testado: Usuário A não vê dados de Usuário B

---

## 🧪 Teste RLS

1. Crie 2 usuários diferentes
2. Faça login com Usuário A
3. Registre um cliente para Usuário A
4. Faça logout e login com Usuário B
5. Verifique: Usuário B **NÃO vê** cliente de Usuário A

---

## Timeline Estimado

- **SQL (RLS):** 30 minutos
- **React (integração):** 2-3 horas
- **Testes:** 1 hora

**Total:** ~4 horas

---

**Próximo passo:** Você quer que eu implemente tudo isso ou prefere fazer pelo console do Supabase?
