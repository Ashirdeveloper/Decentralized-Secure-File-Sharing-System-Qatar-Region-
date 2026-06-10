const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { saveUser, getUser } = require('../services/storageService');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (getUser(username)) {
        return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
        username,
        passwordHash,
        createdAt: Date.now()
    };

    saveUser(username, newUser);

    // Create token
    const payload = {
        user: {
            id: username // using username as ID for simplicity
        }
    };

    jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
            if (err) throw err;
            res.json({ token, user: { username } });
        }
    );
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = getUser(username);
    if (!user) {
        return res.status(400).json({ msg: 'User does not exist' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
        user: {
            id: username
        }
    };

    jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
            if (err) throw err;
            res.json({ token, user: { username } });
        }
    );
};
