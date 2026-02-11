-- PetControl: Supabase Schema Design

-- 1. Clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    pet_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    lead_time_days INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vendas (Sales)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    sale_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Agenda (Mensagens Agendadas)
CREATE TABLE IF NOT EXISTS agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL DEFAULT '08:00:00',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    error_log TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Configurações Globais
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_name TEXT DEFAULT 'PetControl',
    logo_url TEXT,
    webhook_url TEXT,
    automation_hour TIME DEFAULT '08:00:00',
    is_automation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir config padrão se não existir
INSERT INTO app_settings (shop_name) 
SELECT 'PetControl' WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- 5. Lógica Automática: Trigger para criar agendamento na venda
CREATE OR REPLACE FUNCTION schedule_next_message()
RETURNS TRIGGER AS $$
DECLARE
    v_duration INTEGER;
    v_lead_time INTEGER;
    v_product_name TEXT;
    v_client_name TEXT;
    v_scheduled_date DATE;
BEGIN
    -- Busca dados do produto e cliente
    SELECT name, duration_days, lead_time_days INTO v_product_name, v_duration, v_lead_time 
    FROM products WHERE id = NEW.product_id;
    
    SELECT full_name INTO v_client_name FROM clients WHERE id = NEW.client_id;

    -- Calcula data de envio (Venda + Duração - Antecedência)
    v_scheduled_date := NEW.sale_date + (v_duration - v_lead_time) * INTERVAL '1 day';

    -- Insere na agenda
    INSERT INTO agenda (sale_id, client_id, message, scheduled_date)
    VALUES (
        NEW.id,
        NEW.client_id,
        'Olá ' || v_client_name || '! O ' || v_product_name || ' do seu pet está próximo de acabar. Gostaria de garantir a reposição?',
        v_scheduled_date
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_after_sale_insert ON sales;
CREATE TRIGGER tr_after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION schedule_next_message();

-- 6. View para facilitar o n8n (Agenda + Dados do Cliente)
CREATE OR REPLACE VIEW v_daily_agenda AS
SELECT 
    a.id,
    a.message,
    a.scheduled_date,
    a.scheduled_time,
    a.status,
    c.full_name as client_name,
    c.phone as client_phone,
    c.pet_name as pet_name
FROM agenda a
JOIN clients c ON a.client_id = c.id;

-- 7. Segurança: Habilitar RLS e criar políticas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon/auth em clients" ON clients;
CREATE POLICY "Permitir tudo para anon/auth em clients" ON clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon/auth em products" ON products;
CREATE POLICY "Permitir tudo para anon/auth em products" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon/auth em sales" ON sales;
CREATE POLICY "Permitir tudo para anon/auth em sales" ON sales FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon/auth em agenda" ON agenda;
CREATE POLICY "Permitir tudo para anon/auth em agenda" ON agenda FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon/auth em app_settings" ON app_settings;
CREATE POLICY "Permitir tudo para anon/auth em app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
