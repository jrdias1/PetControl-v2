export const getSmartTip = (stats) => {
    const tips = [
        {
            condition: () => stats.emRisco > 5,
            text: `⚠️ Você tem ${stats.emRisco} clientes sumidos. Que tal enviar uma promoção de "Volta pra gente"?`,
            category: 'risco',
            color: 'rose'
        },
        {
            condition: () => stats.taxaRetorno > 0 && stats.taxaRetorno < 20,
            text: "📉 Sua taxa de retorno pode melhorar. Clientes fiéis compram 3x mais!",
            category: 'fid',
            color: 'indigo'
        },
        {
            condition: () => stats.mensagensEnviadas > 10,
            text: "🚀 A automação está voando! Mensagens constantes aumentam a lembrança da marca.",
            category: 'auto',
            color: 'amber'
        },
        {
            condition: () => true, // Fallback 1
            text: "💡 Dica: Clientes que recebem mimos no aniversário do pet tendem a gastar 20% a mais.",
            category: 'dica',
            color: 'emerald'
        },
        {
            condition: () => true, // Fallback 2
            text: "🐾 Sabia? Lembrar a data da vacina é a forma nº 1 de fidelização em Pet Shops.",
            category: 'dica',
            color: 'sky'
        },
        {
            condition: () => true, // Fallback 3
            text: "✨ Personalização é tudo. Use o nome do pet nas mensagens para encantar o dono.",
            category: 'dica',
            color: 'purple'
        }
    ];

    // Filter relevant tips
    const activeTips = tips.filter(t => t.condition());

    // Select based on day of year to rotate consistently per day, 
    // BUT prioritize 'Critical' ones (Risco) if they exist.

    // If we have critical tips (first one in list is highest priority here if condition met), use it randomly or daily?
    // Let's make it data-driven priority first, then daily rotation for generic ones.

    if (stats.emRisco > 10) return activeTips[0]; // Force risk tip if critical

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % activeTips.length;

    return activeTips[index];
};
