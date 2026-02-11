import { supabase } from '../lib/supabase';

export const api = {
    // Autenticação básica via Supabase DB (Pode ser evoluída para Supabase Auth posteriormente)
    async login(password) {
        if (password === 'jr@92294269' || password === 'admin123') {
            return { authenticated: true, user: { name: 'Admin' } };
        }
        return { authenticated: false };
    },

    async fetchClients() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return data.map(c => ({
            ...c,
            nome: c.full_name,
            telefone: c.phone,
            pet: c.pet_name
        }));
    },

    async fetchProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return (data || []).map(p => ({
            ...p,
            id: p.id,
            nome: p.name || 'Produto Sem Nome',
            duracao: p.duration_days || 0,
            antecedencia: p.lead_time_days || 0
        }));
    },

    async fetchSales() {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async fetchAgenda() {
        const { data, error } = await supabase
            .from('agenda')
            .select(`
                *,
                clients (full_name, phone)
            `)
            .order('scheduled_date', { ascending: true });

        if (error) throw error;
        return data.map(item => ({
            id: item.id,
            clientName: item.clients?.full_name || '-',
            clientPhone: item.clients?.phone || '-',
            message: item.message,
            scheduled_date: item.scheduled_date,
            date: item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('pt-BR') : '-',
            time: item.scheduled_time,
            status: item.status === 'sent' ? 'sent' : 'scheduled'
        }));
    },

    async fetchSalesSummary() {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                id,
                client_id,
                clients (full_name)
            `);
        if (error) throw error;
        return data;
    },

    async fetchClientsWithHistory() {
        try {
            // Buscando dados separadamente para evitar falhas em joins aninhados complexos
            const { data: clients, error: clientErr } = await supabase
                .from('clients')
                .select('*')
                .order('full_name', { ascending: true });

            if (clientErr) throw clientErr;

            const { data: sales, error: salesErr } = await supabase
                .from('sales')
                .select('*, products(name)')
                .order('sale_date', { ascending: false });

            const { data: agenda, error: agendaErr } = await supabase
                .from('agenda')
                .select('*')
                .order('scheduled_date', { ascending: true });

            return (clients || []).map(c => {
                const clientSales = (sales || []).filter(s => s.client_id === c.id);
                const clientAgenda = (agenda || []).filter(a => a.client_id === c.id);

                const sortedSales = [...clientSales].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
                const lastSale = sortedSales[0];
                const nextAgenda = clientAgenda
                    .filter(a => a.status === 'pending')
                    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))[0];

                return {
                    id: c.id,
                    nome: c.full_name || 'Sem Nome',
                    telefone: c.phone || '-',
                    pet: c.pet_name || 'Pet',
                    history: sortedSales.map(s => ({
                        produto: s.products?.name || 'Item',
                        data: s.sale_date ? new Date(s.sale_date).toLocaleDateString('pt-BR') : '-',
                        dataRaw: s.sale_date,
                        proximoContato: '-' // Simplificado para evitar join triplo
                    })),
                    lastProduto: lastSale?.products?.name || '-',
                    lastData: lastSale?.sale_date ? new Date(lastSale.sale_date).toLocaleDateString('pt-BR') : '-',
                    proximoAviso: nextAgenda?.scheduled_date ? new Date(nextAgenda.scheduled_date).toLocaleDateString('pt-BR') : '-',
                    ultimaCompra: lastSale ? { dataRaw: lastSale.sale_date } : { dataRaw: '1970-01-01' }
                };
            });
        } catch (error) {
            console.error('Erro em fetchClientsWithHistory:', error);
            return []; // Retorna array vazio em caso de erro para não quebrar o map
        }
    },

    async registerSale(saleData) {
        let clientId = saleData.clientId;

        if (!clientId) {
            const { data: existing } = await supabase
                .from('clients')
                .select('id')
                .eq('phone', saleData.telefone)
                .maybeSingle();

            if (existing) {
                clientId = existing.id;
            } else {
                const { data: newClient, error: clientErr } = await supabase
                    .from('clients')
                    .insert([{
                        full_name: saleData.nome,
                        phone: saleData.telefone,
                        pet_name: saleData.pet
                    }])
                    .select()
                    .single();
                if (clientErr) throw clientErr;
                clientId = newClient.id;
            }
        }

        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('name', saleData.produto)
            .single();

        if (!product) throw new Error('Produto não encontrado');

        const { error: saleErr } = await supabase
            .from('sales')
            .insert([{
                client_id: clientId,
                product_id: product.id,
                sale_date: saleData.data || new Date().toISOString().split('T')[0]
            }]);

        if (saleErr) throw saleErr;
        return true;
    },

    async addClient(clientData) {
        const { data, error } = await supabase
            .from('clients')
            .insert([{
                full_name: clientData.nome,
                phone: clientData.telefone,
                pet_name: clientData.pet
            }])
            .select()
            .single();

        if (error) throw error;

        if (clientData.produto) {
            await this.registerSale({
                clientId: data.id,
                produto: clientData.produto,
                data: clientData.data,
                nome: clientData.nome,
                telefone: clientData.telefone
            });
        }
        return true;
    },

    async addProduct(productData) {
        const { error } = await supabase
            .from('products')
            .insert([{
                name: productData.nome,
                duration_days: parseInt(productData.duracao),
                lead_time_days: parseInt(productData.antecedencia)
            }]);
        if (error) throw error;
        return true;
    },

    async scheduleMessage(payload) {
        const { error } = await supabase
            .from('agenda')
            .insert([{
                message: payload.mensagem,
                scheduled_date: payload.data_envio.split('/').reverse().join('-'),
                scheduled_time: payload.hora_envio,
                status: 'pending'
            }]);
        if (error) throw error;
        return true;
    },

    async fetchAppSettings() {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .maybeSingle();

            if (error) throw error;

            // Se não existir, as configurações padrão do banco serão criadas pelo script SQL
            // mas retornamos um fallback se o banco estiver vazio no momento
            return data || { shop_name: 'PetControl', logo_url: '', automation_hour: '08:00:00' };
        } catch (error) {
            console.error('Erro ao buscar app_settings:', error);
            return { shop_name: 'PetControl', logo_url: '', automation_hour: '08:00:00' };
        }
    },

    async updateAppSettings(settings) {
        const { data: existing } = await supabase.from('app_settings').select('id').maybeSingle();

        let error;
        if (existing) {
            const { error: err } = await supabase
                .from('app_settings')
                .update({ ...settings, updated_at: new Date().toISOString() })
                .eq('id', existing.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('app_settings')
                .insert([{ ...settings }]);
            error = err;
        }

        if (error) throw error;
        return true;
    },

    async getAutomationStatus() {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('agenda')
            .select('status')
            .eq('scheduled_date', today);

        if (error) throw error;

        const total = data.length;
        const sent = data.filter(d => d.status === 'sent').length;
        const pending = data.filter(d => d.status === 'pending').length;
        const failed = data.filter(d => d.status === 'failed').length;

        return { total, sent, pending, failed };
    },

    async updateMessageStatus(id, status, errorLog = null) {
        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        if (errorLog) {
            updateData.error_log = errorLog;
            const { error: attemptsError } = await supabase.rpc('increment_attempts', { row_id: id });
            if (attemptsError) {
                console.warn('Falha ao incrementar tentativas:', attemptsError);
            }
        }

        const { error } = await supabase
            .from('agenda')
            .update(updateData)
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async triggerN8nWebhook(messageData) {
        const settings = await this.fetchAppSettings();
        const webhookUrl = settings?.webhook_url;

        if (!webhookUrl) {
            console.warn('Webhook URL não configurada no Supabase.');
            return false;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...messageData,
                    shop_name: settings.shop_name,
                    timestamp: new Date().toISOString()
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Erro ao disparar webhook n8n:', error);
            return false;
        }
    },

    getCurrentUserName() {
        // Para esta versão, usaremos 'Veterinário' como padrão ou o nome do usuário se houver Auth
        return 'Veterinário';
    },

    async deleteProduct(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
