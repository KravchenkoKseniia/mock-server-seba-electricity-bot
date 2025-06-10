import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

const PORT = 8080;

const users: { name: string; email: string; password: string; token: string }[] = [];
const devices: { uuid: string; owner: string }[] = [];
const statusHistory: Record<string, { timestamp: string; status: 'ON' | 'OFF' }[]> = {};

function generateToken(): string {
    return Math.random().toString(36).substring(2);
}

// POST /register
// @ts-ignore
app.post('/register', (req: Request, res: Response): Response => {
    const { name, email, password } = req.body;
    const token = generateToken();
    users.push({ name, email, password, token });
    return res.status(201).json({ token });
});

// POST /login
// @ts-ignore
app.post('/login', (req: Request, res: Response): Response => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(200).json({ token: user.token });
});

// POST /device/register
// @ts-ignore
app.post('/device/register', (req: Request, res: Response): Response => {
    const { uuid, token } = req.body;
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (!devices.find(d => d.uuid === uuid)) {
        devices.push({ uuid, owner: user.email });
        statusHistory[uuid] = [
            { timestamp: new Date().toISOString(), status: 'OFF' }
        ];
    }

    return res.status(200).json({ message: 'Device registered' });
});

// GET /device/status
// @ts-ignore
app.get('/device/status', (req: Request, res: Response): Response => {
    const uuid = req.query.uuid as string;
    const history = statusHistory[uuid];
    if (!history) {
        return res.status(404).json({ error: 'Device not found' });
    }

    const latest = history[history.length - 1];
    return res.status(200).json({
        status: latest.status,
        lastChange: latest.timestamp
    });
});

// GET /device/history
// @ts-ignore
app.get('/device/history', (req: Request, res: Response): Response => {
    const uuid = req.query.uuid as string;
    const history = statusHistory[uuid];
    if (!history) {
        return res.status(404).json({ error: 'Device not found' });
    }

    return res.status(200).json({ history });
});

app.listen(PORT, () => {
    console.log(`Mock server is running at http://localhost:${PORT}`);
});