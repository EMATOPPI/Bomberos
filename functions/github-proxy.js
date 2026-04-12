export async function onRequestPost({ request, env }) {
    const { content, filePath, commitMsg } = await request.json();

    if (!content || !filePath || !commitMsg) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = env.GITHUB_TOKEN;
    if (!token) {
        return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
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
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
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
        return new Response(JSON.stringify({ error: err.message || 'Error saving to GitHub' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
