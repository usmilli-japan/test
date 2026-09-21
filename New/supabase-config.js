const SUPABASE_URL = 'https://pomlnzhtlvejiyvqfjfu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GY6bOK0ECnDsZCrocmUZ2g_4LQqr9E6';

async function supabaseRequest(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

async function listPayments() {
    return supabaseRequest('payments?select=*&order=id.desc');
}

async function createPayment(payment) {
    const result = await supabaseRequest('payments', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payment)
    });
    return result[0];
}

async function updatePayment(id, payment) {
    const update = {
        status: payment.status,
        approvalTime: payment.approvalTime || '',
        approvedBy: payment.approvedBy || '',
        adminComment: payment.adminComment || '',
        rejectionTime: payment.rejectionTime || '',
        rejectionReason: payment.rejectionReason || '',
        rejectedBy: payment.rejectedBy || ''
    };
    const result = await supabaseRequest(`payments?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(update)
    });
    return result[0];
}

async function getPayment(id) {
    const result = await supabaseRequest(`payments?id=eq.${encodeURIComponent(id)}&select=*`);
    return result[0] || null;
}

async function listWalletActivity() {
    return supabaseRequest('wallet_activity?select=*&order=id.desc');
}

async function createWalletActivity(activity) {
    const payload = {
        userName: activity.userName || '',
        userEmail: activity.userEmail || '',
        action: activity.action || 'wallet_action',
        type: activity.type || 'wallet',
        status: activity.status || 'PENDING',
        amount: activity.amount || '0',
        token: activity.token || '',
        network: activity.network || '',
        destination: activity.destination || '',
        details: activity.details || {},
        createdAt: new Date().toISOString()
    };
    const result = await supabaseRequest('wallet_activity', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload)
    });
    return result[0];
}

async function updateWalletActivity(id, updates) {
    const result = await supabaseRequest(`wallet_activity?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(updates)
    });
    return result[0];
}

async function listWalletBalances() {
    return supabaseRequest('wallet_balances?select=*&order=id.desc');
}

async function upsertWalletBalance(balance) {
    const row = {
        userName: balance.userName || 'Wallet User',
        userEmail: balance.userEmail || 'wallet-user@customer.local',
        symbol: String(balance.symbol || '').toUpperCase(),
        name: balance.name || String(balance.symbol || ''),
        chain: balance.chain || 'BSC',
        balance: Number(balance.balance) || 0,
        price: Number(balance.price) || 0,
        change: Number(balance.change) || 0,
        decimals: Number(balance.decimals) || 2,
        updatedAt: new Date().toISOString()
    };

    const existing = await supabaseRequest(`wallet_balances?userEmail=eq.${encodeURIComponent(row.userEmail)}&symbol=eq.${encodeURIComponent(row.symbol)}&select=*`);
    const match = Array.isArray(existing) ? existing[0] : null;

    if (match?.id) {
        const result = await supabaseRequest(`wallet_balances?id=eq.${encodeURIComponent(match.id)}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(row)
        });
        return result[0] || null;
    }

    const result = await supabaseRequest('wallet_balances', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(row)
    });
    return result[0] || null;
}

async function listWalletUpgradeSubmissions() {
    return supabaseRequest('wallet_upgrade_submissions?select=*&order=id.desc');
}

async function createWalletUpgradeSubmission(submission) {
    const payload = {
        userName: submission.userName || '',
        userEmail: submission.userEmail || '',
        amount: submission.amount || '',
        senderAddress: submission.senderAddress || '',
        txHash: submission.txHash || '',
        fileName: submission.fileName || '',
        fileType: submission.fileType || '',
        fileData: submission.fileData || '',
        fileSize: submission.fileSize || '',
        uploadTime: submission.uploadTime || '',
        status: submission.status || 'PENDING',
        reviewComment: submission.reviewComment || '',
        reviewedBy: submission.reviewedBy || '',
        approvedAt: submission.approvedAt || '',
        rejectedAt: submission.rejectedAt || '',
        rejectionReason: submission.rejectionReason || ''
    };
    const result = await supabaseRequest('wallet_upgrade_submissions', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload)
    });
    return result[0];
}

async function updateWalletUpgradeSubmission(id, updates) {
    const result = await supabaseRequest(`wallet_upgrade_submissions?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(updates)
    });
    return result[0];
}

async function syncWalletPortfolioToSupabase(tokens = []) {
    const source = Array.isArray(tokens) && tokens.length ? tokens : (() => {
        try {
            const raw = localStorage.getItem('adminTokenPortfolio') || localStorage.getItem('userWalletPortfolio') || localStorage.getItem('walletBalanceState');
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.tokens)) return parsed.tokens;
            return [];
        } catch {
            return [];
        }
    })();

    const userEmail = localStorage.getItem('currentUserEmail') || 'wallet-user@customer.local';
    const userName = localStorage.getItem('currentUserName') || 'Wallet User';

    const results = await Promise.all(source.map((token) => {
        const symbol = String(token.symbol || '').toUpperCase();
        if (!symbol) return null;

        return upsertWalletBalance({
            userName,
            userEmail,
            symbol,
            name: token.name || symbol,
            chain: token.chain || 'BSC',
            balance: token.balance,
            price: token.price,
            change: token.change,
            decimals: token.decimals || 2
        });
    }));

    const shared = results.filter(Boolean);
    if (shared.length) {
        localStorage.setItem('adminTokenPortfolio', JSON.stringify(source));
        localStorage.setItem('userWalletPortfolio', JSON.stringify(source));
        localStorage.setItem('walletBalanceState', JSON.stringify({ updatedAt: Date.now(), tokens: source }));
    }

    return shared;
}

async function hydrateWalletPortfolioFromSupabase() {
    const userEmail = localStorage.getItem('currentUserEmail') || 'wallet-user@customer.local';
    try {
        const rows = await supabaseRequest(`wallet_balances?userEmail=eq.${encodeURIComponent(userEmail)}&select=*`);
        if (!Array.isArray(rows) || !rows.length) {
            const fallback = localStorage.getItem('adminTokenPortfolio') || localStorage.getItem('userWalletPortfolio') || '[]';
            return JSON.parse(fallback);
        }

        const normalized = rows.map((token) => ({
            id: token.id || token.symbol || token.name || 'shared-wallet-token',
            name: token.name || token.symbol,
            symbol: String(token.symbol || '').toUpperCase(),
            chain: token.chain || 'BSC',
            balance: Number(token.balance) || 0,
            price: Number(token.price) || 0,
            change: Number(token.change) || 0,
            decimals: Number(token.decimals) || 2,
            volume: '$0',
            marketCap: '$0',
            logo: token.logo || undefined
        }));

        localStorage.setItem('adminTokenPortfolio', JSON.stringify(normalized));
        localStorage.setItem('userWalletPortfolio', JSON.stringify(normalized));
        localStorage.setItem('walletBalanceState', JSON.stringify({ updatedAt: Date.now(), tokens: normalized }));
        return normalized;
    } catch (error) {
        console.warn('Supabase wallet hydrate failed:', error);
        const fallback = localStorage.getItem('adminTokenPortfolio') || localStorage.getItem('userWalletPortfolio') || '[]';
        try {
            return JSON.parse(fallback);
        } catch {
            return [];
        }
    }
}

