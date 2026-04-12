export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content, filePath, commitMsg } = req.body;

    if (!content || !filePath || !commitMsg) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'GitHub token not configured' });
    }

    const repoOwner = 'EMATOPPI';
    const repoName = 'Bomberos';
    const branch = 'main';
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    let sha = null;
    try {
        const getRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (getRes.ok) {
            sha = (await getRes.json()).sha;
        }
    } catch (e) {}

    const body = {
        message: commitMsg,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        branch: branch
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const err = await putRes.json();
        return res.status(400).json({ error: err.message || 'Error saving to GitHub' });
    }

    return res.status(200).json({ success: true });
}
