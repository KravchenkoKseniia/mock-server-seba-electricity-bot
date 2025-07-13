import express, { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import path from 'path';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, 'uploads/') });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = 8080;

interface User {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    password: string;
    token: string;
    avatar?: string;
    timeZone?: string;
}

const users: User[] = [];
const devices: { uuid: string; name?: string, ownerEmail: string }[] = [];
const statusHistory: Record<string, { timestamp: string; status: 'ON' | 'OFF' }[]> = {};

function generateToken(): string {
    return Math.random().toString(36).substring(2);
}

const getTokenFromHeader = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

// USERS

// POST /register
//@ts-ignore
app.post('/register', (req, res) => {
    const { firstName, lastName, email, password, gender } = req.body;

    if (!firstName || !lastName || !email || !password || !gender) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    if (users.find(user => user.email === email)) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser: User = {
        id: uuidv4(),
        firstName,
        lastName,
        email,
        password,
        gender,
        token: generateToken(),
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

// POST /login
// @ts-ignore
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = users.find(u => u.email === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ ...userWithoutPassword, token: user.token });
});

// GET /user/me
// @ts-ignore
app.get('/user/me', (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

// PUT /user/me
// @ts-ignore
app.put('/user/me', (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, gender, timeZone } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (timeZone) user.timeZone = timeZone;

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

// POST /user/avatar
// @ts-ignore
app.post('/user/avatar', upload.single('avatar'), (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    user.avatar = `/uploads/${req.file.filename}`;

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
});

// DELETE /user/avatar
// @ts-ignore

app.delete('/user/avatar', (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = users.find(u => u.token === token);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    delete user.avatar;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// DEVICES

// POST /devices/register
// @ts-ignore
app.post('/devices/register', (req, res) => {
   const {uuid, name} = req.body;
   const token = getTokenFromHeader(req);
   if (!token) {
       return res.status(401).json({ error: 'Unauthorized' });
   }

   const user = users.find(u => u.token === token);

   if (!user) {
       return res.status(404).json({ error: 'User not found' });
   }

   if (!uuid || !name) {
         return res.status(400).json({ error: 'Missing uuid or name' });
   }

   if(!devices.find(device => device.uuid === uuid)) {
       devices.push({ uuid, name, ownerEmail: user.email });

         statusHistory[uuid] = [{
                timestamp: new Date().toISOString(),
                status: 'OFF'
         }];
   }

    return res.status(201).json({ message: 'Successfully registered' });
});

// GET /devices/status
// @ts-ignore
app.get('/devices/status', (req, res) => {
    const uuid = req.query.uuid as string;
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const user = users.find(u => u.token === token);
    if (!user) return res.status(403).json({ error: 'Forbidden' });

    const device = devices.find(d => d.uuid === uuid && d.ownerEmail === user.email);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const hist = statusHistory[uuid];
    if (!hist) return res.status(404).json({ error: 'No history' });

    const last = hist[hist.length - 1];
    return res.status(200).json({
        status: last.status,
        lastChange: last.timestamp
    });
});

//GET /devices
// @ts-ignore
app.get('/devices', (req, res) => {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const user = users.find(u => u.token === token);
    if (!user) return res.status(403).json({ error: 'Forbidden' });

    if (req.query.uuid) {
        const uuid = req.query.uuid as string;
        const device = devices.find(d => d.uuid === uuid && d.ownerEmail === user.email);
        if (!device) return res.status(404).json({ error: 'Device not found' });
        return res.status(200).json({ history: statusHistory[uuid] || [] });
    }

    if (req.query.email) {
        const email = req.query.email as string;
        const list = devices
            .filter(d => d.ownerEmail === email)
            .map(d => {
                const hist = statusHistory[d.uuid] || [];
                const last = hist[hist.length - 1] || { status: 'OFF', timestamp: new Date().toISOString() };
                return {
                    uuid: d.uuid,
                    name: d.name,
                    status: last.status,
                    lastChange: last.timestamp
                };
            });
        return res.status(200).json({ devices: list });
    }

    return res.status(400).json({ error: 'Bad request' });
});

// DELETE /devices/delete
// @ts-ignore
app.delete('/devices/delete', (req, res) => {
    const { uuid } = req.body;
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const user = users.find(u => u.token === token);
    if (!user) return res.status(403).json({ error: 'Forbidden' });

    const idx = devices.findIndex(d => d.uuid === uuid && d.ownerEmail === user.email);
    if (idx === -1) return res.status(404).json({ error: 'Device not found' });

    devices.splice(idx, 1);
    delete statusHistory[uuid];
    return res.status(200).json({});
});

app.listen(PORT, () => {
    console.log(`Mock server is running at http://localhost:${PORT}`);
});