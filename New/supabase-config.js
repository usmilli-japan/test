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

